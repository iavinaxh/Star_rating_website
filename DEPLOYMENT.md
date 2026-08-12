# Production deployment

This repository contains a React/Vite frontend and a NestJS API. Deploy them as two services.

## 1. Backend

Deploy `backend/` to a Node/Docker host such as Railway, Render, Fly.io, or another service that can run a persistent NestJS process.

Required production environment variables:

```env
NODE_ENV=production
PORT=3000
DB_HOST=...
DB_PORT=3306
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=store_rating_db
JWT_SECRET=<long-random-secret>
FRONTEND_URL=https://<your-vercel-domain>
```

Do not commit real credentials. The repository includes `backend/.env.example` as a template.

The backend exposes `GET /health` for deployment health checks.

## 2. Frontend on Vercel

Import the repository into Vercel. The repository root is already configured for the frontend build.

Build command:

```text
npm run build
```

Output directory:

```text
frontend/dist
```

Production environment variable:

```env
VITE_API_URL=https://<your-backend-domain>
```

The root `vercel.json` supplies these settings automatically. Vercel can also be configured with `frontend/` as the Root Directory, in which case its existing Vite configuration can be used.

## 3. CORS

Set `FRONTEND_URL` on the backend to the exact Vercel origin. Multiple comma-separated origins are supported.

## 4. Database

Use a managed MySQL-compatible database for production. Do not rely on the SQLite fallback for production persistence.

## 5. Verification

After deployment:

1. Open the Vercel site.
2. Refresh a nested route such as `/login` or `/dashboard` to verify SPA rewrites.
3. Confirm the browser can call the backend URL.
4. Open `https://<your-backend-domain>/health` and verify `status: ok`.
5. Test registration, login, store listing, rating submission, and dashboard access.

GitHub Actions also builds both frontend and backend on pushes and pull requests to `main`.
