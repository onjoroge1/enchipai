# Deployment Guide

## Production Deployment

This guide covers deploying the Enchipai Mara Camp website to production.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (production)
- Domain name configured
- SSL certificate (for HTTPS)
- Environment variables configured

---

## 1. Production Database Setup

### Option A: Neon (Recommended)

1. Create a Neon project at [neon.tech](https://neon.tech)
2. Copy the connection string
3. Update `DATABASE_URL` in production environment

### Option B: Self-Hosted PostgreSQL

1. Set up PostgreSQL server
2. Create database:
   ```sql
   CREATE DATABASE enchipai_prod;
   ```
3. Configure connection string:
   ```
   DATABASE_URL="postgresql://user:password@host:5432/enchipai_prod?sslmode=require"
   ```

### Database Migration

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run db:seed
```

---

## 2. Environment Variables

Create a `.env.production` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/enchipai_prod?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://enchipai.com"
NEXTAUTH_SECRET="your-production-secret-key-here"

# Email Service (Resend)
RESEND_API_KEY="re_production_key"
EMAIL_FROM="Enchipai Mara Camp <noreply@enchipai.com>"

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY="sk_live_production_key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_production_key"
STRIPE_WEBHOOK_SECRET="whsec_production_secret"

# File Upload (Cloudinary or AWS S3)
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID="your-analytics-id"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

---

## 3. Build and Deploy

### Option A: Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

Vercel automatically:
- Builds the Next.js app
- Runs database migrations
- Sets up SSL
- Configures CDN

### Option B: Self-Hosted

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

3. **Use PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start npm --name "enchipai" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure reverse proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name enchipai.com www.enchipai.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

5. **Set up SSL with Let's Encrypt:**
   ```bash
   sudo certbot --nginx -d enchipai.com -d www.enchipai.com
   ```

---

## 4. Post-Deployment Checklist

### Database
- [ ] Run migrations: `npx prisma migrate deploy`
- [ ] Verify database connection
- [ ] Check seed data (if needed)

### Environment
- [ ] All environment variables set
- [ ] `NEXTAUTH_URL` matches production domain
- [ ] Email service configured
- [ ] Payment gateway configured

### Security
- [ ] Change default admin password
- [ ] Enable rate limiting
- [ ] Configure CORS (if needed)
- [ ] Set up firewall rules
- [ ] Enable HTTPS only

### Monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure uptime monitoring
- [ ] Set up log aggregation
- [ ] Configure alerts

### Performance
- [ ] Enable image optimization
- [ ] Configure CDN (if self-hosted)
- [ ] Set up caching (Redis, if needed)
- [ ] Monitor database performance

---

## 5. Backup and Recovery

### Automated Backups

#### Database Backups

**Using Neon:**
- Neon provides automatic backups
- Configure backup retention period

**Self-Hosted:**
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backups/enchipai_$DATE.sql
# Keep last 30 days
find backups -name "*.sql" -mtime +30 -delete
```

**Schedule with cron:**
```bash
0 2 * * * /path/to/backup-script.sh
```

### Manual Backup

```bash
# Database backup
pg_dump $DATABASE_URL > backup.sql

# Files backup (if self-hosted)
tar -czf files-backup.tar.gz /path/to/uploads
```

### Recovery

```bash
# Restore database
psql $DATABASE_URL < backup.sql

# Or using Prisma
npx prisma db push --force-reset
npx prisma db seed
```

---

## 6. CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 7. Monitoring and Maintenance

### Health Checks

Create `/api/health` endpoint:

```typescript
export async function GET() {
  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy' }, { status: 500 });
  }
}
```

### Logging

- Use structured logging
- Log errors to external service (Sentry)
- Monitor API response times
- Track database query performance

### Updates

1. **Pull latest code:**
   ```bash
   git pull origin main
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Rebuild:**
   ```bash
   npm run build
   ```

5. **Restart:**
   ```bash
   pm2 restart enchipai
   ```

---

## 8. Security Checklist

- [ ] All default passwords changed
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (Prisma)
- [ ] File upload validation
- [ ] Environment variables secured
- [ ] Database credentials secured
- [ ] API keys rotated regularly
- [ ] Security headers configured
- [ ] Regular security audits

---

## 9. Performance Optimization

### Database
- [ ] Indexes created for frequent queries
- [ ] Query optimization applied
- [ ] Connection pooling configured
- [ ] Regular VACUUM and ANALYZE

### Application
- [ ] Caching enabled
- [ ] Image optimization enabled
- [ ] Code splitting configured
- [ ] Bundle size optimized

### Infrastructure
- [ ] CDN configured
- [ ] Load balancing (if needed)
- [ ] Auto-scaling configured
- [ ] Monitoring dashboards

---

## 10. Rollback Procedure

If deployment fails:

1. **Revert code:**
   ```bash
   git revert HEAD
   git push
   ```

2. **Rollback database migration:**
   ```bash
   npx prisma migrate resolve --rolled-back <migration-name>
   ```

3. **Restore from backup:**
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

---

## Support

For deployment issues:
- Check logs: `pm2 logs enchipai` (if using PM2)
- Check Vercel logs (if using Vercel)
- Review error tracking (Sentry)
- Check database connection
- Verify environment variables

---

## Production URLs

After deployment:
- **Website**: https://enchipai.com
- **Admin**: https://enchipai.com/admin
- **API**: https://enchipai.com/api
- **Health Check**: https://enchipai.com/api/health

