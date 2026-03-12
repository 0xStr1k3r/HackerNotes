# Redirectors

> **Difficulty:** Beginner → Advanced | **Category:** Red Teaming — Infrastructure

A redirector is an intermediary system placed between public-facing interaction and more sensitive back-end infrastructure. In professional red teaming, redirectors are used to **separate exposure layers, shape traffic, simplify edge replacement, and improve observability**.

The important lesson is architectural, not procedural: redirectors help teams control what is exposed at the edge and what remains protected deeper in the stack.

---

## Table of Contents

1. [What Redirectors Do](#1-what-redirectors-do)
2. [Why Professional Teams Use Them](#2-why-professional-teams-use-them)
3. [Layered Redirector Patterns](#3-layered-redirector-patterns)
4. [Tradeoffs and Failure Modes](#4-tradeoffs-and-failure-modes)
5. [What Defenders Look For](#5-what-defenders-look-for)
6. [Operator and Defender Viewpoints](#6-operator-and-defender-viewpoints)
7. [Redirector Planning Checklist](#7-redirector-planning-checklist)
8. [Common Mistakes](#8-common-mistakes)
9. [Key Takeaway](#9-key-takeaway)

---

## 1. What Redirectors Do

At a basic level, a redirector receives traffic and forwards or filters it before it reaches another system. In red team infrastructure, that simple function supports several goals:

- keeping core systems off the direct public path,
- separating public exposure from operator management,
- adding edge-level logging and control,
- and enabling easier retirement or replacement of exposed systems.

### Redirectors are not magic

A redirector does not make activity invisible. It simply changes where signals appear and how exposure is managed. Defenders can still learn a great deal from metadata, hosting patterns, headers, certificates, and timing.

---

## 2. Why Professional Teams Use Them

| Benefit | Why it helps |
|---|---|
| Exposure control | Keeps core management systems off the direct internet-facing path |
| Operational flexibility | Allows the edge to change without rebuilding the entire architecture |
| Logging at the edge | Captures interaction and health signals close to the public boundary |
| Segmentation | Supports cleaner separation between roles and layers |
| Faster cleanup | Makes it easier to retire exposed infrastructure at the end of an engagement |

### Redirectors support governance as much as realism

They are often as useful for safety and evidence management as they are for operator workflow.

---

## 3. Layered Redirector Patterns

```mermaid
flowchart LR
    A[Internet or approved target interaction] --> B[Redirector layer]
    B --> C[Protected core service]
    C --> D[Management and evidence systems]
```

### What this pattern achieves

- the internet sees the edge,
- the core stays one step removed,
- and the evidence systems stay further removed still.

This gives teams options when they need to:

- rotate edge systems,
- limit direct exposure,
- or explain where defenders could have observed activity.

---

## 4. Tradeoffs and Failure Modes

| Tradeoff | Practical impact |
|---|---|
| More layers | Better segmentation, but more complexity and troubleshooting effort |
| Edge logging | Better evidence, but more data to protect |
| Generic proxy behavior | Easier blending, but headers and fingerprints may still reveal patterns |
| Reusable redirector designs | Faster setup, but repeated metadata can become a detection clue |

### Common failure modes

Redirectors create problems when they:

- leak internal details through headers or error behavior,
- share certificates or fingerprints carelessly across campaigns,
- expose management paths that should never be public,
- or become single points of failure because they were not monitored.

---

## 5. What Defenders Look For

Defenders often identify redirector-like infrastructure through a combination of signals:

| Signal | Why it matters |
|---|---|
| Reverse proxy headers or response patterns | May reveal an intermediary role |
| Certificate reuse across otherwise unrelated domains | Can link edge systems together |
| Hosting and ASN clustering | Shows multiple assets living in a similar provider footprint |
| Passive DNS relationships | Helps reveal infrastructure families over time |
| Narrow exposed paths such as health or staging endpoints | Suggests infrastructure rather than a full application |
| Traffic timing consistency | Indicates machine-driven routing or relay behavior |

Redirectors are therefore a strong reminder that defenders should correlate infrastructure metadata, not just payload content.

---

## 6. Operator and Defender Viewpoints

| Topic | Operator view | Defender view |
|---|---|---|
| Segmentation | “How do I keep the edge separate from the core?” | “Can I tell this host is acting like a relay rather than a business app?” |
| Rotation | “Can I replace the edge without damaging evidence continuity?” | “Are there related assets that share metadata or provider patterns?” |
| Logging | “What should I capture at the edge?” | “What did the edge reveal even if content stayed hidden?” |
| Fingerprints | “Will this look too similar to past infrastructure?” | “Can recurring certificates, paths, or headers expose linkage?” |

---

## 7. Redirector Planning Checklist

- [ ] Redirectors are justified by a real segmentation need
- [ ] Edge and management functions are separate
- [ ] Headers, certificates, and error behavior were reviewed for leakage
- [ ] Edge logging exists and is protected
- [ ] Replacement and teardown are planned
- [ ] Reuse patterns were considered before deployment

---

## 8. Common Mistakes

### 1. Treating a redirector as a substitute for good architecture

It is just one layer, not a whole design.

### 2. Forgetting to monitor the redirector itself

The edge is often where early warning and clean evidence live.

### 3. Reusing the same visible patterns repeatedly

Efficiency can create unnecessary detection linkage.

### 4. Exposing more than the minimum edge surface

A redirector should reduce exposure, not multiply it.

### 5. Assuming defenders only inspect content

Metadata and behavior are often enough.

---

## 9. Key Takeaway

Redirectors are best understood as **exposure-management components**. They help professional teams separate public interaction from protected core systems, but they also give defenders a rich set of observable signals.

The deeper lesson is not “use redirectors.” The deeper lesson is:

> “Layer infrastructure so that exposure, management, and evidence are not all sitting on the same system.”

---

> **Defender mindset:** Understanding redirectors helps defenders recognize edge-mediated infrastructure by studying headers, certificates, hosting relationships, and traffic patterns rather than waiting for obvious payload indicators.
