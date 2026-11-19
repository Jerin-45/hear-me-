/**
 * HearMe AI - Enterprise Gemini API Routes
 * Upgraded with TRACEN System Design:
 * - Topic 1: Rate Limiting (aiLimiter)
 * - Topic 2: Multi-tier Caching (LRU/TTL)
 * - Topic 10: Circuit Breaker for Gemini API
 * - Topic 14: Input Validation & Sanitization
 * - Topic 15: Concurrency-Controlled Async Task Queue
 * - Topic 16 & 17: Decoupled Telemetry & Audit Event Bus
 */

import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { aiLimiter } from '../utils/rateLimiter.ts';
import { signExplainerCache, summarizerCache, chatCache } from '../utils/cache.ts';
import { geminiCircuitBreaker } from '../utils/circuitBreaker.ts';
import { heavyAiQueue } from '../utils/asyncQueue.ts';
import { eventBus } from '../utils/eventBus.ts';
import { validateExplainSign, validateSummarize, validateChat } from '../middleware/validation.ts';

export const geminiRouter = express.Router();

// Apply AI-specific rate limiter (20 requests/minute per client IP)
geminiRouter.use(aiLimiter.middleware());

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Helper to sanitize Gemini JSON response
const extractJsonFromText = (text: string) => {
  const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(clean);
  } catch (e) {
    return null;
  }
};

// =========================================================================
// 1. AI Sign Language Explainer Endpoint
// Protected by: Caching (LRU/TTL), Circuit Breaker, Validation, Telemetry
// =========================================================================
geminiRouter.post('/explain-sign', validateExplainSign, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { phrase } = req.body;

  // 1. Check in-memory Cache
  const cached = signExplainerCache.get(phrase);
  if (cached) {
    eventBus.publish('ai:cache_hit', { key: phrase, endpoint: '/api/gemini/explain-sign' });
    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/explain-sign',
      durationMs: Date.now() - startTime,
      cached: true,
      requestId,
    });
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  res.setHeader('X-Cache', 'MISS');

  // Fallback educational result for common terms or when API is offline
  const getFallbackResult = () => ({
    phrase,
    meaning: `The phrase "${phrase}" is commonly used in English daily communication.`,
    context: 'Used during interpersonal conversations, classrooms, public counters, or assistive dialogue.',
    simpleExplanation: `In accessible communication, "${phrase}" expresses a direct and clear sentiment. When communicating with deaf or hard-of-hearing individuals, accompany this phrase with clear facial expressions, steady eye contact, and open body language.`,
    signGuidance: `In Indian Sign Language (ISL), this concept is conveyed using deliberate hand shape, location, and natural facial non-manual markers. Always sign steadily at chest or face level without rushing.`,
    politeAlternatives: [
      `Could I please ask regarding: ${phrase}`,
      `Excuse me, ${phrase}`,
      `Pardon me, could you clarify: ${phrase}`,
    ],
    verifiedReferenceNote: 'Verified ISLRTC references should be consulted for formal Indian Sign Language certification.',
  });

  if (!genAI) {
    const fallback = getFallbackResult();
    signExplainerCache.set(phrase, fallback, 1800);
    return res.json(fallback);
  }

  try {
    // Execute through Circuit Breaker to protect against upstream outages
    const explanationResult = await geminiCircuitBreaker.execute(
      async () => {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
          systemInstruction:
            'You are an expert hearing accessibility educator and English communication specialist for HearMe AI. ' +
            'CRITICAL RULE: The entire response MUST BE IN ENGLISH ONLY. Do not use Hindi, Tamil, or any other language. ' +
            'Provide accurate, polite, accessible explanations. Emphasize Indian Sign Language (ISL) context where applicable. ' +
            'Do not claim that text replaces certified sign language lessons. Output strictly valid JSON matching this schema: ' +
            '{"phrase": string, "meaning": string, "context": string, "simpleExplanation": string, "signGuidance": string, "politeAlternatives": string[], "verifiedReferenceNote": string}',
        });

        const prompt = `Analyze and provide hearing accessibility and sign-language communication guidance for the English phrase: "${phrase}".`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = extractJsonFromText(text);

        if (parsed) {
          return parsed;
        } else {
          return {
            phrase,
            meaning: 'Expressed meaning in conversational English.',
            context: 'Daily interaction and accessible dialogue.',
            simpleExplanation: text,
            signGuidance: 'Observe clean hand shapes and respectful eye contact.',
            politeAlternatives: ['Could you please assist?', 'Thank you for your time.'],
            verifiedReferenceNote: 'Reference Indian Sign Language Research and Training Centre (ISLRTC) standards.',
          };
        }
      },
      // Circuit Breaker Fallback
      () => getFallbackResult()
    );

    // Store in Cache
    signExplainerCache.set(phrase, explanationResult);

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/explain-sign',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json(explanationResult);
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/explain-sign',
      error: error.message || 'Unknown AI error',
      requestId,
    });
    console.error(`[Gemini Explainer Error] (Req: ${requestId}):`, error);
    return res.status(500).json({
      error: error.message || 'Failed to generate sign language explanation from AI service.',
      requestId,
    });
  }
});

