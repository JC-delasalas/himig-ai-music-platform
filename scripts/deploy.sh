#!/bin/bash

# Himig AI Music Platform - Deployment Script
# This script helps automate the deployment process

set -e  # Exit on any error

echo "🎵 Himig AI Music Platform - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    print_error "Git repository not initialized. Please run 'git init' first."
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Committing them now..."
    git add .
    echo "Enter commit message (or press Enter for default):"
    read -r commit_message
    if [ -z "$commit_message" ]; then
        commit_message="Pre-deployment commit: $(date)"
    fi
    git commit -m "$commit_message"
    print_success "Changes committed"
fi

# Step 2: Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    print_warning "No remote origin found. Please set up GitHub repository first."
    echo "1. Go to https://github.com/JC-delasalas"
    echo "2. Click 'New' to create a repository"
    echo "3. Name it 'himig-ai-music-platform'"
    echo "4. Do NOT initialize with README, .gitignore, or license"
    echo "5. Copy the repository URL and enter it below:"
    echo ""
    echo "Enter your GitHub repository URL:"
    read -r repo_url
    
    if [ -z "$repo_url" ]; then
        print_error "Repository URL is required"
        exit 1
    fi
    
    git remote add origin "$repo_url"
    print_success "Remote origin added: $repo_url"
fi

# Step 3: Push to GitHub
print_status "Pushing to GitHub..."
if git push -u origin main; then
    print_success "Code pushed to GitHub successfully!"
else
    print_error "Failed to push to GitHub. Please check your repository URL and permissions."
    exit 1
fi

# Step 4: Environment Variables Check
print_status "Checking environment variables..."

required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ] && ! grep -q "^$var=" .env.local 2>/dev/null; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    print_warning "Missing environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please ensure all required environment variables are set in .env.local"
    echo "Refer to docs/SERVICE_SETUP.md for detailed instructions"
fi

# Step 5: Build Test
print_status "Testing production build..."
if npm run build; then
    print_success "Production build successful!"
else
    print_error "Production build failed. Please fix build errors before deploying."
    exit 1
fi

# Step 6: Deployment Instructions
echo ""
echo "🚀 Next Steps for Deployment:"
echo "=============================="
echo ""
echo "1. VERCEL DEPLOYMENT:"
echo "   - Go to https://vercel.com"
echo "   - Click 'New Project'"
echo "   - Import your GitHub repository: himig-ai-music-platform"
echo "   - Configure environment variables (see docs/SERVICE_SETUP.md)"
echo "   - Deploy!"
echo ""
echo "2. SERVICE CONFIGURATION:"
echo "   - Set up Clerk authentication (docs/SERVICE_SETUP.md)"
echo "   - Configure Supabase database (docs/SERVICE_SETUP.md)"
echo "   - Run database schema (database/schema.sql)"
echo ""
echo "3. POST-DEPLOYMENT:"
echo "   - Update Clerk webhook URL with your Vercel domain"
echo "   - Test all functionality using docs/PRODUCTION_CHECKLIST.md"
echo "   - Monitor using Vercel Analytics"
echo ""

# Step 7: Generate deployment summary
cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary

**Generated:** $(date)
**Repository:** $(git remote get-url origin 2>/dev/null || echo "Not set")
**Branch:** $(git branch --show-current)
**Last Commit:** $(git log -1 --pretty=format:"%h - %s (%an, %ar)")

## Files Ready for Deployment
- ✅ Next.js 14 application with TypeScript
- ✅ Comprehensive documentation in docs/
- ✅ Database schema in database/schema.sql
- ✅ Environment configuration templates
- ✅ Production-ready configuration

## Next Steps
1. Complete service setup (Clerk, Supabase)
2. Deploy to Vercel
3. Run production checklist
4. Monitor and maintain

## Documentation
- 📖 [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)
- 🔧 [Service Setup](docs/SERVICE_SETUP.md)
- ✅ [Production Checklist](docs/PRODUCTION_CHECKLIST.md)
- 📊 [Post-Deployment Guide](docs/POST_DEPLOYMENT.md)

## Support
For issues during deployment, refer to the troubleshooting sections in the documentation.
EOF

print_success "Deployment summary created: DEPLOYMENT_SUMMARY.md"

echo ""
print_success "🎉 Deployment preparation complete!"
print_status "Your Himig AI Music Platform is ready for production deployment."
echo ""
echo "📚 Documentation available in the docs/ folder"
echo "🚀 Follow the Vercel deployment steps above to go live"
echo ""
echo "Good luck with your launch! 🎵"
