# Terraform AWS Infrastructure

This directory contains Terraform configuration files to deploy the Krishi application to AWS.

## 📁 Files Overview

- **main.tf** - Main configuration and AWS provider setup
- **variables.tf** - Input variable definitions
- **terraform.tfvars.example** - Example variable values (copy to terraform.tfvars)
- **vpc.tf** - VPC, subnets, and networking resources
- **security_groups.tf** - Security group (firewall) rules
- **load_balancer.tf** - Application Load Balancer configuration
- **ecs.tf** - ECS cluster and service definitions
- **ecr.tf** - ECR repositories for Docker images
- **iam.tf** - IAM roles and policies
- **documentdb.tf** - DocumentDB (MongoDB) cluster
- **outputs.tf** - Output values after deployment

## 🚀 Quick Start

### 1. Prerequisites
- AWS CLI installed and configured
- Terraform installed (v1.0+)
- Docker Desktop installed

### 2. Configure Variables
```bash
copy terraform.tfvars.example terraform.tfvars
notepad terraform.tfvars  # Update with your values
```

### 3. Initialize Terraform
```bash
terraform init
```

### 4. Preview Changes
```bash
terraform plan
```

### 5. Deploy Infrastructure
```bash
terraform apply
```

### 6. Get Outputs
```bash
terraform output
```

## 📊 Infrastructure Components

### Networking
- **VPC**: 10.0.0.0/16
- **Public Subnets**: 2 (for Load Balancer)
- **Private Subnets**: 2 (for ECS and Database)
- **NAT Gateways**: 2 (high availability)

### Compute
- **ECS Cluster**: Fargate launch type
- **Backend Service**: 2 containers (configurable)
- **Frontend Service**: 2 containers (configurable)

### Database
- **DocumentDB**: MongoDB-compatible cluster
- **Instance Class**: db.t3.medium
- **Backup Retention**: 5 days

### Load Balancing
- **Application Load Balancer**: Public-facing
- **Backend Target Group**: Routes /api/* traffic
- **Frontend Target Group**: Routes all other traffic

### Storage
- **ECR**: 2 repositories (backend and frontend)

## 💰 Estimated Monthly Costs

### Development Environment (~$50-80/month)
- ECS Fargate: ~$20-30
- DocumentDB (1 instance): ~$25-35
- Load Balancer: ~$5-10
- NAT Gateways: ~$10
- Other (data transfer, logs): ~$5

### Production Environment (~$150-300/month)
- ECS Fargate (more tasks): ~$60-100
- DocumentDB (3 instances + replication): ~$75-150
- Load Balancer: ~$20
- NAT Gateways: ~$20
- Other: ~$10-30

**Note**: Actual costs vary based on usage, region, and configuration.

## 🛠️ Common Commands

### View Current State
```bash
terraform show
```

### View Specific Output
```bash
terraform output alb_url
```

### Update Infrastructure
```bash
terraform apply
```

### Destroy All Resources
```bash
terraform destroy
```

### Format Configuration Files
```bash
terraform fmt
```

### Validate Configuration
```bash
terraform validate
```

## 🔐 Security Best Practices

1. **Never commit terraform.tfvars** - Contains sensitive data
2. **Use strong database passwords** - Minimum 16 characters
3. **Enable MFA on AWS account**
4. **Use IAM user for Terraform**, not root account
5. **Store state file securely** - Consider using S3 backend with encryption

## 📝 Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| aws_region | us-east-1 | AWS region for deployment |
| project_name | krishi-app | Project name prefix |
| environment | dev | Environment (dev/staging/prod) |
| vpc_cidr | 10.0.0.0/16 | VPC CIDR block |
| backend_cpu | 512 | Backend container CPU (1024 = 1 vCPU) |
| backend_memory | 1024 | Backend container memory (MB) |
| backend_desired_count | 2 | Number of backend containers |
| frontend_cpu | 256 | Frontend container CPU |
| frontend_memory | 512 | Frontend container memory (MB) |
| frontend_desired_count | 2 | Number of frontend containers |
| db_username | admin | Database master username |
| db_password | - | Database master password (required) |

## 🔄 Updating Your Application

After making code changes:

1. **Build and push new Docker images**:
```bash
# Backend
docker build -t backend ./backend
docker tag backend:latest YOUR_ECR_URL:latest
docker push YOUR_ECR_URL:latest

# Frontend
docker build -t frontend ./frontend
docker tag frontend:latest YOUR_ECR_URL:latest
docker push YOUR_ECR_URL:latest
```

2. **Force new deployment**:
```bash
aws ecs update-service --cluster CLUSTER_NAME --service SERVICE_NAME --force-new-deployment
```

## 🐛 Troubleshooting

### Terraform Errors

**Error: Error acquiring the state lock**
```bash
# Force unlock (use carefully)
terraform force-unlock LOCK_ID
```

**Error: Resource already exists**
```bash
# Import existing resource
terraform import aws_vpc.main vpc-12345678
```

### ECS Services Not Starting

1. Check CloudWatch logs
2. Verify security group rules
3. Check task definition environment variables
4. Ensure Docker images exist in ECR

### Database Connection Issues

1. Verify security group allows connection
2. Check connection string format
3. Ensure DocumentDB cluster is active
4. Test connectivity from ECS task

## 📚 Additional Resources

- [Full Deployment Guide](../DEPLOYMENT_GUIDE.md) - Detailed step-by-step instructions
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws)
- [DocumentDB Documentation](https://docs.aws.amazon.com/documentdb/)

## 🆘 Support

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

---

**Made with ❤️ for the Krishi App**
