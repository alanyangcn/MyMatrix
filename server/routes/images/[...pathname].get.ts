import { blob } from 'hub:blob'

export default eventHandler(async (event) => {
  const { pathname } = event.context.params || {}
  if (!pathname) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Image not found.',
    })
  }

  setHeader(event, 'Content-Security-Policy', 'default-src \'none\';')
  return blob.serve(event, pathname)
})
