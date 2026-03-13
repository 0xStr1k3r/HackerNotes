# Text Processing and Data Streams

Text processing is at the center of Linux operations work. Logs, metrics, command output, and config files all become easier to handle when you understand data streams and pipelines.

---

## 1) Standard Streams: stdin, stdout, stderr

Every process starts with three standard data channels:

- **stdin (0):** input stream (usually keyboard)
- **stdout (1):** normal output stream
- **stderr (2):** error output stream

Practical examples:

```bash
# stdout goes to terminal
echo "service is up"

# stderr goes to terminal
ls /path/that/does/not/exist
```

---

## 2) Redirection Essentials

Use redirection operators to control where streams go.

- `>` write stdout to file (overwrite)
- `>>` append stdout to file
- `2>` write stderr to file
- `2>>` append stderr to file
- `<` read stdin from file
- `&>` write stdout + stderr to file (Bash)
- `2>&1` merge stderr into stdout

Examples:

```bash
# Save command output
ip a > network_snapshot.txt

# Append health check output over time
date >> checks.log

# Save only errors
find /root -name "*.conf" 2> find-errors.log

# Save both output and errors
systemctl status nginx > nginx-status.log 2>&1

# Feed file contents into a command
wc -l < /var/log/syslog
```

---

## 3) Pipes (`|`) and Stream Flow

A pipe sends **stdout of one command** to **stdin of the next** command.

```mermaid
flowchart LR
    A["Command A<br/>stdout"] -->|"|" B["Command B<br/>stdin → stdout"]
    B -->|"|" C["Command C<br/>stdin → stdout"]
    Aerr["Command A stderr"] -.->|not piped by default| T["Terminal / stderr sink"]
```

Key point: `stderr` does **not** flow through `|` unless you merge it with stdout (for example with `2>&1`).

---

## 4) Core Text Processing Commands

### `grep` (filter by pattern)

```bash
grep "ERROR" app.log
grep -i "timeout" app.log              # case-insensitive
grep -E "ERROR|CRITICAL" app.log       # extended regex
grep -v "healthcheck" app.log          # inverse match
grep -n "failed" app.log               # include line numbers
```

### `sort` and `uniq`

```bash
sort users.txt
sort -n ports.txt                      # numeric sort
sort access.log | uniq                 # remove adjacent duplicates
sort access.log | uniq -c              # count duplicates
sort access.log | uniq -c | sort -nr   # top repeated lines
```

### `cut` (extract fields/columns)

```bash
cut -d: -f1 /etc/passwd                # usernames
cut -d, -f2,4 data.csv
```

### `tr` (translate/delete chars)

```bash
echo "ERROR Warning info" | tr '[:upper:]' '[:lower:]'
echo "a,b,c,d" | tr ',' '\n'
cat text.txt | tr -d '\r'              # strip carriage returns
```

---

## 5) `awk` Basics

`awk` is field-aware and great for structured text.

Common built-ins:

- `$1`, `$2`, ... field values
- `$0` whole line
- `NR` current line number
- `-F` field separator

Examples:

```bash
# Print username and shell from /etc/passwd
awk -F: '{print $1, $7}' /etc/passwd

# Show lines where 5th field > 1000
awk '$5 > 1000 {print $0}' metrics.txt

# Sum a numeric column
awk '{sum += $3} END {print sum}' numbers.txt
```

---

## 6) `sed` Basics

`sed` is stream editing: substitute, delete, print selected lines.

Examples:

```bash
# Replace first "error" per line
sed 's/error/warn/' app.log

# Replace all "error" per line
sed 's/error/warn/g' app.log

# Print lines 10-20 only
sed -n '10,20p' app.log

# Delete blank lines
sed '/^$/d' app.log
```

---

## 7) `head`, `tail`, `wc`

```bash
head -n 20 app.log                     # first 20 lines
tail -n 50 app.log                     # last 50 lines
tail -f /var/log/nginx/access.log      # follow live log updates
wc -l app.log                          # line count
wc -w notes.txt                        # word count
wc -c payload.json                     # byte count
```

---

## 8) Practical Ops Troubleshooting Pipelines

### A) Top 10 client IPs hitting nginx

```bash
awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10
```

### B) Count HTTP status codes

```bash
awk '{print $9}' /var/log/nginx/access.log | sort | uniq -c | sort -nr
```

### C) Find recent errors excluding health checks

```bash
tail -n 5000 app.log | grep -i "error" | grep -vi "healthcheck"
```

### D) Identify repeated failed SSH usernames

```bash
grep "Failed password" /var/log/auth.log | awk '{print $(NF-5)}' | sort | uniq -c | sort -nr | head
```

### E) Inspect disk-related errors with context

```bash
dmesg | grep -Ei "disk|i/o|ext4|xfs" | tail -n 30
```

### F) Show longest-running processes (snapshot)

```bash
ps -eo pid,comm,etime,%cpu,%mem --sort=-etime | head -n 15
```

### G) Quickly validate CSV field consistency (field count)

```bash
awk -F, '{print NF}' data.csv | sort | uniq -c
```

### H) Normalize line endings and count actionable lines

```bash
tr -d '\r' < incident.txt | grep -v '^\s*$' | wc -l
```

---

## 9) Common Mistakes and Troubleshooting Tips

### Common mistakes

1. **Forgetting stderr is separate from stdout**
   - Symptom: pipeline misses error messages.
   - Fix: merge streams with `2>&1` when needed.

2. **Using `uniq` without sorting first**
   - `uniq` only collapses adjacent duplicates.
   - Use: `sort file | uniq -c`.

3. **Incorrect field separator in `cut`/`awk`**
   - CSV vs colon vs spaces can change results.
   - Verify with sample lines first.

4. **Overwriting files accidentally with `>`**
   - Use `>>` when appending, or preview command output first.

5. **Overly broad `grep` patterns**
   - Leads to noise or false positives.
   - Prefer anchored/specific regex and `-i/-E` deliberately.

### Troubleshooting tips

- Build pipelines incrementally:
  - Start with first command, inspect output, then add next stage.
- Sample before full run:
  - `head`, `tail`, `sed -n '1,20p'`.
- Add line numbers for debugging:
  - `grep -n`, `nl`, `awk '{print NR, $0}'`.
- Validate assumptions about fields:
  - `awk -F, '{print NF}' file | sort -nu`.
- Preserve evidence while investigating:
  - `command | tee output.log`.

---

## 10) Quick Reference

```bash
# stdout/stderr
cmd > out.log 2> err.log
cmd > all.log 2>&1

# frequent filters
grep -i pattern file
sort file | uniq -c | sort -nr
cut -d: -f1 file
awk -F: '{print $1}' file
sed 's/old/new/g' file
tail -f file
wc -l file
```

Mastering these stream tools lets you solve most day-to-day Linux troubleshooting tasks quickly, directly from the shell.
