# Complete Deployment Guide - Frontend & Backend

## Overview
- **Frontend**: Deployed on Render or Vercel
- **Backend**: Deployed on Render
- **Database**: MongoDB Atlas
- **Payment**: Chapa Integration

---

## Step 1: Backend Deployment (Render)

### 1.1 Create Backend Service on Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `nextgen-erp-api`
   - **Environment**: `Node`
   - **Build Command**: `cd server && npm install && npx prisma db push`
   - **Start Command**: `cd server && npm start`
   - **Plan**: Free (or paid for production)

### 1.2 Set Environment Variables on Render

In Render dashboard, go to your service → Environment:

```
NODE_ENV=production
PORT=5001
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_ENCRYPTION_KEY=your_chapa_encryption_key
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=https://your-frontend-url.onrender.com
BACKEND_URL=https://nextgen-erp-api.onrender.com
```

### 1.3 Deploy Backend

Click "Deploy" and wait for the build to complete.

**Backend URL**: `https://nextgen-erp-api.onrender.com`

---

## Step 2: Frontend Deployment (Render or Vercel)

### Option A: Deploy on Render

1. Create new Web Service on Render
2. Configure:
   - **Name**: `nextgen-erp-ethiopia`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`
   - **Plan**: Free

3. Set Environment Variables:
```
VITE_API_URL=https://nextgen-erp-api.onrender.com/api
VITE_BACKEND_URL=https://nextgen-erp-api.onrender.com
GEMINI_API_KEY=your_gemini_api_key
```

### Option B: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Set Environment Variables:
```
VITE_API_URL=https://nextgen-erp-api.onrender.com/api
VITE_BACKEND_URL=https://nextgen-erp-api.onrender.com
GEMINI_API_KEY=your_gemini_api_key
```

5. Deploy

**Frontend URL**: `https://nextgen-erp-ethiopia.vercel.app` or `https://nextgen-erp-ethiopia.onrender.com`

---

## Step 3: Update CORS on Backend

Update `server/server.js` with your frontend URL:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'https://nextgen-erp-ethiopia.onrender.com',
  'https://nextgen-erp-ethiopia.vercel.app',
  'https://your-custom-domain.com',
].filter(Boolean);
```

---

## Step 4: Database Setup (MongoDB Atlas)

### 4.1 Create MongoDB Cluster

1. Go to [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Get connection string

### 4.2 Update DATABASE_URL

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

---

## Step 5: Verify Deployment

### Test Backend Health
```bash
curl https://nextgen-erp-api.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-17T...",
  "database": "connected"
}
```

### Test Frontend
Visit: `https://nextgen-erp-ethiopia.onrender.com` or your Vercel URL

---

## Step 6: Troubleshooting

### Issue: "Failed to fetch" errors

**Solution**: Check that:
1. Backend is running: `https://nextgen-erp-api.onrender.com/health`
2. CORS is configured correctly
3. Environment variables are set
4. Frontend API URL is correct

### Issue: Database connection error

**Solution**:
1. Verify DATABASE_URL is correct
2. Check MongoDB Atlas IP whitelist (allow all: 0.0.0.0/0)
3. Run: `npx prisma db push` to sync schema

### Issue: "Port already in use"

**Solution**: Render automatically assigns ports. Don't hardcode port 5001 in production.

---

## Step 7: Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Render/Vercel
- [ ] MongoDB Atlas database connected
- [ ] Environment variables set on both services
- [ ] CORS configured with frontend URL
- [ ] Health check endpoint working
- [ ] Login/Register working
- [ ] API calls working
- [ ] Payment integration tested
- [ ] Custom domain configured (optional)

---

## Step 8: Custom Domain (Optional)

### Add Custom Domain to Render

1. Go to Render dashboard → Service settings
2. Click "Custom Domain"
3. Add your domain (e.g., `app.yourdomain.com`)
4. Update DNS records as instructed

### Add Custom Domain to Vercel

1. Go to Vercel dashboard → Project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records

---

## Step 9: Monitoring & Logs

### View Backend Logs
- Render dashboard → Service → Logs

### View Frontend Logs
- Render: Dashboard → Service → Logs
- Vercel: Dashboard → Project → Deployments → Logs

---

## Environment Variables Summary

### Backend (.env on Render)
```
NODE_ENV=production
PORT=5001
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your_secret
CHAPA_PUBLIC_KEY=...
CHAPA_SECRET_KEY=...
CHAPA_ENCRYPTION_KEY=...
GEMINI_API_KEY=...
FRONTEND_URL=https://your-frontend.com
BACKEND_URL=https://nextgen-erp-api.onrender.com
```

### Frontend (.env.production)
```
VITE_API_URL=https://nextgen-erp-api.onrender.com/api
VITE_BACKEND_URL=https://nextgen-erp-api.onrender.com
GEMINI_API_KEY=...
```

---

## Quick Deploy Commands

### Local Testing Before Deploy
```bash
# Terminal 1: Backend
cd server
npm install
npm start

# Terminal 2: Frontend
npm install
npm run dev
```

### Build for Production
```bash
# Frontend
npm run build

# Backend (already in server/)
npm install
```

---

## Support

If you encounter issues:

1. Check Render/Vercel logs
2. Verify environment variables
3. Test health endpoint
4. Check CORS configuration
5. Verify database connection

---

**Status**: Ready for Deployment
**Last Updated**: December 2025
**Version**: 1.0.0
