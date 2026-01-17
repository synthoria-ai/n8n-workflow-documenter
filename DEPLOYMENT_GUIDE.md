# n8n Workflow Documenter - Deployment Guide

Complete guide for deploying the n8n Workflow Documenter as a web app using Docker and GitLab CI/CD.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Server Setup](#server-setup)
4. [GitLab Configuration](#gitlab-configuration)
5. [Deployment Methods](#deployment-methods)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What is n8n Workflow Documenter?

The n8n Workflow Documenter is a Next.js web application that analyzes n8n workflow JSON files and generates:
- **Clean JSON files** without credentials and leftover keys
- **Markdown documentation** with workflow details
- **AI-powered analysis** using Google Gemini
- **Batch processing** via Google Drive integration

### Technology Stack

- **Framework**: Next.js 14 (React + TypeScript)
- **AI**: Google Gemini API
- **Storage**: Google Drive API
- **Deployment**: Docker + Nginx
- **CI/CD**: GitLab CI/CD

### Deployment Architecture

```
User → Nginx (Port 80/443) → Docker Container (Port 3010) → Next.js App (Port 3000)
```

---

## Prerequisites

### Required Tools

- **Server**: Ubuntu 22.04+ (Hetzner, DigitalOcean, AWS, etc.)
- **Docker**: Version 24+
- **Docker Compose**: Version 2+
- **Nginx**: Latest stable
- **GitLab**: Account with CI/CD enabled
- **Domain**: Custom domain (optional but recommended)

### Required Credentials

1. **Google Gemini API Key**
   - Get from: https://makersuite.google.com/app/apikey
   - Used for AI workflow analysis

2. **Google Client ID** (for Drive integration)
   - Get from: https://console.cloud.google.com/
   - Enable Google Drive API
   - Create OAuth 2.0 credentials

3. **Server SSH Access**
   - SSH private key
   - Server IP address
   - User with sudo privileges

---

## Server Setup

### Step 1: Prepare Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installations
docker --version
docker compose version

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Nginx
sudo apt install nginx -y

# Install Certbot (for SSL)
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Create Application Directory

```bash
# Create directory
sudo mkdir -p /opt/n8n-documenter
sudo chown $USER:$USER /opt/n8n-documenter
cd /opt/n8n-documenter

# Create Docker network (if not exists)
docker network create app-network || true
```

### Step 3: Configure Nginx

```bash
# Copy nginx configuration
sudo cp nginx-n8n-documenter.conf /etc/nginx/sites-available/n8n-documenter

# Update domain name in config
sudo nano /etc/nginx/sites-available/n8n-documenter
# Replace 'documenter.yourdomain.com' with your actual domain

# Enable site
sudo ln -s /etc/nginx/sites-available/n8n-documenter /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### Step 4: Set Up SSL (Optional but Recommended)

```bash
# Obtain SSL certificate
sudo certbot --nginx -d documenter.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

---

## GitLab Configuration

### Step 1: Fork/Import Repository

1. Go to https://github.com/synthoria-ai/n8n-workflow-documenter
2. Fork or import to your GitLab account
3. Clone to your local machine (optional)

### Step 2: Configure CI/CD Variables

In GitLab, go to: **Settings → CI/CD → Variables**

Add the following variables:

| Variable Name | Value | Protected | Masked |
|--------------|-------|-----------|--------|
| `SSH_PRIVATE_KEY` | Your server SSH private key | ✅ | ✅ |
| `SERVER_IP` | Your server IP address | ✅ | ❌ |
| `SERVER_USER` | SSH username (e.g., ubuntu) | ✅ | ❌ |
| `STAGING_SERVER_IP` | Staging server IP (optional) | ✅ | ❌ |
| `STAGING_USER` | Staging SSH username (optional) | ✅ | ❌ |

**Note**: Mark variables as "Protected" to restrict access to protected branches only.

### Step 3: Add Deployment Files to Repository

Copy these files to your repository root:

- `.gitlab-ci.yml` (GitLab CI/CD pipeline)
- `Dockerfile` (Docker build instructions)
- `docker-compose.yml` (Container orchestration)
- `.dockerignore` (Files to exclude from Docker build)
- `next.config.mjs` (Updated Next.js config with standalone output)
- `nginx-n8n-documenter.conf` (Nginx reverse proxy config)

Commit and push:

```bash
git add .gitlab-ci.yml Dockerfile docker-compose.yml .dockerignore next.config.mjs nginx-n8n-documenter.conf
git commit -m "Add deployment configuration"
git push origin main
```

---

## Deployment Methods

### Method 1: Automated Deployment via GitLab CI/CD (Recommended)

**Trigger Deployment**:

1. Push code to `main` branch
2. Go to GitLab: **CI/CD → Pipelines**
3. Click on the latest pipeline
4. In the `deploy` stage, click **"Play"** button on `deploy_production`
5. Wait for deployment to complete (~5-10 minutes)

**Pipeline Stages**:

- **Build**: Builds Docker image
- **Test**: Runs linter and tests
- **Deploy**: Deploys to production server (manual trigger)

**Deployment Flow**:

```
Push to main → Build Docker image → Run tests → Manual approval → Deploy to server
```

### Method 2: Manual Deployment

If you prefer manual deployment or GitLab CI/CD is not available:

```bash
# SSH into server
ssh user@your-server-ip

# Navigate to app directory
cd /opt/n8n-documenter

# Clone repository (first time only)
git clone https://github.com/synthoria-ai/n8n-workflow-documenter.git .

# Or pull latest changes
git pull origin main

# Copy deployment files
cp Dockerfile docker-compose.yml .dockerignore next.config.mjs ./

# Build Docker image
docker compose build

# Start container
docker compose up -d

# Check status
docker compose ps
docker compose logs -f
```

### Method 3: Local Development

For local testing before deployment:

```bash
# Clone repository
git clone https://github.com/synthoria-ai/n8n-workflow-documenter.git
cd n8n-workflow-documenter

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

---

## Post-Deployment

### Step 1: Verify Deployment

```bash
# Check container status
docker compose ps

# View logs
docker compose logs -f n8n-documenter

# Test local access
curl http://localhost:3010

# Test public access
curl https://documenter.yourdomain.com
```

### Step 2: Configure Application

1. Open https://documenter.yourdomain.com in browser
2. Enter your **Gemini API Key**
3. Enter your **Google Client ID**
4. Click **"Sign in with Google Drive"**
5. Authorize the application

### Step 3: Test Workflow

**Single File Test**:
1. Upload a test n8n workflow JSON file
2. Click **"Analyze This File"**
3. Review generated documentation

**Batch Processing Test**:
1. Sign in with Google Drive
2. Select source folder (with workflow JSON files)
3. Select destination folder (for output)
4. Click **"Run Batch Analysis"**
5. Monitor processing log

### Step 4: Set Up Monitoring (Optional)

**Health Checks**:

```bash
# Add to crontab for monitoring
crontab -e

# Add this line (check every 5 minutes)
*/5 * * * * curl -f http://localhost:3010 || systemctl restart docker
```

**Log Rotation**:

```bash
# Configure Docker log rotation
sudo nano /etc/docker/daemon.json

# Add:
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# Restart Docker
sudo systemctl restart docker
```

---

## Troubleshooting

### Issue 1: Container Won't Start

**Symptoms**: `docker compose up -d` fails or container exits immediately

**Solutions**:

```bash
# Check logs
docker compose logs n8n-documenter

# Common issues:
# 1. Port already in use
sudo lsof -i :3010
# Kill process or change port in docker-compose.yml

# 2. Build failed
docker compose build --no-cache

# 3. Missing dependencies
docker compose down
docker compose up -d --force-recreate
```

### Issue 2: 502 Bad Gateway (Nginx)

**Symptoms**: Nginx returns 502 error

**Solutions**:

```bash
# Check if container is running
docker compose ps

# Check Nginx error logs
sudo tail -f /var/log/nginx/n8n-documenter-error.log

# Verify port mapping
docker compose port n8n-documenter 3000

# Restart Nginx
sudo systemctl restart nginx
```

### Issue 3: SSL Certificate Issues

**Symptoms**: HTTPS not working or certificate errors

**Solutions**:

```bash
# Renew certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates

# Force renewal
sudo certbot renew --force-renewal

# Restart Nginx
sudo systemctl restart nginx
```

### Issue 4: Google Drive Authentication Fails

**Symptoms**: "Sign in with Google Drive" doesn't work

**Solutions**:

1. **Check Client ID**: Verify it's correct in the app
2. **Check Authorized Origins**: In Google Cloud Console, add:
   - `https://documenter.yourdomain.com`
   - `http://localhost:3010` (for testing)
3. **Check Redirect URIs**: Add:
   - `https://documenter.yourdomain.com`
4. **Enable APIs**: Ensure Google Drive API is enabled

### Issue 5: Gemini API Errors

**Symptoms**: Analysis fails with API errors

**Solutions**:

1. **Verify API Key**: Check it's valid and active
2. **Check Quota**: Ensure you haven't exceeded free tier limits
3. **Check Billing**: Gemini API may require billing enabled
4. **Test API Key**:

```bash
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

### Issue 6: High Memory Usage

**Symptoms**: Server running out of memory

**Solutions**:

```bash
# Check memory usage
docker stats

# Limit container memory in docker-compose.yml
services:
  n8n-documenter:
    mem_limit: 512m
    mem_reservation: 256m

# Restart with limits
docker compose down
docker compose up -d
```

### Issue 7: Slow Performance

**Symptoms**: App is slow or unresponsive

**Solutions**:

1. **Increase server resources** (CPU/RAM)
2. **Enable caching** in Next.js
3. **Optimize Docker image** (already done with multi-stage build)
4. **Use CDN** for static assets (optional)

### Issue 8: GitLab CI/CD Pipeline Fails

**Symptoms**: Pipeline fails at build or deploy stage

**Solutions**:

```bash
# Check GitLab CI/CD variables
# Ensure all required variables are set

# Test SSH connection manually
ssh -i ~/.ssh/id_rsa user@server-ip

# Check Docker on GitLab runner
docker info

# Re-run pipeline with debug mode
# In GitLab: CI/CD → Pipelines → Re-run with debug
```

---

## Maintenance

### Regular Tasks

**Weekly**:
- Check logs for errors
- Monitor disk space
- Review container health

**Monthly**:
- Update dependencies (`npm update`)
- Renew SSL certificates (automatic with Certbot)
- Review security updates

**Quarterly**:
- Update Docker images
- Update Node.js version
- Review and optimize performance

### Update Application

```bash
# SSH into server
ssh user@your-server-ip

# Navigate to app directory
cd /opt/n8n-documenter

# Pull latest changes
git pull origin main

# Rebuild and restart
docker compose down
docker compose build
docker compose up -d

# Verify
docker compose ps
curl http://localhost:3010
```

### Backup

**Backup Strategy**:

1. **Code**: Already in Git repository
2. **Configuration**: Backup `.env` files and nginx configs
3. **Data**: No persistent data (stateless app)

```bash
# Backup configuration
tar -czf n8n-documenter-backup-$(date +%Y%m%d).tar.gz \
  /opt/n8n-documenter/docker-compose.yml \
  /etc/nginx/sites-available/n8n-documenter

# Store backup securely
# Upload to B2, S3, or other backup storage
```

---

## Cost Estimation

### Server Costs

| Provider | Specs | Monthly Cost |
|----------|-------|-------------|
| **Hetzner CPX11** | 2 CPU, 2 GB RAM | **€4.51** (~$5) |
| **Hetzner CPX21** | 3 CPU, 4 GB RAM | **€9.02** (~$10) |
| **DigitalOcean Droplet** | 2 CPU, 2 GB RAM | **$12** |
| **AWS EC2 t3.small** | 2 CPU, 2 GB RAM | **~$15** |

**Recommendation**: Hetzner CPX11 is sufficient for this app.

### API Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| **Google Gemini** | 60 requests/minute | Pay-as-you-go |
| **Google Drive API** | 1 billion requests/day | Free for most use cases |

**Estimated Total**: **$5-10/month** (mostly server costs)

---

## Security Best Practices

1. **Use HTTPS**: Always enable SSL/TLS
2. **Firewall**: Only open necessary ports (80, 443, 22)
3. **SSH Keys**: Use key-based authentication, disable password login
4. **Regular Updates**: Keep system and Docker updated
5. **Environment Variables**: Never commit API keys to Git
6. **Rate Limiting**: Consider adding rate limiting to Nginx
7. **Backup**: Regular backups of configuration
8. **Monitoring**: Set up alerts for downtime

---

## Support & Resources

- **GitHub Repository**: https://github.com/synthoria-ai/n8n-workflow-documenter
- **Next.js Docs**: https://nextjs.org/docs
- **Docker Docs**: https://docs.docker.com/
- **Nginx Docs**: https://nginx.org/en/docs/
- **GitLab CI/CD Docs**: https://docs.gitlab.com/ee/ci/

---

## Summary

You now have a complete deployment solution for the n8n Workflow Documenter:

✅ **Docker containerization** for consistent deployment  
✅ **GitLab CI/CD** for automated deployments  
✅ **Nginx reverse proxy** for production-ready setup  
✅ **SSL/TLS** for secure HTTPS access  
✅ **Multi-environment support** (staging + production)  
✅ **Health checks** and monitoring  
✅ **Rollback capability** for safety  

**Next Steps**:
1. Set up your server (Hetzner CPX11 recommended)
2. Configure GitLab CI/CD variables
3. Push deployment files to repository
4. Trigger deployment via GitLab pipeline
5. Configure SSL with Certbot
6. Test the application
7. Start documenting your n8n workflows!

🚀 **Happy Deploying!**
