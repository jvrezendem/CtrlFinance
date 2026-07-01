"use strict";

const { setGlobalOptions } = require("firebase-functions/v2");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret, defineString } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const sgMail = require("@sendgrid/mail");

admin.initializeApp();
setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");
const SENDER_EMAIL = defineString("SENDER_EMAIL", { default: "no-reply@ctrlfinance.app" });
const APP_URL = defineString("APP_URL", { default: "https://example.github.io/ctrlfinance/" });
const TIME_ZONE = "America/Sao_Paulo";

const db = admin.firestore();

exports.evaluateSpendingAlerts = onDocumentWritten(
  {
    document: "users/{uid}/transactions/{transactionId}",
    secrets: [SENDGRID_API_KEY]
  },
  async (event) => {
    const currentMonth = currentMonthKey();
    const monthsToEvaluate = new Set();
    const beforeData = event.data?.before?.exists ? event.data.before.data() : null;
    const afterData = event.data?.after?.exists ? event.data.after.data() : null;

    [beforeData, afterData].forEach((data) => {
      const month = monthFromDate(data?.date);
      if (month === currentMonth) monthsToEvaluate.add(month);
    });

    await Promise.all([...monthsToEvaluate].map((month) => evaluateUserMonth(event.params.uid, month)));
  }
);

exports.dailySpendingAlertSweep = onSchedule(
  {
    schedule: "0 8 * * *",
    timeZone: TIME_ZONE,
    secrets: [SENDGRID_API_KEY]
  },
  async () => {
    const month = currentMonthKey();
    const users = await db.collection("users").get();
    const results = await Promise.allSettled(users.docs.map((userDoc) => evaluateUserMonth(userDoc.id, month)));
    const rejected = results.filter((result) => result.status === "rejected");
    if (rejected.length) {
      logger.warn("Some CtrlFinance alert evaluations failed", { failures: rejected.length });
    }
  }
);

async function evaluateUserMonth(uid, monthKey) {
  const userRef = db.collection("users").doc(uid);
  const [profileSnapshot, authUser] = await Promise.all([
    userRef.get(),
    admin.auth().getUser(uid).catch((error) => {
      logger.warn("Unable to load auth user", { uid, code: error.code });
      return null;
    })
  ]);

  const profile = profileSnapshot.exists ? profileSnapshot.data() : {};
  if (profile.alertEmailEnabled === false) return;
  if (!authUser?.email || authUser.emailVerified !== true) return;

  const transactionsSnapshot = await userRef.collection("transactions").get();
  const transactions = transactionsSnapshot.docs.map((doc) => normalizeTransaction(doc.data()));
  const currentExpense = sumExpenses(transactions, monthKey);
  if (currentExpense <= 0) return;

  const previousMonth = addMonths(monthKey, -1);
  const previousExpense = sumExpenses(transactions, previousMonth);
  const monthlyAverage = monthlyExpenseAverage(transactions, monthKey);
  const alerts = [];

  if (monthlyAverage > 0 && currentExpense > monthlyAverage) {
    alerts.push({
      key: `${monthKey}:monthly-average`,
      title: "Gastos acima da média mensal",
      body: `Os gastos de ${monthLabel(monthKey)} chegaram a ${formatMoney(currentExpense)}, acima da média de ${formatMoney(monthlyAverage)}.`
    });
  }

  if (previousExpense > 0 && currentExpense > previousExpense) {
    alerts.push({
      key: `${monthKey}:previous-month`,
      title: "Gastos acima do mês anterior",
      body: `Os gastos de ${monthLabel(monthKey)} superaram ${monthLabel(previousMonth)} em ${formatMoney(currentExpense - previousExpense)}.`
    });
  }

  const categoryAlerts = categoryThresholdAlerts(transactions, monthKey, previousMonth);
  alerts.push(...categoryAlerts);
  if (!alerts.length) return;

  const alertRef = userRef.collection("alerts").doc(monthKey);
  const alertSnapshot = await alertRef.get();
  const sentKeys = new Set(alertSnapshot.exists ? alertSnapshot.data().sentKeys || [] : []);
  const pendingAlerts = alerts.filter((alert) => !sentKeys.has(alert.key));
  if (!pendingAlerts.length) return;

  await sendAlertEmail({
    to: authUser.email,
    displayName: profile.displayName || authUser.displayName || "CtrlFinance",
    monthKey,
    alerts: pendingAlerts
  });

  await alertRef.set({
    sentKeys: admin.firestore.FieldValue.arrayUnion(...pendingAlerts.map((alert) => alert.key)),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    month: monthKey,
    totalExpense: currentExpense
  }, { merge: true });
}

