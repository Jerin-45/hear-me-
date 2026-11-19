/**
 * HearMe AI - Circuit Breaker Pattern
 * Implements TRACEN Topic 10 (Circuit Breakers)
 *
 * Prevents cascading service failures when external upstream dependencies (e.g. Google Gemini API)
 * suffer from downtime, throttling (429), or prolonged network latency.
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold?: number;  // Consecutive failures before tripping OPEN (default: 4)
  cooldownMs?: number;        // Cooldown period in ms before moving to HALF_OPEN (default: 30,000ms)
  successThreshold?: number;  // Consecutive successes in HALF_OPEN to re-close (default: 2)
  name?: string;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: number = Date.now();
  private name: string;

  private readonly failureThreshold: number;
  private readonly cooldownMs: number;
  private readonly successThreshold: number;

  private stats = {
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    shortCircuitedCalls: 0,
    lastFailureTime: null as string | null,
    lastSuccessTime: null as string | null,
    trippedCount: 0,
  };

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold || 4;
    this.cooldownMs = options.cooldownMs || 30000;
    this.successThreshold = options.successThreshold || 2;
    this.name = options.name || 'GeminiAICircuit';
  }

  /**
   * Current circuit state
   */
  getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttempt) {
      this.state = 'HALF_OPEN';
      this.successCount = 0;
      console.warn(`[CircuitBreaker:${this.name}] Cooldown expired. Moving from OPEN to HALF_OPEN to test upstream availability.`);
    }
    return this.state;
  }

  /**
   * Execute an operation protected by the circuit breaker
   */
  async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T> | T): Promise<T> {
    this.stats.totalCalls++;
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      this.stats.shortCircuitedCalls++;
      console.warn(`[CircuitBreaker:${this.name}] Circuit is OPEN. Fast-failing request without contacting upstream.`);

      if (fallback) {
        return fallback();
      }
      throw new Error(`Upstream AI service is temporarily degraded (Circuit Breaker OPEN). Please try again in ${Math.ceil((this.nextAttempt - Date.now()) / 1000)}s.`);
    }

    try {
      const result = await action();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();

      if (fallback) {
        console.warn(`[CircuitBreaker:${this.name}] Primary call failed, invoking graceful fallback.`);
        return fallback();
      }
      throw error;
    }
  }

  private recordSuccess(): void {
    this.stats.successfulCalls++;
    this.stats.lastSuccessTime = new Date().toISOString();

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.failureCount = 0;
        console.log(`[CircuitBreaker:${this.name}] Upstream service confirmed healthy. Circuit returned to CLOSED.`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private recordFailure(): void {
    this.stats.failedCalls++;
    this.stats.lastFailureTime = new Date().toISOString();
    this.failureCount++;

    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this.trip();
    }
  }

  private trip(): void {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.cooldownMs;
    this.stats.trippedCount++;
    console.error(
      `[CircuitBreaker:${this.name}] Failure threshold reached (${this.failureCount} failures). Circuit tripped to OPEN. Next probe in ${this.cooldownMs / 1000}s.`
    );
  }

  /**
   * Reset the circuit breaker manually
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }

  /**
   * Return circuit diagnostics
   */
  getStats() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
      nextAttemptInSeconds: this.state === 'OPEN' ? Math.max(0, Math.ceil((this.nextAttempt - Date.now()) / 1000)) : 0,
      ...this.stats,
    };
  }
}

// Global circuit breaker for Gemini AI requests
export const geminiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 4,
  cooldownMs: 25000,
  successThreshold: 2,
  name: 'Gemini-API',
});
