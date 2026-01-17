# n8n Workflow Documenter - Deployment Package

Complete deployment solution for turning the n8n Workflow Documenter into a production-ready web application.

## 📦 What's Included

This package contains everything you need to deploy the n8n Workflow Documenter to your own server:

### Configuration Files

- **`Dockerfile`** - Multi-stage Docker build for optimal image size
- **`docker-compose.yml`** - Container orchestration configuration
- **`.dockerignore`** - Files to exclude from Docker build
- **`next.config.mjs`** - Updated Next.js configuration with standalone output
- **`.gitlab-ci.yml`** - Complete CI/CD pipeline for automated deployment
- **`nginx-n8n-documenter.conf`** - Nginx reverse proxy configuration with SSL

### Documentation

- **`DEPLOYMENT_GUIDE.md`** - Comprehensive step-by-step deployment guide (start here!)
- **`README.md`** - This file - package overview

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

**Prerequisites**: GitLab account, server with Docker

1. **Read DEPLOYMENT_GUIDE.md** (15 minutes)
2. **Set up server** with Docker and Nginx (30 minutes)
3. **Configure GitLab CI/CD** variables (10 minutes)
4. **Push code** to GitLab repository
5. **Trigger deployment** via GitLab pipeline
6. **Done!** Your app is live 🎉

**Total Time**: ~1 hour

### Option 2: Manual Deployment

**Prerequisites**: Server with Docker

1. **SSH into your server**
2. **Clone repository** to `/opt/n8n-documenter`
3. **Copy deployment files** from this package
4. **Run**: `docker compose up -d`
5. **Configure Nginx** (optional but recommended)
6. **Done!** Your app is running locally

**Total Time**: ~30 minutes

## 🎯 What This Solves

### The Problem

The n8n Workflow Documenter is a Next.js application that runs locally on `localhost:3000`. You want to:

- ✅ Deploy it as a web app accessible from anywhere
- ✅ Run it on your own server (not Vercel)
- ✅ Automate deployments with GitLab CI/CD
- ✅ Use HTTPS with custom domain
- ✅ Integrate with your existing infrastructure

### The Solution

This deployment package provides:

- **Docker containerization** - Consistent, reproducible deployments
- **GitLab CI/CD pipeline** - Automated build and deployment
- **Nginx reverse proxy** - Production-ready web server with SSL
- **Multi-environment support** - Staging and production environments
- **Health checks** - Automatic monitoring and recovery
- **Rollback capability** - Safety net for failed deployments

## 📊 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTPS (443)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│  • SSL/TLS termination                                       │
│  • Request routing                                           │
│  • Static file caching                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP (3010)
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Docker Container                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Next.js Application (Port 3000)             │   │
│  │  • n8n Workflow Analyzer                             │   │
│  │  • Google Gemini AI Integration                      │   │
│  │  • Google Drive Integration                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Application** | Next.js 14 + TypeScript | Web framework |
| **AI Analysis** | Google Gemini API | Workflow documentation |
| **Storage** | Google Drive API | Batch processing |
| **Containerization** | Docker + Docker Compose | Deployment |
| **Web Server** | Nginx | Reverse proxy + SSL |
| **CI/CD** | GitLab CI/CD | Automated deployment |
| **SSL** | Let's Encrypt (Certbot) | HTTPS certificates |

## 💰 Cost Breakdown

### Server Costs

| Provider | Specs | Monthly Cost | Recommendation |
|----------|-------|-------------|----------------|
| **Hetzner CPX11** | 2 CPU, 2 GB RAM, 40 GB SSD | **€4.51** (~$5) | ✅ Best value |
| **Hetzner CPX21** | 3 CPU, 4 GB RAM, 80 GB SSD | €9.02 (~$10) | If running multiple apps |
| **DigitalOcean** | 2 CPU, 2 GB RAM | $12 | Alternative |
| **AWS EC2 t3.small** | 2 CPU, 2 GB RAM | ~$15 | Enterprise option |

### API Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| **Google Gemini** | 60 requests/minute | Free (for most use cases) |
| **Google Drive API** | 1 billion requests/day | Free |

### Total Monthly Cost

**Estimated**: **$5-10/month** (primarily server costs)

**Compare to**:
- Vercel Pro: $20/month
- Heroku Hobby: $7/month (but limited)
- AWS Lightsail: $5/month (similar specs)

**Advantage**: Full control + can host multiple apps on same server!

## 📋 Prerequisites

### Required

- **Server**: Ubuntu 22.04+ with 2 GB RAM minimum
- **Docker**: Version 24+
- **Docker Compose**: Version 2+
- **GitLab**: Account with CI/CD enabled (or use manual deployment)
- **Domain**: Custom domain (optional but recommended for HTTPS)

### Optional

- **Nginx**: For reverse proxy (recommended)
- **Certbot**: For SSL certificates (recommended)

### Credentials Needed

1. **Google Gemini API Key** - Get from https://makersuite.google.com/app/apikey
2. **Google Client ID** - Get from https://console.cloud.google.com/
3. **Server SSH Access** - Private key and IP address

## 🎓 Deployment Methods Comparison

| Method | Difficulty | Time | Automation | Best For |
|--------|-----------|------|------------|----------|
| **GitLab CI/CD** | Medium | 1 hour | ✅ Full | Production use |
| **Manual Docker** | Easy | 30 min | ❌ None | Testing, one-off |
| **Local Dev** | Very Easy | 5 min | ❌ None | Development only |

