# Changelog

Every released version of CAIRN Trust Fabric, and what changed in it.

Entries describe what changed for you as a user: what behaves differently, what
was wrong and is now fixed. They do not list internal refactors. Where something
was previously reported incorrectly, this file says so plainly rather than
recording it as an improvement — a product that asks you to trust its audit trail
does not get to be vague about its own history.

Downloads and verification instructions: [Releases](https://github.com/cairn-trust-fabric/cairn/releases).

---

## 2.2.3 — 17 August 2026

Model recommendations are now checked against the machine they are offered to,
this machine's capacity is stated on the screen that lists its models, and the
opening suggestions are chosen from what your install can actually do.

### Fixed

- **Upgrade recommendations were never checked against your hardware.** The
  memory figure was passed to the cloud model as advice and nothing enforced it,
  so a machine that cannot hold a 32B model was routinely offered one. Every
  recommendation is now sized against your machine before you see it. Anything
  that will not fit is listed separately with the reason and the figure it was
  judged against, rather than being either offered or quietly dropped.
- **The recommendations panel claimed a basis it did not have.** It said the list
  was "based on your hardware limits and fleet performance"; no benchmark result
  reached that decision at all. It also reported "Incumbent Fleet Evaluated" on
  every render, including from the button that runs no benchmark. Both statements
  are gone. If you relied on either, they were not telling you what they appeared
  to.
- **Only the first upgrade card was drawn.** The panel stopped at the first
  recommendation you did not already have installed, so six of seven cards, the
  note explaining what had been filtered out, and the summary beneath them never
  appeared. Present since 2.2.0.
- **A recommendation could say "NEW" while stating its own size on disk** — an
  untagged model name and the same model recorded with `:latest` were compared as
  though they were different models.
- **The built-in recommendation list offered models too large for smaller
  machines.** It made a single distinction, at 32 GB, so an 8 GB laptop and a
  24 GB workstation were offered the same 14B build. It now has four bands
  matched to the hardware tiers CAIRN already reports.
- **A failed hardware probe reported itself as a measurement.** When your machine
  could not be read, the substituted figures were indistinguishable from real
  ones. They are now labelled wherever they appear, and nothing is withheld from
  you on the strength of them.

### Added

- **A capacity summary at the top of Model Fleet** — your processor, memory,
  graphics memory and tier, the model size this machine suits, and whether those
  figures were measured or assumed. Every installed model now says whether it
  runs in graphics memory or spills into system memory, with its size, so a model
  running several times slower than it could is visible rather than silent.
- **A filter for models that run in graphics memory**, off by default, which
  states how many it is hiding rather than simply showing fewer.
- **Opening suggestions chosen for your install** — reflecting the connectors you
  have configured, the scripts you have already saved, and how capable your local
  models are. They no longer run out after the first three are used. Every
  suggested phrase either resolves to a command answered without a model, or is
  an ordinary request.

### Known limitations

- Model sizes for anything not yet installed are estimated from the model's
  parameter count, and are labelled as estimates wherever they are shown. Sizes
  for models you already have are read from disk.
- The installer itself remains untested, including upgrading over a previous
  version. Launching the packaged application is checked before every release;
  running the installer is not.
- Ledger timestamps come from your machine's clock and are not independently
  attested. The order of records is evidence; the wall-clock time is not.
- No automatic update, deliberately, until releases carry a code-signing
  certificate.

---

## 2.2.2 — 17 August 2026

Interface corrections found by reviewing the running 2.2.1 build. Three were
failures that produced something indistinguishable from success.

### Fixed

- **"What can you do?" was answered by a language model, and got CAIRN wrong.**
  The first suggestion in the opening message — and, since 2.2.1, a one-click
  chip — had no handler, so it reached the router and came back describing CAIRN
  as a large language model that is "currently under development". It now answers
  from measured state with no model involved, and says plainly that CAIRN is the
  layer between you and the models rather than one of them.
- **The command menu opened off the top of the window.** Typing `/` always built
  the list, so nothing appeared to be wrong — it was simply positioned where you
  could not see it. It now opens above the message box, filters as you type,
  moves with the arrow keys, runs on Enter, closes on Escape, and tells you when
  nothing matches.
- **The window title read "AI Hub"** instead of CAIRN Trust Fabric, and used the
  name you gave your agent — so renaming your agent renamed the product.
- **Trust & Audit cards did not line up**, leaving the shortest card looking as
  though it had failed to load.

### Added

- **A Governance activity card** in Trust & Audit: decisions recorded and
  refused, how the risk assessment graded them, and the split between read, write
  and execute. Counts with their categories intact, deliberately not combined
  into a single compliance score — one number would aggregate things that are not
  comparable and would move for reasons unrelated to whether the system is
  behaving.

---

## 2.2.1 — 17 August 2026

First-run corrections. Two were failures that produced something
indistinguishable from success, and one was introduced by 2.2.0's own download
fix reaching only one of two code paths.

### Fixed

- **First-run setup produced no usable audit record.** Its audit calls were made
  in a shape the logging function does not accept, so a record was written that
  contained none of the information it was made with.
- **The first-run wizard and the Model Library used two separate downloaders**,
  and 2.2.0's download fix reached only the second. The wizard's could stall or
  abort on large models over slow connections. Both now use one implementation,
  and the wizard shows the same measured byte counts the Model Library gained in
  2.2.0.

### Added

- **First-run setup is recorded in the tamper-evident ledger**: which model backs
  each pillar, and whether cloud routing was enabled — the setting that
  determines what leaves your machine. Your API key is never recorded, only
  whether one is present.
- **Clickable starter suggestions** above the message box. Each disappears once
  you have used it; re-running guided setup brings them back.

### Changed

- **The licence step is no longer the first thing a Community user is asked to
  do.** Governance, the decision ledger, sandboxed execution and audit are never
  gated, so leading with it implied a restricted build.

---

## 2.2.0 — 17 August 2026

A hardening release. Three of the fixes below were failures that returned
something indistinguishable from success, and all three were found by running
the product rather than by a test.

### Fixed

- **An empty policy ruleset could authorise an action.** Compliance was decided
  by "no rule objected", which is trivially true when no rules have run. A pass
  now requires that every registered rule was evaluated and satisfied, and the
  governance gate refuses independently if no rules are loaded.
- **An expired corporate policy kept being enforced as valid.** Expiry was
  checked once, when the policy was first loaded, and the result cached for the
  life of the process — so an instance running for days or weeks never
  re-evaluated it. It is now re-checked on every read.
- **Downloading a model claimed it was installed before anything downloaded.**
  Choosing a model reported "installed and assigned" within milliseconds and
  reassigned the pillar immediately, long before any data had transferred. The
  pillar is now reassigned only after the download completes and the model is
  confirmed present, and it keeps running its existing model until then.
- **Downloads showed no progress on the card that started them.** Model Library
  cards now show a live bar with the percentage and how much has transferred.
- **A pillar could be assigned to a model that is not installed.** Such an
  assignment is now refused with the reason, and the pillar is left unchanged.
  **If you have used Download and Assign before this release, check your fleet
  settings** — configurations written by the old behaviour may name models that
  were never downloaded, and CAIRN has been quietly running a different one. The
  fleet panel now reports these instead of hiding them.

### Added

- **Every governed decision records which policy ruleset produced it**, inside
  the tamper-evident ledger. A rule weakened after the fact becomes visible as a
  change rather than passing unnoticed.
- **Ledger verification now says what it checked.** Routine checks start from a
  signed checkpoint and report how many records were re-read, how many were
  accepted on that checkpoint's authority, and when the chain was last verified
  end to end. A full verification runs at startup and nightly; if it has not run
  recently the evidence card reads **Full check overdue** rather than showing a
  pass. A fast check cannot detect a record altered before the point it starts
  from, and the interface says so rather than implying otherwise.
- **The policy card reports what is being enforced**, not only how many actions
  were refused — "nothing refused" and "nothing enforced" no longer look the
  same.

### Known limitations

- **Ledger timestamps come from this machine's clock** and are not independently
  attested. The order of records is evidence; the wall-clock time is not.
  External timestamp anchoring is designed and not yet built.
- **CAIRN is still not code-signed by a certificate authority.** Windows will
  warn on download. Verify the release before installing — see below.

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
