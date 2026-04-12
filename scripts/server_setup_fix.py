"""
Fix-up script for FC Arsenal-92 server setup.
Addresses:
1. Create deploy user (was missed due to connection drop)
2. Install docker-compose-plugin (missing on server)
3. Re-verify everything
"""
import paramiko
import time
import sys
import os
import socket

HOST = "45.10.40.194"
USER = "root"
PASSWORD = "emJkYbtCzY@+i4"

results = []


def create_connection():
    """Create a fresh SSH connection with keepalive."""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(
        HOST,
        username=USER,
        password=PASSWORD,
        timeout=15,
        banner_timeout=15,
        auth_timeout=15,
        allow_agent=False,
        look_for_keys=False,
    )
    transport = ssh.get_transport()
    if transport:
        transport.set_keepalive(10)
    return ssh


def run_command(ssh_holder, command, timeout=30, label=None):
    """Run a command via SSH with auto-reconnect."""
    display = label or command
    print(f"\n{'='*60}")
    print(f"[CMD] {display}")
    print(f"{'='*60}")

    max_retries = 3
    for attempt in range(max_retries):
        try:
            ssh = ssh_holder[0]
            transport = ssh.get_transport()
            if transport is None or not transport.is_active():
                raise paramiko.SSHException("Transport not active")

            stdin, stdout, stderr = ssh.exec_command(command, timeout=timeout)
            exit_code = stdout.channel.recv_exit_status()
            out = stdout.read().decode("utf-8", errors="replace").strip()
            err = stderr.read().decode("utf-8", errors="replace").strip()

            if out:
                print(f"[OUT]\n{out}")
            if err:
                print(f"[ERR]\n{err}")
            print(f"[EXIT] {exit_code}")

            status = "OK" if exit_code == 0 else f"FAIL (exit {exit_code})"
            results.append((display, status, out[:200] if out else err[:200] if err else ""))
            return exit_code, out, err

        except (paramiko.SSHException, socket.error, OSError, EOFError) as e:
            print(f"[RETRY {attempt+1}/{max_retries}] Connection issue: {e}")
            try:
                ssh_holder[0].close()
            except Exception:
                pass
            time.sleep(2)
            try:
                ssh_holder[0] = create_connection()
                print("[RECONNECTED]")
            except Exception as reconn_err:
                print(f"[RECONNECT FAILED] {reconn_err}")
                if attempt == max_retries - 1:
                    results.append((display, f"FAILED after {max_retries} retries: {e}", ""))
                    return -1, "", str(e)

    return -1, "", "Max retries exceeded"


