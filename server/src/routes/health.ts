/**
 * health.ts — Health check route.
 *
 * Provides a simple GET /health endpoint that returns the server's status.
 * This is commonly used by:
 *   • The frontend to check if the backend is running
 *   • Monitoring tools (e.g. UptimeRobot, Docker health checks)
 *   • Load balancers to decide if the server can receive traffic
 */

import { Router } from 'express';

const healthRouter = Router();

/**
 * GET /health
 *
 * Returns a JSON object with:
 *   - status:    always 'ok' if the server is responding
 *   - timestamp: the current server time (useful for debugging timezone issues)
 *   - uptime:    how many seconds the server has been running
 */
healthRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    // process.uptime() returns seconds since the Node.js process started.
    uptime: process.uptime(),
  });
});

export default healthRouter;
