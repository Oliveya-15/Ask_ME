import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),

  // Comma-separated list of allowed browser origins (no trailing slash)
  CLIENT_URL: z.string().min(1, 'CLIENT_URL is required (e.g. http://localhost:5173)'),

  // Database (Neon Postgres)
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Auth (Clerk)
  CLERK_PUBLISHABLE_KEY: z.string().min(1, 'CLERK_PUBLISHABLE_KEY is required'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // Text AI (Google Gemini)
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required'),
  GEMINI_MODEL: z.string().default('gemini-flash-latest'),
  GEMINI_FALLBACK_MODEL: z.string().default('gemini-flash-lite-latest'),

  // Image generation (Cloudflare Workers AI)
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1, 'CLOUDFLARE_ACCOUNT_ID is required'),
  CLOUDFLARE_API_TOKEN: z.string().min(1, 'CLOUDFLARE_API_TOKEN is required'),
  CLOUDFLARE_IMAGE_MODEL: z.string().default('@cf/black-forest-labs/flux-1-schnell'),

  // Image storage + editing (Cloudinary)
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),

  // Business rules
  FREE_USAGE_LIMIT: z.coerce.number().int().nonnegative().default(10),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error('\n❌ Invalid or missing environment variables:\n');
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
  }
  console.error('\nCopy .env.example to .env and fill in the values (see the setup guide).\n');
  process.exit(1);
}

export const env = parsed.data;

export const allowedOrigins = env.CLIENT_URL.split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);
