<div align="center">

<img src="cairn-logo.png" alt="CAIRN Trust Fabric" width="460">

### The Enterprise Trust Fabric — Secure • Orchestrate • Automate

[![Release](https://img.shields.io/badge/Release-v2.10.0-2562EB?style=flat-square)](https://github.com/cairn-trust-fabric/cairn/releases)
[![Platform](https://img.shields.io/badge/Platform-Windows%20x64%20%7C%20Linux%20x64%20%7C%20Containers-14C8A6?style=flat-square)](https://cairnetp.com)
[![Architecture](https://img.shields.io/badge/Architecture-Dual--Runtime%20Sandbox-7C5AED?style=flat-square)](https://cairnetp.com/#architecture)
[![Evidence](https://img.shields.io/badge/Evidence-Auditor--verifiable%20export-061220?style=flat-square)](https://cairnetp.com/compliance.html)
[![Licence](https://img.shields.io/badge/Licence-BUSL--1.1-F5A623?style=flat-square)](LICENSE)
[![Website](https://img.shields.io/badge/Website-cairnetp.com-blue?style=flat-square)](https://cairnetp.com)

**We help organisations trust AI.**  
CAIRN inserts a deterministic governance and dual-runtime verification plane between enterprise user intent and autonomous model execution.

[Download Releases](https://github.com/cairn-trust-fabric/cairn/releases/latest) • [Website & Platform](https://cairnetp.com) • [Architecture](https://cairnetp.com/#architecture) • [Compliance Mappings](https://cairnetp.com/compliance.html) • [Licensing & Deployment](https://cairnetp.com/licensing.html)

---

</div>

## About CAIRN Trust Fabric

**CAIRN Trust Fabric** is an enterprise-grade governance and execution plane designed to bring deterministic control, cryptographic verification, and hardware-isolated execution to artificial intelligence systems.

As organisations deploy autonomous AI agents, coding copilots, and multi-model workflows, they encounter a critical structural problem: **probabilistic language models cannot guarantee safety, idempotency, or policy adherence at runtime**. 

CAIRN resolves this by operating as an unbypassable intermediary layer:
* **Default-Deny Ingress**: Intercepts every tool invocation, shell command, code execution request, and outbound network attempt before host exposure.
* **Dual-Runtime Hardware Sandboxes**: Dispatches unverified workloads into ephemeral Linux Docker containers or native Windows Sandbox Hyper-V micro-VMs.
* **Tiered Assurance Verification**: Evaluates actions across a structured 6-tier ladder from unverified strings to deterministic, repeatable outcomes.
* **Cryptographic Decision Ledgers**: Produces tamper-evident audit trails with SHA-256 decision records, exportable as a bundle your auditor can verify without running CAIRN.
* **Evidence across several machines**: Each machine signs its own bundle; a standalone reader checks every one independently and reports across them. There is no collector and no central database — see below.

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
         |         2. GOVERNANCE LAYER           |  Autonomy Ceilings, Egress Gate & ACLs
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
2. **Tier 2: Policy & Governance Engine** — Evaluates signed organisational policy, applying credential redaction, egress domain allow-listing, and operator-declared autonomy ceilings. Measured at **0.20–0.26 ms (p50)** for a decision that does not run code. Role-based access control is **not built** — it arrives in v3.0, and identity today is the operating-system user.
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
| **4** | `[REPRODUCIBLE]` | **Deterministic** | Repeated runs verified to produce identical results across independent seeds. |
| **5** | `[VERIFIED]` | **Idempotent** | State mutations proven safe to repeat without system side-effects. |

**These are grades an action is assigned, not stages every action passes
through.** What a given install can actually reach depends on what is present on
the machine: tiers 2 and above need Docker or Windows Sandbox, and where neither
is available the result is recorded as `static_only` with the reason — never
silently downgraded to a pass. Tiers 4 and 5 are reached rarely by design; the bar
for promoting work into the reusable skill library is tier 4, and on a stock
install nothing has cleared it.

---

## Quickstart

1. **Download the latest release** from [GitHub Releases](https://github.com/cairn-trust-fabric/cairn/releases/latest). Take the installer, `SHA256SUMS.txt`, `SHA256SUMS.txt.sig` and `verify-release.cjs`.

2. **Verify the download before installing**. The verifier is a single dependency-free script; you do not need to install or trust CAIRN to run it.

   ```powershell
   node verify-release.cjs
   ```

   It confirms that every file matches the hash recorded when it was built, and that the hash manifest carries a valid signature from the key that signed previous CAIRN releases.

3. **Install it.**

   *Windows* — run `CAIRN-Trust-Fabric-Setup-X.Y.Z.exe`. Read the note below on
   the Windows warning first.

   *Linux (x64)* — `sudo apt install ./cairn-trust-fabric_X.Y.Z_amd64.deb`, or
   make the `.AppImage` executable and run it. **Three controls are absent on
   Linux rather than equivalent** — PowerShell structural analysis does not exist,
   sandboxed verification needs a Docker socket, and secret protection is weaker
   than DPAPI. CAIRN records each of these rather than reporting a pass; the
   deployment guide states them in full.

   *macOS* — not built. The build script exists and has never been run.

4. **Tell CAIRN which of your systems matter.** It ships with nothing declared, so
   it grades an action by what kind of thing it is rather than by what it would
   affect, and applies no ceiling to what it may do on its own — and it records
   that absence rather than treating it as approval. Copy a file from
   [`examples/`](examples/) into your vault to change that. Optional, and CAIRN is
   explicit in every decision record about which of these are not in force.

---

## Windows will warn you about this download

Windows will say **"Windows protected your PC"**. That is expected, and you should know why before deciding what to do about it.

That check looks for a code-signing certificate issued by a certificate authority. **CAIRN does not have one** — it is a recurring cost the project has not taken on. The warning means *"this publisher has not paid for an identity check"*, not *"this file is dangerous"*, and the wording does not distinguish the two.

We are not asking you to take that on trust. Verify the download instead.

**What the Ed25519 verification gives you:**
* **Tamper evidence** — a corrupted download, an altered mirror or disk rot all fail the check.
* **Continuity of publisher** — this release is signed by the same key that signed the last one. This is trust-on-first-use, the same model as an SSH host key.

**What it does not give you:**
* **Proof of who holds the signing key.** It is a self-published key, not a CA certificate — anyone can generate one. Before trusting a *first* download, compare the fingerprint the verifier prints against the one published in this repository, which is somewhere a download page cannot change.
* **Suppression of the Windows warning.** Only a CA certificate does that, and there is not one.

**There is no automatic update**, deliberately. An updater that installs unsigned code with no certificate to check against is a worse problem than not having an updater, so it is sequenced behind code signing. To update, download again and re-run the verifier.

---

## Reading evidence from several machines

Each machine exports its own signed evidence bundle. **`cairn-aggregate` reads a
folder of them, verifies every bundle independently, and reports per machine and
across all of them.** A bundle that fails its own verification is named and left
out of the totals rather than quietly dropped, and overlapping export windows do
not count the same decision twice.

It is a single file needing only Node.js — no CAIRN install, no dependencies and
no network. In an installed build it sits at:

```
<install dir>\resources\app.asar.unpacked\tools\cairn-aggregate\cairn-aggregate.mjs
```

Copy it to wherever your evidence is collected, which does not have to be a
machine running CAIRN.

```
node cairn-aggregate.mjs <folder-of-bundles> --pub <key.pem> --expect <nodes.txt> --stale-after 14
```

`--expect` takes the machines you believe you have, so one that sent nothing is
reported rather than silently absent. `--stale-after` names any machine whose
newest evidence is older than that many days — **the age of a record, not a check
that anything is running.**

**There is no collector and no central database, deliberately.** Each machine
keeps and signs its own records; the reader checks them and can be re-run by
anyone holding the bundles. Sending records to a collector would make their
integrity depend on whoever ran it, which is the trust this design exists to
remove. It also means the reader cannot see a machine that has never exported
anything, and it says so rather than presenting what it can see as the whole
estate.

CAIRN can write each bundle to a folder you name on a schedule — a share, a
synced folder, anywhere your existing tooling already moves files from. **CAIRN
does not send anything anywhere:** there is no address, no credential and no
network connection involved, and the copy on the machine is always written first.

---

## Enterprise Compliance Mappings

**CAIRN holds no certification, and none is in progress.** It is not SOC 2
certified, not ISO 27001 certified, and not "EU AI Act compliant" — no such claim
is made anywhere in this project, and any material that appears to make one is
wrong. Certification is a statement about an organisation, awarded by an auditor,
and CAIRN has not been through that process.

What CAIRN does is narrower and checkable: it **produces the evidence your auditor
asks for**, so that *your* controls can be demonstrated. The mappings below are
from control text to the mechanism that generates evidence relevant to it — they
are a starting point for a conversation with an assessor, not a substitute for
one.

* **EU AI Act (Regulation 2024/1689)**: Article 14 (Human Oversight & Deterministic Override), Article 15 (Accuracy, Robustness & Cybersecurity), Article 12 (Automatic Record-Keeping).
* **NIST AI RMF 1.0**: GOVERN 1.1–1.6, MAP 2.1, MEASURE 2.5, MANAGE 2.2.
* **ISO/IEC 42001:2023**: Clause 6.1 (AI Risk Assessment), Clause 8.2 (AI System Impact Assessment), Control A.6.2 (Data Provenance & Traceability).
* **SOC 2 Type II**: CC6.1 (Logical Access Security), CC6.6 (Boundary Protection & Default-Deny Ingress), CC7.2 (Continuous Anomaly Monitoring).
* **DORA (EU 2022/2554)**: Article 6 (ICT Risk Management), Article 9 (Protection & Prevention Controls).

For comprehensive compliance matrices and documentation, visit [cairnetp.com/compliance.html](https://cairnetp.com/compliance.html).

---

## Binary Integrity & Verification

Every release ships a SHA-256 manifest of its installers, an Ed25519 signature over that manifest, the public key, and the verifier that checks both. See [Windows will warn you about this download](#windows-will-warn-you-about-this-download) for what that establishes and what it does not.

* **Official Domain**: [https://cairnetp.com](https://cairnetp.com)
* **Publisher**: CAIRN ETP
* **Security Policy**: See [SECURITY.md](SECURITY.md)

### Release signing key

This is the fingerprint `verify-release.cjs` prints. It is published **here**, in the repository, rather than only on the release page — a public key served from the same page as the installer is worth exactly as much as that page.

```
Ed25519  SHA-256  c3b71550dccd03e3503936237a8658b8b773af74843e326e21fdce790c9b7394
```

If the verifier prints a different fingerprint, stop and report it via [SECURITY.md](SECURITY.md).

---

## Licence

CAIRN Trust Fabric is published under the **[Business Source License 1.1](LICENSE)**.
It is **source-available**, not OSI open source, and the difference is worth
stating plainly rather than leaving to the licence text:

| You may | You may not |
| --- | --- |
| Run CAIRN in production, including commercially | Offer CAIRN to third parties as a hosted or managed service |
| Modify it and self-host your modifications | Remove or circumvent the licence-key functionality |
| Read, audit and fork the source | Use the CAIRN name or logo for your own product |
| Use it internally at any scale, at no cost | — |

**Each version converts automatically to Apache 2.0 on 2030-08-23**, four years
after release. Nothing published under these terms stays restricted permanently.

This is deliberate rather than defensive. CAIRN asks organisations to place a
governance layer in front of their AI systems, and a governance layer nobody can
read is a governance layer nobody should trust — so the source is open to
inspection, audit and modification. What the licence protects is the commercial
surface, not the reader.

The distributed binaries are Electron applications; the JavaScript inside them is
not compiled or obfuscated, and this project does not pretend otherwise. **The
licence is the protection, not the packaging.**

"CAIRN", "CAIRN Trust Fabric" and the stacked cairn logo are trademarks. See
[NOTICE](NOTICE) — a fork is welcome and needs its own name.

### Commercial licensing & enterprise support

For enterprise licensing, air-gapped deployment, terms that differ from the above,
or custom LLM sandbox integrations:
* **Licensing overview**: [cairnetp.com/licensing.html](https://cairnetp.com/licensing.html)
* **Platform enquiries**: [cairnetp.com](https://cairnetp.com)

---

<div align="center">

**CAIRN Trust Fabric** • *Secure • Orchestrate • Automate*  
(c) 2026 CAIRN Enterprise Systems. Source-available under [BUSL 1.1](LICENSE).

</div>
