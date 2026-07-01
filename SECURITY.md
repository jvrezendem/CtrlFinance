# Segurança do CtrlFinance

## Modelo de dados

Cada usuário possui dados em `users/{uid}`. Categorias, transações e alertas ficam em subcoleções desse documento. As regras negam acesso cruzado e só permitem leitura/escrita quando `request.auth.uid == uid` e `request.auth.token.email_verified == true`.

## Segredos

Não coloque chaves privadas no repositório. A chave SendGrid deve ser configurada com:

```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

No GitHub Actions, use secrets para a service account Firebase. A configuração Web do Firebase pode ser pública, mas as regras Firestore e os domínios autorizados precisam estar corretos.

## Checklist antes de publicar

- Provedores Email/Password e Google habilitados no Firebase Auth.
- Domínio do GitHub Pages adicionado em Authorized domains.
- Firestore Rules publicadas.
- SendGrid sender verificado.
- `APP_URL` apontando para a URL real do GitHub Pages.
- Branch protection ou revisão obrigatória para mudanças em `firestore.rules`, `functions/` e workflows.
