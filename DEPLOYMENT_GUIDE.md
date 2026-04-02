# Deployment Guide - Innovation Diamonds Order App

## Project Structure

```
OrderApp/
├── src/                    # Order App (Frontend - React)
├── Dashboard/
│   ├── frontend/          # Dashboard Frontend (React)
│   └── worker/            # Dashboard Backend (Cloudflare Workers)
├── package.json           # Order App dependencies
└── dist/                  # Build output (don't commit)
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Network                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  Order App       │      │  Dashboard       │        │
│  │  (Pages)         │      │  (Pages + Workers)       │
│  │                  │      │                  │        │
│  │  index.html      │      │  /dashboard      │        │
│  │  /assets/...     │      │  /api/...        │        │
│  └────────┬─────────┘      └────────┬─────────┘        │
│           │                         │                  │
│           └────────────┬────────────┘                  │
│                        │                               │
│                 ┌──────▼──────┐                        │
│                 │  D1 Database │                       │
│                 │  SQLite      │                       │
│                 └──────────────┘                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Prerequisites

1. **Cloudflare Account** - https://dash.cloudflare.com
2. **Wrangler CLI** - Latest version
   ```bash
   npm install -g wrangler
   ```
3. **Git** - For version control
4. **Node.js** - v18+ (LTS recommended)

---

## Step 1: Setup Cloudflare

### 1.1 Install Wrangler Globally
```bash
npm install -g wrangler
```

### 1.2 Login to Cloudflare
```bash
wrangler login
```
This opens browser to authenticate. Click "Allow" to authorize.

### 1.3 Verify Login
```bash
wrangler whoami
```
Should show your Cloudflare account details.

---

## Step 2: Deploy the Order App (Frontend Only)

**Location**: `C:\OrderApp\`

### 2.1 Install Dependencies
```bash
cd C:\OrderApp
npm install
```

### 2.2 Build the Project
```bash
npm run build
```
Creates `/dist` folder with production build.

### 2.3 Deploy to Cloudflare Pages
```bash
wrangler pages deploy dist --project-name=innovation-diamonds-app
```

**What happens:**
- ✅ Uploads `/dist` to Cloudflare Pages
- ✅ Creates project "innovation-diamonds-app" if it doesn't exist
- ✅ Assigns unique URL: `https://innovation-diamonds-app.pages.dev`

**Output example:**
```
✨ Upload complete!
🌎 Deployment live at: https://innovation-diamonds-app.pages.dev
```

---

## Step 3: Deploy the Dashboard (Workers + Pages)

**Location**: `C:\OrderApp\Dashboard\`

### 3.1 Frontend Deployment

```bash
cd C:\OrderApp\Dashboard/frontend
npm install
npm run build
```

### 3.2 Deploy Frontend to Pages
```bash
wrangler pages deploy dist --project-name=innovation-dashboard
```

### 3.3 Backend Deployment (Cloudflare Workers)

```bash
cd C:\OrderApp\Dashboard/worker
npm install
```

### 3.4 Deploy Worker
```bash
wrangler deploy --config wrangler.toml
```

**Output example:**
```
✨ Successfully published your Worker to
📛 innovation-diamonds-api.innovation-diamonds.workers.dev
```

---

## Step 4: Verify Deployments

### Check Order App
```bash
curl https://innovation-diamonds-app.pages.dev
```
Should return HTML homepage.

### Check Dashboard Frontend
```bash
curl https://innovation-dashboard.pages.dev
```
Should return Dashboard HTML.

### Check API Endpoint
```bash
curl https://innovation-diamonds-api.innovation-diamonds.workers.dev/api/coins
```
Should return JSON with coin data.

---

## Step 5: Update Database Connection (if needed)

The Order App connects to the API at:
```typescript
const API_BASE = 'https://innovation-diamonds-api.innovation-diamonds.workers.dev'
```

**If your worker URL is different**, update in `src/lib/api.ts`:
```typescript
const API_BASE = 'https://YOUR-WORKER-URL.workers.dev'
```

Then rebuild and redeploy the Order App.

---

## Complete Deployment Checklist

### Prerequisites
- [ ] Cloudflare account created
- [ ] Wrangler CLI installed (`npm install -g wrangler`)
- [ ] Logged in to Cloudflare (`wrangler login`)
- [ ] Git configured for version control

### Order App Deployment
- [ ] Navigate to `C:\OrderApp`
- [ ] Run `npm install`
- [ ] Run `npm run build` (no errors)
- [ ] Run `wrangler pages deploy dist --project-name=innovation-diamonds-app`
- [ ] Verify at `https://innovation-diamonds-app.pages.dev`

