# Secret Management

KFSQUARE does not store API keys, passwords, connection credentials, or private keys in the repository. Production secrets must be injected at runtime through the hosting provider's secret manager.

## Repository policy

| File or location | Committed? | Purpose |
|---|---:|---|
| `.env.example` | Yes | Names and non-secret placeholders only |
| `.env.compose.example` | Yes | Names and non-secret placeholders only |
| `.env`, `.env.*` | No | Ignored local runtime configuration |
| `.env.keys` | No | Ignored private key material |
| Render dashboard | No | Production secret values |

Never place a real secret in HTML, browser JavaScript, logs, documentation examples, Docker images, shell history, or Git commits. Public browser configuration may contain only non-secret values such as an API origin.

## Required production setup

Set sensitive variables directly in the hosting dashboard or deployment secret store. Common examples include:

- `MONGODB_URI`
- `MAILGUN_API_KEY`
- `SESSION_SECRET`
- `JWT_SECRET`
- `ADMIN_PASSWORD`

Start the server normally after the platform injects those variables:

```bash
npm start
```

## Local development

Create an ignored `.env` file from the template, then supply local values without committing the file:

```bash
cp .env.example .env
npm run dev
```

Confirm ignore rules before working with a local secret file:

```bash
git check-ignore .env .env.local .env.keys
```

## If exposure is suspected

1. Revoke and rotate the credential immediately.
2. Remove it from the current tree and Git history.
3. Update the hosting secret store.
4. Review provider access logs.
5. Run the repository secret scan before pushing again.
