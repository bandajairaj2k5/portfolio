/**
 * NARADH Prompt Routing Route
 * POST /api/route
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { routeRateLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth');
const { routePromptWithGemini } = require('../services/geminiService');
const { db } = require('../db/database');

router.post('/', routeRateLimiter, optionalAuth, async (req, res, next) => {
  try {
    let { prompt, mode, effort } = req.body;

    // Validate Prompt Input
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PROMPT',
          message: 'User prompt is required and cannot be empty.'
        }
      });
    }

    prompt = prompt.trim();
    if (prompt.length > 5000) {
      return res.status(400).json({
        error: {
          code: 'PROMPT_TOO_LONG',
          message: 'Prompt exceeds the maximum allowed length of 5000 characters.'
        }
      });
    }

    // Validate Mode
    mode = (mode || 'quick').toLowerCase();
    if (!['quick', 'project'].includes(mode)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_MODE',
          message: 'Routing mode must be either "quick" or "project".'
        }
      });
    }

    // Validate Effort
    effort = (effort || 'low').toLowerCase();
    if (!['low', 'medium', 'high'].includes(effort)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_EFFORT',
          message: 'Effort level must be one of: "low", "medium", "high".'
        }
      });
    }

    // Call Gemini Routing Engine Service
    const result = await routePromptWithGemini(prompt, mode, effort);

    // Save to user history if authenticated
    if (req.user) {
      const historyId = 'hist_' + crypto.randomBytes(12).toString('hex');
      const stmt = db.prepare(`
        INSERT INTO routing_history (id, userId, projectId, prompt, platform, category, reason, confidence, mode, effort, createdAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        historyId,
        req.user.id,
        null,
        prompt,
        result.platform,
        result.category,
        result.reason,
        result.confidence,
        mode,
        effort,
        new Date().toISOString()
      );
    }

    res.json(result);

  } catch (err) {
    next(err);
  }
});

module.exports = router;
