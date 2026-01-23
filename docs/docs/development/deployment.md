---
title: Deployment Guide
sidebar_position: 2
sidebar_label: Deployment
description: Guide to deploy Green Bond Platform on AWS, Azure, GCP - Docker deployment, ECS, environment configuration, and monitoring
keywords: [deployment, production, AWS, ECS, docker deployment, cloud deployment, monitoring]
---

# Deployment

Guide to deploy Green Bond Platform in different environments.

## Deployment Prerequisites

- Access to a server or cloud service (AWS, Azure, GCP)
- Docker and Docker Compose installed
- Configured domain (for production)
- SSL/TLS Certificates
- Configured environment variables

## Local Deployment with Docker

### Build Images

```bash
# Build all images
docker compose build

# Build a specific service
docker compose build gateway
docker compose build ats-api
```

### Run Services

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

## Deployment on AWS

### Using ECS (Elastic Container Service)

1. **Create ECR repository**:

```bash
aws ecr create-repository --repository-name gbp-gateway
aws ecr create-repository --repository-name gbp-ats-api
```

2. **Build and push images**:

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t gbp-gateway apps/shared/gateway

# Tag image
docker tag gbp-gateway:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/gbp-gateway:latest

# Push image
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/gbp-gateway:latest
```

3. **Create ECS task definition**
4. **Create ECS service**
5. **Configure load balancer**

## Environment Variables

Ensure all environment variables are properly configured:

```bash
# Production
NODE_ENV=production
LOG_LEVEL=warn
ENABLE_SWAGGER=false
```

## Health Checks

Implement health check endpoints:

```typescript
@Get('/health')
health() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}
```

## Monitoring

- **Logs**: CloudWatch, ELK Stack
- **Metrics**: Prometheus, Grafana
- **Alerts**: PagerDuty, Slack
