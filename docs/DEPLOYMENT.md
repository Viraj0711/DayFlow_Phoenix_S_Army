# DayFlow HRMS - DevOps Documentation

## Table of Contents

1. [Quick Start](#quick-start)
2. [Local Development](#local-development)
3. [CI/CD Pipeline](#cicd-pipeline)
4. [Deployment](#deployment)
5. [Monitoring & Logging](#monitoring--logging)
6. [Security](#security)
7. [Troubleshooting](#troubleshooting)
8. [Maintenance](#maintenance)

---

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- PM2 (Process Manager)
- Git
- PostgreSQL 14+
- AWS CLI (for cloud deployment)
- Terraform (for infrastructure as code)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Viraj0711/DayFlow_Phoenix_S_Army.git
   cd DayFlow_Phoenix_S_Army
   ```

2. **Install dependencies:**
   ```bash
   # Install PM2 globally
   npm install -g pm2
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   cd ..
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

4. **Start services:**
   ```bash
   # Start backend and frontend with PM2
   pm2 start ecosystem.config.js
   
   # Or start individually
   pm2 start backend/server.js --name hrms-backend
   pm2 start frontend/server.js --name hrms-frontend
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

---

## Local Development

### Project Structure

```
DayFlow_Phoenix_S_Army/
├── backend/                 # Backend application
│   ├── server.js
│   └── package.json
├── frontend/               # Frontend application
│   ├── package.json
│   └── nginx.conf
├── infrastructure/         # Infrastructure as Code
│   └── terraform/
├── scripts/               # Deployment & utility scripts
│   ├── deploy.sh
│   ├── deploy-aws.sh
│   ├── rollback.sh
│   ├── server-hardening.sh
│   └── setup-ssl.sh
├── monitoring/            # Monitoring configuration
│   ├── prometheus/
│   ├── grafana/
│   ├── loki/
│   └── alertmanager/
├── nginx/                 # Nginx reverse proxy config
├── docs/                  # Documentation
├── .github/
│   └── workflows/        # CI/CD pipelines
├── ecosystem.config.js    # PM2 configuration
├── .env.example
└── README.md
```

### PM2 Commands

```bash
# Start all services
pm2 start ecosystem.config.js

# View logs
pm2 logs
pm2 logs hrms-backend
pm2 logs hrms-frontend

# Stop services
pm2 stop all
pm2 stop hrms-backend

# Restart services
pm2 restart all
pm2 restart hrms-backend --update-env

# View process status
pm2 list
pm2 status

# Run tests
cd backend && npm test

# Connect to database
psql -U hrms_user -d hrms_db

# Monitor processes
pm2 monit

# Clean up
pm2 delete all
pm2 flush  # Clear all logs
```

### Environment Variables

See [.env.example](.env.example) for all available configuration options.

**Key variables:**
- `NODE_ENV` - Environment (development/staging/production)
- `DB_*` - Database configuration
- `JWT_SECRET` - Authentication secret
- `EMAIL_*` - Email service configuration

---

## CI/CD Pipeline

### GitHub Actions Workflows

#### Main CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Triggered by:** Push to `main`, `develop`, `staging` branches

**Pipeline stages:**

1. **Lint** - Code quality checks
   - ESLint for JavaScript/TypeScript
   - Runs in parallel for frontend & backend

2. **Security Scan** - Vulnerability detection
   - Trivy filesystem scan
   - npm audit for dependencies
   - SARIF results uploaded to GitHub Security

3. **Test** - Automated testing
   - Unit tests with coverage
   - Integration tests with PostgreSQL
   - Coverage reports to Codecov

4. **Build** - Application build
   - Frontend production build
   - Backend dependency installation
   - Build artifacts prepared for deployment

5. **Deploy Staging** - Auto-deploy to staging
   - Triggered on `develop`/`staging` branches
   - SSH deployment to staging server
   - Smoke tests after deployment

6. **Deploy Production** - Production deployment
   - Triggered on `main` branch
   - Requires manual approval
   - Database backup before deployment
   - Health checks with automatic rollback

#### Additional Workflows

- **Backup** (`.github/workflows/backup.yml`)
  - Daily at 2 AM UTC
  - Database backups to S3
  - 30-day retention

- **Security Audit** (`.github/workflows/security-audit.yml`)
  - Weekly on Mondays
  - Comprehensive security scanning
  - OWASP dependency check

- **Performance Testing** (`.github/workflows/performance.yml`)
  - Weekly on Sundays
  - k6 load testing
  - Lighthouse CI for frontend

### Required GitHub Secrets

Configure these in: **Settings → Secrets and variables → Actions**

#### Infrastructure
- `STAGING_HOST` - Staging server IP/domain
- `STAGING_USERNAME` - SSH username
- `STAGING_SSH_KEY` - Private SSH key
- `PRODUCTION_HOST` - Production server IP/domain
- `PRODUCTION_USERNAME` - SSH username
- `PRODUCTION_SSH_KEY` - Private SSH key

#### Application
- `JWT_SECRET_PRODUCTION`
- `SESSION_SECRET_PRODUCTION`
- `PRODUCTION_DB_PASSWORD`
- `STAGING_DB_PASSWORD`

#### Third-party Services
- `SENDGRID_API_KEY`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `SENTRY_DSN`
- `SLACK_WEBHOOK`

### Manual Deployment

```bash
# Deploy to production
./scripts/deploy.sh

# Deploy with specific SSH key
SSH_KEY=~/.ssh/custom-key.pem ./scripts/deploy.sh
```

---

## Deployment

### Option 1: AWS Deployment (Recommended)

#### Using Terraform (Infrastructure as Code)

1. **Initialize Terraform:**
   ```bash
   cd infrastructure/terraform
   terraform init
   ```

2. **Configure variables:**
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   # Edit terraform.tfvars with your settings
   ```

3. **Plan deployment:**
   ```bash
   terraform plan
   ```

4. **Apply infrastructure:**
   ```bash
   terraform apply
   ```

5. **Get outputs:**
   ```bash
   terraform output instance_public_ip
   terraform output db_endpoint
   ```

#### Using Deployment Script

```bash
# Make script executable
chmod +x scripts/deploy-aws.sh

# Configure AWS CLI
aws configure

# Run deployment
./scripts/deploy-aws.sh
```

**This creates:**
- VPC with public/private subnets
- EC2 instance with Node.js and PM2
- RDS PostgreSQL database
- S3 bucket for file uploads
- Security groups and IAM roles
- Elastic IP for static address

### Option 2: Manual Server Setup

1. **Prepare server:**
   ```bash
   # Run hardening script
   sudo ./scripts/server-hardening.sh
   
   # Setup SSL certificates
   sudo ./scripts/setup-ssl.sh
   ```

2. **Deploy application:**
   ```bash
   ./scripts/deploy.sh
   ```

### Option 3: Cloud Platform Deployment

#### Vercel (Frontend)
```bash
cd frontend
vercel deploy --prod
```

#### Render (Full-stack)
- Connect GitHub repository
- Configure environment variables
- Deploy from dashboard

#### Heroku
```bash
heroku create dayflow-hrms
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### Environment-Specific Configuration

#### Development
```bash
NODE_ENV=development pm2 start ecosystem.config.js
```

#### Staging
```bash
NODE_ENV=staging pm2 start ecosystem.config.js
```

#### Production
```bash
NODE_ENV=production pm2 start ecosystem.config.js
```

---

## Monitoring & Logging

### Start Monitoring Stack

**Note:** The monitoring stack (Prometheus, Grafana, Loki, AlertManager) requires separate installation and configuration. These services need to be installed and run as system services or using their respective installation methods.

```bash
# Example: Start Prometheus (if installed as a service)
sudo systemctl start prometheus
sudo systemctl start grafana-server

# Or run Prometheus directly
prometheus --config.file=/etc/prometheus/prometheus.yml

# Or run Grafana directly
grafana-server --config=/etc/grafana/grafana.ini
```

### Access Dashboards

- **Grafana**: http://localhost:3001
  - Username: `admin` (default)
  - Password: `admin` (change on first login)
  
- **Prometheus**: http://localhost:9090
- **AlertManager**: http://localhost:9093
- **Loki**: http://localhost:3100

### Pre-configured Dashboards

1. **HRMS Application Overview**
   - Request rate and latency
   - Error rates
   - Active users

2. **System Resources**
   - CPU, memory, disk usage
   - Network traffic
   - Process metrics

3. **Database Performance**
   - Query performance
   - Connection pools
   - Slow queries

### Alerts Configuration

Alerts are defined in [monitoring/prometheus/alerts.yml](monitoring/prometheus/alerts.yml)

**Critical alerts:**
- Application down
- Database unavailable
- Disk space critical
- High error rate

**Warning alerts:**
- High CPU/memory usage
- Slow response times
- SSL certificate expiring

### Log Aggregation

Logs are collected by Promtail and stored in Loki.

**View logs in Grafana:**
1. Add Loki as data source
2. Use LogQL queries:
   ```
   {job="hrms-backend"} |= "error"
   {app="hrms-frontend"} | json
   ```

### Application Monitoring

#### Backend Metrics Endpoint

Add to your Node.js backend:

```javascript
const promClient = require('prom-client');
const register = new promClient.Registry();

// Default metrics
promClient.collectDefaultMetrics({ register });

// Custom metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDuration);

// Expose metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
```

---

## Security

### Security Best Practices

✅ **Implemented:**
- HTTPS with SSL/TLS certificates
- Password hashing (bcrypt)
- JWT authentication
- Role-based access control (RBAC)
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection
- Security headers
- Process isolation
- Secrets management
- Firewall configuration
- Fail2ban for intrusion prevention
- Regular security updates

### Security Scanning

**Automated scans run weekly via GitHub Actions**

**Dependency scanning:**
```bash
cd backend && npm audit
cd frontend && npm audit

# Fix vulnerabilities
npm audit fix
```

**File system scanning:**
```bash
# Install trivy if needed
trivy fs ./backend
trivy fs ./frontend
```

### Secrets Management

**Never commit secrets to Git!**

See [docs/SECRETS_MANAGEMENT.md](docs/SECRETS_MANAGEMENT.md) for detailed guide.

**Quick reference:**
1. Use `.env` files (ignored by Git)
2. Store production secrets in AWS Secrets Manager / Vault
3. Use GitHub Secrets for CI/CD
4. Rotate secrets regularly
5. Audit secret access

### SSL/TLS Configuration

**Obtain Let's Encrypt certificate:**
```bash
sudo ./scripts/setup-ssl.sh
```

**Manual renewal:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

**Auto-renewal** is configured via cron job.

### Server Hardening

Run the hardening script on production servers:

```bash
sudo ./scripts/server-hardening.sh
```

**This configures:**
- UFW firewall
- fail2ban
- SSH hardening
- Automatic security updates
- Audit logging
- Kernel parameters
- Service restrictions

---

## Troubleshooting

### Common Issues

#### 1. Process won't start

```bash
# Check logs
pm2 logs hrms-backend --lines 100

# Check process status
pm2 list

# Common fixes
pm2 restart hrms-backend

# Delete and restart process
pm2 delete hrms-backend
pm2 start ecosystem.config.js

# Check for errors
pm2 describe hrms-backend
```

#### 2. Database connection issues

```bash
# Check database is running
sudo systemctl status postgresql
# Or for non-systemd systems
pg_isready -h localhost -p 5432

# Test connection
psql -U hrms_user -d hrms_db -h localhost

# Check environment variables
pm2 env hrms-backend
cat .env | grep DB_
```

#### 3. Port already in use

```bash
# Find process using port
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change port in .env
PORT=5001
```

#### 4. Out of disk space

```bash
# Check disk usage
df -h

# Clean PM2 logs
pm2 flush

# Remove old application logs
sudo find /var/log -name "*.log" -mtime +30 -delete

# Clean npm cache
npm cache clean --force

# Remove node_modules if needed (then reinstall)
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
```

#### 5. SSL certificate issues

```bash
# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/dayflow.crt -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew --force-renewal
```

### Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000/health

# Database health
pg_isready -h localhost -p 5432

# All PM2 processes
pm2 list
pm2 status
```

### Log Locations

- **PM2 logs**: `~/.pm2/logs/`
- **Application logs**: `/var/log/hrms/`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `/var/log/syslog`

### Debugging Commands

```bash
# View real-time logs
pm2 logs hrms-backend --lines 100
pm2 logs --raw hrms-backend

# Inspect process
pm2 describe hrms-backend
pm2 show hrms-backend

# Check resource usage
pm2 monit

# View process information
pm2 info hrms-backend

# Enable detailed logs
pm2 restart hrms-backend --log-date-format="YYYY-MM-DD HH:mm:ss"
```

---

## Maintenance

### Regular Tasks

#### Daily
- [ ] Monitor application logs
- [ ] Check alert notifications
- [ ] Review failed login attempts

#### Weekly
- [ ] Review security scan reports
- [ ] Check disk space usage
- [ ] Verify backups are successful
- [ ] Update dependencies (minor versions)

#### Monthly
- [ ] Apply security patches
- [ ] Rotate access credentials
- [ ] Review and update documentation
- [ ] Test backup restoration
- [ ] Performance optimization review

#### Quarterly
- [ ] Major dependency updates
- [ ] Security audit
- [ ] Disaster recovery drill
- [ ] Review and update monitoring rules

### Backup & Restore

#### Automated Backups

Backups run daily at 2 AM UTC via GitHub Actions.

**Manual backup:**
```bash
# Database
pg_dump -U hrms_user -h localhost hrms_db > backup_$(date +%Y%m%d).sql

# Application data
tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/hrms

# PM2 process configuration
pm2 save
cp ~/.pm2/dump.pm2 pm2_backup_$(date +%Y%m%d).json

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://hrms-backups/
```

#### Restore from Backup

```bash
# Stop application
pm2 stop all

# Restore database
psql -U hrms_user -h localhost hrms_db < backup_20260103.sql

# Restore application
tar -xzf app_backup_20260103.tar.gz -C /opt

# Restore PM2 processes (if saved)
pm2 resurrect
# Or restart from config
pm2 start ecosystem.config.js
```

### Rollback Procedure

```bash
# Automatic rollback on deployment failure
# (configured in CI/CD pipeline)

# Manual rollback
ssh user@server
cd /opt/hrms
./scripts/rollback.sh
```

### Scaling

#### Horizontal Scaling (Multiple Instances)

```bash
# Use PM2 cluster mode for automatic load balancing
pm2 start backend/server.js -i 3 --name hrms-backend
pm2 start frontend/server.js -i 2 --name hrms-frontend

# Or use max CPU cores
pm2 start backend/server.js -i max --name hrms-backend

# Scale existing process
pm2 scale hrms-backend 4
```

**In ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'hrms-backend',
    script: './backend/server.js',
    instances: 3,
    exec_mode: 'cluster',
    max_memory_restart: '1G'
  }]
}
```

#### Vertical Scaling (Resource Limits)

```bash
# Set memory limit for process
pm2 start backend/server.js --max-memory-restart 2G

# Monitor and auto-restart on memory threshold
pm2 restart hrms-backend --max-memory-restart 1G
```

### Database Maintenance

```bash
# Connect to database
psql -U hrms_user -h localhost -d hrms_db

# Vacuum database (run inside psql)
VACUUM ANALYZE;

# Check database size
SELECT pg_size_pretty(pg_database_size('hrms_db'));

# List table sizes
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;

# From command line (without entering psql)
psql -U hrms_user -h localhost -d hrms_db -c "VACUUM ANALYZE;"
```

### SSL Certificate Renewal

**Automatic:** Certificates auto-renew via cron job.

**Manual:**
```bash
sudo certbot renew
sudo systemctl reload nginx
```

### Updating Dependencies

```bash
# Check for updates
cd backend && npm outdated
cd frontend && npm outdated

# Update (be careful with major versions)
npm update

# Update specific package
npm install package-name@latest

# Test after updates
npm test
```

---

## Support & Resources

### Documentation
- [Security Policy](SECURITY.md)
- [Secrets Management](docs/SECRETS_MANAGEMENT.md)
- [API Documentation](docs/API.md) *(to be created)*

### Monitoring & Alerts
- Grafana: http://monitoring.dayflow.com
- Slack: #hrms-alerts
- Email: devops@dayflow.com

### Emergency Contacts
- **DevOps Team**: devops@dayflow.com
- **Security Team**: security@dayflow.com
- **On-call**: +1-XXX-XXX-XXXX

### Useful Links
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

**Last Updated**: January 3, 2026  
**Maintained by**: DevOps Team  
**Next Review**: April 3, 2026
