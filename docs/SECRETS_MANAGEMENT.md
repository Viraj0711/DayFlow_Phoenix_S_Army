# Secrets Management Guide

This document outlines best practices for managing secrets and sensitive configuration in the DayFlow HRMS application.

## Table of Contents
1. [Secrets Overview](#secrets-overview)
2. [Local Development](#local-development)
3. [Staging & Production](#staging--production)
4. [GitHub Secrets](#github-secrets)
5. [Secrets Rotation](#secrets-rotation)
6. [Security Checklist](#security-checklist)

## Secrets Overview

### What are Secrets?
Secrets are sensitive credentials that should NEVER be committed to version control:
- Database passwords
- API keys
- JWT secrets
- OAuth credentials
- Third-party service credentials
- SSL certificates and private keys

## Local Development

### Setup Environment File
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your local development credentials
3. NEVER commit `.env` to git (it's in .gitignore)

### Development Secrets
Use simple, non-production values for local development:
- Database: `hrms_dev` / `changeme_dev_password`
- JWT Secret: Any random string (for dev only)
- Email: Use mock email service or mailtrap.io

## Staging & Production

### Cloud Secrets Management

#### AWS Secrets Manager (Recommended)
```bash
# Store a secret
aws secretsmanager create-secret \
  --name hrms/production/db-password \
  --secret-string "your-secure-password"

# Retrieve a secret
aws secretsmanager get-secret-value \
  --secret-id hrms/production/db-password
```

#### HashiCorp Vault
```bash
# Write a secret
vault kv put secret/hrms/production db_password="secure-password"

# Read a secret
vault kv get secret/hrms/production
```

#### Google Cloud Secret Manager
```bash
# Create a secret
gcloud secrets create db-password --data-file=-

# Access a secret
gcloud secrets versions access latest --secret="db-password"
```

### Environment Variables in Docker

#### Using Docker Secrets (Docker Swarm)
```yaml
version: '3.8'
services:
  backend:
    image: hrms-backend
    secrets:
      - db_password
      - jwt_secret
    environment:
      DB_PASSWORD_FILE: /run/secrets/db_password
      JWT_SECRET_FILE: /run/secrets/jwt_secret

secrets:
  db_password:
    external: true
  jwt_secret:
    external: true
```

#### Using .env files with restricted permissions
```bash
# Set proper permissions
chmod 600 .env.production

# Load environment
docker-compose --env-file .env.production up -d
```

## GitHub Secrets

### Required GitHub Secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

#### Infrastructure Secrets
- `STAGING_HOST` - Staging server hostname/IP
- `STAGING_USERNAME` - SSH username for staging
- `STAGING_SSH_KEY` - Private SSH key for staging
- `PRODUCTION_HOST` - Production server hostname/IP
- `PRODUCTION_USERNAME` - SSH username for production
- `PRODUCTION_SSH_KEY` - Private SSH key for production

#### Database Secrets
- `STAGING_DB_PASSWORD` - Staging database password
- `PRODUCTION_DB_PASSWORD` - Production database password

#### Application Secrets
- `JWT_SECRET_PRODUCTION` - Production JWT secret
- `SESSION_SECRET_PRODUCTION` - Production session secret

#### Third-Party Services
- `SENDGRID_API_KEY` - Email service API key
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `SENTRY_DSN` - Error tracking DSN
- `SLACK_WEBHOOK` - Slack notifications webhook

#### Cloud Provider Credentials
- `AWS_ACCOUNT_ID` - AWS account ID
- `GCP_PROJECT_ID` - Google Cloud project ID
- `AZURE_CREDENTIALS` - Azure service principal

### Adding Secrets to GitHub
```bash
# Using GitHub CLI
gh secret set PRODUCTION_DB_PASSWORD

# Or use the web interface:
# Settings → Secrets and variables → Actions → New repository secret
```

## Secrets Rotation

### Rotation Schedule
- **Database passwords**: Every 90 days
- **API keys**: Every 180 days
- **JWT secrets**: Every 365 days
- **SSH keys**: Every 365 days
- **SSL certificates**: Before expiration

### Rotation Process

#### 1. Generate New Secret
```bash
# Generate strong password
openssl rand -base64 32

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 2. Update in Secrets Manager
```bash
# AWS
aws secretsmanager update-secret \
  --secret-id hrms/production/jwt-secret \
  --secret-string "new-secret-value"

# Update GitHub secret
gh secret set JWT_SECRET_PRODUCTION
```

#### 3. Update Application
```bash
# Rolling update without downtime
kubectl set env deployment/backend JWT_SECRET=new-value

# Or for Docker
docker-compose up -d --force-recreate backend
```

#### 4. Verify
```bash
# Test the application
curl -f https://api.dayflow.com/health
```

#### 5. Revoke Old Secret
Document and securely delete old secrets after successful rotation.

## Security Checklist

### Development
- [ ] `.env` is in `.gitignore`
- [ ] No secrets in code comments
- [ ] No secrets in console.log statements
- [ ] Mock credentials for local testing

### Pre-Deployment
- [ ] All secrets use strong, unique values
- [ ] Secrets are not hardcoded in application
- [ ] Environment files have restricted permissions (600)
- [ ] Secrets are validated before deployment

### Production
- [ ] Secrets stored in dedicated secrets manager
- [ ] Least privilege access to secrets
- [ ] Audit logging enabled for secret access
- [ ] Automated secrets rotation in place
- [ ] Backup encryption keys stored separately
- [ ] SSL/TLS certificates properly configured
- [ ] Database connections encrypted
- [ ] API keys have rate limiting

### Monitoring
- [ ] Failed authentication attempts logged
- [ ] Secret access audited
- [ ] Anomaly detection configured
- [ ] Alert on suspicious activities

## Emergency Procedures

### Compromised Secret
1. **Immediately revoke** the compromised secret
2. **Generate new** secret following security guidelines
3. **Update** all systems using the secret
4. **Investigate** how the compromise occurred
5. **Document** incident and lessons learned

### Lost Access
1. Use **break-glass procedure** with backup admin account
2. Generate new credentials
3. Update documentation
4. Review access control policies

## Tools & Resources

### Secret Generation
```bash
# Strong password (32 chars)
openssl rand -base64 32

# UUID
uuidgen

# Hex string (64 bytes)
openssl rand -hex 64

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Secret Validation
```bash
# Check password strength
echo "password" | pwscore

# Verify SSL certificate
openssl x509 -in certificate.crt -text -noout
```

### Useful Links
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io/)
- [1Password Secrets Automation](https://1password.com/products/secrets/)

## Best Practices Summary

1. **Never commit secrets** to version control
2. **Use dedicated secrets managers** for production
3. **Rotate secrets regularly** following a schedule
4. **Apply least privilege** access control
5. **Encrypt secrets** at rest and in transit
6. **Audit secret access** and monitor for anomalies
7. **Have backup procedures** for secret recovery
8. **Document everything** related to secrets management
9. **Use strong, unique secrets** for each environment
10. **Test secret rotation** in staging before production

---

**Last Updated**: January 2026  
**Next Review**: April 2026
