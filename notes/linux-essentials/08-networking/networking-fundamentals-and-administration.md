# Networking Fundamentals and Administration (Linux Essentials)

This note gives you a practical, beginner-friendly overview of Linux networking: how traffic moves, how addressing works, how to inspect interfaces/routes, how DNS fits in, and how to troubleshoot common issues.

---

## 1) OSI vs TCP/IP: How the Models Map

You will usually hear two models:

- **OSI (7 layers)**: teaching model
- **TCP/IP (4 layers)**: practical Internet model

| OSI Layer | Name | TCP/IP Layer | Common Examples |
|---|---|---|---|
| 7 | Application | Application | HTTP, HTTPS, DNS, SSH |
| 6 | Presentation | Application | TLS encryption, encoding |
| 5 | Session | Application | Session setup/teardown |
| 4 | Transport | Transport | TCP, UDP |
| 3 | Network | Internet | IPv4, IPv6, ICMP |
| 2 | Data Link | Link / Network Access | Ethernet, Wi-Fi, ARP |
| 1 | Physical | Link / Network Access | Cable, radio, electrical signals |

### Quick mental model
- **Application** = what users/services care about (web, DNS, SSH)
- **Transport** = delivery style (reliable TCP vs fast UDP)
- **Internet/Network** = addressing and routing (IP)
- **Link/Physical** = local hop movement over NIC/switch/Wi-Fi

---

## 2) IP and Subnet Basics

### IPv4 essentials
- IPv4 address = **32 bits** (example: `192.168.1.10`)
- Written as four octets (`0-255`)
- Subnet mask often shown as **CIDR** (`/24`, `/26`, etc.)

`192.168.1.10/24` means:
- First 24 bits = network part
- Last 8 bits = host part

### Useful terms
- **Network address**: first IP in subnet (host bits all 0)
- **Broadcast address**: last IP in subnet (host bits all 1, IPv4)
- **Usable hosts**: addresses between network and broadcast

### Beginner subnet tips (remember these)
1. **Hosts per subnet** = `2^(host_bits) - 2` (for classic IPv4 subnets)
2. **host_bits** = `32 - CIDR`
3. Each step from `/24 -> /25 -> /26` halves host capacity.
4. “Block size” in last changing octet = `256 - mask_octet`.

| CIDR | Mask | Host bits | Usable hosts |
|---|---|---:|---:|
| /24 | 255.255.255.0 | 8 | 254 |
| /25 | 255.255.255.128 | 7 | 126 |
| /26 | 255.255.255.192 | 6 | 62 |
| /27 | 255.255.255.224 | 5 | 30 |
| /28 | 255.255.255.240 | 4 | 14 |

### Example: `10.20.30.77/26`
- `/26` mask = `255.255.255.192`
- Block size in last octet = `256 - 192 = 64`
- Subnet ranges: `0-63`, `64-127`, `128-191`, `192-255`
- `77` falls in `64-127`
- Network = `10.20.30.64`
- Broadcast = `10.20.30.127`
- Usable = `10.20.30.65 - 10.20.30.126`

### Special IPv4 ranges you should know
- Private ranges (not routed on public Internet):
  - `10.0.0.0/8`
  - `172.16.0.0/12`
  - `192.168.0.0/16`
- Loopback: `127.0.0.0/8` (`127.0.0.1` commonly used)
- Link-local (APIPA): `169.254.0.0/16`

### IPv6 (quick intro)
- 128-bit addresses (example: `2001:db8::10`)
- No broadcast (uses multicast instead)
- Link-local starts with `fe80::/10`

---

## 3) Interfaces and Routes in Linux

### Interface basics
Network interfaces are your host’s network endpoints (Ethernet, Wi-Fi, virtual NICs).

Common checks:

```bash
ip -br link          # up/down state of interfaces
ip -br addr          # IP addresses on interfaces
ip addr show eth0    # detailed info for one interface
```

Typical interface names:
- `lo` (loopback)
- `enp0s3`, `ens33` (Ethernet)
- `wlp2s0` (Wi-Fi)

### Route basics
Routes decide where packets go.

```bash
ip route
ip route get 8.8.8.8
```

Important route concepts:
- **Default route** (`default via X.X.X.X`) = where unknown destinations are sent
- **Connected route** = subnet directly attached to an interface
- **Metric** = preference (lower is usually preferred)

Example:

```text
default via 192.168.1.1 dev enp0s3 proto dhcp metric 100
192.168.1.0/24 dev enp0s3 proto kernel scope link src 192.168.1.50
```

Interpretation:
- Local LAN traffic (`192.168.1.0/24`) stays on `enp0s3`
- Everything else goes to gateway `192.168.1.1`

---

## 4) DNS Basics

DNS translates names to IPs (and sometimes IPs back to names).

When you access `example.com`:
1. App asks local resolver
2. Resolver checks cache
3. If needed, resolver queries DNS servers
4. Returns A/AAAA record(s)
5. Client connects to resulting IP

