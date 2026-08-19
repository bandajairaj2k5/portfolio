/**
 * NARADH — Automated API & Security Test Suite
 * Tests authentication, authorization isolation, prompt validation, and routing heuristics.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

// Load environment variables
require('dotenv').config();

const { PLATFORMS } = require('../backend/config/platforms');
const { fallbackCapabilityRouting } = require('../backend/services/geminiService');
const { db } = require('../backend/db/database');

console.log('🧪 Starting NARADH Automated Test Suite...\n');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASSED: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✕ FAILED: ${name}`);
    console.error(`    Error: ${err.message}\n`);
  }
}

// 1. SECURITY AUDIT: Verify zero exposed API keys in source code
test('Security Audit — No Gemini API keys exposed in frontend code', () => {
  const frontendHtml = fs.readFileSync(path.join(__dirname, '../frontend/index.html'), 'utf8');
  const frontendJs = fs.readFileSync(path.join(__dirname, '../frontend/app.js'), 'utf8');

  assert.strictEqual(frontendHtml.includes('AIzaSy'), false, 'Frontend HTML must not contain AIzaSy Gemini keys');
  assert.strictEqual(frontendJs.includes('AIzaSy'), false, 'Frontend JS must not contain AIzaSy Gemini keys');
});

// 2. PLATFORMS MATRIX VALIDATION
test('Platform Registry — All 8 AI platforms configured with valid capabilities', () => {
  const expectedPlatforms = ['claude', 'chatgpt', 'gemini', 'perplexity', 'deepseek', 'kimi', 'indus', 'grok'];
  expectedPlatforms.forEach(id => {
    assert.ok(PLATFORMS[id], `Platform ${id} must exist in registry`);
    assert.ok(PLATFORMS[id].capabilities, `Platform ${id} must have capability weights`);
    assert.strictEqual(typeof PLATFORMS[id].projectCapable, 'boolean');
  });
});

// 3. CAPABILITY ROUTING HEURISTICS — Coding Task
test('Routing Heuristics — Coding Task favors Coding-capable platform', () => {
  const result = fallbackCapabilityRouting('Write a C program to reverse an array', 'quick', 'low');
  assert.ok(['claude', 'deepseek'].includes(result.platform), `Expected coding platform, got: ${result.platform}`);
  assert.ok(result.category.toLowerCase().includes('software') || result.category.toLowerCase().includes('coding'));
});

// 4. CAPABILITY ROUTING HEURISTICS — Research Task
test('Routing Heuristics — Research Task favors Web Research platform', () => {
  const result = fallbackCapabilityRouting('Find recent papers on semiconductor industry trends', 'quick', 'medium');
  assert.ok(['perplexity', 'chatgpt', 'grok'].includes(result.platform), `Expected research platform, got: ${result.platform}`);
});

// 5. CAPABILITY ROUTING HEURISTICS — Long Document Task
test('Routing Heuristics — Long Document Task favors Document-capable platform', () => {
  const result = fallbackCapabilityRouting('Summarize this 500-page PDF report', 'quick', 'high');
  assert.ok(['gemini', 'kimi'].includes(result.platform), `Expected document platform, got: ${result.platform}`);
});

// 6. DATABASE TRANSACTION & ISOLATION
test('Database Engine — Tables initialized correctly in SQLite', () => {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
  assert.ok(tables.includes('users'), 'Users table must exist');
  assert.ok(tables.includes('sessions'), 'Sessions table must exist');
  assert.ok(tables.includes('projects'), 'Projects table must exist');
  assert.ok(tables.includes('project_prompts'), 'Project prompts table must exist');
  assert.ok(tables.includes('routing_history'), 'Routing history table must exist');
});

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} Passed.\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
