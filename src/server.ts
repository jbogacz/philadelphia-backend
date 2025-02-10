import { fastify } from 'fastify'
import app from './app'
import { appOptions } from './app'

const server = fastify({
  logger: true
})

const start = async () => {
  try {
    // Add debugging logs
    console.log('All environment variables:', process.env)
    console.log('PORT environment variable:', process.env.PORT)
    console.log('Type of PORT:', typeof process.env.PORT)

    const port = parseInt(process.env.PORT || '3000')
    console.log('Parsed port number:', port)

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
