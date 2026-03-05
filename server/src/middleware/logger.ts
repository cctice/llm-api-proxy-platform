import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};