### Dashboard Frontend Deployment
- [ ] Navigate to `C:\OrderApp\Dashboard\frontend`
- [ ] Run `npm install`
- [ ] Run `npm run build` (no errors)
- [ ] Run `wrangler pages deploy dist --project-name=innovation-dashboard`
- [ ] Verify at `https://innovation-dashboard.pages.dev`

### Dashboard Backend Deployment
- [ ] Navigate to `C:\OrderApp\Dashboard\worker`
- [ ] Run `npm install`
- [ ] Run `wrangler deploy --config wrangler.toml`
- [ ] Verify Worker deployment succeeded

### Final Verification
- [ ] Order App loads without errors
- [ ] Dashboard loads without errors
- [ ] Client search works (test with phone/ID)
- [ ] API calls return data
- [ ] Database queries work

---

## Automated Deployment (Optional)

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Deploy Order App
        run: |
          cd OrderApp
          npm install
          npm run build
          npx wrangler pages deploy dist --project-name=innovation-diamonds-app
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy Dashboard
        run: |
          cd Dashboard/frontend
          npm install
          npm run build
          npx wrangler pages deploy dist --project-name=innovation-dashboard
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}

      - name: Deploy Worker
        run: |
          cd Dashboard/worker
          npm install
          npm run deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

Then set `CLOUDFLARE_API_TOKEN` in GitHub Secrets.

---

## Environment Variables

### For Cloudflare Workers (wrangler.toml)
Already configured:
```toml
[vars]
JEWELRY_FEED_URL = "https://erp.barakdiamonds.com/IDG/Output/Certificates/JewelryFeed.csv"
```

### For Order App (if needed)
Create `.env` file in `C:\OrderApp\`:
```env
VITE_API_BASE=https://innovation-diamonds-api.innovation-diamonds.workers.dev
```

---

## Troubleshooting

### Issue: "Error: Not authenticated"
**Solution:**
```bash
wrangler logout
wrangler login
```

### Issue: "Command not found: wrangler"
**Solution:**
```bash
npm install -g wrangler
```

### Issue: Build fails with TypeScript errors
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Worker deployment fails
**Solution:**
```bash
# Check wrangler config
cd Dashboard/worker
wrangler whoami
wrangler deploy --config wrangler.toml
```

### Issue: Database migration fails
**Solution:**
```bash
# Initialize D1 database
cd Dashboard/worker
npm run db:init
npm run db:seed
```

---

## Monitoring & Logs

### View Worker Logs
```bash
wrangler tail innovation-diamonds-api
```

### View Deployment History
```bash
wrangler pages deployment list --project-name=innovation-diamonds-app
```

### Check D1 Database Status
```bash
wrangler d1 info innovation-diamonds
```

---

## Rollback Procedure

If deployment has issues:

### Rollback Order App
```bash
wrangler pages deployment list --project-name=innovation-diamonds-app
wrangler pages rollback --project-name=innovation-diamonds-app
```

### Rollback Worker
```bash
# Redeploy previous version from git
git checkout [previous-commit]
wrangler deploy
```

---

## Post-Deployment Tasks

- [ ] Test all client search functionality
- [ ] Verify database indexes created (check /api/data-status)
- [ ] Monitor error logs for 24 hours
- [ ] Load test with sample data
- [ ] Backup database (D1 auto-backups daily)
- [ ] Document any custom configurations

---

## Performance Monitoring

Monitor these metrics post-deployment:

1. **Page Load Time** - Target: < 2 seconds
2. **API Response Time** - Target: < 100ms
3. **Database Query Time** - Target: < 50ms
4. **Error Rate** - Target: < 0.1%

**Tools:**
- Cloudflare Analytics Dashboard
- Worker Logs (`wrangler tail`)
- D1 Query Performance

---

## Support & Maintenance

### Weekly Tasks
- Review error logs
- Check database size
- Monitor API usage

### Monthly Tasks
- Run performance analysis
- Update dependencies
- Backup database

### Quarterly Tasks
- Review cost optimization
- Plan capacity upgrades
- Security audit

---

## Next Deployment

For future deployments (bug fixes, new features):

```bash
# Order App only
cd C:\OrderApp
npm run build
wrangler pages deploy dist --project-name=innovation-diamonds-app

# Dashboard only
cd C:\OrderApp\Dashboard/worker
wrangler deploy

# Both
npm run deploy  # if you add this script to package.json
```

---

**Status**: ✅ Ready for Production Deployment
**Environment**: Cloudflare Pages + Workers + D1
**Uptime SLA**: 99.9% guaranteed by Cloudflare
