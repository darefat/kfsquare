# Encrypted Secrets (dotenvx)

Secrets like `MAILGUN_API_KEY` are stored **encrypted** in `.env.production` using
[dotenvx](https://dotenvx.com/encryption) public-key encryption. That file is safe
to commit to a public GitHub repo — it contains only ciphertext plus a public key.

## Files

| File             | Committed? | Contents                                            |
|------------------|-----------|-----------------------------------------------------|
| `.env.production`| YES       | Encrypted values + `DOTENV_PUBLIC_KEY_PRODUCTION`   |
| `.env.keys`      | NO (ignored) | `DOTENV_PRIVATE_KEY_PRODUCTION` — decryption key |
| `.env`           | NO (ignored) | Local plaintext dev env                          |

The private key in `.env.keys` NEVER goes in git. Store it in your password
manager and set it as an environment variable / secret on your host.

## Running the server (decrypts at runtime)

```bash
npm run start:secure
```

This runs `dotenvx run -f .env.production -- node server.js`. dotenvx finds the
private key (from `.env.keys` locally, or the `DOTENV_PRIVATE_KEY_PRODUCTION`
environment variable in production) and decrypts values into `process.env`.

## Production / CI deployment

Do NOT copy `.env.keys` to the server. Instead set the private key as a secret:

```bash
export DOTENV_PRIVATE_KEY_PRODUCTION="<value from .env.keys>"
npm run start:secure
```

## Adding / changing a secret

```bash
# add or edit a value in plaintext, then re-encrypt:
npx dotenvx set MAILGUN_DOMAIN mg.kfsquare.com -f .env.production
# (dotenvx set encrypts automatically)

# or edit the file then:
npx dotenvx encrypt -f .env.production
```

## Reading a value (for debugging)

```bash
npx dotenvx get MAILGUN_API_KEY -f .env.production
```
