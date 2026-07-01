import { firebaseConfig } from "./firebase-config.js?v=20260701-2";
import { createIcons, iconNode } from "./icons.js";

const FIREBASE_VERSION = "10.12.5";
const FIREBASE_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;

const DEFAULT_CATEGORIES = [
  { id: "salario", name: "Salário", kind: "income", color: "#10b981", isDefault: true },
  { id: "investimentos", name: "Investimentos", kind: "income", color: "#8b5cf6", isDefault: true },
  { id: "supermercado", name: "Supermercado", kind: "expense", color: "#f59e0b", isDefault: true },
  { id: "conta-energia", name: "Conta de energia", kind: "expense", color: "#ef4444", isDefault: true },
  { id: "internet", name: "Internet", kind: "expense", color: "#06b6d4", isDefault: true },
  { id: "aluguel", name: "Aluguel", kind: "expense", color: "#64748b", isDefault: true },
  { id: "gasolina", name: "Gasolina", kind: "expense", color: "#a855f7", isDefault: true },
  { id: "conta-agua", name: "Conta de água", kind: "expense", color: "#3b82f6", isDefault: true }
];

const PAYMENT_LABELS = {
  dinheiro: "Dinheiro",
  pix: "Pix",
  debito: "Débito",
  credito: "Crédito"
};

const KIND_LABELS = {
  income: "Ganho",
  expense: "Gasto",
  both: "Ambos"
};

const state = {
  demo: false,
  firebaseReady: false,
  authMode: "login",
  activeView: "dashboard",
  user: null,
  auth: null,
  db: null,
  sdk: null,
  categories: [],
  transactions: [],
  unsubscribers: [],
  transactionSearch: "",
  transactionMonth: currentMonthKey(),
  reportMonth: currentMonthKey()
};

const els = {};
const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
let toastTimer = 0;
let resizeTimer = 0;

captureElements();
bindEvents();
setInitialDates();
boot();

async function boot() {
  if (!isFirebaseConfigured(firebaseConfig)) {
    startDemoMode("Configure o Firebase para ativar contas, sincronização e notificações por email.");
    return;
  }

  try {
    state.sdk = await loadFirebaseSdk();
    const app = state.sdk.initializeApp(firebaseConfig);
    state.auth = state.sdk.getAuth(app);
    state.db = state.sdk.getFirestore(app);
    await state.sdk.setPersistence(state.auth, state.sdk.browserLocalPersistence);
    state.firebaseReady = true;
    state.sdk.onAuthStateChanged(state.auth, handleAuthStateChanged);
  } catch (error) {
    console.error(error);
    startDemoMode("Não foi possível carregar o Firebase. O preview local continua disponível.");
  } finally {
    refreshIcons();
  }
}

async function loadFirebaseSdk() {
  const [app, auth, firestore] = await Promise.all([
    import(`${FIREBASE_BASE}/firebase-app.js`),
    import(`${FIREBASE_BASE}/firebase-auth.js`),
    import(`${FIREBASE_BASE}/firebase-firestore.js`)
  ]);

  return {
    initializeApp: app.initializeApp,
    getAuth: auth.getAuth,
    browserLocalPersistence: auth.browserLocalPersistence,
    setPersistence: auth.setPersistence,
    onAuthStateChanged: auth.onAuthStateChanged,
    createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword,
    signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
    sendEmailVerification: auth.sendEmailVerification,
    signInWithPopup: auth.signInWithPopup,
    linkWithPopup: auth.linkWithPopup,
    GoogleAuthProvider: auth.GoogleAuthProvider,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,
    doc: firestore.doc,
    setDoc: firestore.setDoc,
    addDoc: firestore.addDoc,
    deleteDoc: firestore.deleteDoc,
    collection: firestore.collection,
    writeBatch: firestore.writeBatch,
    serverTimestamp: firestore.serverTimestamp,
    onSnapshot: firestore.onSnapshot,
    query: firestore.query,
    orderBy: firestore.orderBy
  };
}

function captureElements() {
  Object.assign(els, {
    setupBanner: qs("#setup-banner"),
    authScreen: qs("#auth-screen"),
    verifyScreen: qs("#verify-screen"),
    appScreen: qs("#app-screen"),
    loginTab: qs("#login-tab"),
    signupTab: qs("#signup-tab"),
    authForm: qs("#auth-form"),
    authName: qs("#auth-name"),
    authEmail: qs("#auth-email"),
    authPassword: qs("#auth-password"),
    authConfirm: qs("#auth-confirm"),
    authSubmit: qs("#auth-submit"),
    authMessage: qs("#auth-message"),
    nameField: qs("#name-field"),
    confirmField: qs("#confirm-field"),
    googleAuthBtn: qs("#google-auth-btn"),
    verifyEmail: qs("#verify-email"),
    verifyMessage: qs("#verify-message"),
    reloadVerificationBtn: qs("#reload-verification-btn"),
    resendVerificationBtn: qs("#resend-verification-btn"),
    verifySignoutBtn: qs("#verify-signout-btn"),
    welcomeTitle: qs("#welcome-title"),
    userEmail: qs("#user-email"),
    userPhoto: qs("#user-photo"),
    linkGoogleBtn: qs("#link-google-btn"),
    signoutBtn: qs("#signout-btn"),
    navItems: qsa(".nav-item"),
    views: qsa(".view"),
    metricBalance: qs("#metric-balance"),
    metricBalanceNote: qs("#metric-balance-note"),
    metricIncome: qs("#metric-income"),
    metricIncomeNote: qs("#metric-income-note"),
    metricExpense: qs("#metric-expense"),
    metricExpenseNote: qs("#metric-expense-note"),
    metricAverage: qs("#metric-average"),
    cashflowChart: qs("#cashflow-chart"),
    categoryChart: qs("#category-chart"),
    reportChart: qs("#report-chart"),
    categoryExtremes: qs("#category-extremes"),
    incomeTable: qs("#income-table"),
    expenseTable: qs("#expense-table"),
    transactionForm: qs("#transaction-form"),
    transactionDirection: qs("#transaction-direction"),
    transactionPayment: qs("#transaction-payment"),
    transactionCategory: qs("#transaction-category"),
    transactionAmount: qs("#transaction-amount"),
    transactionDate: qs("#transaction-date"),
    transactionDescription: qs("#transaction-description"),
    transactionSearch: qs("#transaction-search"),
    transactionMonth: qs("#transaction-month"),
    transactionsTable: qs("#transactions-table"),
    categoryForm: qs("#category-form"),
    categoryName: qs("#category-name"),
    categoryKind: qs("#category-kind"),
    categoryColor: qs("#category-color"),
    categoryList: qs("#category-list"),
    reportMonth: qs("#report-month"),
    reportCurrent: qs("#report-current"),
    reportCurrentNote: qs("#report-current-note"),
    reportPrevious: qs("#report-previous"),
    reportPreviousNote: qs("#report-previous-note"),
    reportAverage: qs("#report-average"),
    reportAverageNote: qs("#report-average-note"),
    monthlyReport: qs("#monthly-report"),
    categoryComparisonTable: qs("#category-comparison-table"),
    toast: qs("#toast")
  });
}

