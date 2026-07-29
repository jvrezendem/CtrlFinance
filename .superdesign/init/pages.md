# Paginas e dependencias

## / - Aplicacao CtrlFinance

Entry: `public/index.html`

Dependencies:
- `public/styles.css`
- `public/assets/logo.svg`
- `public/src/app.js`
  - `public/src/firebase-config.js`
  - `public/src/icons.js`
  - Firebase Web SDK 10.12.5 carregado dinamicamente de `www.gstatic.com`

## Tela de autenticacao

Entry: `public/index.html#auth-screen`

Dependencies:
- `public/styles.css`: auth-layout, brand-panel, auth-card, auth-tabs, form-grid
- `public/src/app.js`: setAuthMode, handleEmailAuth, handleGoogleAuth, handleAuthStateChanged
- Firebase Auth: email/senha, verificacao de email, Google popup e vinculacao de provedor

## Dashboard

Entry: `public/index.html#dashboard-view`

Dependencies:
- `public/styles.css`: metric-grid, metric-card, dashboard-grid, panel, chart-canvas, table-shell
- `public/src/app.js`: renderDashboard, renderCategoryExtremes, drawCashflowChart, drawCategoryChart, renderTransactionTable
- `public/src/icons.js`

## Transacoes

Entry: `public/index.html#transactions-view`

Dependencies:
- `public/styles.css`: content-grid, form-panel, list-panel, form-grid, field, table-filters, data-table
- `public/src/app.js`: handleTransactionSubmit, renderTransactionHistory, renderTransactionTable, deleteTransaction, parseMoneyInput
- Firestore: `users/{uid}/transactions/{transactionId}`

## Categorias

Entry: `public/index.html#categories-view`

Dependencies:
- `public/styles.css`: content-grid, category-grid, category-item, color-dot, category-kind
- `public/src/app.js`: handleCategorySubmit, renderCategories, deleteCategory
- Firestore: `users/{uid}/categories/{categoryId}`

## Relatorios

Entry: `public/index.html#report-view`

Dependencies:
- `public/styles.css`: report-panel, report-grid, report-tile, report-copy, chart-canvas
- `public/src/app.js`: renderReport, renderCategoryComparisonTable, drawReportChart
- Dados derivados das transacoes ja carregadas

## Perfil planejado

Nao existe no codigo atual. Deve reutilizar o shell, Firebase Auth, documento `users/{uid}` e as regras atuais, com alteracoes de backend somente quando indispensaveis para exclusao segura da conta.

