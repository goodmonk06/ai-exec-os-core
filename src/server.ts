import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env';
import { connectDB, disconnectDB } from './db/client';
import { agentRoutes } from './modules/agents/routes';
import { workflowRoutes } from './modules/workflows/routes';
import { jobRoutes } from './modules/jobs/routes';
import { startWorker } from './worker';

const fastify = Fastify({
  logger: {
    level: env.NODE_ENV === 'development' ? 'info' : 'warn',
  },
});

async function buildServer() {
  // Register CORS
  await fastify.register(cors, {
    origin: true,
  });

  // Health check endpoint
  fastify.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(agentRoutes);
  await fastify.register(workflowRoutes);
  await fastify.register(jobRoutes);

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    fastify.log.error(error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: env.NODE_ENV === 'development' ? error.message : undefined,
    });
  });

  return fastify;
}

async function start() {
  try {
    // Connect to database
    await connectDB();

    // Build and start server
    const server = await buildServer();

    const address = await server.listen({
      port: parseInt(env.PORT),
      host: '0.0.0.0',
    });

    console.log(`🚀 Server listening at ${address}`);
    console.log(`📝 Environment: ${env.NODE_ENV}`);

    // Start worker in the same process (for development)
    // In production, you may want to run this in a separate process
    await startWorker();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('Shutting down server...');
  await fastify.close();
  await disconnectDB();
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start server
start();
