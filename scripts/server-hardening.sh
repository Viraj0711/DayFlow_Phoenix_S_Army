#!/bin/bash

#######################################################
# Server Hardening Script for Ubuntu/Debian
# For DayFlow HRMS Production Deployment
#######################################################

set -e

echo "==================================="
echo "Server Hardening Script"
echo "DayFlow HRMS"
echo "==================================="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Update system
echo "[1/15] Updating system packages..."
apt-get update && apt-get upgrade -y

# Install essential security packages
echo "[2/15] Installing security packages..."
apt-get install -y \
    ufw \
    fail2ban \
    unattended-upgrades \
    apt-listchanges \
    needrestart \
    lynis

# Configure automatic security updates
echo "[3/15] Configuring automatic security updates..."
cat > /etc/apt/apt.conf.d/50unattended-upgrades <<EOF
Unattended-Upgrade::Allowed-Origins {
    "\${distro_id}:\${distro_codename}-security";
};
Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
EOF

# Enable automatic updates
cat > /etc/apt/apt.conf.d/20auto-upgrades <<EOF
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Configure firewall
echo "[4/15] Configuring UFW firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw --force enable

# Configure fail2ban
echo "[5/15] Configuring fail2ban..."
cat > /etc/fail2ban/jail.local <<EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
destemail = security@dayflow.com
sendername = Fail2Ban
action = %(action_mwl)s

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Harden SSH configuration
echo "[6/15] Hardening SSH configuration..."
cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
cat > /etc/ssh/sshd_config <<EOF
Port 22
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxSessions 10
EOF

systemctl restart sshd

# Configure kernel parameters
echo "[7/15] Hardening kernel parameters..."
cat >> /etc/sysctl.conf <<EOF

# IP Forwarding
net.ipv4.ip_forward = 0

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Ignore send redirects
net.ipv4.conf.all.send_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1

# Ignore ICMP ping requests
net.ipv4.icmp_echo_ignore_all = 0

# Ignore Broadcast pings
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Enable TCP SYN Cookie Protection
net.ipv4.tcp_syncookies = 1

# Enable IP spoofing protection
net.ipv4.conf.all.rp_filter = 1

# Disable IPv6 if not needed
net.ipv6.conf.all.disable_ipv6 = 0
EOF

sysctl -p

# Set file permissions
echo "[8/15] Setting secure file permissions..."
chmod 644 /etc/passwd
chmod 644 /etc/group
chmod 600 /etc/shadow
chmod 600 /etc/gshadow
chmod 644 /etc/ssh/sshd_config

# Configure user limits
echo "[9/15] Configuring user limits..."
cat >> /etc/security/limits.conf <<EOF
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

# Install and configure auditd
echo "[10/15] Installing auditd for system auditing..."
apt-get install -y auditd audispd-plugins

# Configure audit rules
cat > /etc/audit/rules.d/hrms.rules <<EOF
# Monitor administrative actions
-w /etc/passwd -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k actions

# Monitor system modifications
-w /etc/ssh/sshd_config -p wa -k sshd
-w /etc/nginx/ -p wa -k nginx

# Monitor application files
-w /opt/hrms/ -p wa -k hrms_app

# Monitor logs
-w /var/log/auth.log -p wa -k auth_logs
EOF

systemctl enable auditd
systemctl restart auditd

# Disable unnecessary services
echo "[11/15] Disabling unnecessary services..."
services_to_disable=(
    "avahi-daemon"
    "cups"
    "isc-dhcp-server"
    "isc-dhcp-server6"
    "nfs-common"
    "rpcbind"
)

for service in "${services_to_disable[@]}"; do
    if systemctl is-enabled "$service" 2>/dev/null; then
        systemctl stop "$service" 2>/dev/null || true
        systemctl disable "$service" 2>/dev/null || true
        echo "Disabled $service"
    fi
done

# Configure log rotation
echo "[12/15] Configuring log rotation..."
cat > /etc/logrotate.d/hrms <<EOF
/var/log/hrms/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
EOF

# Install and configure rkhunter
echo "[13/15] Installing rootkit detection..."
apt-get install -y rkhunter
rkhunter --update
rkhunter --propupd

# Configure daily security scans
cat > /etc/cron.daily/security-scan <<'EOF'
#!/bin/bash
# Daily security scan

REPORT_EMAIL="security@dayflow.com"
REPORT_FILE="/var/log/security-scan-$(date +%Y%m%d).log"

{
    echo "===== Security Scan Report ====="
    echo "Date: $(date)"
    echo ""
    
    echo "===== RKHunter Scan ====="
    rkhunter --check --skip-keypress --report-warnings-only
    
    echo ""
    echo "===== Lynis Audit ====="
    lynis audit system --quick
    
    echo ""
    echo "===== Failed Login Attempts ====="
    grep "Failed password" /var/log/auth.log | tail -20
    
    echo ""
    echo "===== Disk Usage ====="
    df -h
    
    echo ""
    echo "===== Memory Usage ====="
    free -h
    
} > "$REPORT_FILE"

# Email report if sendmail is configured
if command -v mail &> /dev/null; then
    cat "$REPORT_FILE" | mail -s "Daily Security Scan - $(hostname)" "$REPORT_EMAIL"
fi
EOF

chmod +x /etc/cron.daily/security-scan

# Set timezone
echo "[14/15] Setting timezone to UTC..."
timedatectl set-timezone UTC

# Create deployment user
echo "[15/15] Creating deployment user..."
if ! id -u hrms > /dev/null 2>&1; then
    useradd -m -s /bin/bash hrms
    usermod -aG docker hrms 2>/dev/null || true
    
    # Setup SSH directory
    mkdir -p /home/hrms/.ssh
    chmod 700 /home/hrms/.ssh
    touch /home/hrms/.ssh/authorized_keys
    chmod 600 /home/hrms/.ssh/authorized_keys
    chown -R hrms:hrms /home/hrms/.ssh
    
    echo "User 'hrms' created. Add SSH public key to /home/hrms/.ssh/authorized_keys"
fi

# Final security check
echo ""
echo "==================================="
echo "Server Hardening Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Add SSH public key for 'hrms' user"
echo "2. Review firewall rules: ufw status"
echo "3. Check fail2ban status: fail2ban-client status"
echo "4. Review security scan: lynis audit system"
echo "5. Reboot the server to apply all changes"
echo ""
echo "Important:"
echo "- SSH password authentication is DISABLED"
echo "- Root login via SSH is DISABLED"
echo "- Make sure you have SSH key access before disconnecting!"
echo ""
