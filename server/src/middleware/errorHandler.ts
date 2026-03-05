import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new AppError(404, 'NOT_FOUND', `Route ${req.originalUrl} not found`);
  next(error);
};
