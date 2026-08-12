# Store Rating & Review Platform

A full-stack store rating and review platform built with React, Vite, TypeScript, NestJS, TypeORM, JWT authentication, and MySQL/SQLite support.

The application provides a unified authentication system with three roles:

- **System Administrator**: manages users, stores, owners, and system data.
- **Normal User**: searches stores, submits ratings/reviews, and manages account security.
- **Store Owner**: views store performance and customer submissions.

> **Production status:** The repository is configured for production builds and Vercel frontend deployment. The frontend and backend builds are validated through GitHub Actions. A live full-stack deployment additionally requires a hosted backend and production database.

---

## Features

### Authentication & Security

- JWT-based authentication
- Bcrypt password hashing
- Role-based access control
- Password reset flow
- Backend DTO validation
- Frontend form validation
- Production JWT secret enforcement
- Configurable production CORS

### Normal User Dashboard

- Search stores by name
- Filter by address
- Sort by name, address, or rating
- Interactive 1-5 star rating selector
- Written review comments
- Public review viewing with reviewer privacy masking
- Password/security settings

### Store Owner Dashboard

- Average store rating
- Rating statistics
- Customer submissions table
- Review sorting
- Customer information and submission dates
- Password/security settings

### Administrator Dashboard

- Total users, stores, and ratings statistics
- Create administrators, users, owners, and stores
- Assign store owners
- Search and filter users
- Store management
- System-wide data registers

---

## Technology Stack

### Frontend

- React
- Vite
- TypeScript
- React Router
- Lucide React
- Custom CSS

### Backend

- NestJS
- TypeORM
- Passport JWT
- Class Validator
- Class Transformer
- Bcrypt

### Database

- MySQL for production
- SQLite fallback for local development

### Deployment

- Vercel for the React frontend
- A persistent Node/Docker host such as Railway, Render, or Fly.io for the NestJS API
- Managed MySQL for production data

---

## Project Structure

```text
Star_rating_website/
├── frontend/                 # React + Vite application
│   ├── src/
│   ├── public/
│   ├── vercel.json           # SPA routing configuration
│   ├── .env.example
│   └── package.json
│
├── backend/                  # NestJS REST API
│   ├── src/
│   ├── Dockerfile            # Production container configuration
│   ├── .env.example
│   └── package.json
│
├── .github/
│   └── workflows/
│       └── ci.yml            # Frontend/backend build validation
│
├── vercel.json               # Root Vercel configuration
└── README.md
```

---

## Database Seeding

When the backend initializes an empty database, it seeds the application with an initial administrator account and a collection of sample stores.

### Default administrator

```text
Email:    admin@storerating.com
Password: AdminPass123!
```

**Change or disable the default credentials before using the application with real production data.**

The exact seed data is intended for development/demo use and should not be treated as production user data.

---

## Local Development

### Requirements

- Node.js 18+
- npm
- MySQL (optional for local development because SQLite fallback is available)

### 1. Clone the repository

```bash
git clone https://github.com/iavinaxh/Star_rating_website.git
cd Star_rating_website
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_DATABASE=store_rating_db

JWT_SECRET=development-only-secret
FRONTEND_URL=http://localhost:5173
```

If MySQL is unavailable, the application can use its local SQLite fallback where supported by the current backend configuration.

### 3. Start the backend

```bash
cd backend
npm run start:dev
```

The API runs at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

### 4. Configure the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### 5. Start the frontend

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

---

## Production Environment Variables

### Frontend

Vercel needs:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

`VITE_API_URL` must point to the publicly accessible NestJS API. Do not leave it pointing at `localhost` in production.

### Backend

The production API should be configured with:

```env
NODE_ENV=production
PORT=3000

DB_HOST=YOUR_DATABASE_HOST
DB_PORT=3306
DB_USERNAME=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
DB_DATABASE=store_rating_db

JWT_SECRET=YOUR_LONG_RANDOM_PRODUCTION_SECRET
FRONTEND_URL=https://YOUR-VERCEL-DOMAIN
```

Never commit real passwords, JWT secrets, or production `.env` files to GitHub.

---

## Production Deployment Architecture

The application is intentionally deployed as two services:

```text
                    ┌─────────────────────┐
                    │       Browser       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │       Vercel        │
                    │ React + Vite        │
                    └──────────┬──────────┘
                               │
                         HTTPS API calls
                               │
                               ▼
                    ┌─────────────────────┐
                    │  NestJS API Server  │
                    │ Railway / Render /  │
                    │ Fly.io / similar    │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Managed MySQL     │
                    └─────────────────────┘
```

A persistent NestJS server should not be treated as a normal static Vercel frontend. Vercel hosts the React application, while the NestJS API runs on a suitable Node/Docker hosting service.

---

## Vercel Deployment

The repository includes Vercel configuration for the frontend and React Router SPA fallback.

### Recommended Vercel settings

If importing the repository from GitHub, configure the project to use the frontend application:

```text
Root Directory: frontend
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Add the following Vercel environment variable:

```env
VITE_API_URL=https://YOUR-BACKEND-DOMAIN
```

The `frontend/vercel.json` configuration handles client-side routes so paths such as `/login` and `/dashboard` continue to work after a browser refresh.

The root `vercel.json` also contains the repository-level deployment configuration.

---

## Backend Deployment

The backend includes a production Docker configuration and can be deployed to a service that supports long-running Node.js/Docker applications.

Typical deployment flow:

1. Create a managed MySQL database.
2. Deploy the `backend` directory using the included Dockerfile or the NestJS production start command.
3. Add the production backend environment variables.
4. Confirm `GET /health` returns successfully.
5. Set the backend `FRONTEND_URL` to the Vercel frontend domain.
6. Set the frontend `VITE_API_URL` to the backend public URL.
7. Redeploy the frontend after changing `VITE_API_URL`.

---

## Build & CI Verification

GitHub Actions validates both applications on pushes to the repository.

The CI pipeline checks:

- Frontend dependency installation
- Frontend production build
- Backend dependency installation
- Backend production build

Run the same checks locally with:

```bash
cd frontend
npm ci
npm run build
```

and:

```bash
cd backend
npm ci
npm run build
```

---

## Important Production Notes

- Do not use the development JWT secret in production.
- Do not commit `.env` files containing secrets.
- Use a managed production database rather than relying on a local SQLite file for production data.
- Set CORS to the real frontend domain.
- Change the seeded administrator password before real-world use.
- Configure database backups and monitoring through the chosen hosting provider.
- Keep `VITE_API_URL` pointed at HTTPS in production.

---

## Repository

GitHub: https://github.com/iavinaxh/Star_rating_website

---

## License

This project is currently maintained as a personal/project portfolio application. Add an explicit open-source license before redistributing it as a third-party library or commercial package.
