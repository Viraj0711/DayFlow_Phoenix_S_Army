# Traditional Deployment Guide (No Docker)

This guide covers deploying the HRMS application without Docker, using PM2 for Node.js process management and Nginx for serving the frontend.

## Prerequisites

- Ubuntu 20.04 or later (or similar Linux distribution)
- Node.js 18.x or later
- PostgreSQL 15 or later
- Nginx
- PM2 (for Node.js process management)
- Git

## Server Setup

### 1. Install Required Software

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install build tools
sudo apt install -y build-essential
```

### 2. Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE hrms_db;
CREATE USER hrms_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE hrms_db TO hrms_user;
ALTER USER hrms_user CREATEDB;
\q

# Configure PostgreSQL for remote connections (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Set: listen_addresses = 'localhost'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host    hrms_db    hrms_user    127.0.0.1/32    md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### 3. Create Application Directory

```bash
# Create directory structure
sudo mkdir -p /opt/hrms
sudo mkdir -p /opt/hrms/backups
sudo mkdir -p /var/www/hrms
sudo mkdir -p /var/log/hrms

# Set ownership
sudo chown -R $USER:$USER /opt/hrms
sudo chown -R www-data:www-data /var/www/hrms
```

## Application Deployment

### 1. Clone Repository

```bash
cd /opt/hrms
git clone https://github.com/Viraj0711/DayFlow_Phoenix_S_Army.git .
```

### 2. Backend Setup

```bash
cd /opt/hrms/backend

# Install dependencies
npm ci --production

# Create environment file
cat > .env << EOF
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_db
DB_USER=hrms_user
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@dayflow.com

# Application URLs
FRONTEND_URL=https://dayflow.com
API_URL=https://dayflow.com/api
EOF

# Create logs directory
mkdir -p logs

# Run database migrations (if applicable)
npm run migrate || echo "No migrations configured"

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs
```

### 3. Frontend Setup

```bash
cd /opt/hrms/frontend

# Install dependencies
npm ci

# Create environment file
cat > .env.production << EOF
REACT_APP_API_URL=https://dayflow.com/api
REACT_APP_ENV=production
EOF

# Build the application
npm run build

# Copy build to web directory
sudo cp -r build/* /var/www/hrms/

# Set permissions
sudo chown -R www-data:www-data /var/www/hrms
```

### 4. Nginx Configuration

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/hrms
```

Add the following configuration:

```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# Backend upstream
upstream backend {
    least_conn;
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name dayflow.com www.dayflow.com;
    
    return 301 https://$server_name$request_uri;
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name dayflow.com www.dayflow.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/dayflow.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dayflow.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Logging
    access_log /var/log/nginx/hrms_access.log;
    error_log /var/log/nginx/hrms_error.log warn;

    # Frontend (React app)
    root /var/www/hrms;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Backend API proxy
    location /api {
        limit_req zone=api_limit burst=20 nodelay;
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://backend;
        access_log off;
    }

    # Login rate limiting
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://backend;
    }

    # Static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # React Router support
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

Enable the configuration and restart Nginx:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/hrms /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### 5. SSL Certificate with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d dayflow.com -d www.dayflow.com

# Auto-renewal is configured by default
# Test renewal
sudo certbot renew --dry-run
```

## Monitoring and Management

### PM2 Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs hrms-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart hrms-backend

# Reload with zero-downtime
pm2 reload hrms-backend

# Stop application
pm2 stop hrms-backend

# Delete from PM2
pm2 delete hrms-backend
```

### Database Backup

```bash
# Manual backup
pg_dump -U hrms_user hrms_db > /opt/hrms/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (add to crontab)
crontab -e

# Add this line:
0 2 * * * pg_dump -U hrms_user hrms_db > /opt/hrms/backups/backup_$(date +\%Y\%m\%d).sql && find /opt/hrms/backups -type f -mtime +30 -delete
```

### Log Rotation

Create `/etc/logrotate.d/hrms`:

```bash
/var/log/hrms/*.log /opt/hrms/backend/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Deployment Updates

### Manual Deployment

```bash
cd /opt/hrms

# Pull latest changes
git pull origin main

# Backend update
cd backend
npm ci --production
pm2 reload ecosystem.config.js --env production

# Frontend update
cd ../frontend
npm ci
npm run build
sudo cp -r build/* /var/www/hrms/
sudo systemctl reload nginx
```

### Automated Deployment (via GitHub Actions)

The CI/CD pipeline automatically deploys when you push to the main branch. Ensure these secrets are configured in your GitHub repository:

- `PRODUCTION_HOST` - Server IP/hostname
- `PRODUCTION_USERNAME` - SSH username
- `PRODUCTION_SSH_KEY` - Private SSH key
- `DB_USER` - Database username
- `DB_NAME` - Database name
- `SLACK_WEBHOOK` - (Optional) For deployment notifications

## Troubleshooting

### Backend Issues

```bash
# Check PM2 status
pm2 list

# View error logs
pm2 logs hrms-backend --err

# Check if port is in use
sudo lsof -i :5000

# Restart backend
pm2 restart hrms-backend
```

### Frontend Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx configuration
sudo nginx -t

# View Nginx errors
sudo tail -f /var/log/nginx/hrms_error.log

# Rebuild frontend
cd /opt/hrms/frontend
npm run build
sudo cp -r build/* /var/www/hrms/
```

### Database Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U hrms_user -d hrms_db

# View recent errors
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Performance Optimization

```bash
# Enable PM2 monitoring
pm2 install pm2-logrotate

# Configure memory limits
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# Check system resources
htop
df -h
free -m
```

## Security Checklist

- [ ] Configure firewall (UFW)
- [ ] Set up fail2ban for brute force protection
- [ ] Enable automatic security updates
- [ ] Configure PostgreSQL authentication properly
- [ ] Use strong passwords and JWT secrets
- [ ] Enable SSL/TLS certificates
- [ ] Configure Nginx security headers
- [ ] Set up regular backups
- [ ] Configure log monitoring
- [ ] Restrict SSH access (key-based only)

## Additional Resources

- [PM2 Documentation](https://pm2.keymetrics.io/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
