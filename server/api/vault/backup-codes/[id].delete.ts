import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Valid id is required.' })

  const now = Date.now()
  await db.update(schema.backupCodeSets)
    .set({
      isDeleted: true,
      deletedAt: now,
      updatedBy: user.id,
      updatedAt: now,
    })
    .where(and(
      eq(schema.backupCodeSets.id, id),
      eq(schema.backupCodeSets.ownerId, user.id),
      eq(schema.backupCodeSets.isDeleted, false),
    ))

  return {}
})
