import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { likeSchema } from '../validators/ai.validators.js';
import { listByUser, listPublished, toggleLike, deleteCreation } from '../db/creations.repo.js';

export const getUserCreations = asyncHandler(async (req, res) => {
  res.json({ success: true, creations: await listByUser(req.userId) });
});

export const getPublishedCreations = asyncHandler(async (_req, res) => {
  res.json({ success: true, creations: await listPublished() });
});

export const toggleLikeCreation = asyncHandler(async (req, res) => {
  const { id } = likeSchema.parse(req.body);
  const result = await toggleLike(id, req.userId);
  if (!result) throw new ApiError(404, 'Creation not found.');
  res.json({ success: true, ...result });
});

export const deleteUserCreation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteCreation(id, req.userId);
  
  if (!deleted) {
    throw new ApiError(404, 'Creation not found or unauthorized.');
  }

  res.json({ success: true, message: 'Creation deleted successfully.' });
});