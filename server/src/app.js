import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { clerkMiddleware } from '@clerk/express';
import { env, allowedOrigins } from './config/env.js'; // <-- Correct path for app.js
import { ApiError } from './utils/ApiError.js';
import { pool } from './db/pool.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import aiRoutes from './routes/ai.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');

// 1. Security & Parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(express.json({ limit: '100kb' }));
if (env.NODE_ENV !== 'test') app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// 2. CORS (ONLY ONE INSTANCE, must allow Authorization header)
app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new ApiError(403, 'Origin not allowed by CORS')),
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'], // <-- CRITICAL FIX
    maxAge: 600,
  }),
);

// 3. Health checks
app.get('/', (_req, res) => res.json({ name: 'AskMe API', status: 'ok' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: Math.round(process.uptime()) }));

// 4. Clerk Middleware
// Explicitly passing keys and authorizedParties to ensure it works
app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
  authorizedParties: allowedOrigins // <-- CRITICAL FIX
}));

// 5. Rate Limiting & Routes
app.use('/api', apiLimiter);
app.use('/api/ai', aiRoutes);
app.use('/api/user', userRoutes);

// 6. Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;