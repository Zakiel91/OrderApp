#!/bin/bash

# Innovation Diamonds - Complete Deployment Script
# Usage: ./deploy.sh [order-app|dashboard|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Innovation Diamonds - Deployment Script${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found. Install with: npm install -g wrangler${NC}"
    exit 1
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated. Running: wrangler login${NC}"
    wrangler login
fi

# Deployment function
deploy_order_app() {
    echo -e "${BLUE}📦 Deploying Order App...${NC}"
    cd "$(dirname "$0")"

    echo -e "${YELLOW}  📥 Installing dependencies...${NC}"
    npm install > /dev/null 2>&1

    echo -e "${YELLOW}  🔨 Building...${NC}"
    npm run build > /dev/null 2>&1

    echo -e "${YELLOW}  🚀 Uploading to Cloudflare Pages...${NC}"
    wrangler pages deploy dist --project-name=innovation-diamonds-app

    echo -e "${GREEN}✅ Order App deployed!${NC}"
    echo -e "${GREEN}   🌍 URL: https://innovation-diamonds-app.pages.dev${NC}\n"
}

deploy_dashboard_frontend() {
    echo -e "${BLUE}📦 Deploying Dashboard Frontend...${NC}"
    cd "$(dirname "$0")/Dashboard/frontend"

    echo -e "${YELLOW}  📥 Installing dependencies...${NC}"
    npm install > /dev/null 2>&1

    echo -e "${YELLOW}  🔨 Building...${NC}"
    npm run build > /dev/null 2>&1

    echo -e "${YELLOW}  🚀 Uploading to Cloudflare Pages...${NC}"
    wrangler pages deploy dist --project-name=innovation-dashboard

    echo -e "${GREEN}✅ Dashboard Frontend deployed!${NC}"
    echo -e "${GREEN}   🌍 URL: https://innovation-dashboard.pages.dev${NC}\n"
}

deploy_dashboard_worker() {
    echo -e "${BLUE}📦 Deploying Dashboard API (Worker)...${NC}"
    cd "$(dirname "$0")/Dashboard/worker"

    echo -e "${YELLOW}  📥 Installing dependencies...${NC}"
    npm install > /dev/null 2>&1

    echo -e "${YELLOW}  🚀 Deploying Worker...${NC}"
    wrangler deploy --config wrangler.toml

    echo -e "${GREEN}✅ Dashboard API deployed!${NC}"
    echo -e "${GREEN}   🌍 URL: https://innovation-diamonds-api.innovation-diamonds.workers.dev${NC}\n"
}

# Main logic
DEPLOY_TYPE=${1:-all}

case $DEPLOY_TYPE in
    order-app)
        deploy_order_app
        ;;
    dashboard)
        deploy_dashboard_frontend
        deploy_dashboard_worker
        ;;
    all)
        deploy_order_app
        deploy_dashboard_frontend
        deploy_dashboard_worker
        ;;
    *)
        echo -e "${RED}Usage: ./deploy.sh [order-app|dashboard|all]${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ Deployment Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📋 Next Steps:${NC}"
echo -e "  1. Visit https://innovation-diamonds-app.pages.dev"
echo -e "  2. Test client search functionality"
echo -e "  3. Check Cloudflare dashboard for any errors"
echo -e "  4. Monitor logs: wrangler tail innovation-diamonds-api\n"
