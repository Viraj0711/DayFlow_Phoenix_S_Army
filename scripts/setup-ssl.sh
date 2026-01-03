#!/bin/bash

#######################################################
# SSL Certificate Setup Script
# Supports Let's Encrypt with Certbot
#######################################################

set -e

DOMAIN="dayflow.com"
EMAIL="admin@dayflow.com"
WEBROOT="/var/www/certbot"

echo "==================================="
echo "SSL Certificate Setup"
echo "Domain: $DOMAIN"
echo "==================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Install certbot
echo "[1/5] Installing Certbot..."
apt-get update
apt-get install -y certbot python3-certbot-nginx

# Create webroot directory
echo "[2/5] Creating webroot directory..."
mkdir -p $WEBROOT

# Stop nginx temporarily
echo "[3/5] Stopping Nginx..."
systemctl stop nginx 2>/dev/null || true

# Obtain certificate
echo "[4/5] Obtaining SSL certificate..."
certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    --preferred-challenges http

# Setup auto-renewal
echo "[5/5] Setting up auto-renewal..."
cat > /etc/cron.d/certbot-renewal <<EOF
# Renew certificates twice daily
0 0,12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF

# Create renewal hook
mkdir -p /etc/letsencrypt/renewal-hooks/post
cat > /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh

# Copy certificates to nginx directory
mkdir -p /etc/nginx/ssl
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem /etc/nginx/ssl/dayflow.crt
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem /etc/nginx/ssl/dayflow.key
cp /etc/letsencrypt/live/$DOMAIN/chain.pem /etc/nginx/ssl/ca-bundle.crt

# Set proper permissions
chmod 644 /etc/nginx/ssl/dayflow.crt
chmod 600 /etc/nginx/ssl/dayflow.key
chmod 644 /etc/nginx/ssl/ca-bundle.crt

# Start nginx
echo "Starting Nginx..."
systemctl start nginx

echo ""
echo "==================================="
echo "SSL Certificate Setup Complete!"
echo "==================================="
echo ""
echo "Certificate details:"
certbot certificates
echo ""
echo "Certificates will auto-renew every 60 days"
echo "Manual renewal: certbot renew"
echo ""
