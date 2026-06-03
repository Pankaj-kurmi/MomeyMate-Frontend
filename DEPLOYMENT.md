# MoneyMate Frontend - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [ ] All API endpoints connected
- [ ] Authentication system tested
- [ ] Form validation working
- [ ] Error handling implemented
- [ ] Code formatted and linted

### Security
- [ ] Environment variables configured
- [ ] API base URL set to production
- [ ] HTTPS enabled
- [ ] JWT tokens properly handled
- [ ] CORS configured correctly
- [ ] No sensitive data in code

### Performance
- [ ] Build optimized
- [ ] Images compressed
- [ ] Caching configured
- [ ] Bundle size acceptable
- [ ] Load time < 3 seconds

## Deployment Options

### 1. Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel --prod
```

Set environment variables in Vercel dashboard:
```
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1.0
```

### 2. Netlify

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env.production]
  VITE_API_BASE_URL = "https://api.yourdomain.com/api/v1.0"
```

### 3. Docker

```bash
docker build -t moneymate-frontend .
docker run -p 80:80 moneymate-frontend
```

### 4. Traditional Server (Nginx)

```bash
npm run build
scp -r dist/* user@server:/var/www/moneymate/
```

Nginx configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /var/www/moneymate;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    
    # Caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 5. GitHub Pages

```bash
npm run build
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

## Post-Deployment Verification

- [ ] Site loads in browser
- [ ] Console has no errors
- [ ] API calls successful
- [ ] Login works
- [ ] Dashboard displays correctly
- [ ] Responsive on mobile

## Local Testing

```bash
npm run dev
npm run build
npm run preview
```
