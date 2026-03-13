# Remote Administration and SSH (Beginner → Intermediate)

Secure Shell (SSH) is the standard way to log in to remote Linux machines safely over an untrusted network (like the internet). It gives you:

- **Confidentiality** (traffic is encrypted)
- **Integrity** (traffic cannot be silently modified)
- **Authentication** (you can verify the server and prove your identity)

---

## 1) SSH Fundamentals

### What SSH is

SSH is a protocol and toolset for:

- Remote terminal access (`ssh`)
- Secure file copy (`scp`)
- Efficient file sync (`rsync` over SSH)
- Port forwarding/tunneling

### Common components

- **SSH client**: your local machine (`ssh`, `scp`, `sftp`)
- **SSH server**: remote service (`sshd`)
- **Default port**: `22/tcp`

### Basic login syntax

```bash
ssh username@server-ip
ssh username@example.com
ssh -p 2222 username@example.com   # custom port
```

First connection usually shows a host fingerprint prompt. Verify it out-of-band if possible before typing `yes`.

---

## 2) SSH Trust Model and Connection Flow

```mermaid
flowchart LR
    A[Local User / SSH Client] -->|1. Connect to host:22| B[Remote SSH Server]
    B -->|2. Sends host public key| A
    A -->|3. Verify host fingerprint (known_hosts)| A
    A -->|4. Prove identity (private key or password)| B
    B -->|5. Authorize user (authorized_keys / policy)| C[Remote Account]
    C -->|6. Encrypted shell/session established| A
```

Key idea: client trusts server identity via **host keys**, server trusts user identity via **user authentication**.

---

## 3) Key-Based Authentication (Recommended)

Password login works, but SSH keys are safer and easier to automate.

### Generate a key pair

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

- Private key: `~/.ssh/id_ed25519` (keep secret)
- Public key: `~/.ssh/id_ed25519.pub` (share with servers)

Use a **passphrase** when prompted.

### Copy public key to server

```bash
ssh-copy-id username@example.com
```

Manual method:

```bash
cat ~/.ssh/id_ed25519.pub
# paste into remote ~/.ssh/authorized_keys
```

### Test login

```bash
ssh username@example.com
```

### Permission requirements (important)

On remote server:

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

On local machine:

```bash
chmod 600 ~/.ssh/id_ed25519
```

If permissions are too open, SSH may reject key auth.

---

## 4) SSH Client Config Basics (`~/.ssh/config`)

Use aliases and defaults so commands are shorter and less error-prone.

```sshconfig
Host prod-web
    HostName 203.0.113.10
    User deploy
    Port 22
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    ServerAliveInterval 30
    ServerAliveCountMax 3
```

Now you can use:

```bash
ssh prod-web
scp backup.tar.gz prod-web:/tmp/
rsync -avz ./app/ prod-web:/var/www/app/
```

Useful options:

- `Host` = alias
- `HostName` = actual IP/DNS
- `User` = default username
- `IdentityFile` = key path
- `Port` = SSH port
- `IdentitiesOnly yes` = use only specified keys

---

## 5) Secure Copy and Sync: `scp` and `rsync`

### `scp` (simple copy)

Copy local → remote:

```bash
scp ./notes.txt user@host:/home/user/
```

Copy remote → local:

```bash
scp user@host:/var/log/auth.log ./auth.log
```

Recursive directory copy:

```bash
scp -r ./project user@host:/opt/
```

### `rsync` (faster, incremental sync)

```bash
rsync -avz ./project/ user@host:/opt/project/
```

- `-a` archive mode (preserve metadata)
- `-v` verbose
- `-z` compression

Delete remote files not present locally (be careful):

```bash
rsync -avz --delete ./project/ user@host:/opt/project/
```

Dry run first:

```bash
rsync -avzn --delete ./project/ user@host:/opt/project/
```

---

## 6) Remote Command Execution

Run one command:

```bash
ssh user@host "uname -a"
```

Run multiple commands safely:

```bash
ssh user@host "cd /var/www/app && git pull && sudo systemctl restart app"
```

Run local script remotely:

```bash
ssh user@host 'bash -s' < deploy.sh
```

Collect logs quickly:

```bash
ssh user@host "journalctl -u nginx -n 50 --no-pager"
```

Tip: quote commands carefully to avoid unexpected shell expansion.

---

## 7) Safe Remote Administration Habits

- Prefer **non-root login**, then escalate with `sudo`
- Use **key-based auth**, avoid password auth where possible
- Verify host fingerprints before first trust
- Keep software updated (`openssh-client`, `openssh-server`)
- Use least privilege: separate accounts per admin
- Use `tmux` or `screen` for long-running remote tasks
- Log admin actions and monitor `/var/log/auth.log` (or equivalent)
- Back up SSH configs before major changes
- Keep an existing session open while testing new SSH settings

Example safe workflow before SSH server changes:

```bash
# Session 1 (keep open)
ssh admin@server

# Session 2 (test)
ssh admin@server "sudo sshd -t"   # validate config syntax
ssh -o PreferredAuthentications=publickey admin@server "echo key-auth-ok"
```

If config test fails, do not restart `sshd` until fixed.

---

## 8) SSH Hardening Checklist (Server Side)

In `/etc/ssh/sshd_config` (values depend on your environment):

- [ ] `PermitRootLogin no`
- [ ] `PasswordAuthentication no` (after confirming key auth works)
- [ ] `PubkeyAuthentication yes`
- [ ] `ChallengeResponseAuthentication no` (if not needed)
- [ ] `UsePAM yes` (typically keep enabled on many distros)
- [ ] `X11Forwarding no` (unless needed)
- [ ] `AllowUsers user1 user2` or `AllowGroups sshadmins`
- [ ] `MaxAuthTries 3`
- [ ] `ClientAliveInterval 300`
- [ ] `ClientAliveCountMax 2`
- [ ] `LoginGraceTime 30`
- [ ] `Protocol 2` (modern OpenSSH defaults already use v2)
- [ ] Strong ciphers/MACs/KEX (usually modern defaults are fine)

After changes:

```bash
sudo sshd -t
sudo systemctl reload sshd   # or: sudo systemctl reload ssh
```

Also consider:

- Firewall allow only required SSH sources
- Fail2ban or equivalent rate-limiting/protection
- MFA for SSH in sensitive environments

---

## 9) Quick Command Reference

```bash
# Connect
ssh user@host

# Connect with specific key
ssh -i ~/.ssh/id_ed25519 user@host

# Custom port
ssh -p 2222 user@host

# Copy file to remote
scp file.txt user@host:/tmp/

# Sync directory
rsync -avz ./dir/ user@host:/srv/dir/

# Execute remote command
ssh user@host "df -h"
```

Use SSH deliberately: verify identity, authenticate strongly, minimize privileges, and test changes safely.