async function sendAlertEmail({ to, displayName, monthKey, alerts }) {
  const apiKey = SENDGRID_API_KEY.value();
  if (!apiKey) {
    logger.warn("SENDGRID_API_KEY is not configured; skipping alert email");
    return;
  }

  sgMail.setApiKey(apiKey);
  const escapedName = escapeHtml(displayName);
  const items = alerts.map((alert) => `<li><strong>${escapeHtml(alert.title)}:</strong> ${escapeHtml(alert.body)}</li>`).join("");
  const text = alerts.map((alert) => `- ${alert.title}: ${alert.body}`).join("\n");

  await sgMail.send({
    to,
    from: SENDER_EMAIL.value(),
    subject: `CtrlFinance: alerta de gastos em ${monthLabel(monthKey)}`,
    text: `Olá, ${displayName}.\n\n${text}\n\nAcesse: ${APP_URL.value()}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#17151f">
        <h2 style="margin:0 0 12px;color:#7c3aed">CtrlFinance</h2>
        <p>Olá, ${escapedName}.</p>
        <p>Encontramos novos alertas financeiros para ${escapeHtml(monthLabel(monthKey))}:</p>
        <ul>${items}</ul>
        <p><a href="${escapeAttribute(APP_URL.value())}" style="color:#7c3aed;font-weight:700">Abrir dashboard</a></p>
      </div>
    `
  });
}

function categoryThresholdAlerts(transactions, monthKey, previousMonth) {
  const current = categoryTotals(transactions, monthKey);
  const previous = categoryTotals(transactions, previousMonth);
  const alerts = [];

  current.forEach((currentItem, categoryId) => {
    const previousItem = previous.get(categoryId);
    if (!previousItem || previousItem.total <= 0 || currentItem.total <= previousItem.total) return;
    alerts.push({
      key: `${monthKey}:category:${categoryId}`,
      title: `Categoria acima do mês anterior: ${currentItem.name}`,
      body: `${currentItem.name} chegou a ${formatMoney(currentItem.total)}, acima dos ${formatMoney(previousItem.total)} do mês anterior.`
    });
  });

  return alerts;
}

function categoryTotals(transactions, monthKey) {
  const totals = new Map();
  transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) === monthKey)
    .forEach((transaction) => {
      const current = totals.get(transaction.categoryId) || {
        id: transaction.categoryId,
        name: transaction.categoryName || "Categoria",
        total: 0
      };
      current.total += transaction.amount;
      totals.set(transaction.categoryId, current);
    });
  return totals;
}

function monthlyExpenseAverage(transactions, beforeMonth) {
  const monthly = new Map();
  transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) < beforeMonth)
    .forEach((transaction) => {
      const month = monthFromDate(transaction.date);
      monthly.set(month, (monthly.get(month) || 0) + transaction.amount);
    });

  if (!monthly.size) return 0;
  return [...monthly.values()].reduce((sum, value) => sum + value, 0) / monthly.size;
}

function sumExpenses(transactions, monthKey) {
  return transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) === monthKey)
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function normalizeTransaction(data) {
  return {
    direction: data.direction === "income" ? "income" : "expense",
    categoryId: String(data.categoryId || ""),
    categoryName: String(data.categoryName || "Categoria").slice(0, 60),
    amount: Number.isFinite(data.amount) ? data.amount : 0,
    date: /^\d{4}-\d{2}-\d{2}$/.test(data.date) ? data.date : "",
    paymentType: String(data.paymentType || "pix")
  };
}

function monthFromDate(dateKey) {
  return String(dateKey || "").slice(0, 7);
}

function currentMonthKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year").value;
  const month = parts.find((part) => part.type === "month").value;
  return `${year}-${month}`;
}

function addMonths(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function formatMoney(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(Number.isFinite(value) ? value : 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#96;");
}
