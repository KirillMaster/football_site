# Server Setup Summary - FC Arsenal-92

**Server:** 147.45.229.110
**OS:** Ubuntu 24.04.3 LTS (Noble Numbat)
**Kernel:** 6.8.0-100-generic x86_64
**Date:** 2026-04-12

## Server Specs

- **RAM:** 2 GB (1967 MB total, 4 GB swap)
- **Disk:** 38 GB total (18 GB used, 21 GB available, 47%)

## Installed Software

| Software | Version | Status |
|----------|---------|--------|
| Docker | 28.2.2 | Active (systemctl) |
| Docker Compose | v5.1.2 (plugin) | Installed manually |
| Certbot | 2.9.0 | Installed |
| UFW | 0.36.2 | Active |

## Firewall Rules (UFW)

Default: deny incoming, allow outgoing

| Port | Protocol | Action | Purpose |
|------|----------|--------|---------|
| 22 | TCP | ALLOW | SSH |
| 80 | TCP | ALLOW | HTTP |
| 443 | TCP | ALLOW | HTTPS |

## Users

- **deploy** (uid=1000) - deployment user
  - Groups: deploy, users, docker
  - SSH directory: /home/deploy/.ssh (permissions 700)

## Project Directory

- **Path:** /opt/football-site
- **Owner:** deploy:deploy

## Existing Docker Containers (pre-existing on server)

| Container | Image | Status |
|-----------|-------|--------|
| mtproto | alexbers/mtprotoproxy | Running |
| warp | caomingjun/warp | Running (healthy) |
| amnezia-wg-easy | ghcr.io/yokitoki/awg-easy | Running (healthy) |

## Setup Actions Performed

1. Checked OS and system state (Ubuntu 24.04.3 LTS, 2GB RAM, 38GB disk)
2. Docker was already installed (v28.2.2) - skipped installation
3. Configured UFW firewall (deny incoming, allow 22/80/443)
4. Created `deploy` user with Docker group membership
5. Set up SSH directory for deploy user with proper permissions
6. Installed certbot 2.9.0 for SSL certificate management
7. Created /opt/football-site directory owned by deploy
8. Installed Docker Compose v5.1.2 plugin (manual install - apt package unavailable)
9. Verified all components working (docker hello-world passed)

## Notes

- Docker was installed from Ubuntu repos (not Docker official repo), hence docker-compose-plugin was not available via apt. Installed manually from GitHub releases.
- Server has pre-existing VPN containers (MTProto proxy, Cloudflare WARP, AmneziaWG).
- Cloudflare WARP repo (`pkg.cloudflarewarp.com`) is unreachable in apt sources - consider removing from `/etc/apt/sources.list.d/` if not needed.
- SSH connection to this server is unstable (frequent RST packets) - scripts should use keepalive and auto-reconnect.

## Next Steps

1. Configure DNS to point domain to 147.45.229.110
2. Deploy application to /opt/football-site
3. Set up SSL certificate: `certbot certonly --standalone -d yourdomain.com`
4. Configure nginx reverse proxy or Docker-based web server
5. Set up CI/CD pipeline for automated deployments
6. Add SSH public key to /home/deploy/.ssh/authorized_keys for key-based auth
