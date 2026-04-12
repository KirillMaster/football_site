# Server Setup Summary - FC Arsenal-92

**Server:** 45.10.40.194
**Date:** 2026-04-12 11:17:38 UTC

## Setup Results

| Step | Status | Details |
|------|--------|---------|
| Check OS release | OK | PRETTY_NAME="Ubuntu 24.04.3 LTS" NAME="Ubuntu" VERSION_ID="24.04" VERSION="24.04.3 LTS (Noble Numbat |
| Kernel info | EXCEPTION: [WinError 10054] Удаленный хост принудительно разорвал существующее подключение |  |
| Disk usage | EXCEPTION: SSH session not active |  |
| Memory usage | EXCEPTION: SSH session not active |  |
| Check Docker | EXCEPTION: SSH session not active |  |
| Check Docker Compose | EXCEPTION: SSH session not active |  |
| Check nginx | EXCEPTION: SSH session not active |  |
| Docker installation | SKIPPED (already installed) |  |
| Install UFW | EXCEPTION: SSH session not active |  |
| UFW default deny incoming | EXCEPTION: SSH session not active |  |
| UFW default allow outgoing | EXCEPTION: SSH session not active |  |
| UFW allow SSH (22) | EXCEPTION: SSH session not active |  |
| UFW allow HTTP (80) | EXCEPTION: SSH session not active |  |
| UFW allow HTTPS (443) | EXCEPTION: SSH session not active |  |
| UFW enable | EXCEPTION: SSH session not active |  |
| Check deploy user | EXCEPTION: SSH session not active |  |
| Create deploy user | SKIPPED (already exists) |  |
| Add deploy to docker group | EXCEPTION: SSH session not active |  |
| Create .ssh dir for deploy | EXCEPTION: SSH session not active |  |
| Set .ssh permissions (700) | EXCEPTION: SSH session not active |  |
| Set .ssh ownership | EXCEPTION: SSH session not active |  |
| Install certbot | EXCEPTION: SSH session not active |  |
| Create /opt/football-site | EXCEPTION: SSH session not active |  |
| Set ownership to deploy | EXCEPTION: SSH session not active |  |
| Docker hello-world test | EXCEPTION: SSH session not active |  |
| UFW status | EXCEPTION: SSH session not active |  |
| Docker Compose version | EXCEPTION: SSH session not active |  |
| Certbot version | EXCEPTION: SSH session not active |  |
| Deploy user info | EXCEPTION: SSH session not active |  |
| Project directory listing | EXCEPTION: SSH session not active |  |

## Server Configuration

- **Firewall (UFW):** Enabled - ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
- **Docker:** Installed with Docker Compose plugin
- **Deploy user:** Created with Docker group access
- **SSL:** Certbot installed (certificates to be configured with domain)
- **Project directory:** /opt/football-site (owned by deploy)

## Next Steps

1. Configure DNS to point domain to 45.10.40.194
2. Deploy application to /opt/football-site
3. Set up SSL certificate with certbot
4. Configure nginx reverse proxy or Docker-based web server
5. Set up CI/CD pipeline for automated deployments