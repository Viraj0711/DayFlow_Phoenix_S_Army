# GitHub Actions CI/CD Setup Guide

This guide explains how to configure GitHub Actions for the DayFlow HRMS project.

## Prerequisites

- GitHub repository with admin access
- Server infrastructure (AWS, DigitalOcean, or other cloud provider)
- SSH access to staging and production servers
- Domain name with SSL certificates

## Step-by-Step Setup

### 1. Fork/Clone Repository

```bash
git clone https://github.com/Viraj0711/DayFlow_Phoenix_S_Army.git
cd DayFlow_Phoenix_S_Army
```

### 2. Configure GitHub Secrets

Navigate to: **Your Repository → Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `STAGING_HOST` | Staging server IP or domain | `staging.dayflow.com` |
| `STAGING_USERNAME` | SSH username for staging | `ubuntu` |
| `STAGING_SSH_KEY` | Private SSH key for staging | Contents of `~/.ssh/id_rsa` |
| `PRODUCTION_HOST` | Production server IP or domain | `dayflow.com` |
| `PRODUCTION_USERNAME` | SSH username for production | `ubuntu` |
| `PRODUCTION_SSH_KEY` | Private SSH key for production | Contents of `~/.ssh/prod_key` |
| `STAGING_DB_PASSWORD` | Staging database password | Strong random password |
| `PRODUCTION_DB_PASSWORD` | Production database password | Strong random password |
| `JWT_SECRET_PRODUCTION` | Production JWT secret | 64-char hex string |
| `SESSION_SECRET_PRODUCTION` | Production session secret | 64-char random string |
| `SENDGRID_API_KEY` | SendGrid API key for emails | `SG.xxx` |
| `AWS_ACCESS_KEY_ID` | AWS access key for S3 storage | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |
| `SLACK_WEBHOOK` | Slack webhook for notifications | `https://hooks.slack.com/services/xxx` |
| `NODE_ENV` | Environment mode | `production` |

#### Generating Secrets

```bash
# Generate JWT secret (64-byte hex)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate session secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 32
```

### 3. Setup SSH Keys

#### Generate SSH Key Pair

```bash
# Generate new SSH key for deployment
ssh-keygen -t ed25519 -C "deployment@dayflow.com" -f ~/.ssh/hrms_deploy

# Copy public key to servers
ssh-copy-id -i ~/.ssh/hrms_deploy.pub user@staging-server
ssh-copy-id -i ~/.ssh/hrms_deploy.pub user@production-server

# Copy private key content to GitHub Secrets
cat ~/.ssh/hrms_deploy
```

#### Add Public Key to Servers

```bash
# On each server
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4. Configure Branch Protection

**Settings → Branches → Add rule**

For `main` branch:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
  - Select: `lint`, `test`, `build`
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

For `develop` branch:
- ✅ Require status checks to pass before merging

### 5. Configure Environments

**Settings → Environments**

#### Create Staging Environment
- Name: `staging`
- Protection rules: None (auto-deploy)
- Environment secrets: (if different from repository secrets)

#### Create Production Environment
- Name: `production`
- Protection rules:
  - ✅ Required reviewers: Select team members
  - ✅ Wait timer: 5 minutes
- Environment secrets: Production-specific secrets
- Deployment branches: `main` only

### 6. Enable GitHub Actions

**Actions → Enable workflows**

Workflows should automatically run on:
- Push to `main`, `develop`, `staging`
- Pull requests to these branches
- Scheduled times (backups, security scans)

### 7. Test the Pipeline

#### Test Development Workflow

```bash
# Create feature branch
git checkout -b feature/test-cicd

# Make a change
echo "# Test" >> test.md

# Commit and push
git add test.md
git commit -m "test: CI/CD pipeline"
git push origin feature/test-cicd

# Create pull request
# GitHub Actions should run lint, test, security-scan, build
```

#### Test Staging Deployment

```bash
# Merge to develop branch
git checkout develop
git merge feature/test-cicd
git push origin develop

# Check Actions tab for deployment progress
```

#### Test Production Deployment

```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# Requires approval in GitHub Actions
```

## Workflow Overview

### CI/CD Pipeline Flow

```
┌─────────────────────────────────────────────────┐
│ Push/PR to main/develop/staging                 │
└─────────────────┬───────────────────────────────┘
                  │
      ┌───────────┴───────────┐
      │                       │
