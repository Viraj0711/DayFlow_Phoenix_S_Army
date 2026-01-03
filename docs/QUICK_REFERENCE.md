# Quick Reference - DevOps Commands

## Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service_name]

# Restart a service
docker-compose restart [service_name]

# Rebuild and start
docker-compose up -d --build

# Remove volumes
docker-compose down -v
```

### Container Management
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Execute command in container
docker-compose exec backend npm test

# Shell access
docker-compose exec backend /bin/bash

# View resource usage
docker stats

# Remove unused resources
docker system prune -a --volumes
```

### Image Management
```bash
# List images
docker images

# Remove image
docker rmi image_name:tag

# Build image
docker build -t image_name:tag .

# Pull image
docker pull image_name:tag

# Push image
docker push image_name:tag
```

## Database Commands

### PostgreSQL
```bash
# Connect to database
docker-compose exec database psql -U hrms_user -d hrms_db

# Backup database
docker-compose exec database pg_dump -U hrms_user hrms_db > backup.sql

# Restore database
cat backup.sql | docker-compose exec -T database psql -U hrms_user hrms_db

# Check database size
psql -c "SELECT pg_size_pretty(pg_database_size('hrms_db'));"

# Vacuum database
psql -c "VACUUM ANALYZE;"
```

## Deployment Commands

### Application Deployment
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# Rollback
ssh user@server 'cd /opt/hrms && ./scripts/rollback.sh'
```

### AWS Deployment
```bash
# Deploy infrastructure
cd infrastructure/terraform
terraform init
terraform plan
terraform apply

# Destroy infrastructure
terraform destroy
```

## Monitoring Commands

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Follow new logs
tail -f /var/log/hrms/app.log
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

### Metrics
```bash
# Prometheus metrics
curl http://localhost:9090/metrics

# Application metrics
curl http://localhost:5000/metrics

# Container stats
docker stats --no-stream
```

## Security Commands

### SSL/TLS
```bash
# Setup SSL
sudo ./scripts/setup-ssl.sh

# Renew certificate
sudo certbot renew

# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/dayflow.crt -text -noout | grep "Not After"
```

### Server Hardening
```bash
# Run hardening script
sudo ./scripts/server-hardening.sh

# Check firewall status
sudo ufw status

# Check fail2ban
sudo fail2ban-client status

# Security audit
sudo lynis audit system
```

### Secrets
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate password
openssl rand -base64 32

# Encrypt file
gpg -c secrets.txt
```

## Git Commands

### Branch Management
```bash
# Create feature branch
git checkout -b feature/new-feature

# Push branch
git push -u origin feature/new-feature

# Merge to develop
git checkout develop
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Tag & Release
```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# List tags
git tag -l
```

## System Commands

### Resource Monitoring
```bash
# Disk usage
df -h

# Memory usage
free -h

# CPU usage
top

# Process tree
ps aux --forest

# Network connections
netstat -tulpn
```

### Service Management
```bash
# Check service status
systemctl status nginx

# Restart service
sudo systemctl restart nginx

# Enable on boot
sudo systemctl enable nginx

# View logs
sudo journalctl -u nginx -f
```

## Backup & Restore

### Database Backup
```bash
# Create backup
docker-compose exec -T database pg_dump -U hrms_user hrms_db > backup_$(date +%Y%m%d).sql

# Compress backup
gzip backup_$(date +%Y%m%d).sql

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://hrms-backups/
```

### Application Backup
```bash
# Backup application directory
tar -czf app_backup_$(date +%Y%m%d).tar.gz /opt/hrms

# Exclude unnecessary files
tar --exclude='node_modules' --exclude='logs' -czf app_backup.tar.gz /opt/hrms
```

### Restore
```bash
# Restore database
gunzip < backup_20260103.sql.gz | docker-compose exec -T database psql -U hrms_user hrms_db

# Restore application
tar -xzf app_backup_20260103.tar.gz -C /opt
```

## Troubleshooting

### Debug Container
```bash
# Check container logs
docker logs hrms-backend

# Inspect container
docker inspect hrms-backend

# Check container processes
docker top hrms-backend

# Copy files from container
docker cp hrms-backend:/app/logs ./local-logs
```

### Network Issues
```bash
# List networks
docker network ls

# Inspect network
docker network inspect hrms-network

# Test connectivity
docker-compose exec backend ping database

# Check DNS
docker-compose exec backend nslookup database
```

### Performance
```bash
# Check container resource limits
docker stats

# Analyze Docker disk usage
docker system df

# Check PostgreSQL queries
docker-compose exec database psql -U hrms_user -d hrms_db -c "SELECT * FROM pg_stat_activity;"
```

## CI/CD

### GitHub Actions
```bash
# Trigger workflow manually
gh workflow run ci-cd.yml

# View workflow runs
gh run list

# View run logs
gh run view <run-id>

# Cancel run
gh run cancel <run-id>
```

### Manual Deployment
```bash
# Build and push Docker images
docker build -t ghcr.io/viraj0711/dayflow-backend:latest backend/
docker push ghcr.io/viraj0711/dayflow-backend:latest

# Deploy via SSH
ssh user@server 'cd /opt/hrms && docker-compose pull && docker-compose up -d'
```

## Environment Management

### Switch Environments
```bash
# Development
docker-compose up -d

# Staging
docker-compose -f docker-compose.yml up -d

# Production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment Variables
```bash
# View environment variables
docker-compose exec backend env

# Set environment variable
export DB_PASSWORD=newpassword

# Load from file
export $(cat .env | xargs)
```

## Useful Aliases

Add to `.bashrc` or `.zshrc`:

```bash
# Docker Compose shortcuts
alias dcup='docker-compose up -d'
alias dcdown='docker-compose down'
alias dclogs='docker-compose logs -f'
alias dcps='docker-compose ps'
alias dcrestart='docker-compose restart'

# Docker shortcuts
alias dps='docker ps'
alias dpsa='docker ps -a'
alias dimg='docker images'
alias dprune='docker system prune -a --volumes'

# Application shortcuts
alias hrms-logs='docker-compose logs -f backend frontend'
alias hrms-restart='docker-compose restart backend frontend'
alias hrms-shell='docker-compose exec backend /bin/bash'

# Deployment shortcuts
alias deploy-staging='./scripts/deploy.sh staging'
alias deploy-prod='./scripts/deploy.sh production'
```

---

**Quick Help**: Run `docker-compose --help` or `docker --help` for more options
