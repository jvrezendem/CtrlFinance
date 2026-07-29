import { firebaseConfig } from "./firebase-config.js?v=20260701-3";
import { createIcons, iconNode } from "./icons.js?v=20260729-1";

const FIREBASE_VERSION = "10.12.5";
const FIREBASE_BASE = `https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}`;
const THEME_STORAGE_KEY = "ctrlfinance-theme";
const PRIVACY_STORAGE_KEY = "ctrlfinance-hide-values";
const VALID_VIEWS = new Set(["dashboard", "transactions", "categories", "report", "profile"]);

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

const VIEW_META = {
  dashboard: { context: "Visão geral", title: "Dashboard" },
  transactions: { context: "Histórico financeiro", title: "Transações" },
  categories: { context: "Organização", title: "Categorias" },
  report: { context: "Análise mensal", title: "Relatórios" },
  profile: { context: "Sua conta", title: "Perfil" }
};

const CATEGORY_ICONS = {
  salario: "banknote",
  investimentos: "trending-up",
  supermercado: "shopping-cart",
  "conta-energia": "zap",
  internet: "wifi",
  aluguel: "home",
  gasolina: "fuel",
  "conta-agua": "droplets"
};

const state = {
  demo: false,
  firebaseReady: false,
  authMode: "login",
  activeView: viewFromHash(),
  user: null,
  profile: {},
  auth: null,
  db: null,
  functions: null,
  sdk: null,
  categories: [],
  transactions: [],
  unsubscribers: [],
  loadedCollections: new Set(),
  loadingData: false,
  transactionSearch: "",
  transactionMonth: currentMonthKey(),
  transactionDirectionFilter: "all",
  transactionCategoryFilter: "all",
  transactionPaymentFilter: "all",
  dashboardMonth: currentMonthKey(),
  reportMonth: currentMonthKey(),
  valuesHidden: readBooleanStorage(PRIVACY_STORAGE_KEY),
  themePreference: document.documentElement.dataset.themePreference || "system",
  chartMonths: 6,
  hiddenChartSeries: new Set(),
  cashflowHitboxes: [],
  categorySlices: [],
  selectedCategoryId: null,
  editingCategoryId: null,
  selectedTransactionId: null,
  confirmResolver: null,
  bootComplete: false
};

const els = {};
const moneyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const dialogTriggers = new WeakMap();

let toastTimer = 0;
let resizeTimer = 0;
let chartAnimationFrame = 0;
let activeToastAction = null;

captureElements();
bindEvents();
setInitialDates();
syncThemeControls();
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
    state.functions = state.sdk.getFunctions(app, "southamerica-east1");
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
  const [app, auth, firestore, functions] = await Promise.all([
    import(`${FIREBASE_BASE}/firebase-app.js`),
    import(`${FIREBASE_BASE}/firebase-auth.js`),
    import(`${FIREBASE_BASE}/firebase-firestore.js`),
    import(`${FIREBASE_BASE}/firebase-functions.js`)
  ]);

  return {
    initializeApp: app.initializeApp,
    getAuth: auth.getAuth,
    getFirestore: firestore.getFirestore,
    getFunctions: functions.getFunctions,
    httpsCallable: functions.httpsCallable,
    browserLocalPersistence: auth.browserLocalPersistence,
    setPersistence: auth.setPersistence,
    onAuthStateChanged: auth.onAuthStateChanged,
    createUserWithEmailAndPassword: auth.createUserWithEmailAndPassword,
    signInWithEmailAndPassword: auth.signInWithEmailAndPassword,
    sendEmailVerification: auth.sendEmailVerification,
    signInWithPopup: auth.signInWithPopup,
    linkWithPopup: auth.linkWithPopup,
    reauthenticateWithPopup: auth.reauthenticateWithPopup,
    reauthenticateWithCredential: auth.reauthenticateWithCredential,
    EmailAuthProvider: auth.EmailAuthProvider,
    GoogleAuthProvider: auth.GoogleAuthProvider,
    signOut: auth.signOut,
    updateProfile: auth.updateProfile,
    doc: firestore.doc,
    getDoc: firestore.getDoc,
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
    splashScreen: qs("#splash-screen"),
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
    welcomeContext: qs("#welcome-context"),
    welcomeTitle: qs("#welcome-title"),
    userEmail: qs("#user-email"),
    userPhoto: qs("#user-photo"),
    userInitials: qs("#user-initials"),
    profileShortcut: qs("#profile-shortcut"),
    dashboardPeriodControl: qs("#dashboard-period-control"),
    dashboardMonth: qs("#dashboard-month"),
    privacyToggle: qs("#privacy-toggle"),
    linkGoogleBtn: qs("#link-google-btn"),
    signoutBtn: qs("#signout-btn"),
    navItems: qsa(".nav-item"),
    viewLinks: qsa("[data-view-link]"),
    views: qsa(".view"),
    metricBalance: qs("#metric-balance"),
    metricBalanceNote: qs("#metric-balance-note"),
    metricIncome: qs("#metric-income"),
    metricIncomeNote: qs("#metric-income-note"),
    metricExpense: qs("#metric-expense"),
    metricExpenseNote: qs("#metric-expense-note"),
    metricAverage: qs("#metric-average"),
    cashflowChart: qs("#cashflow-chart"),
    cashflowTooltip: qs("#cashflow-tooltip"),
    cashflowSummary: qs("#cashflow-summary"),
    categoryChart: qs("#category-chart"),
    categoryLegend: qs("#category-legend"),
    categorySelection: qs("#category-selection"),
    reportChart: qs("#report-chart"),
    categoryExtremes: qs("#category-extremes"),
    incomeTable: qs("#income-table"),
    expenseTable: qs("#expense-table"),
    openTransactionDialogBtn: qs("#open-transaction-dialog"),
    transactionDialog: qs("#transaction-dialog"),
    transactionForm: qs("#transaction-form"),
    transactionDirection: qs("#transaction-direction"),
    transactionPayment: qs("#transaction-payment"),
    transactionCategory: qs("#transaction-category"),
    transactionAmount: qs("#transaction-amount"),
    transactionAmountError: qs("#transaction-amount-error"),
    transactionDate: qs("#transaction-date"),
    transactionDescription: qs("#transaction-description"),
    transactionFormMessage: qs("#transaction-form-message"),
    transactionSubmitBtn: qs("#transaction-submit-btn"),
    transactionSearch: qs("#transaction-search"),
    transactionMonth: qs("#transaction-month"),
    transactionDirectionFilter: qs("#transaction-direction-filter"),
    transactionCategoryFilter: qs("#transaction-category-filter"),
    transactionPaymentFilter: qs("#transaction-payment-filter"),
    transactionFilterToggle: qs("#transaction-filter-toggle"),
    transactionFilters: qs("#transaction-filters"),
    transactionResultCount: qs("#transaction-result-count"),
    transactionsTable: qs("#transactions-table"),
    transactionDetailDialog: qs("#transaction-detail-dialog"),
    transactionDetailContent: qs("#transaction-detail-content"),
    openCategoryDialogBtn: qs("#open-category-dialog"),
    categoryDialog: qs("#category-dialog"),
    categoryDialogTitle: qs("#category-dialog-title"),
    categoryForm: qs("#category-form"),
    categoryName: qs("#category-name"),
    categoryKind: qs("#category-kind"),
    categoryColor: qs("#category-color"),
    categoryColorValue: qs("#category-color-value"),
    categoryFormMessage: qs("#category-form-message"),
    categorySubmitBtn: qs("#category-submit-btn"),
    categoryStats: qs("#category-stats"),
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
    profileForm: qs("#profile-form"),
    profileName: qs("#profile-name"),
    profileEmail: qs("#profile-email"),
    profilePhotoUrl: qs("#profile-photo-url"),
    profileAlertEmail: qs("#profile-alert-email"),
    profileMessage: qs("#profile-message"),
    profileSaveBtn: qs("#profile-save-btn"),
    profileAvatarImage: qs("#profile-avatar-image"),
    profileAvatarInitials: qs("#profile-avatar-initials"),
    profileDisplayName: qs("#profile-display-name"),
    themeOptions: qsa('input[name="theme"]'),
    openDeleteAccountDialogBtn: qs("#open-delete-account-dialog"),
    deleteAccountDialog: qs("#delete-account-dialog"),
    deleteStepOne: qs("#delete-account-step-one"),
    deleteStepTwo: qs("#delete-account-step-two"),
    deleteConfirmText: qs("#delete-confirm-text"),
    deleteContinueBtn: qs("#delete-account-continue-btn"),
    deletePasswordField: qs("#delete-password-field"),
    deletePassword: qs("#delete-account-password"),
    deleteBackBtn: qs("#delete-account-back-btn"),
    deleteSubmitBtn: qs("#delete-account-submit-btn"),
    deleteMessage: qs("#delete-account-message"),
    confirmDialog: qs("#confirm-dialog"),
    confirmIcon: qs("#confirm-icon"),
    confirmTitle: qs("#confirm-title"),
    confirmMessage: qs("#confirm-message"),
    confirmCancelBtn: qs("#confirm-cancel-btn"),
    confirmActionBtn: qs("#confirm-action-btn"),
    toast: qs("#toast"),
    toastMessage: qs("#toast-message"),
    toastAction: qs("#toast-action"),
    toastClose: qs("#toast-close")
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

  els.navItems.forEach((item) => {
    item.addEventListener("click", () => activateView(item.dataset.view));
  });
  els.viewLinks.forEach((item) => {
    item.addEventListener("click", () => activateView(item.dataset.viewLink));
  });

  els.dashboardMonth.addEventListener("change", (event) => {
    state.dashboardMonth = event.target.value || currentMonthKey();
    renderDashboard();
    animateCharts();
  });
  els.privacyToggle.addEventListener("click", toggleFinancialPrivacy);
  qsa("[data-chart-months]").forEach((button) => {
    button.addEventListener("click", () => {
      state.chartMonths = Number(button.dataset.chartMonths) === 12 ? 12 : 6;
      qsa("[data-chart-months]").forEach((item) => item.classList.toggle("active", item === button));
      animateCharts();
    });
  });
  qsa("[data-chart-series]").forEach((button) => {
    button.addEventListener("click", () => {
      const series = button.dataset.chartSeries;
      if (state.hiddenChartSeries.has(series)) {
        state.hiddenChartSeries.delete(series);
      } else {
        state.hiddenChartSeries.add(series);
      }
      button.classList.toggle("active", !state.hiddenChartSeries.has(series));
      animateCharts();
    });
  });
  els.cashflowChart.addEventListener("pointermove", handleCashflowPointer);
  els.cashflowChart.addEventListener("pointerdown", handleCashflowPointer);
  els.cashflowChart.addEventListener("pointerleave", hideCashflowTooltip);
  els.categoryChart.addEventListener("pointerdown", handleCategoryPointer);

  els.openTransactionDialogBtn.addEventListener("click", () => openTransactionDialog());
  els.transactionForm.addEventListener("submit", handleTransactionSubmit);
  els.transactionDirection.addEventListener("change", renderCategoryOptions);
  els.transactionAmount.addEventListener("input", handleMoneyInput);
  els.transactionAmount.addEventListener("blur", formatMoneyInputOnBlur);
  els.transactionSearch.addEventListener("input", (event) => {
    state.transactionSearch = event.target.value.trim().toLocaleLowerCase("pt-BR");
    renderTransactionHistory();
  });
  els.transactionMonth.addEventListener("change", (event) => {
    state.transactionMonth = event.target.value || currentMonthKey();
    renderTransactionHistory();
  });
  els.transactionDirectionFilter.addEventListener("change", (event) => {
    state.transactionDirectionFilter = event.target.value;
    renderTransactionHistory();
  });
  els.transactionCategoryFilter.addEventListener("change", (event) => {
    state.transactionCategoryFilter = event.target.value;
    renderTransactionHistory();
  });
  els.transactionPaymentFilter.addEventListener("change", (event) => {
    state.transactionPaymentFilter = event.target.value;
    renderTransactionHistory();
  });
  els.transactionFilterToggle.addEventListener("click", toggleTransactionFilters);

  els.openCategoryDialogBtn.addEventListener("click", () => openCategoryDialog());
  els.categoryForm.addEventListener("submit", handleCategorySubmit);
  els.categoryColor.addEventListener("input", () => {
    els.categoryColorValue.textContent = els.categoryColor.value.toUpperCase();
  });

  els.reportMonth.addEventListener("change", (event) => {
    state.reportMonth = event.target.value || currentMonthKey();
    renderReport();
    animateCharts();
  });

  els.profileForm.addEventListener("submit", handleProfileSubmit);
  els.themeOptions.forEach((input) => {
    input.addEventListener("change", () => setThemePreference(input.value));
  });

  els.openDeleteAccountDialogBtn.addEventListener("click", openDeleteAccountDialog);
  els.deleteConfirmText.addEventListener("input", () => {
    els.deleteContinueBtn.disabled = els.deleteConfirmText.value.trim().toUpperCase() !== "APAGAR";
  });
  els.deleteContinueBtn.addEventListener("click", showDeleteAccountReauthentication);
  els.deleteBackBtn.addEventListener("click", showDeleteAccountWarning);
  els.deleteSubmitBtn.addEventListener("click", handleDeleteAccount);

  qsa("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", () => closeDialog(qs(`#${button.dataset.closeDialog}`)));
  });
  qsa("dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("close", () => restoreDialogFocus(dialog));
  });

  els.confirmCancelBtn.addEventListener("click", () => resolveConfirmation(false));
  els.confirmActionBtn.addEventListener("click", () => resolveConfirmation(true));
  els.toastClose.addEventListener("click", hideToast);
  els.toastAction.addEventListener("click", () => {
    const action = activeToastAction;
    hideToast();
    if (action) action();
  });

  systemThemeQuery.addEventListener("change", () => {
    if (state.themePreference === "system") applyResolvedTheme("system", false);
  });
  window.addEventListener("hashchange", () => {
    const view = viewFromHash();
    if (view !== state.activeView && !els.appScreen.classList.contains("hidden")) {
      activateView(view, { updateHash: false });
    }
  });
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => drawCharts(1), 120);
  });
}

