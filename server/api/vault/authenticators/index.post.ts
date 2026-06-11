import { db, schema } from 'hub:db'

export default eventHandler(async (event) => {
  const user = await requireUser(event)
  const body = await readBody<{
    issuer?: string
    accountName?: string
    secret?: string
    notes?: string
  }>(event)

  if (!body.issuer?.trim() || !body.accountName?.trim() || !body.secret?.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Issuer, account name, and secret are required.',
    })
  }

  const now = Date.now()
  await db.insert(schema.authenticators).values({
    ownerId: user.id,
    issuer: body.issuer.trim(),
    accountName: body.accountName.trim(),
    secretEncrypted: body.secret.trim(),
    notesEncrypted: body.notes?.trim() || null,
    createdBy: user.id,
    createdAt: now,
    updatedBy: user.id,
    updatedAt: now,
    isDeleted: false,
  })

  return {}
})
