# 🚀 AWS Deployment Guide with Terraform

This guide will walk you through deploying your Krishi application to AWS using Terraform.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Understanding the Infrastructure](#understanding-the-infrastructure)
3. [Setup AWS Account](#setup-aws-account)
4. [Install Required Tools](#install-required-tools)
5. [Configure AWS Credentials](#configure-aws-credentials)
6. [Prepare Your Application](#prepare-your-application)
7. [Deploy with Terraform](#deploy-with-terraform)
8. [Build and Push Docker Images](#build-and-push-docker-images)
9. [Access Your Application](#access-your-application)
10. [Troubleshooting](#troubleshooting)
11. [Clean Up Resources](#clean-up-resources)

---

## Prerequisites

Before you begin, you'll need:
- An AWS account (create one at https://aws.amazon.com)
- A credit card (AWS requires this, but we'll use free tier when possible)
- Basic command line knowledge
- About 30-45 minutes of your time

## Understanding the Infrastructure

Here's what Terraform will create for you:

### 🏗️ Infrastructure Components

1. **VPC (Virtual Private Cloud)**: Your own private network in AWS
2. **Subnets**: Divided into public (for load balancer) and private (for your apps)
3. **Load Balancer**: Distributes traffic and gives you a public URL
4. **ECS Cluster**: Runs your Docker containers
5. **DocumentDB**: Managed MongoDB-compatible database
6. **ECR**: Stores your Docker images
7. **Security Groups**: Firewall rules to protect your application

### 💰 Cost Estimate
- Development environment: ~$50-80/month
- Production environment: ~$150-300/month

**Note**: DocumentDB is the most expensive component. For testing, you can use a smaller instance.

---

## Setup AWS Account

### Step 1: Create AWS Account
1. Go to https://aws.amazon.com
2. Click "Create an AWS Account"
3. Follow the registration process
4. Verify your email and phone number
5. Add payment information

### Step 2: Create IAM User for Terraform

**Why?** It's safer to use an IAM user instead of root account credentials.

1. Log into AWS Console (https://console.aws.amazon.com)
2. Search for "IAM" in the search bar
3. Click "Users" in the left sidebar
4. Click "Create user"
5. Enter username: `terraform-user`
6. Click "Next"
7. Select "Attach policies directly"
8. Search and select these policies:
   - `AmazonEC2FullAccess`
   - `AmazonECS_FullAccess`
   - `AmazonVPCFullAccess`
   - `AmazonRDSFullAccess`
   - `AmazonDocDBFullAccess`
   - `AmazonEC2ContainerRegistryFullAccess`
   - `IAMFullAccess`
   - `ElasticLoadBalancingFullAccess`
9. Click "Next" then "Create user"

### Step 3: Create Access Keys

1. Click on the user you just created (`terraform-user`)
2. Go to "Security credentials" tab
3. Scroll down to "Access keys"
4. Click "Create access key"
5. Select "Command Line Interface (CLI)"
6. Check the confirmation box
7. Click "Next" then "Create access key"
8. **IMPORTANT**: Save both:
   - Access key ID (looks like: `AKIAIOSFODNN7EXAMPLE`)
   - Secret access key (looks like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`)
9. Download the CSV file and store it securely

---

## Install Required Tools

### For Windows:

#### 1. Install AWS CLI
```bash
# Download and run the installer
msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi
```

Or download from: https://aws.amazon.com/cli/

#### 2. Install Terraform
```bash
# Using Chocolatey (if you have it)
choco install terraform

# Or download manually from:
# https://www.terraform.io/downloads
# Extract to a folder and add to PATH
```

#### 3. Install Docker Desktop
Download from: https://www.docker.com/products/docker-desktop

### Verify Installations

Open a new terminal/PowerShell and run:
```bash
aws --version
# Should show: aws-cli/2.x.x...

terraform --version
# Should show: Terraform v1.x.x

docker --version
# Should show: Docker version 20.x.x
```

---

## Configure AWS Credentials

### Option 1: Using AWS CLI (Recommended)

Open terminal/PowerShell and run:
```bash
aws configure
```

You'll be prompted to enter:
- **AWS Access Key ID**: (paste your access key from earlier)
- **AWS Secret Access Key**: (paste your secret key)
- **Default region name**: `us-east-1` (or your preferred region)
- **Default output format**: `json`

### Option 2: Manual Configuration

1. Create folder: `C:\Users\YourUsername\.aws\`
2. Create file `credentials` (no extension) with content:
```
[default]
aws_access_key_id = YOUR_ACCESS_KEY_HERE
aws_secret_access_key = YOUR_SECRET_KEY_HERE
```

3. Create file `config` (no extension) with content:
```
[default]
region = us-east-1
output = json
```

### Verify Configuration
```bash
aws sts get-caller-identity
```
Should show your account details.

---

## Prepare Your Application

### Step 1: Configure Terraform Variables

1. Navigate to the terraform folder:
```bash
cd "c:\Users\Asus\Desktop\IaC Provisioning for Real Estate System\terraform"
```

2. Copy the example variables file:

**For Windows CMD/PowerShell:**
```bash
copy terraform.tfvars.example terraform.tfvars
```

**For Git Bash/Linux/Mac:**
```bash
cp terraform.tfvars.example terraform.tfvars
```

3. Edit `terraform.tfvars` with your values:

**For Windows:**
```bash
notepad terraform.tfvars
```

**For Git Bash/Linux/Mac:**
```bash
nano terraform.tfvars
# or
vim terraform.tfvars
```

**IMPORTANT**: Change the `db_password` to a strong password!

Example:
```hcl
aws_region = "us-east-1"
project_name = "krishi-app"
environment = "dev"
db_username = "admin"
db_password = "MySecurePassword123!"  # CHANGE THIS!
```

### Step 2: Update Backend Environment Variables

Create a `.env` file in the backend folder if it doesn't exist:
```bash
cd ..\backend
notepad .env
```

Add these variables (we'll update MONGO_URI after deployment):
```env
PORT=5000
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key-change-this
RAZORPAY_KEY_ID=your-razorpay-key
RAZORPAY_KEY_SECRET=your-razorpay-secret
```

---

## Deploy with Terraform

### Step 1: Initialize Terraform

Navigate to terraform folder and initialize:
```bash
cd ..\terraform
terraform init
```

This downloads the AWS provider and prepares Terraform.

### Step 2: Review the Plan

See what Terraform will create:
```bash
terraform plan
```

This shows all resources that will be created. Review it to make sure everything looks correct.

### Step 3: Apply (Create Infrastructure)

```bash
terraform apply
```

- Type `yes` when prompted
- **This will take 10-15 minutes** ☕
- Terraform will create all the AWS resources

**What's happening?**
- Creating VPC and networks
- Setting up load balancer
- Creating database cluster
- Configuring security groups
- Setting up ECS cluster

### Step 4: Save the Outputs

After completion, Terraform will show outputs. **Save these values**:
```
alb_url = "http://krishi-app-dev-alb-1234567890.us-east-1.elb.amazonaws.com"
backend_api_url = "http://krishi-app-dev-alb-1234567890.us-east-1.elb.amazonaws.com/api"
ecr_backend_repository_url = "123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-backend"
ecr_frontend_repository_url = "123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-frontend"
ecs_cluster_name = "krishi-app-dev-cluster"
```

You can always view outputs again with:
```bash
terraform output
```

---

## Build and Push Docker Images

Now we need to build your application and push the Docker images to AWS.

### Step 1: Login to ECR

Get your AWS account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

Login to ECR (replace ACCOUNT_ID and REGION):
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

Example:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
```

### Step 2: Build Backend Image

```bash
cd ..
cd backend

# Get the ECR URL from terraform output
# Example: 123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-backend
docker build -t krishi-backend .
docker tag krishi-backend:latest YOUR_ECR_BACKEND_URL:latest
docker push YOUR_ECR_BACKEND_URL:latest
```

**Full example:**
```bash
docker build -t krishi-backend .
docker tag krishi-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-backend:latest
```

### Step 3: Build Frontend Image

First, update the frontend API URL:

Edit `frontend/.env` or create it:
```bash
cd ..\frontend
notepad .env
```

Add (use your ALB URL):
```env
VITE_API_URL=http://YOUR_ALB_URL/api
```

Then build and push:
```bash
docker build -t krishi-frontend .
docker tag krishi-frontend:latest YOUR_ECR_FRONTEND_URL:latest
docker push YOUR_ECR_FRONTEND_URL:latest
```

**Full example:**
```bash
docker build -t krishi-frontend .
docker tag krishi-frontend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-frontend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/krishi-app-dev-frontend:latest
```

### Step 4: Update ECS Services

After pushing new images, update the ECS services:

```bash
# Update backend service
aws ecs update-service --cluster krishi-app-dev-cluster --service krishi-app-dev-backend-service --force-new-deployment --region us-east-1

# Update frontend service
aws ecs update-service --cluster krishi-app-dev-cluster --service krishi-app-dev-frontend-service --force-new-deployment --region us-east-1
```

### Step 5: Wait for Deployment

Check the deployment status:
```bash
aws ecs describe-services --cluster krishi-app-dev-cluster --services krishi-app-dev-backend-service krishi-app-dev-frontend-service --region us-east-1
```

Or view in AWS Console:
1. Go to ECS service
2. Select your cluster
3. Check "Services" tab
4. Wait for status to show "ACTIVE" and running count matches desired count

This takes 5-10 minutes.

---

## Access Your Application

Once deployment is complete:

1. **Open your application**: Use the `alb_url` from Terraform outputs
   - Example: `http://krishi-app-dev-alb-1234567890.us-east-1.elb.amazonaws.com`

2. **Test the backend API**: Use the `backend_api_url`
   - Example: `http://krishi-app-dev-alb-1234567890.us-east-1.elb.amazonaws.com/api`

3. **View logs in CloudWatch**:
   - Go to AWS Console → CloudWatch → Log groups
   - Look for `/ecs/krishi-app-dev-backend` and `/ecs/krishi-app-dev-frontend`

---

## Troubleshooting

### Issue: Services not starting

**Check logs:**
```bash
# Get task ARN
aws ecs list-tasks --cluster krishi-app-dev-cluster --service-name krishi-app-dev-backend-service --region us-east-1

# View logs in CloudWatch (easier)
```

**Common causes:**
- Container health check failing
- Environment variables missing
- Database connection issues

### Issue: Can't access application

**Verify:**
1. ECS service is running:
```bash
aws ecs describe-services --cluster krishi-app-dev-cluster --services krishi-app-dev-backend-service --region us-east-1
```

2. Target group health:
- Go to EC2 → Target Groups
- Check if targets are healthy

3. Security group rules are correct

### Issue: Database connection failed

**Check:**
- DocumentDB cluster is active in AWS Console
- Security group allows connection from backend
- Connection string is correct in environment variables

### Issue: Docker build fails

**Solution:**
```bash
# Clear Docker cache
docker system prune -a

# Rebuild
docker build --no-cache -t krishi-backend .
```

### Getting Help

View resources in AWS Console:
1. **ECS**: https://console.aws.amazon.com/ecs
2. **EC2 Load Balancers**: https://console.aws.amazon.com/ec2/home#LoadBalancers
3. **DocumentDB**: https://console.aws.amazon.com/docdb
4. **CloudWatch Logs**: https://console.aws.amazon.com/cloudwatch/home#logsV2:log-groups

---

## Clean Up Resources

**IMPORTANT**: To avoid charges, destroy resources when done testing.

### Option 1: Destroy Everything
```bash
cd terraform
terraform destroy
```

Type `yes` when prompted. This removes all AWS resources.

### Option 2: Reduce Costs Without Destroying

Scale down services to 0:
```bash
aws ecs update-service --cluster krishi-app-dev-cluster --service krishi-app-dev-backend-service --desired-count 0 --region us-east-1
aws ecs update-service --cluster krishi-app-dev-cluster --service krishi-app-dev-frontend-service --desired-count 0 --region us-east-1
```

This stops containers but keeps infrastructure.

---

## 🎓 What You Learned

- ✅ Infrastructure as Code with Terraform
- ✅ AWS VPC, ECS, and networking
- ✅ Container orchestration
- ✅ Load balancing and auto-scaling
- ✅ Managed databases (DocumentDB)
- ✅ Docker image management with ECR

## 📚 Next Steps

1. **Add HTTPS**: Configure SSL certificate with AWS Certificate Manager
2. **Custom Domain**: Point your domain to the load balancer
3. **CI/CD**: Set up automated deployments with GitHub Actions
4. **Monitoring**: Configure CloudWatch alarms
5. **Backup**: Enable automated backups for DocumentDB

## 💡 Tips

- Always use `terraform plan` before `apply`
- Keep your `terraform.tfvars` file secure (add to .gitignore)
- Use AWS Cost Explorer to monitor spending
- Enable MFA on your AWS account
- Tag all resources for better organization

## 🆘 Need Help?

- AWS Documentation: https://docs.aws.amazon.com
- Terraform AWS Provider: https://registry.terraform.io/providers/hashicorp/aws
- AWS Support: https://console.aws.amazon.com/support

---

**Good luck with your deployment! 🚀**
