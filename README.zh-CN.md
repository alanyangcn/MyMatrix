# MyMatrix

MyMatrix 是一个面向 Cloudflare Workers 部署的私有 NuxtHub 资料库，用于保存账号恢复信息、身份验证器密钥、备用验证码、服务器记录、域名到期时间和续费提醒。

项目支持多用户。首次注册的用户会自动成为 `admin`；之后只有已登录的 admin 才能继续创建新用户。

## 功能特性

- 用户名/密码登录，使用 HTTP-only session cookie。
- 首个用户初始化流程，适合私有部署。
- 通过 `owner_id` 做多用户数据隔离。
- 所有表都使用逻辑删除，通过 `is_deleted` 和 `deleted_at` 标记删除状态。
- 所有表都包含统一审计字段：
  - `created_by`
  - `created_at`
  - `updated_by`
  - `updated_at`
  - `is_deleted`
  - `deleted_at`
- 资料记录以普通 SQLite 字段保存。
- 使用 `@nuxtjs/i18n` 提供可扩展的多语言支持。
- 私有控制台支持管理：
  - 身份验证器密钥
  - 备用验证码组
  - 服务器 IP / 服务商记录
  - 域名到期和续费记录
  - 近期提醒

## 技术栈

- Nuxt 4
- NuxtHub
- Nuxt i18n
- Cloudflare Workers
- Cloudflare D1 / NuxtHub SQLite
- Drizzle ORM
- Web Crypto API，用于密码哈希

## 本地开发

安装依赖：

```bash
pnpm install
```

启动开发服务器：

```bash
pnpm dev
```

打开 `http://localhost:3000`，切换到“注册”，创建第一个用户。

## 数据库

数据库 schema 位于：

```text
server/db/schema.sqlite.ts
```

私有资料库迁移文件位于：

```text
server/db/migrations/sqlite/0001_private_vault.sql
```

主要数据表：

| 表名 | 说明 |
| --- | --- |
| `users` | 登录用户、用户名和角色。 |
| `sessions` | 哈希后的 session token 和过期时间。 |
| `authenticators` | TOTP 发行方、账号名、密钥、备注。 |
| `backup_code_sets` | 服务商、账号名、备用验证码、备注。 |
| `server_records` | 服务器名称、服务商、IP、面板 URL、到期/提醒时间、备注。 |
| `domain_records` | 域名、注册商、账号、到期/提醒时间、自动续费标记、备注。 |
| `messages` | 模板遗留消息表，已补充审计字段和逻辑删除字段。 |

## 多语言

界面使用 `@nuxtjs/i18n`，语言文件位于：

```text
i18n/locales/
```

当前支持：

- `zh-CN`
- `en`

后续新增语言时，新增一个 locale JSON 文件，并在 `nuxt.config.ts` 的 `i18n.locales` 数组中注册即可。

## API 路由

认证相关：

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth/me` | `GET` | 返回当前 session 用户。 |
| `/api/auth/register` | `POST` | 创建首个 admin 用户，或由 admin 创建新用户。 |
| `/api/auth/login` | `POST` | 登录并创建 session cookie。 |
| `/api/auth/logout` | `POST` | 逻辑删除当前 session 并清除 cookie。 |

资料库相关：

| 路由 | 方法 | 说明 |
| --- | --- | --- |
| `/api/vault/authenticators` | `GET`, `POST` | 查询或创建身份验证器记录。 |
| `/api/vault/authenticators/:id` | `PUT`, `DELETE` | 更新或逻辑删除身份验证器记录。 |
| `/api/vault/backup-codes` | `GET`, `POST` | 查询或创建备用验证码组。 |
| `/api/vault/backup-codes/:id` | `PUT`, `DELETE` | 更新或逻辑删除备用验证码组。 |
| `/api/vault/servers` | `GET`, `POST` | 查询或创建服务器记录。 |
| `/api/vault/servers/:id` | `PUT`, `DELETE` | 更新或逻辑删除服务器记录。 |
| `/api/vault/domains` | `GET`, `POST` | 查询或创建域名记录。 |
| `/api/vault/domains/:id` | `PUT`, `DELETE` | 更新或逻辑删除域名记录。 |
| `/api/vault/reminders?days=45` | `GET` | 返回指定天数窗口内的服务器/域名提醒。 |

## 开发检查

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Cloudflare 部署

部署到 Cloudflare：

```bash
pnpm deploy-cloudflare
```

部署脚本会使用 Cloudflare Nitro preset 构建项目，先远程应用 D1 migrations，再使用 NuxtHub 生成的 Cloudflare 配置通过 Wrangler 部署。

Cloudflare 资源 bindings 配置在 `nuxt.config.ts`，由 NuxtHub 在构建时生成 `.output/server/wrangler.json`：

- `DB`：D1 SQLite
- `KV`：重定向数据
- `CACHE`：缓存响应
- `BLOB`：R2-backed Blob 存储

`wrangler.jsonc` 只保留 observability 等非 Hub 资源配置。

正式使用前请确认：

- 已应用 D1 migration `0001_private_vault.sql`。
- 部署后立即创建第一个账号。
- 如果站点可被公网访问，应额外使用 Cloudflare Access、私有路由或其他外层访问控制保护。