function setInitialDates() {
  const today = todayKey();
  els.transactionDate.value = today;
  els.transactionMonth.value = state.transactionMonth;
  els.dashboardMonth.value = state.dashboardMonth;
  els.reportMonth.value = state.reportMonth;
}

function setAuthMode(mode) {
  state.authMode = mode;
  const isSignup = mode === "signup";
  els.loginTab.classList.toggle("active", !isSignup);
  els.signupTab.classList.toggle("active", isSignup);
  els.loginTab.setAttribute("aria-selected", String(!isSignup));
  els.signupTab.setAttribute("aria-selected", String(isSignup));
  els.nameField.classList.toggle("hidden", !isSignup);
  els.confirmField.classList.toggle("hidden", !isSignup);
  els.authPassword.autocomplete = isSignup ? "new-password" : "current-password";
  setButtonContent(els.authSubmit, isSignup ? "user-plus" : "log-in", isSignup ? "Criar conta" : "Entrar com email");
  setMessage(els.authMessage, "");
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
  const name = normalizeTextInput(els.authName.value, 60);
  const confirm = els.authConfirm.value;

  if (!isValidEmail(email)) {
    setMessage(els.authMessage, "Informe um email válido.", "error");
    return;
  }

  try {
    setBusy(els.authSubmit, true);
    setMessage(els.authMessage, "");
    if (state.authMode === "signup") {
      if (!isStrongPassword(password)) {
        setMessage(els.authMessage, "A senha precisa ter 8 caracteres, uma letra e um número.", "error");
        return;
      }
      if (password !== confirm) {
        setMessage(els.authMessage, "As senhas não conferem.", "error");
        return;
      }

      const credential = await state.sdk.createUserWithEmailAndPassword(state.auth, email, password);
      if (name) await state.sdk.updateProfile(credential.user, { displayName: name });
      await state.sdk.sendEmailVerification(credential.user, verificationOptions());
      showVerifyScreen(credential.user);
      showToast("Conta criada. Confirme o email para continuar.");
      return;
    }

    await state.sdk.signInWithEmailAndPassword(state.auth, email, password);
  } catch (error) {
    setMessage(els.authMessage, authErrorMessage(error), "error");
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
    const message = authErrorMessage(error);
    setMessage(els.authMessage, message, "error");
    showToast(message);
  }
}

async function handleAuthStateChanged(user) {
  cleanupSubscriptions();
  state.user = user;
  state.profile = {};
  state.loadedCollections.clear();

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

  try {
    await user.getIdToken(true);
    state.loadingData = true;
    showAppScreen();
    await ensureUserProfile(user);
    await ensureDefaultCategories(user.uid);
    subscribeToUserData(user.uid);
  } catch (error) {
    console.error(error);
    state.loadingData = false;
    showToast("Não foi possível preparar sua conta. Tente novamente.");
  }
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
    setMessage(els.verifyMessage, authErrorMessage(error), "error");
  } finally {
    setBusy(els.reloadVerificationBtn, false);
  }
}

