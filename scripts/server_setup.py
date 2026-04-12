"""
Server setup script for FC Arsenal-92 football site.
Connects via paramiko and configures the production server.
Uses auto-reconnect and keepalive to handle unstable connections.
"""
import paramiko
import time
import sys
import os
import socket

HOST = "147.45.229.110"
USER = "root"
PASSWORD = "emJkYbtCzY@+i4"

# Results collector for summary
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
    # Enable keepalive every 10 seconds
    transport = ssh.get_transport()
    if transport:
        transport.set_keepalive(10)
    return ssh


def run_command(ssh_holder, command, timeout=30, label=None):
    """Run a command via SSH with auto-reconnect. ssh_holder is a list [ssh] so we can replace it."""
    display = label or command
    print(f"\n{'='*60}")
    print(f"[CMD] {display}")
    print(f"{'='*60}")

    max_retries = 3
    for attempt in range(max_retries):
        try:
            ssh = ssh_holder[0]
            # Check if transport is alive
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
            # Close old connection
            try:
                ssh_holder[0].close()
            except Exception:
                pass
            # Wait before reconnecting
            time.sleep(2)
            try:
                ssh_holder[0] = create_connection()
                print("[RECONNECTED]")
            except Exception as reconn_err:
                print(f"[RECONNECT FAILED] {reconn_err}")
                if attempt == max_retries - 1:
                    print(f"[GIVING UP] {display}")
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

    # Wrap in list for mutability in reconnect
    ssh_holder = [ssh]

    # ============================================================
    # 1. CHECK OS AND CURRENT STATE
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 1: CHECK OS AND CURRENT STATE")
    print("#"*60)

    run_command(ssh_holder, "cat /etc/os-release", label="Check OS release")
    run_command(ssh_holder, "uname -a", label="Kernel info")
    run_command(ssh_holder, "df -h", label="Disk usage")
    run_command(ssh_holder, "free -m", label="Memory usage")

    _, docker_out, _ = run_command(ssh_holder, "docker --version 2>/dev/null || echo 'NOT_INSTALLED'", label="Check Docker")
    docker_installed = "NOT_INSTALLED" not in docker_out and docker_out != ""

    _, compose_out, _ = run_command(ssh_holder, "docker compose version 2>/dev/null || echo 'NOT_INSTALLED'", label="Check Docker Compose")
    run_command(ssh_holder, "nginx -v 2>&1 || echo 'NOT_INSTALLED'", label="Check nginx")

    # ============================================================
    # 2. INSTALL DOCKER (IF NOT INSTALLED)
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 2: INSTALL DOCKER")
    print("#"*60)

    if docker_installed:
        print("\nDocker is already installed, skipping installation.")
        results.append(("Docker installation", "SKIPPED (already installed)", docker_out))
    else:
        print("\nDocker not found. Installing...")

        run_command(ssh_holder, "apt-get update", timeout=120, label="apt-get update")

        run_command(ssh_holder,
            "apt-get install -y ca-certificates curl gnupg",
            timeout=120,
            label="Install prerequisites")

        run_command(ssh_holder,
            "install -m 0755 -d /etc/apt/keyrings",
            timeout=30,
            label="Create keyrings dir")

        # Detect OS for correct Docker repo
        _, os_id, _ = run_command(ssh_holder, ". /etc/os-release && echo $ID", label="Detect OS ID")
        os_id = os_id.strip().lower() if os_id else "ubuntu"

        if os_id == "ubuntu":
            docker_gpg_url = "https://download.docker.com/linux/ubuntu/gpg"
            docker_repo_base = "https://download.docker.com/linux/ubuntu"
        elif os_id == "debian":
            docker_gpg_url = "https://download.docker.com/linux/debian/gpg"
            docker_repo_base = "https://download.docker.com/linux/debian"
        else:
            docker_gpg_url = "https://download.docker.com/linux/debian/gpg"
            docker_repo_base = "https://download.docker.com/linux/debian"

        run_command(ssh_holder,
            f'curl -fsSL {docker_gpg_url} | gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes',
            timeout=30,
            label="Add Docker GPG key")

        run_command(ssh_holder,
            "chmod a+r /etc/apt/keyrings/docker.gpg",
            label="Set GPG key permissions")

        _, codename, _ = run_command(ssh_holder, ". /etc/os-release && echo $VERSION_CODENAME", label="Get OS codename")
        codename = codename.strip() if codename else "noble"

        run_command(ssh_holder,
            f'echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] {docker_repo_base} {codename} stable" > /etc/apt/sources.list.d/docker.list',
            label="Add Docker repository")

        run_command(ssh_holder, "apt-get update", timeout=120, label="apt-get update (post-repo)")

        run_command(ssh_holder,
            "apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin",
            timeout=180,
            label="Install Docker packages")

        run_command(ssh_holder,
            "systemctl enable docker && systemctl start docker",
            timeout=30,
            label="Enable and start Docker")

    # ============================================================
    # 3. CONFIGURE FIREWALL (UFW)
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 3: CONFIGURE FIREWALL (UFW)")
    print("#"*60)

    run_command(ssh_holder, "apt-get install -y ufw", timeout=120, label="Install UFW")
    run_command(ssh_holder, "ufw default deny incoming", label="UFW default deny incoming")
    run_command(ssh_holder, "ufw default allow outgoing", label="UFW default allow outgoing")
    run_command(ssh_holder, "ufw allow 22/tcp", label="UFW allow SSH (22)")
    run_command(ssh_holder, "ufw allow 80/tcp", label="UFW allow HTTP (80)")
    run_command(ssh_holder, "ufw allow 443/tcp", label="UFW allow HTTPS (443)")
    run_command(ssh_holder, "ufw --force enable", label="UFW enable")

    # ============================================================
    # 4. CREATE DEPLOY USER
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 4: CREATE DEPLOY USER")
    print("#"*60)

    _, user_check, _ = run_command(ssh_holder, "id deploy 2>/dev/null && echo 'EXISTS' || echo 'NOT_EXISTS'", label="Check deploy user")

    if "NOT_EXISTS" in user_check:
        run_command(ssh_holder, 'adduser --disabled-password --gecos "" deploy', label="Create deploy user")
    else:
        print("Deploy user already exists, skipping creation.")
        results.append(("Create deploy user", "SKIPPED (already exists)", ""))

    run_command(ssh_holder, "usermod -aG docker deploy", label="Add deploy to docker group")
    run_command(ssh_holder, "mkdir -p /home/deploy/.ssh", label="Create .ssh dir for deploy")
    run_command(ssh_holder, "chmod 700 /home/deploy/.ssh", label="Set .ssh permissions (700)")
    run_command(ssh_holder, "chown -R deploy:deploy /home/deploy/.ssh", label="Set .ssh ownership")

    # ============================================================
    # 5. INSTALL CERTBOT FOR SSL
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 5: INSTALL CERTBOT")
    print("#"*60)

    run_command(ssh_holder, "apt-get install -y certbot", timeout=120, label="Install certbot")

    # ============================================================
    # 6. CREATE PROJECT DIRECTORY
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 6: CREATE PROJECT DIRECTORY")
    print("#"*60)

    run_command(ssh_holder, "mkdir -p /opt/football-site", label="Create /opt/football-site")
    run_command(ssh_holder, "chown deploy:deploy /opt/football-site", label="Set ownership to deploy")

    # ============================================================
    # 7. VERIFY EVERYTHING WORKS
    # ============================================================
    print("\n" + "#"*60)
    print("# PHASE 7: VERIFICATION")
    print("#"*60)

    run_command(ssh_holder, "docker run hello-world", timeout=60, label="Docker hello-world test")
    run_command(ssh_holder, "ufw status", label="UFW status")
    run_command(ssh_holder, "docker compose version", label="Docker Compose version")
    run_command(ssh_holder, "certbot --version 2>&1", label="Certbot version")
    run_command(ssh_holder, "id deploy", label="Deploy user info")
    run_command(ssh_holder, "ls -la /opt/football-site", label="Project directory listing")

    try:
        ssh_holder[0].close()
    except Exception:
        pass
    print("\n\nSSH connection closed.")

    # ============================================================
    # GENERATE SUMMARY
    # ============================================================
    print("\n" + "#"*60)
    print("# SUMMARY")
    print("#"*60)

    summary_lines = []
    summary_lines.append("# Server Setup Summary - FC Arsenal-92")
    summary_lines.append("")
    summary_lines.append(f"**Server:** {HOST}")
    summary_lines.append(f"**Date:** {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}")
    summary_lines.append("")
    summary_lines.append("## Setup Results")
    summary_lines.append("")
    summary_lines.append("| Step | Status | Details |")
    summary_lines.append("|------|--------|---------|")

    for cmd, status, detail in results:
        detail_clean = detail.replace("|", "\\|").replace("\n", " ")[:100]
        summary_lines.append(f"| {cmd} | {status} | {detail_clean} |")

    summary_lines.append("")
    summary_lines.append("## Server Configuration")
    summary_lines.append("")
    summary_lines.append("- **Firewall (UFW):** Enabled - ports 22 (SSH), 80 (HTTP), 443 (HTTPS)")
    summary_lines.append("- **Docker:** Installed with Docker Compose plugin")
    summary_lines.append("- **Deploy user:** Created with Docker group access")
    summary_lines.append("- **SSL:** Certbot installed (certificates to be configured with domain)")
    summary_lines.append("- **Project directory:** /opt/football-site (owned by deploy)")
    summary_lines.append("")
    summary_lines.append("## Next Steps")
    summary_lines.append("")
    summary_lines.append("1. Configure DNS to point domain to " + HOST)
    summary_lines.append("2. Deploy application to /opt/football-site")
    summary_lines.append("3. Set up SSL certificate with certbot")
    summary_lines.append("4. Configure nginx reverse proxy or Docker-based web server")
    summary_lines.append("5. Set up CI/CD pipeline for automated deployments")

    summary_text = "\n".join(summary_lines)

    # Write summary file
    docs_dir = r"C:\pet\football_site\docs"
    os.makedirs(docs_dir, exist_ok=True)
    summary_path = os.path.join(docs_dir, "SERVER_SETUP.md")
    with open(summary_path, "w", encoding="utf-8") as f:
        f.write(summary_text)

    print(f"\nSummary written to {summary_path}")
    print("\n" + summary_text)


if __name__ == "__main__":
    main()
