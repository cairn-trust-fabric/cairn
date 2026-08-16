<div align="center">

<img src="assets/cairn-logo-lockup.png" alt="CAIRN Trust Fabric" width="460">

### The Enterprise Trust Fabric — Secure • Orchestrate • Automate

[![Release](https://img.shields.io/badge/Release-v1.0.0-2562EB?style=flat-square&logo=github)](https://github.com/cairn-trust-fabric/cairn/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Linux%20Containers-14C8A6?style=flat-square&logo=windows)](https://cairnetp.com)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Runtime%20Sandbox-7C5AED?style=flat-square)](https://cairnetp.com/#architecture)
[![Compliance](https://img.shields.io/badge/Compliance-EU%20AI%20Act%20%7C%20NIST%20AI%20RMF%20%7C%20SOC%202-061220?style=flat-square)](https://cairnetp.com/compliance.html)
[![Website](https://img.shields.io/badge/Website-cairnetp.com-blue?style=flat-square)](https://cairnetp.com)

**We help organisations trust AI.**  
CAIRN inserts a deterministic governance and dual-runtime verification plane between enterprise user intent and autonomous model execution.

[Download cairn.exe](https://github.com/cairn-trust-fabric/cairn/releases/latest) • [Website & Platform](https://cairnetp.com) • [Architecture](https://cairnetp.com/#architecture) • [Compliance Mappings](https://cairnetp.com/compliance.html) • [Enterprise Licensing](https://cairnetp.com/licensing.html)

---

</div>

## Overview

Modern enterprises face a critical barrier to deploying autonomous AI agents, coding assistants, and automated workflows: **unverifiable, probabilistic execution**. 

**CAIRN Trust Fabric** solves this challenge by establishing a deterministic execution and governance boundary:
1. **Default-Deny Ingress**: Every model output, tool request, and script is intercepted before touching the host system or network.
2. **Dual-Runtime Hardware Sandboxes**: Dynamic execution dispatch to ephemeral Linux Docker containers or native Windows Sandbox Hyper-V micro-VMs.
3. **Tiered Assurance Verification**: Progression through a 6-stage verification ladder from raw code to deterministic, idempotent execution.
4. **Cryptographic Decision Ledgers**: Immutable, auditable provenance ledgers satisfying SOC 2, ISO 27001, and EU AI Act Article 14 human-oversight mandates.

---

## The 4-Tier Cairn Trust Architecture

The stacked cairn symbol directly embodies the 4-tier execution architecture:

```
         ┌───────────────────────────────────────┐
         │         1. INTENT LAYER (Top)         │  Schema Validation & AST Parsing
         └──────────────────┬────────────────────┘
                            ▼
         ┌───────────────────────────────────────┐
         │         2. GOVERNANCE LAYER           │  Dynamic RBAC, Egress Gate & ACLs
         └──────────────────┬────────────────────┘
                            ▼
         ┌───────────────────────────────────────┐
         │         3. EXECUTION LAYER            │  Dual Sandboxes (Docker / WinVM)
         └──────────────────┬────────────────────┘
                            ▼
         ┌───────────────────────────────────────┐
         │      4. EVIDENCE LAYER (Base)         │  SHA-256 Decision Ledger & SIEM
         └───────────────────────────────────────┘
```

1. **Tier 1: Intent & Ingress Gate** — Ingests user and agent intent, validates parameter schemas, performs AST parsing, and strips prompt injection attempts.
2. **Tier 2: Policy & Governance Engine** — Evaluates organizational policies in microseconds, applying credential redaction, egress domain whitelisting, and strict least-privilege RBAC.
3. **Tier 3: Dual-Runtime Sandbox Execution** — Dynamically routes workloads to read-only Linux Docker containers or isolated Windows Sandbox Hyper-V micro-VMs.
4. **Tier 4: Cryptographic Evidence Ledger** — Generates signed SHA-256 decision records, state-delta hashes, and real-time SIEM event streams (Splunk, Datadog, Sentinel).

---

## Verification Assurance Ladder

Every recommendation and automated action executed under the Trust Fabric is graded across 6 deterministic assurance tiers:

| Tier | Status | Verification Stage | Description |
| :---: | :--- | :--- | :--- |
| **0** | ⚠️ `Untrusted` | **Unverified** | Raw LLM output string or unparsed external script. |
| **1** | 🔍 `Inspected` | **Static Checked** | AST syntax validation, secret regex scan, and boundary parsing. |
| **2** | 🛡️ `Isolated` | **Sandbox Executed** | Ephemeral container execution with read-only root and 0 egress. |
| **3** | 📊 `Observed` | **Behaviour Checked** | Memory, disk delta, and network telemetry verified clean. |
| **4** | 🔒 `Reproducible`| **Deterministic** | Multirun output verified to produce identical results across seeds. |
| **5** | ✅ `Verified` | **Idempotent** | State mutations proven safe to repeat without system side-effects. |

---

## Quickstart Installation

### Option 1: PowerShell One-Liner (Windows x64)
Open PowerShell (Administrator recommended for Windows Sandbox virtualization):
```powershell
irm https://cairnetp.com/install.ps1 | iex
```

### Option 2: Direct Binary Download (GitHub Releases)
1. Download the latest official release from [GitHub Releases](https://github.com/cairn-trust-fabric/cairn/releases/latest):
   * `cairn-windows-x64.exe`
   * `SHA256SUMS.txt`
2. Verify binary cryptographic checksum:
   ```powershell
   Get-FileHash .\cairn-windows-x64.exe -Algorithm SHA256
   ```
3. Initialize the Trust Fabric daemon:
   ```powershell
   .\cairn.exe init
   ```

---

## CLI Usage Reference

### Verify an Agent Script in Docker Sandbox
```powershell
cairn verify --runtime docker --script "workload_agent.py"
```

### Execute with Windows Sandbox Hyper-V Hardware Isolation
```powershell
cairn verify --runtime winvm --script "finance_reconciliation.ps1"
```

### Inspect Dynamic Network Egress Gate
```powershell
cairn policy inspect --target egress
```

### Export Cryptographic Audit Ledger to SIEM
```powershell
cairn audit export --format json --destination "splunk://siem.corp.internal:8088"
```

---

## Enterprise Compliance Mappings

CAIRN Trust Fabric translates regulatory directives into cryptographic runtime boundary checks:

* **EU AI Act (Regulation 2024/1689)**: Article 14 (Human Oversight & Deterministic Override), Article 15 (Accuracy, Robustness & Cybersecurity), Article 12 (Automatic Record-Keeping).
* **NIST AI RMF 1.0**: GOVERN 1.1–1.6, MAP 2.1, MEASURE 2.5, MANAGE 2.2.
* **ISO/IEC 42001:2023**: Clause 6.1 (AI Risk Assessment), Clause 8.2 (AI System Impact Assessment), Control A.6.2 (Data Provenance & Traceability).
* **SOC 2 Type II**: CC6.1 (Logical Access Security), CC6.6 (Boundary Protection & Default-Deny Ingress), CC7.2 (Continuous Anomaly Monitoring).
* **DORA (EU 2022/2554)**: Article 6 (ICT Risk Management), Article 9 (Protection & Prevention Controls).

For full compliance matrices and technical whitepapers, visit [cairnetp.com/compliance.html](https://cairnetp.com/compliance.html).

---

## Binary Integrity & Security

Official CAIRN binaries are compiled via automated signed GitHub Actions runners and hashed cryptographically:

* **Official Domain**: [https://cairnetp.com](https://cairnetp.com)
* **Publisher**: CAIRN ETP
* **Security Contact**: `security@cairnetp.com`
* **Vulnerability Reporting**: See [SECURITY.md](SECURITY.md)

---

## Commercial Licensing & Enterprise Support

CAIRN Trust Fabric is distributed as open documentation, architecture, and issue tracking with proprietary compiled runtime binaries.

For multi-node enterprise licenses, sovereign air-gapped deployments, and custom LLM sandbox integrations:
* **Email**: [enterprise@cairnetp.com](mailto:enterprise@cairnetp.com)
* **Licensing Overview**: [cairnetp.com/licensing.html](https://cairnetp.com/licensing.html)
* **Schedule Briefing**: [cairnetp.com/#download](https://cairnetp.com/#download)

---

<div align="center">

**CAIRN Trust Fabric** • *Secure • Orchestrate • Automate*  
© 2026 CAIRN ETP. All rights reserved.

</div>
