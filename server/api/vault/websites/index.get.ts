import { and, desc, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const [websites, accounts] = await Promise.all([
    db.select().from(schema.websiteRecords).where(and(
      eq(schema.websiteRecords.ownerId, user.id),
      eq(schema.websiteRecords.isDeleted, false),
    )).orderBy(desc(schema.websiteRecords.updatedAt)),
    db.select().from(schema.websiteAccountRecords).where(and(
      eq(schema.websiteAccountRecords.ownerId, user.id),
      eq(schema.websiteAccountRecords.isDeleted, false),
    )).orderBy(desc(schema.websiteAccountRecords.updatedAt)),
  ])

  const accountsByWebsite = new Map<number, ReturnType<typeof serializeAccount>[]>()
  for (const account of accounts) {
    const decrypted = serializeAccount(account)
    const nextAccounts = accountsByWebsite.get(account.websiteId) || []
    nextAccounts.push(decrypted)
    accountsByWebsite.set(account.websiteId, nextAccounts)
  }

  return websites.map(item => ({
    id: item.id,
    name: item.name,
    url: item.url,
    notes: item.notesEncrypted,
    accounts: accountsByWebsite.get(item.id) || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }))
})

function serializeAccount(account: typeof schema.websiteAccountRecords.$inferSelect) {
  return {
    id: account.id,
    websiteId: account.websiteId,
    accountName: account.accountName,
    loginIdentifier: account.loginIdentifier,
    notes: account.notesEncrypted,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
  }
}
