# AWS Deployment - Quick Reference

## 📁 Files Created

### Terraform Configuration (`terraform/`)
1. **main.tf** - Main configuration and AWS provider
2. **variables.tf** - Input variable definitions
3. **vpc.tf** - VPC, subnets, NAT gateways
4. **security_groups.tf** - Firewall rules
5. **load_balancer.tf** - Application Load Balancer
6. **ecs.tf** - ECS cluster and services
7. **ecr.tf** - Container image repositories
8. **iam.tf** - IAM roles and CloudWatch logs
9. **documentdb.tf** - MongoDB-compatible database
10. **outputs.tf** - Deployment outputs
11. **terraform.tfvars.example** - Example configuration
12. **.gitignore** - Git ignore rules
13. **README.md** - Terraform documentation

### Documentation
1. **DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
2. **ARCHITECTURE.md** - Infrastructure architecture diagram

### Deployment Scripts
1. **deploy.ps1** - Windows PowerShell deployment script
2. **deploy.sh** - Mac/Linux bash deployment script

---

## 🚀 Three Ways to Deploy

### Option 1: Automated Script (Recommended for Beginners)
```powershell
# Windows
.\deploy.ps1

# Mac/Linux
chmod +x deploy.sh && ./deploy.sh
```

### Option 2: Manual Terraform Commands
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

Then manually build and push Docker images.