function bindEvents() {
  els.loginTab.addEventListener("click", () => setAuthMode("login"));
  els.signupTab.addEventListener("click", () => setAuthMode("signup"));
  els.authForm.addEventListener("submit", handleEmailAuth);
  els.googleAuthBtn.addEventListener("click", handleGoogleAuth);
  els.reloadVerificationBtn.addEventListener("click", reloadVerification);
  els.resendVerificationBtn.addEventListener("click", resendVerification);
  els.verifySignoutBtn.addEventListener("click", handleSignOut);
  els.linkGoogleBtn.addEventListener("click", handleGoogleAuth);
  els.signoutBtn.addEventListener("click", handleSignOut);
  els.transactionForm.addEventListener("submit", handleTransactionSubmit);
  els.transactionDirection.addEventListener("change", renderCategoryOptions);
  els.transactionSearch.addEventListener("input", (event) => {
    state.transactionSearch = event.target.value.trim().toLowerCase();
    renderTransactionHistory();
  });
  els.transactionMonth.addEventListener("change", (event) => {
    state.transactionMonth = event.target.value || currentMonthKey();
    renderTransactionHistory();
  });
  els.categoryForm.addEventListener("submit", handleCategorySubmit);
  els.reportMonth.addEventListener("change", (event) => {
    state.reportMonth = event.target.value || currentMonthKey();
    renderReport();
    drawCharts();
  });

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => activateView(item.dataset.view));
  });

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(drawCharts, 120);
  });
}

function setInitialDates() {
  const today = todayKey();
  els.transactionDate.value = today;
  els.transactionMonth.value = state.transactionMonth;
  els.reportMonth.value = state.reportMonth;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  els.loginTab.classList.toggle("active", !isSignup);
  els.signupTab.classList.toggle("active", isSignup);
  els.nameField.classList.toggle("hidden", !isSignup);
  els.confirmField.classList.toggle("hidden", !isSignup);
  els.authPassword.autocomplete = isSignup ? "new-password" : "current-password";
  setButtonContent(els.authSubmit, isSignup ? "user-plus" : "log-in", isSignup ? "Criar conta" : "Entrar com email");
  els.authMessage.textContent = "";
  refreshIcons();
}

async function handleEmailAuth(event) {
  event.preventDefault();
  if (state.demo || !state.firebaseReady) {
    showToast("Configure o Firebase para criar e acessar contas reais.");
    return;
  }

  const email = els.authEmail.value.trim().toLowerCase();
  const password = els.authPassword.value;
  const name = els.authName.value.trim();
  const confirm = els.authConfirm.value;

  if (!isValidEmail(email)) {
    setMessage(els.authMessage, "Informe um email válido.");
    return;
  }

  try {
    setBusy(els.authSubmit, true);
    if (state.authMode === "signup") {
      if (!isStrongPassword(password)) {
        setMessage(els.authMessage, "A senha precisa ter 8 caracteres, uma letra e um número.");
        return;
      }
      if (password !== confirm) {
        setMessage(els.authMessage, "As senhas não conferem.");
        return;
      }

      const credential = await state.sdk.createUserWithEmailAndPassword(state.auth, email, password);
      if (name) {
        await state.sdk.updateProfile(credential.user, { displayName: name.slice(0, 60) });
      }
      await state.sdk.sendEmailVerification(credential.user, verificationOptions());
      showVerifyScreen(credential.user);
      showToast("Conta criada. Confirme o email para continuar.");
      return;
    }

    await state.sdk.signInWithEmailAndPassword(state.auth, email, password);
  } catch (error) {
    setMessage(els.authMessage, authErrorMessage(error));
  } finally {
    setBusy(els.authSubmit, false);
  }
}

async function handleGoogleAuth() {
  if (state.demo || !state.firebaseReady) {
    showToast("Configure o Firebase para conectar uma conta Google real.");
    return;
  }

  try {
    const provider = new state.sdk.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    if (state.user && isVerifiedUser(state.user)) {
      await state.sdk.linkWithPopup(state.user, provider);
      showToast("Conta Google conectada.");
      return;
    }

    await state.sdk.signInWithPopup(state.auth, provider);
  } catch (error) {
    setMessage(els.authMessage, authErrorMessage(error));
    showToast(authErrorMessage(error));
  }
}

