/**
 * HearMe AI - Request Validation & Sanitization Middleware
 * Implements Security & TRACEN Topic 14 (Input Validation & Idempotency Prep)
 *
 * Validates request payload schemas, restricts maximum string lengths to prevent
 * memory exhaustion and prompt injection, and sanitizes dangerous control characters.
 */

import type { Request, Response, NextFunction } from 'express';

// Sanitizes control characters while preserving valid English text and punctuation
const sanitizeText = (text: string): string => {
  return text.replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '').trim();
};

export const validateExplainSign = (req: Request, res: Response, next: NextFunction) => {
  const { phrase } = req.body;

  if (!phrase || typeof phrase !== 'string') {
    return res.status(400).json({
      error: 'Valid English phrase string is required in request body.',
      field: 'phrase',
      code: 'INVALID_INPUT',
    });
  }

  const cleaned = sanitizeText(phrase);

  if (cleaned.length === 0) {
    return res.status(400).json({
      error: 'Phrase cannot be empty or whitespace only.',
      field: 'phrase',
      code: 'EMPTY_INPUT',
    });
  }

  if (cleaned.length > 300) {
    return res.status(400).json({
      error: 'Phrase exceeds maximum allowed length of 300 characters.',
      field: 'phrase',
      code: 'INPUT_TOO_LONG',
    });
  }

  // Attach sanitized phrase
  req.body.phrase = cleaned;
  next();
};

export const validateSummarize = (req: Request, res: Response, next: NextFunction) => {
  const { transcript } = req.body;

  if (!transcript || typeof transcript !== 'string') {
    return res.status(400).json({
      error: 'Valid spoken transcript string is required in request body.',
      field: 'transcript',
      code: 'INVALID_INPUT',
    });
  }

  const cleaned = sanitizeText(transcript);

  if (cleaned.length < 15) {
    return res.status(400).json({
      error: 'Transcript must be at least 15 characters long to summarize meaningfully.',
      field: 'transcript',
      code: 'INPUT_TOO_SHORT',
    });
  }

  if (cleaned.length > 25000) {
    return res.status(400).json({
      error: 'Transcript exceeds maximum allowed length of 25,000 characters.',
      field: 'transcript',
      code: 'INPUT_TOO_LONG',
    });
  }

  req.body.transcript = cleaned;
  next();
};

export const validateChat = (req: Request, res: Response, next: NextFunction) => {
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({
      error: 'Valid message string is required in request body.',
      field: 'message',
      code: 'INVALID_INPUT',
    });
  }

  const cleanedMessage = sanitizeText(message);

  if (cleanedMessage.length === 0) {
    return res.status(400).json({
      error: 'Message cannot be empty.',
      field: 'message',
      code: 'EMPTY_INPUT',
    });
  }

  if (cleanedMessage.length > 2000) {
    return res.status(400).json({
      error: 'Message exceeds maximum length of 2,000 characters.',
      field: 'message',
      code: 'INPUT_TOO_LONG',
    });
  }

  req.body.message = cleanedMessage;

  // Validate history array if provided
  if (history !== undefined) {
    if (!Array.isArray(history)) {
      return res.status(400).json({
        error: 'Conversation history must be an array.',
        field: 'history',
        code: 'INVALID_HISTORY',
      });
    }

    if (history.length > 50) {
      // Truncate to most recent 50 messages to prevent token overflow
      req.body.history = history.slice(-50);
    }
  }

  next();
};
