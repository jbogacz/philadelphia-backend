import { fastify } from 'fastify';
import basicAuth from '@fastify/basic-auth';
import app from './app';
import { appOptions } from './app';

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
        messageFormat: '{className} : {msg}',
        colorize: true,
      },
    },
  },
});

// Health check routes
server.get('/health', { logLevel: 'silent' }, () => 'ok');
server.get('/', { logLevel: 'silent' }, () => 'ok');

// Authorization
const authenticate = { realm: 'philadelphia-backend-api' };
const validate = async (username: string, password: string) => {
  if (username !== process.env.API_USERNAME || password !== process.env.API_PASSWORD) {
    throw new Error('Invalid credentials');
  }
};

const start = async () => {
  try {
    if (!process.env.PORT) {
      throw new Error('Missing PORT environment variable');
    }

    // Register auth plugin
    await server.register(basicAuth, { validate, authenticate });
    // Protect all routes
    server.addHook('onRequest', server.basicAuth);

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
