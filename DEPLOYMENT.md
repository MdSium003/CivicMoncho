# CivicPulse Deployment Guide

This guide covers deploying your CivicPulse application to Vercel or Render.

## Prerequisites

- Your Neon database URL (already configured)
- Git repository with your code
- Vercel or Render account

## Environment Variables

You'll need to set these environment variables in your deployment platform:

- `DATABASE_URL`: Your Neon database connection string
- `SESSION_SECRET`: A random secret string for session management
- `NODE_ENV`: Set to `production`

## Option 1: Deploy to Vercel (Recommended)

### Why Vercel?
- Excellent for full-stack applications
- Automatic deployments from Git
- Built-in CDN and edge functions
- Easy environment variable management

### Steps:

1. **Install Vercel CLI** (optional but recommended):
   ```bash
   npm i -g vercel
   ```

2. **Deploy from Git**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect your configuration

3. **Set Environment Variables**:
   - In your Vercel dashboard, go to Project Settings → Environment Variables
   - Add:
     - `DATABASE_URL`: Your Neon database URL
     - `SESSION_SECRET`: Generate a random string (32+ characters)
     - `NODE_ENV`: `production`

4. **Deploy**:
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

### Vercel Configuration Files Created:
- `vercel.json`: Main configuration
- `client/vercel.json`: Client-specific settings
- `.vercelignore`: Files to ignore during deployment

## Option 2: Deploy to Render

### Why Render?
- Simple full-stack deployment
- Free tier available
- Good for Node.js applications

### Steps:

1. **Connect Repository**:
   - Go to [render.com](https://render.com)
   - Click "New" → "Web Service"
   - Connect your Git repository

2. **Configure Service**:
   - **Name**: `civicpulse` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or upgrade as needed)

3. **Set Environment Variables**:
   - In the Render dashboard, go to Environment
   - Add:
     - `DATABASE_URL`: Your Neon database URL
     - `SESSION_SECRET`: Generate a random string
     - `NODE_ENV`: `production`

4. **Deploy**:
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Your app will be available at `https://your-app-name.onrender.com`

### Render Configuration Files Created:
- `render.yaml`: Render service configuration

## Database Setup

Since you're using Neon, make sure to:

1. **Push Schema** (if not already done):
   ```bash
   npm run db:push
   ```

2. **Seed Database** (if needed):
   ```bash
   npm run db:seed
   ```

## Post-Deployment Checklist

- [ ] Environment variables are set correctly
- [ ] Database connection is working
- [ ] All API endpoints are responding
- [ ] Frontend is loading properly
- [ ] Authentication is working
- [ ] File uploads work (if applicable)

## Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally

2. **Database Connection Issues**:
   - Verify `DATABASE_URL` is correct
   - Check if your Neon database allows connections from the deployment platform

3. **Session Issues**:
   - Ensure `SESSION_SECRET` is set and consistent
   - Check cookie settings for production

4. **Static File Issues**:
   - Verify build output directory is correct
   - Check if all assets are being served properly

### Debug Commands:

```bash
# Test build locally
npm run build

# Test production start
npm start

# Check TypeScript
npm run check
```

## Monitoring

- **Vercel**: Use Vercel Analytics and Functions logs
- **Render**: Use Render's built-in logs and metrics

## Scaling Considerations

- **Vercel**: Automatically scales with usage
- **Render**: Free tier has limitations; consider upgrading for production

## Security Notes

- Never commit `.env` files
- Use strong, unique `SESSION_SECRET`
- Regularly rotate database credentials
- Enable HTTPS (automatic on both platforms)

## Support

- Vercel: [vercel.com/docs](https://vercel.com/docs)
- Render: [render.com/docs](https://render.com/docs)
- Neon: [neon.tech/docs](https://neon.tech/docs)
