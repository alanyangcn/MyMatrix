import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Valid id is required.' })

  const now = Date.now()
  await db.update(schema.serverRecords)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedBy: user.id,
      updatedAt: now,
    })
    .where(and(
      eq(schema.serverRecords.id, id),
      eq(schema.serverRecords.ownerId, user.id),
      eq(schema.serverRecords.isDeleted, false),
    ))

  return {}
})
