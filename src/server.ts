import { fastify } from 'fastify';
import app from './app'; // adjust path if needed
import { appOptions } from './app'; // adjust path if needed

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        colorize: true,
      },
    },
  },
});

const start = async () => {
  try {
    if (!process.env.PORT) {
      throw new Error('Missing PORT environment variable');
    }

    await server.register(app, appOptions);
    await server.listen({
      port: parseInt(process.env.PORT),
      host: '0.0.0.0',
    });
    console.log(`Server is running on port ${process.env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
