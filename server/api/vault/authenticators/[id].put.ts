import { and, eq } from 'drizzle-orm'
import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{
    issuer?: string
    accountName?: string
    secret?: string
    notes?: string
  }>(event)

  if (!id || !body.issuer?.trim() || !body.accountName?.trim() || !body.secret?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid id, issuer, account name, and secret are required.',
    })
  }

  await db.update(schema.authenticators)
    .set({
      issuer: body.issuer.trim(),
      accountName: body.accountName.trim(),
      secretEncrypted: body.secret.trim(),
      notesEncrypted: body.notes?.trim() || null,
      updatedBy: user.id,
      updatedAt: Date.now(),
    })
    .where(and(
      eq(schema.authenticators.id, id),
      eq(schema.authenticators.ownerId, user.id),
      eq(schema.authenticators.isDeleted, false),
    ))

  return {}
})
