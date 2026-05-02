# Deployment Setup Guide

## Fixed Issues ✅

- Updated CORS to accept Vercel deployments
- Added debug endpoint for troubleshooting
- Improved environment variable handling

---

## Vercel (Frontend) Setup

### 1. Environment Variables

Go to **Project Settings → Environment Variables** and add:

```
VITE_API_URL = https://your-backend-name.onrender.com/api
```

Important:
`VITE_API_URL` must point to the API base. If your backend is `https://witting-2.onrender.com`, use `https://witting-2.onrender.com/api`.
The client now also normalizes `https://witting-2.onrender.com` to `https://witting-2.onrender.com/api`, but setting the full `/api` URL explicitly is still preferred.

### 2. Build Settings

- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Root Directory**: `client`

### 3. Redeploy

After setting env vars, trigger a redeploy.

---

## Render (Backend) Setup

### 1. Environment Variables

Go to **Service Settings → Environment** and add:

```
CLIENT_URL = https://your-frontend-name.vercel.app
PORT = 5000
MONGODB_URI = your_mongodb_atlas_uri
```

### 2. Build & Start Commands

- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 3. Redeploy

After setting env vars, trigger a redeploy.

---

## Testing Connection

### Test from Vercel Frontend

Open browser console (F12) and run:

```javascript
fetch("https://your-backend-name.onrender.com/api/debug")
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### Test CORS Debug Endpoint

Visit: `https://your-backend-name.onrender.com/api/debug`

You should see:

```json
{
  "message": "CORS is working!",
  "origin": "https://your-app.vercel.app",
  "clientUrl": "https://your-app.vercel.app",
  "allowedDomains": ["https://your-app.vercel.app", "vercel.app", "localhost"]
}
```

---

## Troubleshooting

### "Failed to fetch" error

1. ✅ Check that `VITE_API_URL` is set in Vercel
2. ✅ Check that `CLIENT_URL` is set in Render
3. ✅ Both should use full URLs with `https://`
4. ✅ Redeploy both after changing env vars

### Still getting CORS errors

1. Check the browser console Network tab
2. Look at the `Origin` header request
3. Make sure that origin matches what's in `CLIENT_URL` on Render
4. Visit the `/api/debug` endpoint to verify CORS is configured

### MongoDB connection fails

- Make sure `MONGODB_URI` is set correctly on Render
- Verify your MongoDB Atlas IP whitelist includes Render's IP (usually allow all: 0.0.0.0/0)

---

## Connection Flow (Production)

```
User Browser (Vercel Frontend)
    ↓
https://your-app.vercel.app
    ↓ (uses VITE_API_URL)
https://your-backend.onrender.com/api/*
    ↓ (checks CLIENT_URL for CORS)
Returns data
```