async function resendVerification() {
  if (!state.auth?.currentUser) return;

  try {
    setBusy(els.resendVerificationBtn, true);
    await state.sdk.sendEmailVerification(state.auth.currentUser, verificationOptions());
    setMessage(els.verifyMessage, "Email de confirmação reenviado.", "success");
  } catch (error) {
    setMessage(els.verifyMessage, authErrorMessage(error), "error");
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
  const ref = state.sdk.doc(state.db, "users", user.uid);
  const snapshot = await state.sdk.getDoc(ref);
  const payload = {
    displayName: user.displayName || "",
    email: user.email || "",
    photoURL: safePhotoUrl(user.photoURL),
    updatedAt: state.sdk.serverTimestamp()
  };

  if (!snapshot.exists()) {
    payload.alertEmailEnabled = true;
    payload.createdAt = state.sdk.serverTimestamp();
  }

  await state.sdk.setDoc(ref, payload, { merge: true });
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
  const profileRef = state.sdk.doc(state.db, "users", uid);
  const categoriesQuery = state.sdk.query(
    state.sdk.collection(state.db, "users", uid, "categories"),
    state.sdk.orderBy("name", "asc")
  );
  const transactionsQuery = state.sdk.query(
    state.sdk.collection(state.db, "users", uid, "transactions"),
    state.sdk.orderBy("date", "desc")
  );

  state.unsubscribers.push(state.sdk.onSnapshot(profileRef, (snapshot) => {
    state.profile = snapshot.exists() ? snapshot.data() : {};
    renderUser();
    renderProfile();
  }, () => showToast("Não foi possível carregar o perfil.")));

  state.unsubscribers.push(state.sdk.onSnapshot(categoriesQuery, (snapshot) => {
    state.categories = snapshot.docs.map((document) => normalizeCategory(document.id, document.data()));
    markCollectionLoaded("categories");
    renderAll();
  }, () => showToast("Não foi possível carregar as categorias.")));

  state.unsubscribers.push(state.sdk.onSnapshot(transactionsQuery, (snapshot) => {
    state.transactions = snapshot.docs.map((document) => normalizeTransaction(document.id, document.data()));
    markCollectionLoaded("transactions");
    renderAll();
  }, () => showToast("Não foi possível carregar as transações.")));
}

function markCollectionLoaded(name) {
  state.loadedCollections.add(name);
  if (state.loadedCollections.has("categories") && state.loadedCollections.has("transactions")) {
    state.loadingData = false;
  }
}

function openTransactionDialog() {
  els.transactionForm.reset();
  els.transactionDirection.value = "expense";
  els.transactionPayment.value = "pix";
  els.transactionDate.value = todayKey();
  els.transactionAmount.removeAttribute("aria-invalid");
  setMessage(els.transactionAmountError, "");
  setMessage(els.transactionFormMessage, "");
  renderCategoryOptions();
  openDialog(els.transactionDialog, els.openTransactionDialogBtn);
  window.setTimeout(() => els.transactionAmount.focus(), 0);
}

async function handleTransactionSubmit(event) {
  event.preventDefault();
  const direction = els.transactionDirection.value;
  const categoryId = els.transactionCategory.value;
  const category = state.categories.find((item) => item.id === categoryId);
  const amount = validateTransactionAmount({ showEmpty: true });
  const date = els.transactionDate.value;
  const paymentType = els.transactionPayment.value;
  const description = normalizeTextInput(els.transactionDescription.value, 160);

  setMessage(els.transactionFormMessage, "");

  if (!["income", "expense"].includes(direction) || !category) {
    setMessage(els.transactionFormMessage, "Escolha uma categoria válida.", "error");
    return;
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 999999999) {
    els.transactionAmount.focus();
    return;
  }
  if (!isValidDateKey(date)) {
    setMessage(els.transactionFormMessage, "Informe uma data válida.", "error");
    return;
  }
  if (!Object.prototype.hasOwnProperty.call(PAYMENT_LABELS, paymentType)) {
    setMessage(els.transactionFormMessage, "Escolha um tipo de pagamento válido.", "error");
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

  try {
    setBusy(els.transactionSubmitBtn, true);
    if (state.demo) {
      state.transactions.unshift({ id: crypto.randomUUID(), ...payload });
      state.transactions.sort((a, b) => b.date.localeCompare(a.date));
      renderAll();
    } else {
      await state.sdk.addDoc(state.sdk.collection(state.db, "users", state.user.uid, "transactions"), {
        ...payload,
        createdAt: state.sdk.serverTimestamp(),
        updatedAt: state.sdk.serverTimestamp()
      });
    }

    closeDialog(els.transactionDialog);
    showToast("Transação adicionada.");
  } catch (error) {
    console.error(error);
    setMessage(els.transactionFormMessage, "Não foi possível salvar a transação.", "error");
  } finally {
    setBusy(els.transactionSubmitBtn, false);
  }
}

function openCategoryDialog(category = null) {
  state.editingCategoryId = category?.id || null;
  els.categoryDialogTitle.textContent = category ? "Editar categoria" : "Nova categoria";
  els.categoryName.value = category?.name || "";
  els.categoryKind.value = category?.kind || "expense";
  els.categoryColor.value = category?.color || "#7C3AED";
  els.categoryColorValue.textContent = els.categoryColor.value.toUpperCase();
  setMessage(els.categoryFormMessage, "");
  setButtonContent(els.categorySubmitBtn, "check", category ? "Salvar alterações" : "Salvar categoria");
  openDialog(els.categoryDialog, els.openCategoryDialogBtn);
  refreshIcons();
  window.setTimeout(() => els.categoryName.focus(), 0);
}

async function handleCategorySubmit(event) {
  event.preventDefault();
  const name = normalizeTextInput(els.categoryName.value, 40);
  const kind = els.categoryKind.value;
  const color = els.categoryColor.value;

  if (name.length < 2) {
    setMessage(els.categoryFormMessage, "Use pelo menos 2 caracteres.", "error");
    return;
  }
  if (!["income", "expense", "both"].includes(kind) || !/^#[0-9a-f]{6}$/i.test(color)) {
    setMessage(els.categoryFormMessage, "Revise o tipo e a cor da categoria.", "error");
    return;
  }

  const duplicated = state.categories.some((category) => (
    category.id !== state.editingCategoryId
    && category.name.toLocaleLowerCase("pt-BR") === name.toLocaleLowerCase("pt-BR")
  ));
  if (duplicated) {
    setMessage(els.categoryFormMessage, "Já existe uma categoria com esse nome.", "error");
    return;
  }

  const existing = state.categories.find((category) => category.id === state.editingCategoryId);
  const payload = { name, kind, color, isDefault: existing?.isDefault === true };

  try {
    setBusy(els.categorySubmitBtn, true);
    if (state.demo) {
      if (existing) {
        Object.assign(existing, payload);
      } else {
        state.categories.push({ id: crypto.randomUUID(), ...payload });
      }
      state.categories.sort(sortCategories);
      renderAll();
    } else if (existing) {
      await state.sdk.setDoc(
        state.sdk.doc(state.db, "users", state.user.uid, "categories", existing.id),
        { ...payload, updatedAt: state.sdk.serverTimestamp() },
        { merge: true }
      );
    } else {
      await state.sdk.addDoc(state.sdk.collection(state.db, "users", state.user.uid, "categories"), {
        ...payload,
        isDefault: false,
        createdAt: state.sdk.serverTimestamp(),
        updatedAt: state.sdk.serverTimestamp()
      });
    }

    closeDialog(els.categoryDialog);
    showToast(existing ? "Categoria atualizada." : "Categoria criada.");
  } catch (error) {
    console.error(error);
    setMessage(els.categoryFormMessage, "Não foi possível salvar a categoria.", "error");
  } finally {
    setBusy(els.categorySubmitBtn, false);
  }
}

async function deleteTransaction(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;

  const confirmed = await requestConfirmation({
    title: "Excluir transação?",
    message: `${transaction.description || transaction.categoryName} será removida do histórico.`,
    confirmLabel: "Excluir"
  });
  if (!confirmed) return;

  try {
    if (state.demo) {
      state.transactions = state.transactions.filter((item) => item.id !== id);
      renderAll();
    } else {
      await state.sdk.deleteDoc(state.sdk.doc(state.db, "users", state.user.uid, "transactions", id));
    }

    showToast("Transação excluída.", {
      actionLabel: "Desfazer",
      action: () => restoreTransaction(transaction)
    });
  } catch (error) {
    console.error(error);
    showToast("Não foi possível excluir a transação.");
  }
}

async function restoreTransaction(transaction) {
  const payload = {
    direction: transaction.direction,
    categoryId: transaction.categoryId,
    categoryName: transaction.categoryName,
    amount: transaction.amount,
    date: transaction.date,
    description: transaction.description,
    paymentType: transaction.paymentType
  };

  try {
    if (state.demo) {
      state.transactions.push({ ...transaction });
      state.transactions.sort((a, b) => b.date.localeCompare(a.date));
      renderAll();
    } else {
      await state.sdk.setDoc(
        state.sdk.doc(state.db, "users", state.user.uid, "transactions", transaction.id),
        {
          ...payload,
          createdAt: state.sdk.serverTimestamp(),
          updatedAt: state.sdk.serverTimestamp()
        }
      );
    }
    showToast("Transação restaurada.");
  } catch (error) {
    console.error(error);
    showToast("Não foi possível restaurar a transação.");
  }
}

async function deleteCategory(id) {
  const category = state.categories.find((item) => item.id === id);
  if (!category || category.isDefault) return;

  const linkedCount = state.transactions.filter((transaction) => transaction.categoryId === id).length;
  if (linkedCount) {
    showToast(`Esta categoria está vinculada a ${linkedCount} ${linkedCount === 1 ? "transação" : "transações"}.`);
    return;
  }

  const confirmed = await requestConfirmation({
    title: "Excluir categoria?",
    message: `${category.name} será removida da sua lista de categorias.`,
    confirmLabel: "Excluir"
  });
  if (!confirmed) return;

  try {
    if (state.demo) {
      state.categories = state.categories.filter((item) => item.id !== id);
      renderAll();
    } else {
      await state.sdk.deleteDoc(state.sdk.doc(state.db, "users", state.user.uid, "categories", id));
    }
    showToast("Categoria excluída.");
  } catch (error) {
    console.error(error);
    showToast("Não foi possível excluir a categoria.");
  }
}

async function handleProfileSubmit(event) {
  event.preventDefault();
  if (!state.user) return;

  const displayName = normalizeTextInput(els.profileName.value, 60);
  const rawPhotoUrl = els.profilePhotoUrl.value.trim();
  const photoURL = safePhotoUrl(rawPhotoUrl);
  const alertEmailEnabled = els.profileAlertEmail.checked;

  if (rawPhotoUrl && !photoURL) {
    setMessage(els.profileMessage, "Use uma URL HTTPS válida para a foto.", "error");
    return;
  }

  try {
    setBusy(els.profileSaveBtn, true);
    setMessage(els.profileMessage, "");
    if (state.demo) {
      state.user.displayName = displayName;
      state.user.photoURL = photoURL;
      state.profile = {
        ...state.profile,
        displayName,
        photoURL,
        alertEmailEnabled
      };
      renderUser();
      renderProfile();
    } else {
      await state.sdk.updateProfile(state.user, { displayName, photoURL: photoURL || null });
      await state.sdk.setDoc(
        state.sdk.doc(state.db, "users", state.user.uid),
        {
          displayName,
          email: state.user.email || "",
          photoURL,
          alertEmailEnabled,
          updatedAt: state.sdk.serverTimestamp()
        },
        { merge: true }
      );
    }
    setMessage(els.profileMessage, "Alterações salvas.", "success");
    showToast("Perfil atualizado.");
  } catch (error) {
    console.error(error);
    setMessage(els.profileMessage, "Não foi possível salvar o perfil.", "error");
  } finally {
    setBusy(els.profileSaveBtn, false);
  }
}

function openDeleteAccountDialog() {
  if (state.demo) {
    showToast("A exclusão de conta não fica disponível no preview local.");
    return;
  }
  showDeleteAccountWarning();
  openDialog(els.deleteAccountDialog, els.openDeleteAccountDialogBtn);
}

function showDeleteAccountWarning() {
  els.deleteStepOne.classList.remove("hidden");
  els.deleteStepTwo.classList.add("hidden");
  els.deleteConfirmText.value = "";
  els.deleteContinueBtn.disabled = true;
  els.deletePassword.value = "";
  setMessage(els.deleteMessage, "");
}

function showDeleteAccountReauthentication() {
  if (els.deleteConfirmText.value.trim().toUpperCase() !== "APAGAR") return;
  const hasPassword = userHasProvider("password");
  els.deleteStepOne.classList.add("hidden");
  els.deleteStepTwo.classList.remove("hidden");
  els.deletePasswordField.classList.toggle("hidden", !hasPassword);
  if (hasPassword) {
    window.setTimeout(() => els.deletePassword.focus(), 0);
  } else {
    setMessage(els.deleteMessage, "A confirmação será feita pela sua conta Google.");
  }
}

async function handleDeleteAccount() {
  if (!state.user || state.demo) return;

  try {
    setBusy(els.deleteSubmitBtn, true);
    setMessage(els.deleteMessage, "");
    await reauthenticateCurrentUser();
    const deleteAccount = state.sdk.httpsCallable(state.functions, "deleteUserAccount");
    await deleteAccount({});
    closeDialog(els.deleteAccountDialog);
    await state.sdk.signOut(state.auth).catch(() => {});
    showToast("Sua conta foi apagada.");
  } catch (error) {
    console.error(error);
    setMessage(els.deleteMessage, deleteAccountErrorMessage(error), "error");
  } finally {
    setBusy(els.deleteSubmitBtn, false);
  }
}

async function reauthenticateCurrentUser() {
  if (userHasProvider("password")) {
    const password = els.deletePassword.value;
    if (!password) {
      const error = new Error("Senha obrigatória");
      error.code = "auth/missing-password";
      throw error;
    }
    const credential = state.sdk.EmailAuthProvider.credential(state.user.email, password);
    await state.sdk.reauthenticateWithCredential(state.user, credential);
    await state.user.getIdToken(true);
    return;
  }

  const provider = new state.sdk.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await state.sdk.reauthenticateWithPopup(state.user, provider);
  await state.user.getIdToken(true);
}

function renderAll() {
  syncFinancialPrivacyControl();
  renderUser();
  renderCategoryOptions();
  renderDashboard();
  renderTransactionHistory();
  renderCategories();
  renderReport();
  renderProfile();
  refreshIcons();
  window.requestAnimationFrame(animateCharts);
}

function renderUser() {
  const displayName = normalizeTextInput(state.profile.displayName || state.user?.displayName || "", 60);
  const email = state.profile.email || state.user?.email || "conta";
  const firstName = displayName ? displayName.split(/\s+/)[0] : "";
  const initials = initialsFromName(displayName || email);
  const photoURL = safePhotoUrl(state.profile.photoURL || state.user?.photoURL);

  els.welcomeTitle.textContent = firstName ? `Olá, ${firstName}` : "Olá";
  els.userEmail.textContent = email;
  els.userInitials.textContent = initials;
  els.profileAvatarInitials.textContent = initials;
  els.profileDisplayName.textContent = displayName || "Conta CtrlFinance";
  setProfileImage(els.userPhoto, els.userInitials, photoURL);
  setProfileImage(els.profileAvatarImage, els.profileAvatarInitials, photoURL);
}

function renderCategoryOptions() {
  const direction = els.transactionDirection.value || "expense";
  const selectedTransactionCategory = els.transactionCategory.value;
  const matching = state.categories
    .filter((category) => category.kind === "both" || category.kind === direction)
    .sort(sortCategories);

  replaceChildren(els.transactionCategory);
  matching.forEach((category) => {
    els.transactionCategory.append(new Option(category.name, category.id));
  });
  if (matching.some((category) => category.id === selectedTransactionCategory)) {
    els.transactionCategory.value = selectedTransactionCategory;
  }

  const selectedFilter = state.transactionCategoryFilter;
  replaceChildren(els.transactionCategoryFilter, new Option("Todas", "all"));
  state.categories.slice().sort(sortCategories).forEach((category) => {
    els.transactionCategoryFilter.append(new Option(category.name, category.id));
  });
  els.transactionCategoryFilter.value = state.categories.some((category) => category.id === selectedFilter)
    ? selectedFilter
    : "all";
  state.transactionCategoryFilter = els.transactionCategoryFilter.value;
}

function renderDashboard() {
  const month = state.dashboardMonth;
  const balance = sumTransactions(state.transactions, { direction: "income" })
    - sumTransactions(state.transactions, { direction: "expense" });
  const income = sumTransactions(state.transactions, { direction: "income", month });
  const expense = sumTransactions(state.transactions, { direction: "expense", month });
  const average = monthlyExpenseAverage(month);

  setMoney(els.metricBalance, balance);
  setMoney(els.metricIncome, income);
  setMoney(els.metricExpense, expense);
  setMoney(els.metricAverage, average);
  els.metricBalanceNote.textContent = `${state.transactions.length} ${state.transactions.length === 1 ? "lançamento" : "lançamentos"}`;
  els.metricIncomeNote.textContent = monthLabel(month);
  els.metricExpenseNote.textContent = monthLabel(month);

  const currentIncome = state.transactions
    .filter((transaction) => transaction.direction === "income" && monthFromDate(transaction.date) === month)
    .slice(0, 5);
  const currentExpenses = state.transactions
    .filter((transaction) => transaction.direction === "expense" && monthFromDate(transaction.date) === month)
    .slice(0, 5);

  renderTransactionCollection(els.incomeTable, currentIncome, {
    emptyTitle: "Nenhuma entrada",
    emptyMessage: `Ainda não há entradas em ${monthLabel(month).toLocaleLowerCase("pt-BR")}.`,
    compact: true
  });
  renderTransactionCollection(els.expenseTable, currentExpenses, {
    emptyTitle: "Nenhum gasto",
    emptyMessage: `Ainda não há gastos em ${monthLabel(month).toLocaleLowerCase("pt-BR")}.`,
    compact: true
  });
  renderCategoryExtremes(month);
  renderCategoryLegend();
}

function renderCategoryExtremes(month) {
  const items = categoryExpenseTotals(month);
  replaceChildren(els.categoryExtremes);
  if (!items.length) return;
  els.categoryExtremes.append(
    insightPill("Maior gasto", items[0].name, items[0].total),
    insightPill("Menor gasto", items.at(-1).name, items.at(-1).total)
  );
}

function renderTransactionHistory() {
  const rows = filteredTransactions();
  const countLabel = `${rows.length} ${rows.length === 1 ? "transação" : "transações"}`;
  els.transactionResultCount.textContent = countLabel;

  renderTransactionCollection(els.transactionsTable, rows, {
    emptyTitle: "Nenhuma transação encontrada",
    emptyMessage: "Altere os filtros ou adicione um novo lançamento.",
    allowDelete: true
  });
  refreshIcons();
}

function filteredTransactions() {
  return state.transactions.filter((transaction) => {
    const haystack = `${transaction.description} ${transaction.categoryName} ${PAYMENT_LABELS[transaction.paymentType] || ""}`
      .toLocaleLowerCase("pt-BR");
    if (state.transactionSearch && !haystack.includes(state.transactionSearch)) return false;
    if (state.transactionMonth && monthFromDate(transaction.date) !== state.transactionMonth) return false;
    if (state.transactionDirectionFilter !== "all" && transaction.direction !== state.transactionDirectionFilter) return false;
    if (state.transactionCategoryFilter !== "all" && transaction.categoryId !== state.transactionCategoryFilter) return false;
    if (state.transactionPaymentFilter !== "all" && transaction.paymentType !== state.transactionPaymentFilter) return false;
    return true;
  });
}

function renderCategories() {
  const sorted = state.categories.slice().sort(sortCategories);
  const incomeCount = sorted.filter((category) => ["income", "both"].includes(category.kind)).length;
  const expenseCount = sorted.filter((category) => ["expense", "both"].includes(category.kind)).length;
  const customCount = sorted.filter((category) => !category.isDefault).length;

  replaceChildren(
    els.categoryStats,
    categoryStat("Categorias", String(sorted.length)),
    categoryStat("De entradas", String(incomeCount)),
    categoryStat("De gastos", String(expenseCount)),
    categoryStat("Personalizadas", String(customCount))
  );
  replaceChildren(els.categoryList);

  if (!sorted.length) {
    els.categoryList.append(emptyState("Nenhuma categoria", "Crie uma categoria para começar a organizar suas transações."));
    return;
  }

  sorted.forEach((category) => {
    const linked = state.transactions.filter((transaction) => transaction.categoryId === category.id);
    const total = linked.reduce((sum, transaction) => sum + transaction.amount, 0);
    const card = document.createElement("article");
    card.className = "category-card";

    const header = document.createElement("header");
    header.className = "category-card-header";
    const icon = categoryIcon(category);
    const title = document.createElement("div");
    title.className = "category-card-title";
    const name = document.createElement("strong");
    name.textContent = category.name;
    const kind = document.createElement("span");
    kind.textContent = `${KIND_LABELS[category.kind]} · ${linked.length} ${linked.length === 1 ? "transação" : "transações"}`;
    title.append(name, kind);

    const actions = document.createElement("div");
    actions.className = "category-card-actions";
    const edit = iconButton("pencil", `Editar ${category.name}`);
    edit.addEventListener("click", () => openCategoryDialog(category));
    actions.append(edit);
    if (!category.isDefault) {
      const remove = iconButton("trash-2", `Excluir ${category.name}`, "danger");
      remove.addEventListener("click", () => deleteCategory(category.id));
      actions.append(remove);
    }
    header.append(icon, title, actions);

    const footer = document.createElement("div");
    footer.className = "category-total";
    const totalCopy = document.createElement("div");
    const totalLabel = document.createElement("span");
    totalLabel.textContent = "Total movimentado";
    const totalValue = document.createElement("strong");
    totalValue.textContent = displayMoney(total);
    totalCopy.append(totalLabel, totalValue);
    const badge = document.createElement("span");
    badge.className = "category-badge";
    badge.textContent = category.isDefault ? "Padrão" : "Personalizada";
    footer.append(totalCopy, badge);
    card.append(header, footer);
    els.categoryList.append(card);
  });
}

function renderReport() {
  const month = state.reportMonth;
  const previousMonth = addMonths(month, -1);
  const current = sumTransactions(state.transactions, { direction: "expense", month });
  const previous = sumTransactions(state.transactions, { direction: "expense", month: previousMonth });
  const average = monthlyExpenseAverage(month);

  setMoney(els.reportCurrent, current);
  setMoney(els.reportPrevious, previous);
  setMoney(els.reportAverage, average);
  els.reportCurrentNote.textContent = monthLabel(month);
  els.reportPreviousNote.textContent = monthLabel(previousMonth);
  els.reportAverageNote.textContent = average ? "Meses anteriores" : "Sem base histórica";

  const previousDiff = current - previous;
  const averageDiff = current - average;
  const reportParts = [];
  if (!current && !previous && !average) {
    reportParts.push(reportParagraph("Ainda não há gastos suficientes para gerar comparações neste período."));
  } else {
    reportParts.push(reportParagraph(
      `Em ${monthLabel(month)}, seus gastos somaram `,
      strongText(displayMoney(current)),
      "."
    ));
    reportParts.push(reportParagraph(
      previous
        ? `Isso representa ${describeDiff(previousDiff, previous, previousDiff >= 0 ? "acima do mês anterior" : "abaixo do mês anterior")}.`
        : "O mês anterior ainda não possui gastos para comparação."
    ));
    reportParts.push(reportParagraph(
      average
        ? `Em relação à média mensal, o período ficou ${describeDiff(averageDiff, average, averageDiff >= 0 ? "acima" : "abaixo")}.`
        : "A média mensal aparecerá quando houver histórico de meses anteriores."
    ));
  }
  replaceChildren(els.monthlyReport, ...reportParts);
  renderCategoryComparisonTable(month, previousMonth);
}

function renderCategoryComparisonTable(month, previousMonth) {
  const rows = categoryComparison(month, previousMonth).map((row) => [
    row.name,
    displayMoney(row.current),
    displayMoney(row.previous),
    row.previous ? formatPercent((row.current - row.previous) / row.previous) : "Sem base"
  ]);
  renderSimpleTable(els.categoryComparisonTable, {
    columns: ["Categoria", monthLabel(month), monthLabel(previousMonth), "Variação"],
    rows,
    emptyTitle: "Sem dados para comparar",
    emptyMessage: "Adicione gastos neste mês ou no mês anterior."
  });
}

function renderProfile() {
  if (!state.user) return;
  const displayName = normalizeTextInput(state.profile.displayName || state.user.displayName || "", 60);
  const email = state.profile.email || state.user.email || "";
  const photoURL = safePhotoUrl(state.profile.photoURL || state.user.photoURL);

  setInputValueUnlessFocused(els.profileName, displayName);
  els.profileEmail.value = email;
  setInputValueUnlessFocused(els.profilePhotoUrl, photoURL);
  els.profileAlertEmail.checked = state.profile.alertEmailEnabled !== false;
  syncThemeControls();

  const googleLinked = userHasProvider("google.com");
  els.linkGoogleBtn.disabled = googleLinked;
  setButtonContent(els.linkGoogleBtn, googleLinked ? "check" : "link", googleLinked ? "Google conectado" : "Conectar conta Google");
}

function renderTransactionCollection(container, transactions, options = {}) {
  replaceChildren(container);
  if (!transactions.length) {
    container.append(emptyState(options.emptyTitle || "Sem dados", options.emptyMessage || "Nenhuma movimentação encontrada."));
    return;
  }

  const cards = document.createElement("div");
  cards.className = "transaction-card-list mobile-cards";
  transactions.forEach((transaction) => cards.append(transactionCard(transaction)));

  const tableWrap = document.createElement("div");
  tableWrap.className = "desktop-table";
  const table = document.createElement("table");
  table.className = "data-table";
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  ["Data", "Categoria", "Descrição", "Pagamento", "Valor"].forEach((label) => appendHeader(headerRow, label));
  if (options.allowDelete) appendHeader(headerRow, "Ações");
  thead.append(headerRow);

  const tbody = document.createElement("tbody");
  transactions.forEach((transaction) => {
    const row = document.createElement("tr");
    row.tabIndex = 0;
    row.addEventListener("dblclick", () => openTransactionDetails(transaction.id));
    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openTransactionDetails(transaction.id);
    });
    appendCell(row, formatDate(transaction.date));
    appendCell(row, transaction.categoryName || "Categoria");
    appendCell(row, transaction.description || "-");
    appendCell(row, PAYMENT_LABELS[transaction.paymentType] || transaction.paymentType);
    const amount = appendCell(row, formatSignedMoney(transaction));
    amount.className = transaction.direction === "income" ? "amount-income" : "amount-expense";

    if (options.allowDelete) {
      const actionCell = document.createElement("td");
      const detail = iconButton("info", "Abrir detalhes");
      detail.addEventListener("click", () => openTransactionDetails(transaction.id));
      const remove = iconButton("trash-2", "Excluir transação", "danger");
      remove.addEventListener("click", () => deleteTransaction(transaction.id));
      actionCell.append(detail, remove);
      row.append(actionCell);
    }
    tbody.append(row);
  });

  table.append(thead, tbody);
  tableWrap.append(table);
  container.append(cards, tableWrap);
}

