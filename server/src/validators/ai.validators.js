import { z } from 'zod';
import { ARTICLE_LENGTHS, BLOG_CATEGORIES, IMAGE_STYLES } from '../services/prompts.js';

const text = (min, max, field) =>
  z.string({ error: `${field} is required` }).trim().min(min, `${field} is too short`).max(max, `${field} must be at most ${max} characters`);

export const articleSchema = z.object({
  topic: text(3, 300, 'Topic'),
  length: z.coerce.number().refine((n) => n in ARTICLE_LENGTHS, 'Invalid article length'),
});

export const blogTitleSchema = z.object({
  keyword: text(2, 200, 'Keyword'),
  category: z.enum(BLOG_CATEGORIES, { error: 'Invalid category' }).default('General'),
});

export const imageSchema = z.object({
  prompt: text(3, 500, 'Prompt'),
  style: z.enum(Object.keys(IMAGE_STYLES), { error: 'Invalid style' }).default('Realistic'),
  publish: z.boolean({ error: 'publish must be true or false' }).default(false),
});

// The object name is placed inside a Cloudinary effect string (e_gen_remove:prompt_<name>), where
// characters such as ; ( ) : / have special meaning. Allow only letters, numbers, spaces and hyphens.
export const objectSchema = z.object({
  object: text(2, 40, 'Object name').regex(/^[\p{L}\p{N} -]+$/u, 'Object name may only contain letters, numbers, spaces and hyphens'),
});

export const likeSchema = z.object({ id: z.coerce.number().int().positive('Invalid creation id') });
