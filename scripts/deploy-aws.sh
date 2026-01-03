#!/bin/bash

#######################################################
# AWS Deployment Script
# DayFlow HRMS Production Deployment on EC2
#######################################################

set -e

# Configuration
APP_NAME="dayflow-hrms"
ENVIRONMENT="production"
AWS_REGION="us-east-1"
INSTANCE_TYPE="t3.medium"
KEY_NAME="hrms-prod-key"

echo "==================================="
echo "AWS Deployment Script"
echo "DayFlow HRMS"
echo "==================================="
echo ""

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "AWS CLI not found. Please install: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if logged in
aws sts get-caller-identity > /dev/null 2>&1 || {
    echo "Not logged into AWS. Run: aws configure"
    exit 1
}

echo "[1/10] Creating VPC..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$APP_NAME-vpc}]" \
    --query 'Vpc.VpcId' \
    --output text)
echo "VPC created: $VPC_ID"

# Enable DNS
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support

echo "[2/10] Creating Internet Gateway..."
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$APP_NAME-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
echo "Internet Gateway created: $IGW_ID"

echo "[3/10] Creating Subnets..."
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-public-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.10.0/24 \
    --availability-zone ${AWS_REGION}a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-1}]" \
    --query 'Subnet.SubnetId' \
    --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.11.0/24 \
    --availability-zone ${AWS_REGION}b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$APP_NAME-private-2}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo "Subnets created"

echo "[4/10] Creating Route Tables..."
PUBLIC_RT=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$APP_NAME-public-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 create-route --route-table-id $PUBLIC_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_1 --route-table-id $PUBLIC_RT
aws ec2 associate-route-table --subnet-id $PUBLIC_SUBNET_2 --route-table-id $PUBLIC_RT

echo "[5/10] Creating Security Groups..."
# Application Security Group
APP_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-app-sg" \
    --description "Security group for HRMS application" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 22 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 443 --cidr 0.0.0.0/0

# Database Security Group
DB_SG=$(aws ec2 create-security-group \
    --group-name "$APP_NAME-db-sg" \
    --description "Security group for HRMS database" \
    --vpc-id $VPC_ID \
    --query 'GroupId' \
    --output text)

aws ec2 authorize-security-group-ingress --group-id $DB_SG --protocol tcp --port 5432 --source-group $APP_SG

echo "[6/10] Creating RDS Instance..."
aws rds create-db-subnet-group \
    --db-subnet-group-name "$APP_NAME-db-subnet" \
    --db-subnet-group-description "Subnet group for HRMS database" \
    --subnet-ids $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2

DB_PASSWORD=$(openssl rand -base64 32)
aws rds create-db-instance \
    --db-instance-identifier "$APP_NAME-db" \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --engine-version 15.4 \
    --master-username hrms_admin \
    --master-user-password "$DB_PASSWORD" \
    --allocated-storage 20 \
    --vpc-security-group-ids $DB_SG \
    --db-subnet-group-name "$APP_NAME-db-subnet" \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "mon:04:00-mon:05:00" \
    --storage-encrypted \
    --no-publicly-accessible

echo "Database password: $DB_PASSWORD" > db-credentials.txt
echo "IMPORTANT: Save db-credentials.txt securely!"

echo "[7/10] Creating S3 Bucket for uploads..."
BUCKET_NAME="$APP_NAME-uploads-$(date +%s)"
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION
aws s3api put-bucket-encryption \
    --bucket $BUCKET_NAME \
    --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

echo "[8/10] Creating IAM Role for EC2..."
cat > trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "ec2.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}
EOF

ROLE_NAME="$APP_NAME-ec2-role"
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json

cat > s3-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::$BUCKET_NAME",
      "arn:aws:s3:::$BUCKET_NAME/*"
    ]
  }]
}
EOF

aws iam put-role-policy --role-name $ROLE_NAME --policy-name S3Access --policy-document file://s3-policy.json
aws iam create-instance-profile --instance-profile-name $ROLE_NAME
aws iam add-role-to-instance-profile --instance-profile-name $ROLE_NAME --role-name $ROLE_NAME

