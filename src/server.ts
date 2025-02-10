import { fastify } from 'fastify'
import app from './app'  // adjust path if needed
import { appOptions } from './app'  // adjust path if needed

const server = fastify({
  logger: true
})

const start = async () => {
  try {
    await server.register(app, appOptions)
    await server.listen({
      port: parseInt(process.env.PORT || '3000'),
      host: '0.0.0.0'
    })
    console.log(`Server is running on port ${process.env.PORT || 3000}`)
  } catch (err) {
    server.log.error(err)
    process.exit(1)
  }
}

start()
