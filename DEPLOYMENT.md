# Himig Deployment Guide

This guide will help you deploy your Himig AI music generation platform to production.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account with your Himig repository
- Vercel account (free tier available)
- Supabase project set up
- Clerk application configured

### Step 1: Prepare Your Repository

1. **Push your code to GitHub:**
```bash
git add .
git commit -m "Initial Himig platform setup"
git push origin main
```

2. **Ensure all environment variables are documented in `.env.example`:**
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_webhook_secret
```

### Step 2: Deploy to Vercel

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" as the framework

2. **Configure Environment Variables:**
   - In the Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from your `.env.local` file
   - Make sure to set them for Production, Preview, and Development

3. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be available at `https://your-app-name.vercel.app`

### Step 3: Configure Webhooks

1. **Set up Clerk Webhooks:**
   - In Clerk dashboard, go to Webhooks
   - Add endpoint: `https://your-app-name.vercel.app/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the webhook secret to your environment variables

2. **Update Clerk Settings:**
   - Add your production domain to allowed origins
   - Configure redirect URLs for production

## 🔧 Manual Deployment Options

### Deploy to Railway

1. **Connect Railway:**
```bash
npm install -g @railway/cli
railway login
railway init
```

2. **Configure Environment:**
```bash
railway add
# Add all environment variables
```

3. **Deploy:**
```bash
railway up
```

### Deploy to Netlify

1. **Build Configuration:**
Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

2. **Deploy:**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🗄️ Database Setup

### Supabase Production Setup

1. **Create Production Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down the URL and keys

2. **Run Database Schema:**
   - Go to SQL Editor in Supabase dashboard
   - Copy and paste the contents of `database/schema.sql`
   - Execute the SQL

3. **Configure Row Level Security:**
   - Ensure RLS is enabled on all tables
   - Test the policies with your authentication

### Alternative: Self-hosted PostgreSQL

1. **Set up PostgreSQL:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb himig_production
```

2. **Configure Connection:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/himig_production
```

## 🔐 Security Configuration

### Environment Variables Security

1. **Production Variables:**
   - Never commit `.env.local` to version control
   - Use different keys for production vs development
   - Rotate keys regularly

2. **Vercel Security:**
   - Enable "Automatically expose System Environment Variables" only if needed
   - Use Preview deployments for testing
   - Set up branch protection rules

### Database Security

1. **Supabase Security:**
   - Enable Row Level Security on all tables
   - Use service role key only in API routes
   - Monitor database usage and queries

2. **API Security:**
   - Implement rate limiting
   - Validate all inputs
   - Use HTTPS only

## 📊 Monitoring & Analytics

### Vercel Analytics

1. **Enable Analytics:**
```bash
npm install @vercel/analytics
```

2. **Add to Layout:**
```tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

### Error Monitoring

1. **Sentry Integration:**
```bash
npm install @sentry/nextjs
```

2. **Configure:**
```javascript
// sentry.client.config.js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
})
```

## 🚀 Performance Optimization

### Next.js Optimizations

1. **Image Optimization:**
```tsx
import Image from 'next/image'

<Image
  src="/hero-image.jpg"
  alt="Himig AI"
  width={800}
  height={600}
  priority
/>
```

2. **Font Optimization:**
```tsx
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })
```

### CDN Configuration

1. **Cloudflare Setup:**
   - Add your domain to Cloudflare
   - Configure DNS settings
   - Enable caching rules

2. **Vercel Edge Functions:**
```typescript
// middleware.ts
import { NextResponse } from 'next/server'

export function middleware(request) {
  // Add caching headers
  const response = NextResponse.next()
  response.headers.set('Cache-Control', 'public, max-age=3600')
  return response
}
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 🧪 Testing in Production

### Health Checks

1. **API Endpoints:**
```bash
curl https://your-app.vercel.app/api/health
```

2. **Database Connection:**
```bash
curl https://your-app.vercel.app/api/db-health
```

### Load Testing

1. **Artillery Setup:**
```bash
npm install -g artillery
```

2. **Load Test:**
```yaml
# load-test.yml
config:
  target: 'https://your-app.vercel.app'
  phases:
    - duration: 60
      arrivalRate: 10

scenarios:
  - name: "Generate Music"
    requests:
      - post:
          url: "/api/generate"
          json:
            prompt: "Happy electronic music"
            genre: "Electronic"
            mood: "Happy"
            duration: 30
```

## 📞 Support & Troubleshooting

### Common Issues

1. **Build Failures:**
   - Check TypeScript errors
   - Verify environment variables
   - Review dependency versions

2. **Database Connection Issues:**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Monitor connection limits

3. **Authentication Problems:**
   - Verify Clerk configuration
   - Check webhook endpoints
   - Review CORS settings

### Getting Help

- 📖 [Next.js Documentation](https://nextjs.org/docs)
- 🔐 [Clerk Documentation](https://clerk.com/docs)
- 🗄️ [Supabase Documentation](https://supabase.com/docs)
- ☁️ [Vercel Documentation](https://vercel.com/docs)

---

**Congratulations!** 🎉 Your Himig AI music generation platform is now live in production!
