# INNOVEXA — Deployment Manual

This guide covers all deployment options for INNOVEXA across cloud providers, container clusters, and serverless environments.

---

## Architecture Overview

```text
┌────────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                       │
│  React 19 + TypeScript + Vite + Tailwind + Three.js    │
│  Deploy to: Vercel / Netlify / Cloudflare / Docker     │
└──────────────────────────┬─────────────────────────────┘
                           │ (HTTPS / WebSocket)
┌──────────────────────────▼─────────────────────────────┐
│                    BACKEND LAYER                       │
│  Supabase PostgreSQL 16 + RLS Security Policies        │
│  Validation Engine + Structured Reviews + AI Services │
│  Deploy to: Supabase Cloud / Self-Hosted Docker        │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Option 1: Vercel + Supabase (Recommended • 3 Minutes)

### Step 1: Deploy Backend (Supabase)
1. Go to [database.new](https://database.new) and create a free Supabase project.
2. Open your project dashboard -> **SQL Editor** -> **New Query**.
3. Paste the contents of [`backend/supabase/schema.sql`](file:///c:/Users/karthick/OneDrive/Desktop/inno/backend/supabase/schema.sql) and click **Run**.
4. Go to **Project Settings** -> **API** and copy:
   - `Project URL` (e.g. `https://your-project.supabase.co`)
   - `anon / public key` (e.g. `eyJhbGci...`)

### Step 2: Deploy Frontend (Vercel)
1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import your repository.
3. Configure Environment Variables in Vercel:
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
4. Click **Deploy**. Vercel will automatically detect `vercel.json` and build the application with single-page application (SPA) routing.

---

## ⚡ Option 2: Netlify + Supabase

1. Push your repository to GitHub.
2. Log into [Netlify](https://app.netlify.com/) -> **Add new site** -> **Import an existing project**.
3. Select your repository. Netlify will auto-detect [`netlify.toml`](file:///c:/Users/karthick/OneDrive/Desktop/inno/netlify.toml).
4. Under **Site configuration** -> **Environment variables**, add:
   ```ini
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
5. Click **Deploy Site**.

---

## 🐳 Option 3: Docker & Docker Compose (Self-Hosted / VPS)

To run both the Frontend (served via Nginx) and the Backend PostgreSQL database on any server:

1. Clone repository to your server:
   ```bash
   git clone <repo-url>
   cd inno
   ```
2. Create your `.env` file:
   ```bash
   cp .env.example .env
   ```
3. Start all services:
   ```bash
   docker compose up -d --build
   ```
4. Access the web app at `http://your-server-ip`.

---

## 📋 Environment Variables Reference

| Variable | Required | Description | Example |
| :--- | :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Yes | Supabase Project REST URL | `https://xyz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Yes | Supabase Anonymous Client Key | `eyJhbGciOi...` |
| `DATABASE_URL` | Optional | Direct Postgres connection string | `postgresql://postgres:pass@localhost:5432/innovexa` |

---

## 🔍 Local Production Verification

To test the production build locally before deploying:

```bash
# 1. Build client bundle
npm run build

# 2. Preview production distribution
npm run preview
```
Visit `http://localhost:4173` to test the production bundle.
