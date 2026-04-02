@echo off
REM Innovation Diamonds - Complete Deployment Script (Windows)
REM Usage: deploy.bat [order-app|dashboard|all]

setlocal enabledelayedexpansion

echo.
echo ===================================================
echo   Innovation Diamonds - Deployment Script
echo ===================================================
echo.

REM Check if wrangler is installed
wrangler --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Wrangler CLI not found.
    echo Install with: npm install -g wrangler
    pause
    exit /b 1
)

REM Check if logged in
wrangler whoami >nul 2>&1
if errorlevel 1 (
    echo [INFO] Not authenticated. Running: wrangler login
    wrangler login
)

set DEPLOY_TYPE=%1
if "%DEPLOY_TYPE%"=="" set DEPLOY_TYPE=all

if "%DEPLOY_TYPE%"=="order-app" goto deploy_order_app
if "%DEPLOY_TYPE%"=="dashboard" goto deploy_dashboard
if "%DEPLOY_TYPE%"=="all" goto deploy_all
goto usage

:deploy_all
echo.
echo [0/3] Backing up D1 database...
if not exist "backups" mkdir backups
for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set TODAY=%%c-%%b-%%a
wrangler d1 export innovation-diamonds --output="backups\innovation-diamonds-%TODAY%.sql" --remote
if errorlevel 1 (
    echo [WARN] DB backup failed - continuing anyway
) else (
    echo [SUCCESS] Database backed up to backups\innovation-diamonds-%TODAY%.sql
)

echo.
echo [1/3] Deploying Order App...
call :deploy_order_app
if errorlevel 1 exit /b 1

echo.
echo [2/3] Deploying Dashboard Frontend...
call :deploy_dashboard_frontend
if errorlevel 1 exit /b 1

echo.
echo [3/3] Deploying Dashboard API...
call :deploy_dashboard_worker
if errorlevel 1 exit /b 1

goto success

:deploy_order_app
echo [Order App] Installing dependencies...
call npm install >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm install failed
    exit /b 1
)

echo [Order App] Building...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Build failed
    exit /b 1
)

echo [Order App] Uploading to Cloudflare Pages...
call wrangler pages deploy dist --project-name=order-app --commit-dirty=true
if errorlevel 1 (
    echo [ERROR] Deployment failed
    exit /b 1
)

echo [SUCCESS] Order App deployed to:
echo https://orders.innovationdia.com
exit /b 0

:deploy_dashboard_frontend
pushd Dashboard\frontend
echo [Dashboard Frontend] Installing dependencies...
call npm install >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm install failed
    popd
    exit /b 1
)

echo [Dashboard Frontend] Building...
call npm run build >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Build failed
    popd
    exit /b 1
)

echo [Dashboard Frontend] Uploading to Cloudflare Pages...
call wrangler pages deploy dist --project-name=dashboard --commit-dirty=true
if errorlevel 1 (
    echo [ERROR] Deployment failed
    popd
    exit /b 1
)

echo [SUCCESS] Dashboard Frontend deployed to:
echo https://innovation-dashboard.pages.dev
popd
exit /b 0

:deploy_dashboard_worker
pushd Dashboard\worker
echo [Dashboard API] Installing dependencies...
call npm install >nul 2>&1
if errorlevel 1 (
    echo [ERROR] npm install failed
    popd
    exit /b 1
)

echo [Dashboard API] Deploying Worker...
call wrangler deploy --config wrangler.toml
if errorlevel 1 (
    echo [ERROR] Deployment failed
    popd
    exit /b 1
)

echo [SUCCESS] Dashboard API deployed to:
echo https://innovation-diamonds-api.innovation-diamonds.workers.dev
popd
exit /b 0

:success
echo.
echo ===================================================
echo   Deployment Complete!
echo ===================================================
echo.
echo [NEXT STEPS]
echo   1. Visit https://innovation-diamonds-app.pages.dev
echo   2. Test client search functionality
echo   3. Check Cloudflare dashboard for any errors
echo   4. Monitor logs: wrangler tail innovation-diamonds-api
echo.
pause
exit /b 0

:usage
echo [ERROR] Usage: deploy.bat [order-app^|dashboard^|all]
pause
exit /b 1
