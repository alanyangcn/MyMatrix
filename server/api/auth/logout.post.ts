export default eventHandler(async (event) => {
  await clearCurrentSession(event)
  return {}
})
