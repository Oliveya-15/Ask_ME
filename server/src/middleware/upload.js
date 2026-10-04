import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const memory = multer.memoryStorage();

const make = (maxMb, allowed, label) =>
  multer({
    storage: memory,
    limits: { fileSize: maxMb * 1024 * 1024, files: 1 },
    fileFilter: (_req, file, cb) =>
      allowed.test(file.mimetype) ? cb(null, true) : cb(new ApiError(415, `Unsupported file type. Please upload ${label}.`)),
  });

export const uploadImage = make(8, /^image\/(jpeg|png|webp|gif)$/, 'a JPG, PNG, WEBP or GIF image').single('image');
export const uploadResume = make(5, /^application\/pdf$/, 'a PDF file').single('resume');
