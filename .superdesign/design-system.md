# CtrlFinance Design System

## Produto e arquitetura

CtrlFinance e uma SPA financeira pessoal em HTML, CSS e JavaScript puro, hospedada no GitHub Pages. Firebase Auth autentica por email/senha e Google; Firestore persiste perfil, categorias e transacoes; Cloud Functions enviam alertas via SendGrid. O redesign deve preservar IDs DOM, campos Firestore, calculos, validacoes, estados de autenticacao e contratos de backend sempre que possivel.

O sistema possui autenticacao, verificacao de email, dashboard, transacoes, categorias, relatorios e uma nova tela de perfil. A navegacao ocorre por views internas, sem reload.

## Identidade

- Nome: CtrlFinance.
- Ativo oficial: `.superdesign/assets/logoCtrlFinance.svg`.
- Nunca redesenhar, distorcer, rasterizar ou substituir a logo.
- Personalidade: fintech moderna, direta, confiavel e humana.
- Evitar aparencia generica, gradientes excessivos, glassmorphism, brilhos e decoracao sem funcao.

## Tokens globais

### Claro

| Token | Valor |
| --- | --- |
| color-primary | #7C3AED |
| color-primary-hover | #6D28D9 |
| color-primary-soft | #EDE9FE |
| color-bg | #F7F7FA |
| color-surface | #FFFFFF |
| color-surface-secondary | #F1F2F6 |
| color-text | #17131F |
| color-text-secondary | #667085 |
| color-border | #E2E4EA |
| color-income | #10B981 |
| color-expense | #EF4444 |
| color-warning | #F59E0B |

### Escuro

| Token | Valor |
| --- | --- |
| color-primary | #8B5CF6 |
| color-primary-hover | #A78BFA |
| color-primary-soft | #2E2052 |
| color-bg | #0D0B12 |
| color-surface | #17131F |
| color-surface-secondary | #211B2B |
| color-text | #F8F7FB |
| color-text-secondary | #A9A3B3 |
| color-border | #302A3A |
| color-income | #34D399 |
| color-expense | #F87171 |
| color-warning | #FBBF24 |

### Forma, profundidade e espacamento

- Card radius: 16px; superficies grandes podem usar 20px.
- Controles e botoes: 12px a 14px.
- Dock inferior: 18px.
- Sombras: leves, naturais e curtas; nenhuma sombra colorida intensa.
- Escala espacial: 4, 8, 12, 16, 20, 24, 32, 40, 48.
- Area interativa minima: 44x44px.
- Largura de conteudo desktop: maximo aproximado de 1440px, centralizado.
- Safe area: usar `env(safe-area-inset-bottom)`.

## Tipografia

- Usar a pilha do sistema existente para desempenho e consistencia.
- Texto base mobile: 16px para inputs, evitando zoom no iOS.
- Titulos compactos e hierarquia clara; sem escala de landing page.
- Valores financeiros usam numerais tabulares, peso 700-800 e quebra segura.
- Letter-spacing: 0.

## Navegacao

Dock inferior flutuante em todos os tamanhos com cinco itens: Dashboard, Transacoes, Categorias, Relatorios e Perfil. Mobile: largura quase total, respeita safe area e nunca cobre conteudo. Desktop: compacto, centralizado, com tooltip ou rotulo. O item ativo tem cor primaria, fundo suave e indicador que nao depende apenas de cor.

## Dashboard

- Cabecalho com saudacao, nome, avatar, seletor de periodo, perfil e ocultar/mostrar valores.
- Saldo atual como card de maior prioridade no mobile.
- Entradas, gastos e media em grade responsiva ou scroller com continuidade visivel.
- Graficos reais, interativos, responsivos e legiveis nos dois temas.
- Categoria selecionada destaca fatia e mostra nome, valor e porcentagem.
- Atividade recente: tabela desktop; cards mobile com categoria, descricao, data, pagamento e valor.
- Skeletons, estados vazios e transicoes curtas.

## Transacoes

- Mobile: historico em cards, botao flutuante Adicionar, filtros recolhiveis e formulario em bottom sheet acessivel.
- Desktop: formulario e historico lado a lado, tabela com cabecalho fixo quando necessario.
- Filtros: mes, direcao, categoria e pagamento.
- Mascara BRL que aceite virgula no teclado mobile; validacao em tempo real sem apagar dados.
- Exclusao com confirmacao e desfazer quando tecnicamente seguro.

## Categorias

Cards com nome, cor, icone, tipo e total movimentado. Criar, editar e excluir com estados claros. Informar quando a categoria possui transacoes e impedir exclusao inconsistente conforme as regras existentes.

## Relatorios

Filtros de periodo, resumo, comparativos, graficos responsivos, estados de loading/erro/vazio e qualquer exportacao existente preservada.

## Perfil

- Avatar, nome e email reais; nao inventar campos ou dados.
- Editar e salvar com feedback.
- Tema claro, escuro ou sistema, persistido.
- Tema aplicado no `head` antes da primeira pintura para evitar flash.
- Sair e area critica separada.
- Apagar conta com duas etapas, explicacao clara e reautenticacao segura. A remocao dos dados deve ocorrer no backend autenticado; nunca via um unico clique no cliente.

## Motion

- Curto e funcional: 140ms a 280ms.
- Entradas com opacidade e deslocamento pequeno; sem animar tudo simultaneamente.
- Transicoes em filtros, graficos, modais, tema, feedback e dock.
- Splash sincronizado ao boot real, sem atraso artificial e apenas na entrada inicial.
- `prefers-reduced-motion: reduce` remove desenho de logo e movimentos, mantendo feedback estatico.
- Sem dependencia obrigatoria de Anime.js; preferir CSS e requestAnimationFrame se suficientes.

## Acessibilidade

HTML semantico, labels associados, foco visivel, teclado completo, aria-label em icon-only, contraste WCAG AA, significado que nao dependa apenas de cor, texto alternativo e dialogos com foco controlado. Graficos devem ter resumo textual acessivel.

## Responsividade

Projetar primeiro em 390x844 e validar 360x800, 430x932, 768x1024, 1366x768 e 1920x1080. Sem scroll horizontal; inputs com 16px; valores nunca cortados; graficos redimensionam; modais cabem no viewport; paginas reservam espaco para o dock.

## Restricoes funcionais

- Nao alterar calculos financeiros, nomes de campos, caminhos Firestore ou contratos de Functions sem necessidade comprovada.
- Nao usar dados ficticios na versao final.
- Preservar criacao de conta, verificacao de email, Google, vinculacao, categorias padrao, CRUD e alertas.
- Nenhum botao decorativo sem acao.
- Usar somente as cores, fontes, espacamentos e estilos definidos aqui. Nao introduzir cores, fontes ou estilos visuais fora deste sistema.