### Option 3: Step-by-Step Guide
Follow the comprehensive [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

---

## ✅ Prerequisites Checklist

Before deploying, ensure you have:

- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Terraform installed (v1.0+)
- [ ] Docker Desktop installed and running
- [ ] IAM user created with necessary permissions
- [ ] AWS access keys (Access Key ID and Secret)
- [ ] Strong database password chosen
- [ ] 30-45 minutes of time available

---

## 📋 Deployment Steps Summary

### 1. Setup (5 minutes)
- Install required tools (AWS CLI, Terraform, Docker)
- Configure AWS credentials
- Create IAM user with proper permissions

### 2. Configuration (3 minutes)
- Navigate to `terraform` folder
- Copy `terraform.tfvars.example` to `terraform.tfvars`
- Update variables (especially database password)

### 3. Deploy Infrastructure (15 minutes)
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 4. Build & Push Images (10 minutes)
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and push backend
cd backend
docker build -t backend .
docker tag backend:latest ECR_URL:latest
docker push ECR_URL:latest

# Build and push frontend
cd ../frontend
docker build -t frontend .
docker tag frontend:latest ECR_URL:latest
docker push ECR_URL:latest
```

### 5. Update ECS Services (5 minutes)
```bash
aws ecs update-service --cluster CLUSTER_NAME --service backend-service --force-new-deployment
aws ecs update-service --cluster CLUSTER_NAME --service frontend-service --force-new-deployment
```

### 6. Access Application (2 minutes)
- Get ALB URL from Terraform outputs
- Wait 5-10 minutes for containers to start
- Access your application!

---

## 🎯 What You Get

After successful deployment:

### URLs
- **Application**: `http://your-alb-url.amazonaws.com`
- **Backend API**: `http://your-alb-url.amazonaws.com/api`

### AWS Resources
- 1 VPC with 4 subnets (2 public, 2 private)
- 1 Application Load Balancer
- 1 ECS Cluster with 2 services (backend, frontend)
- 1 DocumentDB cluster with 1 instance
- 2 ECR repositories
- 2 NAT Gateways
- Multiple Security Groups
- CloudWatch Log Groups
- IAM Roles

### Monitoring
- CloudWatch Logs for all containers
- ECS Service metrics
- ALB metrics
- Database metrics

---

## 💰 Cost Breakdown

### Monthly Costs (Development Environment)

| Service | Cost | Details |
|---------|------|---------|
| ECS Fargate | $20-30 | 4 containers running 24/7 |
| DocumentDB | $25-35 | 1 db.t3.medium instance |
| Load Balancer | $5-10 | Application Load Balancer |
| NAT Gateways | $10 | 2 NAT Gateways ($5 each) |
| Data Transfer | $5 | Approximate |
| **Total** | **~$50-80** | |

### Cost Optimization Tips
1. **Stop when not in use**: Scale services to 0 or destroy infrastructure
2. **Use smaller instances**: Reduce DocumentDB instance size for testing
3. **Remove NAT Gateways**: If containers don't need internet access
4. **Use single AZ**: Remove redundancy for dev/test environments
5. **Monitor regularly**: Set up billing alerts in AWS

---

## 🔧 Common Commands

### View Infrastructure Status
```bash
# Terraform outputs
cd terraform
terraform output

# ECS services
aws ecs describe-services --cluster CLUSTER_NAME --services SERVICE_NAME

# View logs
aws logs tail /ecs/krishi-app-dev-backend --follow
```

### Update Application
```bash
# After code changes, rebuild and push images
docker build -t app .
docker push ECR_URL:latest

# Force new deployment
aws ecs update-service --cluster CLUSTER_NAME --service SERVICE_NAME --force-new-deployment
```

### Scale Services
```bash
# Scale up
aws ecs update-service --cluster CLUSTER_NAME --service SERVICE_NAME --desired-count 4

# Scale down
aws ecs update-service --cluster CLUSTER_NAME --service SERVICE_NAME --desired-count 1
```

### Destroy Everything
```bash
cd terraform
terraform destroy
```

---

## 🐛 Troubleshooting Quick Fixes

### Containers Not Starting
1. Check CloudWatch logs
2. Verify environment variables
3. Test database connectivity
4. Check Docker image exists in ECR

### Can't Access Application
1. Verify ECS tasks are running
2. Check security group rules
3. Verify target group health
4. Check ALB listener rules

### High Costs
1. Check ECS task count
2. Verify no idle resources
3. Review NAT Gateway usage
4. Check data transfer costs

### Database Connection Failed
1. Verify DocumentDB is active
2. Check security group rules
3. Validate connection string
4. Test from ECS task

---

## 📚 Documentation Map

### For Complete Beginners
Start here: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Complete walkthrough with screenshots
- Every step explained in detail
- Troubleshooting section

### For Understanding Architecture
Read: [ARCHITECTURE.md](ARCHITECTURE.md)
- Visual diagrams
- Component explanations
- Security features
- Traffic flow

### For Terraform Details
See: [terraform/README.md](terraform/README.md)
- File structure
- Variable reference
- Common commands
- Cost estimates

### For Quick Deployment
Use: `deploy.ps1` or `deploy.sh`
- Automated deployment
- Error checking
- Progress updates

---

## 🎓 Learning Resources

### AWS Services Used
- **VPC**: https://docs.aws.amazon.com/vpc/
- **ECS**: https://docs.aws.amazon.com/ecs/
- **DocumentDB**: https://docs.aws.amazon.com/documentdb/
- **ECR**: https://docs.aws.amazon.com/ecr/
- **ALB**: https://docs.aws.amazon.com/elasticloadbalancing/

### Terraform
- **Getting Started**: https://learn.hashicorp.com/terraform
- **AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws

### Docker
- **Documentation**: https://docs.docker.com/
- **Best Practices**: https://docs.docker.com/develop/dev-best-practices/

---

## 🛡️ Security Checklist

- [ ] Strong database password (16+ characters)
- [ ] AWS credentials stored securely
- [ ] MFA enabled on AWS account
- [ ] `.tfvars` added to `.gitignore`
- [ ] IAM user (not root account) for deployments
- [ ] Security groups follow least privilege
- [ ] Database encryption enabled
- [ ] Backup retention configured
- [ ] CloudWatch logs enabled
- [ ] AWS Cost alerts set up

---

## 🎯 Next Steps After Deployment

1. **Add Custom Domain**
   - Register domain
   - Create Route 53 hosted zone
   - Point domain to Load Balancer

2. **Enable HTTPS**
   - Request ACM certificate
   - Add HTTPS listener to ALB
   - Redirect HTTP to HTTPS

3. **Setup CI/CD**
   - Create GitHub Actions workflow
   - Automate Docker builds
   - Auto-deploy on push

4. **Add Monitoring**
   - Configure CloudWatch alarms
   - Set up SNS notifications
   - Create dashboard

5. **Implement Backups**
   - Configure automated snapshots
   - Test restore procedures
   - Document recovery process

---

## 📞 Getting Help

### Issues with Terraform
- Check: [terraform/README.md](terraform/README.md)
- Run: `terraform validate` to check configuration
- View: AWS Console to see actual resources

### Issues with AWS
- AWS Support: https://console.aws.amazon.com/support
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: Tag `amazon-web-services`

### Issues with Application
- Check CloudWatch Logs
- Review ECS service events
- Test containers locally with Docker

---

**Happy Deploying! 🚀**

Last Updated: February 2026
