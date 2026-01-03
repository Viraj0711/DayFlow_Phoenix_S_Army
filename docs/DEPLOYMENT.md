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

- Docker & Docker Compose
- Git
- Node.js 18+ (for local development)
- AWS CLI (for cloud deployment)
- Terraform (for infrastructure as code)

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Viraj0711/DayFlow_Phoenix_S_Army.git
   cd DayFlow_Phoenix_S_Army
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your local configuration
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432

---

## Local Development

### Project Structure

```
DayFlow_Phoenix_S_Army/
├── backend/                 # Backend application
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/               # Frontend application
│   ├── Dockerfile
│   ├── nginx.conf
│   └── .dockerignore
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
├── docker-compose.yml     # Development compose
├── docker-compose.prod.yml
├── docker-compose.monitoring.yml
├── .env.example
└── README.md
```

### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Execute commands in containers
docker-compose exec backend npm test
docker-compose exec database psql -U hrms_user hrms_db

# Clean up
docker-compose down -v  # Removes volumes too
docker system prune -a  # Remove all unused containers/images
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

4. **Build** - Docker image creation
   - Multi-stage Docker builds
   - Images pushed to GitHub Container Registry
   - Vulnerability scanning of images

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
- EC2 instance with Docker
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
docker-compose up -d
```

#### Staging
```bash
docker-compose -f docker-compose.yml up -d
```

#### Production
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

---

## Monitoring & Logging

### Start Monitoring Stack

```bash
docker-compose -f docker-compose.monitoring.yml up -d
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
   - Container metrics

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
   {container="hrms-frontend"} | json
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
- Docker security (non-root users)
- Secrets management
- Firewall configuration
- Fail2ban for intrusion prevention
- Regular security updates

### Security Scanning

**Automated scans run weekly:**
```bash
# Manual security scan
cd monitoring
docker-compose exec prometheus /bin/prometheus
```

**Container vulnerability scanning:**
```bash
trivy image dayflow-hrms-backend:latest
trivy image dayflow-hrms-frontend:latest
```

**Dependency scanning:**
```bash
cd backend && npm audit
cd frontend && npm audit
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

#### 1. Container won't start

```bash
# Check logs
docker-compose logs backend

# Common fixes
docker-compose down
docker-compose up -d --build

# Remove volumes and restart
docker-compose down -v
docker-compose up -d
```

#### 2. Database connection issues

```bash
# Check database is running
docker-compose ps

# Test connection
docker-compose exec database psql -U hrms_user -d hrms_db

# Check environment variables
docker-compose exec backend env | grep DB_
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

# Clean Docker
docker system prune -a --volumes

# Remove old logs
sudo find /var/log -name "*.log" -mtime +30 -delete
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
docker-compose exec database pg_isready

# All services
docker-compose ps
```

### Log Locations

- **Application logs**: `/var/log/hrms/`
- **Nginx logs**: `/var/log/nginx/`
- **Docker logs**: `/var/lib/docker/containers/`
- **System logs**: `/var/log/syslog`

### Debugging Commands

```bash
# Interactive shell in container
docker-compose exec backend /bin/bash

# View real-time logs
docker-compose logs -f --tail=100 backend

# Inspect container
docker inspect hrms-backend

# Check resource usage
docker stats
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
docker-compose exec database pg_dump -U hrms_user hrms_db > backup_$(date +%Y%m%d).sql

# Application data
tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/hrms

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql s3://hrms-backups/
```

#### Restore from Backup

```bash
# Stop application
docker-compose down

# Restore database
docker-compose up -d database
cat backup_20260103.sql | docker-compose exec -T database psql -U hrms_user hrms_db

# Restore application
tar -xzf app_backup_20260103.tar.gz -C /opt

# Start application
docker-compose up -d
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

```yaml
# docker-compose.prod.yml
services:
  backend:
    deploy:
      replicas: 3
  frontend:
    deploy:
      replicas: 2
```

#### Vertical Scaling (Resource Limits)

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G
```

### Database Maintenance

```bash
# Connect to database
docker-compose exec database psql -U hrms_user hrms_db

# Vacuum database
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
- [Docker Documentation](https://docs.docker.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

---

**Last Updated**: January 3, 2026  
**Maintained by**: DevOps Team  
**Next Review**: April 3, 2026
