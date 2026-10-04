import { Router } from 'express';
import { requireUser, requirePremium, enforceFreeLimit } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { uploadImage, uploadResume } from '../middleware/upload.js';
import * as ai from '../controllers/ai.controller.js';

const router = Router();

router.use(requireUser, aiLimiter);

// Free plan (limited) + Premium (unlimited)
router.post('/generate-article', enforceFreeLimit, ai.generateArticle);
router.post('/generate-blog-title', enforceFreeLimit, ai.generateBlogTitle);

// Premium only
router.post('/generate-image', requirePremium, ai.generateImage);
router.post('/remove-image-background', requirePremium, uploadImage, ai.removeBackground);
router.post('/remove-image-object', requirePremium, uploadImage, ai.removeObject);
router.post('/resume-review', requirePremium, uploadResume, ai.reviewResume);

export default router;
