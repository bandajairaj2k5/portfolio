# ⚡ NARADH — Personal AI Task Router (Production Full-Stack Edition)

NARADH is a high-performance, security-hardened AI task routing engine. It analyzes user prompt intent (coding, web research, long PDF synthesis, math, Indic language, or creative strategy) and routes the task to the single best AI platform out of 8 engines (**Claude, ChatGPT, Gemini, Perplexity, DeepSeek, Kimi, Indus, Grok**) with one-click handoff.

---

## 🔒 Security Architecture Highlights

1. **Zero Client-Side API Key Exposure**:
   - Secrets (`GEMINI_API_KEY`, `SESSION_SECRET`, `GOOGLE_CLIENT_SECRET`) are stored **strictly on the backend** in environment variables (`.env`).
   - The browser never communicates directly with Gemini API keys. All calls pass through `POST /api/route`.
2. **Google OAuth Token Verification & HttpOnly Sessions**:
   - `GOOGLE_CLIENT_ID` is a public configuration parameter passed to Google Identity Services (GIS).
   - The backend verifies ID token signatures server-side via `google-auth-library` (`POST /api/auth/google`).
   - Sessions are created server-side and issued as secure `HttpOnly`, `SameSite=Lax` cookies (`naradh_session`).
3. **Database Authorization Scoping**:
   - User identity (`req.user.id`) is enforced on all data queries. Users can only access, modify, or delete their own projects and history.
4. **XSS & DOM Injection Immunity**:
   - Dynamic user data is bound exclusively via `element.textContent` and HTML escaping. Zero unsafe `innerHTML` evaluation.
5. **Backend Protection**:
   - Express rate limiting on `/api/route` and `/api/auth/google`.
   - Security headers configured with `helmet` and strict Content Security Policy.

---

## 📁 Project Structure

```
c:/Users/banaj/.vscode/AI Finder/
├── .env.example                # Environment configuration template
├── .gitignore                  # Git exclusions for secrets and node_modules
├── package.json                # Dependencies and scripts
├── README.md                   # Setup & deployment guide
├── backend/
│   ├── server.js               # Main Express application entry point
│   ├── config/
│   │   └── platforms.js        # 8 AI Platforms Registry & Capability Matrix
│   ├── db/
│   │   └── database.js         # SQLite Engine (node:sqlite) & migrations
│   ├── middleware/
│   │   ├── auth.js             # Session cookie authentication middleware
│   │   ├── errorHandler.js     # Standardized JSON error response contract
│   │   └── rateLimiter.js      # Rate limiting middleware
│   ├── routes/
│   │   ├── auth.js             # Auth endpoints (/api/auth/google, /logout, /me)
│   │   ├── history.js          # History endpoints (/api/history)
│   │   ├── projects.js         # Project endpoints (/api/projects)
│   │   └── route.js            # Prompt routing engine (/api/route)
│   └── services/
│       ├── authService.js      # Google OAuth token verification & sessions
│       └── geminiService.js    # Server-side Gemini API engine & fallback
├── frontend/
│   ├── index.html              # Clean semantic HTML interface
│   ├── styles.css              # Responsive, bright visual design stylesheet
│   └── app.js                  # Accessible frontend app controller
├── tests/
    └── api.test.js             # Automated API & security test suite
```

---

## ⚙️ Environment Setup & Configuration

1. **Clone or Copy Repository**:
   Navigate to the project root directory.

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual server configuration values:
   ```env
   PORT=3000
   NODE_ENV=development

   # Gemini API Key (SERVER-SIDE ONLY)
   GEMINI_API_KEY=AIzaSyYourActualServerKeyHere
   GEMINI_ROUTER_MODEL=gemini-2.5-flash-lite

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret

   # Session Security
   SESSION_SECRET=super_secret_32_character_random_string

   DATABASE_PATH=backend/db/naradh.db
   ```

---

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```
Access the application at **`http://localhost:3000`**.

### Running Automated Test Suite
```bash
npm test
```

---

## 🧪 Verified Test Checklist

- [x] **Client-Side Secret Audit**: Verified 0 API keys in frontend code or `localStorage`.
- [x] **Google OAuth ID Token Verification**: Verified server-side token validation and HttpOnly session cookie creation.
- [x] **Authorization Isolation**: Verified users cannot query or modify another user's projects or history.
- [x] **Rate Limiting**: Verified 429 status code emission when request thresholds are exceeded.
- [x] **Input Validation**: Verified non-empty string, length limit, mode, and effort validation on `/api/route`.
- [x] **XSS Immunity**: Verified all user inputs use `textContent` DOM binding.
- [x] **Project Mode Lifecycle**: Verified project creation, multi-turn continuation, and accessible confirmation modals.
- [x] **Responsive Layout**: Verified 320px, 375px, 430px, 768px, 1024px, and 1440px layout rendering.
