#!/bin/bash

#######################################################
# Rollback Script
# Rollback to previous deployment
#######################################################

set -e

BACKUP_DIR="/opt/hrms-backups"
APP_DIR="/opt/hrms"

echo "==================================="
echo "HRMS Rollback Script"
echo "==================================="
echo ""

# Check if backups exist
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR)" ]; then
    echo "Error: No backups found in $BACKUP_DIR"
    exit 1
fi

# List available backups
echo "Available backups:"
echo ""
ls -lth $BACKUP_DIR/backup-*.tar.gz | awk '{print NR". "$9" ("$6" "$7" "$8")"}'
echo ""

# Get user selection
read -p "Select backup number to restore (or 'q' to quit): " selection

if [ "$selection" = "q" ]; then
    echo "Rollback cancelled"
    exit 0
fi

# Get selected backup file
BACKUP_FILE=$(ls -t $BACKUP_DIR/backup-*.tar.gz | sed -n "${selection}p")

if [ -z "$BACKUP_FILE" ]; then
    echo "Error: Invalid selection"
    exit 1
fi

echo ""
echo "Selected backup: $BACKUP_FILE"
read -p "Are you sure you want to rollback? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Rollback cancelled"
    exit 0
fi

echo ""
echo "Starting rollback..."

# Stop current containers
echo "[1/5] Stopping current containers..."
cd $APP_DIR
docker-compose down

# Create backup of current state
echo "[2/5] Backing up current state..."
EMERGENCY_BACKUP="$BACKUP_DIR/emergency-backup-$(date +%Y%m%d-%H%M%S).tar.gz"
tar -czf $EMERGENCY_BACKUP -C /opt hrms
echo "Emergency backup created: $EMERGENCY_BACKUP"

# Remove current deployment
echo "[3/5] Removing current deployment..."
rm -rf $APP_DIR/*

# Restore from backup
echo "[4/5] Restoring from backup..."
tar -xzf $BACKUP_FILE -C /opt

# Start containers
echo "[5/5] Starting containers..."
cd $APP_DIR
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Wait for services
echo "Waiting for services to start..."
sleep 30

# Health check
echo "Performing health check..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Backend is healthy"
else
    echo "✗ Backend health check failed"
    echo "Rolling back to emergency backup..."
    rm -rf $APP_DIR/*
    tar -xzf $EMERGENCY_BACKUP -C /opt
    cd $APP_DIR
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
    exit 1
fi

if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ Frontend is healthy"
else
    echo "✗ Frontend health check failed"
fi

echo ""
echo "==================================="
echo "Rollback Complete!"
echo "==================================="
echo ""
echo "Rolled back to: $BACKUP_FILE"
echo "Emergency backup: $EMERGENCY_BACKUP"
echo ""
