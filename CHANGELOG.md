# Changelog

Every released version of CAIRN Trust Fabric, and what changed in it.

Entries describe what changed for you as a user: what behaves differently, what
was wrong and is now fixed. They do not list internal refactors. Where something
was previously reported incorrectly, this file says so plainly rather than
recording it as an improvement — a product that asks you to trust its audit trail
does not get to be vague about its own history.

Downloads and verification instructions: [Releases](https://github.com/cairn-trust-fabric/cairn/releases).

---

## 2.4.1 — 21 August 2026

Completes the structural analysis 2.4.0 introduced. That release stopped obfuscated
PowerShell reaching your machine and said plainly that JavaScript, Python and Bash
were still matched by pattern alone. This one closes JavaScript — and explains why
the other two did not need closing.

Nothing was broken in 2.4.0. This finishes something that release started.

### JavaScript is now analysed properly

A saved `.js` script runs on your machine with `node`, outside any sandbox. Until
now, code written to defeat pattern matching got through: a `require()` whose module
name is assembled at runtime, `vm.runInNewContext`, a worker thread built from a
string of code, `process.binding`, the `Function` constructor. None of those look
dangerous to a regular expression, and all of them are obvious once the code is
actually parsed.

**Measured: 9 of 9 known evasions refused, and none of 6 ordinary scripts wrongly
blocked.** The analysis runs in-process, so it costs about a thirtieth of a
millisecond.

Both analysers now run over every executable payload and their findings are
combined, rather than one being picked by guessing which language the code is in.
Guessing was itself the source of a defect during development, so it was removed.

### Why Python and Bash are not analysed

This is a scope, not an omission, and it follows from what CAIRN can actually run:

- **Python** only ever runs inside the Docker sandbox, and only after you approve it.
  There is no path that runs Python directly on your machine, so there is nothing for
  a host-execution check to protect.
- **Bash cannot run at all.** CAIRN executes exactly three languages — Python,
  JavaScript and PowerShell. A shell script is never recognised as one; on Windows it
  falls through to PowerShell, where it either means nothing or is caught by the
  PowerShell analysis.

If either of those ever changes, the change itself will fail CAIRN's own test suite
until the analysis is extended — the assumption is written down as a test rather than
left as an intention.

### Also

- A decision record now shows each analyser's result separately, because one of them
  is legitimately "not applicable" for any given script and a single combined result
  would read as "not checked".

---

## 2.4.0 — 21 August 2026

Three security fixes, two corrections to things CAIRN previously reported
**wrongly**, and the tooling that makes its two operator-declared controls
adoptable rather than merely available.

If you have used a verification grade or the Trust & Audit decision count on an
earlier version, read "Corrections" below. Neither was what it appeared to be.

### Security

- **A command starting with a read-only word skipped the approval prompt
  entirely**, however much followed it. `echo hello; Start-Process notepad.exe`
  ran on your machine without asking, because the check only looked at how the
  command began. Compound commands are no longer eligible for that shortcut. The
  governance gate itself was never bypassed — what this removed was *you*.
- **The API accepted requests from other websites.** A page you visited could
  make CAIRN act — it could not read the results, but it could cause the actions.
  Cross-site requests are now refused, and the first-run setup routes, which sat
  outside the authentication guard entirely, now sit behind it.
- **Memory recall could reach the cloud without passing the egress gate.** If the
  local embedding model was unavailable and you had a cloud key configured, the
  text of your recall query was sent to that provider unexamined — while the
  privacy panel stated that memory ran on local models. The query now goes to the
  egress gate, which refuses it under the default policy, and recall falls back to
  keyword matching on your own machine. What was exposed was the *query*, not your
  stored memories.

### Corrections

- **A sandbox run that failed could be reported as one that worked.** A script
  whose every statement errored inside the Windows Sandbox was graded
  `behaviour_checked` — the grade meaning the code ran *and* its output was
  correct — and the disclosure read "Behavioural checks: 1/1 passed. Output
  matched the expectations derivable from your instruction." Two causes: the
  error stream was folded into ordinary output, so error text satisfied a check
  asking whether the script produced anything; and success was read from the exit
  code alone, which PowerShell sets to 0 even when a command is not recognised.
  **A grade you saw before this version may have been higher than the run
  earned.**
- **The code that was verified was not always the code that ran.** Generated code
  went to verification with its markdown fence still attached and was cleaned only
  afterwards for execution — so the sandbox tested a different artefact from the
  one that ran, and the fence itself was what broke the sandboxed run.
- **Trust & Audit said "Nothing recorded yet" while the ledger held records.**
  The card shows the current conversation only and never said so. It now names its
  scope and points at what exists elsewhere. Opening that tab also used to add
  records to the count it was displaying; it no longer writes to the ledger it
  reports on.

### New

- **Obfuscated PowerShell is now caught.** Code written to defeat pattern
  matching — computed command names, COM objects, .NET process creation, WMI
  invocation — is parsed with PowerShell's own parser and refused before it runs.
  Windows and PowerShell only; Python, JavaScript and Bash are still matched by
  pattern alone, and CAIRN says so rather than implying otherwise.
- **See what a policy would do before you turn it on.** A dry run replays what
  CAIRN has actually done against a policy you are considering and reports what
  would newly be refused. Rules it cannot test against your history are named as
  untestable rather than counted as clean.
- **Worked examples now ship with the application**, and Trust & Audit can install
  one for you, showing you the file first. CAIRN still declares no protected
  systems or autonomy limits of its own — a register CAIRN wrote would not be one
  you chose — and it will never overwrite one you have written.
- **Decisions whose evidence has since changed are found automatically**, nightly,
  rather than only when someone thinks to look. The check reports what it could
  not assess as well as what it could, and says when it has nothing to check.
- **Route Claude Code, Claude Desktop or Cursor through CAIRN's governance**, so
  their tool calls are authorised and recorded like any other. Their calls are
  attributed to them rather than to you, and they can never do more than you can.
  `cairn-integrate` prints the configuration by default and writes nothing unless
  you ask.

### Also

- Memory recall degrades to keyword search instead of returning nothing when the
  local embedding model is unavailable, and results say which basis they used.
- Coverage figures are repeatable between runs for the first time; the test run no
  longer kills workers before they report.
- An approval no longer leaves a timer behind after you answer it.

---

## 2.3.2 — 20 August 2026

The rules an organisation signs into a corporate policy are now actually
enforced — four of the six kinds were not, and CAIRN was recording all six in its
audit trail as though they were. That correction is the reason this release
exists; the rest is new governance you can switch on, and three defects found by
running the build and looking at it.

Versions 2.3.0 and 2.3.1 were built and verified but never released, so this is
the first release since 2.2.4. Two of the fixes below are fixes to fixes made in
those builds, which is why they are described the way they are.

### Fixed

- **Four of the six rule types in a signed corporate policy were doing nothing,
  and the audit trail said otherwise.** If your organisation signed a policy
  requiring approval for certain actions, restricting work to particular folders,
  demanding container isolation, or capping daily cloud spend, **none of those
  four were being applied**. Only the blocked-command and forbidden-path rules
  worked.

  The serious part is not the missing enforcement. CAIRN counted every rule in a
  signed policy into its tamper-evident decision record as an enforced rule, so
  the record showed six rules in force while two were. **If you have relied on
  that count as evidence, it was wrong**, and records written before this release
  carry the old number. All six rule types are now enforced, and the count
  includes only rules that are actually applied. A rule this version does not
  understand — from a policy written for a newer release — is named in the record
  as unenforced rather than counted.

- **CAIRN refused to explain a script sitting in your own vault.** Asked what one
  of your saved scripts does, it replied that it could not access your automation
  vault — a vault it can read, holding a file it had already listed. When you name
  a script you have saved, its contents are now put in front of the model before
  it answers. It only reads a script you actually named; it will not guess which
  one you meant, because a confident explanation of the wrong script is worse than
  being told to look it up yourself.

  Your saved scripts are read and answered on your machine. CAIRN does send the
  *names and descriptions* of your scripts to the cloud model that decides how to
  handle each request — that is disclosed on every call and can be switched off in
  your egress policy — but the contents of a script are not sent to a cloud
  provider, and the default policy refuses to.

- **Code appeared in the chat and was then replaced by a different answer.** What
  you were seeing was the first draft, streamed live before it had been checked,
  run in the sandbox, or repaired — so it was often not the code that ended up
  saved. Generation progress is still shown; the draft itself no longer is. What
  appears in the transcript is the result that was actually verified.

- **The application showed Electron's default icon instead of CAIRN's.** Only in
  the installed build — running from source was always correct, which is how it
  went unnoticed. Fixed twice: the first attempt corrected the window title bar
  and left the taskbar wrong, because the icon file was being loaded in a way that
  silently cannot read that file format at all and quietly fell back to a
  single-size image.

### Added

Three of these are switched off until you configure them, and CAIRN records them
as unconfigured rather than as satisfied — never as "checked and fine". Each is a
JSON file you create in your vault directory, and CAIRN tells you in its decision
record when one is absent, malformed, or contains an entry it could not apply.
Worked examples, and what happens if you get one wrong, are in
[`examples/`](examples/).

- **Risk now reflects what an action would affect, not just how it would do it.**
  Previously, "run a script" carried the same risk grade whether the script
  printed a message or reconfigured a production system. You can now declare which
  systems, folders and kinds of change matter to you, and an action that touches
  one is graded accordingly. Matching is exact and declared by you — CAIRN never
  decides for itself what counts as critical.

  Reading something you have marked as critical is recorded but does not raise the
  grade. Reading it does not change it, and an alert on every read is an alert
  nobody keeps reading.

- **You can cap how far CAIRN is allowed to go.** A ladder — observe, analyse,
  recommend, prepare, execute with approval, execute unattended — mapped to
  combinations of action, target and user. Execution against your production
  systems can be capped at "recommend" while the same tool runs freely elsewhere.
  Rules only ever narrow what is permitted, so adding one cannot accidentally
  widen it. The model has no say in its own level.

- **A consequential turn now leaves a decision record.** When CAIRN authorises an
  action with effect, refuses one, touches a system you declared, or hits a
  ceiling you set, it files a record in its tamper-evident ledger — with what it
  was asked, what it did, what that would affect, and whether the record can be
  accepted as sound. Records that cannot be are still kept, and say why. What
  triggers a record is what CAIRN actually did, never what it said about itself.

- **A decision record has to hold up.** It is accepted only if it does not
  describe evidence you supplied as missing, does reference the evidence it was
  given, was assessed against systems you declared, and can be read back out of
  the ledger. Every one of those is checked mechanically after the fact, not
  claimed by the model.

- **Changing a fact invalidates the decisions that rested on it.** Correct a
  figure or withdraw one, and the decisions built on it are reported as no longer
  current — not as wrong; a decision made correctly on the facts of the day does
  not become a mistake when the facts move. Re-running a decision against
  unchanged evidence is refused outright, and a revision that never mentions what
  changed is reported as what it is.

- **The compliance export now says which artefact answers which control.** The
  signed evidence bundle — decision ledger, execution records, audit trail,
  integrity report, and instructions your auditor can follow without installing
  CAIRN — now carries a mapping to EU AI Act Articles 12, 14 and 15 and SOC 2
  CC6.1 to CC6.8. Every entry also states what the evidence does **not**
  establish, and controls this product cannot speak to are listed as such rather
  than left out.

  **This is not a certification and does not claim to be one.** CAIRN holds no
  SOC 2 report and no ISO 27001 certificate. The bundle produces evidence you use
  to demonstrate your controls; whether it satisfies them is your assessor's call.

### Still true, and worth repeating

- **The installer is not code-signed.** Windows will warn you. Verify the download
  instead — every release carries a signed hash list and a dependency-free
  verifier, and the signing key's fingerprint is published in this repository
  rather than only on the release page.
- **There is no auto-update.** Deliberately: an updater that installs unsigned
  code without checking a signature is a mechanism for installing anything.
  Updates are a download, until code signing exists.
- **CAIRN has only ever been run on Windows.** macOS and Linux builds have never
  been produced or tested.

---

## 2.2.4 — 19 August 2026

A day of ordinary use turned up five defects. Chasing the second one led to a
sixth that matters more than the rest: CAIRN would run a saved script without ever
reading it.

### Fixed

- **Choosing a model for a pillar did nothing.** The dropdowns in Settings → Fleet
  Roles accepted your choice, showed it, and discarded it. The control that saved
  it stopped existing on 10 August and nothing replaced it, so every pin made
  since then was lost the moment the panel refreshed. Choices now apply as you
  make them, and if CAIRN refuses one it says why and puts the previous model
  back rather than displaying a pin that is not in force.
- **Local models could fail outright or run several times slower than they
  should.** CAIRN was asking Ollama for a 131,072-token context window on every
  model regardless of the machine, which pushed models off the graphics card and
  into system memory — and on smaller machines caused the model to fail to load
  at all. On the machine this was found on, one 8B model went from 25 GB and
  mostly on the CPU to 7.3 GB and entirely on the GPU. If a model does fail to
  load, CAIRN now reports what the model runtime actually said instead of a bare
  error code.
- **Chat could fall into repeating itself.** Nothing was set to discourage
  repetition beyond the runtime's own default, which only looks back 64 tokens —
  enough to catch a repeated word and not a repeated sentence. Repetition
  controls are now set explicitly, and if a model still starts looping, CAIRN
  stops it, removes the repeated passage and tells you it did so. Previously the
  loop ran to a length limit and was handed to you as the answer.
- **The Model Library looked broken.** Opening it showed an empty search box, an
  empty result list and no explanation until you pressed Load. It now fills
  itself in when you open Settings, and the pillar and capability filters
  actually re-run the search — before this they changed nothing.
- **Benchmark scores from different versions were being compared with each
  other.** The benchmark changed on 10 August: half its checks had never been
  evaluated before that date. Scores from either side sat in one list and helped
  decide which model backed which pillar, so a model could rank higher for having
  been measured under the older, easier version. Results now record which version
  produced them, and anything from an older one is treated as **not measured**
  rather than as a low score. Your existing scores fall into that category; re-run
  the fleet benchmark to replace them.
- **A model with no recorded speed was treated as having a speed of zero**, which
  pushed it down the ranking for never having been measured rather than for being
  slow.

### Added

- **CAIRN will no longer run a script it has not read.** Running a saved script by
  name skipped the safety check entirely — the check only looked at code pasted
  directly into a request, so anything already in your Automation Vault was
  approved on the strength of its filename. A saved script is now read and checked
  before it is allowed to run, exactly as pasted code always was, and a script
  that cannot be found or read is refused rather than approved. This also applies
  to organisation-signed policies: a policy that forbids a command now stops a
  saved script containing it, which it did not before.
- **The context window each model gets is now measured rather than assumed.** It
  is set from the size of the prompts that model has actually been sent, bounded
  by what your machine and the model can support, and the Model Fleet tab says
  which of those decided it.
- **Models made redundant by a newer version of themselves are listed for
  removal.** If you have both Qwen 2.5 and Qwen 3 of the same size and build,
  Settings now says so and offers to remove the older one. It only proposes;
  nothing is deleted unless you ask, and a model currently backing a pillar is
  shown but not offered, because removing it would leave that pillar to fall back
  to whatever ranked next.

### Known limitations

- **CAIRN judges how an action is performed, not what it would affect.** Running a
  script is assessed on what the code does — deleting files, reaching the network
  — and never on what system it touches or how important that system is. A script
  that reads as harmless is treated as harmless whether it runs on a spare laptop
  or a production cluster. Making that distinction requires you to declare which
  systems are protected, and that is not built. Do not read the approval step as
  an assessment of business impact.
- **There is still no automatic update.** A downloaded 2.2.4 stays on 2.2.4 until
  you download again. This remains deliberate: the installers are not
  code-signed, and an updater that cannot verify what it is installing is a worse
  risk than no updater.
- **The installer itself is not covered by automated testing.** The application it
  installs is started and checked before every release; the installation process
  is not.

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