function transactionCard(transaction) {
  const card = document.createElement("button");
  card.className = "transaction-card";
  card.type = "button";
  card.addEventListener("click", () => openTransactionDetails(transaction.id));

  const category = state.categories.find((item) => item.id === transaction.categoryId);
  const icon = document.createElement("span");
  icon.className = "transaction-icon";
  icon.style.setProperty("--category-color", category?.color || "#7C3AED");
  icon.append(iconNode(categoryIconName(transaction.categoryId)));

  const copy = document.createElement("span");
  copy.className = "transaction-copy";
  const title = document.createElement("strong");
  title.textContent = transaction.description || transaction.categoryName;
  const meta = document.createElement("span");
  meta.textContent = `${transaction.categoryName} · ${formatDate(transaction.date)} · ${PAYMENT_LABELS[transaction.paymentType]}`;
  copy.append(title, meta);

  const amount = document.createElement("strong");
  amount.className = `transaction-amount ${transaction.direction === "income" ? "amount-income" : "amount-expense"}`;
  amount.textContent = formatSignedMoney(transaction);
  card.append(icon, copy, amount);
  return card;
}

function openTransactionDetails(id) {
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;
  state.selectedTransactionId = id;
  replaceChildren(els.transactionDetailContent);

  [
    ["Movimento", transaction.direction === "income" ? "Entrada" : "Gasto"],
    ["Categoria", transaction.categoryName],
    ["Descrição", transaction.description || "-"],
    ["Data", formatDate(transaction.date)],
    ["Pagamento", PAYMENT_LABELS[transaction.paymentType]],
    ["Valor", formatSignedMoney(transaction)]
  ].forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "detail-row";
    const labelNode = document.createElement("span");
    labelNode.textContent = label;
    const valueNode = document.createElement("strong");
    valueNode.textContent = value;
    row.append(labelNode, valueNode);
    els.transactionDetailContent.append(row);
  });

  const remove = document.createElement("button");
  remove.className = "button button-danger button-block";
  remove.type = "button";
  remove.append(iconNode("trash-2"), textNode("Excluir transação"));
  remove.addEventListener("click", async () => {
    closeDialog(els.transactionDetailDialog);
    await deleteTransaction(id);
  });
  els.transactionDetailContent.append(remove);
  openDialog(els.transactionDetailDialog, document.activeElement);
  refreshIcons();
}

