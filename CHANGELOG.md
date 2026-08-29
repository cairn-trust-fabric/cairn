# Changelog

All notable changes to CAIRN Trust Fabric will be documented in this file.

Versions are set only by `node scripts/version.js`, which is the single source of
`package.json`, `src/version.js` and the installer names. `npm run build` refuses
to package a version that has no section here — see `scripts/check-version.js`.

## [2.8.1] - 2026-08-29

Every fix here was found by using the product against real requests, rather than
by its automated checks — which reported no problem while all of these were live.
Two of them were introduced by 2.8.0 itself, hours earlier.

### Fixed

- **One unreachable inference host made the entire fleet unavailable.** If the
  host you set as the default was switched off, CAIRN reported its model
  registry as empty and left every pillar with no model — even when another
  declared host on the same machine was running and holding every model those
  pillars name. It now checks every host you have declared before concluding
  anything, continues with the ones that answer, and says plainly which host is
  missing and that models living only there are unavailable.
- **A model's capabilities were read before they had been measured.** Tool-calling
  support is probed shortly after startup, and until that probe finished the
  answer read as "no". On the boot pass this rejected valid pillar assignments —
  three of them, seconds before the same run reported the probe complete. An
  unmeasured capability is now treated as unmeasured rather than as absent.
- **A corrected tool call could silently lose what you actually said.** New in
  2.8.0: when a tool call is refused for using the wrong argument names, CAIRN
  retries it once with corrected names. Asked to remember a project codename, the
  correction renamed the arguments properly and dropped the codename itself,
  then reported the retry as successful. A retry that no longer carries a value
  from your original request is now abandoned rather than run, and the reason
  says which value went missing.

### Known issues, found in the same run and not yet fixed

Stated here rather than left out, because a user who hits one is entitled to know
it is known:

- Asking for something read-only can still be routed to a command that generates
  and runs a script, which is slower and asks for approval it should not need.
- A question with a settled answer can be routed to a web search, and if that
  search returns nothing useful the answer is lost rather than falling back to
  what the model already knows.
- An informational question about a pillar can be misread as a request about a
  saved skill, and create one.

---

## [2.8.0] - 2026-08-29

Three things this release fixes were reported by an operator using CAIRN, not
found by its tests. Each is written up here in the terms the operator would use.

### Added

- **CAIRN now tells its router what each tool's inputs are called.** It never
  did. The router had to infer parameter names from a tool's description, and a
  quarter of tool calls in a replay of the audit log had supplied arguments the
  tool could not use. The gate that catches those calls was added earlier and
  made the failures visible without removing the need to guess; this removes it.
- **A tool call refused for a wrong argument name is now corrected and retried
  once**, instead of the refusal text being handed to the model that writes your
  reply. The retry goes through the same permission gate and approval prompt as
  the original — a correction can never turn a refused read into something that
  runs — and it happens once, not in a loop.
- **A turn that fails now leaves a record in the audit trail.** Previously, if a
  request errored, you saw the error in the chat and nothing whatsoever was
  written to the audit log. A trail that records only the requests that went
  well cannot answer the question people actually bring to it.
- **CAIRN checks a model can do a pillar's job before using it there**, and
  tells you when it declines one you chose. Each pillar already declared what it
  needs — the vector-memory pillar an embedding model, the trust gate a model
  small enough for its latency budget — and your own overrides were the one path
  that skipped those checks entirely. Refusals appear on startup, in `/status`
  and in the audit trail, naming the pillar, the model and the reason, so
  nothing is quietly swapped behind your back.
- **The vector-memory pillar now decides what does the embedding.** Its model
  was fixed in code, so assigning a different one changed a label and nothing
  else. Memories embedded by a different model are kept out of semantic
  matching rather than silently scoring zero, and results say when that happened.
- **Benchmark results explain themselves.** Each failing task now names what
  went wrong — the tool that was never called, the arguments that did not
  match, or the answer that missed — rather than a single percentage.

### Changed

- **The pillar icons in the top status pill are larger.** They are the only
  indication of which pillar is working, and at the previous size most were
  distinguishable only by outline.
- **Model recommendations will not suggest an older generation than one you
  already have installed.** Where your fleet holds a newer version of the same
  model at the same size, that is what gets recommended.
- **First-run setup no longer names example models in its prompt.** It asked for
  current releases and then showed a list of older ones, which is what it
  returned. It now describes what each pillar needs instead.

### Fixed

- **A simple question could produce two refusals and no answer.** A routing
  mistake in a tool's arguments was correctly refused, and the refusal was then
  handed to the model that writes your reply as though it were a result to
  answer from. It returned nothing, and a second failure notice was printed on
  top of the first.
- **Benchmark scores were not comparable between models, and model assignment
  ranked on them.** A model that happened to mention the expected answer inside
  a tool argument had that task removed from its own total, so one model could
  be scored out of 15 while another was scored out of 16. Separately, the
  benchmark counted a model's written plan steps as tool calls, so "did it use
  the right tool" was being checked against narration. **Scores recorded by
  earlier versions are now treated as absent rather than low — re-run the fleet
  assessment to replace them.**
- **A crash in the handler for a request that had already gone wrong**, reachable
  when the model that writes replies failed on a turn that used no tools.
- **Re-running a script that had worked could be refused**, with a message
  saying it had not gone through — something nothing had actually checked. Found
  and corrected during development of this release.
- **Approval prompts could fail to appear** on one of the two paths that render
  them, so a request would wait for a decision on a dialog you were never shown.
- On Windows, the account name CAIRN records for an action no longer includes
  the machine or domain prefix.

### Not in this release

- Automatic updates. CAIRN does not check for, download or install new versions
  by itself, and this release does not change that. Updating is a deliberate act.
- macOS builds. `build:mac` has still never been run, so no macOS package exists
  and none is published here.

---

## [2.7.0] - 2026-08-26

### Added

- **A pillar pinned to a specific host now prefers models that actually live
  there.** Previously, pinning a role to a declared accelerator had no effect
  on which model got assigned to it — the assignment logic never looked at
  where you'd pinned that role, so it could hand it a model that only exists
  on your desktop.
- **You can declare how much memory a remote host has**, so a pillar pinned to
  a smaller accelerator won't be assigned a model too large to fit. This is
  optional: a host with nothing declared behaves exactly as before.
- **Redesigned host controls** in Fleet Roles: a device picker plus a separate
  "follow the shared default" checkbox, replacing one dropdown that conflated
  the two. You're now warned proactively if the shared default host several
  pillars rely on becomes unreachable, rather than only finding out mid-turn.
- **New pillar icons** across the Fleet Roles panel and the left navigation,
  and a communication-status indicator in place of the old text status pill.
- **Search and map your own codebase.** CAIRN can now index a repository's
  files, do full-text search across them, and trace which files import which
  — useful when you want it to work with a project's own source rather than
  only your notes and conversation history.

### Changed

- **SOTA recommendations now account for accelerators you've declared**,
  rather than only ever measuring against this desktop's own memory.
- **The task queue marks when a manual benchmark and an ordinary request
  overlap**, closing a gap where the two could previously run concurrently
  with no coordination between them.

### Fixed

- **A pillar that must never leave this machine could be assigned a model
  that only exists on a remote host.** Three separate places that write a
  model assignment trusted "known to the fleet" as "installed here" without
  checking; all three now check.
- **A race in the inference-host registry that could corrupt it under
  concurrent writes** is closed with a proper file lock.
- **The desktop app's boot screen no longer gives up early.** It previously
  stopped waiting after a fixed 12 seconds and loaded a blank state even when
  the server was still starting correctly; it now waits for a real answer and
  shows progress instead.

---

## [2.6.0] - 2026-08-24

**You can now tell CAIRN who you are, in a file you control — and every decision
it records says whether that was checked or merely claimed.**

This is the first part of the work that turns CAIRN from a single-user desktop
tool into something an organisation can deploy. Everything here is backwards
compatible: if you add none of the new files, this release behaves exactly as
2.5.1 did.

### Added

- **Declare your role and clearance in `vault/principal.json`.** Previously these
  came from the `CAIRN_ROLE` and `CAIRN_CLEARANCE` environment variables, which
  meant a desktop shortcut, a shell, a parent process or a scheduled task could
  all decide them. Now they are declared in a file inside your vault, alongside
  the autonomy policy they are checked against.

  You may hold **several roles at once** — `"roles": ["developer", "on-call"]` —
  and an autonomy rule matches if any of them applies. The file cannot declare
  your username: that comes from the operating system, it is what appears in the
  audit trail, and a file that tries to set it is refused rather than quietly
  ignored.

- **Autonomy rules can now say which kind of principal they mean.** Write
  `"identity": "user:alice"` or `"identity": "role:auditor"`. Previously a bare
  name was matched against both, so a rule written for a *role* also applied to a
  *user* of that name. Bare names still work and are reported as out of date when
  you preview a policy.

- **Your vault records who first opened it.** If you open a vault belonging to
  someone else, CAIRN tells you at startup and writes it to the audit trail. It
  does **not** refuse — see "What this does not do" below.

- **You can hold fewer permissions than CAIRN grants by default.** List
  `"capabilities": ["read"]` in `vault/principal.json` to stop this installation
  running or writing anything. The list can only ever take permissions away.

- **A new endpoint, `GET /api/trust/vault-owner`,** reporting who owns the vault
  and who is using it.

### Changed

- **The audit trail now records what each autonomy limit rested on.** When a rule
  limits what the agent may do, the record says which attribute matched — your
  username or your role — and whether that attribute came from the operating
  system, from a file you wrote, or from an unverified claim. Nothing about which
  actions are permitted has changed; the record simply stops presenting checked
  and unchecked evidence identically.

### Fixed

- **Policy preview reported that identity-based rules would change nothing.** If
  you used *Preview* on an autonomy policy containing any rule naming a user or a
  role, the answer was always zero, with the explanation that either the limits
  sat above everything in your history or your history did not exercise them.
  **Both explanations were wrong** — the preview was never told which principal
  to replay your history as, so those rules matched nothing.

  **If you previewed a policy with identity rules before 2.6.0, the result
  understated what it would have stopped.** Preview now replays each recorded
  action as the principal who actually performed it. Rules keyed to a *role* are
  reported as not answerable from history — the audit trail records who acted,
  never what role they held — rather than being counted as no match. Supply the
  principal, or samples of your own, for a complete answer.

- **CAIRN described your identity as coming from the operating system, and only
  half of it did.** Your username and Windows account identifier do. Your role and
  clearance came from environment variables that anything launching CAIRN could
  set. The documentation said otherwise in several places and has been corrected.

