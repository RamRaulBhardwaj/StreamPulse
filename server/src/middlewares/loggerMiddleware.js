import { logger } from '../config/logger.js';

/**
 * Custom Request Logging Middleware measuring HTTP status and latency (Units 2, 3 & 4)
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logMeta = {
      method,
      url: originalUrl,
      status: statusCode,
      duration: `${duration}ms`,
      ip
    };

    if (statusCode >= 400) {
      logger.warn(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logMeta);
    } else {
      logger.info(`HTTP ${method} ${originalUrl} ${statusCode} - ${duration}ms`, logMeta);
    }
  });

  next();
};