┌─────▼─────┐         ┌──────▼──────┐
│   Lint    │         │  Security   │
│  Backend  │         │    Scan     │
│  Frontend │         │  (npm audit)│
└─────┬─────┘         └──────┬──────┘
      │                      │
      └──────────┬───────────┘
                 │
           ┌─────▼─────┐
           │   Tests   │
           │  Backend  │
           │  Frontend │
           └─────┬─────┘
                 │
           ┌─────▼─────┐
           │   Build   │
           │  npm run  │
           │   build   │
           └─────┬─────┘
                 │
        ┌────────┴────────┐
        │                 │
  ┌─────▼─────┐    ┌─────▼──────┐
  │  Deploy   │    │   Deploy   │
  │  Staging  │    │ Production │
  │  (auto)   │    │ (approval) │
  └───────────┘    └────────────┘
```

### Automated Workflows

#### Daily
- **Database Backup** (2 AM UTC)
  - Dump database
  - Upload to S3
  - Retain 30 days

#### Weekly
- **Security Audit** (Monday 9 AM UTC)
  - npm audit
  - OWASP dependency check
  - Snyk vulnerability scan
  - Report to Slack

- **Performance Testing** (Sunday midnight)
  - k6 load tests
  - Lighthouse CI
  - Report degradation

## Monitoring Deployments

### GitHub Actions UI

1. Go to **Actions** tab
2. Select workflow run
3. View logs for each job
4. Check deployment status

### Slack Notifications

Configure Slack webhook in secrets to receive:
- ✅ Successful deployments
- ❌ Failed deployments
- ⚠️ Security vulnerabilities
- 📊 Performance degradation

### Email Notifications

Configure in AlertManager for:
- Critical alerts
- Deployment failures
- Security issues

## Troubleshooting

### Common Issues

#### 1. SSH Connection Failed

**Error**: `Permission denied (publickey)`

**Solution**:
```bash
# Verify SSH key format
cat ~/.ssh/hrms_deploy | head -1
# Should be: -----BEGIN OPENSSH PRIVATE KEY-----

# Test SSH connection
ssh -i ~/.ssh/hrms_deploy user@server

# Add to GitHub Secrets (include entire key with headers)
```

#### 2. Build Failed

**Error**: `npm run build failed`

**Solution**:
- Check Node.js version matches requirement (18.x or 20.x)
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for syntax errors in code

#### 3. Database Migration Failed

**Error**: `Connection refused to database`

**Solution**:
```bash
# Check database is running
sudo systemctl status postgresql
# or for MySQL
sudo systemctl status mysql

# Check environment variables
echo $DB_HOST $DB_PORT $DB_NAME

# Test connection
cd /opt/hrms/backend
npm run db:test
```

#### 4. Deployment Timeout

**Error**: `Job timeout after 60 minutes`

**Solution**:
- Increase timeout in workflow:
  ```yaml
  jobs:
    deploy:
      timeout-minutes: 90
  ```
- Optimize npm install with `--prefer-offline`
- Use npm ci for faster installs
- Check server resources (CPU, RAM, disk space)

### Viewing Logs

```bash
# SSH to server
ssh -i ~/.ssh/hrms_deploy user@server

# View application logs with PM2
pm2 logs hrms-backend --lines 100
pm2 logs hrms-frontend --lines 100

# View all PM2 processes
pm2 status

# View system logs
sudo journalctl -u nginx -f
```

## Best Practices

### 1. Branch Strategy

```
main (production)
  ↑
develop (staging)
  ↑
feature/* (development)
```

### 2. Commit Messages

Follow conventional commits:
```
feat: add user authentication
fix: resolve database connection issue
docs: update deployment guide
chore: update dependencies
```

### 3. Pull Requests

- Clear description
- Link to issue
- Screenshots for UI changes
- All checks must pass
- Requires review

### 4. Environment Parity

Keep staging and production as similar as possible:
- Same OS version (Ubuntu 22.04 LTS recommended)
- Same Node.js version (18.x or 20.x LTS)
- Same npm version
- Same dependencies (lock package-lock.json)
- Similar data (anonymized)

### 5. Security

- Never commit secrets
- Rotate credentials regularly
- Use least privilege access
- Enable 2FA on GitHub
- Audit access logs

## Advanced Configuration

### Custom Runners

Use self-hosted runners for:
- Private networks
- Specific hardware requirements
- Cost optimization

```yaml
# .github/workflows/ci-cd.yml
jobs:
  build:
    runs-on: self-hosted
```

### Matrix Builds

Test multiple versions:

```yaml
strategy:
  matrix:
    node-version: [16, 18, 20]
    os: [ubuntu-latest, windows-latest]
```

### Caching

Speed up workflows:

```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### Artifacts

Store build outputs:

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: build-output
    path: dist/
    retention-days: 30
```

## Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [SSH Best Practices](https://www.ssh.com/academy/ssh/keygen)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

---

**Last Updated**: January 3, 2026  
**Author**: DevOps Team
