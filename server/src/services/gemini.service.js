import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Per-attempt timeout. Without one, a stalled Gemini call leaves the browser on "pending" forever.
const REQUEST_TIMEOUT_MS = 40_000;

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  httpOptions: { timeout: REQUEST_TIMEOUT_MS, ...(env.GEMINI_BASE_URL ? { baseUrl: env.GEMINI_BASE_URL } : {}) },
});

// Statuses worth retrying on the fallback model.
const FALLBACK_STATUSES = new Set([404, 429, 500, 503, 504]);

const isTimeout = (err) => err?.name === 'AbortError' || err?.name === 'TimeoutError';
const statusOf = (err) => (typeof err?.status === 'number' ? err.status : undefined);

const toApiError = (err) => {
  if (err instanceof ApiError) return err;
  const status = statusOf(err);
  console.error('[gemini] request failed:', isTimeout(err) ? 'timeout' : status, err?.message?.slice(0, 300));
  if (isTimeout(err)) return new ApiError(504, 'The AI took too long to respond. Please try again.');
  if (status === 429) return new ApiError(429, 'The AI service is busy right now (free-tier rate limit). Please try again in a minute.');
  if (status === 400 || status === 403) return new ApiError(502, 'The AI service rejected the request. Check the Gemini API key/model configuration.');
  return new ApiError(502, 'The AI service is temporarily unavailable. Please try again shortly.');
};

/**
 * Generate text with Gemini. Tries GEMINI_MODEL first, then GEMINI_FALLBACK_MODEL
 * (also on timeouts, so one slow model never hangs the request).
 * @param {{system: string, prompt: string, pdf?: Buffer, maxOutputTokens?: number, temperature?: number}} opts
 */
export async function generateText({ system, prompt, pdf, maxOutputTokens = 8192, temperature = 0.7 }) {
  const contents = pdf
    ? [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } }, { text: prompt }] }]
    : prompt;

  const models = [...new Set([env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL])];
  let lastError;

  for (const model of models) {
    const started = Date.now();
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction: system, temperature, maxOutputTokens },
      });

      const text = res.text?.trim();
      if (text) {
        console.log(`[gemini] ${model} ok in ${Date.now() - started} ms`);
        return text;
      }

      if (res.promptFeedback?.blockReason) {
        throw new ApiError(422, 'Your request was blocked by the AI safety filters. Please rephrase it.');
      }
      lastError = new ApiError(502, 'The AI returned an empty response. Please try again.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) throw err;
      lastError = err;
      const status = statusOf(err);
      const retryable = isTimeout(err) || status === undefined || FALLBACK_STATUSES.has(status);
      console.warn(`[gemini] ${model} failed after ${Date.now() - started} ms (${isTimeout(err) ? 'timeout' : status ?? err?.name})`);
      if (!retryable) break;
    }
  }
  throw toApiError(lastError);
}