def main():
    print(f"Connecting to {HOST} as {USER}...")
    try:
        ssh = create_connection()
    except Exception as e:
        print(f"Failed to connect: {e}")
        sys.exit(1)
    print("Connected successfully!\n")
    ssh_holder = [ssh]

    # ============================================================
    # FIX 1: CREATE DEPLOY USER
    # ============================================================
    print("#"*60)
    print("# FIX 1: CREATE DEPLOY USER")
    print("#"*60)

    exit_code, user_check, _ = run_command(ssh_holder, "id deploy 2>&1", label="Check if deploy user exists")

    if exit_code != 0:
        print("\nDeploy user does not exist. Creating...")
        run_command(ssh_holder, 'adduser --disabled-password --gecos "" deploy', label="Create deploy user")
    else:
        print(f"\nDeploy user already exists: {user_check}")

    run_command(ssh_holder, "usermod -aG docker deploy", label="Add deploy to docker group")
    run_command(ssh_holder, "mkdir -p /home/deploy/.ssh", label="Create .ssh dir")
    run_command(ssh_holder, "chmod 700 /home/deploy/.ssh", label="Set .ssh permissions")
    run_command(ssh_holder, "chown -R deploy:deploy /home/deploy/.ssh", label="Set .ssh ownership")

    # ============================================================
    # FIX 2: INSTALL DOCKER COMPOSE PLUGIN
    # ============================================================
    print("\n" + "#"*60)
    print("# FIX 2: INSTALL DOCKER COMPOSE PLUGIN")
    print("#"*60)

    # Check if docker compose works
    exit_code, _, _ = run_command(ssh_holder, "docker compose version 2>&1", label="Check docker compose")

    if exit_code != 0:
        print("\nDocker Compose plugin not found. Installing...")
        run_command(ssh_holder, "apt-get update", timeout=120, label="apt-get update")
        run_command(ssh_holder,
            "apt-get install -y docker-compose-plugin",
            timeout=120,
            label="Install docker-compose-plugin")

        # If apt package doesn't work, try manual install
        exit_code2, _, _ = run_command(ssh_holder, "docker compose version 2>&1", label="Verify docker compose after apt")
        if exit_code2 != 0:
            print("\napt package didn't work, trying manual installation...")
            run_command(ssh_holder,
                'COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep tag_name | cut -d \'"\' -f 4) && '
                'mkdir -p /usr/local/lib/docker/cli-plugins && '
                'curl -SL "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-linux-x86_64" -o /usr/local/lib/docker/cli-plugins/docker-compose && '
                'chmod +x /usr/local/lib/docker/cli-plugins/docker-compose',
                timeout=60,
                label="Install Docker Compose manually")
    else:
        print("\nDocker Compose plugin already installed.")

    # ============================================================
    # FIX 3: SET PROJECT DIRECTORY OWNERSHIP
    # ============================================================
    print("\n" + "#"*60)
    print("# FIX 3: SET PROJECT DIRECTORY OWNERSHIP")
    print("#"*60)

    run_command(ssh_holder, "chown deploy:deploy /opt/football-site", label="Set /opt/football-site ownership to deploy")

    # ============================================================
    # FINAL VERIFICATION
    # ============================================================
    print("\n" + "#"*60)
    print("# FINAL VERIFICATION")
    print("#"*60)

    run_command(ssh_holder, "docker --version", label="Docker version")
    run_command(ssh_holder, "docker compose version", label="Docker Compose version")
    run_command(ssh_holder, "ufw status verbose", label="UFW status")
    run_command(ssh_holder, "certbot --version 2>&1", label="Certbot version")
    run_command(ssh_holder, "id deploy", label="Deploy user info")
    run_command(ssh_holder, "groups deploy", label="Deploy user groups")
    run_command(ssh_holder, "ls -la /opt/football-site", label="Project directory")
    run_command(ssh_holder, "ls -la /home/deploy/.ssh", label="Deploy .ssh dir")
    run_command(ssh_holder, "docker ps -a", label="Docker containers")
    run_command(ssh_holder, "systemctl is-active docker", label="Docker service status")

    try:
        ssh_holder[0].close()
    except Exception:
        pass
    print("\n\nSSH connection closed.")

    # ============================================================
    # UPDATE SUMMARY FILE
    # ============================================================
    print("\n" + "#"*60)
    print("# RESULTS")
    print("#"*60)

    summary_lines = []
    summary_lines.append("# Server Setup Summary - FC Arsenal-92")
    summary_lines.append("")
    summary_lines.append(f"**Server:** {HOST}")
    summary_lines.append(f"**OS:** Ubuntu 24.04.3 LTS (Noble Numbat)")
    summary_lines.append(f"**Kernel:** 6.8.0-100-generic x86_64")
    summary_lines.append(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    summary_lines.append("")
    summary_lines.append("## Server Specs")
    summary_lines.append("")
    summary_lines.append("- **RAM:** 2 GB (1967 MB total)")
    summary_lines.append("- **Disk:** 38 GB (18 GB used, 21 GB available, 47%)")
    summary_lines.append("- **Swap:** 4 GB")
    summary_lines.append("")
    summary_lines.append("## Setup Results")
    summary_lines.append("")
    summary_lines.append("| Step | Status | Details |")
    summary_lines.append("|------|--------|---------|")

    for cmd, status, detail in results:
        detail_clean = detail.replace("|", "\\|").replace("\n", " ")[:100]
        summary_lines.append(f"| {cmd} | {status} | {detail_clean} |")

    summary_lines.append("")
    summary_lines.append("## Installed Software")
    summary_lines.append("")
    summary_lines.append("- **Docker:** 28.2.2")
    summary_lines.append("- **Docker Compose:** plugin (via docker compose)")
    summary_lines.append("- **Certbot:** 2.9.0")
    summary_lines.append("- **UFW:** 0.36.2")
    summary_lines.append("")
    summary_lines.append("## Firewall Rules (UFW)")
    summary_lines.append("")
    summary_lines.append("| Port | Protocol | Action | Purpose |")
    summary_lines.append("|------|----------|--------|---------|")
    summary_lines.append("| 22 | TCP | ALLOW | SSH |")
    summary_lines.append("| 80 | TCP | ALLOW | HTTP |")
    summary_lines.append("| 443 | TCP | ALLOW | HTTPS |")
    summary_lines.append("")
    summary_lines.append("## Users")
    summary_lines.append("")
    summary_lines.append("- **deploy** - deployment user with Docker group access")
    summary_lines.append("  - SSH directory: /home/deploy/.ssh (700)")
    summary_lines.append("")
    summary_lines.append("## Project Directory")
    summary_lines.append("")
    summary_lines.append("- **Path:** /opt/football-site")
    summary_lines.append("- **Owner:** deploy:deploy")
    summary_lines.append("")
    summary_lines.append("## Next Steps")
    summary_lines.append("")
    summary_lines.append("1. Configure DNS to point domain to " + HOST)
    summary_lines.append("2. Deploy application to /opt/football-site")
    summary_lines.append("3. Set up SSL certificate: `certbot certonly --standalone -d yourdomain.com`")
    summary_lines.append("4. Configure nginx reverse proxy or Docker-based web server")
    summary_lines.append("5. Set up CI/CD pipeline for automated deployments")
    summary_lines.append("6. Add SSH public key to /home/deploy/.ssh/authorized_keys for key-based auth")

    summary_text = "\n".join(summary_lines)

    docs_dir = r"C:\pet\football_site\docs"
    os.makedirs(docs_dir, exist_ok=True)
    summary_path = os.path.join(docs_dir, "SERVER_SETUP.md")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_text)

    print(f"\nSummary written to {summary_path}")
    print("\n" + summary_text)


if __name__ == "__main__":
    main()
