# Tema atual

## Parte 1 - Resumo compacto de tokens

### Stack de estilos

- CSS vanilla global em `public/styles.css`.
- Fonte: pilha do sistema `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Tema atual: majoritariamente escuro no shell e claro nas superfícies; ainda não existe seletor de tema.
- Breakpoints atuais: 1120px, 840px e 620px.
- Reduced motion: regra global em `@media (prefers-reduced-motion: reduce)`.

### Tokens atuais

| Token | Valor |
| --- | --- |
| `--bg` | `#0b0a10` |
| `--bg-soft` | `#15121c` |
| `--panel` | `#f8fafc` |
| `--panel-soft` | `#f1f5f9` |
| `--ink` | `#17151f` |
| `--muted` | `#64748b` |
| `--line` | `#e2e8f0` |
| `--purple` | `#7c3aed` |
| `--success` | `#10b981` |
| `--danger` | `#ef4444` |
| `--warning` | `#f59e0b` |
| `--radius` | `8px` |
| `--shadow` | `0 22px 70px rgba(3, 2, 8, 0.38)` |

### Tipografia e espaçamento

- Títulos usam pesos 800-950; valores financeiros recebem maior escala.
- Espaçamentos são definidos diretamente nas regras, sem escala tokenizada.
- Cards atuais usam raio de 8px.
- Áreas de toque variam; o redesign deve normalizar mínimo de 44x44px.

## Parte 2 - Fonte CSS completa

