# Service Configuration Guide

Detailed setup instructions for all external services used by Himig AI Music Platform.

## 🔐 Clerk Authentication Setup

### Step 1: Create Clerk Application

1. **Sign up for Clerk:**
   - Visit [https://clerk.com](https://clerk.com)
   - Click "Start building for free"
   - Sign up with GitHub (recommended) or email

2. **Create New Application:**
   - Click "Create Application"
   - Application name: `Himig AI Music Platform`
   - Select authentication methods:
     - ✅ **Email** (required)
     - ✅ **Google** (recommended for better UX)
     - ✅ **GitHub** (optional, good for developers)
     - ❌ Skip phone for now (can add later)

### Step 2: Configure Authentication Settings

1. **User Profile Settings:**
   - Go to User & Authentication → Email, Phone, Username
   - Configure required fields:
     - ✅ Email address (required)
     - ✅ First name (optional)
     - ✅ Last name (optional)
     - ❌ Username (optional)

2. **Session Settings:**
   - Go to User & Authentication → Sessions
   - Session timeout: 7 days (recommended)
   - Multi-session handling: Allow multiple sessions

3. **Social Connections:**
   - Go to User & Authentication → Social Connections
   - **Google Setup:**
     - Enable Google
     - Use Clerk's development keys initially
     - For production, create Google OAuth app:
       - Go to [Google Cloud Console](https://console.cloud.google.com)
       - Create new project or select existing
       - Enable Google+ API
       - Create OAuth 2.0 credentials
       - Add authorized redirect URIs from Clerk

### Step 3: Get API Keys

1. **Navigate to API Keys:**
   - Go to Developers → API Keys
   - Copy the keys:

```bash
# Development Keys
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Production Keys (create separate app for production)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Step 4: Configure Webhooks

1. **Create Webhook Endpoint:**
   - Go to Developers → Webhooks
   - Click "Add Endpoint"
   - Endpoint URL: `https://your-domain.vercel.app/api/webhooks/clerk`
   - Description: "User synchronization with Supabase"

2. **Select Events:**
   - ✅ `user.created`
   - ✅ `user.updated` 
   - ✅ `user.deleted`

3. **Get Webhook Secret:**
   ```bash
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

### Step 5: Domain Configuration

1. **Development:**
   - Clerk automatically handles localhost:3000
   - No additional configuration needed

2. **Production:**
   - Go to Developers → Domains
   - Add your production domain
   - Configure allowed origins and redirect URLs

## 🗄️ Supabase Database Setup

### Step 1: Create Supabase Project

1. **Sign up for Supabase:**
   - Visit [https://supabase.com](https://supabase.com)
   - Click "Start your project"
   - Sign up with GitHub (recommended)

2. **Create New Project:**
   - Click "New Project"
   - Organization: Select or create organization
   - Project name: `himig-ai-music-platform`
   - Database password: Generate strong password (save this!)
   - Region: Choose closest to your users
     - US East (N. Virginia) - `us-east-1`
     - Europe (Ireland) - `eu-west-1`
     - Asia Pacific (Singapore) - `ap-southeast-1`

### Step 2: Get Connection Details

1. **API Settings:**
   - Go to Settings → API
   - Copy the following:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Anon/Public Key (safe for client-side)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Service Role Key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Set Up Database Schema

1. **Run Schema SQL:**
   - Go to SQL Editor in Supabase Dashboard
   - Click "New Query"
   - Copy the entire contents of `database/schema.sql`
   - Paste and click "Run"

2. **Verify Tables Created:**
   - Go to Table Editor
   - You should see:
     - `users`
     - `generated_tracks`
     - `user_preferences`

3. **Check Row Level Security:**
   - Each table should show "RLS enabled"
   - Policies should be visible in the Policies tab

### Step 4: Configure Authentication

1. **Enable Auth Providers:**
   - Go to Authentication → Providers
   - Enable the same providers as Clerk:
     - ✅ Email
     - ✅ Google (if using)
     - ✅ GitHub (if using)

2. **Configure Auth Settings:**
   - Go to Authentication → Settings
   - Site URL: `https://your-domain.vercel.app`
   - Redirect URLs: Add your domain

### Step 5: Database Optimization

1. **Indexes (already included in schema):**
   - Verify indexes exist on frequently queried columns
   - Monitor query performance

2. **Connection Pooling:**
   - Go to Settings → Database
   - Connection pooling is enabled by default
   - Monitor connection usage

## 🚀 Vercel Configuration

### Step 1: Project Setup

1. **Connect GitHub:**
   - Go to [https://vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Import your repository

2. **Framework Detection:**
   - Vercel should auto-detect Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### Step 2: Environment Variables

Add all environment variables in Vercel Dashboard:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key
CLERK_WEBHOOK_SECRET=whsec_your_secret

# Next.js
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=your_random_secret_here
```

### Step 3: Domain Configuration

1. **Custom Domain (Optional):**
   - Go to Project Settings → Domains
   - Add your domain
   - Configure DNS records:
     - Type: CNAME
     - Name: @ (or subdomain)
     - Value: cname.vercel-dns.com

2. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - Verify HTTPS is working

## 📊 Analytics Setup

### Vercel Analytics

1. **Enable Analytics:**
   - Go to your project in Vercel
   - Click Analytics tab
   - Enable Web Analytics
   - No additional configuration needed

### Google Analytics (Optional)

1. **Create GA4 Property:**
   - Go to [Google Analytics](https://analytics.google.com)
   - Create new property
   - Get Measurement ID: `G-XXXXXXXXXX`

2. **Add to Environment Variables:**
   ```bash
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

## 🔧 Additional Services

### Email Service (Optional)

For transactional emails (password resets, notifications):

1. **Resend (Recommended):**
   - Sign up at [https://resend.com](https://resend.com)
   - Get API key
   - Add to environment variables

2. **SendGrid Alternative:**
   - Sign up at [https://sendgrid.com](https://sendgrid.com)
   - Create API key
   - Configure sender authentication

### File Storage (Future Enhancement)

For storing generated audio files:

1. **Supabase Storage:**
   - Already included in Supabase project
   - Create bucket for audio files
   - Configure RLS policies

2. **AWS S3 Alternative:**
   - Create S3 bucket
   - Configure CORS and permissions
   - Add AWS credentials to environment

## 🔒 Security Checklist

- [ ] All API keys stored as environment variables
- [ ] Service role keys never exposed to client
- [ ] HTTPS enforced on all domains
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] Database RLS policies active
- [ ] Webhook endpoints secured
- [ ] Strong passwords used for all services

## 🚨 Troubleshooting

### Common Issues

1. **Clerk Authentication Fails:**
   - Check API keys are correct
   - Verify domain is added to Clerk
   - Check webhook URL is accessible

2. **Supabase Connection Issues:**
   - Verify URL and keys
   - Check RLS policies
   - Monitor connection limits

3. **Vercel Build Failures:**
   - Check environment variables
   - Verify all dependencies installed
   - Check build logs for specific errors

### Getting Help

- **Clerk:** [https://clerk.com/support](https://clerk.com/support)
- **Supabase:** [https://supabase.com/support](https://supabase.com/support)
- **Vercel:** [https://vercel.com/support](https://vercel.com/support)

---

**Next:** Continue with the main deployment guide to complete your setup.