function renderSimpleTable(container, { columns, rows, emptyTitle, emptyMessage }) {
  replaceChildren(container);
  if (!rows.length) {
    container.append(emptyState(emptyTitle, emptyMessage));
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

function animateCharts() {
  cancelAnimationFrame(chartAnimationFrame);
  if (reducedMotionQuery.matches) {
    drawCharts(1);
    return;
  }

  const startedAt = performance.now();
  const duration = 360;
  const frame = (now) => {
    const linear = Math.min(1, (now - startedAt) / duration);
    const progress = 1 - ((1 - linear) ** 3);
    drawCharts(progress);
    if (linear < 1) chartAnimationFrame = requestAnimationFrame(frame);
  };
  chartAnimationFrame = requestAnimationFrame(frame);
}

function drawCharts(progress = 1) {
  drawCashflowChart(progress);
  drawCategoryChart(progress);
  drawReportChart(progress);
}

function drawCashflowChart(progress = 1) {
  const canvas = els.cashflowChart;
  if (!isViewVisible(canvas)) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;
  const colors = themeColors();
  const { width, height } = canvasMetrics(canvas);
  const padding = { top: 16, right: 12, bottom: 34, left: width < 460 ? 18 : 28 };
  const months = lastMonths(state.dashboardMonth, state.chartMonths);
  const series = months.map((month) => ({
    month,
    income: sumTransactions(state.transactions, { direction: "income", month }),
    expense: sumTransactions(state.transactions, { direction: "expense", month })
  }));
  const incomeVisible = !state.hiddenChartSeries.has("income");
  const expenseVisible = !state.hiddenChartSeries.has("expense");
  const values = series.flatMap((item) => [
    incomeVisible ? item.income : 0,
    expenseVisible ? item.expense : 0
  ]);
  const maxValue = Math.max(1, ...values);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const groupWidth = chartWidth / series.length;
  const barWidth = Math.max(4, Math.min(16, groupWidth * 0.22));

  ctx.clearRect(0, 0, width, height);
  drawGrid(ctx, width, height, padding, colors.border);
  state.cashflowHitboxes = [];

  series.forEach((item, index) => {
    const centerX = padding.left + groupWidth * index + groupWidth / 2;
    const incomeHeight = (item.income / maxValue) * chartHeight * progress;
    const expenseHeight = (item.expense / maxValue) * chartHeight * progress;

    if (incomeVisible && item.income > 0) {
      const x = centerX - barWidth - 2;
      const y = padding.top + chartHeight - incomeHeight;
      roundedRect(ctx, x, y, barWidth, incomeHeight, 5, colors.income);
      if (progress === 1) {
        state.cashflowHitboxes.push({ x, y, width: barWidth, height: incomeHeight, month: item.month, type: "income", value: item.income });
      }
    }
    if (expenseVisible && item.expense > 0) {
      const x = centerX + 2;
      const y = padding.top + chartHeight - expenseHeight;
      roundedRect(ctx, x, y, barWidth, expenseHeight, 5, colors.expense);
      if (progress === 1) {
        state.cashflowHitboxes.push({ x, y, width: barWidth, height: expenseHeight, month: item.month, type: "expense", value: item.expense });
      }
    }

    if (state.chartMonths === 6 || index % 2 === 0) {
      drawText(ctx, shortMonthLabel(item.month), centerX, height - 14, colors.muted, "center", 11, 700);
    }
  });

  const totalIncome = series.reduce((sum, item) => sum + item.income, 0);
  const totalExpense = series.reduce((sum, item) => sum + item.expense, 0);
  els.cashflowSummary.textContent = `Nos últimos ${state.chartMonths} meses, entradas somaram ${displayMoney(totalIncome)} e gastos somaram ${displayMoney(totalExpense)}.`;
}

function drawCategoryChart(progress = 1) {
  const canvas = els.categoryChart;
  if (!isViewVisible(canvas)) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;
  const colors = themeColors();
  const { width, height } = canvasMetrics(canvas);
  const items = categoryExpenseTotals(state.dashboardMonth);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(54, Math.min(width, height) * 0.34);
  const thickness = Math.max(18, radius * 0.26);

  ctx.clearRect(0, 0, width, height);
  state.categorySlices = [];
  if (!items.length || total <= 0) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = thickness;
    ctx.stroke();
    drawText(ctx, "Sem gastos", centerX, centerY, colors.muted, "center", 13, 750);
    return;
  }

  let angle = -Math.PI / 2;
  items.forEach((item) => {
    const fullSweep = (item.total / total) * Math.PI * 2;
    const sweep = fullSweep * progress;
    const selected = item.id === state.selectedCategoryId;
    const mid = angle + fullSweep / 2;
    const offset = selected ? 5 : 0;
    const x = centerX + Math.cos(mid) * offset;
    const y = centerY + Math.sin(mid) * offset;
    ctx.beginPath();
    ctx.arc(x, y, radius, angle, angle + sweep);
    ctx.strokeStyle = item.color;
    ctx.lineWidth = selected ? thickness + 5 : thickness;
    ctx.lineCap = "butt";
    ctx.stroke();
    if (progress === 1) {
      state.categorySlices.push({
        ...item,
        start: normalizeAngle(angle),
        end: normalizeAngle(angle + fullSweep),
        centerX,
        centerY,
        radius,
        thickness,
        totalAll: total
      });
    }
    angle += fullSweep;
  });

  drawText(ctx, displayMoney(total), centerX, centerY - 5, colors.text, "center", width < 300 ? 13 : 15, 800);
  drawText(ctx, monthLabel(state.dashboardMonth), centerX, centerY + 17, colors.muted, "center", 10, 650);
}

function drawReportChart(progress = 1) {
  const canvas = els.reportChart;
  if (!isViewVisible(canvas)) return;
  const ctx = setupCanvas(canvas);
  if (!ctx) return;
  const colors = themeColors();
  const { width, height } = canvasMetrics(canvas);
  const rows = categoryComparison(state.reportMonth, addMonths(state.reportMonth, -1)).slice(0, width < 600 ? 6 : 8);
  ctx.clearRect(0, 0, width, height);

  if (!rows.length) {
    drawText(ctx, "Sem dados para comparar", width / 2, height / 2, colors.muted, "center", 13, 750);
    return;
  }

  const labelWidth = Math.min(130, width * 0.32);
  const padding = { top: 20, right: 18, bottom: 12, left: labelWidth };
  const rowHeight = (height - padding.top - padding.bottom) / rows.length;
  const maxValue = Math.max(1, ...rows.flatMap((row) => [row.current, row.previous]));
  const maxBar = width - padding.left - padding.right;

  rows.forEach((row, index) => {
    const y = padding.top + index * rowHeight + rowHeight * 0.27;
    const previousWidth = (row.previous / maxValue) * maxBar * progress;
    const currentWidth = (row.current / maxValue) * maxBar * progress;
    drawText(ctx, truncate(row.name, width < 500 ? 13 : 18), padding.left - 10, y + 10, colors.muted, "right", 10, 700);
    roundedRect(ctx, padding.left, y, previousWidth, 7, 4, colors.border);
    roundedRect(ctx, padding.left, y + 12, currentWidth, 7, 4, row.color);
  });
}

function renderCategoryLegend() {
  const items = categoryExpenseTotals(state.dashboardMonth);
  const total = items.reduce((sum, item) => sum + item.total, 0);
  replaceChildren(els.categoryLegend);

  items.slice(0, 8).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-legend-button";
    button.classList.toggle("active", item.id === state.selectedCategoryId);
    const dot = document.createElement("span");
    dot.className = "legend-dot";
    dot.style.background = item.color;
    const name = document.createElement("span");
    name.textContent = item.name;
    const percentage = document.createElement("strong");
    percentage.textContent = total ? formatPercent(item.total / total, false) : "0%";
    button.append(dot, name, percentage);
    button.addEventListener("click", () => selectCategorySlice(item.id));
    els.categoryLegend.append(button);
  });

  if (state.selectedCategoryId && !items.some((item) => item.id === state.selectedCategoryId)) {
    state.selectedCategoryId = null;
  }
  renderCategorySelection(items, total);
}

