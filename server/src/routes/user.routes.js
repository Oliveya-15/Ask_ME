import { Router } from 'express';
import { requireUser } from '../middleware/auth.js';
import * as user from '../controllers/user.controller.js';

const router = Router();

router.use(requireUser);
router.get('/creations', user.getUserCreations);
router.get('/published-creations', user.getPublishedCreations);
router.post('/toggle-like-creation', user.toggleLikeCreation);
router.delete('/creations/:id', user.deleteUserCreation); 

export default router;