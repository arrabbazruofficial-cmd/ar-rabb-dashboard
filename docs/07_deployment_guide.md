# Al-Rabb Tours & Travels - Deployment & Setup Guide

This guide explains how to initialize, run, and deploy the platform. We have structured the repository with an enterprise-ready split between the frontend (React/Vite) and backend (Django/Celery) wrapped in Docker.

## 1. Local Development Setup

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- Docker & Docker Compose
- Git

### Backend Initialization (Django)
1. Navigate to the backend directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate it:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Create the Django project: `django-admin startproject core .`
6. Run migrations (requires DB): `python manage.py migrate`

### Frontend Initialization (React)
The frontend has been scaffolded using Vite.
1. Navigate to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`

---

## 2. Environment Variables (.env)

We have provided a `.env.example` in the root of the project. Copy this to a new file named `.env`:
`cp .env.example .env`

### Key Environment Variables Explained:
- **`SECRET_KEY`**: A long, random string used by Django for cryptographic signing. *Never expose this in production.*
- **`DATABASE_URL`**: The connection string to your PostgreSQL instance. (e.g., `postgres://user:pass@host:port/dbname`).
- **`REDIS_URL`**: Used by Celery for background tasks and Django for caching.
- **AWS Storage Keys**: If using Cloudflare R2 (recommended), set `AWS_S3_ENDPOINT_URL` to your Cloudflare account's R2 endpoint, and configure the Access/Secret keys. If using AWS S3, you can omit the endpoint URL.
- **Email Settings**: We recommend **Resend** or **Amazon SES**. Provide your SMTP host, port, and API key as the password.

---

## 3. Running with Docker (Staging / Production)

The fastest way to spin up the entire infrastructure (Database, Cache, Backend API, Background Workers) is using the provided `docker-compose.yml`.

1. Ensure Docker Desktop is running.
2. In the root directory, run:
   ```bash
   docker-compose up --build -d
   ```
3. This command will:
   - Pull the PostgreSQL and Redis images.
   - Build the custom Django image using `backend/Dockerfile`.
   - Start the database (`alrabb_db`).
   - Start the cache (`alrabb_redis`).
   - Start the API backend (`alrabb_backend`) exposed on port `8000`.
   - Start the background task worker (`alrabb_celery`).

4. **Verify Status**: Run `docker-compose ps` to ensure all 4 containers are running.
5. **Apply Migrations in Docker**: 
   ```bash
   docker exec -it alrabb_backend python manage.py migrate
   ```
6. **Create Superuser**:
   ```bash
   docker exec -it alrabb_backend python manage.py createsuperuser
   ```

---

## 4. Production Deployment Strategy

For a true production environment, we recommend separating the frontend and backend hosting for optimal performance and security.

### Frontend Deployment (Vercel or Cloudflare Pages)
1. Push your repository to GitHub.
2. Log into Vercel and import the project.
3. Set the Root Directory to `frontend`.
4. Vercel will automatically detect the Vite React framework and deploy the site. It will provide you with a free SSL-secured URL.

### Backend Deployment (Railway, Render, or VPS)
**Option A: Managed Platform (Railway.app)**
1. Connect your GitHub repository to Railway.
2. Add a PostgreSQL plugin and a Redis plugin to your Railway project.
3. Railway will automatically detect the `Dockerfile` in the `backend/` directory and deploy the API.
4. Copy the Database URL and Redis URL provided by Railway into your Railway Environment Variables.

**Option B: VPS (DigitalOcean / AWS EC2)**
1. SSH into your VPS.
2. Install Docker.
3. Clone your repository.
4. Populate your `.env` file.
5. Run `docker-compose -f docker-compose.yml up -d`.
6. Set up an Nginx reverse proxy to route traffic from port 80/443 to the Docker container on port 8000, and secure it with Let's Encrypt (Certbot).
