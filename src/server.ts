import { clerkPlugin, getAuth } from '@clerk/fastify';

import { fastify, FastifyReply, FastifyRequest } from 'fastify';
import app, { appOptions } from './app';

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: false,
        ignore: 'pid,hostname',
        messageFormat: '{className} : {msg}',
        colorize: true,
      },
    },
    timestamp: () => {
      const now = new Date();
      const polandTime = now.toLocaleString('pl-PL', {
        timeZone: 'Europe/Warsaw',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: false,
      });
      return `,"time":"${polandTime}"`;
    },
  },
});

const timeConfig = {
  timezone: process.env.TZ,
  serverTime: new Date().toString(),
};
server.log.info(timeConfig, 'Starting server...');

// Health check routes
server.get('/', { logLevel: 'silent' }, () => 'ok');
server.get('/health', { logLevel: 'silent' }, () => 'ok');

const start = async () => {
  try {
    if (!process.env.PORT) {
      throw new Error('Missing PORT environment variable');
    }

    // Register Clerk plugin
    await server.register(clerkPlugin, {
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    // Add preHandler hook to check for authentication on all /api routes
    await server.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
      if (request.url.startsWith('/api/public')) {
        return;
      }

      if (request.url.startsWith('/api')) {
        try {
          const { userId } = getAuth(request);
          if (!userId) {
            reply.code(401).send({ message: 'Unauthorized' });
          }
        } catch (error) {
          console.error('Authentication failed', error);
          reply.code(401).send({ error: 'Authentication failed' });
        }
      }
    });

    // Register your app routes
    await server.register(app, appOptions);

    // Start the server
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

// Add proper error handling
process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // process.exit(1);
});

start();
