import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

// Statuses worth retrying on the fallback (lighter) model.
const FALLBACK_STATUSES = new Set([404, 429, 500, 503, 504]);

const toApiError = (err) => {
  if (err instanceof ApiError) return err;
  const status = err?.status ?? err?.code;
  console.error('[gemini] request failed:', status, err?.message?.slice(0, 300));
  if (status === 429) return new ApiError(429, 'The AI service is busy right now (free-tier rate limit). Please try again in a minute.');
  if (status === 400 || status === 403) return new ApiError(502, 'The AI service rejected the request. Check the Gemini API key/model configuration.');
  return new ApiError(502, 'The AI service is temporarily unavailable. Please try again shortly.');
};

/**
 * Generate text with Gemini. Tries GEMINI_MODEL first, then GEMINI_FALLBACK_MODEL.
 * @param {{system: string, prompt: string, pdf?: Buffer, maxOutputTokens?: number, temperature?: number}} opts
 */
export async function generateText({ system, prompt, pdf, maxOutputTokens = 8192, temperature = 0.7 }) {
  const contents = pdf
    ? [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } }, { text: prompt }] }]
    : prompt;

  const models = [...new Set([env.GEMINI_MODEL, env.GEMINI_FALLBACK_MODEL])];
  let lastError;

  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config: { systemInstruction: system, temperature, maxOutputTokens },
      });

      const text = res.text?.trim();
      if (text) return text;

      if (res.promptFeedback?.blockReason) {
        throw new ApiError(422, 'Your request was blocked by the AI safety filters. Please rephrase it.');
      }
      lastError = new ApiError(502, 'The AI returned an empty response. Please try again.');
    } catch (err) {
      if (err instanceof ApiError && err.status === 422) throw err;
      lastError = err;
      const status = err?.status ?? err?.code;
      if (!FALLBACK_STATUSES.has(status)) break;
      console.warn(`[gemini] ${model} failed (${status}); trying fallback if available`);
    }
  }
  throw toApiError(lastError);
}