## 📖 Documentation Structure

### DEPLOYMENT_GUIDE.md (Comprehensive)

Complete step-by-step guide covering:

1. **Overview** - What you're deploying and why
2. **Prerequisites** - What you need before starting
3. **Server Setup** - Preparing your server
4. **GitLab Configuration** - Setting up CI/CD
5. **Deployment Methods** - Automated and manual options
6. **Post-Deployment** - Verification and configuration
7. **Troubleshooting** - Common issues and solutions
8. **Maintenance** - Ongoing tasks and updates

**Start here** if you're new to deployment or want detailed instructions.

### README.md (This File)

Quick overview and reference:

- Package contents
- Quick start options
- Architecture overview
- Cost breakdown
- Prerequisites checklist

**Use this** for quick reference or if you're experienced with Docker deployments.

## 🔧 Customization

### Change Port

Edit `docker-compose.yml`:

```yaml
ports:
  - "3010:3000"  # Change 3010 to your preferred port
```

### Change Domain

Edit `nginx-n8n-documenter.conf`:

```nginx
server_name documenter.yourdomain.com;  # Change to your domain
```

### Add Environment Variables

Edit `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - YOUR_CUSTOM_VAR=value
```

### Resource Limits

Edit `docker-compose.yml`:

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 512M
    reservations:
      cpus: '0.5'
      memory: 256M
```

## 🚨 Important Notes

### Security

- **Never commit API keys** to Git repository
- **Use environment variables** for sensitive data
- **Enable HTTPS** in production (included in deployment guide)
- **Keep Docker updated** for security patches

### Performance

- **Multi-stage Docker build** reduces image size by ~60%
- **Standalone Next.js output** optimizes for production
- **Nginx caching** improves static asset delivery
- **Health checks** ensure container stays healthy

### Compatibility

- **Works with existing infrastructure** - Can run alongside other apps
- **Uses Docker network** - Integrates with other containers
- **Standard ports** - No conflicts with common services
- **Nginx reverse proxy** - Industry-standard setup

## 🎯 Use Cases

### Scenario 1: Personal Use

**Setup**: Manual deployment on Hetzner CPX11  
**Cost**: $5/month  
**Time**: 30 minutes  
**Best for**: Individual developers, small teams

### Scenario 2: Team/Production Use

**Setup**: GitLab CI/CD with staging + production  
**Cost**: $10-20/month (2 servers)  
**Time**: 1 hour initial setup, then automated  
**Best for**: Teams, production workflows, continuous deployment

### Scenario 3: Multi-App Server

**Setup**: Deploy alongside SurfSense, Supabase, n8n, etc.  
**Cost**: $18/month (Hetzner CPX41 - 8 GB RAM)  
**Time**: Add 30 minutes per app  
**Best for**: Consolidating multiple services on one server

## 🔄 Integration with Your NNR Stack

This deployment approach is **identical** to the SurfSense deployment we discussed earlier. You can use the **same server** to host:

- ✅ n8n Workflow Documenter (Port 3010)
- ✅ SurfSense (Port 3000)
- ✅ Supabase (self-hosted)
- ✅ n8n (if self-hosting)
- ✅ Your 10 websites
- ✅ Other Next.js/Node.js apps

**Total Cost**: $18-36/month (vs $200-400/month for separate cloud services)

## 📚 Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **Nginx Configuration**: https://nginx.org/en/docs/
- **GitLab CI/CD**: https://docs.gitlab.com/ee/ci/
- **Let's Encrypt**: https://letsencrypt.org/docs/

## ❓ FAQ

**Q: Can I use GitHub Actions instead of GitLab CI/CD?**  
A: Yes! The Docker setup is the same. You'd just need to adapt the `.gitlab-ci.yml` to GitHub Actions syntax.

**Q: Can I deploy to Vercel instead?**  
A: Yes! The app is already Vercel-ready. Just connect your GitHub repo to Vercel. But you lose control and pay more.

**Q: Do I need a domain?**  
A: No, you can access via IP address. But HTTPS requires a domain (or use self-signed certificates).

**Q: Can I run this locally?**  
A: Yes! Just run `npm run dev` for development or `docker compose up` for production-like environment.

**Q: What if I don't have GitLab?**  
A: Use manual deployment method. It's just as good, just not automated.

**Q: Can I use this with GitHub?**  
A: Yes! The repo is on GitHub. You can use GitHub Actions for CI/CD or deploy manually.

## 🎉 Next Steps

1. **Read DEPLOYMENT_GUIDE.md** - Complete walkthrough
2. **Choose deployment method** - Automated or manual
3. **Set up server** - Hetzner CPX11 recommended
4. **Deploy** - Follow the guide step-by-step
5. **Test** - Upload a workflow and analyze it
6. **Enjoy** - You now have a production-ready web app!

---

## 📞 Support

If you encounter issues:

1. **Check DEPLOYMENT_GUIDE.md** - Troubleshooting section
2. **Review logs** - `docker compose logs -f`
3. **Check GitHub Issues** - https://github.com/synthoria-ai/n8n-workflow-documenter/issues
4. **Ask in n8n Community** - https://community.n8n.io/

---

**Built with ❤️ for the n8n community**

**Support the project**: https://buymeacoffee.com/neverxroaming
