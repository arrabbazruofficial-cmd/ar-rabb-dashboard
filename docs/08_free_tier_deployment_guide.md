# Ultimate Free Tier Deployment Guide

This guide covers the exact steps required to deploy the Al-Rabb Tours & Travels platform using the ultimate free-tier stack you selected.

## Stack Overview
- **Database:** Neon PostgreSQL (Serverless DB)
- **File Storage:** Cloudflare R2 (S3-compatible API)
- **Email:** Resend (SMTP)
- **Backend:** Render (Web Service)
- **Frontend:** Vercel (Static Hosting)

---

### Step 1: Set Up the Database (Neon)
1. Go to [neon.tech](https://neon.tech/) and create a free account.
2. Create a new project and select **PostgreSQL 15**.
3. Once created, click on the **Dashboard** and find your connection string.
4. It will look like this: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
5. **Save this URL.** You will need it for Render.

---

### Step 2: Set Up File Storage (Cloudflare R2)
1. Go to your [Cloudflare Dashboard](https://dash.cloudflare.com/) and select **R2**.
2. Click **Create bucket** (name it `alrabb-storage`).
3. Once created, go back to the R2 overview and click **Manage R2 API Tokens**.
4. Click **Create API token**, give it "Edit" permissions for your bucket, and click Create.
5. Cloudflare will show you the following keys:
   - `Access Key ID`
   - `Secret Access Key`
   - `S3 API URL` (looks like `https://<account-id>.r2.cloudflarestorage.com`)
6. **Save these.**

---

### Step 3: Set Up Email (Resend)
1. Go to [resend.com](https://resend.com/) and sign up.
2. Go to **API Keys** and click **Create API Key**.
3. Give it full access and generate the key.
4. **Save this key.** In Django, the SMTP settings will be:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: `<Your-Resend-API-Key>`

---

### Step 4: Deploy the Backend (Render)
1. Push your entire `ARR-TOURS-DASHBOARD` repository to **GitHub**.
2. Go to [render.com](https://render.com/) and log in.
3. Click **New** -> **Web Service** -> **Build and deploy from a Git repository**.
4. Connect your GitHub account and select the repository.
5. **Configuration:**
   - **Root Directory:** `backend`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command:** `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT`
6. **Environment Variables:** (Add these in the Render dashboard)
   - `DATABASE_URL` = (Paste the Neon URL from Step 1)
   - `SECRET_KEY` = (Generate a long random string)
   - `DEBUG` = `False`
   - `ALLOWED_HOSTS` = `*`
   - `AWS_ACCESS_KEY_ID` = (From Cloudflare R2)
   - `AWS_SECRET_ACCESS_KEY` = (From Cloudflare R2)
   - `AWS_STORAGE_BUCKET_NAME` = `alrabb-storage`
   - `AWS_S3_ENDPOINT_URL` = (From Cloudflare R2)
   - `EMAIL_HOST_PASSWORD` = (Your Resend API Key)
7. Click **Create Web Service**. Wait for the build to finish. Render will give you a live URL (e.g., `https://alrabb-api.onrender.com`). **Save this URL.**

---

### Step 5: Deploy the Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com/) and log in with GitHub.
2. Click **Add New** -> **Project**.
3. Import your `ARR-TOURS-DASHBOARD` repository.
4. **Configuration:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend`
5. **Environment Variables:**
   - Add a new variable named `VITE_API_URL`
   - Set the value to your Render backend URL (e.g., `https://alrabb-api.onrender.com/api/v1`)
6. Click **Deploy**.

### Step 6: Verify Deployment
1. Go to your new Vercel URL (e.g., `https://alrabb-tours.vercel.app/admin`).
2. Log in using the superuser account we created (`arrabbazruofficial@gmail.com` / `arrabb@123`).
3. You are now live on the internet, for free!
