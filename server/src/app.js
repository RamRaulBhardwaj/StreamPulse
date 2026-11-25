import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { requestLogger } from './middlewares/loggerMiddleware.js';
import { errorHandler } from './middlewares/errorMiddleware.js';
import { ApiError } from './utils/apiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Cross-Origin Resource Sharing (Unit 4 & 7)
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range']
  })
);

// Body Parsing Middleware (Unit 4)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging Middlewares (Units 2 & 3)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Serve static thumbnail images
app.use(
  '/uploads/thumbnails',
  express.static(path.join(__dirname, '../uploads/thumbnails'))
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// REST API Route Mounts (Unit 4)
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/videos', commentRoutes); // Mounts /api/videos/:videoId/comments
app.use('/api', commentRoutes);        // Mounts /api/comments/:id

// Handle 404 for unmapped endpoints
app.use('*', (req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Endpoint not found`));
});

// Centralized Error Handling Middleware (Unit 4 & 5)
app.use(errorHandler);

export default app;
