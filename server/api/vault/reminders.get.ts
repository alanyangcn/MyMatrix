import { and, eq, gte, lte } from 'drizzle-orm'
import { db, schema } from 'hub:db'
import { domainToUnicode } from 'node:url'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const query = getQuery(event)
  const days = Number(query.days || 30)
  const now = Date.now()
  const until = now + Math.max(1, days) * 24 * 60 * 60 * 1000

  const [servers, domains] = await Promise.all([
    db.select().from(schema.serverRecords).where(and(
      eq(schema.serverRecords.ownerId, user.id),
      eq(schema.serverRecords.isDeleted, false),
      gte(schema.serverRecords.remindAt, now),
      lte(schema.serverRecords.remindAt, until),
    )),
    db.select().from(schema.domainRecords).where(and(
      eq(schema.domainRecords.ownerId, user.id),
      eq(schema.domainRecords.isDeleted, false),
      gte(schema.domainRecords.expiresAt, now),
      lte(schema.domainRecords.expiresAt, until),
    )),
  ])

  return [
    ...servers.map(item => ({
      type: 'server',
      id: item.id,
      title: item.name,
      provider: item.provider,
      expiresAt: item.expiresAt,
      remindAt: item.remindAt,
    })),
    ...domains.map(item => ({
      type: 'domain',
      id: item.id,
      title: domainToUnicode(item.domain),
      provider: item.registrar,
      expiresAt: item.expiresAt,
      remindAt: item.expiresAt,
    })),
  ].sort((a, b) => (a.remindAt || 0) - (b.remindAt || 0))
})