async function handleAuthStateChanged(user) {
  cleanupSubscriptions();
  state.user = user;

  if (!user) {
    state.categories = [];
    state.transactions = [];
    showAuthScreen();
    return;
  }

  if (!isVerifiedUser(user)) {
    showVerifyScreen(user);
    return;
  }

  await user.getIdToken(true);
  showAppScreen();
  await ensureUserProfile(user);
  await ensureDefaultCategories(user.uid);
  subscribeToUserData(user.uid);
}

async function reloadVerification() {
  if (!state.auth?.currentUser) return;

  try {
    setBusy(els.reloadVerificationBtn, true);
    await state.auth.currentUser.reload();
    await state.auth.currentUser.getIdToken(true);
    if (isVerifiedUser(state.auth.currentUser)) {
      await handleAuthStateChanged(state.auth.currentUser);
      showToast("Email confirmado.");
    } else {
      setMessage(els.verifyMessage, "A confirmação ainda não apareceu. Aguarde alguns segundos e tente novamente.");
    }
  } catch (error) {
    setMessage(els.verifyMessage, authErrorMessage(error));
  } finally {
    setBusy(els.reloadVerificationBtn, false);
  }
}

async function resendVerification() {
  if (!state.auth?.currentUser) return;

  try {
    setBusy(els.resendVerificationBtn, true);
    await state.sdk.sendEmailVerification(state.auth.currentUser, verificationOptions());
    setMessage(els.verifyMessage, "Email de confirmação reenviado.");
  } catch (error) {
    setMessage(els.verifyMessage, authErrorMessage(error));
  } finally {
    setBusy(els.resendVerificationBtn, false);
  }
}

async function handleSignOut() {
  if (state.demo || !state.auth) {
    showToast("Preview local ativo.");
    return;
  }

  await state.sdk.signOut(state.auth);
}

async function ensureUserProfile(user) {
  const payload = {
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: safePhotoUrl(user.photoURL),
    alertEmailEnabled: true,
    updatedAt: state.sdk.serverTimestamp()
  };

  await state.sdk.setDoc(state.sdk.doc(state.db, "users", user.uid), {
    ...payload,
    createdAt: state.sdk.serverTimestamp()
  }, { merge: true });
}

async function ensureDefaultCategories(uid) {
  const batch = state.sdk.writeBatch(state.db);
  DEFAULT_CATEGORIES.forEach((category) => {
    const ref = state.sdk.doc(state.db, "users", uid, "categories", category.id);
    batch.set(ref, {
      name: category.name,
      kind: category.kind,
      color: category.color,
      isDefault: true,
      updatedAt: state.sdk.serverTimestamp(),
      createdAt: state.sdk.serverTimestamp()
    }, { merge: true });
  });
  await batch.commit();
}

function subscribeToUserData(uid) {
  const categoriesQuery = state.sdk.query(
    state.sdk.collection(state.db, "users", uid, "categories"),
    state.sdk.orderBy("name", "asc")
  );
  const transactionsQuery = state.sdk.query(
    state.sdk.collection(state.db, "users", uid, "transactions"),
    state.sdk.orderBy("date", "desc")
  );

  state.unsubscribers.push(state.sdk.onSnapshot(categoriesQuery, (snapshot) => {
    state.categories = snapshot.docs.map((document) => normalizeCategory(document.id, document.data()));
    renderAll();
  }, (error) => showToast(`Erro ao carregar categorias: ${error.message}`)));

  state.unsubscribers.push(state.sdk.onSnapshot(transactionsQuery, (snapshot) => {
    state.transactions = snapshot.docs.map((document) => normalizeTransaction(document.id, document.data()));
    renderAll();
  }, (error) => showToast(`Erro ao carregar transações: ${error.message}`)));
}

async function handleTransactionSubmit(event) {
  event.preventDefault();
  const direction = els.transactionDirection.value;
  const categoryId = els.transactionCategory.value;
  const category = state.categories.find((item) => item.id === categoryId);
  const amount = Number.parseFloat(String(els.transactionAmount.value).replace(",", "."));
  const date = els.transactionDate.value;
  const paymentType = els.transactionPayment.value;
  const description = els.transactionDescription.value.trim().slice(0, 160);

  if (!["income", "expense"].includes(direction) || !category) {
    showToast("Escolha uma categoria válida.");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
    showToast("Informe um valor maior que zero.");
    return;
  }
  if (!isValidDateKey(date)) {
    showToast("Informe uma data válida.");
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(PAYMENT_LABELS, paymentType)) {
    showToast("Escolha um tipo de pagamento válido.");
    return;
  }

  const payload = {
    direction,
    categoryId,
    categoryName: category.name,
    amount: roundMoney(amount),
    date,
    description,
    paymentType
  };

  if (state.demo) {
    state.transactions.unshift({ id: crypto.randomUUID(), ...payload });
    renderAll();
    event.target.reset();
    setInitialDates();
    showToast("Transferência adicionada no preview local.");
    return;
  }

  try {
    await state.sdk.addDoc(state.sdk.collection(state.db, "users", state.user.uid, "transactions"), {
      ...payload,
      createdAt: state.sdk.serverTimestamp(),
      updatedAt: state.sdk.serverTimestamp()
    });
    event.target.reset();
    setInitialDates();
    showToast("Transferência adicionada.");
  } catch (error) {
    showToast(`Erro ao salvar: ${error.message}`);
  }
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  const name = normalizeTextInput(els.categoryName.value, 40);
  const kind = els.categoryKind.value;
  const color = els.categoryColor.value;

  if (name.length < 2) {
    showToast("Use um nome de categoria com pelo menos 2 caracteres.");
    return;
  }
  if (!["income", "expense", "both"].includes(kind) || !/^#[0-9a-f]{6}$/i.test(color)) {
    showToast("Categoria inválida.");
    return;
  }
  if (state.categories.some((category) => category.name.toLowerCase() === name.toLowerCase())) {
    showToast("Essa categoria já existe.");
    return;
  }

  const payload = { name, kind, color, isDefault: false };

  if (state.demo) {
    state.categories.push({ id: crypto.randomUUID(), ...payload });
    renderAll();
    event.target.reset();
    els.categoryColor.value = "#8b5cf6";
    showToast("Categoria adicionada no preview local.");
    return;
  }

  try {
    await state.sdk.addDoc(state.sdk.collection(state.db, "users", state.user.uid, "categories"), {
      ...payload,
      createdAt: state.sdk.serverTimestamp(),
      updatedAt: state.sdk.serverTimestamp()
    });
    event.target.reset();
    els.categoryColor.value = "#8b5cf6";
    showToast("Categoria criada.");
  } catch (error) {
    showToast(`Erro ao criar categoria: ${error.message}`);
  }
}

