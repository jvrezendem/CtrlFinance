# Rotas e navegacao atuais

## Resumo

O projeto nao possui React Router, Vue Router ou rotas de arquivo. O GitHub Pages entrega apenas `/` e todas as telas sao estados internos da SPA.

| URL publica | View interna | Marcador DOM | Layout |
| --- | --- | --- | --- |
| `/` | Autenticacao | `#auth-screen` | `.auth-layout` |
| `/` | Confirmacao de email | `#verify-screen` | `.verify-layout` |
| `/` | Dashboard | `#dashboard-view` | `.shell > .workspace` |
| `/` | Transacoes | `#transactions-view` | `.shell > .workspace` |
| `/` | Categorias | `#categories-view` | `.shell > .workspace` |
| `/` | Relatorio | `#report-view` | `.shell > .workspace` |
| planejada | Perfil | ainda inexistente | integrar ao mesmo shell |

## Ativacao de view

```js
function activateView(view) {
  state.activeView = view;
  els.navItems.forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  els.views.forEach((item) => item.classList.toggle("active", item.id === `${view}-view`));
  drawCharts();
}
```

## Contrato de navegacao

Os botoes atuais usam `data-view="dashboard|transactions|categories|report"`. O redesign pode trocar a sidebar por um dock inferior, mas deve preservar os identificadores existentes e adicionar `profile` sem quebrar os demais estados.