- **A rule written for a role also matched a user of that name.** Under CAIRN's
  autonomy model rules can only ever restrict, so the effect was someone being
  limited when nobody intended it. Use the `user:` and `role:` prefixes above.

### What this does not do

- **It does not authenticate anyone.** Declaring your own role in your own vault
  is still you declaring your own role, and anyone who can write to your vault can
  change both new files. What changed is that fewer things can set it — a
  shortcut, a shell or a scheduled task no longer can. Real authentication means
  SSO, and that is still to come.
- **The vault owner record is attribution, not access control.** It cannot keep
  anybody out, and CAIRN does not pretend it can. It exists so that "this vault
  belongs to someone else" is something the product can tell you.
- **A licence's seat count is still recorded and still enforced nowhere.**
  Counting installations requires an authenticated identity to attribute them to.
- **There is still no automatic updating.** CAIRN tells you a new version exists;
  you download and install it yourself.
- **Nothing is code-signed on any platform.** Windows will warn you on install.
  Verify the download with `SHA256SUMS.txt`, its signature and
  `verify-release.cjs`, all attached to this release.

---

## [2.5.1] - 2026-08-23

**Linux desktop packages are published for the first time**, and three defects
are fixed that were all the same shape: a statement that was true about this
repository and false about what a user could actually download or read.

### Added

- **AppImage and `.deb` packages are on the release page.** Both were built and
  verified in a clean `debian:bookworm` on 2026-08-22 — `dpkg -s` correct, `ldd`
  reporting no unresolved libraries, Electron starting, SQLite initialising, 62
  tools registering — and then went nowhere, because publishing them was a
  separate decision nobody had taken. They are x64 only, and **nothing is signed
  on any platform**.

  Read `docs/DEPLOY-CONTAINER.md` §2 before deploying on Linux. Three controls
  are **absent** there rather than equivalent: PowerShell structural analysis
  does not exist (`checked: false`), sandboxed verification does not exist
  without a Docker socket, and secret protection is AES-256-GCM with the key file
  beside the ciphertext rather than DPAPI. The product reports the last of those
  itself; the other two are stated in the guide because nothing in the code says
  them.

- **`npm run check:release` reads back what was actually published** and compares
  it against the `gh release create` block in `docs/RELEASE-CHECKLIST.md`, which
  that document calls exhaustive. It fails on a missing artefact, an undocumented
  one, and a signed `SHA256SUMS.txt` advertising a file nobody can download.
  Where it cannot look — no network, no `gh`, no such tag — it reports
  **UNCHECKED** and exits 2, never a pass. Now mandatory in the release
  procedure.

- **A licence is published.** CAIRN Trust Fabric is source-available under the
  **Business Source License 1.1**, converting to Apache 2.0 on 2030-08-23. There
  was no `LICENSE` file at all before this — in either repository — which meant
  the public repository invited contributions under terms that did not exist, and
  the README's "Free / OSS" was not a statement anyone could rely on. `LICENSE`
  and `NOTICE` now ship inside the installer as well.

### Fixed

- **The withdrawn MSI was still on the download page.** The `.msi` target was
  removed from `electron-builder.json` on 2026-08-22 at 18:29, with a test
  asserting it is not shipped. 2.5.0 had been published at 14:57 the same day
  carrying `CAIRN-Trust-Fabric-2.5.0.msi` — 177 MB, signed into `SHA256SUMS.txt`.
  For a day the build config, the test suite, `docs/CLAIMS.md` and
  `docs/HANDOVER.md` all said the MSI was withdrawn while `/releases/latest`
  served it.

  It is deleted from 2.5.0. `SHA256SUMS.txt` was re-issued without it and
  re-signed, **with the `.exe` row carried across byte-for-byte** so that any
  verification performed before the change still holds. The MSI remains
  *withheld rather than retired*: more than a third of binary downloads chose it,
  and it returns once a clean-machine install and uninstall have been performed
  on it.

  **Amended later the same day: the other nine releases were corrected too.**
  2.1.1–2.4.1 each carried an MSI as well, and each has had it removed by the
  same procedure — manifest verified before the change, only the MSI rows
  dropped, every surviving row carried across byte-for-byte, and the result
  re-verified after publishing.

  A final count then found a tenth — **2.1.0**, missed because the tag list had
  been read from a command that pages at ten. It was corrected as well, and
  deliberately **not** signed: it predates CAIRN's signed manifests, and signing
  it now would make a release that was never signed look as though it had been.
  Its notes say so and point at a later release.

  **No `.msi` exists anywhere on the repository**, confirmed across all twelve
  releases by enumeration rather than by a list.

- **A rebuilt installer claimed a commit it was not built from.** `npm run
  build:win` runs `scripts/check-version.js`, not `scripts/version.js --stamp`,
  so a rebuild at the same version kept whatever sha was stamped last — and a
  rebuild at the same version is the ordinary case, being what happens when a
  build is repeated after a fix. An installer rebuilt on 2026-08-22 reported
  commit `57d7686` in `dist/RELEASE.md` and in its own `buildIdentity()`; it came
  from a tree several commits later with uncommitted changes on top, and its
  SHA-256 differed from the published binary of the same name.

  Every ledger record and evidence bundle that build produced inherited the wrong
  sha. `check-version.js` now refuses to package when the recorded commit does
  not describe the tree — allowing only `src/version.js` itself to differ, which
  is what the stamp-then-commit release flow legitimately produces.

- **The public README claimed SOC 2.** A badge read
  `Compliance — EU AI Act | NIST AI RMF | SOC 2`. `docs/CLAIMS.md` grades
  certification **Never** claimed and names that exact string as banned; the
  permitted phrasing is *"produces the evidence your auditor asks for"*. The
  badge is replaced, the compliance section now opens by stating that CAIRN holds
  no certification and none is in progress, and two RBAC claims went with it —
  `rbac.local` was removed from every edition on 2026-08-23 because nothing
  implemented it.

### Changed

- **`seats` is disclosed as decorative wherever it is offered.** It is accepted
  by the mint, defaulted, signed into the payload, echoed on inspection and shown
  three times in the purchase UI, and **nothing reads it to decide anything** — a
  licence for 50 grants exactly what a licence for 1 grants. That had been
  written down in `docs/LICENSING.md` and twice in `docs/HANDOVER.md`, and
  `docs/chapter1_overview.md` quoted per-seat prices anyway, while
  `docs/LICENSING.md`'s own price table carried two per-seat rows forty lines
  below its own warning.

  It is now a value the build checks — `SEATS_ENFORCED` in
  `src/licensing/licenseManager.js` — rather than a rule someone has to remember.
  The mint states the limitation beside the input rather than in a document, the
  per-seat price rows are restated per-node, and
  `tests/licence_copy_honesty.test.js` holds it in both directions: no document
  may quote a per-seat price while the flag is false, and the flag cannot be set
  true unless something actually branches on the number.

- `docs/chapter1_overview.md` §1.5 was rewritten against the real entitlement
  map. It had been wrong in six ways at once, including offering the retired
  Sovereign tier and describing the source as MIT.

---

## [2.5.0] - 2026-08-22

### Fixed — the installer, which had never been checked

- **Three CAIRN products could be installed at once, and the desktop shortcut
  launched the wrong one.** `docs/HANDOVER.md` recorded "the installer has never
  been run". It had been run — at least three times. What had never been checked
  was the result. A registry inspection found:

  | Add/Remove Programs | Binary actually present |
  | --- | --- |
  | CAIRN Trust Fabric **2.0.0** | **2.3.2** in `C:\Program Files` — stale registration |
  | CAIRN Trust Fabric 2.3.2.0 (MSI) | same location |
  | CAIRN Trust Fabric **2.4.1** | 2.4.1 in `%LOCALAPPDATA%` |

  Two Start-menu entries with the **identical name** launching different versions,
  a **desktop shortcut pointing at the older one**, and all of them sharing a single
  vault — the same hash-chained ledger and memory database, with no record of which
  version wrote what.

  Cause: NSIS was `perMachine: false` with `oneClick: false`, which per
  electron-builder's own documentation **shows the install-mode page** and lets the
  operator pick all-users or just-me. NSIS upgrade detection is scope-specific, so
  choosing differently from last time installed alongside rather than over.

  `perMachine` is now `true`, matching the MSI target and
  `docs/ENTERPRISE_DEPLOYMENT_GUIDE.md`, which has documented per-machine
  deployment all along. The scope can no longer drift. `selectPerMachineByDefault`
  is removed — it configured a page that no longer exists.

  A per-machine installer **cannot** adopt a per-user install left by an earlier
  release, so `build/installer.nsh` now detects one, names its uninstaller and says
  the two will otherwise coexist. It warns rather than removes: silently
  uninstalling another copy of the product is not a decision an installer should
  take by itself.

  `docs/CLAIMS.md` downgrades **Windows installer** from *Works* to *Partial*. It
  read *Works* because the two files existed; nobody had looked at what installing
  them did. The upgrade path is fixed forward and **still unverified** — no
  clean-machine install has been performed, and an upgrade over a previous version
  has never been observed succeeding, only observed failing.

### Fixed — the taskbar and tray icon, for the third time and the first correct one

- **The application declared an identity no shortcut carried.**
  `app.setAppUserModelId('com.cairn.trustfabric')`, while `electron-builder`'s
  `appId` — the value stamped onto the Start-menu and desktop shortcuts as
  `System.AppUserModel.ID` — is `com.cairn.desktop`. Measured on the installed
  2.5.0 build:

  | | |
  | --- | --- |
  | shortcut AUMID | `com.cairn.desktop` |
  | runtime AUMID | `com.cairn.trustfabric` |

  When a window's AppUserModelID matches no installed shortcut, Windows cannot
  associate the taskbar button with that shortcut, does not inherit its icon, and
  falls back — which is the "the icon reverted to Electron's" report. The comment
  directly above that call states the requirement: *"It must match the NSIS
  shortcut identity to be honoured."* The code broke it.

  **This is why it kept coming back.** The two earlier fixes were to icon asset
  LOADING, and both were correct. This is identity ASSOCIATION — the same symptom
  from a different cause, so every asset-side fix looked right and changed nothing
  an operator could see.

  It also means the Windows toast this line was originally added for was
  attributed to an identity nothing registered, so that fix may never have worked
  either.

  `tests/windows_app_identity.test.js` compares the two values and fails if they
  ever disagree again. They cannot be reduced to one source: electron-builder does
  not write `appId` into packaged metadata. **The tempting inverse fix — changing
  `appId` to match the code — must not be taken:** the NSIS uninstall GUID is
  derived from `appId`, so it would orphan every existing installation, which is
  the defect this release was cut to repair.

