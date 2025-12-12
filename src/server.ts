import moduleAlias from 'module-alias';
import path from 'path';
import 'reflect-metadata';

// Register runtime aliases so imports like '@services/..' resolve whether
// the app runs from `src/` (tsx/dev/Vercel) or `dist/` (compiled build).
moduleAlias.addAliases({
  '@config': path.join(__dirname, 'config'),
  '@services': path.join(__dirname, 'services'),
  '@controllers': path.join(__dirname, 'controllers'),
  '@routes': path.join(__dirname, 'routes'),
  '@entities': path.join(__dirname, 'entities'),
  '@utils': path.join(__dirname, 'utils'),
  '@middlewares': path.join(__dirname, 'middlewares'),
});
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { query } from './utils/db';

// Import routes
import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import kelasRoutes from './routes/kelas.routes';
import mapelRoutes from './routes/mapel.routes';
import guruRoutes from './routes/guru.routes';
import siswaRoutes from './routes/siswa.routes';
import materiRoutes from './routes/materi.routes';
import tugasRoutes from './routes/tugas.routes';
import absensiRoutes from './routes/absensi.routes';
import diskusiRoutes from './routes/diskusi.routes';
import nilaiRoutes from './routes/nilai.routes';
import sppRoutes from './routes/spp.routes';
import joinRoutes from './routes/join.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';

const app: Express = express();

// Export app early for serverless platforms so `require('../dist/server')`
// doesn't fail if DB initialization later throws. Vercel expects a sync
// export at require-time (it will still call the handler per-request).
if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
  // @ts-ignore - using CommonJS export in TS file for serverless compatibility
  module.exports = app;
  console.log('[SERVER] Early-exported express app for serverless runtime');
}

// Security & Parsing Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('[JSON] Parsing error:', err.message);
    res.status(400).json({
      success: false,
      message: 'Invalid JSON in request body',
      error: err.message,
      statusCode: 400,
    });
    return;
  }
  next(err);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health' && duration > 50) {
      console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`,
      );
    }
  });
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/mapel', mapelRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/siswa', siswaRoutes);
app.use('/api/materi', materiRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/diskusi', diskusiRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/spp', sppRoutes);
// joinRoutes contains routes like /kelas/:id/join-requests and /join-requests/:id
app.use('/api', joinRoutes);
app.use('/api', uploadRoutes);
app.use('/api', adminRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Debug endpoint - test request parsing
app.post('/api/debug/echo', (req: Request, res: Response) => {
  res.json({
    body: req.body,
    headers: req.headers,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    statusCode: 404,
  });
});

// Global error handler
app.use(errorHandler);

// Start server or export handler for serverless platforms (e.g., Vercel)
const PORT = config.port;

const initServer = async () => {
  try {
    await query('SELECT 1');
    console.log('[DB] Database connection successful');

    // If running on Vercel (or other serverless platforms), export a handler
    // instead of calling app.listen. Vercel sets the VERCEL env var for builds.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      // Export the express `app` as the module handler so serverless platforms
      // like Vercel can invoke it directly. Express apps are valid request
      // handlers (req, res) and can be exported directly.
      // @ts-ignore
      module.exports = app;
      console.log('[SERVER] Exported express app as serverless handler');
      return null as unknown as ReturnType<typeof app.listen>;
    }

    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    // Handle unhandled rejections and uncaught exceptions in long-running server
    process.on('unhandledRejection', (reason: unknown) => {
      console.error(
        '[FATAL] Unhandled rejection:',
        reason instanceof Error ? reason.message : String(reason),
      );
      process.exit(1);
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('[FATAL] Uncaught exception:', error.message, error.stack);
      process.exit(1);
    });

    return server;
  } catch (error) {
    console.error(
      '[DB] Database connection failed:',
      error instanceof Error ? error.message : String(error),
    );
    console.error('[DB] Make sure PostgreSQL is running and database exists');
    // In serverless environment, throwing allows the platform to surface the error
    // rather than exiting the process.
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    }
    process.exit(1);
  }
};

if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  initServer().catch((error) => {
    console.error(
      '[FATAL] Failed to initialize server:',
      error instanceof Error ? error.message : String(error),
    );
    if (error instanceof Error) {
      console.error('[FATAL] Stack:', error.stack);
    }
    process.exit(1);
  });
} else {
  // In serverless environments we export the `app` early and skip
  // running the long-lived server initialization (DB checks/listen).
  console.log('[SERVER] Running in serverless mode — skipping initServer');
}