// =========================================================================
// 2. AI Conversation Summarizer Endpoint
// Protected by: Async Queue (Topic 15), Caching, Circuit Breaker, Validation
// =========================================================================
geminiRouter.post('/summarize', validateSummarize, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { transcript } = req.body;

  // 1. Check in-memory Cache (cache key is hash or normalized prefix+length)
  const cacheKey = `${transcript.slice(0, 100)}_${transcript.length}`;
  const cached = summarizerCache.get(cacheKey);
  if (cached) {
    eventBus.publish('ai:cache_hit', { key: cacheKey, endpoint: '/api/gemini/summarize' });
    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/summarize',
      durationMs: Date.now() - startTime,
      cached: true,
      requestId,
    });
    res.setHeader('X-Cache', 'HIT');
    return res.json(cached);
  }

  res.setHeader('X-Cache', 'MISS');

  const getFallbackSummary = () => {
    const lines = transcript.split('\n').filter((l: string) => l.trim().length > 0);
    return {
      shortSummary: `A spoken communication transcript containing ${transcript.split(/\s+/).length} English words covering key conversational directives.`,
      importantPoints: lines.slice(0, 4).map((l: string) => l.trim()),
      instructions: ['Review the provided transcript points carefully.', 'Ensure all participants are aligned.'],
      tasksAndActions: ['Follow up on mentioned action items.', 'Verify accessibility needs of participants.'],
      datesAndDeadlines: ['Check specific timestamps or dates referenced in the transcript.'],
      simpleExplanation: 'This is a clear, simplified summary designed to ensure deaf and hard-of-hearing readers can quickly review key topics without reading verbatim long audio transcripts.',
    };
  };

  if (!genAI) {
    const fallback = getFallbackSummary();
    summarizerCache.set(cacheKey, fallback, 1800);
    return res.json(fallback);
  }

  try {
    // Route heavy summarization through Async Concurrency Queue (max 3 concurrent)
    const summaryResult = await heavyAiQueue.enqueue(async () => {
      // Execute through Circuit Breaker
      return await geminiCircuitBreaker.execute(
        async () => {
          const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
            systemInstruction:
              'You are an AI Conversation Summarizer for HearMe AI, an accessibility platform for deaf and hard-of-hearing people. ' +
              'CRITICAL RULES: ' +
              '1. ENGLISH ONLY. Never use any other language. ' +
              '2. Do not invent details, dates, or tasks that are missing from the original transcript. ' +
              '3. Provide a crystal-clear, structured breakdown. ' +
              'Output strictly valid JSON with keys: ' +
              '{"shortSummary": string, "importantPoints": string[], "instructions": string[], "tasksAndActions": string[], "datesAndDeadlines": string[], "simpleExplanation": string}',
          });

          const prompt = `Summarize this spoken conversation transcript with high fidelity and clarity:\n\n"""${transcript}"""`;
          const result = await model.generateContent(prompt);
          const text = result.response.text();
          const parsed = extractJsonFromText(text);

          if (parsed) {
            return parsed;
          } else {
            return {
              shortSummary: 'Summary of the provided conversation transcript.',
              importantPoints: [text.slice(0, 150)],
              instructions: ['Review important points above.'],
              tasksAndActions: ['Take appropriate follow-up actions.'],
              datesAndDeadlines: ['No explicit deadlines identified.'],
              simpleExplanation: text,
            };
          }
        },
        () => getFallbackSummary()
      );
    }, requestId);

    // Cache summary
    summarizerCache.set(cacheKey, summaryResult);

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/summarize',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json(summaryResult);
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/summarize',
      error: error.message || 'Unknown summarizer error',
      requestId,
    });
    console.error(`[Gemini Summarizer Error] (Req: ${requestId}):`, error);
    return res.status(500).json({
      error: error.message || 'Failed to generate conversation summary from AI service.',
      requestId,
    });
  }
});

