@echo off
echo 🔧 Fixing Vercel Dashboard API Errors...
echo ========================================

REM Step 1: Clear Vercel cache
echo 📁 Clearing Vercel cache...
if exist ".vercel" (
    rmdir /s /q ".vercel"
    echo ✅ Cleared .vercel directory
) else (
    echo ℹ️  No .vercel directory found
)

REM Step 2: Check if Vercel CLI is installed
echo.
echo 🔍 Checking Vercel CLI...
vercel --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✅ Vercel CLI is installed
    vercel --version
) else (
    echo ❌ Vercel CLI not found. Installing...
    npm install -g vercel@latest
)

REM Step 3: Login to Vercel
echo.
echo 🔐 Please login to Vercel...
echo This will open a browser window for authentication.
pause
vercel login

REM Step 4: Link project
echo.
echo 🔗 Linking project to Vercel...
echo When prompted:
echo   - Link to existing project: Y
echo   - Project name: himig-ai-music-platform
echo   - Directory: ./ (current directory)
vercel link

REM Step 5: Environment variables reminder
echo.
echo 🌍 Environment variables...
echo Make sure these are set in your Vercel dashboard:
echo   - NEXT_PUBLIC_SUPABASE_URL
echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo   - SUPABASE_SERVICE_ROLE_KEY
echo   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
echo   - CLERK_SECRET_KEY
echo   - CLERK_WEBHOOK_SECRET

REM Step 6: Deploy
echo.
set /p deploy="🚀 Deploy now? (y/n): "
if /i "%deploy%"=="y" (
    vercel --prod
    echo ✅ Deployment initiated
) else (
    echo ℹ️  Skipped deployment. Run 'vercel --prod' when ready.
)

echo.
echo 🎉 Vercel setup complete!
echo.
echo 📋 Next steps:
echo 1. Check Vercel dashboard for any remaining issues
echo 2. Verify all environment variables are set
echo 3. Test your application functionality
echo 4. Monitor browser console for errors
echo.
echo 🔗 Useful links:
echo   - Vercel Dashboard: https://vercel.com/dashboard
echo   - Project Settings: https://vercel.com/dashboard/[your-project]/settings
echo   - Deployment Logs: https://vercel.com/dashboard/[your-project]/deployments

pause
