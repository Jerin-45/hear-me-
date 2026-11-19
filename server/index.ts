import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { geminiRouter } from './routes/gemini.ts';
import { globalLimiter } from './utils/rateLimiter.ts';
import { geminiCircuitBreaker } from './utils/circuitBreaker.ts';
import { signExplainerCache, summarizerCache, chatCache } from './utils/cache.ts';
import { heavyAiQueue } from './utils/asyncQueue.ts';
import { maintenanceCron } from './utils/cron.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const startTime = Date.now();

// 1. Security Headers Middleware (Implements TRACEN Topic 4 & Security Improvements)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  next();
});

// 2. Request Correlation ID Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  req.headers['x-request-id'] = reqId;
  res.setHeader('X-Request-Id', reqId);
  next();
});

// 3. Request Timeout Middleware (Implements TRACEN Topic 11: Timeouts)
const REQUEST_TIMEOUT_MS = 25000;
app.use((req: Request, res: Response, next: NextFunction) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      console.warn(`[Timeout] Request ${req.method} ${req.originalUrl} exceeded ${REQUEST_TIMEOUT_MS}ms timeout.`);
      res.status(504).json({
        error: 'Request execution timed out. The operation took longer than permitted.',
        code: 'GATEWAY_TIMEOUT',
        requestId: req.headers['x-request-id'],
      });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timer));
  res.on('close', () => clearTimeout(timer));
  next();
});

// 4. CORS & Body Parsers
app.use(cors({
  origin: '*', // In development allows Vite proxy and direct calls
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key'],
}));
app.use(express.json({ limit: '5mb' }));

// 5. Global Sliding Window Rate Limiter (Implements TRACEN Topic 1: Rate Limiting)
app.use(globalLimiter.middleware());

// 6. Comprehensive Health & System Telemetry Endpoint (Implements TRACEN Architecture Observability)
app.get('/api/health', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - startTime) / 1000),
    platform: 'HearMe AI Enterprise Accessibility Platform',
    language: 'English (en-IN / en-US)',
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5),
    systemDesign: {
      circuitBreaker: geminiCircuitBreaker.getStats(),
      caches: {
        signExplainer: signExplainerCache.getStats(),
        summarizer: summarizerCache.getStats(),
        chat: chatCache.getStats(),
      },
      rateLimiter: globalLimiter.getStats(),
      asyncQueue: heavyAiQueue.getStats(),
      memory: {
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        rssMb: Math.round(mem.rss / 1024 / 1024),
      },
    },
  });
});

// 7. Gemini AI Routes
app.use('/api/gemini', geminiRouter);

// 8. 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found on HearMe AI server.`,
    code: 'NOT_FOUND',
  });
});

// 9. Centralized Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const reqId = req.headers['x-request-id'] || 'unknown';
  console.error(`[Unhandled Server Error] (Req: ${reqId}):`, err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
    code: err.code || 'INTERNAL_SERVER_ERROR',
    requestId: reqId,
  });
});

// Start Background Maintenance Cron Routine (Implements TRACEN Topic 20)
maintenanceCron.start();

const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  HearMe AI Enterprise Backend Service`);
  console.log(`  Port: ${PORT} | Health: http://localhost:${PORT}/api/health`);
  console.log(`  TRACEN Architecture: Rate Limiter, LRU Caching, Circuit Breaker,`);
  console.log(`  Async Queues, Timeouts, Event Telemetry & Cron Maintenance Active`);
  console.log(`======================================================\n`);
});

// Graceful Shutdown
const handleShutdown = (signal: string) => {
  console.log(`\n[Shutdown] Received ${signal}. Closing HearMe AI server gracefully...`);
  maintenanceCron.stop();
  server.close(() => {
    console.log('[Shutdown] HTTP server closed cleanly. Exiting.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));