```css
:root {
  color-scheme: dark;
  --bg: #0b0a10;
  --bg-soft: #15121c;
  --panel: #f8fafc;
  --panel-soft: #f1f5f9;
  --ink: #17151f;
  --muted: #64748b;
  --muted-strong: #475569;
  --line: #e2e8f0;
  --line-dark: rgba(255, 255, 255, 0.14);
  --purple: #7c3aed;
  --purple-2: #8b5cf6;
  --lilac: #d8b4fe;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --white: #ffffff;
  --shadow: 0 22px 70px rgba(3, 2, 8, 0.38);
  --radius: 8px;
  --sidebar-width: 244px;
}

* {
  box-sizing: border-box;
}

html {
  min-height: 100%;
  background: var(--bg);
}

body {
  min-height: 100vh;
  margin: 0;
  color: var(--white);
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  letter-spacing: 0;
  background:
    linear-gradient(145deg, rgba(124, 58, 237, 0.18), rgba(11, 10, 16, 0) 34%),
    linear-gradient(180deg, #100e17 0%, #0b0a10 100%);
}

button,
input,
select {
  font: inherit;
}

button {
  border: 0;
}

button:not(:disabled) {
  cursor: pointer;
}

button:disabled,
input:disabled,
select:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

img {
  max-width: 100%;
}

svg.lucide {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
}

.hidden {
  display: none !important;
}

.app-backdrop {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent 72%);
}

.setup-banner {
  position: fixed;
  inset: 16px 16px auto 16px;
  z-index: 20;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 860px;
  margin: 0 auto;
  padding: 12px 14px;
  border: 1px solid rgba(216, 180, 254, 0.35);
  border-radius: var(--radius);
  color: #f8fafc;
  background: rgba(21, 18, 28, 0.92);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(14px);
}

.setup-banner svg {
  flex: 0 0 18px;
  color: var(--lilac);
}

.auth-layout {
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(320px, 440px);
  gap: 22px;
  width: min(1120px, calc(100% - 32px));
  min-height: 100vh;
  margin: 0 auto;
  padding: 44px 0;
  align-items: center;
}

.brand-panel,
.auth-card,
.verify-card,
.panel,
.metric-card,
.report-tile {
  border: 1px solid var(--line-dark);
  border-radius: var(--radius);
}

.brand-panel {
  min-height: 640px;
  padding: clamp(24px, 5vw, 56px);
  color: var(--white);
  background:
    linear-gradient(150deg, rgba(124, 58, 237, 0.2), transparent 44%),
    #15121c;
  box-shadow: var(--shadow);
  overflow: hidden;
}

.brand-lockup,
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  width: 62px;
  height: 62px;
}

.brand-panel h1 {
  margin: 2px 0 0;
  font-size: clamp(2.4rem, 8vw, 5.2rem);
  line-height: 0.92;
}

.brand-copy {
  max-width: 620px;
  margin: 34px 0 0;
  color: #d4d4dd;
  font-size: clamp(1rem, 2vw, 1.24rem);
  line-height: 1.65;
}

.eyebrow {
  margin: 0;
  color: var(--lilac);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.preview-stack {
  display: grid;
  gap: 18px;
  max-width: 520px;
  margin-top: 56px;
}

.preview-total {
  display: grid;
  gap: 6px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius);
  background: rgba(255, 255, 255, 0.08);
}

.preview-total span,
.preview-list span {
  color: #cbd5e1;
}

.preview-total strong {
  font-size: clamp(2rem, 5vw, 3.3rem);
}

.preview-bars {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: end;
  gap: 10px;
  height: 154px;
  padding: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
  background: rgba(11, 10, 16, 0.44);
}

.bar {
  display: block;
  min-height: 32px;
  border-radius: 6px 6px 2px 2px;
  background: var(--purple-2);
}

.bar-one { height: 48%; }
.bar-two { height: 82%; background: var(--lilac); }
.bar-three { height: 62%; }
.bar-four { height: 96%; background: #f8fafc; }
.bar-five { height: 70%; background: #a78bfa; }

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-list span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
}

.preview-list b {
  width: 8px;
  height: 8px;
  border-radius: 99px;
  background: var(--lilac);
}

.auth-card,
.verify-card {
  padding: 24px;
  color: var(--ink);
  background: rgba(248, 250, 252, 0.98);
  box-shadow: var(--shadow);
}

.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  padding: 4px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: #eef2f7;
}

.auth-tab {
  min-height: 44px;
  border-radius: 6px;
  color: var(--muted-strong);
  background: transparent;
  font-weight: 800;
}

.auth-tab.active {
  color: var(--white);
  background: var(--ink);
}

.form-grid {
  display: grid;
  gap: 14px;
  margin-top: 18px;
}

.field {
  display: grid;
  gap: 7px;
  color: var(--muted-strong);
  font-size: 0.84rem;
  font-weight: 800;
}

.field input,
.field select,
.compact-input {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 0 12px;
  color: var(--ink);
  background: var(--white);
  outline: none;
}

.field input:focus,
.field select:focus,
.compact-input:focus {
  border-color: var(--purple-2);
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.16);
}

.inline-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.primary-action,
.ghost-action,
.text-action,
.icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: 46px;
  border-radius: var(--radius);
  font-weight: 900;
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    border-color 160ms ease;
}

.primary-action {
  color: var(--white);
  background: var(--purple);
}

.ghost-action {
  width: 100%;
  border: 1px solid var(--line);
  color: var(--ink);
  background: var(--white);
}

.text-action {
  color: var(--muted-strong);
  background: transparent;
}

.icon-action {
  width: 42px;
  height: 42px;
  min-height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: var(--white);
  background: rgba(255, 255, 255, 0.08);
}

.primary-action:hover,
.ghost-action:hover,
.icon-action:hover {
  transform: translateY(-1px);
}

.divider {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 10px;
  margin: 18px 0;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 700;
}

.divider::before,
.divider::after {
  content: "";
  height: 1px;
  background: var(--line);
}

.form-message {
  min-height: 20px;
  margin: 14px 0 0;
  color: var(--muted-strong);
  font-size: 0.88rem;
  line-height: 1.45;
}

.verify-layout {
  display: grid;
  min-height: 100vh;
  padding: 24px;
  place-items: center;
}

.verify-card {
  width: min(480px, 100%);
  text-align: center;
}

.verify-logo {
  width: 70px;
  height: 70px;
}

.verify-card h2 {
  margin: 16px 0 8px;
  color: var(--ink);
  font-size: 1.8rem;
}

.verify-card p {
  color: var(--muted-strong);
}

.verify-actions {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.shell {
  display: grid;
  grid-template-columns: var(--sidebar-width) minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  padding: 22px;
  border-right: 1px solid var(--line-dark);
  background: rgba(11, 10, 16, 0.78);
  backdrop-filter: blur(18px);
}

.sidebar-logo {
  width: 42px;
  height: 42px;
}

.sidebar-brand span {
  font-size: 1.12rem;
  font-weight: 950;
}

.app-nav {
  display: grid;
  gap: 8px;
  margin-top: 30px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  padding: 0 12px;
  border-radius: var(--radius);
  color: #cbd5e1;
  background: transparent;
  font-weight: 850;
  text-align: left;
}

.nav-item.active,
.nav-item:hover {
  color: var(--white);
  background: rgba(139, 92, 246, 0.28);
}

.workspace {
  min-width: 0;
  padding: 22px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.topbar h2 {
  margin: 4px 0 0;
  font-size: clamp(1.7rem, 4vw, 2.7rem);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.identity-pill {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  max-width: min(40vw, 360px);
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius);
  color: #e2e8f0;
  background: rgba(255, 255, 255, 0.08);
}

.identity-pill span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-photo {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.view {
  display: none;
}

.view.active {
  display: block;
}

.metric-grid,
.report-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.metric-card,
.report-tile {
  display: grid;
  gap: 7px;
  min-height: 126px;
  padding: 18px;
  color: var(--ink);
  background: var(--panel);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
}

.metric-card.accent {
  color: var(--white);
  background: var(--purple);
}

.metric-card span,
.report-tile span {
  color: var(--muted-strong);
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
}

.metric-card.accent span,
.metric-card.accent small {
  color: #eee7ff;
}

.metric-card strong,
.report-tile strong {
  font-size: clamp(1.35rem, 2.3vw, 2.1rem);
  line-height: 1.1;
  word-break: break-word;
}

.metric-card small,
.report-tile small {
  color: var(--muted);
  font-weight: 750;
}

.dashboard-grid,
.split-grid,
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
  gap: 14px;
  margin-top: 14px;
}

.split-grid {
  grid-template-columns: 1fr 1fr;
}

.content-grid {
  grid-template-columns: minmax(300px, 380px) minmax(0, 1fr);
}

.panel {
  min-width: 0;
  padding: 18px;
  color: var(--ink);
  background: rgba(248, 250, 252, 0.98);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.18);
}

.wide-panel {
  min-height: 360px;
}

.panel-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.panel-heading h3 {
  margin: 3px 0 0;
  color: var(--ink);
  font-size: 1.12rem;
}

.chart-canvas {
  display: block;
  width: 100%;
  height: 300px;
  border-radius: var(--radius);
  background: #f8fafc;
}

.compact-chart {
  height: 230px;
}

.insight-row {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.insight-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius);
  color: var(--ink);
  background: var(--panel-soft);
  font-weight: 800;
}

.insight-pill small {
  color: var(--muted);
}

.table-shell {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
}

.data-table {
  width: 100%;
  min-width: 640px;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  border-bottom: 1px solid var(--line);
  color: var(--ink);
  font-size: 0.88rem;
  text-align: left;
  vertical-align: middle;
}

.data-table th {
  color: var(--muted-strong);
  font-size: 0.74rem;
  font-weight: 950;
  text-transform: uppercase;
  background: #f8fafc;
}

.data-table tr:last-child td {
  border-bottom: 0;
}

.amount-income {
  color: #047857 !important;
  font-weight: 950;
}

.amount-expense {
  color: #b91c1c !important;
  font-weight: 950;
}

.table-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  color: #991b1b;
  background: #fee2e2;
}

.empty-state {
  padding: 22px;
  color: var(--muted);
  font-weight: 750;
  text-align: center;
}

.table-filters {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.compact-input {
  width: auto;
  min-width: 150px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
}

.category-item {
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--white);
}

.category-item header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.category-name {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  color: var(--ink);
  font-weight: 900;
}

.category-name span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.color-dot {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border-radius: 99px;
}

.category-kind {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 800;
}

.category-lock {
  display: inline-flex;
  width: 30px;
  height: 30px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: var(--muted);
  background: var(--panel-soft);
}

.report-panel {
  min-height: calc(100vh - 118px);
}

.report-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 14px;
}

.report-copy {
  display: grid;
  gap: 10px;
  margin: 12px 0 16px;
  color: var(--muted-strong);
  line-height: 1.55;
}

.report-copy strong {
  color: var(--ink);
}

.badge {
  display: inline-flex;
  width: max-content;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 999px;
  color: var(--white);
  background: var(--purple);
  font-size: 0.72rem;
  font-weight: 900;
}

.toast {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 30;
  width: min(380px, calc(100vw - 36px));
  padding: 14px 16px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--radius);
  color: var(--white);
  background: rgba(21, 18, 28, 0.96);
  box-shadow: var(--shadow);
}

@media (max-width: 1120px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dashboard-grid,
  .split-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 840px) {
  .auth-layout {
    grid-template-columns: 1fr;
    align-items: start;
    padding-top: 72px;
  }

  .brand-panel {
    min-height: auto;
  }

  .shell {
    grid-template-columns: 1fr;
    padding-bottom: 82px;
  }

  .sidebar {
    position: fixed;
    inset: auto 12px 12px 12px;
    z-index: 15;
    display: grid;
    height: auto;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: var(--radius);
    background: rgba(11, 10, 16, 0.9);
  }

  .sidebar-brand {
    display: none;
  }

  .app-nav {
    grid-template-columns: repeat(4, 1fr);
    margin: 0;
  }

  .nav-item {
    min-height: 56px;
    justify-content: center;
    padding: 0 6px;
    font-size: 0.72rem;
  }

  .nav-item span {
    display: none;
  }

  .workspace {
    padding: 18px;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .topbar-actions {
    width: 100%;
  }

  .identity-pill {
    max-width: none;
    flex: 1;
  }
}

@media (max-width: 620px) {
  .auth-layout {
    width: min(100% - 22px, 1120px);
    padding-bottom: 20px;
  }

  .brand-panel,
  .auth-card,
  .verify-card,
  .panel {
    padding: 16px;
  }

  .brand-logo {
    width: 50px;
    height: 50px;
  }

  .preview-stack {
    margin-top: 28px;
  }

  .metric-grid,
  .report-grid {
    grid-template-columns: 1fr;
  }

  .metric-card,
  .report-tile {
    min-height: 112px;
  }

  .panel-heading {
    align-items: stretch;
    flex-direction: column;
  }

  .table-filters {
    justify-content: stretch;
  }

  .compact-input {
    width: 100%;
  }

  .inline-fields {
    grid-template-columns: 1fr;
  }

  .chart-canvas {
    height: 260px;
  }

  .compact-chart {
    height: 220px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.001ms !important;
    animation-duration: 0.001ms !important;
  }
}
```

