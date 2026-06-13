import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

const auditFields = {
  createdBy: integer('created_by'),
  createdAt: integer('created_at').notNull(),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at').notNull(),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  deletedAt: integer('deleted_at'),
}

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  username: text().notNull(),
  displayName: text('display_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  role: text().notNull().default('member'),
  ...auditFields,
}, table => [
  uniqueIndex('users_username_unique').on(table.username),
  index('users_is_deleted_idx').on(table.isDeleted),
])

export const sessions = sqliteTable('sessions', {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  tokenHash: text('token_hash').notNull(),
  expiresAt: integer('expires_at').notNull(),
  lastUsedAt: integer('last_used_at'),
  ...auditFields,
}, table => [
  uniqueIndex('sessions_token_hash_unique').on(table.tokenHash),
  index('sessions_user_id_idx').on(table.userId),
  index('sessions_is_deleted_idx').on(table.isDeleted),
])

export const authenticators = sqliteTable('authenticators', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  issuer: text().notNull(),
  accountName: text('account_name').notNull(),
  secretEncrypted: text('secret_encrypted').notNull(),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('authenticators_owner_id_idx').on(table.ownerId),
  index('authenticators_is_deleted_idx').on(table.isDeleted),
])

export const backupCodeSets = sqliteTable('backup_code_sets', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  provider: text().notNull(),
  accountName: text('account_name').notNull(),
  codesEncrypted: text('codes_encrypted').notNull(),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('backup_code_sets_owner_id_idx').on(table.ownerId),
  index('backup_code_sets_is_deleted_idx').on(table.isDeleted),
])

export const serverRecords = sqliteTable('server_records', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  name: text().notNull(),
  provider: text(),
  ipAddress: text('ip_address').notNull(),
  loginName: text('login_name'),
  panelUrl: text('panel_url'),
  startTime: integer('start_time'),
  expiresAt: integer('expires_at'),
  price: text(),
  currency: text(),
  remindAt: integer('remind_at'),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(false),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('server_records_owner_id_idx').on(table.ownerId),
  index('server_records_remind_at_idx').on(table.remindAt),
  index('server_records_is_deleted_idx').on(table.isDeleted),
])

export const domainRecords = sqliteTable('domain_records', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  domain: text().notNull(),
  registrar: text(),
  accountName: text('account_name'),
  startTime: integer('start_time'),
  expiresAt: integer('expires_at'),
  price: text(),
  currency: text(),
  remindAt: integer('remind_at'),
  autoRenew: integer('auto_renew', { mode: 'boolean' }).notNull().default(false),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('domain_records_owner_id_idx').on(table.ownerId),
  index('domain_records_remind_at_idx').on(table.remindAt),
  index('domain_records_is_deleted_idx').on(table.isDeleted),
])

export const websiteRecords = sqliteTable('website_records', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  name: text().notNull(),
  url: text(),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('website_records_owner_id_idx').on(table.ownerId),
  index('website_records_is_deleted_idx').on(table.isDeleted),
])

export const websiteAccountRecords = sqliteTable('website_account_records', {
  id: integer().primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  websiteId: integer('website_id').notNull().references(() => websiteRecords.id),
  accountName: text('account_name').notNull(),
  loginIdentifier: text('login_identifier'),
  passwordEncrypted: text('password_encrypted'),
  notesEncrypted: text('notes_encrypted'),
  ...auditFields,
}, table => [
  index('website_account_records_owner_id_idx').on(table.ownerId),
  index('website_account_records_website_id_idx').on(table.websiteId),
  index('website_account_records_is_deleted_idx').on(table.isDeleted),
])

export const messages = sqliteTable('messages', {
  id: integer().primaryKey({ autoIncrement: true }),
  text: text().notNull(),
  createdAt: integer('created_at').notNull(),
  createdBy: integer('created_by'),
  updatedBy: integer('updated_by'),
  updatedAt: integer('updated_at').notNull().default(0),
  isDeleted: integer('is_deleted', { mode: 'boolean' }).notNull().default(false),
  deletedAt: integer('deleted_at'),
})
