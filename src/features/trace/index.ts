import { traceRoutes } from './trace.routes';

// This export is what @fastify/autoload will pick up
export default traceRoutes;

export type { CaptureTraceDto } from './trace.types';
