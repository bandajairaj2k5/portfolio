/**
 * NARADH Global Error Handler
 * Ensures consistent JSON error responses and prevents secret leakage.
 */

function errorHandler(err, req, res, next) {
  console.error('[NARADH Error]', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const errorCode = err.code || (statusCode === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');
  const userMessage = err.userMessage || err.message || 'An unexpected server error occurred.';

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 
        ? 'Internal server error. Please try again later.' 
        : userMessage
    }
  });
}

module.exports = { errorHandler };
