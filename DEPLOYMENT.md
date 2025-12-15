# Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Production build tested locally
- [ ] Lighthouse audit passed (90+ scores)
- [ ] PWA manifest and icons verified
- [ ] Service worker registered correctly
- [ ] All features tested on mobile and desktop

## Build for Production

```bash
# Install dependencies
npm install

# Create production build
npm run build

# Test production build locally
npm run preview
```

## Deployment Platforms

### Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add: `VITE_OPENAI_API_KEY`

4. **Configure Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Netlify

1. **Install Netlify CLI:**
   ```bash
   npm i -g netlify-cli
   ```

2. **Deploy:**
   ```bash
   netlify deploy --prod
   ```

3. **Add Environment Variables:**
   - Netlify Dashboard → Site Settings → Environment Variables
   - Add: `VITE_OPENAI_API_KEY`

4. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

### GitHub Pages

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json:**
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Configure GitHub:**
   - Repository → Settings → Pages
   - Source: `gh-pages` branch
   - Note: GitHub Pages doesn't support environment variables for client-side apps

### Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine as build
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM nginx:alpine
   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Create nginx.conf:**
   ```nginx
   server {
     listen 80;
     server_name localhost;
     root /usr/share/nginx/html;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }

     location /manifest.json {
       add_header Cache-Control "no-cache";
     }
   }
   ```

3. **Build and Run:**
   ```bash
   docker build -t weatherfarm .
   docker run -p 3000:80 weatherfarm
   ```

## Post-Deployment

1. **Verify PWA:**
   - Test install prompt
   - Verify offline functionality
   - Check service worker registration

2. **Performance Check:**
   - Run Lighthouse audit
   - Verify all scores are 90+
   - Check Core Web Vitals

3. **Functionality Test:**
   - Weather data loading
   - Farming insights
   - AI Chat (if API key configured)
   - Analytics dashboard

## Environment Variables

For production, set these in your hosting platform:

- `VITE_OPENAI_API_KEY` - Required for AI Chat feature

## Troubleshooting Deployment

### Build Fails

- Check Node.js version (18+)
- Clear node_modules and reinstall
- Check for TypeScript errors
- Verify all imports are correct

### PWA Not Working

- Ensure HTTPS is enabled
- Check manifest.json is accessible
- Verify service worker is registered
- Check browser console for errors

### Slow Loading

- Enable CDN for static assets
- Verify code splitting is working
- Check bundle sizes
- Optimize images

