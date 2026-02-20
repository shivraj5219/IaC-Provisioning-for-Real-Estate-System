# Quick Deployment Script for Windows
# Run this with PowerShell

Write-Host "🚀 Krishi App AWS Deployment Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check if AWS CLI is installed
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Host "❌ AWS CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Terraform is installed
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Terraform is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if Docker is installed
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All required tools are installed" -ForegroundColor Green
Write-Host ""

# Get script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Navigate to terraform directory
Set-Location "$ScriptDir\terraform"

# Check if terraform.tfvars exists
if (-not (Test-Path "terraform.tfvars")) {
    Write-Host "⚠️  terraform.tfvars not found. Creating from example..." -ForegroundColor Yellow
    Copy-Item "terraform.tfvars.example" "terraform.tfvars"
    Write-Host "⚠️  Please edit terraform.tfvars with your values, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found terraform.tfvars" -ForegroundColor Green
Write-Host ""

# Initialize Terraform
Write-Host "📦 Initializing Terraform..." -ForegroundColor Cyan
terraform init
Write-Host "✅ Terraform initialized" -ForegroundColor Green
Write-Host ""

# Validate configuration
Write-Host "🔍 Validating Terraform configuration..." -ForegroundColor Cyan
terraform validate
Write-Host "✅ Configuration is valid" -ForegroundColor Green
Write-Host ""

# Plan
Write-Host "📋 Creating deployment plan..." -ForegroundColor Cyan
terraform plan -out=tfplan
Write-Host ""

# Ask for confirmation
$confirm = Read-Host "Do you want to apply this plan? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "⚠️  Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

# Apply
Write-Host ""
Write-Host "🏗️  Creating infrastructure (this will take 10-15 minutes)..." -ForegroundColor Cyan
terraform apply tfplan
Write-Host "✅ Infrastructure created successfully!" -ForegroundColor Green
Write-Host ""

# Get outputs
Write-Host "📊 Infrastructure Outputs:" -ForegroundColor Cyan
Write-Host "========================="
terraform output
Write-Host ""

# Save outputs to file
terraform output -json | Out-File -FilePath "..\deployment-outputs.json" -Encoding utf8
Write-Host "✅ Outputs saved to deployment-outputs.json" -ForegroundColor Green
Write-Host ""

# Get values for Docker push
$ALB_URL = terraform output -raw alb_url
$BACKEND_ECR = terraform output -raw ecr_backend_repository_url
$FRONTEND_ECR = terraform output -raw ecr_frontend_repository_url
$CLUSTER_NAME = terraform output -raw ecs_cluster_name
$BACKEND_SERVICE = terraform output -raw backend_service_name
$FRONTEND_SERVICE = terraform output -raw frontend_service_name
$AWS_REGION = terraform output -raw aws_region

if (-not $AWS_REGION) {
    $AWS_REGION = "us-east-1"
}

Write-Host ""
Write-Host "⚠️  Next Steps:" -ForegroundColor Yellow
Write-Host "1. Build and push Docker images"
Write-Host "2. Update ECS services"
Write-Host ""

$build_confirm = Read-Host "Do you want to build and push Docker images now? (yes/no)"
if ($build_confirm -ne "yes") {
    Write-Host "⚠️  Please build and push images manually" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Backend ECR: $BACKEND_ECR"
    Write-Host "Frontend ECR: $FRONTEND_ECR"
    exit 0
}

# Get AWS account ID
$AWS_ACCOUNT_ID = aws sts get-caller-identity --query Account --output text

# Login to ECR
Write-Host ""
Write-Host "🔐 Logging into ECR..." -ForegroundColor Cyan
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"
Write-Host "✅ Logged into ECR" -ForegroundColor Green
Write-Host ""

# Build and push backend
Write-Host "🔨 Building backend image..." -ForegroundColor Cyan
Set-Location "$ScriptDir\backend"
docker build -t krishi-backend .
docker tag krishi-backend:latest "$BACKEND_ECR:latest"
Write-Host "✅ Backend image built" -ForegroundColor Green
Write-Host ""

Write-Host "⬆️  Pushing backend image to ECR..." -ForegroundColor Cyan
docker push "$BACKEND_ECR:latest"
Write-Host "✅ Backend image pushed" -ForegroundColor Green
Write-Host ""

# Build and push frontend
Write-Host "🔨 Building frontend image..." -ForegroundColor Cyan
Set-Location "$ScriptDir\frontend"

# Update API URL in frontend
"VITE_API_URL=$ALB_URL/api" | Out-File -FilePath ".env.production" -Encoding utf8

docker build -t krishi-frontend .
docker tag krishi-frontend:latest "$FRONTEND_ECR:latest"
Write-Host "✅ Frontend image built" -ForegroundColor Green
Write-Host ""

Write-Host "⬆️  Pushing frontend image to ECR..." -ForegroundColor Cyan
docker push "$FRONTEND_ECR:latest"
Write-Host "✅ Frontend image pushed" -ForegroundColor Green
Write-Host ""

# Update ECS services
Write-Host "🔄 Updating ECS services..." -ForegroundColor Cyan
aws ecs update-service --cluster $CLUSTER_NAME --service $BACKEND_SERVICE --force-new-deployment --region $AWS_REGION | Out-Null
Write-Host "✅ Backend service updated" -ForegroundColor Green

aws ecs update-service --cluster $CLUSTER_NAME --service $FRONTEND_SERVICE --force-new-deployment --region $AWS_REGION | Out-Null
Write-Host "✅ Frontend service updated" -ForegroundColor Green
Write-Host ""

# Final message
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Application URL: $ALB_URL" -ForegroundColor Yellow
Write-Host "🔗 Backend API: $ALB_URL/api" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️  Note: It may take 5-10 minutes for services to be fully operational" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 To check deployment status:" -ForegroundColor Cyan
Write-Host "   aws ecs describe-services --cluster $CLUSTER_NAME --services $BACKEND_SERVICE $FRONTEND_SERVICE --region $AWS_REGION"
Write-Host ""
Write-Host "📝 To view logs:" -ForegroundColor Cyan
Write-Host "   AWS Console → CloudWatch → Log groups"
Write-Host ""
Write-Host "✅ Happy deploying! 🎉" -ForegroundColor Green
