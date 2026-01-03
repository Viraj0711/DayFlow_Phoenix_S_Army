#!/bin/bash

#######################################################
# Application Deployment Script
# Deploys HRMS to server via SSH
#######################################################

set -e

# Configuration (update these)
SERVER_USER="ubuntu"
SERVER_HOST="your-server-ip-or-domain"
SSH_KEY="~/.ssh/hrms-prod-key.pem"
APP_DIR="/opt/hrms"
BACKUP_DIR="/opt/hrms-backups"

echo "==================================="
echo "HRMS Deployment Script"
echo "Target: $SERVER_HOST"
echo "==================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check SSH connection
log_info "Testing SSH connection..."
if ! ssh -i $SSH_KEY -o ConnectTimeout=5 $SERVER_USER@$SERVER_HOST "echo 'Connection successful'" > /dev/null 2>&1; then
    log_error "Cannot connect to server"
    exit 1
fi
log_info "SSH connection successful"

# Create backup
log_info "Creating backup..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST << 'EOF'
    if [ -d /opt/hrms ]; then
        BACKUP_FILE="/opt/hrms-backups/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
        mkdir -p /opt/hrms-backups
        tar -czf $BACKUP_FILE -C /opt hrms
        echo "Backup created: $BACKUP_FILE"
        
        # Keep only last 5 backups
        cd /opt/hrms-backups
        ls -t backup-*.tar.gz | tail -n +6 | xargs -r rm
    fi
EOF

# Upload files
log_info "Uploading application files..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude '.env' \
    --exclude 'uploads' \
    --exclude 'logs' \
    ./ $SERVER_USER@$SERVER_HOST:$APP_DIR/

# Upload environment file
log_warn "Ensure .env.production is configured with secrets"
if [ -f ".env.production" ]; then
    log_info "Uploading .env.production..."
    scp -i $SSH_KEY .env.production $SERVER_USER@$SERVER_HOST:$APP_DIR/.env
else
    log_error ".env.production not found"
    exit 1
fi

# Deploy on server
log_info "Deploying application..."
ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST << 'EOF'
    cd /opt/hrms
    
    # Install backend dependencies
    echo "Installing backend dependencies..."
    cd backend
    npm install --production
    
    # Install frontend dependencies and build
    echo "Building frontend..."
    cd ../frontend
    npm install --production
    npm run build
    
    # Stop existing processes
    echo "Stopping existing services..."
    pm2 stop hrms-backend hrms-frontend || true
    
    # Run database migrations
    echo "Running database migrations..."
    cd ../backend
    npm run migrate || true
    
    # Start services with PM2
    echo "Starting backend service..."
    cd ../backend
    pm2 start npm --name "hrms-backend" -- start
    
    echo "Starting frontend service..."
    cd ../frontend
    pm2 start npm --name "hrms-frontend" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Wait for services to start
    echo "Waiting for services to start..."
    sleep 10
    
    # Check health
    echo "Checking application health..."
    if curl -f http://localhost:5000/health > /dev/null 2>&1; then
        echo "✓ Backend is healthy"
    else
        echo "✗ Backend health check failed"
        exit 1
    fi
    
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✓ Frontend is healthy"
    else
        echo "✗ Frontend health check failed"
        exit 1
    fi
    
    echo "Deployment complete!"
EOF

# Verify deployment
log_info "Verifying deployment..."
if ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST "pm2 list | grep -q hrms-backend"; then
    log_info "✓ Backend service is running"
else
    log_error "✗ Backend service not running"
    exit 1
fi

if ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST "pm2 list | grep -q hrms-frontend"; then
    log_info "✓ Frontend service is running"
else
    log_error "✗ Frontend service not running"
    exit 1
fi

echo ""
echo "==================================="
echo -e "${GREEN}Deployment Successful!${NC}"
echo "==================================="
echo ""
echo "Application URL: https://$SERVER_HOST"
echo ""
echo "Useful commands:"
echo "  View logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 logs hrms-backend'"
echo "  Restart: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 restart all'"
echo "  Status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'pm2 status'"
echo "  Rollback: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd /opt/hrms-backups && ./rollback.sh'"
echo ""