// =========================================================================
// 3. AI Accessibility Assistant Chat Endpoint
// Protected by: Caching, Circuit Breaker, Validation, Context Window Truncation
// =========================================================================
geminiRouter.post('/chat', validateChat, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;
  const { message, history } = req.body;

  // Check cache for standalone questions without prior history
  const isFreshQuestion = !history || history.length === 0;
  if (isFreshQuestion) {
    const cachedReply = chatCache.get(message);
    if (cachedReply) {
      eventBus.publish('ai:cache_hit', { key: message, endpoint: '/api/gemini/chat' });
      eventBus.publish('ai:completed', {
        endpoint: '/api/gemini/chat',
        durationMs: Date.now() - startTime,
        cached: true,
        requestId,
      });
      res.setHeader('X-Cache', 'HIT');
      return res.json({ reply: cachedReply });
    }
  }

  res.setHeader('X-Cache', 'MISS');

  const getFallbackReply = () => {
    const lower = message.toLowerCase();
    let reply = 'HearMe AI is dedicated to providing communication without barriers for deaf and hard-of-hearing individuals.';
    if (lower.includes('caption') || lower.includes('speech')) {
      reply = 'Live Caption Studio converts spoken English (en-IN and en-US) into real-time visual captions with custom font sizes, high-contrast modes, and download capabilities.';
    } else if (lower.includes('sign') || lower.includes('isl')) {
      reply = 'Indian Sign Language (ISL) is a rich visual-spatial language with its own grammar and vocabulary. HearMe AI offers a categorized learning library and an AI Explainer to help bridge communication.';
    } else if (lower.includes('camera') || lower.includes('gesture')) {
      reply = 'Camera Sign Recognition is an experimental prototype using MediaPipe hand landmark tracking to identify 5 core gestures: HELLO, HELP, YES, NO, and THANK YOU.';
    } else if (lower.includes('communicate') || lower.includes('tips')) {
      reply = 'Key accessibility communication tips: 1. Face the person directly and speak clearly without shouting. 2. Ensure adequate lighting. 3. Use HearMe AI Live Captions or Text-to-Speech. 4. Never hesitate to write or type messages.';
    }
    return reply;
  };

  if (!genAI) {
    const reply = getFallbackReply();
    if (isFreshQuestion) {
      chatCache.set(message, reply);
    }
    return res.json({ reply });
  }

  try {
    const reply = await geminiCircuitBreaker.execute(
      async () => {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction:
            'You are the HearMe AI Accessibility Assistant, an AI expert focused exclusively on hearing accessibility, deaf communication etiquette, Indian Sign Language (ISL) basics, assistive technology, and navigating HearMe AI features. ' +
            'CRITICAL RULES: ' +
            '1. Respond STRICTLY IN ENGLISH ONLY. ' +
            '2. Keep responses supportive, polite, and accessible. ' +
            '3. Explicitly state that you do not replace certified human sign language interpreters or professional medical audiologists. ' +
            '4. Explain features of HearMe AI clearly: Live Caption Studio, Sign Language Library, AI Sign Explainer, Camera Gesture Recognition, Text-to-Speech, and Summarizer.',
        });

        const chatHistory = Array.isArray(history)
          ? history.map((item: any) => ({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }],
            }))
          : [];

        const chat = model.startChat({
          history: chatHistory,
        });

        const result = await chat.sendMessage(message);
        return result.response.text();
      },
      () => getFallbackReply()
    );

    if (isFreshQuestion) {
      chatCache.set(message, reply);
    }

    eventBus.publish('ai:completed', {
      endpoint: '/api/gemini/chat',
      durationMs: Date.now() - startTime,
      cached: false,
      requestId,
    });

    return res.json({ reply });
  } catch (error: any) {
    eventBus.publish('ai:error', {
      endpoint: '/api/gemini/chat',
      error: error.message || 'Unknown chat error',
      requestId,
    });
    console.error(`[Gemini Chat Error] (Req: ${requestId}):`, error);
    return res.status(500).json({
      error: error.message || 'Failed to generate assistant response from AI service.',
      requestId,
    });
  }
});