function selectCategorySlice(id) {
  state.selectedCategoryId = state.selectedCategoryId === id ? null : id;
  renderCategoryLegend();
  drawCategoryChart(1);
}

function renderCategorySelection(items, total) {
  const selected = items.find((item) => item.id === state.selectedCategoryId);
  els.categorySelection.classList.toggle("hidden", !selected);
  if (!selected) {
    replaceChildren(els.categorySelection);
    return;
  }
  const name = document.createElement("strong");
  name.textContent = selected.name;
  const value = document.createElement("span");
  value.textContent = `${displayMoney(selected.total)} · ${formatPercent(selected.total / total, false)}`;
  replaceChildren(els.categorySelection, name, value);
}

function handleCashflowPointer(event) {
  if (!state.cashflowHitboxes.length) return;
  const point = canvasPoint(event, els.cashflowChart);
  const hit = state.cashflowHitboxes.find((item) => (
    point.x >= item.x - 7
    && point.x <= item.x + item.width + 7
    && point.y >= item.y - 7
    && point.y <= item.y + item.height + 7
  ));
  if (!hit) {
    hideCashflowTooltip();
    return;
  }
  els.cashflowTooltip.textContent = `${hit.type === "income" ? "Entradas" : "Gastos"} · ${monthLabel(hit.month)} · ${displayMoney(hit.value)}`;
  els.cashflowTooltip.style.left = `${Math.max(70, Math.min(point.x, els.cashflowChart.clientWidth - 70))}px`;
  els.cashflowTooltip.style.top = `${Math.max(48, point.y)}px`;
  els.cashflowTooltip.classList.remove("hidden");
}