async function deleteTransaction(id) {
  if (state.demo) {
    state.transactions = state.transactions.filter((transaction) => transaction.id !== id);
    renderAll();
    showToast("Transação removida do preview.");
    return;
  }

  try {
    await state.sdk.deleteDoc(state.sdk.doc(state.db, "users", state.user.uid, "transactions", id));
    showToast("Transação removida.");
  } catch (error) {
    showToast(`Erro ao remover: ${error.message}`);
  }
}

async function deleteCategory(id) {
  const category = state.categories.find((item) => item.id === id);
  if (!category || category.isDefault) return;

  if (state.transactions.some((transaction) => transaction.categoryId === id)) {
    showToast("Categoria em uso por transações.");
    return;
  }

  if (state.demo) {
    state.categories = state.categories.filter((item) => item.id !== id);
    renderAll();
    showToast("Categoria removida do preview.");
    return;
  }

  try {
    await state.sdk.deleteDoc(state.sdk.doc(state.db, "users", state.user.uid, "categories", id));
    showToast("Categoria removida.");
  } catch (error) {
    showToast(`Erro ao remover categoria: ${error.message}`);
  }
}

function renderAll() {
  renderUser();
  renderCategoryOptions();
  renderDashboard();
  renderTransactionHistory();
  renderCategories();
  renderReport();
  drawCharts();
  refreshIcons();
}

function renderUser() {
  const user = state.user || {};
  const displayName = user.displayName || "CtrlFinance";
  els.welcomeTitle.textContent = `Olá, ${displayName.split(" ")[0]}`;
  els.userEmail.textContent = user.email || "preview@ctrlfinance.app";

  const photoUrl = safePhotoUrl(user.photoURL);
  els.userPhoto.classList.toggle("hidden", !photoUrl);
  if (photoUrl) {
    els.userPhoto.src = photoUrl;
  }
}

function renderCategoryOptions() {
  const direction = els.transactionDirection.value;
  const previousValue = els.transactionCategory.value;
  const available = state.categories
    .filter((category) => category.kind === direction || category.kind === "both")
    .sort(sortCategories);

  replaceChildren(els.transactionCategory);

  if (!available.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Crie uma categoria";
    els.transactionCategory.append(option);
    return;
  }

  available.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    els.transactionCategory.append(option);
  });

  if (available.some((category) => category.id === previousValue)) {
    els.transactionCategory.value = previousValue;
  }
}

function renderDashboard() {
  const month = currentMonthKey();
  const totalIncome = sumTransactions(state.transactions, { direction: "income" });
  const totalExpense = sumTransactions(state.transactions, { direction: "expense" });
  const monthIncome = sumTransactions(state.transactions, { direction: "income", month });
  const monthExpense = sumTransactions(state.transactions, { direction: "expense", month });
  const average = monthlyExpenseAverage(month);

  els.metricBalance.textContent = formatMoney(totalIncome - totalExpense);
  els.metricIncome.textContent = formatMoney(monthIncome);
  els.metricExpense.textContent = formatMoney(monthExpense);
  els.metricAverage.textContent = formatMoney(average);
  els.metricIncomeNote.textContent = monthLabel(month);
  els.metricExpenseNote.textContent = monthLabel(month);
  els.metricBalanceNote.textContent = state.transactions.length ? `${state.transactions.length} lançamentos` : "Sem lançamentos";

  const currentExpenses = state.transactions.filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) === month);
  const currentIncome = state.transactions.filter((transaction) => transaction.direction === "income" && monthFromDate(transaction.date) === month);
  renderTransactionTable(els.incomeTable, currentIncome.slice(0, 8), { empty: "Nenhuma entrada neste mês." });
  renderTransactionTable(els.expenseTable, currentExpenses.slice(0, 8), { empty: "Nenhum gasto neste mês." });
  renderCategoryExtremes(month);
}

function renderCategoryExtremes(month) {
  const totals = categoryExpenseTotals(month).filter((item) => item.total > 0);
  replaceChildren(els.categoryExtremes);

  if (!totals.length) {
    const empty = document.createElement("div");
    empty.className = "insight-pill";
    empty.textContent = "Sem gastos categorizados neste mês.";
    els.categoryExtremes.append(empty);
    return;
  }

  const most = totals[0];
  const least = totals[totals.length - 1];
  els.categoryExtremes.append(
    insightPill("Maior gasto", most.name, most.total),
    insightPill("Menor gasto", least.name, least.total)
  );
}

function renderTransactionHistory() {
  let rows = state.transactions.filter((transaction) => monthFromDate(transaction.date) === state.transactionMonth);
  if (state.transactionSearch) {
    rows = rows.filter((transaction) => {
      const haystack = `${transaction.description} ${transaction.categoryName} ${PAYMENT_LABELS[transaction.paymentType]}`.toLowerCase();
      return haystack.includes(state.transactionSearch);
    });
  }
  renderTransactionTable(els.transactionsTable, rows, {
    empty: "Nenhuma transação encontrada.",
    allowDelete: true
  });
}

