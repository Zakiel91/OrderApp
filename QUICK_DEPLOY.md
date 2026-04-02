# 🚀 Quick Deploy Reference

## TL;DR - Fastest Deployment

### Windows
```batch
deploy.bat all
```

### Mac/Linux
```bash
chmod +x deploy.sh
./deploy.sh all
```

---

## Step-by-Step (5 minutes)

### 1️⃣ Setup (One Time Only)
```bash
npm install -g wrangler
wrangler login
```

### 2️⃣ Deploy Everything
```bash
# Windows
deploy.bat all

# Mac/Linux
./deploy.sh all
```

### 3️⃣ Verify
```bash
# Check if Order App loads
curl https://innovation-diamonds-app.pages.dev

# Check if API works
curl https://innovation-diamonds-api.innovation-diamonds.workers.dev/api/coins
```

---

## Manual Deployment (If Scripts Don't Work)

### Order App Only
```bash
cd C:\OrderApp
npm install
npm run build
wrangler pages deploy dist --project-name=innovation-diamonds-app
```

### Dashboard Only
```bash
# Frontend
cd C:\OrderApp\Dashboard\frontend
npm install
npm run build
wrangler pages deploy dist --project-name=innovation-dashboard

# Backend (Worker)
cd C:\OrderApp\Dashboard\worker
npm install
wrangler deploy
```

---

## Deployment URLs

After deployment, access at:

| Service | URL | Purpose |
|---------|-----|---------|
| **Order App** | https://innovation-diamonds-app.pages.dev | Create/manage orders |
| **Dashboard** | https://innovation-dashboard.pages.dev | Analytics & settings |
| **API** | https://innovation-diamonds-api.workers.dev | Backend API |

---

## Troubleshooting Quick Fixes

### "wrangler: command not found"
```bash
npm install -g wrangler
```

### "Not authenticated"
```bash
wrangler logout
wrangler login
```

### Build errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment failed
```bash
wrangler tail innovation-diamonds-api
# Check logs for errors
```

---

## What Gets Deployed

✅ **Order App**
- Order creation form
- Client management
- Order history
- Images & attachments

✅ **Dashboard**
- Analytics dashboard
- Inventory management
- Sales reports
- Settings & configuration

✅ **Database**
- D1 SQLite database
- Automatic backups
- Indexes & optimizations

---

## After Deployment

🎯 **Testing**
1. Load https://innovation-diamonds-app.pages.dev
2. Test client search (phone/ID/company number)
3. Create test order
4. Check API response times

📊 **Monitoring**
```bash
# View worker logs
wrangler tail innovation-diamonds-api

# Check deployment history
wrangler pages deployment list --project-name=innovation-diamonds-app

# Monitor database
wrangler d1 info innovation-diamonds
```

---

## Common Commands

```bash
# View logs (real-time)
wrangler tail innovation-diamonds-api

# Rollback to previous version
wrangler pages rollback --project-name=innovation-diamonds-app

# Check Cloudflare status
wrangler status

# View deployment history
wrangler pages deployment list --project-name=innovation-diamonds-app

# Initialize database
cd Dashboard/worker && npm run db:init
```

---

## Performance Targets

After deployment, verify:

- ✅ Page load time < 2 seconds
- ✅ API response < 100ms
- ✅ Search response < 50ms
- ✅ Error rate < 0.1%

Check in Cloudflare Analytics dashboard.

---

## Estimated Costs

**Monthly costs** (with 1,000 daily users):

| Service | Cost |
|---------|------|
| Pages (Order App) | Free |
| Pages (Dashboard) | Free |
| Workers (API) | ~$5/month |
| D1 Database | Free tier (50GB) |
| **Total** | **~$5/month** |

Cloudflare includes FREE:
- 100,000 Workers invocations/day
- D1 database (50GB)
- Pages hosting (unlimited)
- Email routing
- DDoS protection

---

## Need Help?

📚 **Documentation**
- `DEPLOYMENT_GUIDE.md` - Complete guide
- `DATABASE_OPTIMIZATION.md` - Query optimization
- `SESSION_IMPROVEMENTS.md` - Recent changes

🔗 **Links**
- Cloudflare Dashboard: https://dash.cloudflare.com
- Wrangler Docs: https://developers.cloudflare.com/workers/
- D1 Docs: https://developers.cloudflare.com/d1/

💬 **Support**
- Cloudflare Community: https://community.cloudflare.com
- Wrangler Issues: https://github.com/cloudflare/wrangler2/issues

---

## Version Info

**Current Build**
- Order App: v1.0.0
- Dashboard: v1.0.0
- API: v1.0.0
- Database: Latest schema with all optimizations

**Last Deployed**: [Fill in after first deployment]
**Next Review**: [Schedule monthly reviews]

---

**Ready to deploy? Run: `deploy.bat all` (Windows) or `./deploy.sh all` (Mac/Linux)**
