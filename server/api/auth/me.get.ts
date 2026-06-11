export default eventHandler(async (event) => {
  const user = await getCurrentUser(event)
  return { user }
})
