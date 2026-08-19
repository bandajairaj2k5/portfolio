/**
 * NARADH Authentication Middleware
 * Enforces server-side session validation from HttpOnly cookies.
 */

const { getUserBySessionId } = require('../services/authService');

function requireAuth(req, res, next) {
  const sessionId = req.cookies.naradh_session;

  if (!sessionId) {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please sign in with Google.'
      }
    });
  }

  const user = getUserBySessionId(sessionId);

  if (!user) {
    res.clearCookie('naradh_session');
    return res.status(401).json({
      error: {
        code: 'SESSION_EXPIRED',
        message: 'Session expired or invalid. Please sign in again.'
      }
    });
  }

  req.user = user;
  next();
}

/**
 * Optional Auth Middleware: Attaches req.user if authenticated session cookie is present,
 * but allows unauthenticated requests to proceed.
 */
function optionalAuth(req, res, next) {
  const sessionId = req.cookies.naradh_session;
  if (sessionId) {
    const user = getUserBySessionId(sessionId);
    if (user) {
      req.user = user;
    }
  }
  next();
}

module.exports = {
  requireAuth,
  optionalAuth
};
