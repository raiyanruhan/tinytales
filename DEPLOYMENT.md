# TinyTales Deployment Guide

## Build Status
✅ All TypeScript errors fixed
✅ Build successful
✅ Image URLs synced for local and production

## Environment Files

Create these files manually (they are gitignored):

### `.env` (for local development)
```
VITE_API_URL=http://localhost:3001/api
```

### `.env.production` (for production build)
```
VITE_API_URL=https://api.tinytalesearth.com/api
```

## Frontend Deployment

### Step 1: Build for Production
```bash
npm run build
```

This creates a `dist/` folder with production-ready files.

### Step 2: Upload to cPanel

1. Upload all contents of the `dist/` folder to:
   - `/home/username/public_html/` (for main domain)

2. File structure should be:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-xxxxx.js
   │   └── index-xxxxx.css
   └── image.png (if exists)
   ```

### Step 3: Create .htaccess

Create `.htaccess` in `public_html/`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Handle React Router - serve index.html for all routes
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Backend Deployment

The backend is already configured at `api.tinytalesearth.com`.

### Server Configuration
- ✅ Root route (`/`) returns HTML for health checks
- ✅ `/api/health` endpoint configured
- ✅ CORS allows `https://www.tinytalesearth.com`
- ✅ Content-Type headers set correctly

### Verify Backend
Visit: `https://api.tinytalesearth.com/api/health`

Should return:
```json
{
  "status": "ok",
  "message": "TinyTales API is running",
  "timestamp": "2025-11-09T16:08:35.162Z"
}
```

## Changes Made

### 1. Fixed TypeScript Errors
- ✅ `CartMergeDialog.tsx`: Updated to pass boolean instead of CartItem[]
- ✅ `Account.tsx`: Added null check for user.email

### 2. Image URL Utility
- ✅ Created `src/utils/imageUrl.ts` with `getImageUrl()` function
- ✅ Updated all components to use the utility:
  - `Product.tsx`
  - `ImageZoom.tsx`
  - `ImagePositionEditor.tsx`
  - `ImageUpload.tsx`
  - `ProductList.tsx`

### 3. Environment Configuration
- ✅ Image URLs now use `VITE_API_URL` environment variable
- ✅ Works for both local (`http://localhost:3001`) and production (`https://api.tinytalesearth.com`)

## Testing

### Local Development
1. Start backend: `cd server && npm start`
2. Start frontend: `npm run dev`
3. Frontend will use `http://localhost:3001/api` automatically

### Production
1. Build: `npm run build`
2. Upload `dist/` to `public_html/`
3. Frontend will use `https://api.tinytalesearth.com/api` automatically

## Troubleshooting

### Images not loading
- Check that `VITE_API_URL` is set correctly in `.env.production`
- Verify backend is accessible at `https://api.tinytalesearth.com`
- Check browser console for CORS errors

### React Router not working
- Ensure `.htaccess` is in `public_html/`
- Verify `mod_rewrite` is enabled on server

### Build fails
- Run `npm install` to ensure dependencies are installed
- Check TypeScript errors: `npx tsc --noEmit`