### Fixed — the three findings from the guard-wiring test

- **A second, hazardous credential migration is deleted.**
  `secretStore.js::migrateFromEnvFile` had no callers, and was not merely a
  duplicate of the one that runs. It migrated **every** `key=value` line — so
  `PORT`, `OLLAMA_URL`, `CLOUD_PROVIDER` and `CLOUD_MODEL` would all have been
  encrypted — then replaced the whole of `vault/.env` with a marker, while
  `loadSecretsFromStore()` reads back only four keys. Wiring it, the natural move
  for anyone who found it under the more obvious name in the module that owns
  secrets, would have cost the operator their Ollama URL and port.

- **`describeChildEnv` is now surfaced**, appending a line to
  `/api/privacy/posture`, which the Privacy panel already renders. An operator
  asking what a script CAIRN writes can read now gets a number rather than nothing.

### Changed

- **`registerScript` was investigated and the finding downgraded, not fixed.** It
  was recorded as "no administration path, so the feature cannot be used". That
  overstated it: unattended execution is off unless `CAIRN_ENABLE_AUTONOMOUS_SCRIPTS`
  is set, and the message on the disabled path already tells the operator to
  register scripts in the manifest. Registration is a deliberate manual act, which
  is the right design for granting unattended code execution — and an HTTP endpoint
  that granted it would re-open assessment finding C-4, since the localhost API is
  reachable by any process running as this user. The exemption now carries that
  reasoning.


### Added

- **Update notification — a notifier, never an installer** (`src/updates/`,
  Settings → Maintenance → Updates). There is still no auto-update, and that stays
  a decision rather than a gap: an updater running with
  `verifyUpdateCodeSignature: false` — CAIRN's setting, because there is no
  code-signing certificate — is a mechanism for silently installing unsigned code.

  What made this cheap is that the trust root already existed. Every release
  publishes an Ed25519-signed `SHA256SUMS.txt`, and the checklist calls it a
  mandatory attachment. So the check reads the release list, verifies that manifest
  against a public key **compiled into the build** — not fetched alongside the
  manifest, which would verify nothing — and shows a link. The notice is
  signature-verified even though the installer is not CA-signed, which makes it
  more trustworthy than a typical updater's, not less.

  **Off by default.** No outbound request is made until an operator turns it on;
  consent is timestamped and recorded in the audit trail; the panel names the host
  before consent rather than after. Nothing about the machine is sent — no version,
  no usage, no identifier. Offline degrades to silence, never an error banner.

  **A release whose manifest does not verify renders as a warning with no link**,
  because "an update is available but we could not verify it" sends people to the
  download page, which is exactly where they must not go.

  Verified end to end against the live release feed: the real published manifest
  for 2.4.1 validated against the compiled-in key.

### Fixed (live pass on the Updates card)

- **A failed settings read rendered as "off".** The card fetched its state once at
  init, and on a cold start that races the server coming up — so the fetch threw and
  the card showed an **unchecked** box with a blank version and fingerprint. For this
  particular control that is the worst available outcome: an unchecked privacy toggle
  is a positive claim that no outbound request is made, and the server meanwhile had
  consent recorded. The panel was not stale, it was asserting the opposite of the
  truth about a network boundary. A failed read now disables the control and shows it
  as indeterminate — an honest "cannot tell" — and retries when the tab is reopened.
- **A recovered read still rendered as unknown.** The success path never cleared
  `indeterminate`, so after a failure followed by a successful retry the checkbox
  showed a dash rather than a tick over a setting that was known and on. Found by
  driving the recovery; the failure path looked perfect on its own.

### Changed

- **A pillar is now described in one place, and the cloud model is told what it
  says.** A pillar's requirements lived in five places that disagreed:
  `ROLE_REQUIREMENTS`, `PILLAR_SCHEMAS` and `CONTRACT_ENFORCEMENT`,
  `CAIRN_MAX_PARAMS_B`, and seven hand-written prose labels in the SOTA prompt.
  The prose labels were the only description the cloud model ever received, so the
  richest statement of what a pillar needs was not the one used to choose its model.

  **The concrete defect:** `CAIRN_MAX_PARAMS_B = 4` was enforced in
  `autoAssignSotaFleetRoles` and `getBestLocalModel` and was **absent from
  `ROLE_REQUIREMENTS`** — so `recommendFleet`, the panel with the Install button,
  would offer a 32B model for CAIRN that assignment then refused to assign, leaving
  the operator to work out which of the two surfaces was lying. The number is now
  `ROLE_REQUIREMENTS.cairn.maxParamsB`, `CAIRN_MAX_PARAMS_B` is derived from it, and
  the `role === 'cairn'` special case is gone — any pillar may declare a ceiling and
  every surface honours it.

  `enforcement` (BLOCKING/ADVISORY) is duplicated from `CONTRACT_ENFORCEMENT` rather
  than imported, because that module pulls in the audit writer and the assurance
  grades while this one is deliberately light for the setup wizard and agent runner.
  The duplication is prevented by a test that imports both.

  **Two fields were deliberately NOT added.** `needsStructuredOutput` could not be
  grounded: `PILLAR_SCHEMAS` describes the payload CAIRN hands its own validator,
  not what the model must emit, so deriving it there would have read a fact about
  CAIRN's internals as a fact about model capability. `minContext` likewise —
  `contextDemand.js` measures real traffic per model, and a per-pillar floor would
  be a measurement-shaped number with no measurement behind it.

- **The SOTA prompt's pillar block is generated from that table.** The cloud model
  is now told CAIRN's 4B ceiling, ATLAS's hard `embedding` requirement, the `tools`
  requirement on PATH/FORGE/CRUCIBLE, and — for BLOCKING pillars — that a malformed
  response stops the turn. Stated as a consequence rather than as the label
  "BLOCKING", which is CAIRN's internal vocabulary and means nothing to the model
  being asked. The old prompt's ATLAS hint was `e.g. nomic-embed-text`, naming a
  model where a property was needed. Provenance discipline is untouched: leads still
  only reorder, and can never introduce a name the registry did not confirm.

### Fixed

- **`redactSecrets()` had no callers, and could not have had any as written.** It
  was built to keep credentials out of logs, prompts and the audit trail, and then
  never connected — the same class of defect as the two above it. The reason it
  stayed unconnected is worth recording: it decrypted every secret on **every
  call**, and on the DPAPI backend one decryption is a `powershell.exe` spawn. Wired
  to the audit writer as written, it would have cost three process spawns per
  recorded action, and the first person to profile the product would have removed it.
  A control that gets switched off is worse than one never added.

  Now cached for the process and invalidated on every store mutation, so a rotated
  credential is redacted at its new value rather than its old one. Applied in
  `logAudit`, to the **serialised** record rather than field by field, because a
  credential does not arrive in a field called `password` — it arrives inside
  `metadata`, in a tool's recorded arguments or an error string that quoted the
  request that failed. Redaction failure never costs the record: an audit trail that
  drops entries when a security helper is unavailable has traded a confidentiality
  risk for an integrity one.

  **Deliberately not wired into the cloud egress path.** `egressGate.js` already
  DENIES `secret_like` content at every boundary including local, and refusing to
  send is a stronger answer than sending a redacted copy. Replacing that refusal
  with a redaction would have quietly downgraded a control that currently stops the
  request outright.

- **The setup wizard wrote the cloud API key to `vault/.env` in cleartext**
  (`src/setup/index.js`), bypassing the encrypted store that
  `/api/system/set-api-key` has used since H-3. Reachable only from `bootstrap.js`
  (`npm start`), which is not in the installer's `files` list — so not a shipped
  exposure, which is precisely why it survived, but it is what a developer or an
  evaluator running from source hits. Now routed through `setSecret`, with any
  prior plaintext line stripped rather than left beside the encrypted copy.

- **Three documents told users to put credentials in `.env`.** Nothing in the code
  wrote the plaintext `GITHUB_TOKEN` found at the repository root — the
  documentation asked for it. `CAIRN_V2_ENTERPRISE_USER_MANUAL.md` instructed
  enterprise users to set `GITHUB_TOKEN` in `.env`; `SETUP.md` said the same for
  `GEMINI_API_KEY`; and `chapter7_tools.md` described `manage_secrets` as storing
  keys "in `vault/.env`" — **the plaintext file that tool exists to replace**. All
  three corrected. The manual is the part that matters: a product whose security
  story is encryption at rest cannot ship instructions to defeat it.

- **Four of the seven pillars were scoring their models under the wrong
  capability**, which is why Tier 2 routing had never recorded a single `general`
  observation. `runAgentInner` derived the capability from one ternary —
  `pillarName === 'forge' ? 'coding' : 'reasoning'` — two values for seven pillars.
  CAIRN and BEACON are `general`, CRUCIBLE is `coding`, and all three were written
  as `reasoning`.

  **The damage ran both ways**, because that value is the key for the READ as well
  as the write. CRUCIBLE — the sandbox-repair pillar — was selecting its model from
  evidence about reasoning, and adding its own results back into the pool PATH and
  COMPASS then read. So it was not merely two pillars with no evidence; it was two
  more with the wrong evidence, and the pool the other two consult was being
  polluted by a coding pillar's results.

  It was also unusable at the far end regardless: `recommendFleet` looks up
  measurements with `measuredFor(capability)` keyed on
  `ROLE_REQUIREMENTS[role].capability`, so the writer and the reader disagreed
  about the vocabulary. Measured on the operator's machine after ~6 weeks of real
  use — 23 rows, `coding` and `reasoning` only, `general` empty.

  The capability now comes from `ROLE_REQUIREMENTS`, the same table the consumer
  reads. **ATLAS is a deliberate exception and is documented as one:** its
  `capability: null` describes the embedding model backing the pillar, but the
  agents that map onto it ('researcher', 'rag', 'memory', 'knowledge') reason over
  retrieved context rather than producing vectors. Reading the pillar's value there
  would have asked for an embedding model to drive a ReAct loop. The old ternary
  got ATLAS right by accident; it is now right on purpose.

- **A pinned model could be routed around for any pillar sharing a capability.**
  `CAPABILITY_TO_ROLE` is the inverse of a many-to-one map, so it must pick one
  pillar per capability — `coding` resolves to FORGE, `general` to BEACON. A
  CRUCIBLE step therefore checked FORGE's pin, which is the one thing a pin exists
  to prevent. `getRoutedModel` now accepts an explicit `role`, so a caller that
  knows which pillar it is running says so; the capability still selects the
  evidence. A pillar with no capability at all now routes on the heuristic with a
  stated reason rather than arriving there via `WHERE capability = NULL` matching
  nothing in SQL.

