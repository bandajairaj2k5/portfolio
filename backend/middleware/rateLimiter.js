/**
 * NARADH Rate Limiting Middleware
 * Protects backend API endpoints against rate-limit exhaustion and brute force attacks.
 */

const rateLimit = require('express-rate-limit');

// Rate Limiter for AI Prompt Routing: Max 30 requests per 15 minutes per IP
const routeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many routing requests. Please wait a moment and try again.'
    }
  }
});

// Rate Limiter for Auth endpoints: Max 15 requests per 15 minutes per IP
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.'
    }
  }
});

module.exports = {
  routeRateLimiter,
  authRateLimiter
};
