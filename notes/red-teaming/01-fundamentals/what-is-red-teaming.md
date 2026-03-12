# What Is Red Teaming?

> **Red teaming is a controlled, goal-driven, intelligence-informed simulation of a realistic adversary.** Its purpose is not to create drama or "win" against defenders, but to answer whether important business objectives can be reached before the organization can detect, investigate, and stop the activity.

---

## Table of Contents

1. [Core Definition](#1-core-definition)
2. [Why Organizations Use Red Teaming](#2-why-organizations-use-red-teaming)
3. [How a Real Engagement Works](#3-how-a-real-engagement-works)
4. [What Red Teams Actually Measure](#4-what-red-teams-actually-measure)
5. [Operator and Defender Viewpoints](#5-operator-and-defender-viewpoints)
6. [Deliverables and Success Criteria](#6-deliverables-and-success-criteria)
7. [Common Misconceptions](#7-common-misconceptions)
8. [What Good Red Team Maturity Looks Like](#8-what-good-red-team-maturity-looks-like)

---

## 1. Core Definition

> **Difficulty:** Beginner -> Advanced | **Category:** Red Teaming - Fundamentals

At the beginner level, red teaming can be understood as **a realistic security exercise built around an objective**.

Instead of asking only:

- "Is this server vulnerable?"
- "Can this application be exploited?"
- "How many findings can we collect?"

...red teaming asks broader, harder questions:

- Can an attacker realistically reach a crown-jewel asset?
- Which controls slow or stop that path?
- What would defenders actually see while it happens?
- How well do people, process, and technology work together under pressure?

A strong red team engagement sits between several disciplines:

- **Threat intelligence** to choose realistic behavior
- **Offensive security** to simulate the attack path safely
- **Detection engineering** to evaluate what telemetry exists
- **Incident response** to see whether defenders can triage and contain the problem
- **Risk management** to tie technical events back to business impact

Red teaming is therefore not just "advanced hacking." It is **security validation at the system level**.

### A simple mental model

| Activity | Core Question |
|---|---|
| Vulnerability assessment | What weaknesses exist? |
| Pentest | Can those weaknesses be exploited? |
| Red team | Could a realistic adversary achieve a meaningful objective before the organization stops them? |

---

## 2. Why Organizations Use Red Teaming

Mature organizations use red teaming when they need more than a list of technical bugs. They want to know whether security controls work **as a system**.

| Leadership Question | What Red Teaming Helps Validate |
|---|---|
| Can we protect our most important data? | Segmentation, identity controls, privileged access, monitoring around crown jewels |
| Will the SOC notice meaningful attacker behavior? | Logging coverage, alert fidelity, analyst workflow, escalation quality |
| Are recent security investments paying off? | Whether EDR, email security, IAM, and response processes work together |
| Are we ready for a targeted intrusion? | Cross-team coordination, decision making, containment speed, executive communication |
| Where should we improve first? | Control gaps tied to realistic attack paths instead of abstract severity labels |

Red teaming is especially valuable after:

- a major cloud migration
- a merger or acquisition
- rollout of new identity controls such as MFA or conditional access
- repeated phishing or ransomware incidents
- creation of new high-value internal platforms or privileged workflows

The reason is simple: architectural change creates new assumptions, and red teaming tests whether those assumptions hold.

---

## 3. How a Real Engagement Works

A real engagement is controlled long before any adversary action begins. The safest and most useful red team exercises are carefully designed.

```mermaid
flowchart LR
    A[Business objective] --> B[Threat model]
    B --> C[Rules of engagement]
    C --> D[Scenario design]
    D --> E[Controlled adversary actions]
    E --> F[Blue team observation and response]
    F --> G[Evidence collection]
    G --> H[Reporting and remediation]
    H --> I[Retest or purple follow-up]
```

### Typical engagement stages

1. **Objective selection**
   - Example: validate whether payroll data, cloud admin access, or executive email can be reached.
2. **Threat modeling**
   - Choose the kinds of adversaries that realistically target the organization.
3. **Rules of engagement**
   - Define what is allowed, prohibited, time-boxed, or pre-approved.
4. **Execution**
   - Simulate selected behaviors in a safe and evidence-driven way.
5. **Detection and response observation**
   - Capture alerts, triage decisions, communication gaps, and containment actions.
6. **Reporting and replay**
   - Explain the attack path, what controls failed, what worked, and what to improve.

### What makes execution "realistic"

Realism does **not** mean recklessness. In good engagements, realism usually comes from:

- appropriate threat actor selection
- realistic pace and sequencing
- believable preconditions
- use of the identities, trust paths, and business workflows that actually matter
- safe proof methods instead of destructive impact

For example, a team may prove that sensitive records were reachable by collecting approved evidence rather than reading or altering production data.

---

## 4. What Red Teams Actually Measure

New practitioners often think a red team is only measuring whether access was achieved. In reality, the best engagements measure several things at once.

| Measurement Area | What It Means in Practice |
|---|---|
| Objective reachability | Could the team plausibly get to the target asset or privilege level? |
| Attacker cost | How much effort, time, and adaptation were required? |
| Detectability | Which actions were seen, missed, delayed, or misunderstood? |
| Response quality | Did defenders investigate correctly and contain at the right time? |
| Control interaction | Did identity, network, endpoint, and process controls reinforce each other? |
| Evidence quality | Is the final narrative supported by logs, screenshots, detections, timelines, and decision points? |

A red team is often less interested in producing twenty unrelated findings than in proving one important statement such as:

> "A realistic adversary could move from a low-privilege identity to a finance reporting system because service account governance, identity telemetry, and privilege review processes did not work together."

That is far more useful than a shallow list of disconnected issues.

---

## 5. Operator and Defender Viewpoints

The same engagement looks very different depending on which side you sit on.

### Operator viewpoint

Red team operators usually care about:

- whether the chosen scenario is actually tied to threat intelligence and business risk
- whether access paths are plausible, not just technically possible
- whether actions stay within scope and safety controls
- what proof is needed to support the final report
- when an action becomes too noisy, risky, or operationally unrealistic
- which control failures are root causes versus one-off weaknesses

### Defender viewpoint

Blue teams and engineering teams usually care about:

- what telemetry was generated at each stage
- whether alerts were high confidence, low confidence, or absent
- whether analysts understood the significance of what they saw
- how quickly the event was escalated and contained
- whether the organization had enough context to make a good response decision
- whether the same path could be blocked earlier next time

### Side-by-side view

| Topic | Operator Focus | Defender Focus |
|---|---|---|
| Identity abuse | Is the path realistic and within scope? | Did identity logs, UEBA, or admin workflows flag the behavior? |
| Internal movement | Can the path reach the objective efficiently? | Did segmentation, EDR, and triage process slow or stop the spread? |
| Timing | How much dwell time is needed to stay believable? | How long did it take to notice, understand, and respond? |
| Proof | What evidence proves the risk safely? | What evidence proves detection and response quality? |

---

## 6. Deliverables and Success Criteria

A professional red team engagement produces more than a "got in / did not get in" statement.

Typical outputs include:

- an executive summary in business language
- an attack narrative with a clean timeline
- mapped control failures and control successes
- specific detection gaps and validation opportunities
- recommendations prioritized by attacker value and defender effort
- a replay plan for purple teaming or retesting

### What success looks like

A successful engagement might look like any of the following:

- the red team reached the objective and clearly explained why
- the red team failed because controls worked, and the organization now has evidence those controls matter
- the SOC detected the path early, but response coordination was too slow
- security teams discovered that many alerts existed, but were not actionable enough for analysts to trust them

In other words, **"the red team failed" can still be a very successful outcome** if the organization learned that its defenses actually held.

---

## 7. Common Misconceptions

### "Red teaming is just a longer pentest"

No. Duration can overlap, but the design philosophy is different. Pentesting is usually coverage-oriented. Red teaming is objective-oriented.

### "The goal is to embarrass the blue team"

No. A healthy program treats red teaming as a shared learning exercise. Ego destroys useful outcomes.

### "More stealth always means better realism"

Not necessarily. Good realism means behaving like the modeled adversary, not turning the engagement into a hide-and-seek contest at all costs.

### "If no objective was reached, the engagement failed"

Also false. Strong preventive and detective controls are exactly what many clients hope to validate.

### "Red teaming is only for huge enterprises"

Large organizations benefit heavily, but smaller organizations also gain value when they need to test identity, cloud, incident response, or third-party exposure in a realistic way.

---

## 8. What Good Red Team Maturity Looks Like

Organizations get the most value from red teaming when it becomes part of a broader security improvement loop.

| Maturity Level | Characteristics |
|---|---|
| Ad hoc | Occasional exercises, unclear objectives, report-heavy outcomes |
| Developing | Threat-informed scenarios, better rules of engagement, stronger evidence collection |
| Mature | Regularly scheduled exercises tied to business risk, purple follow-up, retesting, and detection engineering |
| Advanced | Red teaming influences architecture decisions, incident readiness, and long-term control strategy |

Good maturity also means knowing when **not** to red team. If basic asset management, logging, or ownership are missing, the first priority may be foundational security work rather than sophisticated adversary simulation.

Red teaming is most useful when it helps answer this question:

> "What would a realistic attacker learn about our organization, what path would they likely take, and where do we meaningfully raise their cost?"

That is the heart of the discipline.

---

> **Defender mindset:** Use this note to understand how red team engagements are designed, measured, and defended against. Keep all activity authorized, scoped, and safe.
