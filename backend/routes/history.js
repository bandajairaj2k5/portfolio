/**
 * NARADH Routing History Routes
 * GET /api/history
 * DELETE /api/history
 */

const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { db } = require('../db/database');

router.use(requireAuth);

/**
 * GET /api/history
 * Get routing history for authenticated user (latest 30)
 */
router.get('/', (req, res) => {
  const stmt = db.prepare(`
    SELECT * FROM routing_history WHERE userId = ? ORDER BY createdAt DESC LIMIT 30
  `);
  const history = stmt.all(req.user.id);
  res.json({ history });
});

/**
 * DELETE /api/history
 * Clear routing history for authenticated user
 */
router.delete('/', (req, res) => {
  const stmt = db.prepare('DELETE FROM routing_history WHERE userId = ?');
  stmt.run(req.user.id);
  res.json({ success: true, message: 'History cleared successfully.' });
});

module.exports = router;
