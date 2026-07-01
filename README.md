# CtrlFinance

CtrlFinance é um site de controle financeiro para GitHub Pages com backend Firebase. O frontend é estático, responsivo e pode ficar em um repositório público; autenticação, banco de dados seguro e notificações por email ficam no Firebase.

## Funcionalidades

- Conta com email e senha, verificação por email e acesso/conexão com Google.
- Categorias de ganhos e gastos, incluindo: salário, investimentos, supermercado, conta de energia, internet, aluguel, gasolina e conta de água.
- Cadastro de transferências com categoria, valor, data, descrição e tipo: dinheiro, Pix, débito ou crédito.
- Dashboard com saldo, entradas, gastos, média mensal, gráficos, tabelas de entradas/gastos, gastos por categoria e categorias com maior/menor gasto.
- Relatório mensal com comparação contra mês anterior e média mensal.
- Emails automáticos quando o gasto do mês supera a média mensal, supera o mês anterior ou uma categoria supera o mesmo gasto do mês anterior.

## Estrutura

```text
public/                    Site estático para GitHub Pages
public/src/app.js          SPA, gráficos, validações e integração Firebase
public/src/firebase-config.js
functions/                 Cloud Functions de alertas por email
firestore.rules            Regras de segurança do banco
.github/workflows/         Deploy do Pages e do backend Firebase
```

## Configuração Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/).
2. Em Authentication, habilite os provedores `Email/Password` e `Google`.
3. Em Authentication > Settings > Authorized domains, adicione:
   - `localhost`
   - o domínio do GitHub Pages, como `seu-usuario.github.io`
4. Crie o Firestore em modo produção.
5. Copie a configuração Web do Firebase para `public/src/firebase-config.js`, mantendo o mesmo formato de `public/src/firebase-config.example.js`.
6. Instale o Firebase CLI e faça login:

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

7. Configure o segredo do SendGrid para envio dos alertas:

```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

8. Crie `functions/.env` localmente com os parâmetros públicos das Functions:

```bash
SENDER_EMAIL=alertas@seudominio.com
APP_URL=https://seu-usuario.github.io/seu-repositorio/
```

9. Publique regras, índices e Functions:

```bash
npm install --prefix functions
firebase deploy --only firestore:rules,firestore:indexes,functions
```

## Deploy no GitHub Pages

O workflow `.github/workflows/github-pages.yml` publica a pasta `public/`.

No GitHub, habilite Pages com source `GitHub Actions`. Depois faça push na branch `main`.

Para o workflow do backend Firebase, configure estes itens no repositório:

- Secret `FIREBASE_PROJECT_ID`: ID do projeto Firebase.
- Secret `FIREBASE_SERVICE_ACCOUNT`: JSON de uma service account com permissão de deploy.
- Variable `SENDER_EMAIL`: email remetente verificado no SendGrid.
- Variable `APP_URL`: URL pública do GitHub Pages.

O segredo `SENDGRID_API_KEY` deve existir no Firebase Secret Manager antes do deploy das Functions.

## Rodar localmente

Com placeholders no Firebase, a página abre em modo preview local. Para usar autenticação real, preencha `public/src/firebase-config.js`.

```bash
python -m http.server 4173 --directory public
```

Acesse `http://localhost:4173`.

## Segurança aplicada

- Firestore Rules isolam dados por `uid` e exigem `email_verified`.
- Validação de tamanho, tipo, valores monetários, datas, tipos de pagamento e categorias no cliente e nas regras.
- Emails são enviados somente por Cloud Functions; a chave SendGrid nunca vai para o frontend.
- CSP via meta tag no GitHub Pages e headers extras caso o mesmo `public/` seja hospedado no Firebase Hosting.
- Dados do usuário são renderizados com `textContent`; o app evita interpolar HTML com conteúdo do usuário.
- O repositório pode ser público porque a configuração Firebase Web não é segredo. Secrets reais ficam no Firebase/GitHub.