- **A generated script could read every decrypted credential from its environment**
  (`src/security/childEnv.js`). `secretStore.js` was built because secrets sat in
  cleartext on disk, and its own header names the threat: anything with file access,
  "which includes any script the agent itself was persuaded to write". It encrypted the
  disk. It did not change what happens next — `config/index.js` decrypts every
  credential into `process.env`, and **all three host execution routes inherited that
  environment because none of them passed `env`**: `run_saved_script` and `run_command`
  in `tools/executor.js`, and `spawn()` in `src/daemon/manager.js`. A generated
  PowerShell daemon reading `$env:GEMINI_API_KEY` got the key; a Node script reading
  `process.env.GITHUB_TOKEN` got that.

  The only thing in the way was `ENV_SECRET_EGRESS` in `staticScan.js`, a regex
  requiring the environment read and the network call within 80 characters **on the
  same line**. Splitting them across two lines defeats it, and neither AST analyser
  added in 2.4.0 or 2.4.1 looks at environment access at all.

  Child processes now receive an **allowlist** of variables describing the machine —
  paths, locale, processor, user — and nothing else. An allowlist rather than a
  denylist because a denylist has to be right about every credential name that will
  ever exist, and `ATLASSIAN_TOKEN`, which `tools/executor.js` already reads, was
  absent from `SECRET_ENV_KEYS`. Surviving variables are then checked by **value**
  against the withheld credentials, so one secret stored under two names — which
  `/api/system/set-api-key` already does — cannot pass under the benign one.
  `NODE_OPTIONS` is withheld too: it is not a credential, but `--require` makes an
  inherited copy an execution vector.

  Also applied to `runProc()` in `src/forge/verifier.js`, the single layer every syntax
  checker reaches. A checker parsing generated code has no business holding a key.

  **Measured cost: none found.** The documented daemon contract reads its API token
  from `vault/session_token.txt`, a file, and a scan of the operator's own
  `vault/scripts/` found zero references to `$env:` or `process.env` in any script.

### Added

- `tests/security_guards_are_wired.test.js` (5 tests). Every exported function
  under `src/security/` must have a caller outside its own module, or an entry in
  an exemption register **with a written reason**. Fail-closed: a new export must
  justify itself once, rather than accumulating silently the way `redactSecrets`
  did. Scoped to one directory on purpose — a survey across `src/trust/` too
  produced 39 hits, mostly over-exported internal helpers, and a check that fires
  on every unused utility gets switched off within a week. A second assertion
  fails if an exemption goes **stale** (the function became wired), so the register
  cannot rot into a list nobody re-checks. Verified by mutation in both directions.

  **It is not a complete answer and the file says so:** it would have caught
  `redactSecrets` on the day it was written, and would NOT have caught the
  inherited-environment defect, because that was a missing *option* rather than an
  uncalled function.

  **It immediately surfaced three findings, now recorded rather than invisible:**
  `secretStore.js::migrateFromEnvFile` is a **second implementation of the
  credential migration** that disagrees with the one that actually runs (it
  migrates every env key; `config/index.js::migratePlaintextSecrets` migrates only
  `SECRET_ENV_KEYS`); `scriptIntegrity.js::registerScript`/`deregisterScript` have
  no route, tool or UI, so **there is no way to register a script for unattended
  execution** — the enforcement half is wired and the administration half is not,
  which fails closed but means the feature cannot be used; and
  `childEnv.js::describeChildEnv` is a disclosure surface built in this same
  sitting with nothing to render it, which is a fair demonstration of how easily
  this happens.
- `tests/audit_secret_redaction.test.js` (9 tests). A real credential is put into
  three places inside an audit record's metadata — including a nested array — and
  the file on disk is read back to prove none of them became durable, that the
  record was still written, and that the line is still valid JSON. Controls prove
  ordinary text and ordinary records pass through untouched. Verified by mutation:
  removing the redaction call turns the audit test red. `secretStore.js` also gains
  its first coverage floor; the comment in `jest.config.mjs` names exactly which
  half is covered and which is not.
- `tests/agent_capability_attribution.test.js` (10 tests). `resolveAgentCapability`
  is extracted and exported so the mapping can be driven directly — previously the
  only way to observe it was to run a whole agent loop and read the database
  afterwards, which is how it stayed wrong for six weeks. Asserts every pillar
  against `ROLE_REQUIREMENTS`, names the four regressions individually, and proves
  `general` is now reachable at all. Verified by mutation: restoring the ternary
  turns three tests red. The `role` parameter is tested through a difference that
  is genuinely observable — CRUCIBLE's coding preference against COMPASS's absence
  of one — with an explicit check that the two results differ, so the assertion
  cannot pass vacuously.
- `tests/child_env_scrub.test.js` (22 tests). Real PowerShell and Node payloads that
  read the credential variables are executed through the real route and asserted to
  come back empty — **and the same payloads are asserted to leak without the scrub**,
  so the suite cannot pass against a gutted control. That is the §35.5 failure, which
  bit twice in two sessions, written into the test this time. A control case proves
  ordinary scripts still resolve `PATH`, `TEMP` and `USERNAME`, so the proof is that
  the scrub discriminates rather than that it empties the environment. Verified by
  mutation: replacing the filter with a pass-through turns three tests red.

## [2.4.1] - 2026-08-21

Completes the structural analysis 2.4.0 introduced. That release closed obfuscated
PowerShell and said plainly that JavaScript, Python and Bash were still matched by
pattern alone. Tracing what each of those can actually execute turned three open
items into one.

### Added

- **Structural analysis of JavaScript** (`src/security/javascriptAst.js`). A saved
  `.js` script runs as `node <path>` on the host, unsandboxed — `tools/executor.js`
  and the daemon manager both do it — so it needed the same treatment PowerShell got.
  Parsed with `acorn`, which sees what regular expressions cannot: a `require()` whose
  module is computed at runtime, `vm.runInNewContext`, a worker constructed from a code
  string, `process.binding`, the `Function` constructor. Measured through the real gate:
  **9 of 9 known evasions refused, 0 false positives on 6 ordinary scripts.**
  It parses in process, so 100 scans cost 3ms.
- `acorn` as a direct dependency. Pure JavaScript, zero dependencies of its own, no
  native compilation and no ABI rebuild under Electron.

### Changed

- Both structural analysers now run over **every** EXECUTE payload and their findings
  are combined, rather than one being selected by guessing the language. Measured in
  both directions: neither analyser produces a finding in the other's language, and
  PowerShell source reports itself unanalysable as JavaScript rather than clean.
- A decision now records each analyser separately (`structural.javascript`,
  `structural.powershell`). A single combined result would be ambiguous, because one of
  the two is legitimately "not analysed" on any given script.

### Fixed

- Nothing user-visible was broken in 2.4.0. This release closes a stated limitation
  rather than correcting a defect.

### Scope, stated rather than implied

- **Python is not analysed structurally**, and does not need to be: it reaches
  execution only through the sandboxed tool, which is Docker-isolated and asks for
  approval first. There is no path that runs Python on the host.
- **Bash is not analysed, and cannot run at all.** The executable languages are exactly
  Python, JavaScript and PowerShell; a shell-shaped script is never detected as Bash and
  falls through to the PowerShell default, where it is either meaningless or caught.

---

## [2.4.0] - 2026-08-21

Security fixes for three findings from an adversarial audit, structural analysis of
PowerShell, and the tooling that makes the two operator-declared registers adoptable.

**Two things this release corrects were previously reported wrongly.** If you relied on a
verification grade or on the Trust & Audit decision count before this version, read
"Fixed" below — the numbers and grades were not what they appeared to be.

### Added

- **Policy dry-run simulator** (`POST /api/policy/simulate`). Replays recorded ledger
  invocations through the real corporate-policy, protected-target and autonomy-ladder
  implementations, so you can see what a policy would newly deny before you turn it on.
  Rules whose inputs the ledger never recorded are reported `NOT_SIMULABLE` by name, and
  `recordsSimulated` is always shown beside `recordsConsidered` — a partial answer is
  never presented as a whole one.
- **Structural analysis of PowerShell.** Obfuscated code that regular expressions cannot
  see — `& (Get-Command ...)`, `& ("{0}{1}" -f ...)`, COM objects, `[Diagnostics.Process]::Start`,
  `Invoke-WmiMethod` — is now parsed with PowerShell's own parser and refused at the gate.
  Measured: 7 of 7 known evasions refused, 0 of 5 ordinary scripts wrongly blocked.
  PowerShell and Windows only; Python, JavaScript and Bash remain pattern-matched.
- **Evidence staleness watch.** Decisions whose evidence has since changed or been
  retracted are found automatically, nightly, instead of only when someone asked. Reports
  three populations — stale, current, and decisions it cannot speak about — and says so
  when the registry is empty rather than reporting a reassuring zero.
- **Worked examples ship in the installer**, and the Trust & Audit tab can install one for
  you. CAIRN still declares no protected targets or autonomy rules of its own: a register
  CAIRN wrote would not be one you chose. An existing register is never overwritten.
- **Inbound MCP gateway** (`cairn-mcp`) and `cairn-integrate`, so Claude Code, Claude
  Desktop and Cursor can route their tool calls through CAIRN's governance. Calls are
  attributed to the client rather than to you, and a client can never do more than you
  can. `cairn-integrate` prints its configuration by default and writes nothing.
- `npm run check:examples` compares the shipped examples against the published copies and
  fails a release if they disagree.

### Changed

- Memory recall now falls back to keyword matching when the local embedding model is
  unavailable, instead of returning nothing. Results say which basis they came from.
- The Trust & Audit tab no longer writes to the ledger it reports on. Opening it used to
  add records to the count it displayed.
- `npm test` and `npm run test:coverage` no longer force-exit. Coverage figures are
  repeatable run to run for the first time.

### Fixed

- **A sandbox run that failed could be graded as one that worked.** A script whose every
  statement errored inside the Windows Sandbox was reported as `behaviour_checked` — the
  grade meaning the code ran and its output was correct — and the disclosure read
  "Behavioural checks: 1/1 passed." Two causes: the error stream was merged into normal
  output, so error text satisfied a check asking whether the script produced any output;
  and success was taken from the exit code alone, which PowerShell sets to 0 even when a
  command is not recognised. **If you saw a verification grade before this version, it may
  have been higher than the run deserved.**
- **The code that was verified was not always the code that ran.** Generated code was sent
  to verification with its markdown fence still attached, and stripped only afterwards for
  execution — so the sandbox tested a different artefact from the one that ran on your
  machine, and the fence itself broke the sandboxed run.