function renderCategories() {
  replaceChildren(els.categoryList);
  const sorted = [...state.categories].sort(sortCategories);

  if (!sorted.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "Nenhuma categoria cadastrada.";
    els.categoryList.append(empty);
    return;
  }

  sorted.forEach((category) => {
    const item = document.createElement("article");
    item.className = "category-item";

    const header = document.createElement("header");
    const name = document.createElement("div");
    name.className = "category-name";
    const dot = document.createElement("span");
    dot.className = "color-dot";
    dot.style.backgroundColor = category.color;
    const text = document.createElement("span");
    text.textContent = category.name;
    name.append(dot, text);

    if (category.isDefault) {
      const lock = document.createElement("span");
      lock.className = "category-lock";
      lock.title = "Categoria padrão";
      lock.setAttribute("aria-label", "Categoria padrão");
      const icon = document.createElement("i");
      icon.dataset.lucide = "lock";
      lock.append(icon);
      header.append(name, lock);
    } else {
      const button = document.createElement("button");
      button.className = "table-action";
      button.type = "button";
      button.title = "Remover categoria";
      button.setAttribute("aria-label", "Remover categoria");
      const icon = document.createElement("i");
      icon.dataset.lucide = "trash-2";
      button.append(icon);
      button.addEventListener("click", () => deleteCategory(category.id));
      header.append(name, button);
    }

    const kind = document.createElement("span");
    kind.className = "category-kind";
    kind.textContent = KIND_LABELS[category.kind] || "Categoria";
    item.append(header, kind);
    els.categoryList.append(item);
  });
}

function renderReport() {
  const month = state.reportMonth;
  const previousMonth = addMonths(month, -1);
  const currentExpense = sumTransactions(state.transactions, { direction: "expense", month });
  const previousExpense = sumTransactions(state.transactions, { direction: "expense", month: previousMonth });
  const average = monthlyExpenseAverage(month);
  const diffPrevious = currentExpense - previousExpense;
  const diffAverage = currentExpense - average;

  els.reportCurrent.textContent = formatMoney(currentExpense);
  els.reportPrevious.textContent = formatMoney(previousExpense);
  els.reportAverage.textContent = formatMoney(average);
  els.reportCurrentNote.textContent = monthLabel(month);
  els.reportPreviousNote.textContent = describeDiff(diffPrevious, previousExpense, "vs. mês anterior");
  els.reportAverageNote.textContent = average > 0 ? describeDiff(diffAverage, average, "vs. média") : "Histórico insuficiente";

  replaceChildren(els.monthlyReport);
  const intro = document.createElement("p");
  intro.textContent = `Em ${monthLabel(month)}, os gastos somaram ${formatMoney(currentExpense)}.`;
  const previous = document.createElement("p");
  previous.textContent = previousExpense > 0
    ? `Comparado ao mês anterior, a variação foi de ${formatMoney(Math.abs(diffPrevious))} ${diffPrevious >= 0 ? "acima" : "abaixo"}.`
    : "Ainda não há base no mês anterior para comparação direta.";
  const averageCopy = document.createElement("p");
  averageCopy.textContent = average > 0
    ? `Em relação à média mensal histórica, o mês está ${formatMoney(Math.abs(diffAverage))} ${diffAverage >= 0 ? "acima" : "abaixo"}.`
    : "A média mensal será calculada assim que houver meses anteriores com gastos.";
  els.monthlyReport.append(intro, previous, averageCopy);

  if (currentExpense > average && average > 0) {
    els.monthlyReport.append(statusBadge("Acima da média mensal"));
  }
  if (currentExpense > previousExpense && previousExpense > 0) {
    els.monthlyReport.append(statusBadge("Acima do mês anterior"));
  }

  renderCategoryComparisonTable(month, previousMonth);
}

function renderCategoryComparisonTable(month, previousMonth) {
  const rows = categoryComparison(month, previousMonth);
  renderSimpleTable(els.categoryComparisonTable, {
    columns: ["Categoria", monthLabel(month), monthLabel(previousMonth), "Variação"],
    rows: rows.map((row) => [
      row.name,
      formatMoney(row.current),
      formatMoney(row.previous),
      row.previous > 0 ? `${formatPercent((row.current - row.previous) / row.previous)}`
        : row.current > 0 ? "Novo gasto" : "-"
    ]),
    empty: "Nenhum gasto por categoria no período."
  });
}

function renderTransactionTable(container, transactions, options = {}) {
  replaceChildren(container);

  if (!transactions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = options.empty || "Sem dados.";
    container.append(empty);
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Data", "Categoria", "Descrição", "Tipo", "Valor"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.append(th);
  });
  if (options.allowDelete) {
    const th = document.createElement("th");
    th.textContent = "";
    headerRow.append(th);
  }
  thead.append(headerRow);

  const tbody = document.createElement("tbody");
  transactions.forEach((transaction) => {
    const row = document.createElement("tr");
    appendCell(row, formatDate(transaction.date));
    appendCell(row, transaction.categoryName || "Categoria");
    appendCell(row, transaction.description || "-");
    appendCell(row, PAYMENT_LABELS[transaction.paymentType] || transaction.paymentType);
    const amount = appendCell(row, `${transaction.direction === "income" ? "+" : "-"} ${formatMoney(transaction.amount)}`);
    amount.className = transaction.direction === "income" ? "amount-income" : "amount-expense";

    if (options.allowDelete) {
      const actionCell = document.createElement("td");
      const button = document.createElement("button");
      button.className = "table-action";
      button.type = "button";
      button.title = "Remover transação";
      button.setAttribute("aria-label", "Remover transação");
      const icon = document.createElement("i");
      icon.dataset.lucide = "trash-2";
      button.append(icon);
      button.addEventListener("click", () => deleteTransaction(transaction.id));
      actionCell.append(button);
      row.append(actionCell);
    }

    tbody.append(row);
  });

  table.append(thead, tbody);
  container.append(table);
}

