# DayFlow HRMS 🚀

**Every workday, perfectly aligned.**

[![CI/CD](https://github.com/Viraj0711/DayFlow_Phoenix_S_Army/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Viraj0711/DayFlow_Phoenix_S_Army/actions/workflows/ci-cd.yml)
[![Security](https://github.com/Viraj0711/DayFlow_Phoenix_S_Army/actions/workflows/security-audit.yml/badge.svg)](https://github.com/Viraj0711/DayFlow_Phoenix_S_Army/actions/workflows/security-audit.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

DayFlow is a production-ready, web-based **Human Resource Management System (HRMS)** designed to digitize and streamline essential HR operations such as employee management, attendance tracking, leave workflows, and payroll visibility. The system focuses on simplicity for employees and control for HR administrators through secure, role-based access.

**✨ Key Highlights:**
- � **Production Ready** - PM2 process management and optimized deployment
- 🔄 **CI/CD Pipeline** - Automated testing, building, and deployment
- 📊 **Complete Monitoring** - Prometheus, Grafana, Loki integration
- 🔒 **Security First** - Hardened servers, SSL/TLS, secrets management
- ☁️ **Cloud Ready** - AWS, GCP, Azure deployment scripts
- 📖 **Comprehensive Docs** - Deployment, monitoring, troubleshooting guides

---

## Problem Statement

Many organizations still rely on manual or semi-digital HR processes. Attendance is tracked inconsistently, leave approvals are delayed, employee data is scattered, and payroll transparency is limited.

These inefficiencies lead to:
- Administrative overhead
- Human errors
- Poor employee experience
- Lack of real-time insights for HR teams

---

## Solution Overview

Dayflow provides a **centralized HR platform** that automates and organizes core HR functions. It ensures smooth interaction between employees and HR through structured workflows, real-time updates, and secure access control.

The application separates concerns clearly:
- Employees manage their own data and requests
- HR/Admin users supervise, approve, and control organizational records

---

## Core Features

### Authentication & Authorization
- Secure Sign Up and Sign In
- Email verification
- Role-based access control:
  - Employee
  - Admin / HR Officer

### Employee Profile Management
- View personal and job-related details
- Salary structure visibility
- Document and profile picture upload
- Employees can edit limited fields
- Admin/HR can edit all employee data

### Attendance Management
- Daily and weekly attendance views
- Check-in / Check-out system
- Attendance statuses:
  - Present
  - Absent
  - Half-day
  - Leave
- Employees can view only their own records
- Admin/HR can view all employee attendance

### Leave & Time-Off Management
- Apply for leave with:
  - Leave type (Paid, Sick, Unpaid)
  - Date range
  - Remarks
- Leave request status:
  - Pending
  - Approved
  - Rejected
- Admin/HR approval with comments
- Automatic reflection in attendance records

### Payroll Management
- Read-only payroll access for employees
- Admin/HR can:
  - View payroll details
  - Update salary structures
  - Maintain payroll accuracy

### Analytics & Reports
- Attendance reports
- Salary slips
- Administrative dashboards
- Email and notification alerts

---

## User Roles

| Role | Responsibilities |
|-----|------------------|
| Employee | View profile, attendance, payroll, apply for leave |
| Admin / HR Officer | Manage employees, approve leave & attendance, control payroll |

---

## System Architecture (High Level)

- **Frontend:** Role-based dashboards, responsive UI
- **Backend:** RESTful APIs, authentication, business logic
- **Database:** Employee records, attendance, leave, payroll
- **Security:** Password hashing, protected routes, access control

---

## Technology Stack (Proposed)

- **Frontend:** React / Next.js / Vue
- **Backend:** Node.js (Express) / Django / Spring Boot
- **Database:** PostgreSQL / MySQL / MongoDB
- **Authentication:** JWT / OAuth
- **Deployment:** PM2, Vercel, AWS, Render

*(Stack may vary based on team preference.)*

---

## Application Workflow

1. User registers and verifies email
2. User logs in and is redirected based on role
3. Employee marks attendance and applies for leave
4. Admin/HR reviews and approves or rejects requests
5. Payroll and reports are managed securely

---

## Use Cases

- Small and medium-sized organizations
- Startups managing growing teams
- Educational institutions
- Academic projects and hackathons
- Internal HR automation tools

---

## Future Enhancements

- Location-based or biometric attendance
- Automated payroll calculation
- Performance evaluation module
- Mobile application support
- AI-powered HR analytics
- Advanced reporting dashboards

---

## Contributing

Contributions are welcome.  
Please follow clean code practices and submit well-documented pull requests.

---

## 🚀 Quick Start

### Local Development

```bash
# Clone the repository
git clone https://github.com/Viraj0711/DayFlow_Phoenix_S_Army.git
cd DayFlow_Phoenix_S_Army

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend
cd backend && npm run dev

# Start frontend (in a new terminal)
cd frontend && npm run dev

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Monitoring: http://localhost:3001 (Grafana)
```

### Production Deployment

```bash
# Option 1: AWS Deployment (Terraform)
cd infrastructure/terraform
terraform init
terraform plan
terraform apply

# Option 2: Manual Deployment with PM2
./scripts/deploy.sh

# Option 3: CI/CD (GitHub Actions)
# Push to main branch - automatic deployment
git push origin main
```

---

## 📚 Documentation

### Core Documentation
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Complete deployment instructions
- **[CI/CD Setup](docs/CICD_SETUP.md)** - GitHub Actions configuration
- **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common commands and troubleshooting
- **[Secrets Management](docs/SECRETS_MANAGEMENT.md)** - Security and secrets best practices
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting

### DevOps Features

#### � Production Deployment
- PM2 process management for Node.js applications
- Optimized production builds
- Health checks and automatic restarts

#### 🔄 CI/CD Pipeline
- **Automated Testing** - Unit, integration, and E2E tests
- **Security Scanning** - Trivy, npm audit, OWASP dependency check
- **Automated Builds** - Production builds and deployment
- **Deployment** - Zero-downtime rolling deployments
- **Rollback** - Automatic rollback on failure

#### 📊 Monitoring & Logging
- **Prometheus** - Metrics collection and alerting
- **Grafana** - Beautiful dashboards and visualization
- **Loki** - Centralized log aggregation
- **AlertManager** - Alert routing and management
- **Pre-configured dashboards** for application and system metrics

#### 🔒 Security
- **SSL/TLS encryption** with automatic certificate renewal
- **Server hardening** scripts included
- **Secrets management** with AWS Secrets Manager / Vault
- **Rate limiting** and DDoS protection
- **Security headers** and CORS configuration
- **Regular security audits** automated via GitHub Actions

#### ☁️ Cloud Deployment
- **Terraform IaC** for AWS infrastructure
- **Deployment scripts** for AWS, GCP, Azure
- **Auto-scaling** configurations
- **Backup & restore** automation
- **Multi-environment** support (dev, staging, production)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                     │
│                    (Nginx)                          │
└────────────────┬────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ┌────▼─────┐     ┌────▼─────┐
   │ Frontend │     │ Backend  │
   │ (React)  │     │ (Node.js)│
   └──────────┘     └────┬─────┘
                         │
                    ┌────▼─────┐
                    │PostgreSQL│
                    │ Database │
                    └──────────┘
```

### Technology Stack

- **Frontend:** React / Next.js (configurable)
- **Backend:** Node.js with Express
- **Database:** PostgreSQL 15
- **Cache:** Redis
- **Reverse Proxy:** Nginx
- **Process Manager:** PM2
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana, Loki
- **Cloud:** AWS / GCP / Azure
- **IaC:** Terraform

---

## 📁 Project Structure

```
DayFlow_Phoenix_S_Army/
├── backend/                    # Backend application
└   └── .gitignore
├── frontend/                   # Frontend application
│   ├── nginx.conf
│   └── .gitignore
├── infrastructure/             # Infrastructure as Code
│   └── terraform/             # Terraform configurations
├── scripts/                    # Deployment & utility scripts
│   ├── deploy.sh              # Main deployment script
│   ├── deploy-aws.sh          # AWS automated deployment
│   ├── rollback.sh            # Rollback script
│   ├── server-hardening.sh    # Security hardening
│   └── setup-ssl.sh           # SSL certificate setup
├── monitoring/                 # Monitoring configuration
│   ├── prometheus/            # Prometheus config & alerts
│   ├── grafana/              # Grafana dashboards
│   ├── loki/                 # Loki log aggregation
│   └── alertmanager/         # Alert configuration
├── nginx/                      # Nginx reverse proxy config
├── docs/                       # Documentation
│   ├── DEPLOYMENT.md
│   ├── CICD_SETUP.md
│   ├── QUICK_REFERENCE.md
│   └── SECRETS_MANAGEMENT.md
├── .github/
│   └── workflows/             # CI/CD pipelines
│       ├── ci-cd.yml          # Main pipeline
│       ├── backup.yml         # Database backups
│       ├── security-audit.yml # Security scanning
│       └── performance.yml    # Performance testing
├── .env.example               # Environment template
├── .env.staging               # Staging template
├── .env.production            # Production template
├── SECURITY.md                # Security policy
└── README.md                  # This file
```

---

## 🛠️ Available Scripts

### Development
```bash
# Start development environment
cd backend && npm run dev
cd frontend && npm run dev

# Run tests
cd backend && npm test
cd frontend && npm test

# Build for production
cd backend && npm run build
cd frontend && npm run build
```

### Deployment
```bash
# Deploy to production
./scripts/deploy.sh

# Deploy to AWS
./scripts/deploy-aws.sh

# Rollback deployment
./scripts/rollback.sh

# Server hardening
sudo ./scripts/server-hardening.sh

# Setup SSL certificates
sudo ./scripts/setup-ssl.sh
```

### Monitoring
```bash
# Start monitoring stack (requires separate setup)
# See monitoring/ directory for configuration

# Access Grafana
open http://localhost:3001

# View Prometheus metrics
open http://localhost:9090
```

---

## 🔐 Environment Configuration

### Required Environment Variables

```bash
# Application
NODE_ENV=production
PORT=5000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrms_db
DB_USER=hrms_user
DB_PASSWORD=your_secure_password

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# Email Service
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key

# Cloud Storage (Optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_BUCKET=hrms-uploads
```

See [.env.example](.env.example) for complete list.

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suite
npm test -- auth.test.js

# E2E tests
npm run test:e2e
```

---

## 📊 Monitoring & Observability

### Metrics
- Request rates and latencies
- Error rates and types
- CPU, memory, disk usage
- Database query performance
- Cache hit rates

### Logs
- Centralized log aggregation with Loki
- Structured logging with correlation IDs
- Log retention and archival

### Alerts
- Application down
- High error rate
- Resource exhaustion
- Security incidents
- SSL certificate expiry

---

## 🔒 Security Features

- ✅ HTTPS with TLS 1.2/1.3
- ✅ JWT authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Password hashing with bcrypt
- ✅ Rate limiting on API endpoints
- ✅ SQL injection prevention
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Security headers (HSTS, CSP, etc.)
- ✅ Secrets encryption
- ✅ Regular security audits
- ✅ Dependency vulnerability scanning

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- All tests pass
- Code follows style guidelines
- Documentation is updated
- Security best practices are followed

---

## 📝 License

This project is licensed under the **MIT License**.  
Free to use, modify, and distribute.

See [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/Viraj0711/DayFlow_Phoenix_S_Army/issues)
- **Security:** security@dayflow.com
- **General:** support@dayflow.com

---

## 🙏 Acknowledgments

- Built with best practices from the DevOps community
- Inspired by modern HRMS platforms
- Thanks to all contributors and open-source projects

---

**Built with ❤️ by Phoenix S Army**

**Last Updated:** January 3, 2026
