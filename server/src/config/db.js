import mongoose from 'mongoose';
import { logger } from './logger.js';

// Disable Mongoose command buffering so queries fail immediately or fallback cleanly
// if MongoDB is not running, preventing 10,000ms timeout errors
mongoose.set('bufferCommands', false);

/**
 * Connect to MongoDB instance using Mongoose (Unit 5)
 */
export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bee_video_streaming';
  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime error', { error: err.message });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Retrying connection...');
    });

    return conn;
  } catch (error) {
    logger.error('Failed to connect to MongoDB', { error: error.message, mongoUri });
    logger.warn('Please ensure MongoDB is running locally on port 27017 or configure a valid MONGO_URI (such as MongoDB Atlas) in server/.env');
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};
