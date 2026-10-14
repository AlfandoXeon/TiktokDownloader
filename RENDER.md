# Deployment Guide to Render

This guide provides step-by-step instructions for deploying the **TikTok Downloader (MVC + OOP)** application to [Render](https://render.com/).

---

## Prerequisites

Before deploying, ensure you have:
1. A [GitHub](https://github.com/) account with this repository pushed to your account (`https://github.com/AlfandoXeon/TiktokDownloader`).
2. A free [Render](https://render.com/) account.

---

## Method 1: Deploy Using Render Blueprint (Recommended - 1 Click)

This repository includes a [`render.yaml`](./render.yaml) file. Render can automatically read this file and set up all services, commands, and environment variables without manual configuration.

### Steps:
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top navigation bar and select **Blueprint**.
3. Connect your GitHub account and select your repository: `TiktokDownloader`.
4. Render will detect `render.yaml`:
   - **Service Name**: `tiktok-downloader`
   - **Environment**: `Node`
   - **Region**: `Singapore` (optimal latency for Southeast Asia / Indonesia)
   - **Plan**: `Free`
5. Click **Apply**.
6. Render will automatically build the app (`npm install`) and start it (`npm start`).
7. Once the build finishes, your site will be live at `https://tiktok-downloader-xxxx.onrender.com`!

---

## Method 2: Manual Setup via Render Dashboard

If you prefer to configure the service manually through the Render web UI:

### Steps:
1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your repository: `AlfandoXeon/TiktokDownloader`.
4. Fill in the deployment settings:
   - **Name**: `tiktok-downloader` (or any name you prefer)
   - **Region**: `Singapore` (or the closest region to your users)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

5. Under **Environment Variables**, click **Add Environment Variable** and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `TIKWM_API_BASE_URL` | `https://www.tikwm.com/api/` | Upstream TikTok extractor API |
| `REQUEST_TIMEOUT_MS` | `20000` | HTTP request timeout in milliseconds |
| `RATE_LIMIT_WINDOW_MS` | `60000` | Rate limiting sliding window (1 minute) |
| `RATE_LIMIT_MAX_REQUESTS` | `30` | Max requests per IP in the window |

> *Note: You do **not** need to manually define `PORT`. Render automatically injects `PORT=10000` and our application reads `process.env.PORT` automatically.*

6. Click **Create Web Service**.

---

## Important Notes for Render Free Tier

1. **Free Tier Cold Starts & Keep-Alive (Cron Job)**:
   - On the Render Free plan, the web service automatically spins down (goes to sleep) after **15 minutes of inactivity**.
   - When a new request arrives, it takes about **30–50 seconds** to wake up (*cold start*).
   - **Tip**: You can set up a free cron job (e.g. using [cron-job.org](https://cron-job.org/) or [UptimeRobot](https://uptimerobot.com/)) to send an HTTP GET request to `https://your-app.onrender.com/health` every **10 minutes** to prevent it from going to sleep!
2. **Stream Downloads & Memory Efficiency**:
   - This app streams videos and batch ZIP archives directly from the CDN to the client response using Node.js stream piping (`upstreamResponse.data.pipe(res)`).
   - This architecture fits within Render's Free tier **512 MB RAM** limit because files are never saved to disk or loaded fully into memory.
3. **Custom Domain (Optional)**:
   - In your Render service settings, navigate to **Settings > Custom Domains**.
   - Add your domain (e.g. `tiktok.yourdomain.com`) and follow Render's instructions to add CNAME/A records with free automatic SSL certificates.

---

## Troubleshooting

- **Build Fails with Node Version**:
  - The project specifies `"engines": { "node": ">=20.0.0" }` in `package.json`. If Render defaults to an older version, add an environment variable `NODE_VERSION` with value `20.18.0`.
- **Media Download Timeouts**:
  - If heavy ZIP archives timeout, increase `REQUEST_TIMEOUT_MS` in the Render environment variables to `30000` or `45000`.
- **View Live Logs**:
  - Go to your service in Render Dashboard and click the **Logs** tab to see real-time server output, incoming requests, and any upstream errors.
