/**
 * Structured Logger utility for application and stream events
 */
const getTimestamp = () => new Date().toISOString();

export const logger = {
  info: (message, meta = {}) => {
    console.log(`[${getTimestamp()}] [INFO]: ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = {}) => {
    console.warn(`[${getTimestamp()}] [WARN]: ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  error: (message, meta = {}) => {
    console.error(`[${getTimestamp()}] [ERROR]: ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  },
  stream: (message, meta = {}) => {
    console.log(`[${getTimestamp()}] [STREAM]: ${message}`, Object.keys(meta).length ? JSON.stringify(meta) : '');
  }
};
