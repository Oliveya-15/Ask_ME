// Express 5 forwards rejected promises automatically, but keeping an explicit
// wrapper makes intent obvious and keeps the code portable to Express 4.
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
