/**
 * HearMe AI - In-Memory Asynchronous Task Queue & Concurrency Limiter
 * Implements TRACEN Topic 15 (Message Queues & Asynchronous Processing)
 *
 * Prevents high-concurrency CPU/network saturation by throttling concurrent heavy AI operations
 * (e.g. long transcript summarization) to a managed worker pool.
 */

interface QueuedTask<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  enqueuedAt: number;
}

export class AsyncProcessingQueue {
  private queue: QueuedTask<any>[] = [];
  private activeCount = 0;
  private readonly maxConcurrency: number;
  private readonly timeoutMs: number;
  private processedTotal = 0;

  constructor(maxConcurrency = 3, timeoutMs = 25000) {
    this.maxConcurrency = maxConcurrency;
    this.timeoutMs = timeoutMs;
  }

  /**
   * Enqueue an async operation for execution
   */
  enqueue<T>(taskFn: () => Promise<T>, taskId?: string): Promise<T> {
    const id = taskId || `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    return new Promise<T>((resolve, reject) => {
      const task: QueuedTask<T> = {
        id,
        fn: taskFn,
        resolve,
        reject,
        enqueuedAt: Date.now(),
      };

      this.queue.push(task);
      this.processNext();
    });
  }

  private async processNext(): Promise<void> {
    if (this.activeCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    // Check if task timed out in queue
    if (Date.now() - task.enqueuedAt > this.timeoutMs) {
      task.reject(new Error(`Queued task ${task.id} timed out before processing slot became available.`));
      this.processNext();
      return;
    }

    this.activeCount++;

    try {
      const result = await task.fn();
      task.resolve(result);
    } catch (err) {
      task.reject(err);
    } finally {
      this.activeCount--;
      this.processedTotal++;
      this.processNext();
    }
  }

  /**
   * Return queue metrics
   */
  getStats() {
    return {
      activeWorkers: this.activeCount,
      queuedTasks: this.queue.length,
      maxConcurrency: this.maxConcurrency,
      processedTotal: this.processedTotal,
    };
  }
}

// Global queue for heavy AI workloads (summarizer, document processing)
export const heavyAiQueue = new AsyncProcessingQueue(3, 20000);
