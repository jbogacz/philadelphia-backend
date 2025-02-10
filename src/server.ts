import { fastify } from 'fastify'
import app from './app'
import { appOptions } from './app'

const server = fastify({
  logger: true
})

const start = async () => {
  try {
    // Add debugging logs
    const port = parseInt(process.env.PORT || process.env.RENDER_SERVICE_PORT || '3000')
    console.log('Environment variables:', {
      PORT: process.env.PORT,
      RENDER_SERVICE_PORT: process.env.RENDER_SERVICE_PORT,
      RENDER_INTERNAL_PORT: process.env.RENDER_INTERNAL_PORT
    })

    await server.register(app, appOptions)
    await server.listen({
      port: port,
      host: '0.0.0.0'
    })
    console.log(`Server is running on port ${port}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
