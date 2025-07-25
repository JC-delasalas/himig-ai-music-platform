#!/bin/bash

# Fix Vercel Dashboard API Errors
# This script helps resolve 404/400 errors from Vercel dashboard

echo "🔧 Fixing Vercel Dashboard API Errors..."
echo "========================================"

# Step 1: Clear Vercel cache
echo "📁 Clearing Vercel cache..."
if [ -d ".vercel" ]; then
    rm -rf .vercel
    echo "✅ Cleared .vercel directory"
else
    echo "ℹ️  No .vercel directory found"
fi

# Step 2: Check if Vercel CLI is installed
echo ""
echo "🔍 Checking Vercel CLI..."
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    vercel --version
else
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel@latest
fi

# Step 3: Login to Vercel (interactive)
echo ""
echo "🔐 Please login to Vercel..."
echo "This will open a browser window for authentication."
read -p "Press Enter to continue..."
vercel login

# Step 4: Link project
echo ""
echo "🔗 Linking project to Vercel..."
echo "When prompted:"
echo "  - Link to existing project: Y"
echo "  - Project name: himig-ai-music-platform"
echo "  - Directory: ./ (current directory)"
vercel link

# Step 5: Set environment variables (if needed)
echo ""
echo "🌍 Environment variables..."
echo "Make sure these are set in your Vercel dashboard:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
echo "  - CLERK_SECRET_KEY"
echo "  - CLERK_WEBHOOK_SECRET"

# Step 6: Deploy
echo ""
echo "🚀 Deploying to Vercel..."
read -p "Deploy now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod
    echo "✅ Deployment initiated"
else
    echo "ℹ️  Skipped deployment. Run 'vercel --prod' when ready."
fi

echo ""
echo "🎉 Vercel setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Check Vercel dashboard for any remaining issues"
echo "2. Verify all environment variables are set"
echo "3. Test your application functionality"
echo "4. Monitor browser console for errors"
echo ""
echo "🔗 Useful links:"
echo "  - Vercel Dashboard: https://vercel.com/dashboard"
echo "  - Project Settings: https://vercel.com/dashboard/[your-project]/settings"
echo "  - Deployment Logs: https://vercel.com/dashboard/[your-project]/deployments"
