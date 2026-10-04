# AskMe — AI Content Platform

Full-stack AI toolkit: write articles, generate blog titles, create images, remove backgrounds/objects, and get AI resume reviews. Free and Premium plans, a public community gallery with likes, and a personal dashboard.

**Live demo:** _add your Vercel URL_ · **API health:** _add your Render URL_`/health`

## Stack

| Layer | Tech | Why |
|---|---|---|
| Frontend | React 19, Vite, Tailwind CSS 4 | Fast SPA, deployed on Vercel |
| API | Node 22, Express 5 | Long-running requests suit a real Node server (Render) |
| Database | Neon PostgreSQL | Relational data, constraints, atomic updates; serverless free tier |
| Auth & plans | Clerk | Hosted auth, JWT verification, pricing table / plan checks |
| Text AI | Google Gemini (Flash) | Free tier, native PDF input for resume review |
| Image generation | Cloudflare Workers AI (FLUX.1 schnell) | Daily free allowance via REST |
| Image storage/editing | Cloudinary | CDN + AI background removal & generative remove |

## Features

- **Free plan:** article writer + blog title generator (10 generations, configurable)
- **Premium plan:** unlimited text, image generation, background removal, object removal, resume review
- Server-side plan enforcement, per-user rate limiting, validated uploads (size, MIME **and** magic bytes)
- Community gallery with atomic like-toggle, dashboard history

## Quick start

```bash
# 1) API
cd server
cp .env.example .env        # fill in the values (see AskMe_Setup_Guide.docx)
npm install
npm run dev                 # http://localhost:3000/health

# 2) Frontend (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

Run tests: `cd server && npm test`

## Deploy

- **API → Render** (root dir `server`, build `npm ci`, start `npm start`, health check `/health`). A `render.yaml` blueprint is included.
- **Frontend → Vercel** (root dir `client`; env `VITE_CLERK_PUBLISHABLE_KEY`, `VITE_BASE_URL`).

The complete step-by-step guide, including account setup for every free service, is in **AskMe_Setup_Guide.docx**.

## Project layout

```
client/   React app            server/   Express API
  src/lib, src/hooks             src/config      validated env
  src/pages, src/components      src/db          schema, pool, repository
                                 src/middleware  auth/plan, rate limit, upload, errors
                                 src/services    gemini, cloudflare, cloudinary, prompts
                                 src/validators  zod schemas
                                 test/           node:test suite
```