- **The Trust & Audit tab reported "Nothing recorded yet" while the ledger held records.**
  The card shows the current conversation only and did not say so. It now names its scope
  and points at what exists elsewhere.
- **A command starting with a read-only word skipped the approval prompt entirely**,
  however much followed it — `echo hello; Start-Process notepad.exe` ran without asking.
  Compound commands are no longer eligible for that shortcut.
- **The API accepted requests initiated by other websites.** A page you visited could make
  CAIRN act, without being able to read the results. Cross-site requests are refused, and
  the first-run setup routes now sit behind the same guard as everything else.
- **Memory recall could reach the cloud without passing the egress gate.** If the local
  embedding model was unavailable, the recall query was sent to the configured cloud
  provider unexamined — while the privacy panel stated that memory ran locally. The query
  now goes to the egress gate, which refuses it under the default policy.
- A contract check on generated code could never pass, so every code request logged a
  defect that did not exist.
- Approvals no longer leave a five-minute timer behind after being answered.

---

## [2.3.2] - 2026-08-20

### Fixed

- **The application icon, properly this time.** 2.3.1 fixed the window title bar
  and left the taskbar showing Electron's default. The icon was being loaded in a
  way that silently cannot read `.ico` files at all, so it quietly fell back to a
  single large PNG — which has nothing sized for the small slots Windows actually
  asks for. The icon is now loaded by the one route that reads all seven sizes in
  the file, and the icon files are placed where that route can reach them inside
  an installed application.

---

## [2.3.1] - 2026-08-20

2.3.0 was built and verified but never released. Running it turned up three
things that no test had caught, and this is that build with those fixed.

### Fixed

- **The application showed Electron's default icon instead of CAIRN's.** Only in
  the installed build — running from source was always correct, which is why it
  went unnoticed. The icon files were present and correct the whole time; the way
  they were being loaded does not work inside an installed application package.

- **CAIRN refused to explain a script that was sitting in your own vault.** Asked
  what one of your saved scripts does, it replied that it could not access your
  automation vault — a vault it can read, holding a file it had already listed.
  When you name a script you have saved, its contents are now put in front of the
  model before it answers.

  One limit worth knowing: it only reads a script you actually named. It will not
  guess which one you meant, because a confident explanation of the wrong script is
  worse than being told to look it up yourself.

  Note that your saved scripts are read and answered **on this machine**. CAIRN
  does send the *names and descriptions* of your scripts to the cloud model that
  decides how to handle each request — that is disclosed on every call and you can
  turn it off in `vault/egress_policy.json` — but the contents of a script are not
  sent to a cloud provider, and the default policy refuses to.

- **Code appeared in the chat and was then replaced by a different answer.** What
  you were seeing was the first draft, streamed live before it had been checked,
  run in the sandbox, or repaired — so it was often not the code that ended up
  saved. Generation progress is still shown; the draft itself no longer is. What
  appears in the transcript is the result that was actually verified.

---

## [2.3.0] - 2026-08-20

Governance that was declared and is now enforced, and a decision record that has
to earn its status. 2.2.4 remains valid: every change here tightens what is
enforced or narrows what is claimed, so nothing already published becomes wrong.

**Two things ship declaring nothing, deliberately.** The register of systems that
matter and the autonomy ladder are both empty out of the box, and CAIRN records
them as unenforced rather than as permissive. Worked examples are in `examples/`.
Until you declare something, most of what follows is inert — and says so.

### Fixed

- **Four of the six rule types an organisation can sign into a corporate policy
  were enforced by nothing, and all six were recorded as enforced.**
  `mandatoryApprovals`, `allowedPathPrefixes`, `enforceDockerIsolation` and
  `maxDailyCloudSpendUsd` were declared in the policy schema on 14 August and read
  by no code in `src/` — two of them appeared only inside a comment. Meanwhile the
  rule count written into the tamper-evident ledger counted every key, so an
  organisation could cryptographically sign a policy requiring human approval for
  production changes and CAIRN would record six enforceable rules in its audit
  trail while enforcing none of them. **The ledger reported enforcement that had
  not happened**, which is worse than the feature being absent, because the ledger
  is the artefact the product asks a customer to trust.

  All six rules are now enforced:

  - `mandatoryApprovals` — patterns matched against the tool name. A match now
    requires explicit human confirmation, obtained inside the governance gate so
    that no local whitelist or "approve always" can satisfy it and the ledger
    records the answer a person actually gave. With no channel to ask on — a
    scheduled task, a daemon, a headless API call — the action is refused rather
    than permitted unasked.
  - `allowedPathPrefixes` — when set, a path that cannot be shown to sit under a
    permitted root is refused. `..` is resolved before comparison, case and
    separator differences do not defeat the prefix, and a relative path is refused
    because CAIRN cannot establish where it would land.
  - `enforceDockerIsolation` — when set, every execute-capability tool that runs on
    the host is refused; only containerised execution is permitted.
  - `maxDailyCloudSpendUsd` — the binding daily ceiling is now the lower of the
    organisation's signed limit and the operator's own, and it applies when the
    operator has set no limit at all. Enforced immediately before a cloud call is
    dispatched, which is the only boundary the spend crosses. Corrupting the signed
    policy no longer removes the ceiling: cloud egress stops instead. Local
    execution is never affected by it.

- **The rule count in the ledger now counts only rules that have an enforcement
  path.** A key this build cannot enforce — an unrecognised one, or a known one
  holding a value of the wrong shape — is excluded from the count, named in the
  decision record, and written to the audit log as `CORPORATE_RULE_UNENFORCEABLE`.
  CAIRN still runs in that situation, because version skew across a fleet should
  not be a total outage; what it no longer does is report the rule as being in
  force. Ledger records written before this change carry the old count and should
  not be read as evidence of what was enforced.

- **Nothing recorded that CAIRN has only ever run on Windows.** `npm run build:mac`
  and `build:linux` exist in `package.json`, and no macOS or Linux build has ever
  been produced, launched or tested — the Docker sandbox path is cross-platform in
  principle and unverified in practice, and Windows Sandbox is Windows-only by
  construction. `docs/CLAIMS.md` now says so, because the alternative is a
  procurement answer nobody had checked.

- **Documentation that named enforcement points which did not exist.**
  `docs/SIGNED_CORPORATE_POLICY_ENGINE.md` attributed three of these rules to
  `enforceDefaultApprovalGate()`, `verifier.js` and `sandbox.js`. No such function
  existed and those files never read the policy.

- **A file that described itself as an immutable ledger and was an array.**
  `src/trust/decisionLedger.js` claimed to record "an append-only,
  cryptographically hashed decision trail". It holds records in memory, their hash
  chains to nothing, chain verification has never seen them, and they are
  discarded when the process exits. Nothing there was written dishonestly — the
  file sat beside a real hash-chained ledger and borrowed its vocabulary — which
  is exactly the drift the capability register exists to catch. The description is
  corrected and now points at the real ledger.

### Added

- **A consequential turn now leaves a decision record on its own.** Everything
  above had to be asked for. A request arriving through CAIRN produced an answer
  and an audit trail and nothing else — which is exactly what happened on 18
  August, when a production change request was assessed and the audit log recorded
  nothing at all for that day.

  A turn now files a decision record when CAIRN's own ledger shows something
  happened: an action with effect was authorised, something was refused, a system
  the operator declared was touched, or an autonomy ceiling applied. The record is
  graded against the same criteria as any other and says plainly whether it can be
  accepted.

  **What decides is what CAIRN did, not what it said.** The routing plan is never
  consulted — it is the model's own output, and a model able to skip governance by
  choosing a different label for its action would have a one-word exemption from
  it. A test reads the source to confirm the plan is never referenced.

  On a machine with no protected systems declared, a purely advisory turn still
  files nothing: until somebody says which systems matter, nothing measurable
  separates a question about production from any other question.

- **Changed evidence now invalidates the decisions that rested on it.** Every
  fact CAIRN is given carries a content fingerprint, and every decision records
  the fingerprints it was formed from. When a figure is corrected or withdrawn,
  the decisions that depended on it are found by comparing hashes — nobody has to
  remember which decisions used what. They are reported as **no longer current**,
  not as wrong: a decision made correctly on the facts of the day does not become
  a mistake when the facts move.

- **A re-evaluation now has to be one.** Supplying new evidence and asking again
  produces a second answer that always *looks* like a re-evaluation — longer,
  mentioning the new figures, equally confident. Three things separate the two,
  and none of them reads the prose for quality: re-running against an unchanged
  evidence set is **refused outright**; a revised record that is word-for-word
  identical to the one it replaces is reported as an append with a new timestamp;
  and the revision is checked for whether it actually references the facts that
  moved. A revision that ignores the new telemetry cannot be accepted.

  It does not require the decision to change. "Still recommended against, and here
  is why the new evidence does not alter that" is a good re-evaluation — demanding
  a different verdict would just teach the system to flip its answer.

- **A decision record now earns its status instead of asserting it.** The record
  produced on 18 August assigned itself an identifier, wrote its own status line,
  and left no trace anywhere in CAIRN — the audit log holds entries for the days
  either side of it and none for the day it was made. It was a document the model
  wrote.

  A decision record is now a contract, using the same state machine and the same
  invariant the rest of CAIRN uses for verified work: it reaches *accepted* only
  when every acceptance criterion has been evaluated and passed, and a criterion
  is a function that reads what CAIRN measured rather than a claim the model made.
  Four of them ship: the record does not describe supplied evidence as missing, it
  references the evidence it was given, what the action would affect was assessed
  against a declared register, and the record can be read back out of the
  hash-chained ledger by its identifier.

  **A record that fails is still recorded.** Refusing to write down a bad decision
  would be worse than grading it — the same reasoning that makes the compliance
  bundle export a broken ledger chain rather than suppress it.

- **Decision records survive a restart.** They are written to the hash-chained
  ledger — the one that is verified, checkpointed and exported to auditors — and
  reading one back is an acceptance criterion rather than an assumption, so a
  decision that could not be stored cannot be accepted.

- **Worked example configurations, in `examples/`.** The protected-target
  register and the autonomy ladder both ship declaring nothing — the honest
  default, since an absent control is recorded as absent rather than as a pass —
  but it left an operator reading a schema to get started. There is now a working
  register, a working ladder and a README that says which vault file each one
  copies to and what happens when it is absent.

  Each example is exercised by the test suite rather than merely parsed: an
  example that loads but whose entries never match would be the
  declared-and-ignored pattern arriving through documentation. The build fails if
  an example stops loading, if any entry in one is rejected, or if a rule stops
  doing what its own note says it does.