function hideCashflowTooltip() {
  els.cashflowTooltip.classList.add("hidden");
}

function handleCategoryPointer(event) {
  if (!state.categorySlices.length) return;
  const point = canvasPoint(event, els.categoryChart);
  const sample = state.categorySlices[0];
  const dx = point.x - sample.centerX;
  const dy = point.y - sample.centerY;
  const distance = Math.sqrt(dx ** 2 + dy ** 2);
  if (distance < sample.radius - sample.thickness || distance > sample.radius + sample.thickness) return;
  const angle = normalizeAngle(Math.atan2(dy, dx));
  const slice = state.categorySlices.find((item) => angleWithinSlice(angle, item.start, item.end));
  if (slice) selectCategorySlice(slice.id);
}

function showAuthScreen() {
  els.setupBanner.classList.toggle("hidden", !state.demo);
  els.authScreen.classList.remove("hidden");
  els.verifyScreen.classList.add("hidden");
  els.appScreen.classList.add("hidden");
  finishBoot();
  refreshIcons();
}

function showVerifyScreen(user) {
  els.verifyEmail.textContent = user?.email || "seu email";
  els.authScreen.classList.add("hidden");
  els.verifyScreen.classList.remove("hidden");
  els.appScreen.classList.add("hidden");
  finishBoot();
  refreshIcons();
}

function showAppScreen() {
  els.setupBanner.classList.toggle("hidden", !state.demo);
  els.authScreen.classList.add("hidden");
  els.verifyScreen.classList.add("hidden");
  els.appScreen.classList.remove("hidden");
  activateView(state.activeView, { updateHash: false });
  renderAll();
  finishBoot();
}

function finishBoot() {
  if (state.bootComplete) return;
  state.bootComplete = true;
  document.body.classList.remove("is-booting");
  requestAnimationFrame(() => els.splashScreen.classList.add("is-complete"));
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
  state.profile = {
    displayName: "CtrlFinance",
    email: "preview@ctrlfinance.app",
    photoURL: "",
    alertEmailEnabled: true
  };
  state.categories = DEFAULT_CATEGORIES.map((category) => ({ ...category }));
  state.transactions = createDemoTransactions();
  state.loadingData = false;
  showAppScreen();
  setMessage(els.authMessage, message);
  showToast(message);
}

function activateView(view, options = {}) {
  const nextView = VALID_VIEWS.has(view) ? view : "dashboard";
  state.activeView = nextView;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === nextView));
  els.views.forEach((item) => item.classList.toggle("active", item.id === `${nextView}-view`));
  els.dashboardPeriodControl.classList.toggle("hidden", nextView !== "dashboard");
  const meta = VIEW_META[nextView];
  els.welcomeContext.textContent = meta.context;
  document.title = `${meta.title} · CtrlFinance`;
  if (options.updateHash !== false && window.location.hash !== `#${nextView}`) {
    history.replaceState(null, "", `#${nextView}`);
  }
  window.scrollTo({ top: 0, behavior: reducedMotionQuery.matches ? "auto" : "smooth" });
  window.requestAnimationFrame(() => drawCharts(1));
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

function setThemePreference(preference) {
  if (!["system", "light", "dark"].includes(preference)) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // The selected theme still applies for the current session.
  }
  applyResolvedTheme(preference, true);
}

function applyResolvedTheme(preference, announce) {
  state.themePreference = preference;
  const resolved = preference === "system" ? (systemThemeQuery.matches ? "dark" : "light") : preference;
  document.documentElement.dataset.themePreference = preference;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
  const themeMeta = qs('meta[name="theme-color"]');
  if (themeMeta) themeMeta.content = resolved === "dark" ? "#0D0B12" : "#F7F7FA";
  syncThemeControls();
  drawCharts(1);
  if (announce) showToast(`Tema ${preference === "system" ? "do sistema" : preference === "dark" ? "escuro" : "claro"} aplicado.`);
}

function syncThemeControls() {
  els.themeOptions.forEach((input) => {
    input.checked = input.value === state.themePreference;
  });
}

function syncFinancialPrivacyControl() {
  setButtonContent(els.privacyToggle, state.valuesHidden ? "eye-off" : "eye", "");
  els.privacyToggle.setAttribute("aria-label", state.valuesHidden ? "Mostrar valores" : "Ocultar valores");
  els.privacyToggle.title = state.valuesHidden ? "Mostrar valores" : "Ocultar valores";
}

function toggleFinancialPrivacy() {
  state.valuesHidden = !state.valuesHidden;
  try {
    localStorage.setItem(PRIVACY_STORAGE_KEY, String(state.valuesHidden));
  } catch {
    // Privacy still applies for the current session.
  }
  renderAll();
}

function toggleTransactionFilters() {
  const open = !els.transactionFilters.classList.contains("open");
  els.transactionFilters.classList.toggle("open", open);
  els.transactionFilterToggle.setAttribute("aria-expanded", String(open));
  els.transactionFilterToggle.setAttribute("aria-label", open ? "Fechar filtros" : "Abrir filtros");
}

function handleMoneyInput(event) {
  const input = event.target;
  let value = input.value.replace(/[^\d.,]/g, "");
  const separatorIndex = Math.max(value.lastIndexOf(","), value.lastIndexOf("."));
  if (separatorIndex >= 0) {
    const integer = value.slice(0, separatorIndex).replace(/[.,]/g, "");
    const decimals = value.slice(separatorIndex + 1).replace(/[.,]/g, "").slice(0, 2);
    value = `${integer}${value[separatorIndex]}${decimals}`;
  } else {
    value = value.replace(/[.,]/g, "");
  }
  input.value = value.slice(0, 16);
  validateTransactionAmount({ showEmpty: false });
}

