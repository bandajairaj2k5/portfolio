/**
 * NARADH Project Management Routes
 * GET /api/projects
 * POST /api/projects
 * GET /api/projects/:id
 * POST /api/projects/:id/prompts
 * PATCH /api/projects/:id
 * DELETE /api/projects/:id
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { requireAuth } = require('../middleware/auth');
const { db } = require('../db/database');
const { PLATFORMS } = require('../config/platforms');

// Require Authentication for all Project endpoints
router.use(requireAuth);

/**
 * GET /api/projects
 * List all projects for authenticated user
 */
router.get('/', (req, res) => {
  const stmt = db.prepare(`
    SELECT * FROM projects WHERE userId = ? ORDER BY updatedAt DESC
  `);
  const projects = stmt.all(req.user.id);
  res.json({ projects });
});

/**
 * POST /api/projects
 * Create a new project
 */
router.post('/', (req, res) => {
  let { platform, title, initialGoal, category, reasoning } = req.body;

  if (!platform || !PLATFORMS[platform]) {
    return res.status(400).json({ error: { code: 'INVALID_PLATFORM', message: 'Valid platform ID is required.' } });
  }

  if (!initialGoal || typeof initialGoal !== 'string' || !initialGoal.trim()) {
    return res.status(400).json({ error: { code: 'INVALID_GOAL', message: 'Initial project goal is required.' } });
  }

  initialGoal = initialGoal.trim();
  title = (title && title.trim()) ? title.trim() : (initialGoal.length > 50 ? initialGoal.substring(0, 50) + '...' : initialGoal);
  category = (category && category.trim()) ? category.trim() : 'Software Project';
  reasoning = (reasoning && reasoning.trim()) ? reasoning.trim() : `Selected ${PLATFORMS[platform].name} for project context.`;

  const projectId = 'proj_' + crypto.randomBytes(12).toString('hex');
  const now = new Date().toISOString();

  const insertProj = db.prepare(`
    INSERT INTO projects (id, userId, platform, title, initialGoal, category, reasoning, status, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
  `);
  insertProj.run(projectId, req.user.id, platform, title, initialGoal, category, reasoning, now, now);

  // Add initial prompt entry
  const promptId = 'prm_' + crypto.randomBytes(12).toString('hex');
  const insertPrompt = db.prepare(`
    INSERT INTO project_prompts (id, projectId, prompt, createdAt)
    VALUES (?, ?, ?, ?)
  `);
  insertPrompt.run(promptId, projectId, initialGoal, now);

  const projectObj = {
    id: projectId,
    userId: req.user.id,
    platform: platform,
    title: title,
    initialGoal: initialGoal,
    category: category,
    reasoning: reasoning,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    promptHistory: [{ id: promptId, prompt: initialGoal, createdAt: now }]
  };

  res.status(201).json({ project: projectObj });
});

/**
 * GET /api/projects/:id
 * Get single project details with prompt history
 */
router.get('/:id', (req, res) => {
  const projStmt = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?');
  const project = projStmt.get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } });
  }

  const promptStmt = db.prepare('SELECT * FROM project_prompts WHERE projectId = ? ORDER BY createdAt ASC');
  const prompts = promptStmt.all(project.id);

  project.promptHistory = prompts;
  res.json({ project });
});

/**
 * POST /api/projects/:id/prompts
 * Add follow-up prompt to active project
 */
router.post('/:id/prompts', (req, res) => {
  const { prompt } = req.body;

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: { code: 'INVALID_PROMPT', message: 'Prompt text is required.' } });
  }

  const projStmt = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?');
  const project = projStmt.get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } });
  }

  const now = new Date().toISOString();
  const promptId = 'prm_' + crypto.randomBytes(12).toString('hex');

  const insertPrompt = db.prepare(`
    INSERT INTO project_prompts (id, projectId, prompt, createdAt)
    VALUES (?, ?, ?, ?)
  `);
  insertPrompt.run(promptId, project.id, prompt.trim(), now);

  // Update project updatedAt timestamp
  const updateProj = db.prepare('UPDATE projects SET updatedAt = ? WHERE id = ?');
  updateProj.run(now, project.id);

  res.status(201).json({
    prompt: { id: promptId, projectId: project.id, prompt: prompt.trim(), createdAt: now }
  });
});

/**
 * PATCH /api/projects/:id
 * Update project details (status, title, or platform change)
 */
router.patch('/:id', (req, res) => {
  const { status, title, platform } = req.body;
  const projStmt = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?');
  const project = projStmt.get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } });
  }

  const now = new Date().toISOString();
  const newStatus = status || project.status;
  const newTitle = title || project.title;
  const newPlatform = (platform && PLATFORMS[platform]) ? platform : project.platform;

  const updateStmt = db.prepare(`
    UPDATE projects SET status = ?, title = ?, platform = ?, updatedAt = ? WHERE id = ?
  `);
  updateStmt.run(newStatus, newTitle, newPlatform, now, project.id);

  res.json({
    project: { ...project, status: newStatus, title: newTitle, platform: newPlatform, updatedAt: now }
  });
});

/**
 * DELETE /api/projects/:id
 * Delete project and prompts
 */
router.delete('/:id', (req, res) => {
  const projStmt = db.prepare('SELECT * FROM projects WHERE id = ? AND userId = ?');
  const project = projStmt.get(req.params.id, req.user.id);

  if (!project) {
    return res.status(404).json({ error: { code: 'PROJECT_NOT_FOUND', message: 'Project not found.' } });
  }

  const delStmt = db.prepare('DELETE FROM projects WHERE id = ?');
  delStmt.run(project.id);

  res.json({ success: true, message: 'Project deleted successfully.' });
});

module.exports = router;