- **Policy now decides how far the agent may go.** An operator can declare an
  autonomy ladder in `vault/autonomyPolicy.json` — observe, analyse, recommend,
  prepare, execute with approval, execute autonomously — and map combinations of
  action class, target class and identity to a maximum permitted level. Execution
  against a protected production system can be capped at "recommend" while the
  same tool runs freely everywhere else.

  Rules combine by **lowering only**: the lowest matching ceiling wins, so adding
  a rule can never widen what is permitted. The alternative — most-specific-wins —
  means an operator has to reason about precedence to know what their own policy
  does, and its failure mode is a narrow exception silently overriding a broad
  restriction.

  **The model has no say in its own level, and that is enforced by the shape of
  the code rather than by a filter.** The function that resolves the level takes
  no tool-argument parameter, so there is no slot for model output to arrive in.
  A filter would have to anticipate every spelling — `autonomyLevel`,
  `autonomy_level`, `_autonomy`, a level nested in another object, a level written
  into the script being run. All of those are tested; each one leaves the resolved
  level unchanged, and adding an arguments parameter to that function fails the
  build.

  As with the protected-target register, **no ladder is declared by default**.
  An unconfigured policy is recorded as not enforced, with the reason — never as
  permission to act autonomously.

- **Risk now reflects what an action would affect, not only how it would do it.**
  CAIRN graded an action from the tool's capability class and a static scan of the
  code — both descriptions of the *mechanism*. So "run a script" was MEDIUM whether
  the script printed a message or reconfigured a production cluster carrying
  fourteen critical trading sessions. That was recorded in `docs/CLAIMS.md` as
  **Not claimed** and it is the gap the decision-test exercise actually exposed.

  An operator can now declare what matters, in `vault/protectedTargets.json`:
  systems, path prefixes, service classes and change classes, each with a
  criticality. Declared targets are matched against what the action would actually
  run — including the contents of a script invoked by name — and a match raises the
  grade to the declared criticality. The record keeps the mechanism grade beside the
  final one, so a reader can tell which of the two raised it.

  Three things it deliberately does not do. It never asks a model what is critical:
  every match is a literal string or path comparison, because the model is the thing
  being governed. It never treats a **read** of a protected target as affecting it —
  the match is recorded, the grade is not raised, because an alert on every read
  becomes noise and then becomes ignored. And **an empty register is never a pass**:
  with nothing declared, the record says consequence was not assessed and gives the
  reason, rather than reporting a low grade that looks like a verdict.

- **A decision record is now checked against the evidence it was given.** On
  18 August a record stated, under *Facts*, that the cluster's current overcommit
  ratio "is not stated in the change request" — the request stated 4:1. An
  assumption in the same record put peak utilisation under 40% when the request
  said 94%. Re-run on the rebuilt system, the bare model with no CAIRN around it
  handled the evidence better.

  Evidence is now supplied as identified items rather than sentences in a
  paragraph, and after the record is produced it is checked against them: which
  items were actually used, which figures appear in no evidence item, and which
  passages describe as missing something that was supplied. The check is arithmetic
  and string matching over two pieces of text. **It asks the model nothing** — a
  model's account of its own reasoning is another generation, not provenance.

  What comes out is a count, never a confidence score: *"0 of 2 figures in this
  record trace to supplied evidence; 6 of 6 supplied items were never referenced;
  1 passage describes supplied evidence as missing."* Those are the real numbers
  for the 18 August record, and that record is the fixture the tests run against.

- **The compliance evidence export is now registered, tested and mapped to
  controls.** `src/compliance/evidenceBundle.js` produces the artefact a customer
  hands to an auditor — a signed manifest, the hash-chained decision ledger,
  execution spans, the audit stream, an integrity report and instructions that use
  nothing but Node's built-in crypto. It shipped without a `docs/CLAIMS.md` row and
  without a single test, which meant that under CAIRN's own rules it could not be
  described in a sales conversation and nothing established that it worked.

  It now carries four register rows (including two stating what it does **not**
  prove), a 24-test suite, and a coverage floor in `jest.config.mjs` alongside the
  other controls. The suite asserts the property most likely to be "corrected" by
  someone who has not thought it through: **a broken ledger chain still exports,
  and says so.** Refusing to export a tampered trail would let anyone destroy the
  evidence of having tampered with it.

- **A control mapping travels inside each bundle.** `controls.json` states which
  artefact relates to which control — EU AI Act Articles 12, 14 and 15, and SOC 2
  CC6.1 to CC6.8 — so an auditor does not have to derive it. Every entry carries a
  `doesNotEvidence` list beside its evidence, and controls a locally installed tool
  cannot speak to are listed as `not-evidenced` rather than quietly omitted. The
  map is data, editable by copying it to `vault/controlMap.json`; the manifest
  records which copy was used.

  **It is not a certification and says so in the file that reaches the auditor.**
  CAIRN holds no SOC 2 report and no ISO 27001 certificate, and `docs/CLAIMS.md`
  now carries a **Never** row for that claim.

- **A structural guard against the same class of defect returning.**
  `tests/corporate_policy_enforcement.test.js` cross-references three structures
  authored in three files for three different reasons — the policy schema, the
  enforcement registry, and a fixture per rule proving the rule changes an outcome.
  A rule type added to the schema with no enforcement fails the build, as does an
  enforcement that does not actually bite. The failure being guarded against is
  silent by construction: a declared-and-ignored rule throws nothing, logs nothing,
  and is indistinguishable in the audit trail from a rule that was checked and
  passed.

## [2.2.4] - 2026-08-19

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

## [2.2.3] - 2026-08-17

Model recommendations are now checked against the machine they are offered to,
this machine's capacity is stated on the screen that lists its models, and the
opening suggestions are chosen from what your install can actually do.

### Fixed

- **Upgrade recommendations were never checked against your hardware.** The
  memory figure was one line of advice in a request to the cloud model and
  nothing enforced it, so a machine that cannot hold a 32B model was routinely
  offered one. Every recommendation — searched or built-in — is now sized against
  this machine before you see it. Anything that will not fit is listed separately
  with the reason and the figure it was judged against, rather than being either
  offered or quietly dropped.
- **The recommendations panel claimed a basis it did not have.** It said the list
  was "based on your hardware limits and fleet performance"; no benchmark result
  reached that decision at all. It also reported "Incumbent Fleet Evaluated" on
  every render, including from the button that runs no benchmark. Both sentences
  are gone, and what is left is what the panel can support.
- **Only the first upgrade card was drawn.** The panel stopped at the first
  recommendation you did not already have installed, so six of seven cards, the
  note explaining what had been filtered out, and the summary beneath them never
  appeared. Present since 2.2.0 and found by opening the panel.
- **A recommendation could read "NEW" while stating its own size on disk.** An
  untagged model name and the same model recorded with `:latest` were compared as
  though they were different models.
- **The built-in recommendation list offered models too large for smaller
  machines.** It made one distinction, at 32 GB, so every machine below that —
  an 8 GB laptop and a 24 GB workstation alike — was offered the same 14B build.
  It now has four bands, matched to the tiers the hardware check already reports.
- **A failed hardware probe reported itself as a measurement.** When the machine
  could not be read, the substituted figures were indistinguishable from real
  ones. They are now labelled everywhere they appear, and nothing is refused on
  the strength of them.

### Added

- **A capacity summary at the top of Model Fleet.** Your processor, memory,
  graphics memory and tier, the model size this machine suits, and whether those
  figures were measured or assumed. Every installed model now says whether it
  runs in graphics memory or spills into system memory, with its size — so a
  model that is quietly running several times slower than it could is visible.
- **A filter for models that run in graphics memory**, off by default, which
  names how many it is hiding rather than simply showing fewer.
- **Opening suggestions chosen for your install.** They now reflect the
  connectors you have configured, the scripts you have already saved, and how
  capable your local fleet is — and they no longer run out after the first three
  are used. Every suggested phrase either resolves to a command answered without
  a model, or is an ordinary request; a suggestion that claims to be the former
  without being checkable now fails at startup rather than in front of you.

---

## [2.2.2] - 2026-08-17

Interface corrections found by operator review of the running 2.2.1 build. Three
of these were failures that produced something indistinguishable from success.

### Fixed

- **"What can you do?" was answered by a language model, and got CAIRN wrong.**
  The first suggestion in the opening message — and, since 2.2.1, a one-click
  chip — had no handler, so it went to the router and came back claiming CAIRN is
  a large language model that is "currently under development". It now answers
  from measured state with no model in the loop, and says plainly that CAIRN is
  the layer between you and the models rather than one of them.
- **The command menu rendered off the top of the window.** Typing `/` always
  built the list and reported it as shown; it was positioned against the wrong
  ancestor and appeared 172 pixels above the visible area, so it looked as though
  nothing happened. It now opens above the message box, filters as you type,
  moves with the arrow keys, runs on Enter, closes on Escape, and says so when
  nothing matches.
- **The window title read "AI Hub"** on launch and while loading, instead of
  CAIRN Trust Fabric. It also interpolated the name you gave your agent, so
  renaming the agent renamed the product.
- **Trust & Audit cards did not line up.** Each card shrank to its own content,
  so a row read as a ragged staircase and the shortest card looked as though it
  had failed to load.

### Added

- **A Governance activity card** in Trust & Audit: how many decisions were
  recorded and how many refused, how the static risk assessment graded them, and
  the split between read, write and execute. Counts with their categories intact
  — deliberately not combined into a single compliance score, which would
  aggregate things that are not comparable and move for reasons unrelated to
  whether the system is behaving.
- **A startup check that a suggested phrase still has a handler.** Any starter
  prompt marked as scripted now fails at startup if it stops resolving, rather
  than silently reaching a model.

### Known limitations

- Ledger timestamps come from this machine's clock and are not independently
  attested. The order of records is evidence; the wall-clock time is not.
- CAIRN is still not code-signed by a certificate authority. Windows will warn on
  download. Verify the release with the included verifier.

---

## [2.2.1] - 2026-08-17

First-run corrections. Two of these were failures that produced something
indistinguishable from success, and one of them was introduced by 2.2.0's own
fix landing on only one of two code paths.

### Fixed

- **First-run setup produced no usable audit record.** Both of its `logAudit`
  calls passed a single object, but the function's two-argument shim requires a
  string action name first — so the call succeeded, a record was written, and
  every field the caller passed was discarded, leaving an anonymous
  "System Action" with a generic rationale.
