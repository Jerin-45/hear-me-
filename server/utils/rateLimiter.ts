/**
 * HearMe AI - Sliding Window Rate Limiter
 * Implements TRACEN Topic 1 (Rate Limiting)
 *
 * Protects backend endpoints and external Gemini AI quotas against excessive requests,
 * scraping, and denial-of-service attempts.
 */

import type { Request, Response, NextFunction } from 'express';

interface RateLimiterOptions {
  windowMs: number;       // Time window in milliseconds (e.g., 60,000 for 1 min)
  maxRequests: number;    // Maximum requests permitted in window
  message?: string;       // Custom error message
  keyGenerator?: (req: Request) => string;
}

interface ClientRecord {
  timestamps: number[];
}

export class SlidingWindowRateLimiter {
  private store: Map<string, ClientRecord> = new Map();
  private windowMs: number;
  private maxRequests: number;
  private message: string;
  private keyGen: (req: Request) => string;
  private totalBlocked = 0;

  constructor(options: RateLimiterOptions) {
    this.windowMs = options.windowMs;
    this.maxRequests = options.maxRequests;
    this.message = options.message || 'Too many requests. Please try again later.';
    this.keyGen =
      options.keyGenerator ||
      ((req: Request) => {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
          return forwarded.split(',')[0].trim();
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
      });
  }

  /**
   * Express middleware handler
   */
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const key = this.keyGen(req);
      const now = Date.now();
      const windowStart = now - this.windowMs;

      let record = this.store.get(key);
      if (!record) {
        record = { timestamps: [] };
        this.store.set(key, record);
      }

      // Filter out timestamps outside current sliding window
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);

      const currentCount = record.timestamps.length;
      const remaining = Math.max(0, this.maxRequests - currentCount);
      const oldestTimestamp = record.timestamps[0] || now;
      const resetTime = Math.ceil((oldestTimestamp + this.windowMs - now) / 1000);

      // Set standard RateLimit response headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, remaining - 1));
      res.setHeader('X-RateLimit-Reset', resetTime > 0 ? resetTime : 1);

      if (currentCount >= this.maxRequests) {
        this.totalBlocked++;
        res.setHeader('Retry-After', resetTime > 0 ? resetTime : 1);
        return res.status(429).json({
          error: this.message,
          retryAfterSeconds: resetTime > 0 ? resetTime : 1,
          status: 429,
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }

      // Record valid request
      record.timestamps.push(now);
      next();
    };
  }

  /**
   * Remove inactive client records (called by cron maintenance)
   */
  cleanup(): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    let pruned = 0;

    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > windowStart);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Return telemetry metrics
   */
  getStats() {
    return {
      activeClients: this.store.size,
      maxRequestsPerWindow: this.maxRequests,
      windowSeconds: this.windowMs / 1000,
      totalBlockedRequests: this.totalBlocked,
    };
  }
}

// 1. Global API Rate Limiter: 120 requests per minute
export const globalLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 120,
  message: 'HearMe AI API limit exceeded. Please slow down your requests.',
});

// 2. Strict AI Generation Limiter: 20 requests per minute
export const aiLimiter = new SlidingWindowRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'AI Generation rate limit exceeded. Please wait a moment before sending more requests to protect accessibility quotas.',
});