function renderSimpleTable(container, { columns, rows, empty }) {
  replaceChildren(container);
  if (!rows.length) {
    const emptyNode = document.createElement("div");
    emptyNode.className = "empty-state";
    emptyNode.textContent = empty;
    container.append(emptyNode);
    return;
  }

  const table = document.createElement("table");
  table.className = "data-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  columns.forEach((column) => appendHeader(headerRow, column));
  thead.append(headerRow);
  const tbody = document.createElement("tbody");
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    row.forEach((cell) => appendCell(tr, cell));
    tbody.append(tr);
  });
  table.append(thead, tbody);
  container.append(table);
}

function drawCharts() {
  drawCashflowChart();
  drawCategoryChart();
  drawReportChart();
}

function drawCashflowChart() {
  const canvas = els.cashflowChart;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const { width, height } = canvasMetrics(canvas);
  const months = lastMonths(currentMonthKey(), 6);
  const series = months.map((month) => ({
    month,
    income: sumTransactions(state.transactions, { direction: "income", month }),
    expense: sumTransactions(state.transactions, { direction: "expense", month })
  }));
  const maxValue = Math.max(1, ...series.flatMap((item) => [item.income, item.expense]));
  const padding = { top: 18, right: 16, bottom: 42, left: 52 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const groupWidth = chartWidth / series.length;
  const barWidth = Math.min(28, groupWidth * 0.22);

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, padding);

  series.forEach((item, index) => {
    const x = padding.left + index * groupWidth + groupWidth / 2;
    const incomeHeight = (item.income / maxValue) * chartHeight;
    const expenseHeight = (item.expense / maxValue) * chartHeight;
    roundedRect(ctx, x - barWidth - 3, padding.top + chartHeight - incomeHeight, barWidth, incomeHeight, 5, "#10b981");
    roundedRect(ctx, x + 3, padding.top + chartHeight - expenseHeight, barWidth, expenseHeight, 5, "#8b5cf6");
    drawText(ctx, shortMonthLabel(item.month), x, height - 18, "#64748b", "center", 12, 800);
  });

  drawText(ctx, "Entradas", padding.left, 18, "#10b981", "left", 12, 900);
  drawText(ctx, "Gastos", padding.left + 78, 18, "#8b5cf6", "left", 12, 900);
}

function drawCategoryChart() {
  const canvas = els.categoryChart;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const { width, height } = canvasMetrics(canvas);
  const totals = categoryExpenseTotals(currentMonthKey()).filter((item) => item.total > 0).slice(0, 6);
  ctx.clearRect(0, 0, width, height);

  if (!totals.length) {
    drawText(ctx, "Sem gastos no mês", width / 2, height / 2, "#64748b", "center", 14, 800);
    return;
  }

  const total = totals.reduce((sum, item) => sum + item.total, 0);
  const radius = Math.min(width, height) * 0.28;
  const centerX = width * 0.36;
  const centerY = height * 0.48;
  let start = -Math.PI / 2;

  totals.forEach((item) => {
    const angle = (item.total / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.fill();
    start += angle;
  });

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = "#f8fafc";
  ctx.fill();
  drawText(ctx, formatMoney(total), centerX, centerY + 4, "#17151f", "center", 14, 950);

  const legendX = width * 0.68;
  totals.forEach((item, index) => {
    const y = 32 + index * 28;
    roundedRect(ctx, legendX, y - 9, 12, 12, 3, item.color);
    drawText(ctx, truncate(item.name, 16), legendX + 20, y, "#17151f", "left", 12, 850);
  });
}

function drawReportChart() {
  const canvas = els.reportChart;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;

  const { width, height } = canvasMetrics(canvas);
  const rows = categoryComparison(state.reportMonth, addMonths(state.reportMonth, -1)).slice(0, 7);
  ctx.clearRect(0, 0, width, height);

  if (!rows.length) {
    drawText(ctx, "Sem dados para comparar", width / 2, height / 2, "#64748b", "center", 14, 800);
    return;
  }

  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.current, row.previous]));
  const padding = { top: 24, right: 22, bottom: 26, left: 138 };
  const rowHeight = (height - padding.top - padding.bottom) / rows.length;
  drawText(ctx, monthLabel(state.reportMonth), padding.left, 16, "#8b5cf6", "left", 12, 900);
  drawText(ctx, monthLabel(addMonths(state.reportMonth, -1)), padding.left + 120, 16, "#94a3b8", "left", 12, 900);

  rows.forEach((row, index) => {
    const y = padding.top + index * rowHeight + rowHeight * 0.32;
    const maxBar = width - padding.left - padding.right;
    const currentWidth = (row.current / maxValue) * maxBar;
    const previousWidth = (row.previous / maxValue) * maxBar;
    drawText(ctx, truncate(row.name, 17), 14, y + 12, "#475569", "left", 12, 850);
    roundedRect(ctx, padding.left, y, previousWidth, 8, 4, "#cbd5e1");
    roundedRect(ctx, padding.left, y + 13, currentWidth, 8, 4, row.color);
  });
}

function showAuthScreen() {
  els.setupBanner.classList.toggle("hidden", !state.demo);
  els.authScreen.classList.remove("hidden");
  els.verifyScreen.classList.add("hidden");
  els.appScreen.classList.add("hidden");
  refreshIcons();
}

function showVerifyScreen(user) {
  els.verifyEmail.textContent = user?.email || "seu email";
  els.authScreen.classList.add("hidden");
  els.verifyScreen.classList.remove("hidden");
  els.appScreen.classList.add("hidden");
  refreshIcons();
}

