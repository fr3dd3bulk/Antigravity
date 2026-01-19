# Deployment Guide for Antigravity

## Production Deployment Checklist

### 1. Environment Configuration

#### Server (.env)
```env
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourdomain.com

# Database - Use MongoDB Atlas or managed MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/antigravity?retryWrites=true&w=majority

# Redis - Use Redis Cloud or managed Redis
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# JWT - Generate strong random secret
JWT_SECRET=your-very-long-random-secret-key-here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL
CLIENT_URL=https://yourdomain.com
```

#### Client (.env)
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. Database Setup

#### MongoDB Atlas
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for any IP)
5. Get connection string
6. Update MONGODB_URI in server .env

#### Redis Cloud
1. Create a Redis Cloud account
2. Create a new database
3. Get host, port, and password
4. Update Redis config in server .env

### 3. Server Deployment Options

#### Option A: Docker Deployment

Create `Dockerfile` in server directory:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src

EXPOSE 3000

CMD ["node", "src/app.js"]
```

Build and run:
```bash
docker build -t antigravity-server .
docker run -d -p 3000:3000 --env-file .env antigravity-server
```

#### Option B: Platform-as-a-Service (Heroku, Railway, Render)

1. **Heroku**:
```bash
# Install Heroku CLI
heroku login
heroku create antigravity-api

# Add buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_uri
# ... set all other env vars

# Deploy
git push heroku main
```

2. **Railway**:
- Connect GitHub repo
- Add environment variables in Railway dashboard
- Deploy automatically on push

3. **Render**:
- Create new Web Service
- Connect GitHub repo
- Add environment variables
- Set build command: `cd server && npm install`
- Set start command: `cd server && npm start`

#### Option C: VPS (DigitalOcean, AWS EC2, etc.)

```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/antigravity.git
cd antigravity/server

# Install dependencies
npm ci --only=production

# Install PM2 for process management
sudo npm install -g pm2

# Start server with PM2
pm2 start src/app.js --name antigravity-api

# Setup PM2 to restart on reboot
pm2 startup
pm2 save

# Setup Nginx as reverse proxy
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/antigravity

# Add configuration:
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/antigravity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 4. Client Deployment

#### Build for Production
```bash
cd client
npm run build
```

#### Option A: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option B: Netlify
1. Connect GitHub repository
2. Set build command: `cd client && npm run build`
3. Set publish directory: `client/dist`
4. Add environment variables
5. Deploy

#### Option C: Static Hosting (S3, Cloudflare Pages)
Upload contents of `client/dist` to hosting provider

### 5. DNS Configuration

Point your domains:
- `api.yourdomain.com` → Server IP/Hostname
- `yourdomain.com` → Client hosting (Vercel/Netlify)

### 6. Security Hardening

1. **Enable CORS properly**:
```javascript
// server/src/app.js
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
```

2. **Rate Limiting**:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

3. **Helmet for security headers**:
```bash
npm install helmet
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

4. **Environment Variables**: Never commit .env files to Git

5. **MongoDB**: Enable authentication and use SSL/TLS

6. **Redis**: Use password authentication

### 7. Monitoring & Logging

#### Application Monitoring
- Sentry for error tracking
- DataDog for APM
- New Relic

#### Logging
```bash
npm install winston
```

#### Health Checks
Already implemented at `/health` endpoint

### 8. Scaling Considerations

#### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB, Cloudflare)
- Run multiple server instances
- Use Redis for session storage (already configured)

#### Worker Scaling
- Run multiple BullMQ workers
- Use separate worker processes

```bash
# worker.js (separate file)
import { initWorker } from './src/engine/worker.js';
initWorker();
```

Run with PM2:
```bash
pm2 start worker.js -i 4  # 4 worker instances
```

### 9. Backup Strategy

#### MongoDB Backups
- MongoDB Atlas: Automated backups enabled by default
- Self-hosted: Set up automated backups with `mongodump`

```bash
# Backup script
mongodump --uri="mongodb://..." --out=/backup/$(date +%Y%m%d)
```

#### Redis Backups
- Redis Cloud: Automated backups
- Self-hosted: Enable RDB snapshots

### 10. CI/CD Pipeline

#### GitHub Actions Example

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-server:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd server && npm ci
      - run: cd server && npm test
      - name: Deploy to production
        run: |
          # Your deployment script here
          
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd client && npm ci
      - run: cd client && npm run build
      - name: Deploy to Vercel
        run: npx vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

### 11. Performance Optimization

1. **Enable compression**:
```bash
npm install compression
```

```javascript
import compression from 'compression';
app.use(compression());
```

2. **Database Indexing**: Already implemented in models

3. **Caching**: Use Redis for frequently accessed data

4. **CDN**: Use CDN for client assets (Cloudflare, AWS CloudFront)

### 12. Post-Deployment Testing

1. Test user registration and login
2. Test workflow creation and execution
3. Test webhook triggers
4. Monitor error rates
5. Check performance metrics
6. Test all API endpoints

## Estimated Costs (Monthly)

### Minimal Setup
- MongoDB Atlas (Free tier): $0
- Redis Cloud (30MB free): $0
- Heroku Hobby: $7
- Vercel Hobby: $0
- **Total: ~$7/month**

### Production Setup
- MongoDB Atlas (M10): $57
- Redis Cloud (1GB): $12
- AWS EC2 (t3.medium): $30
- Vercel Pro: $20
- **Total: ~$119/month**

### Enterprise Setup
- MongoDB Atlas (M30): $250+
- Redis Cloud (5GB): $60
- AWS EC2 (multiple instances): $200+
- CloudFlare Pro: $20
- Monitoring (DataDog): $100+
- **Total: ~$630+/month**
