/**
 * HearMe AI - Resilient Frontend API Client
 * Upgraded with TRACEN System Design:
 * - Topic 2: Client-side In-Memory Caching (LRU/TTL)
 * - Topic 11: Request Timeouts (AbortController)
 * - Topic 12 & 13: Retries with Exponential Backoff and Jitter
 * - Topic 14: Idempotency & In-Flight Request Deduplication
 *
 * NOTE: All function signatures and return types are strictly preserved.
 * Visual UI and component behavior remain 100% intact.
 */

import { GeminiExplainerResult, SummarizerOutput, ChatMessage } from '../types';

const API_BASE = '/api';

// In-Flight Request Deduplication Map (Prevents duplicate requests from rapid user clicks)
const inFlightRequests = new Map<string, Promise<any>>();

// Client-Side Cache (Instant response for repeated queries)
const clientCache = new Map<string, { data: any; expiry: number }>();

const getCached = <T>(key: string): T | null => {
  const item = clientCache.get(key.toLowerCase());
  if (!item) return null;
  if (Date.now() > item.expiry) {
    clientCache.delete(key.toLowerCase());
    return null;
  }
  return item.data as T;
};

const setCached = <T>(key: string, data: T, ttlSeconds = 600): void => {
  clientCache.set(key.toLowerCase(), {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
};

/**
 * Resilient fetch wrapper with Timeouts, Exponential Backoff Retries, and Idempotency
 * Implements TRACEN Topics 11, 12, 13, 14
 */
async function resilientFetch(
  url: string,
  options: RequestInit = {},
  timeoutMs = 15000,
  maxRetries = 2
): Promise<Response> {
  const idempotencyKey = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  let attempt = 0;

  while (attempt <= maxRetries) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const headers = new Headers(options.headers || {});
      headers.set('X-Request-Id', idempotencyKey);
      headers.set('X-Idempotency-Key', idempotencyKey);

      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timer);

      // Retry on transient server errors (502, 503, 504) or rate limit (429)
      if ((res.status === 429 || res.status >= 502) && attempt < maxRetries) {
        attempt++;
        const jitter = Math.random() * 150;
        const delay = Math.min(2500, 300 * Math.pow(2, attempt) + jitter);
        console.warn(`[API] Transient response ${res.status} from ${url}. Retrying attempt ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      return res;
    } catch (error: any) {
      clearTimeout(timer);

      const isAbort = error.name === 'AbortError';
      const isNetworkError = error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError');

      if ((isAbort || isNetworkError) && attempt < maxRetries) {
        attempt++;
        const jitter = Math.random() * 150;
        const delay = Math.min(2500, 400 * Math.pow(2, attempt) + jitter);
        console.warn(`[API] Network failure on ${url} (${error.message}). Retrying attempt ${attempt}/${maxRetries} in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isAbort) {
        throw new Error(`Request timed out after ${timeoutMs / 1000} seconds. Please check your network and try again.`);
      }

      throw error;
    }
  }

  throw new Error(`Request to ${url} failed after ${maxRetries} retry attempts.`);
}

/**
 * Deduplicated request executor
 * If an identical request is already pending, shares the same Promise.
 */
function deduplicate<T>(dedupeKey: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(dedupeKey);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = fn().finally(() => {
    inFlightRequests.delete(dedupeKey);
  });

  inFlightRequests.set(dedupeKey, promise);
  return promise;
}

// =========================================================================
// Public Service API Methods
// =========================================================================

export const checkApiHealth = async (): Promise<{ status: string; geminiConfigured: boolean }> => {
  try {
    const res = await resilientFetch(`${API_BASE}/health`, { method: 'GET' }, 5000, 1);
    if (!res.ok) throw new Error(`Health check returned status ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API health check warning:', err);
    return { status: 'offline', geminiConfigured: false };
  }
};

export const explainSignPhrase = async (phrase: string): Promise<GeminiExplainerResult> => {
  const cleanPhrase = phrase?.trim();
  if (!cleanPhrase) {
    throw new Error('Please enter an English word or phrase to explain.');
  }

  // Check client cache first (instant response)
  const cacheKey = `sign_${cleanPhrase}`;
  const cached = getCached<GeminiExplainerResult>(cacheKey);
  if (cached) {
    return cached;
  }

  return deduplicate(cacheKey, async () => {
    const res = await resilientFetch(
      `${API_BASE}/gemini/explain-sign`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phrase: cleanPhrase }),
      },
      18000,
      2
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with error status ${res.status}`);
    }

    const data: GeminiExplainerResult = await res.json();
    setCached(cacheKey, data, 1800); // Cache for 30 minutes
    return data;
  });
};

export const summarizeTranscript = async (transcript: string): Promise<SummarizerOutput> => {
  const cleanTranscript = transcript?.trim();
  if (!cleanTranscript || cleanTranscript.length < 15) {
    throw new Error('Please enter at least 15 characters of transcript or conversation.');
  }

  const dedupeKey = `sum_${cleanTranscript.slice(0, 80)}_${cleanTranscript.length}`;
  const cached = getCached<SummarizerOutput>(dedupeKey);
  if (cached) {
    return cached;
  }

  return deduplicate(dedupeKey, async () => {
    const res = await resilientFetch(
      `${API_BASE}/gemini/summarize`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: cleanTranscript }),
      },
      25000, // Longer timeout for summarizer
      2
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with error status ${res.status}`);
    }

    const data: SummarizerOutput = await res.json();
    setCached(dedupeKey, data, 900); // Cache for 15 minutes
    return data;
  });
};

export const askAccessibilityAssistant = async (
  message: string,
  history: ChatMessage[] = []
): Promise<string> => {
  const cleanMessage = message?.trim();
  if (!cleanMessage) {
    throw new Error('Please enter a question or message.');
  }

  const res = await resilientFetch(
    `${API_BASE}/gemini/chat`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: cleanMessage,
        history: history.map((h) => ({ role: h.sender, content: h.content })),
      }),
    },
    20000,
    2
  );

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with error status ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
};
