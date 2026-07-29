# Componentes extraiveis

## AppNavigation
- Source: `public/index.html` e `public/styles.css`
- Category: layout
- Description: navegacao principal atual; sera convertida em dock inferior flutuante.
- Extractable props: `activeItem`, `showLabels`.
- Hardcoded: rotulos Dashboard, Transacoes, Categorias, Relatorios; icones da biblioteca local.

## Topbar
- Source: `public/index.html`
- Category: layout
- Description: saudacao, identidade do usuario, vinculacao Google e sair.
- Extractable props: `userName`, `userEmail`, `photoURL`, `showValues`.
- Hardcoded: estrutura, icones e estilos.

## MetricCard
- Source: `public/index.html` e `public/styles.css`
- Category: basic
- Description: rotulo, valor financeiro e nota contextual.
- Extractable props: `label`, `value`, `note`, `tone`, `featured`.
- Hardcoded: tipografia, espacamento, estado de carregamento.

## Panel
- Source: `public/index.html` e `public/styles.css`
- Category: basic
- Description: superficie para graficos, formularios, tabelas e relatorios.
- Extractable props: `title`, `eyebrow`, `loading`, `empty`.
- Hardcoded: borda, sombra e raio.

## TransactionList
- Source: `public/src/app.js`
- Category: basic
- Description: tabela desktop e lista responsiva de transacoes.
- Extractable props: `items`, `showDelete`, `compact`, `onOpen`.
- Hardcoded: colunas, formatos brasileiros e tons semanticos.

## FormField
- Source: `public/index.html` e `public/styles.css`
- Category: basic
- Description: label visivel, controle e mensagem de validacao.
- Extractable props: `label`, `error`, `required`, `disabled`.
- Hardcoded: foco, altura minima e tipografia.

## ModalBottomSheet
- Source: inexistente; novo componente necessario.
- Category: layout
- Description: modal desktop e bottom sheet mobile para formularios e confirmacoes.
- Extractable props: `open`, `title`, `dismissible`, `busy`.
- Hardcoded: overlay, animacao e foco preso.

## ThemeControl
- Source: inexistente; novo componente necessario.
- Category: basic
- Description: seletor claro, escuro ou sistema com previsualizacao.
- Extractable props: `value`.
- Hardcoded: opcoes, icones e estados.

