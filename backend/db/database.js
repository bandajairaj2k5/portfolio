/**
 * NARADH Persistent Storage Database Engine
 * Uses Node.js native `node:sqlite` DatabaseSync module with automatic table creation & migrations.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, 'naradh.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable Foreign Keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize Tables
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      googleId TEXT UNIQUE NOT NULL,
      email TEXT NOT NULL,
      name TEXT NOT NULL,
      picture TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      expiresAt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      platform TEXT NOT NULL,
      title TEXT NOT NULL,
      initialGoal TEXT NOT NULL,
      category TEXT NOT NULL,
      reasoning TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS project_prompts (
      id TEXT PRIMARY KEY,
      projectId TEXT NOT NULL,
      prompt TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS routing_history (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      projectId TEXT,
      prompt TEXT NOT NULL,
      platform TEXT NOT NULL,
      category TEXT NOT NULL,
      reason TEXT NOT NULL,
      confidence REAL NOT NULL DEFAULT 0.9,
      mode TEXT NOT NULL DEFAULT 'quick',
      effort TEXT NOT NULL DEFAULT 'low',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_projects_userId ON projects(userId);
    CREATE INDEX IF NOT EXISTS idx_history_userId ON routing_history(userId);
    CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
  `);
}

initDatabase();

module.exports = { db };
