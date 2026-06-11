import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Valid id is required.' })

  const now = Date.now()
  await db.update(schema.domainRecords)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedBy: user.id,
      updatedAt: now,
    })
    .where(and(
      eq(schema.domainRecords.id, id),
      eq(schema.domainRecords.ownerId, user.id),
      eq(schema.domainRecords.isDeleted, false),
    ))

  return {}
})