function showAppScreen() {
  els.setupBanner.classList.toggle("hidden", !state.demo);
  els.authScreen.classList.add("hidden");
  els.verifyScreen.classList.add("hidden");
  els.appScreen.classList.remove("hidden");
  renderAll();
}

function startDemoMode(message) {
  state.demo = true;
  state.user = {
    uid: "preview",
    displayName: "CtrlFinance",
    email: "preview@ctrlfinance.app",
    emailVerified: true,
    providerData: [],
    photoURL: ""
  };
  state.categories = DEFAULT_CATEGORIES.map((category) => ({ ...category }));
  state.transactions = createDemoTransactions();
  showAppScreen();
  setMessage(els.authMessage, message);
  showToast(message);
}

function activateView(view) {
  state.activeView = view;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  els.views.forEach((item) => item.classList.toggle("active", item.id === `${view}-view`));
  drawCharts();
}

function cleanupSubscriptions() {
  state.unsubscribers.forEach((unsubscribe) => unsubscribe());
  state.unsubscribers = [];
}

function categoryExpenseTotals(month) {
  const totals = new Map();
  state.transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) === month)
    .forEach((transaction) => {
      const category = state.categories.find((item) => item.id === transaction.categoryId);
      const current = totals.get(transaction.categoryId) || {
        id: transaction.categoryId,
        name: transaction.categoryName || category?.name || "Categoria",
        color: category?.color || "#8b5cf6",
        total: 0
      };
      current.total += transaction.amount;
      totals.set(transaction.categoryId, current);
    });

  return [...totals.values()].sort((a, b) => b.total - a.total);
}

function categoryComparison(month, previousMonth) {
  const current = new Map(categoryExpenseTotals(month).map((item) => [item.id, item]));
  const previous = new Map(categoryExpenseTotals(previousMonth).map((item) => [item.id, item]));
  const ids = new Set([...current.keys(), ...previous.keys()]);
  return [...ids].map((id) => {
    const currentItem = current.get(id);
    const previousItem = previous.get(id);
    const category = state.categories.find((item) => item.id === id);
    return {
      id,
      name: currentItem?.name || previousItem?.name || category?.name || "Categoria",
      color: currentItem?.color || previousItem?.color || category?.color || "#8b5cf6",
      current: currentItem?.total || 0,
      previous: previousItem?.total || 0
    };
  }).sort((a, b) => b.current - a.current || b.previous - a.previous);
}

function monthlyExpenseAverage(beforeMonth) {
  const monthly = new Map();
  state.transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) < beforeMonth)
    .forEach((transaction) => {
      const month = monthFromDate(transaction.date);
      monthly.set(month, (monthly.get(month) || 0) + transaction.amount);
    });
  if (!monthly.size) return 0;
  return [...monthly.values()].reduce((sum, value) => sum + value, 0) / monthly.size;
}

function sumTransactions(transactions, filters = {}) {
  return transactions
    .filter((transaction) => {
      if (filters.direction && transaction.direction !== filters.direction) return false;
      if (filters.month && monthFromDate(transaction.date) !== filters.month) return false;
      return true;
    })
    .reduce((sum, transaction) => sum + transaction.amount, 0);
}

function createDemoTransactions() {
  const thisMonth = currentMonthKey();
  const previousMonth = addMonths(thisMonth, -1);
  const twoMonths = addMonths(thisMonth, -2);
  const threeMonths = addMonths(thisMonth, -3);
  const sample = [
    ["income", "salario", 8400, `${thisMonth}-05`, "Salário mensal", "pix"],
    ["income", "investimentos", 620, `${thisMonth}-12`, "Rendimento de carteira", "pix"],
    ["expense", "supermercado", 920, `${thisMonth}-08`, "Compra do mês", "debito"],
    ["expense", "aluguel", 2400, `${thisMonth}-10`, "Aluguel", "pix"],
    ["expense", "internet", 129.9, `${thisMonth}-14`, "Plano fibra", "credito"],
    ["expense", "gasolina", 360, `${thisMonth}-17`, "Abastecimento", "credito"],
    ["expense", "conta-energia", 310, `${thisMonth}-20`, "Energia", "debito"],
    ["income", "salario", 8400, `${previousMonth}-05`, "Salário mensal", "pix"],
    ["expense", "supermercado", 820, `${previousMonth}-08`, "Mercado", "debito"],
    ["expense", "aluguel", 2400, `${previousMonth}-10`, "Aluguel", "pix"],
    ["expense", "gasolina", 280, `${previousMonth}-18`, "Abastecimento", "credito"],
    ["income", "salario", 8200, `${twoMonths}-05`, "Salário mensal", "pix"],
    ["expense", "supermercado", 760, `${twoMonths}-08`, "Mercado", "debito"],
    ["expense", "aluguel", 2400, `${twoMonths}-10`, "Aluguel", "pix"],
    ["expense", "conta-agua", 118, `${twoMonths}-21`, "Conta de água", "debito"],
    ["income", "salario", 8200, `${threeMonths}-05`, "Salário mensal", "pix"],
    ["expense", "supermercado", 700, `${threeMonths}-08`, "Mercado", "debito"],
    ["expense", "aluguel", 2350, `${threeMonths}-10`, "Aluguel", "pix"]
  ];

  return sample.map(([direction, categoryId, amount, date, description, paymentType], index) => {
    const category = DEFAULT_CATEGORIES.find((item) => item.id === categoryId);
    return {
      id: `demo-${index}`,
      direction,
      categoryId,
      categoryName: category?.name || "Categoria",
      amount,
      date,
      description,
      paymentType
    };
  }).sort((a, b) => b.date.localeCompare(a.date));
}

function normalizeCategory(id, data) {
  return {
    id,
    name: normalizeTextInput(data.name || "Categoria", 40),
    kind: ["income", "expense", "both"].includes(data.kind) ? data.kind : "expense",
    color: /^#[0-9a-f]{6}$/i.test(data.color) ? data.color : "#8b5cf6",
    isDefault: data.isDefault === true
  };
}

