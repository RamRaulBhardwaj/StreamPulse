import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { logger } from './config/logger.js';
// Import video events to register lifecycle listeners
import './events/videoEvents.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    logger.info(`===================================================`);
    logger.info(`  Video Streaming Server running on port: ${PORT}  `);
    logger.info(`  Mode: ${process.env.NODE_ENV || 'development'}   `);
    logger.info(`  API: http://localhost:${PORT}/api/videos         `);
    logger.info(`===================================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection detected', { error: err.message, stack: err.stack });
    server.close(() => process.exit(1));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown', { error: err.message, stack: err.stack });
    server.close(() => process.exit(1));
  });
};

startServer();
