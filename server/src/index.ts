import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler } from './middleware/errorMiddleware';
import { startDeadlineCheckerJob } from './jobs/deadlineChecker';

const app = express();

// Middlewares
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (clean development logs)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'test') {
      console.log(`[${req.method}] ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', apiRouter);

// --- Production: Serve React Frontend ---
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA catch-all: any non-API route serves index.html for client-side routing
app.get('*', (req, res, next) => {
  // Don't catch API routes
  if (req.originalUrl.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      // If frontend isn't built yet, show a helpful message
      res.status(404).json({
        success: false,
        message: `API endpoint '${req.originalUrl}' not found`,
      });
    }
  });
});

// 404 Handler (only for unmatched /api routes now)
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
const server = app.listen(env.PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 FundSphere API running on port ${env.PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`=========================================`);

  // Start background deadline checker
  startDeadlineCheckerJob(30000); // checks every 30 seconds
});

export default app;
