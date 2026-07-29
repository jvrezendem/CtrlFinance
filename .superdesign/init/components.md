# Componentes atuais

## Arquitetura de UI

- Framework: nenhum. O frontend é uma SPA em HTML semântico, CSS vanilla e JavaScript ES Modules.
- Biblioteca de componentes: nenhuma. Os padrões de interface vivem em `public/index.html` e `public/styles.css`.
- Ícones: biblioteca local inspirada em Lucide, renderizada por `public/src/icons.js`.
- Gráficos: Canvas 2D manual, sem dependência externa.
- Componentes reutilizáveis atuais: botões, campos, cards, painéis, tabelas, badges, toast e estados vazios definidos por classes CSS e helpers DOM.

## IconSystem

- Source: `public/src/icons.js`
- Descrição: biblioteca única de ícones usada por toda a aplicação.
- Props: `name`, `size`, `strokeWidth`, `className`.

```js
const ICONS = {
  "arrow-left-right": [
    ["path", { d: "M8 3 4 7l4 4" }],
    ["path", { d: "M4 7h16" }],
    ["path", { d: "m16 21 4-4-4-4" }],
    ["path", { d: "M20 17H4" }]
  ],
  bell: [
    ["path", { d: "M10.3 21a2 2 0 0 0 3.4 0" }],
    ["path", { d: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" }]
  ],
  chrome: [
    ["circle", { cx: "12", cy: "12", r: "10" }],
    ["circle", { cx: "12", cy: "12", r: "4" }],
    ["path", { d: "M21.2 8H12" }],
    ["path", { d: "M3.2 8 8 16.3" }],
    ["path", { d: "m15.7 16.3 4.8-8.3" }]
  ],
  "file-text": [
    ["path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }],
    ["path", { d: "M14 2v6h6" }],
    ["path", { d: "M16 13H8" }],
    ["path", { d: "M16 17H8" }],
    ["path", { d: "M10 9H8" }]
  ],
  "layout-dashboard": [
    ["rect", { x: "3", y: "3", width: "7", height: "9", rx: "1" }],
    ["rect", { x: "14", y: "3", width: "7", height: "5", rx: "1" }],
    ["rect", { x: "14", y: "12", width: "7", height: "9", rx: "1" }],
    ["rect", { x: "3", y: "16", width: "7", height: "5", rx: "1" }]
  ],
  link: [
    ["path", { d: "M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1" }],
    ["path", { d: "M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20.1l1.1-1.1" }]
  ],
  lock: [
    ["rect", { x: "3", y: "11", width: "18", height: "11", rx: "2" }],
    ["path", { d: "M7 11V7a5 5 0 0 1 10 0v4" }]
  ],
  "log-in": [
    ["path", { d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" }],
    ["path", { d: "m10 17 5-5-5-5" }],
    ["path", { d: "M15 12H3" }]
  ],
  "log-out": [
    ["path", { d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }],
    ["path", { d: "m16 17 5-5-5-5" }],
    ["path", { d: "M21 12H9" }]
  ],
  "mail-check": [
    ["path", { d: "M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9" }],
    ["path", { d: "m22 7-8.9 5.7a2 2 0 0 1-2.2 0L2 7" }],
    ["path", { d: "m16 19 2 2 4-4" }]
  ],
  plus: [
    ["path", { d: "M5 12h14" }],
    ["path", { d: "M12 5v14" }]
  ],
  "refresh-cw": [
    ["path", { d: "M3 12a9 9 0 0 1 15-6.7L21 8" }],
    ["path", { d: "M21 3v5h-5" }],
    ["path", { d: "M21 12a9 9 0 0 1-15 6.7L3 16" }],
    ["path", { d: "M3 21v-5h5" }]
  ],
  "shield-alert": [
    ["path", { d: "M20 13c0 5-3.5 7.5-7.7 8.8a1 1 0 0 1-.6 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.2-2.6a1.3 1.3 0 0 1 1.6 0C14.5 3.8 17 5 19 5a1 1 0 0 1 1 1z" }],
    ["path", { d: "M12 8v4" }],
    ["path", { d: "M12 16h.01" }]
  ],
  tag: [
    ["path", { d: "M12.6 2H5a2 2 0 0 0-2 2v7.6a2 2 0 0 0 .6 1.4l7.4 7.4a2 2 0 0 0 2.8 0l6.6-6.6a2 2 0 0 0 0-2.8L13.9 2.6A2 2 0 0 0 12.6 2z" }],
    ["path", { d: "M7.5 7.5h.01" }]
  ],
  tags: [
    ["path", { d: "M13.2 2H5a2 2 0 0 0-2 2v8.2a2 2 0 0 0 .6 1.4l7 7a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8l-6-6A2 2 0 0 0 13.2 2z" }],
    ["path", { d: "M7.5 7.5h.01" }],
    ["path", { d: "m17 5 4 4" }]
  ],
  "trash-2": [
    ["path", { d: "M3 6h18" }],
    ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ["path", { d: "M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" }],
    ["path", { d: "M10 11v6" }],
    ["path", { d: "M14 11v6" }]
  ],
  "user-plus": [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
    ["path", { d: "M19 8v6" }],
    ["path", { d: "M22 11h-6" }]
  ]
};

export function iconNode(name) {
  const node = document.createElement("i");
  node.dataset.lucide = name;
  return node;
}

export function createIcons(root = document) {
  root.querySelectorAll("i[data-lucide]").forEach((placeholder) => {
    const name = placeholder.dataset.lucide;
    const icon = ICONS[name];
    if (!icon) return;
    placeholder.replaceWith(svgNode(name, icon));
  });
}

function svgNode(name, icon) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", `lucide lucide-${name}`);
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  icon.forEach(([tag, attrs]) => {
    const child = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => child.setAttribute(key, value));
    svg.append(child);
  });

  return svg;
}
```

## DataTable e EmptyState

- Source: `public/src/app.js`
- Descrição: renderizadores completos de tabelas de transações, tabela simples e estado vazio.

```js
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
```

## ButtonBusy, Toast e IconButton

- Source: `public/src/app.js`
- Descrição: feedback de carregamento, troca de conteúdo de botões e mensagens globais.

```js
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
```

## Primitivos visuais

Os elementos `.primary-action`, `.ghost-action`, `.icon-action`, `.field`, `.metric-card`, `.panel`, `.badge`, `.toast` e `.empty-state` são primitivos CSS globais. A implementação completa está em `.superdesign/init/theme.md`.

