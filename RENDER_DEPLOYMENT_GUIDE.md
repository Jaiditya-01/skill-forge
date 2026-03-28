# SkillForge Render Deployment Guide

## Overview
This guide will help you properly deploy both the frontend and backend to Render with full functionality.

---

## Backend Deployment (Python FastAPI)

### Step 1: Create Backend Service on Render
1. Go to [render.com](https://render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure as follows:

#### Basic Settings
- **Name**: `skillforge-api` (or similar)
- **Runtime**: `Python 3.11`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

#### Environment Variables
Add these environment variables in Render's environment settings:

```
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/skillforge?retryWrites=true&w=majority
DATABASE_NAME=skillforge
JWT_SECRET_KEY=your-very-secure-random-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
GITHUB_TOKEN=(optional)
```

**Important**: Replace with your actual MongoDB credentials, JWT secret, and SMTP settings.

### Step 2: Deployment Steps
1. After creating the service, Render will automatically deploy from your main branch
2. Wait for the build to complete (check the deploy logs)
3. Once deployed, you'll get a URL like: `https://skillforge-api.onrender.com`
4. **Note**: Keep this URL, you'll need it for the frontend configuration

---

## Frontend Deployment (React + Vite)

### Step 1: Create Frontend Service on Render
1. Go to [render.com](https://render.com)
2. Click **New +** → **Static Site** (OR **Web Service** for more control)
3. Connect your GitHub repository
4. Configure as follows:

#### For Static Site Deployment:
- **Name**: `skillforge-web` (or similar)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Publish Directory**: `frontend/dist`

#### For Web Service Deployment (Recommended):
- **Name**: `skillforge-web`
- **Runtime**: `Node`
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `npm run preview` (or use `python -m http.server 3000` after build)

### Step 2: Environment Variables for Frontend
Add these environment variables in Render's environment settings:

```
VITE_API_URL=https://skillforge-api.onrender.com
```

**Replace** `https://skillforge-api.onrender.com` with your actual backend URL from Step 1 of Backend Deployment.

### Step 3: Build and Deploy
1. Render will automatically deploy when you push to `main`
2. Wait for the build to complete
3. You'll get a URL like: `https://skillforge-web.onrender.com`

---

## Important Notes for Production

### API Communication
- ✅ Frontend now properly sends requests to `/api/auth/register`, `/api/auth/login`, etc.
- ✅ Backend has fallback routes at `/auth/register`, `/auth/login` for compatibility
- ✅ CORS is properly configured to allow both frontend and backend URLs

### How the Fix Works
1. **Frontend API Client** (`frontend/src/api/client.js`):
   - Automatically adds `/api` prefix to all requests
   - Sets base URL from `VITE_API_URL` environment variable
   - Attaches bearer token to all requests

2. **Backend Routers**:
   - Primary routes: `/api/auth/register`, `/api/auth/login`, etc.
   - Fallback routes: `/auth/register`, `/auth/login` for compatibility
   - Both handle the same logic

3. **CORS Middleware**:
   - Allows requests from `https://*.onrender.com`
   - Allows `localhost` for development
   - Credentials are enabled for authentication

---

## Verification Steps

### 1. Test Backend Health
```bash
curl https://skillforge-api.onrender.com/api/health
```
Expected response:
```json
{
  "success": true,
  "message": "SkillForge API is running 🚀"
}
```

### 2. Test Registration Endpoint
```bash
curl -X POST https://skillforge-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "Password123!",
    "university": "Test University",
    "major_semester": "CS - 3rd",
    "interests": "Web Development",
    "country": "USA",
    "target_role": "Full Stack Developer",
    "year": 3,
    "skill_level": "Intermediate",
    "preferred_stack": "MERN",
    "internship_timeline": "Summer 2024"
  }'
```

### 3. Test Frontend Connection
1. Open your frontend URL: `https://skillforge-web.onrender.com`
2. Try to register a new user
3. Check the browser console (DevTools → Network tab) to see requests going to your backend

---

## Troubleshooting

### 404 Errors on `/auth/register`
- ✅ This is now fixed with the fallback routes
- Check browser console to see actual request URL
- Ensure `VITE_API_URL` is set correctly on Render

### CORS Errors
- Check that your frontend and backend URLs are in the CORS regex
- Clear browser cache and reload
- Check browser DevTools → Network tab for OPTIONS requests

### Connection Refused / Cannot reach backend
- Verify backend service is running on Render (check deploy logs)
- Verify `VITE_API_URL` has no trailing slash and is correct
- Check that both services are in "Live" status on Render dashboard

### MongoDB Connection Issues
- Verify MongoDB Atlas IP whitelist includes Render's IPs
- Add `0.0.0.0/0` temporarily for testing (less secure)
- Check MongoDB connection string format

---

## Development vs Production

### Local Development
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:8000`

### Production (Render)
- Frontend: `https://skillforge-web.onrender.com`
- Backend: `https://skillforge-api.onrender.com`
- Requests automatically routed through CORS middleware with authentication

---

## Next Steps

1. **Push your code** to GitHub with the updated files
2. **Configure Render services** using the steps above
3. **Set environment variables** on Render dashboard
4. **Test the endpoints** using the verification steps
5. **Monitor logs** in Render dashboard for any errors

---

## Quick Reference

| Component | URL | Environment Variable |
|-----------|-----|----------------------|
| Backend API | `https://skillforge-api.onrender.com` | `VITE_API_URL` (on frontend) |
| Frontend | `https://skillforge-web.onrender.com` | N/A |
| MongoDB | Per your Atlas cluster | `MONGODB_URL` (on backend) |

---

## Support

If you still encounter issues:
1. Check both backend and frontend deploy logs on Render
2. Check browser DevTools Console for errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB is accessible from Render's IP range
