# MyMatrix

MyMatrix is a private NuxtHub vault designed for deployment to Cloudflare Workers. It stores account recovery information, authenticator secrets, backup codes, server records, domain renewal dates, and renewal reminders.

The app is built as a multi-user system. The first registered user becomes `admin`; after that, only an authenticated admin can create additional users.

## Features

- Username/password login with HTTP-only session cookies.
- First-user bootstrap flow for private deployment.
- Multi-user data isolation through `owner_id`.
- Logical deletion on every table through `is_deleted` and `deleted_at`.
- Common audit fields on every table:
  - `created_by`
  - `created_at`
  - `updated_by`
  - `updated_at`
  - `is_deleted`
  - `deleted_at`
- Plain SQLite storage for vault records.
- Extensible internationalization through `@nuxtjs/i18n`.
- Private dashboard for:
  - authenticator secrets
  - backup code sets
  - server IP/provider records
  - domain expiry and renewal records
  - upcoming reminders

## Tech Stack

- Nuxt 4
- NuxtHub
- Nuxt i18n
- Cloudflare Workers
- Cloudflare D1 / NuxtHub SQLite
- Drizzle ORM
- Web Crypto API for password hashing

## Setup

Install dependencies:

```bash
pnpm install
```

Run locally:

```bash
pnpm dev
```

Open `http://localhost:3000`, switch to `Register`, and create the first user.

## Database

The schema lives in `server/db/schema.sqlite.ts`. The migration for the private vault is in:

```text
server/db/migrations/sqlite/0001_private_vault.sql
```

Main tables:

| Table | Purpose |
| --- | --- |
| `users` | Login users, usernames, and roles. |
| `sessions` | Hashed session tokens and expiry timestamps. |
| `authenticators` | TOTP issuer, account name, secret, and notes. |
| `backup_code_sets` | Provider, account name, backup codes, and notes. |
| `server_records` | Server name, provider, IP, panel URL, expiry/reminder dates, and notes. |
| `domain_records` | Domain, registrar, account, expiry/reminder dates, auto-renew flag, and notes. |
| `messages` | Legacy template message table, now also using audit and soft-delete fields. |

## Internationalization

The UI uses `@nuxtjs/i18n` with locale files in:

```text
i18n/locales/
```

Current locales:

- `zh-CN`
- `en`

To add another language, add a new locale JSON file and register it in the `i18n.locales` array in `nuxt.config.ts`.

## API Routes

Authentication:

| Route | Method | Description |
| --- | --- | --- |
| `/api/auth/me` | `GET` | Return the current session user. |
| `/api/auth/register` | `POST` | Create the first admin or create users as admin. |
| `/api/auth/login` | `POST` | Login and create a session cookie. |
| `/api/auth/logout` | `POST` | Soft-delete the current session and clear the cookie. |

Vault:

| Route | Method | Description |
| --- | --- | --- |
| `/api/vault/authenticators` | `GET`, `POST` | List or create authenticator records. |
| `/api/vault/authenticators/:id` | `PUT`, `DELETE` | Update or soft-delete an authenticator record. |
| `/api/vault/backup-codes` | `GET`, `POST` | List or create backup code sets. |
| `/api/vault/backup-codes/:id` | `PUT`, `DELETE` | Update or soft-delete a backup code set. |
| `/api/vault/servers` | `GET`, `POST` | List or create server records. |
| `/api/vault/servers/:id` | `PUT`, `DELETE` | Update or soft-delete a server record. |
| `/api/vault/domains` | `GET`, `POST` | List or create domain records. |
| `/api/vault/domains/:id` | `PUT`, `DELETE` | Update or soft-delete a domain record. |
| `/api/vault/reminders?days=45` | `GET` | Return server/domain reminders within the requested window. |

## Development Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Cloudflare Deployment

Deploy to Cloudflare:

```bash
pnpm deploy-cloudflare
```

The deployment script builds with the Cloudflare Nitro preset, applies D1 migrations remotely, and then deploys with Wrangler using the NuxtHub-generated Cloudflare config.

Cloudflare resource bindings are configured in `nuxt.config.ts` so NuxtHub can generate `.output/server/wrangler.json` at build time:

- `DB` for D1 SQLite
- `KV` for redirect data
- `CACHE` for cached responses
- `BLOB` for R2-backed Blob storage

`wrangler.jsonc` is reserved for non-Hub Cloudflare options such as observability.

Before using the live app, confirm these are done:

- The D1 migration `0001_private_vault.sql` has been applied.
- The first account is created immediately after deployment.
- The app is protected by Cloudflare Access, a private route, or another outer access control layer if it is reachable from the public internet.
