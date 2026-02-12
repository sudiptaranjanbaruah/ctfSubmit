# Deployment Guide for CTF Submission Website

This guide walks you through deploying your CTF platform securely using **Render** (recommended for simplicity) or **Railway**.

## Prerequisites

1.  **Git Installed**: Ensure you have Git installed on your computer.
2.  **GitHub Account**: You need a GitHub account to host your code.
3.  **Render/Railway Account**: Create a free account on [Render](https://render.com) or [Railway](https://railway.app).

## Step 1: Prepare Your Code

1.  **Create a `.gitignore` file** in your project root to prevent uploading unnecessary files:
    ```bash
    node_modules/
    .env
    .DS_Store
    ```

2.  **Initialize Git and Push to GitHub**:
    ```bash
    git init
    git add .
    git commit -m "Initial commit of CTF platform"
    # Create a new repo on GitHub website, then:
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

## Step 2: Deploy to Render (Recommended)

1.  **Create a New Web Service**:
    - Go to your Render Dashboard.
    - Click **New +** -> **Web Service**.
    - Connect your GitHub repository.

2.  **Configure Settings**:
    - **Name**: `my-ctf-platform` (or similar)
    - **Region**: Choose one close to your target audience.
    - **Branch**: `main`
    - **Root Directory**: `.` (leave blank)
    - **Runtime**: `Node`
    - **Build Command**: `npm install`
    - **Start Command**: `node server.js`

3.  **Environment Variables (CRITICAL FOR SECURITY)**:
    - Scroll down to "Environment Variables".
    - Add the following:
        - `NODE_ENV`: `production`
        - `SESSION_SECRET`: Generate a long random string (e.g., `h4ck3r_s3cr3t_KEY_992834`).
    - *Note*: Render automatically provides a `PORT` variable.

4.  **Deploy**:
    - Click **Create Web Service**.
    - Render will build and deploy your site. Once done, you'll get a URL (e.g., `https://my-ctf.onrender.com`).

## Step 3: Persistence (Handling Data Resets)

**Important**: Free tiers of Render/Railway have "ephemeral" descriptions. This means **if the server restarts (which happens on every deploy), your `submissions.json` will reset.**

### Option A: Use Railway with a Volume (Recommended for Persistence)
1.  Deploy on **Railway** instead of Render.
2.  Add a **Volume** to your service mounted at `/app/data`.
3.  Update your code to look for data in that absolute path if needed, or ensure the volume mounts exactly where your `data/` folder is.

### Option B: Quick Fix (No persistence across deploys)
If this is a short, one-time event and you don't plan to redeploy during the event:
- Just don't push new code while the CTF is live.
- The data *might* persist as long as the service doesn't crash or restart.
- **Backup**: Periodically visit `/api/leaderboard` and save the JSON as a backup.

## Step 4: Security Checklist

Your application is now hardened with:
- ✅ **Helmet**: Protects against common header attacks.
- ✅ **Rate Limiting**: Prevents brute-forcing login (limit: 20 attempts/15min).
- ✅ **Secure Cookies**: Enabled automatically in production environment.
- ✅ **HTTPS**: Render/Railway provides this by default.

## Where to Host Backend Securely?

The "Backend" in this project is part of the same `server.js` as the frontend. By deploying to Render/Railway:
1.  **Isolation**: Your code runs in a container, isolated from other users.
2.  **Hidden Logic**: Users cannot see `passwords.md` or `ctfs.json` (which contains correct flags) because they are never served to the client. Only the *results* of the checks are sent.
3.  **DDoS Protection**: These platforms have basic DDoS protection layers.