sleep 10  # Wait for IAM propagation

echo "[9/10] Launching EC2 Instance..."
# Get latest Ubuntu AMI
AMI_ID=$(aws ec2 describe-images \
    --owners 099720109477 \
    --filters "Name=name,Values=ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*" \
    --query 'Images|sort_by(@, &CreationDate)[-1].ImageId' \
    --output text)

# User data script
cat > user-data.sh <<'EOF'
#!/bin/bash
apt-get update
apt-get install -y nodejs npm git postgresql-client nginx

# Install PM2 for process management
npm install -g pm2

# Configure PM2 to start on boot
pm2 startup systemd -u ubuntu --hp /home/ubuntu
systemctl enable pm2-ubuntu

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
dpkg -i amazon-cloudwatch-agent.deb

echo "EC2 instance setup complete"
EOF

INSTANCE_ID=$(aws ec2 run-instances \
    --image-id $AMI_ID \
    --instance-type $INSTANCE_TYPE \
    --key-name $KEY_NAME \
    --security-group-ids $APP_SG \
    --subnet-id $PUBLIC_SUBNET_1 \
    --iam-instance-profile Name=$ROLE_NAME \
    --user-data file://user-data.sh \
    --tag-specifications "ResourceType=instance,Tags=[{Key=Name,Value=$APP_NAME-server}]" \
    --block-device-mappings 'DeviceName=/dev/sda1,Ebs={VolumeSize=30,VolumeType=gp3,Encrypted=true}' \
    --query 'Instances[0].InstanceId' \
    --output text)

echo "EC2 Instance launched: $INSTANCE_ID"

# Allocate Elastic IP
echo "[10/10] Allocating Elastic IP..."
ALLOCATION_ID=$(aws ec2 allocate-address --domain vpc --query 'AllocationId' --output text)
aws ec2 associate-address --instance-id $INSTANCE_ID --allocation-id $ALLOCATION_ID
PUBLIC_IP=$(aws ec2 describe-addresses --allocation-ids $ALLOCATION_ID --query 'Addresses[0].PublicIp' --output text)

echo ""
echo "==================================="
echo "AWS Deployment Complete!"
echo "==================================="
echo ""
echo "Resources Created:"
echo "  VPC ID: $VPC_ID"
echo "  Instance ID: $INSTANCE_ID"
echo "  Public IP: $PUBLIC_IP"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Database: Initializing (check console)"
echo ""
echo "Next Steps:"
echo "1. Wait 5-10 minutes for RDS to initialize"
echo "2. Get RDS endpoint:"
echo "   aws rds describe-db-instances --db-instance-identifier $APP_NAME-db --query 'DBInstances[0].Endpoint.Address'"
echo "3. SSH to server: ssh -i $KEY_NAME.pem ubuntu@$PUBLIC_IP"
echo "4. Deploy application using deployment script"
echo ""
echo "Credentials saved to: db-credentials.txt"
echo ""

# Save deployment info
cat > deployment-info.txt <<EOF
AWS Deployment Information
==========================
Date: $(date)
Environment: $ENVIRONMENT
Region: $AWS_REGION

VPC ID: $VPC_ID
Instance ID: $INSTANCE_ID
Public IP: $PUBLIC_IP
S3 Bucket: $BUCKET_NAME
IAM Role: $ROLE_NAME

Database Instance: $APP_NAME-db
Database Username: hrms_admin
Database Password: See db-credentials.txt

Security Groups:
  Application: $APP_SG
  Database: $DB_SG

Subnets:
  Public 1: $PUBLIC_SUBNET_1
  Public 2: $PUBLIC_SUBNET_2
  Private 1: $PRIVATE_SUBNET_1
  Private 2: $PRIVATE_SUBNET_2
EOF

echo "Deployment details saved to: deployment-info.txt"

# Cleanup
rm -f trust-policy.json s3-policy.json user-data.sh
