import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
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
import { RequestHandler } from 'express';

const app: Express = express();

// Trust a single proxy (Vercel edge) so req.ip and forwarded headers work
app.set('trust proxy', 1);

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
  }),
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use(((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    console.error('[JSON] Parsing error:', err.message);
    res.status(400).json({ success: false, message: 'Invalid JSON in request body', error: err.message, statusCode: 400 });
    return;
  }
  next(err);
}) as RequestHandler);

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip || (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '',
});
app.use('/api/', limiter);

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/api/health' && duration > 50) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Public endpoints (must be before routers that use router-level auth)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), environment: config.nodeEnv });
});

app.post('/api/debug/echo', (req: Request, res: Response) => {
  res.json({ body: req.body, headers: req.headers });
});

// Serve inline SVG favicon for api-prefixed requests
const _faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">\n  <rect width="64" height="64" rx="12" fill="#0ea5a4"/>\n  <text x="50%" y="55%" font-size="36" font-family="Arial, Helvetica, sans-serif" fill="#fff" text-anchor="middle" alignment-baseline="middle">E</text>\n</svg>`;
app.get('/api/favicon.ico', (_req: Request, res: Response) => res.type('image/svg+xml').send(_faviconSvg));
app.get('/api/favicon.png', (_req: Request, res: Response) => res.type('image/svg+xml').send(_faviconSvg));

// Mount API routers under /api
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
app.use('/api', joinRoutes);
app.use('/api', uploadRoutes);
app.use('/api', adminRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Endpoint not found', statusCode: 404 });
});

// Global error handler
app.use(errorHandler);

export default app;
