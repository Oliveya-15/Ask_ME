import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

// Initialize Cloudinary SDK for delivery URLs and URL builder helpers
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Standardized error logger for upload failures.
 */
const wrapUpload = (err) => {
  console.error('[cloudinary] upload failed:', err?.message || err);
  return new ApiError(502, 'Could not store the image. Please try again.');
};

/**
 * Upload a base64 image using direct fetch with the unsigned preset 
 * to bypass account-level signed API key upload restrictions.
 */
export async function uploadBase64(base64, folder = 'askme/generated') {
  try {
    const formData = new FormData();
    formData.append('file', `data:image/jpeg;base64,${base64}`);
    formData.append('upload_preset', 'askme_unsigned');
    formData.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary status ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    throw wrapUpload(err);
  }
}

/**
 * Upload an in-memory file buffer using direct fetch with the unsigned preset.
 */
export async function uploadBuffer(buffer, folder = 'askme/uploads') {
  try {
    const blob = new Blob([buffer]);
    const formData = new FormData();
    formData.append('file', blob);
    formData.append('upload_preset', 'askme_unsigned');
    formData.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary status ${res.status}: ${errText}`);
    }

    return await res.json();
  } catch (err) {
    throw wrapUpload(err);
  }
}

/**
 * Build a delivery URL that applies an AI transformation effect to an uploaded asset.
 */
export const effectUrl = (upload, effect, format) =>
  cloudinary.url(upload.public_id, {
    secure: true,
    version: upload.version,
    resource_type: 'image',
    type: 'upload',
    format,
    transformation: [{ effect }],
  });

/**
 * AI transformations are computed on first request and may return 423 while processing.
 * Poll until the derived image is ready so the client never receives a half-ready URL.
 */
export async function waitUntilReady(url, { attempts = 20, delayMs = 2500 } = {}) {
  for (let i = 0; i < attempts; i++) {
    let res;
    try {
      res = await fetch(url, { signal: AbortSignal.timeout(45_000) });
    } catch {
      res = null; // Network blip or timeout: retry
    }

    if (res?.ok) {
      await res.body?.cancel();
      return;
    }

    if (res && res.status !== 423 && res.status !== 202) {
      const reason = res.headers.get('x-cld-error') || `status ${res.status}`;
      console.error('[cloudinary] transformation failed:', reason);
      if (/add-?on|not enabled|not supported|quota|limit|credit/i.test(reason)) {
        throw new ApiError(503, 'This AI image feature is unavailable: the Cloudinary free credits may be used up, or the account region does not support it.');
      }
      throw new ApiError(502, 'The image could not be processed. Try a different image.');
    }

    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new ApiError(504, 'Image processing is taking too long. Please try again.');
}