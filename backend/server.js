/**
 * NARADH — Personal AI Task Router (Production Full-Stack Server)
 * Main Express Backend Application Entry Point
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');

const { errorHandler } = require('./middleware/errorHandler');
const { PLATFORMS } = require('./config/platforms');

const authRoutes = require('./routes/auth');
const routeRoutes = require('./routes/route');
const projectRoutes = require('./routes/projects');
const historyRoutes = require('./routes/history');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Headers (Helmet configured to support Google Identity Services)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://accounts.google.com/gsi/client"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://accounts.google.com/gsi/style"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        connectSrc: ["'self'", "https://accounts.google.com", "https://generativelanguage.googleapis.com"],
        frameSrc: ["'self'", "https://accounts.google.com"]
      }
    },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  })
);

// CORS Policy
const allowedOrigin = process.env.ALLOWED_ORIGIN || true;
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true
  })
);

// Body and Cookie Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve Static Frontend Assets
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/route', routeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/history', historyRoutes);

// Public Config Endpoint (exposes public GOOGLE_CLIENT_ID to frontend)
app.get('/api/config', (req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Canonical Platforms List Endpoint
app.get('/api/platforms', (req, res) => {
  res.json({ platforms: PLATFORMS });
});

// Fallback Route for Single Page Frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler
app.use(errorHandler);

// Start Server on 0.0.0.0 (All Network Interfaces)
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`⚡ NARADH Server running at http://localhost:${PORT}`);
  console.log(`- Network Access: http://${HOST}:${PORT}`);
  console.log(`- Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`- Gemini Model: ${process.env.GEMINI_ROUTER_MODEL || 'gemini-2.5-flash-lite'}`);
});

module.exports = app;
