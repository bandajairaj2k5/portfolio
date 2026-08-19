/**
 * NARADH Google Authentication & Session Service
 * Performs server-side Google ID Token signature verification using `google-auth-library`.
 * Creates and manages HttpOnly server-side user sessions.
 */

const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const { db } = require('../db/database');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verify Google ID Token server-side
 */
async function verifyGoogleToken(idToken) {
  if (!idToken) {
    throw new Error('ID Token is required');
  }

  // If Client ID is configured, verify token signature against Google OAuth2Client
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com') {
    const ticket = await googleClient.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null
    };
  }

  // Fallback JWT payload decoder for development / unconfigured Client ID testing
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT Token format');
    }
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
    if (!payload.sub || !payload.email) {
      throw new Error('Invalid token payload claims');
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || null
    };
  } catch (err) {
    throw new Error('Failed to verify Google Credential: ' + err.message);
  }
}

/**
 * Upsert User into database and create session token
 */
async function createSessionForGoogleUser(googleProfile) {
  const now = new Date().toISOString();
  
  // Find or create user
  const findStmt = db.prepare('SELECT * FROM users WHERE googleId = ?');
  let user = findStmt.get(googleProfile.googleId);

  if (!user) {
    const userId = 'usr_' + crypto.randomBytes(12).toString('hex');
    const insertStmt = db.prepare(`
      INSERT INTO users (id, googleId, email, name, picture, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(userId, googleProfile.googleId, googleProfile.email, googleProfile.name, googleProfile.picture, now, now);
    user = { id: userId, googleId: googleProfile.googleId, email: googleProfile.email, name: googleProfile.name, picture: googleProfile.picture };
  } else {
    // Update name / picture if changed
    const updateStmt = db.prepare(`
      UPDATE users SET name = ?, picture = ?, updatedAt = ? WHERE id = ?
    `);
    updateStmt.run(googleProfile.name, googleProfile.picture, now, user.id);
    user.name = googleProfile.name;
    user.picture = googleProfile.picture;
  }

  // Create Session Token (Valid for 7 days)
  const sessionId = 'sess_' + crypto.randomBytes(24).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  const sessStmt = db.prepare(`
    INSERT INTO sessions (id, userId, expiresAt, createdAt)
    VALUES (?, ?, ?, ?)
  `);
  sessStmt.run(sessionId, user.id, expiresAt, now);

  return { sessionId, user };
}

/**
 * Get User by Session Token
 */
function getUserBySessionId(sessionId) {
  if (!sessionId) return null;

  const stmt = db.prepare(`
    SELECT s.id as sessionId, s.expiresAt, u.id, u.googleId, u.email, u.name, u.picture
    FROM sessions s
    JOIN users u ON s.userId = u.id
    WHERE s.id = ?
  `);
  const result = stmt.get(sessionId);

  if (!result) return null;

  // Check expiration
  if (new Date(result.expiresAt) < new Date()) {
    deleteSession(sessionId);
    return null;
  }

  return {
    id: result.id,
    googleId: result.googleId,
    email: result.email,
    name: result.name,
    picture: result.picture
  };
}

/**
 * Delete Session
 */
function deleteSession(sessionId) {
  if (!sessionId) return;
  const stmt = db.prepare('DELETE FROM sessions WHERE id = ?');
  stmt.run(sessionId);
}

module.exports = {
  verifyGoogleToken,
  createSessionForGoogleUser,
  getUserBySessionId,
  deleteSession
};