function normalizeTransaction(id, data) {
  return {
    id,
    direction: data.direction === "income" ? "income" : "expense",
    categoryId: String(data.categoryId || ""),
    categoryName: normalizeTextInput(data.categoryName || "Categoria", 60),
    amount: Number.isFinite(data.amount) ? data.amount : 0,
    date: isValidDateKey(data.date) ? data.date : todayKey(),
    description: normalizeTextInput(data.description || "", 160),
    paymentType: Object.prototype.hasOwnProperty.call(PAYMENT_LABELS, data.paymentType) ? data.paymentType : "pix"
  };
}

function setupCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  return ctx;
}

function canvasMetrics(canvas) {
  const rect = canvas.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function drawGrid(ctx, width, height, padding) {
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 1;
  const chartHeight = height - padding.top - padding.bottom;
  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
  }
}

function roundedRect(ctx, x, y, width, height, radius, color) {
  const safeHeight = Math.max(0, height);
  const safeWidth = Math.max(0, width);
  if (!safeHeight || !safeWidth) return;
  const safeRadius = Math.min(radius, safeHeight / 2, safeWidth / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + safeWidth - safeRadius, y);
  ctx.quadraticCurveTo(x + safeWidth, y, x + safeWidth, y + safeRadius);
  ctx.lineTo(x + safeWidth, y + safeHeight - safeRadius);
  ctx.quadraticCurveTo(x + safeWidth, y + safeHeight, x + safeWidth - safeRadius, y + safeHeight);
  ctx.lineTo(x + safeRadius, y + safeHeight);
  ctx.quadraticCurveTo(x, y + safeHeight, x, y + safeHeight - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawText(ctx, text, x, y, color, align = "left", size = 12, weight = 700) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.font = `${weight} ${size}px Inter, system-ui, sans-serif`;
  ctx.fillText(text, x, y);
}

function insightPill(label, name, amount) {
  const pill = document.createElement("div");
  pill.className = "insight-pill";
  const left = document.createElement("span");
  left.textContent = label;
  const right = document.createElement("small");
  right.textContent = `${name} · ${formatMoney(amount)}`;
  pill.append(left, right);
  return pill;
}

function statusBadge(text) {
  const badge = document.createElement("span");
  badge.className = "badge";
  const icon = document.createElement("i");
  icon.dataset.lucide = "bell";
  const label = document.createElement("span");
  label.textContent = text;
  badge.append(icon, label);
  return badge;
}

function appendHeader(row, text) {
  const th = document.createElement("th");
  th.textContent = text;
  row.append(th);
  return th;
}

function appendCell(row, text) {
  const td = document.createElement("td");
  td.textContent = text;
  row.append(td);
  return td;
}

function setBusy(button, busy) {
  button.disabled = busy;
}

function setButtonContent(button, iconName, label) {
  const text = document.createElement("span");
  text.textContent = label;
  button.replaceChildren(iconNode(iconName), text);
}

function setMessage(node, message) {
  node.textContent = message || "";
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  toastTimer = window.setTimeout(() => els.toast.classList.add("hidden"), 4200);
}

function refreshIcons() {
  createIcons(document);
}

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function qsa(selector, root = document) {
  return [...root.querySelectorAll(selector)];
}

function replaceChildren(node, ...children) {
  node.replaceChildren(...children);
}

function isFirebaseConfigured(config) {
  const required = ["apiKey", "authDomain", "projectId", "appId"];
  return required.every((key) => {
    const value = String(config?.[key] || "");
    return value && !value.includes("SUA_") && !value.includes("SEU_") && !/^0+$/.test(value.replace(/\D/g, ""));
  });
}

function isVerifiedUser(user) {
  return user?.emailVerified || user?.providerData?.some((provider) => provider.providerId === "google.com");
}

function verificationOptions() {
  return {
    url: `${window.location.origin}${window.location.pathname}`,
    handleCodeInApp: false
  };
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isStrongPassword(password) {
  return typeof password === "string" && password.length >= 8 && /[A-Za-zÀ-ÿ]/.test(password) && /\d/.test(password);
}

function isValidDateKey(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function normalizeTextInput(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function safePhotoUrl(value) {
  const url = String(value || "");
  return url.startsWith("https://") ? url : "";
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function todayKey(date = new Date()) {
  return `${currentMonthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthFromDate(dateKey) {
  return String(dateKey || "").slice(0, 7);
}

function addMonths(monthKey, amount) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function lastMonths(monthKey, count) {
  return Array.from({ length: count }, (_, index) => addMonths(monthKey, index - count + 1));
}

function monthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const label = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function shortMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, 1)))
    .replace(".", "");
}

function formatDate(dateKey) {
  return dateFormatter.format(new Date(`${dateKey}T00:00:00.000Z`));
}

function formatMoney(value) {
  return moneyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatPercent(value) {
  const percent = new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: "exceptZero"
  });
  return percent.format(value);
}

function describeDiff(diff, base, label) {
  if (!base) return "Sem base";
  return `${formatPercent(diff / base)} ${label}`;
}

function truncate(value, length) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function sortCategories(a, b) {
  if (a.isDefault !== b.isDefault) return a.isDefault ? -1 : 1;
  return a.name.localeCompare(b.name, "pt-BR");
}

function authErrorMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "Esse email já está cadastrado.",
    "auth/invalid-email": "Email inválido.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes da conclusão.",
    "auth/provider-already-linked": "Essa conta Google já está conectada.",
    "auth/credential-already-in-use": "Essa conta Google já está vinculada a outro usuário.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "auth/weak-password": "A senha precisa ser mais forte."
  };
  return messages[code] || "Não foi possível concluir a ação. Tente novamente.";
}
