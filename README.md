<div align="center">

<img src="cairn-logo.png" alt="CAIRN Trust Fabric" width="460">

### The Enterprise Trust Fabric — Secure • Orchestrate • Automate

[![Release](https://img.shields.io/badge/Release-v2.1.0-2562EB?style=flat-square)](https://github.com/cairn-trust-fabric/cairn/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Linux%20Containers-14C8A6?style=flat-square)](https://cairnetp.com)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Runtime%20Sandbox-7C5AED?style=flat-square)](https://cairnetp.com/#architecture)
[![Compliance](https://img.shields.io/badge/Compliance-EU%20AI%20Act%20%7C%20NIST%20AI%20RMF%20%7C%20SOC%202-061220?style=flat-square)](https://cairnetp.com/compliance.html)
[![Website](https://img.shields.io/badge/Website-cairnetp.com-blue?style=flat-square)](https://cairnetp.com)

**We help organisations trust AI.**  
CAIRN inserts a deterministic governance and dual-runtime verification plane between enterprise user intent and autonomous model execution.

[Download Releases](https://github.com/cairn-trust-fabric/cairn/releases/latest) • [Website & Platform](https://cairnetp.com) • [Architecture](https://cairnetp.com/#architecture) • [Compliance Mappings](https://cairnetp.com/compliance.html) • [Licensing & Deployment](https://cairnetp.com/licensing.html)

---

</div>

## About CAIRN Trust Fabric

**CAIRN Trust Fabric** is an enterprise-grade governance and execution plane designed to bring deterministic control, cryptographic verification, and hardware-isolated execution to artificial intelligence systems.

As organizations deploy autonomous AI agents, coding copilots, and multi-model workflows, they encounter a critical structural problem: **probabilistic language models cannot guarantee safety, idempotency, or policy adherence at runtime**. 

CAIRN resolves this by operating as an unbypassable intermediary layer:
* **Default-Deny Ingress**: Intercepts every tool invocation, shell command, code execution request, and outbound network attempt before host exposure.
* **Dual-Runtime Hardware Sandboxes**: Dispatches unverified workloads into ephemeral Linux Docker containers or native Windows Sandbox Hyper-V micro-VMs.
* **Tiered Assurance Verification**: Evaluates actions across a structured 6-tier ladder from unverified strings to deterministic, repeatable outcomes.
* **Cryptographic Decision Ledgers**: Produces tamper-evident audit trails with SHA-256 decision records to satisfy regulatory mandates (EU AI Act, SOC 2, ISO 42001).

---

## The 4-Tier Cairn Trust Architecture

The stacked cairn mark represents the 4-tier execution architecture:

```
         +---------------------------------------+
         |         1. INTENT LAYER (Top)         |  Schema Validation & AST Parsing
         +-------------------+-------------------+
                             |
                             v
         +---------------------------------------+
         |         2. GOVERNANCE LAYER           |  Dynamic RBAC, Egress Gate & ACLs
         +-------------------+-------------------+
                             |
                             v
         +---------------------------------------+
         |         3. EXECUTION LAYER            |  Dual Sandboxes (Docker / WinVM)
         +-------------------+-------------------+
                             |
                             v
         +---------------------------------------+
         |      4. EVIDENCE LAYER (Base)         |  SHA-256 Decision Ledger & SIEM
         +---------------------------------------+
```

1. **Tier 1: Intent & Ingress Gate** — Ingests user and agent intent, validates parameter schemas, performs Abstract Syntax Tree (AST) parsing, and filters prompt injection vectors.
2. **Tier 2: Policy & Governance Engine** — Evaluates organizational policies in microseconds, applying credential redaction, egress domain whitelisting, and strict least-privilege RBAC.
3. **Tier 3: Dual-Runtime Sandbox Execution** — Dynamically routes workloads to read-only Linux Docker containers or isolated Windows Sandbox Hyper-V micro-VMs.
4. **Tier 4: Cryptographic Evidence Ledger** — Generates signed SHA-256 decision records, state-delta hashes, and real-time SIEM event streams.

---

## Verification Assurance Ladder

Every recommendation and automated action is graded across 6 deterministic assurance tiers (ADR-0008 compliant):

| Tier | Status | Verification Stage | Description |
| :---: | :--- | :--- | :--- |
| **0** | `[UNTRUSTED]` | **Unverified** | Raw LLM output string or unparsed external script. |
| **1** | `[INSPECTED]` | **Static Checked** | AST syntax validation, secret regex scan, and boundary parsing. |
| **2** | `[ISOLATED]` | **Sandbox Executed** | Ephemeral container execution with read-only root and zero network egress. |
| **3** | `[OBSERVED]` | **Behaviour Checked** | Memory, disk delta, and network telemetry verified clean. |
| **4** | `[REPRODUCIBLE]` | **Deterministic** | Multirun output verified to produce identical results across independent seeds. |
| **5** | `[VERIFIED]` | **Idempotent** | State mutations proven safe to repeat without system side-effects. |

---

## Quickstart

CAIRN Trust Fabric binaries are packaged and signed via official GitHub Releases.

1. **Download the Latest Release**:
   Download the distribution package from [GitHub Releases](https://github.com/cairn-trust-fabric/cairn/releases/latest):
   * `CAIRN.Trust.Fabric.Setup.2.1.0.exe`
   * `SHA256SUMS.txt`

2. **Verify Binary Integrity**:
   Verify cryptographic hash matching the release manifest:
   ```powershell
   Get-FileHash .\CAIRN.Trust.Fabric.Setup.2.1.0.exe -Algorithm SHA256
   ```

3. **Initialize the Trust Fabric Runtime**:
   ```powershell
   .\CAIRN.Trust.Fabric.Setup.2.1.0.exe --help
   ```

---

## Enterprise Compliance Mappings

CAIRN Trust Fabric translates regulatory directives into cryptographic runtime boundary checks:

* **EU AI Act (Regulation 2024/1689)**: Article 14 (Human Oversight & Deterministic Override), Article 15 (Accuracy, Robustness & Cybersecurity), Article 12 (Automatic Record-Keeping).
* **NIST AI RMF 1.0**: GOVERN 1.1–1.6, MAP 2.1, MEASURE 2.5, MANAGE 2.2.
* **ISO/IEC 42001:2023**: Clause 6.1 (AI Risk Assessment), Clause 8.2 (AI System Impact Assessment), Control A.6.2 (Data Provenance & Traceability).
* **SOC 2 Type II**: CC6.1 (Logical Access Security), CC6.6 (Boundary Protection & Default-Deny Ingress), CC7.2 (Continuous Anomaly Monitoring).
* **DORA (EU 2022/2554)**: Article 6 (ICT Risk Management), Article 9 (Protection & Prevention Controls).

For comprehensive compliance matrices and documentation, visit [cairnetp.com/compliance.html](https://cairnetp.com/compliance.html).

---

## Binary Integrity & Verification

All official CAIRN binaries are compiled via automated signed GitHub Actions runners and cryptographically hashed:

* **Official Domain**: [https://cairnetp.com](https://cairnetp.com)
* **Publisher**: CAIRN ETP
* **Security Policy**: See [SECURITY.md](SECURITY.md)

---

## Commercial Licensing & Enterprise Support

CAIRN Trust Fabric is distributed as open documentation, architecture, and issue tracking with proprietary compiled runtime binaries.

For multi-node enterprise licenses, sovereign air-gapped deployments, and custom LLM sandbox integrations, visit the official portal:
* **Licensing Overview**: [cairnetp.com/licensing.html](https://cairnetp.com/licensing.html)
* **Platform Inquiries**: [cairnetp.com](https://cairnetp.com)

---

<div align="center">

**CAIRN Trust Fabric** • *Secure • Orchestrate • Automate*  
(c) 2026 CAIRN ETP. All rights reserved.

</div>