- **The first-run wizard and the Model Library were two separate downloaders**,
  and 2.2.0's download fix reached only the second. The wizard built a shell
  command line by string interpolation, inherited `exec`'s 1 MB output buffer —
  which a long download's progress output can exceed, killing it mid-pull — and
  imposed a 45-minute cap that a large model on a slow connection will pass.
  Both now share one implementation that streams the Ollama API directly, with
  no shell involved, and the wizard gains the measured byte counts the Model
  Library already had.

### Added

- **First-run setup is recorded in the tamper-evident ledger**: which model
  backs each pillar, and whether cloud routing was enabled — the decision that
  determines what leaves the machine. The API key itself is never recorded, only
  whether one is present.
- **Clickable starter suggestions** above the message box, sending the same
  three phrases the greeting names. Each disappears once used, and the strip
  disappears entirely when all three are gone. Re-running guided setup restores
  them.

### Changed

- **The licence step is no longer the first thing a Community user is told to
  do.** Governance, the decision ledger, sandboxed execution and audit are never
  gated, so leading with "Activate a licence" implied a restricted build. It is
  still listed, after the two steps that change what CAIRN can actually do.

---

## [2.2.0] - 2026-08-17

Hardening release. Three defects in this list were failures that returned
something indistinguishable from success — the pattern this project tracks
deliberately — and all three were found by running the product rather than by a
test.

### Added

- **Every governed decision records the policy ruleset that produced it.** A
  digest covering the rules' identity *and their logic*, the rule counts, and the
  corporate policy status, written inside the tamper-evident ledger record. A
  rule weakened after the fact is now visible as a change rather than invisible.
- **Ledger verification states what it checked.** Verifying the whole chain is
  proportional to its length, so routine checks now start from a signed
  checkpoint and report exactly that: how many records were re-read, how many
  were accepted on a checkpoint's authority, and when the chain was last verified
  end to end. A full verification runs at startup and nightly. If it has not run
  recently the evidence card reads **Full check overdue** rather than showing a
  pass — a fast check cannot detect a record altered before the checkpoint it
  starts from, and saying so is the point.
- **The Trust & Audit policy card reports what is being enforced**, not only how
  many calls were refused. "Nothing refused" and "nothing enforced" no longer
  look identical.

### Fixed

- **An empty policy ruleset could authorise an action.** Compliance was decided
  by "no rule objected", which is trivially true when no rules ran. A pass now
  requires that every registered rule was evaluated and satisfied, and the
  governance gate refuses independently when no rules are loaded.
- **An expired corporate policy kept being enforced as valid.** Expiry was
  checked when the policy was first loaded and the result cached for the life of
  the process, so a node running for days or weeks never re-evaluated it. It is
  now re-checked on every read and fails closed once it has passed.
- **Downloading a model claimed it was installed before anything downloaded.**
  Choosing a model in the Model Library reported "installed and assigned" within
  milliseconds and pinned the pillar immediately — for a 30 GB model, long before
  any data had transferred. The pillar is now assigned only after the download
  completes and the model is confirmed present, and it stays on its existing
  model until then.
- **Downloads showed no progress on the card that started them.** Progress was
  reported only inside the fleet assessment panel. Model Library cards now show a
  live bar with the percentage and how much has transferred.
- **A pillar could be assigned to a model that is not installed.** Assignments
  are now refused with the reason, and the pillar is left on its current model.
  If your configuration already contains such an assignment — likely if you have
  used Download and Assign before this release — the fleet panel reports it
  rather than silently running a different model.

### Known limitations

- Ledger timestamps are recorded from this machine's clock. They are not
  independently attested, so the ORDER of records is evidence but the wall-clock
  time is not. External timestamp anchoring is designed and not yet built.
- CAIRN is still not code-signed by a certificate authority. Windows will warn on
  download. Verify the release with the included verifier — see the release notes.

---

## [2.1.1] - 2026-08-16

Interface corrections found by operator review of the running 2.1.0 build.

### Changed

- **Trust & Audit reports measured state.** Every card now leads with a figure
  read from the running system — decisions recorded this session, ledger length
  and chain verification, tool calls the governance gate refused, and what
  actually leaves this machine — with the explanation of what each figure means
  underneath it rather than in place of it.
- **The audit trace opens as a full surface** rather than an 800px dialogue,
  from the Trust & Audit tab or by typing `/audit`. Its entry point in the
  telemetry strip has been removed: that strip reports live state, and a
  navigation control among gauges reads as another gauge.
- **The startup screen no longer offers "Skip & Enter".** It asked for a
  decision nobody has the information to make. Startup is instead bounded by a
  watchdog on reporting silence rather than on total duration, so a fleet that
  takes several minutes but reports throughout is never interrupted, and one
  that stops reporting continues anyway and names what is still loading.

### Fixed

- **Three of the five Trust & Audit cards reported nothing.** The audit trace
  card had an empty body element that nothing ever filled — indistinguishable
  from one still loading. Policy and Evidence were fixed English paragraphs
  rendered in the typeface this product reserves for machine output, on the tab
  whose purpose is telling an authored claim from a measured one. The ledger
  chain state and the governance denial count were already being measured and
  served; the panel was not asking for them.
- **A startup screen with no exit.** The fallback timer that dismissed the
  splash was cleared permanently by the first warm-up event, so a warm-up that
  began and then stalled left no way off the screen except restarting the
  application.
- **The full-screen audit surface could render 8px low** with its bottom edge
  off screen, whenever its entry animation did not advance — a background tab,
  or a window not compositing. On a fixed-position element the animating
  transform is the layout, not a decoration on top of it.

---

## [2.1.0] - 2026-08-16

First public download build. 2.0.0 shipped on 2026-07-28; everything below
happened after it, and calling this build 2.0.0 would have been a false statement
about what was downloaded.

### Added

- **Licensing and entitlements.** Ed25519 offline licences, node-locked, with
  time-limited trials and expiry enforcement. Entitlements are now enforced
  product-wide rather than declared, and the community edition is isolated from
  paid capability.
- **Signed corporate policy engine.** Distributes and verifies organisation
  policy, with the specification in `docs/SIGNED_CORPORATE_POLICY_ENGINE.md`.
- **Model Library browser**, filtered against this machine. Reads the Ollama
  registry CAIRN installs from, resolves each build's real size and context
  window against measured local headroom, and reports the parse as a failure
  rather than as an empty library when the page layout changes.
- **One model advisor** serving both the settings panel and first-run setup.
  Recommendations are ranked using this machine's own measured outcomes where
  they exist, and every recommendation carries its provenance.
- **Cloud spend metering, price discovery and budget caps.** CAIRN reads
  published provider pricing weekly and proposes changes; it never edits a rate
  itself. Daily and monthly caps, with a choice of falling back to local or hard
  blocking egress.
- **Egress classification** (ADR-0010 §2) and optional cloud-backed pillars,
  with CAIRN's trust gate pinned local and unable to be cloud-backed.
- **Pluggable execution runtimes** (ADR-0013). Operator-registered languages are
  SHA-256 pinned, cannot shadow a built-in by name, extension or fence tag, and
  are refused unless the runtime is detectable.
- **Dual sandbox health indicators** for Windows Sandbox and Docker, read from
  live state rather than assumed.
- **Daemon-aware sandbox verification** (ADR-0015). A continuous monitor is
  recognised as behaving correctly instead of timing out; a verification that
  took 181 seconds now takes about 24.
- **Adaptive wall-clock budgeting for pillars**, with live progress telemetry.
- **A privacy posture derived from live configuration**, replacing a static claim
  that all reasoning stayed local — which was false whenever a cloud key was
  configured.
- **Settings tabs.** Fifteen unrelated cards no longer sit in one scroll.
- **Build identity.** The version and commit are shown in the interface, served
  by `/api/health`, and stamped into every hash-chained ledger record.
- `npm run inspect:learning`, a read-only view of what CAIRN has actually learned.
- `npm run quarantine:benchmarks`, which sets aside throughput figures that
  cannot be measurements.
- **Durable agent sessions.** Checkpoint, resume and rollback, with every
  checkpoint anchored to the hash-chained ledger so a resumed run can be tied to
  a tamper-evident record. Rollback refuses rather than partially succeeding, and
  discloses up front that it can only undo changes made through CAIRN's own
  tools — anything a shell command did is outside what it observed.
- **An OpenAI-compatible local endpoint** at `/openai/v1`. Other tools can point
  their base URL at CAIRN and gain the audit ledger and governed model access
  without changing anything else. Requests naming a model this machine does not
  have are refused with the list of what it does have, never substituted.
- **New identity.** The stacked-stones mark, drawn as vector geometry rather than
  a checked-in binary: `cairn-mark.svg` (transparent, for dark surfaces),
  `cairn-icon.svg` (navy plate, the source for every raster) and `cairn-logo.svg`
  (the full lockup, with the wordmark as paths so it needs no font). Application
  icons, favicons and Apple touch icons are generated from the vector by
  `npm run build:icons`.
- **Signed releases, and a verifier that does not require trusting CAIRN.**
  `npm run release:sign` signs the hash manifest with an Ed25519 release key and
  ships `verify-release.cjs` beside the installers. It proves the files are
  unchanged and that the same key signed the previous release; it is explicit
  that it does not prove who holds that key and does not suppress the Windows
  SmartScreen warning.
- **Slash commands.** Sixteen deterministic commands answered without a model in
  the loop, with a `/` menu served from the same table that handles them. Reporting
  commands (`/status`, `/privacy`, `/spend`, `/verify`, `/routing`, `/skills`,
  `/version`) run through the governance gate; client commands (`/help`, `/new`,
  `/clear`, `/audit`, `/trust`) never touch a tool, so they still work when the
  fleet is cold. An unrecognised command is refused rather than routed — passing a
  bare token to a small local model is what produced a safety refusal in the first
  place.
- **Trust & Audit is a top-level view.** The product is called Trust Fabric and
  trust had no place in its own navigation. Five cards — audit trace, verification,
  privacy, policy and evidence — and every one of them leads with something
  measured from the running system: decisions recorded this session, ledger
  length and chain state, tool calls the gate refused, what actually leaves this
  machine. The explanation of what each figure means sits underneath it in the
  reading face. Mono is used only where a machine produced the characters.
- **The audit trace opens as a full surface**, from Trust & Audit or by typing
  `/audit`. It was an 800px dialogue reached from a pill in the telemetry strip —
  the wrong shape twice over. A modal is for a question that blocks until it is
  answered, and the trace asks nothing; the telemetry strip reports live state,
  and a navigation control sitting among gauges reads as another gauge.
