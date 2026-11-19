/**
 * HearMe AI - Background Cron & Maintenance Service
 * Implements TRACEN Topic 20 (Cron Jobs)
 *
 * Runs scheduled background maintenance to prevent memory leaks,
 * clean expired cache entries, prune inactive rate limiters, and log system metrics.
 */

import { signExplainerCache, summarizerCache, chatCache } from './cache.ts';
import { globalLimiter, aiLimiter } from './rateLimiter.ts';
import { eventBus } from './eventBus.ts';

export class BackgroundMaintenanceService {
  private timer: NodeJS.Timeout | null = null;
  private readonly intervalMs: number;
  private runCount = 0;

  constructor(intervalMinutes = 10) {
    this.intervalMs = intervalMinutes * 60 * 1000;
  }

  /**
   * Start scheduled background execution
   */
  start(): void {
    if (this.timer) return;

    console.log(`[Cron] Background Maintenance Service scheduled to run every ${this.intervalMs / 60000} minutes.`);
    this.timer = setInterval(() => {
      this.executeRoutine();
    }, this.intervalMs);

    // Unref timer so it doesn't prevent graceful server shutdown
    if (this.timer.unref) {
      this.timer.unref();
    }
  }

  /**
   * Execute one round of scheduled cleanup tasks
   */
  executeRoutine(): void {
    this.runCount++;
    const start = Date.now();

    // 1. Purge expired cache entries
    const purgedSign = signExplainerCache.cleanup();
    const purgedSummarizer = summarizerCache.cleanup();
    const purgedChat = chatCache.cleanup();
    const totalCachePurged = purgedSign + purgedSummarizer + purgedChat;

    // 2. Prune inactive rate-limiter IPs
    const prunedGlobal = globalLimiter.cleanup();
    const prunedAi = aiLimiter.cleanup();
    const totalIpsPruned = prunedGlobal + prunedAi;

    // 3. Memory audit
    const memory = process.memoryUsage();
    const heapUsedMb = Math.round(memory.heapUsed / 1024 / 1024);
    const rssMb = Math.round(memory.rss / 1024 / 1024);

    // 4. Publish event
    eventBus.publish('system:cron_maintenance', {
      purgedCacheEntries: totalCachePurged,
      purgedRateLimiterEntries: totalIpsPruned,
      memoryUsageMb: heapUsedMb,
    });

    console.log(
      `[Cron:Job #${this.runCount}] Maintenance completed in ${Date.now() - start}ms: ` +
      `Purged ${totalCachePurged} expired cache items, ${totalIpsPruned} rate-limiter entries. Heap: ${heapUsedMb}MB (RSS: ${rssMb}MB).`
    );
  }

  /**
   * Stop scheduled execution
   */
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[Cron] Background Maintenance Service stopped.');
    }
  }
}

export const maintenanceCron = new BackgroundMaintenanceService(10); // runs every 10 minutes
