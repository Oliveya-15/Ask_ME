import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

const endpoint = () =>
  `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${env.CLOUDFLARE_IMAGE_MODEL}`;

/** Text-to-image via Cloudflare Workers AI (FLUX.1 schnell). Returns a base64 JPEG string. */
export async function generateImageBase64(prompt) {
  let res;
  try {
    res = await fetch(endpoint(), {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, steps: 6 }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    console.error('[cloudflare] network error:', err.message);
    throw new ApiError(504, 'Image generation timed out. Please try again.');
  }

  const json = await res.json().catch(() => null);

  if (!res.ok || json?.success === false) {
    console.error('[cloudflare] error:', res.status, JSON.stringify(json?.errors ?? json)?.slice(0, 300));
    if (res.status === 429) throw new ApiError(429, 'Daily free image quota reached. Please try again tomorrow.');
    if (res.status === 401 || res.status === 403) throw new ApiError(502, 'Image service credentials are invalid.');
    if (res.status === 400) throw new ApiError(422, 'That prompt could not be processed. Try describing the image differently.');
    throw new ApiError(502, 'Image generation failed. Please try again.');
  }

  const image = json?.result?.image ?? json?.image;
  if (!image) throw new ApiError(502, 'Image service returned no image.');
  return image;
}
