import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { isImage, isPdf } from '../utils/files.js';
import { createCreation } from '../db/creations.repo.js';
import { generateText } from '../services/gemini.service.js';
import { generateImageBase64 } from '../services/cloudflare.service.js';
import { effectUrl, uploadBase64, uploadBuffer, waitUntilReady } from '../services/cloudinary.service.js';
import { ARTICLE_LENGTHS, articlePrompt, blogTitlePrompt, imagePrompt, resumePrompt } from '../services/prompts.js';
import { articleSchema, blogTitleSchema, imageSchema, objectSchema } from '../validators/ai.validators.js';

const ok = (res, payload) => res.status(200).json({ success: true, ...payload });

export const generateArticle = asyncHandler(async (req, res) => {
  const { topic, length } = articleSchema.parse(req.body);
  const content = await generateText({ ...articlePrompt({ topic, length }), temperature: 0.8 });
  await createCreation({ userId: req.userId, prompt: `Write an article about ${topic} (${ARTICLE_LENGTHS[length].label})`, content, type: 'article' });
  ok(res, { content });
});

export const generateBlogTitle = asyncHandler(async (req, res) => {
  const { keyword, category } = blogTitleSchema.parse(req.body);
  const content = await generateText({ ...blogTitlePrompt({ keyword, category }), maxOutputTokens: 2048, temperature: 0.9 });
  await createCreation({ userId: req.userId, prompt: `Generate a blog title for the keyword ${keyword} in the category ${category}.`, content, type: 'blog-title' });
  ok(res, { content });
});

export const generateImage = asyncHandler(async (req, res) => {
  const { prompt, style, publish } = imageSchema.parse(req.body);
  const base64 = await generateImageBase64(imagePrompt({ prompt, style }));
  const { secure_url: content } = await uploadBase64(base64);
  await createCreation({ userId: req.userId, prompt, content, type: 'image', publish });
  ok(res, { content });
});

export const removeBackground = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload an image.');
  if (!isImage(req.file.buffer)) throw new ApiError(415, 'The uploaded file is not a valid image.');

  const upload = await uploadBuffer(req.file.buffer);
  const content = effectUrl(upload, 'background_removal', 'png');
  await waitUntilReady(content);
  await createCreation({ userId: req.userId, prompt: 'Remove background from image', content, type: 'image' });
  ok(res, { content });
});

export const removeObject = asyncHandler(async (req, res) => {
  const { object } = objectSchema.parse(req.body);
  if (!req.file) throw new ApiError(400, 'Please upload an image.');
  if (!isImage(req.file.buffer)) throw new ApiError(415, 'The uploaded file is not a valid image.');

  const upload = await uploadBuffer(req.file.buffer);
  const content = effectUrl(upload, `gen_remove:prompt_${object}`);
  await waitUntilReady(content);
  await createCreation({ userId: req.userId, prompt: `Removed ${object} from image`, content, type: 'image' });
  ok(res, { content });
});

export const reviewResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Please upload your resume as a PDF.');
  if (!isPdf(req.file.buffer)) throw new ApiError(415, 'The uploaded file is not a valid PDF.');

  const content = await generateText({ ...resumePrompt(), pdf: req.file.buffer, temperature: 0.4 });
  await createCreation({ userId: req.userId, prompt: 'Review the uploaded resume', content, type: 'resume-review' });
  ok(res, { content });
});
