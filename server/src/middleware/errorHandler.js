import multer from 'multer';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = 500;
  let message = 'Something went wrong on our side. Please try again.';

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
  } else if (err instanceof ZodError) {
    status = 400;
    message = err.issues.map((i) => i.message).join('. ');
  } else if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large.' : 'Invalid file upload.';
  } else if (err?.type === 'entity.parse.failed') {
    status = 400;
    message = 'Malformed JSON body.';
  } else {
    console.error('[error]', err);
  }

  res.status(status).json({ success: false, message, ...(env.NODE_ENV !== 'production' && status === 500 ? { debug: err?.message } : {}) });
};