- **Navigation renamed** after an external review: Terminal to Command Centre,
  Automation Vault to Automations, Active Daemons to Runtime. Model Fleet,
  Capabilities and ATLAS Connectors kept deliberately. The sidebar now carries the
  mark with CAIRN / TRUST FABRIC.
- **Any listed model build can be installed.** The Model Library gave a download
  control to the recommended build alone and rendered every other build as
  greyed-out text, which turned a recommendation into a permission — an operator
  with a second GPU arriving, or staging a model for another machine, had no
  route. Every build is now selectable, the recommendation is marked and
  preselected, and choosing something else states its consequence rather than
  being blocked. The download button restates the selected build and its size, so
  the recommendation, the list and the action are one decision instead of three
  adjacent panels.
- **One type system across the whole interface**, with `npm run check:typography`
  wired into the build. Nine size steps, four weights and four tracking values
  replace the twenty-four distinct font sizes that were in the main window's
  inline styles alone. Measured across every tab afterwards: three typefaces,
  seven rendered sizes, four weights.
- **British English enforced in user-facing text**, with `npm run check:en-gb`
  wired into the build. It scans prose only — identifiers, CSS and wire formats
  such as the `Authorization` header are excluded by construction, because
  "correcting" those breaks the product. Generated text now follows the
  operator's own locale rather than a hardcoded rule: the writing directive
  derives its spelling clause from `getLocale()`, so an en-US machine is told to
  write American English and a non-English locale is told to write in that
  language.
- **Recognised acceleration builds.** `dflash` (speculative decoding) and `mtp`
  (multi-token prediction) are classified rather than excluded as unknown
  formats, which had hidden 5 of 15 Muse Glimmer builds and 3 of 12 Qwen 3.8
  builds — including the fast ones.

### Changed

- **The startup splash no longer offers "Skip & Enter".** It asked the operator
  to make a decision nobody has the information to make — the honest description
  of what skipping costs is a warning, not a choice. What the button was actually
  load-bearing for is a warmup that STALLS, and that is now a watchdog: it bounds
  silence rather than total duration, so a fleet that takes five minutes but
  reports throughout is never interrupted, and one that stops reporting for
  forty-five seconds continues anyway and names what is still loading.
- **The learning loop runs.** Both tiers had been built, tested and marked
  working, and had never executed once. The turn contract is now settled in the
  orchestrator, agent steps are attributed under their own scoring namespace, and
  measured failures are remembered and read back by the planner.
- **Model context windows are read, not assumed.** Six of seven installed models
  had been capped at 4096 tokens against real windows of 8192 to 131072, and the
  resolved window is now applied at every call site that generates text, not only
  the one that was fixed first.
- **PowerShell verification prefers Windows Sandbox** on a host that has it,
  rather than pattern-matching for Windows-only API use. A list of Windows-only
  constructs can only ever be a lower bound, and a lower bound is not a gate.
- **Recommendations are resolved against the registry** before being offered.
  The previous fallback stamped citations and release dates onto a hardcoded list
  of 2024 models and rendered it under "Web-Grounded".
- Verification, sandboxed execution and the audit ledger are never licence-gated.

- **Model selection reads capability, not vendor names.** Roles were scored by
  substring — a model whose name contained "qwen" earned a bonus for the trust
  gate, and a model whose name matched nothing could never be assigned at all.
  Selection now uses the capability requirements the model advisor already
  expressed, and CAIRN's sub-30ms trust gate refuses a model too large to meet
  its latency budget.
- **The agent loop stops when progress stops.** A fixed turn cap could not tell
  an agent stuck after two turns from one working through ten. Termination is now
  decided from observed progress — new information, new approaches, criteria
  movement — with hard ceilings retained as safety, and every stop states what
  the agent actually did rather than a turn count.

### Fixed

- **Two Trust & Audit cards were authored prose wearing the typography of a
  measurement.** Policy and Evidence were hardcoded English sentences assigned in
  the panel's own JavaScript and rendered in the mono face this product reserves
  for machine output — on the tab whose whole job is telling those two things
  apart. A third card, the audit trace, had an empty body element that nothing
  ever filled, which is indistinguishable from one still loading. All three now
  read the running system; the ledger chain state and the governance denial count
  were already being measured and served, and the panel simply was not asking.
- **The agent loop had been capped at three turns.** `vault/tunables.json` held
  `MAX_TURNS: 3`, written by the autoresearch ratchet, which swept candidate
  values through the live vault and restored the original outside a `finally`.
  An interrupted run left the first candidate in place. The code default said 8,
  the config default said 10, and none of them were in force. The ratchet now
  sweeps in an isolated scratch vault and cannot write to the live one at all.
- **A benchmark that measured model load time and reported it as throughput.**
  `runSpeedProbe` divided generated tokens by host wall clock, so a 1B model
  recorded 0.79 tokens/sec on a host where an 8B measured 30. Ten stored figures
  were affected, they were displayed beside the pillars they backed, and they
  were multiplied into model selection. The probe now uses the backend's own
  generation time, warms before measuring, and a plausibility check refuses a
  figure that cannot be a rate.
- **A default rendered as a measurement.** The accessibility panel reported
  "8GB effective memory (tier C)" on a machine with 31 GB of RAM, because the
  recommendation could not distinguish a probe from its own fallback.
- **A ghost daemon** respawned at every launch for 41 launches over 13 days, and
  logged as restored each time, after its script had been deleted.
- **CAIRN's own syntax checker could be saved to the vault as the operator's
  script.** A library error object describing the invocation was passed to the
  repair loop as though it were the code's syntax error.
- **A saved script could be reported under a name that was never written.**
  Filenames are now reconciled at the single exit and discrepancies stated.
- **An accepted model upgrade could write a smaller model than the one accepted**,
  and report success. The 2026-08-10 fix stopped an explicit size being
  discarded; the family table itself went on rewriting one family into another,
  so by August 2026 "Qwen 3.8 27B" resolved to `qwen2.5:7b` and `qwen3.8:27b`
  resolved to a tag that does not exist. An unrecognised name is now refused
  rather than coerced onto the nearest known family.
- **An 18 GB model was reported as fitting a 10 GB graphics card.** Fit was judged
  against a single figure combining graphics and system memory. Both are now
  carried separately and a build that would spill to the CPU says so, naming the
  consequence — which for a dense model is the difference between usable and
  unusable, not a mild slowdown.
- **The multi-agent route taught the learning loop nothing.** It reported a route
  label rather than a model, and attribution correctly refused to score it —
  logging a failure on every such turn. Where one model drove the whole plan, the
  turn is now attributed to it; where several did, the refusal stands and says
  which models were involved.
- **The first greeting was an administrator's report, not an introduction.** It
  opened with the licence edition, a pillar count and seven invented proper nouns,
  so a new user had to learn a vocabulary before they could work out what to type.
  It now opens with what CAIRN is, three concrete things to try, and the two facts
  that matter — that it asks before acting, and what leaves the machine.
- **The splash screen showed the agent's name in place of the logo**, so renaming
  the agent rebranded the product. It now carries the CAIRN lockup, with the
  operator's own name shown beneath it only when it differs.
- **The tray icon was the 512px application icon**, downscaled by Electron into a
  16 or 32 pixel slot and visibly softer than every neighbouring icon. Tray
  images are now rendered from the vector at their final size.
- **A blank 1x1 favicon** left over from silencing an old 404 sat after the real
  favicon links, and browsers take the last match — the product would have
  shipped with a deliberately empty tab icon.
- **Two custom properties were referenced but never defined.** `--font-display`
  in ten places and `--text-color` in three. An undefined custom property makes
  the whole declaration invalid, so those elements silently inherited from their
  parent — the same defect `docs/UI-STYLE.md` was written about, arriving in
  typography instead of in buttons.
- **Form controls, `<code>` and `<pre>` fell back to platform fonts.** Neither
  inherits typography from `body`; on Windows that meant Arial for an unstyled
  button and Courier New for every inline path or filename, beside JetBrains
  Mono everywhere else. Inline code also came out at four different sizes on one
  page depending on what it sat inside.
- **The sandbox pill in the top bar** duplicated the sidebar footer at lower
  resolution, so one screen carried two readouts of one measurement and the
  coarser one was the more prominent. Removed; the footer names each engine, its
  state and its image count.
- **An empty skill library looked identical to a working one.** The weekly digest
  omitted the block entirely when nothing had been promoted, so silence read as
  health. It now states that nothing has been promoted and why the bar is set
  where it is.
- Assurance grades can no longer be promoted past a skipped rung.
- A daemon started for a turn no longer reports that no daemon was created.
- Deleting a script now also removes its daemon, restart registration and metadata.
- The Automation Vault cards have a layout rather than four inline properties.
- Published price parsing recovered, with Gemini rates carrying their model ids.

---

## [2.0.0] - 2026-07-28

### Enterprise Trust & Architectural Pillars
- **7-Pillar Architecture**: Enforced schema contracts (`src/contracts/pillarContracts.js`) across CAIRN, PATH, BEACON, COMPASS, ATLAS, FORGE, and CRUCIBLE.
- **Default-Deny Approval Gate**: Inverted tool classification model in `tools/executor.js` requiring explicit human approval for all unclassified actions.
- **STRIX Adversarial Audit**: Integrated security scanner in `enterprise/strix/index.js` for whitelisted commands, daemons, and scripts.
- **Autoresearch Ratchet**: Automated hyper-parameter tuning harness in `tests/ratchet.js` for capability optimization.

### Audio & Telemetry Enhancements
- **Kokoro ONNX 16-bit PCM Audio**: Converted audio buffer generation in `src/voice/tts.js` to 16-bit linear PCM WAV for Web Audio API playback.
- **Global Auth Interceptor**: Injected automatic `Authorization: Bearer <token>` headers across all frontend `fetch()` requests in `public/components/index.js`, fixing system status bar (`CPU`, `RAM`, `DISK`, `GPU`, `VRAM`) updates.
- **Self-Contained SVG Icons**: Replaced FontAwesome CSS icon dependencies with clean inline IBM Carbon SVGs.

### Desktop & Setup UI
- **Setup Prerequisite Card Display**: Updated `public/setup.html` to hide download links and copy commands when prerequisites evaluate to `✓ PASSED`.
- **Window Geometry**: Expanded default Electron window launch footprint to `1440x920` for generous fit without vertical scrollbars.
- **AppData Vault Unification**: Standardized all storage paths to `VAULT_DIR` (%APPDATA%\CAIRN Trust Fabric\vault), preventing setup modal loops on packaged `.exe` boots.

---

## [1.0.0] - 2026-07-15
- Initial release of Local-First Hybrid Agent Architecture.
