# Terraform Variables
# Configure these values according to your needs

variable "aws_region" {
  description = "AWS region to deploy resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "krishi-app"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "backend_port" {
  description = "Backend application port"
  type        = number
  default     = 5000
}

variable "frontend_port" {
  description = "Frontend application port"
  type        = number
  default     = 80
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string (mongodb+srv://user:pass@cluster.mongodb.net/dbname)"
  type        = string
  sensitive   = true
}

variable "backend_cpu" {
  description = "CPU units for backend container (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "backend_memory" {
  description = "Memory for backend container in MB"
  type        = number
  default     = 1024
}

variable "frontend_cpu" {
  description = "CPU units for frontend container"
  type        = number
  default     = 256
}

variable "frontend_memory" {
  description = "Memory for frontend container in MB"
  type        = number
  default     = 512
}

variable "backend_desired_count" {
  description = "Number of backend containers to run"
  type        = number
  default     = 2
}

variable "frontend_desired_count" {
  description = "Number of frontend containers to run"
  type        = number
  default     = 2
}
