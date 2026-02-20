# AWS Architecture Diagram

```
                                    Internet
                                       ↓
                          ┌────────────────────────┐
                          │  Application Load      │
                          │  Balancer (ALB)       │
                          │  (Public Subnets)     │
                          └────────┬───────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
            Path: /api/*      Path: /*            │
                    │              │              │
                    ↓              ↓              │
        ┌──────────────────┐  ┌──────────────────┐
        │  Backend         │  │  Frontend        │
        │  Target Group    │  │  Target Group    │
        └──────────────────┘  └──────────────────┘
                    │              │
                    ↓              ↓
        ┌──────────────────────────────────────────┐
        │         Private Subnets                  │
        │  ┌─────────────────┐  ┌───────────────┐ │
        │  │  ECS Service    │  │  ECS Service  │ │
        │  │  (Backend)      │  │  (Frontend)   │ │
        │  │  - 2 Tasks      │  │  - 2 Tasks    │ │
        │  │  - Port 5000    │  │  - Port 80    │ │
        │  └────────┬────────┘  └───────────────┘ │
        │           │                              │
        │           ↓                              │
        │  ┌──────────────────┐                   │
        │  │  DocumentDB      │                   │
        │  │  (MongoDB)       │                   │
        │  │  - db.t3.medium  │                   │
        │  └──────────────────┘                   │
        └──────────────────────────────────────────┘
                    │
                    ↓
        ┌──────────────────────────┐
        │  NAT Gateways            │
        │  (Internet Access)       │
        └──────────────────────────┘
                    │
                    ↓
        ┌──────────────────────────┐
        │  Internet Gateway        │
        └──────────────────────────┘


┌─────────────────────────────────────────────────────────┐
│                   Container Registry                     │
│  ┌──────────────────┐      ┌──────────────────┐        │
│  │  ECR             │      │  ECR             │        │
│  │  Backend Images  │      │  Frontend Images │        │
│  └──────────────────┘      └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Components Explanation

### 1. **Application Load Balancer (ALB)**
- **Purpose**: Entry point for all traffic
- **Location**: Public subnets (accessible from internet)
- **Function**: Routes requests to appropriate service
  - `/api/*` → Backend service
  - `/*` → Frontend service

### 2. **ECS Cluster (Fargate)**
- **Purpose**: Runs containerized applications
- **Launch Type**: Fargate (serverless, no EC2 management)
- **Services**:
  - Backend: 2 tasks running Node.js
  - Frontend: 2 tasks running React/Nginx

### 3. **DocumentDB**
- **Purpose**: MongoDB-compatible managed database
- **Location**: Private subnet (not accessible from internet)
- **Configuration**: 
  - Instance type: db.t3.medium
  - Storage: Encrypted
  - Backups: 5-day retention

### 4. **VPC Network**
- **CIDR**: 10.0.0.0/16
- **Public Subnets** (2): For ALB
- **Private Subnets** (2): For ECS tasks and database
- **Availability Zones**: 2 (for high availability)

### 5. **NAT Gateways**
- **Purpose**: Allow private subnet resources to access internet
- **Count**: 2 (one per AZ for redundancy)
- **Use Case**: Pull Docker images, external API calls

### 6. **ECR (Elastic Container Registry)**
- **Purpose**: Store Docker images
- **Repositories**: 
  - Backend repository
  - Frontend repository

### 7. **Security Groups (Firewalls)**

**ALB Security Group**:
- Inbound: Port 80 (HTTP) from 0.0.0.0/0
- Inbound: Port 443 (HTTPS) from 0.0.0.0/0
- Outbound: All traffic

**Backend Security Group**:
- Inbound: Port 5000 from ALB only
- Outbound: All traffic

**Frontend Security Group**:
- Inbound: Port 80 from ALB only
- Outbound: All traffic

**Database Security Group**:
- Inbound: Port 27017 from Backend only
- Outbound: All traffic

## Traffic Flow

1. **User Request** → ALB (public subnet)
2. **ALB** → Route based on path:
   - API requests → Backend service (private subnet)
   - Web requests → Frontend service (private subnet)
3. **Backend Service** → DocumentDB (private subnet)
4. **Response** ← Backend/Frontend → ALB → User

## High Availability Features

- **Multi-AZ Deployment**: Resources spread across 2 availability zones
- **Auto-Scaling**: ECS can scale containers based on load
- **Load Balancing**: ALB distributes traffic evenly
- **Database Backups**: Automated daily snapshots
- **Health Checks**: ALB monitors container health

## Security Features

- **Private Subnets**: Application and database not directly accessible
- **Security Groups**: Fine-grained network access control
- **Encryption**: Database storage encrypted at rest
- **IAM Roles**: Least privilege access for ECS tasks
- **VPC Isolation**: Network-level isolation

## Cost Optimization Tips

1. **Use Spot Instances**: (Not applicable for Fargate, but can use EC2 launch type)
2. **Right-size Containers**: Adjust CPU/Memory based on actual usage
3. **Scale Down**: Reduce container count during off-peak hours
4. **Use Reserved Capacity**: For production workloads
5. **Monitor Costs**: Use AWS Cost Explorer

## Monitoring

- **CloudWatch Logs**: Container logs from all services
- **CloudWatch Metrics**: CPU, memory, network usage
- **ECS Service Events**: Deployment and health status
- **ALB Metrics**: Request count, latency, errors

---

**Note**: This architecture follows AWS Well-Architected Framework principles for reliability, security, and cost optimization.