Linux files:
- `/etc/resolv.conf` -> nameserver settings
- `/etc/hosts` -> local static hostname mappings

Useful record types:
- **A**: hostname -> IPv4
- **AAAA**: hostname -> IPv6
- **CNAME**: alias to canonical name
- **MX**: mail server
- **NS**: authoritative nameserver
- **PTR**: reverse lookup

---

## 5) Essential Networking Commands

### `ip` (modern network tool)

```bash
ip -br addr
ip route
ip neigh
```

- `ip neigh` shows ARP/neighbor table
- Prefer `ip` over older `ifconfig`/`route`

### `ss` (socket statistics)

```bash
ss -tuln            # listening TCP/UDP sockets, numeric output
ss -tulnp           # include process info (often needs sudo)
ss -tan state established
```

Use this to answer: “Is my service listening? On which port/interface?”

### `ping` (basic reachability + latency)

```bash
ping -c 4 8.8.8.8
ping -c 4 example.com
ping -c 4 192.168.1.1
```

- If IP ping works but hostname ping fails -> likely DNS issue
- Some networks block ICMP, so ping failure is not always total outage

### `traceroute` (hop-by-hop path)

```bash
traceroute 8.8.8.8
traceroute -n example.com   # numeric output, skips reverse DNS lookups
```

Great for finding where traffic path breaks (local gateway, ISP, remote network).

### `dig` and `nslookup` (DNS queries)

```bash
dig example.com A +short
dig example.com AAAA +short
dig @1.1.1.1 example.com
nslookup example.com
```

- `dig @server` targets a specific DNS server
- `+short` gives concise output

---

## 6) `nmcli` Basics (NetworkManager CLI)

`nmcli` manages interfaces and saved connection profiles.

### Show status

```bash
nmcli device status
nmcli connection show
nmcli connection show --active
```

### Bring a connection up/down

```bash
nmcli connection up "Wired connection 1"
nmcli connection down "Wired connection 1"
```

### Set static IPv4 on an existing connection

```bash
nmcli connection modify "Wired connection 1" \
  ipv4.addresses 192.168.1.50/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.dns "1.1.1.1 8.8.8.8" \
  ipv4.method manual

nmcli connection up "Wired connection 1"
```

### Switch back to DHCP

```bash
nmcli connection modify "Wired connection 1" ipv4.method auto
nmcli connection up "Wired connection 1"
```

Tip: profile names are case-sensitive; list them with `nmcli connection show` first.

---

## 7) Packet Path (Client -> Service)

```mermaid
flowchart LR
    A[Client App\n(curl/browser)] --> B[Local TCP/IP Stack]
    B --> C[Route Lookup\nDefault GW?]
    C --> D[NIC + L2 Frame\n(ARP/Neighbor)]
    D --> E[Switch/Router Path]
    E --> F[Remote Host NIC]
    F --> G[Remote TCP/UDP Socket\n(Service Port)]
    G --> H[Service Process\n(nginx/sshd/api)]
    H --> G
    G --> F
    F --> E
    E --> D
    D --> B
    B --> A
```

---

## 8) Basic Troubleshooting Playbook

When networking fails, check from the bottom up:

1. **Link/interface state**
   ```bash
   ip -br link
   nmcli device status
   ```
   - Is interface up?
   - Cable/Wi-Fi connected?

2. **IP addressing**
   ```bash
   ip -br addr
   ```
   - Correct IP and CIDR?
   - Unexpected `169.254.x.x` suggests DHCP failure.

3. **Routing/default gateway**
   ```bash
   ip route
   ip route get 8.8.8.8
   ```
   - Is there a default route?
   - Is the selected interface correct?

4. **Local gateway reachability**
   ```bash
   ping -c 4 <gateway-ip>
   ```

5. **Internet IP reachability**
   ```bash
   ping -c 4 8.8.8.8
   traceroute -n 8.8.8.8
   ```

6. **DNS validation**
   ```bash
   dig example.com A +short
   dig @1.1.1.1 example.com +short
   cat /etc/resolv.conf
   ```
   - If direct IP works but names fail, focus on DNS config.

7. **Service listening checks (server side)**
   ```bash
   ss -tulnp | grep ':80\|:443\|:22'
   ```
   - Is the service bound to the expected port/address?

8. **Firewall/security controls**
   - Check host firewall rules and upstream ACL/security groups.

### Quick diagnosis patterns
- **Can ping gateway, cannot reach Internet IP** -> upstream routing/NAT/provider issue.
- **Can reach Internet IP, cannot resolve names** -> DNS issue.
- **DNS works, connection refused** -> service not listening / wrong port.
- **Timeout to one host only** -> remote host/firewall/path issue.

---

## 9) Fast Command Checklist

```bash
ip -br link
ip -br addr
ip route
ss -tuln
ping -c 3 <gateway>
ping -c 3 8.8.8.8
dig example.com +short
traceroute -n 8.8.8.8
nmcli device status
nmcli connection show --active
```

If you memorize this checklist, you can solve most beginner Linux network issues quickly.
