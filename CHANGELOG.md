# Changelog

Every released version of CAIRN Trust Fabric, and what changed in it.

Entries describe what changed for you as a user: what behaves differently, what
was wrong and is now fixed. They do not list internal refactors. Where something
was previously reported incorrectly, this file says so plainly rather than
recording it as an improvement — a product that asks you to trust its audit trail
does not get to be vague about its own history.

Downloads and verification instructions: [Releases](https://github.com/cairn-trust-fabric/cairn/releases).

---

## 2.1.1 — 16 August 2026

Interface corrections found by reviewing the running 2.1.0 build.

### Fixed

- **The Trust & Audit tab reported nothing on three of its five cards.** The
  audit trace card was blank. The policy and evidence cards showed fixed
  descriptive text rather than the state of your system. All five now read live
  figures — decisions recorded this session, ledger length and whether the hash
  chain verifies, how many tool calls the governance gate refused, and what
  leaves your machine.
- **The startup screen could not be dismissed if model loading stalled.**
  Restarting the application was the only way out. Startup is now bounded
  whether or not loading completes, and states what is still loading rather than
  reporting readiness it has not observed.

### Changed

- **The audit trace opens full screen**, from the Trust & Audit tab or by typing
  `/audit`, instead of in a small dialogue. Its shortcut has been removed from
  the status bar at the top of the Command Centre.
- **The startup screen no longer offers "Skip & Enter."** It asked for a decision
  without giving you the information to make it.

---

## 2.1.0 — 16 August 2026

First public download build.

### Added

- **Trust & Audit** as a top-level view: audit trace, verification capability,
  privacy posture, policy and approval, and evidence.
- **Slash commands.** Sixteen commands answered directly without a model in the
  loop, with a `/` menu. An unrecognised command is refused rather than guessed
  at.
- **An OpenAI-compatible local endpoint** at `/openai/v1`, so other tools can
  point at CAIRN and gain its audit ledger and governed model access. A request
  naming a model you do not have is refused with the list of what you do have,
  never quietly substituted.
- **Model Library**, filtered against your machine's measured memory. Every
  listed build can be installed; the recommended one is marked and preselected,
  and choosing another states the consequence rather than blocking you.
- **Cloud spend metering and budget caps**, with daily and monthly limits and a
  choice of falling back to local models or blocking outbound calls.
- **Durable agent sessions** — checkpoint, resume and rollback, each checkpoint
  anchored to the tamper-evident ledger. Rollback states up front that it can
  only undo changes made through CAIRN's own tools.
- **Signed releases and a verifier** you can run without installing or trusting
  CAIRN. It is explicit about what it proves and what it does not.
- **Build identity** shown in the interface and recorded in every ledger entry,
  so any audit record can be tied to the build that produced it.

### Fixed

- **The privacy notice was wrong.** The first screen stated that all reasoning
  stayed local and that only task descriptions left the machine. With a cloud
  key configured, routing sent your message every turn. The privacy posture is
  now derived from your live configuration on every read.
- **Hardware readings were defaults presented as measurements.** A machine with
  31 GB of memory was reported as having 8 GB. Where something has not been
  measured, CAIRN now says so instead of showing a plausible number.
- **Model speed figures were not speed figures.** Stored throughput values had
  measured start-up time instead. They were displayed beside the models they
  described and fed into model selection. Affected figures were withdrawn and
  re-measured.
- **Agent tasks stopped after three steps** because of a stale configuration
  value, and the resulting poor outcomes were recorded against the models rather
  than the cause.
- **Model context windows were capped at 4096 tokens** for most installed models,
  against real limits between 8192 and 131072.
- **Deleted automation scripts could keep running in the background** and were
  logged as restored at every launch.
- **PowerShell verification chose the wrong sandbox**, reporting that no sandbox
  was available on machines where Windows Sandbox was enabled and working.

### Changed

- **Navigation renamed** for clarity: Terminal is now Command Centre, Automation
  Vault is Automations, and Active Daemons is Runtime.
- **Verification, sandboxed execution and the audit ledger are never licence
  gated.** Licensing limits integration breadth and scale, never governance.
- **No automatic update**, deliberately, until releases carry a code-signing
  certificate. An updater that installs unsigned code is a worse problem than
  not having one.
