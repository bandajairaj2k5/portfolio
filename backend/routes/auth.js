/**
 * NARADH Authentication Routes
 * /api/auth/google, /api/auth/logout, /api/auth/me
 */

const express = require('express');
const router = express.Router();
const { authRateLimiter } = require('../middleware/rateLimiter');
const { verifyGoogleToken, createSessionForGoogleUser, deleteSession } = require('../services/authService');
const { requireAuth } = require('../middleware/auth');

/**
 * POST /api/auth/google
 * Verify Google ID Token & Create Server HttpOnly Session
 */
router.post('/google', authRateLimiter, async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Google ID Token is required'
        }
      });
    }

    // Verify token server-side
    const googleProfile = await verifyGoogleToken(idToken);

    // Upsert user & create session token
    const { sessionId, user } = await createSessionForGoogleUser(googleProfile);

    // Set secure HttpOnly session cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('naradh_session', sessionId, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 Days
    });

    res.json({
      user: {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    });

  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Destroy server session & clear cookie
 */
router.post('/logout', (req, res) => {
  const sessionId = req.cookies.naradh_session;
  if (sessionId) {
    deleteSession(sessionId);
  }
  res.clearCookie('naradh_session');
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Return current authenticated user profile
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: req.user
  });
});

module.exports = router;
