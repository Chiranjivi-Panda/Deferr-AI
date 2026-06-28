/**
 * error-handler.ts — Global Express error-handling middleware.
 *
 * IMPORTANT FOR BEGINNERS:
 * Express identifies error-handling middleware by its function signature.
 * It MUST have exactly 4 parameters: (err, req, res, next).
 * If you remove any one of them — even if unused — Express will treat it
 * as a normal middleware and skip it when errors occur.
 *
 * This middleware catches any error thrown or passed via next(err) in any
 * route handler, logs it, and returns a clean JSON error response.
 */

import type { Request, Response, NextFunction } from 'express';

/**
 * Extend the built-in Error with an optional HTTP status code.
 * This lets route handlers do:  const err = new Error('Not found'); (err as any).status = 404; throw err;
 */
interface HttpError extends Error {
  status?: number;
}

/**
 * Express error-handling middleware.
 *
 * ⚠️  All 4 parameters (err, req, res, next) are REQUIRED even though
 *     `next` is not used in the body.  Without all 4, Express won't
 *     recognize this as an error handler.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: HttpError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the full error to the server console for debugging.
  // In production you'd send this to a logging service instead.
  console.error('❌ Unhandled error:', err);

  // Use the error's status if set (e.g. 404, 422), otherwise default to 500.
  const statusCode = err.status || 500;

  // Send a JSON response so the frontend can display the error message.
  // We never leak stack traces to the client — only the message.
  res.status(statusCode).json({
    error: err.message || 'Internal server error',
  });
}
