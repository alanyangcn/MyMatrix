import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Valid id is required.' })

  const now = Date.now()
  await db.update(schema.websiteAccountRecords)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedBy: user.id,
      updatedAt: now,
    })
    .where(and(
      eq(schema.websiteAccountRecords.id, id),
      eq(schema.websiteAccountRecords.ownerId, user.id),
      eq(schema.websiteAccountRecords.isDeleted, false),
    ))

  return {}
})
