# Jairaj's Portfolio — Setup & Editing Guide

## Quick Start
This is a static site with one serverless function. Deploy to Vercel:

1. Push this folder to a GitHub repo
2. Import the repo on [vercel.com](https://vercel.com)
3. Add environment variable `GEMINI_API_KEY` (your Google Gemini free-tier API key)
4. Deploy

For local dev: run `npx serve` in the project root.

## File Structure
```
index.html              ← Main page (all sections)
404.html                ← Error page
vercel.json             ← Vercel config
api/chat.js             ← Serverless function (Gemini AI chatbot)
assets/
  css/                  ← All stylesheets
  js/                   ← All JavaScript
  data/                 ← Editable content (projects, skills, certs, etc.)
  images/               ← Favicon, OG cover
  projects/             ← Put project photos here
  certs/                ← Put certificate files here
  resume/               ← Put resume.pdf here
```

## What to Edit (and Where)

| Content | File |
|---|---|
| Your photo | Replace `assets/images/profile.jpg` (then update the HTML) |
| Resume | Replace `assets/resume/resume.pdf` |
| Projects | `assets/data/projects.js` |
| Skills | `assets/data/skills.js` |
| Certifications | `assets/data/certs.js` |
| Lab modules | `assets/data/lab.js` |
| AI knowledge base | `assets/data/knowledge-base.js` AND `api/chat.js` (both must match) |
| Contact links | `index.html` — search for "CONTACT PLACEHOLDER" |
| Project photos | Put in `assets/projects/`, set `image` field in `projects.js` |
| Certificate files | Put in `assets/certs/`, set `file` field in `certs.js` |

## AI Chatbot
- Uses Google Gemini free tier (`gemini-1.5-flash`)
- API key stored as Vercel env var `GEMINI_API_KEY` — never in client code
- Falls back to local FAQ matching if the API is down or key is missing
- Knowledge base is in `assets/data/knowledge-base.js` (client reference) and duplicated in `api/chat.js` (server)
- To update what the bot knows: edit BOTH files
