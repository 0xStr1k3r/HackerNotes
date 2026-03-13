# Security Hardening: Firewall, SELinux, Updates, and Operational Discipline

Security hardening is not one setting or one tool. It is **defense-in-depth**: multiple independent controls that reduce risk when one control fails.

## 1) Defense-in-Depth (Why Layers Matter)

A practical Linux host usually has several layers:

- **Network layer**: firewall rules limit reachable ports.
- **System layer**: least privilege, strong auth, service minimization.
- **Mandatory access control**: SELinux confines process behavior.
- **Maintenance layer**: timely updates reduce known vulnerabilities.
- **Recovery layer**: tested backups reduce impact of compromise or failure.
- **Operations layer**: routine checks detect drift, misconfigurations, and abuse.

If an attacker reaches a host, firewall + SELinux + patching + monitoring still constrain blast radius.

```mermaid
flowchart LR
    A[Untrusted Network] --> B[Host Firewall\n(firewalld/ufw)]
    B --> C[Listening Service\n(nginx/sshd/app)]
    C --> D[SELinux Policy\n(type enforcement)]
    D --> E[Files/Ports/Processes]
    F[Patch & Update Hygiene] --> C
    G[Backups & Restore Tests] --> E
    H[Ops Hardening Checks] --> B
    H --> D
    H --> F
```

## 2) Firewall Basics (firewalld and ufw Concepts)

A host firewall should default to deny inbound traffic except required services.

### Core Concepts

- **Default policy**: deny incoming, allow established/related, allow necessary egress.
- **Allow-listing**: open only required ports/services (e.g., 22, 80, 443).
- **Segmentation mindset**: management ports restricted by source IP when possible.
- **Persistence**: runtime changes should be made permanent intentionally.

### firewalld (RHEL/Fedora/CentOS family)

Common concepts:
- **Zones** (public, internal, dmz, trusted)
- **Services** (named presets: ssh, http, https)
- **Runtime vs permanent config**

Practical commands:

```bash
# Check state and active zones
sudo firewall-cmd --state
sudo firewall-cmd --get-active-zones

# List effective rules in active/default zone
sudo firewall-cmd --list-all

# Allow only required services (example)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https

# Remove something no longer needed
sudo firewall-cmd --permanent --remove-service=ftp

# Apply permanent changes
sudo firewall-cmd --reload

# Verify permanent config
sudo firewall-cmd --permanent --list-all
```

### ufw (Debian/Ubuntu family)

Common concepts:
- Simpler front-end to netfilter.
- Policy first, then explicit allow rules.

Practical commands:

```bash
# Baseline policy
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow required services
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable and verify
sudo ufw enable
sudo ufw status verbose

# Remove stale rule example
sudo ufw delete allow 21/tcp
```

### Firewall Verification

```bash
# Confirm what is actually listening
sudo ss -tulpen

# Optionally validate from another host (replace TARGET)
nc -zv TARGET 22 80 443
```

If a port is listening but not needed, stop/disable that service instead of only relying on firewall rules.

## 3) SELinux Fundamentals

SELinux is a mandatory access control (MAC) system. It enforces policy even when UNIX permissions look permissive.

### Key ideas

- **Mode**:
  - `Enforcing`: blocks and logs policy violations.
  - `Permissive`: logs violations, does not block.
  - `Disabled`: SELinux off (generally avoid).
- **Context labels**: users, roles, types, levels (focus mostly on type enforcement).
- **Type enforcement**: process types can only access allowed object types.

### Essential commands

```bash
# Check SELinux mode and policy
getenforce
sestatus

# View file contexts
ls -Z /var/www/html

# View process contexts
ps -eZ | head

# Restore expected labels recursively
sudo restorecon -Rv /var/www/html
```

### Common operational flow

1. Keep SELinux in **Enforcing**.
2. When something fails, inspect audit logs first.
3. Fix labeling/booleans/policy correctly rather than disabling SELinux.

Useful troubleshooting commands:

```bash
# Recent AVC denials (RHEL family path)
sudo ausearch -m AVC,USER_AVC -ts recent

# Human-readable recommendations (if setroubleshoot tools installed)
sudo sealert -a /var/log/audit/audit.log

# Check/manage booleans
getsebool -a | grep httpd
sudo setsebool -P httpd_can_network_connect on
```

## 4) Update and Patch Hygiene

Unpatched systems are one of the most common compromise paths.

### Practices

- Patch on a predictable cadence (e.g., weekly) plus emergency updates for critical CVEs.
- Prioritize internet-facing hosts and privilege boundary components.
- Reboot when kernel/glibc/systemd updates require it.
- Keep package sources trusted and minimal.
- Track what changed (change log + package history).

### Commands by ecosystem

```bash
# Debian/Ubuntu
sudo apt update
sudo apt list --upgradable
sudo apt upgrade -y
sudo unattended-upgrades --dry-run --debug

# RHEL/Fedora/CentOS (dnf)
sudo dnf check-update
sudo dnf upgrade -y
sudo dnf updateinfo list security

# Reboot-required indicator (Debian/Ubuntu)
[ -f /var/run/reboot-required ] && echo "Reboot required"
```

## 5) Backup Discipline

Backups are part of security (ransomware, operator error, corruption, compromise recovery).

### Minimum standard

- Follow **3-2-1** principle:
  - 3 copies of data
  - 2 different media/storage types
  - 1 offsite/offline/immutable copy
- Encrypt sensitive backups.
- Retention policy aligned to business/recovery requirements.
- Test restores on schedule (backup success alone is insufficient).

### Practical examples

```bash
# Example: create compressed backup of critical config and app data
sudo tar -czf /backup/host-$(date +%F).tar.gz /etc /var/www /home

# Example: verify archive integrity
sudo tar -tzf /backup/host-$(date +%F).tar.gz | head

# Example: rsync to remote backup host
rsync -aHAX --delete /etc /var/www backupuser@backup-host:/srv/backups/$(hostname)/
```

### Restore validation (must-do)

- Perform periodic file-level and full-service restore drills.
- Measure RTO/RPO and document recovery steps.
- Verify permissions/contexts after restore (including SELinux labels).

## 6) Common Ops Hardening Checks

Run these regularly (daily/weekly depending on criticality):

```bash
# Identity and privilege
sudo getent passwd | wc -l
sudo awk -F: '($3 == 0) {print $1}' /etc/passwd
sudo grep -R "^PermitRootLogin" /etc/ssh/sshd_config /etc/ssh/sshd_config.d 2>/dev/null
sudo grep -R "^PasswordAuthentication" /etc/ssh/sshd_config /etc/ssh/sshd_config.d 2>/dev/null

# Services and exposure
systemctl list-unit-files --type=service --state=enabled
sudo ss -tulpen

# Firewall status
sudo firewall-cmd --state 2>/dev/null || true
sudo ufw status verbose 2>/dev/null || true

# SELinux status
getenforce 2>/dev/null || true
sestatus 2>/dev/null || true

# Patch level
uname -r
cat /etc/os-release

# Recent auth/security signals
sudo journalctl -p warning -S -24h
sudo last -a | head
```

## 7) Verification Checklist (Quick Audit)

Use this checklist after hardening and during routine audits:

- [ ] Only required ports are reachable externally.
- [ ] Firewall default inbound policy is deny/reject.
- [ ] No unnecessary services are enabled or listening.
- [ ] SELinux is **Enforcing** on production hosts.
- [ ] SELinux denials are reviewed and remediated correctly (not bypassed).
- [ ] System packages are current; security updates are applied quickly.
- [ ] Reboot-required updates are tracked and completed.
- [ ] Backups are recent, encrypted where required, and offsite/offline coverage exists.
- [ ] Restore drills are performed and documented.
- [ ] SSH hardening is enforced (no root login, strong auth policy).
- [ ] Logs are reviewed and alerting is in place for critical events.

## Final Reminder

Hardening is a lifecycle, not a one-time setup. Keep configurations minimal, review drift continuously, and validate controls with periodic testing.