function formatMoneyInputOnBlur() {
  const value = validateTransactionAmount({ showEmpty: true });
  if (!Number.isFinite(value)) return;
  els.transactionAmount.value = new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function validateTransactionAmount({ showEmpty }) {
  const raw = els.transactionAmount.value.trim();
  const value = parseMoneyInput(raw);
  let message = "";

  if (!raw) {
    message = showEmpty ? "Informe o valor da transação." : "";
  } else if (!Number.isFinite(value) || value <= 0) {
    message = "Informe um valor maior que zero.";
  } else if (value > 999999999) {
    message = "O valor máximo é R$ 999.999.999,00.";
  }

  els.transactionAmount.toggleAttribute("aria-invalid", Boolean(message));
  setMessage(els.transactionAmountError, message, message ? "error" : "");
  return message ? Number.NaN : value;
}

function requestConfirmation({ title, message, confirmLabel }) {
  if (state.confirmResolver) state.confirmResolver(false);
  els.confirmTitle.textContent = title;
  els.confirmMessage.textContent = message;
  els.confirmActionBtn.textContent = confirmLabel || "Confirmar";
  openDialog(els.confirmDialog, document.activeElement);
  return new Promise((resolve) => {
    state.confirmResolver = resolve;
  });
}

function resolveConfirmation(value) {
  const resolver = state.confirmResolver;
  state.confirmResolver = null;
  closeDialog(els.confirmDialog);
  if (resolver) resolver(value);
}

function openDialog(dialog, trigger) {
  if (!dialog || dialog.open) return;
  dialogTriggers.set(dialog, trigger instanceof HTMLElement ? trigger : document.activeElement);
  dialog.showModal();
  refreshIcons();
}

function closeDialog(dialog) {
  if (!dialog?.open) return;
  dialog.close();
}

function restoreDialogFocus(dialog) {
  const trigger = dialogTriggers.get(dialog);
  if (trigger?.isConnected) trigger.focus();
  dialogTriggers.delete(dialog);
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

function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function drawGrid(ctx, width, height, padding, color) {
  ctx.strokeStyle = color;
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
  right.textContent = `${name} · ${displayMoney(amount)}`;
  pill.append(left, right);
  return pill;
}

function categoryStat(label, value) {
  const item = document.createElement("div");
  item.className = "category-stat";
  const labelNode = document.createElement("span");
  labelNode.textContent = label;
  const valueNode = document.createElement("strong");
  valueNode.textContent = value;
  item.append(labelNode, valueNode);
  return item;
}

function categoryIcon(category) {
  const icon = document.createElement("span");
  icon.className = "category-icon";
  icon.style.setProperty("--category-color", category.color);
  icon.append(iconNode(categoryIconName(category.id)));
  return icon;
}

function categoryIconName(categoryId) {
  return CATEGORY_ICONS[categoryId] || "tag";
}

function iconButton(iconName, label, tone = "") {
  const button = document.createElement("button");
  button.className = `table-action${tone ? ` ${tone}` : ""}`;
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.append(iconNode(iconName));
  return button;
}

function emptyState(title, message) {
  const empty = document.createElement("div");
  empty.className = "empty-state";
  const icon = iconNode("info");
  const titleNode = document.createElement("strong");
  titleNode.textContent = title;
  const messageNode = document.createElement("span");
  messageNode.textContent = message;
  empty.append(icon, titleNode, messageNode);
  return empty;
}

function reportParagraph(...parts) {
  const paragraph = document.createElement("p");
  paragraph.append(...parts);
  return paragraph;
}

function strongText(value) {
  const strong = document.createElement("strong");
  strong.textContent = value;
  return strong;
}

function textNode(value) {
  const span = document.createElement("span");
  span.textContent = value;
  return span;
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
  button.setAttribute("aria-busy", String(busy));
}

function setButtonContent(button, iconName, label) {
  const children = [iconNode(iconName)];
  if (label) children.push(textNode(label));
  button.replaceChildren(...children);
  refreshIcons();
}

function setMessage(node, message, tone = "") {
  node.textContent = message || "";
  node.classList.toggle("is-error", tone === "error");
  node.classList.toggle("is-success", tone === "success");
}

function showToast(message, options = {}) {
  window.clearTimeout(toastTimer);
  els.toastMessage.textContent = message;
  activeToastAction = typeof options.action === "function" ? options.action : null;
  els.toastAction.textContent = options.actionLabel || "";
  els.toastAction.classList.toggle("hidden", !activeToastAction);
  els.toast.classList.remove("hidden");
  toastTimer = window.setTimeout(hideToast, options.duration || 5200);
}

function hideToast() {
  window.clearTimeout(toastTimer);
  els.toast.classList.add("hidden");
  activeToastAction = null;
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

function userHasProvider(providerId) {
  return state.user?.providerData?.some((provider) => provider.providerId === providerId) === true;
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
  const url = String(value || "").trim();
  if (!url) return "";
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.href.slice(0, 500) : "";
  } catch {
    return "";
  }
}

function setProfileImage(image, fallback, url) {
  if (!url) {
    image.classList.add("hidden");
    fallback.classList.remove("hidden");
    image.removeAttribute("src");
    return;
  }
  image.src = url;
  image.classList.remove("hidden");
  fallback.classList.add("hidden");
  image.onerror = () => {
    image.classList.add("hidden");
    fallback.classList.remove("hidden");
  };
}

function setInputValueUnlessFocused(input, value) {
  if (document.activeElement !== input) input.value = value;
}

function setMoney(node, value) {
  node.textContent = displayMoney(value);
  node.dataset.value = String(value);
}

function displayMoney(value) {
  return state.valuesHidden ? "R$ ••••" : formatMoney(value);
}

function formatSignedMoney(transaction) {
  if (state.valuesHidden) return `${transaction.direction === "income" ? "+" : "-"} R$ ••••`;
  return `${transaction.direction === "income" ? "+" : "-"} ${formatMoney(transaction.amount)}`;
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function parseMoneyInput(value) {
  const raw = String(value || "").trim().replace(/\s/g, "");
  if (!raw) return Number.NaN;
  const hasComma = raw.includes(",");
  const hasDot = raw.includes(".");
  let normalized = raw;

  if (hasComma && hasDot) {
    normalized = raw.lastIndexOf(",") > raw.lastIndexOf(".")
      ? raw.replace(/\./g, "").replace(",", ".")
      : raw.replace(/,/g, "");
  } else if (hasComma) {
    normalized = raw.replace(",", ".");
  }

  normalized = normalized.replace(/[^0-9.]/g, "");
  if ((normalized.match(/\./g) || []).length > 1) return Number.NaN;
  return Number.parseFloat(normalized);
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

function formatPercent(value, withSign = true) {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    maximumFractionDigits: 1,
    signDisplay: withSign ? "exceptZero" : "never"
  }).format(value);
}

function describeDiff(diff, base, label) {
  if (!base) return "sem base de comparação";
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

function initialsFromName(value) {
  const parts = String(value || "CF").trim().split(/[\s@._-]+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("");
  return initials || "CF";
}

function themeColors() {
  const styles = getComputedStyle(document.documentElement);
  return {
    primary: styles.getPropertyValue("--color-primary").trim(),
    income: styles.getPropertyValue("--color-income").trim(),
    expense: styles.getPropertyValue("--color-expense").trim(),
    border: styles.getPropertyValue("--color-border").trim(),
    text: styles.getPropertyValue("--color-text").trim(),
    muted: styles.getPropertyValue("--color-text-secondary").trim()
  };
}

function isViewVisible(node) {
  return node?.offsetParent !== null;
}

function normalizeAngle(angle) {
  const full = Math.PI * 2;
  return ((angle % full) + full) % full;
}

function angleWithinSlice(angle, start, end) {
  return start <= end ? angle >= start && angle <= end : angle >= start || angle <= end;
}

function viewFromHash() {
  const view = window.location.hash.replace(/^#/, "");
  return VALID_VIEWS.has(view) ? view : "dashboard";
}

function readBooleanStorage(key) {
  try {
    return localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function authErrorMessage(error) {
  const code = error?.code || "";
  const messages = {
    "auth/email-already-in-use": "Esse email já está cadastrado.",
    "auth/invalid-email": "Email inválido.",
    "auth/invalid-credential": "Email ou senha incorretos.",
    "auth/missing-password": "Informe sua senha atual.",
    "auth/popup-closed-by-user": "A janela do Google foi fechada antes da conclusão.",
    "auth/provider-already-linked": "Essa conta Google já está conectada.",
    "auth/credential-already-in-use": "Essa conta Google já está vinculada a outro usuário.",
    "auth/too-many-requests": "Muitas tentativas. Aguarde alguns minutos.",
    "auth/weak-password": "A senha precisa ser mais forte.",
    "auth/user-mismatch": "Confirme usando a mesma conta conectada ao CtrlFinance.",
    "auth/requires-recent-login": "Entre novamente na conta antes de continuar."
  };
  return messages[code] || "Não foi possível concluir a ação. Tente novamente.";
}

function deleteAccountErrorMessage(error) {
  const code = error?.code || "";
  if (code.startsWith("auth/")) return authErrorMessage(error);
  if (code === "functions/failed-precondition") return "A confirmação de identidade expirou. Tente novamente.";
  if (code === "functions/not-found") return "O serviço de exclusão ainda não foi publicado no Firebase.";
  if (code === "functions/unauthenticated") return "Sua sessão expirou. Entre novamente antes de apagar a conta.";
  return "Não foi possível concluir a exclusão. Tente novamente para retomar a operação com segurança.";
}
