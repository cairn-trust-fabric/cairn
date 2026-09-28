# Checking CAIRN's numbers yourself

**Written:** 2026-09-16 · **Revised:** 2026-09-28 · **Applies to:** CAIRN Trust Fabric 2.10.11

This directory exists so that a figure CAIRN publishes is something you can
re-take, not something you have to believe. It uses only what is public: the
release you download, the script in this directory, and Node.

It is the first rung of an independent-validation ladder, and it is honest about
being the first rung. Nobody outside the project has yet run it and reported back.
If you do, open an issue with your results — including the ones that disagree.

---

## What is published here, and what is not yet

| | |
| --- | --- |
| **Gate cost** — what one governance decision takes | **Published, reproducible.** Method, script and raw results below |
| **Evidence verification** — that a record is what it says | **Published, reproducible** in a browser at [cairnetp.com/receipt.html](https://cairnetp.com/receipt.html), and by hand with the `VERIFY.md` inside every exported bundle |
| **Release integrity** — that a download is unaltered | **Published, reproducible.** `verify-release.cjs` ships beside the 2.10.11 installers |
| **Detection rates** — false positives and false negatives of the static scanners | **Not published, because not measured.** No labelled corpus has been run against the scanners. The scanners are advisory, and the product says so; a detection rate will be published when one has been taken, not estimated |
| **A threat model for the chain** | Stated where it applies: an unsigned, unanchored hash chain can be rewritten intact by anyone with write access who recomputes every later hash. [The receipt page](https://cairnetp.com/receipt.html#check) does it in front of you |

---

## Re-taking the gate-cost figure against the code you download

The figure on cairnetp.com comes from `measure-gate.mjs` in this directory. It
imports nothing but Node. Point it at a CAIRN tree with `--src` and it measures that
tree — including one extracted from a published installer, which is the point.

### 1. Get and verify a release

Download an installer, `SHA256SUMS.txt`, `SHA256SUMS.txt.sig`, `release-pubkey.pem`
and `verify-release.cjs` from the
[2.10.11 release](https://github.com/cairn-trust-fabric/cairn/releases/tag/2.10.11),
then:

```bash
node verify-release.cjs
```

The `.deb` used for the published result below has SHA-256
`fb0bb2917fd86bd21ba66843209238fb891c0e9e58574aceb2a5428c645b011f`.

### 2. Extract the application code

The JavaScript that makes every decision ships inside `app.asar`.

```bash
# Linux, from the .deb
ar x cairn-trust-fabric_2.10.11_amd64.deb && tar -xf data.tar.xz

# Windows 10/11 — the BUILT-IN tar reads .deb archives; call it by full path.
# In Git Bash or MSYS, plain `tar` is GNU tar and fails with
# "This does not look like a tar archive". Found by following these steps, 2026-09-18.
/c/Windows/System32/tar.exe -xf cairn-trust-fabric_2.10.11_amd64.deb
/c/Windows/System32/tar.exe -xf data.tar.xz

# then, on either
npx @electron/asar extract "opt/CAIRN Trust Fabric/resources/app.asar" cairn-2.10.11
```

### 3. Measure

Node 22.5 or later (the ledger uses Node's built-in SQLite).

```bash
node measure-gate.mjs --src cairn-2.10.11 --n 500 --json my-result.json
```

It creates a temporary vault, writes nothing outside it except the `--json` file
you name, and deletes the vault when it finishes. The five scenarios take different paths through the gate on
purpose; the header of the script explains each.

---

## What we measured, and what it found

Host: Intel Core i9-12900K, 24 logical cores, 31.7 GB, Windows 11, Node 24.2.0.
500 iterations per scenario after 20 warm-up. p50 in milliseconds.

| Scenario | 2.10.1 as shipped | 2.10.2 as shipped | 2.10.7 as shipped | **2.10.8 as shipped, under load** | 2.10.7, same load | **2.10.9 as shipped, idle** | 2.10.8, re-taken idle | **2.10.10 as shipped, idle** | 2.10.9, same idle session | **2.10.11 as shipped, idle** | 2.10.10, same session |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Read, no payload | 0.227 | 0.225 | 0.201 | **0.223** | 0.235 | **0.222** | 0.222 | **0.218** | 0.216 | **0.249** | 0.217 |
| Write, with a path argument | **1.870** | 0.258 | 0.236 | **0.255** | 0.262 | **0.241** | 0.256 | **0.246** | 0.243 | **0.270** | 0.248 |
| Execute, already CRITICAL | **1.888** | 0.285 | 0.262 | **0.277** | 0.317 | **0.276** | 0.274 | **0.276** | 0.273 | **0.299** | 0.279 |
| Denied, unclassified tool | 0.234 | 0.240 | 0.204 | **0.219** | 0.251 | **0.224** | 0.230 | **0.228** | 0.225 | **0.244** | 0.218 |
| Execute with a payload (PowerShell analysed) | 331 | 344 | 313 | **325** | 332 | **336** | 335 | **335** | 335 | **343** | 340 |

Every column was taken from the published `.deb` on the same host and Node version, so they
compare directly. **p99 is not in this table and matters:** 2.1–2.4 ms for the cheap scenarios
in the 2.10.7 run, because a ledger checkpoint is real work that has to happen somewhere. The
headline figure on cairnetp.com is a p50 and says so.

**The 2.10.8 column was taken on a machine that was NOT idle, and says so.** Two other development sessions were running tests on the same host, so every figure in it is higher than it would be at rest, and it does not compare directly with the three columns to its left. To separate load from any real change, 2.10.7 was re-measured immediately before it under the same load: that is the last column. **Against its paired control, 2.10.8 is no slower in any scenario.** 2.10.8 changed the gate path (the desktop screenshot tool moved from the read class to the write class, and the egress gate now recognises recalled memory), so the figure had to be taken again rather than carried forward. What the paired run establishes is that those changes did not regress the gate; an idle re-take would be expected to land near the 2.10.7 column. p99 under load reached about 3.2 to 3.5 ms.

**2.10.11 is slower, and this is why.** It adds a check to every decision: the gate
refuses an action that names CAIRN's own settings folder, so it now serialises each
action's arguments and tests them against a list of names. Measured idle (CPU 5.5 per
cent) beside 2.10.10 in the same session, that costs about 0.02 to 0.03 ms at p50 —
7 to 15 per cent — in every scenario that runs no code. The 2.10.10 control reproduced
its earlier figures to within a few per cent, so the difference is the release, not the
host. p99 and the PowerShell path are essentially unchanged. It is a security fix and it
ships with the cost stated; making the check cheaper is follow-up work.

**The 2.10.10 column was taken idle, beside a 2.10.9 re-take in the same session.** CPU
averaged 3.5 per cent over ten seconds before the runs. 2.10.10 changed nothing the gate
imports apart from the version stamp, so the figure could have been carried forward; it
was re-taken because the headline names the release. The two agree within about one per
cent at p50 in every scenario.

**The 2.10.9 column was taken idle, beside a 2.10.8 re-take on the same idle machine.**
CPU averaged 3.4 per cent over ten seconds before the runs; nothing else was building or
testing. 2.10.9 changed a module the gate imports (the memory search), so the figure was
re-taken rather than carried forward. It is no slower than 2.10.8 in any scenario.

**What the idle 2.10.8 re-take says about the under-load column.** At p50 the load barely
showed: 2.10.8 idle reads 0.222 / 0.256 / 0.274 / 0.230 against 0.223 / 0.255 / 0.277 / 0.219
under load. It showed at p99: about 2.2 to 2.4 ms idle, against 3.2 to 3.5 ms under load. The
2.10.8 column stays as published, labelled as what it was.

**Why 2.10.7 was re-measured rather than carried forward.** 2.10.3 through 2.10.6 reused the
2.10.2 column, on the stated grounds that the gate path was untouched. 2.10.7 touched it: the
security fix in that release added the application-name argument to the payload the gate
reads, so the reasoning expired and the number had to be taken again.

**The 2.10.7 column sits about 10 per cent below 2.10.2, and that is not claimed as an
improvement.** The gap is within what host state explains, and nothing in 2.10.7 targets gate
cost. What the re-take establishes is that changing the gate path did not regress it. If you
re-take it and get the 2.10.2 numbers instead, that is a consistent result, not a conflicting
one.

Raw: [`results/gate-2.10.1-shipped-2026-09-16.json`](results/gate-2.10.1-shipped-2026-09-16.json),
[`results/gate-unreleased-after-fix-2026-09-16.json`](results/gate-unreleased-after-fix-2026-09-16.json)
[`results/gate-2.10.2-shipped-2026-09-18.json`](results/gate-2.10.2-shipped-2026-09-18.json)
[`results/gate-2.10.7-shipped-2026-09-21.json`](results/gate-2.10.7-shipped-2026-09-21.json), [`results/gate-2.10.8-shipped-2026-09-21.json`](results/gate-2.10.8-shipped-2026-09-21.json), [`results/gate-2.10.9-shipped-2026-09-28.json`](results/gate-2.10.9-shipped-2026-09-28.json) and its idle control [`results/gate-2.10.8-shipped-idle-2026-09-28.json`](results/gate-2.10.8-shipped-idle-2026-09-28.json), [`results/gate-2.10.10-shipped-2026-09-28.json`](results/gate-2.10.10-shipped-2026-09-28.json) and its control [`results/gate-2.10.9-control-2026-09-28.json`](results/gate-2.10.9-control-2026-09-28.json), [`results/gate-2.10.11-shipped-2026-09-28.json`](results/gate-2.10.11-shipped-2026-09-28.json) and its control [`results/gate-2.10.10-control-2026-09-28.json`](results/gate-2.10.10-control-2026-09-28.json) and its paired control [`results/gate-2.10.7-control-under-load-2026-09-21.json`](results/gate-2.10.7-control-under-load-2026-09-21.json).

### The published figure did not hold for 2.10.1, and this is how that was found

The site said **0.20–0.26 ms** for a decision that does not run code. That figure
was taken on 2026-08-22 against earlier code, and was labelled as measured against
2.10.1. **Re-taking it against the shipped 2.10.1 with this directory's method
disagreed** for every decision that writes more than a read does: about **1.9 ms**,
not 0.25.

The cost was not constant. It was **0.22 ms for the first ~500 decisions after a
ledger checkpoint, then stepped to 1.4 ms and climbed to 2.1 ms by the 1,000th**,
resetting at each checkpoint. Every append counts the records written since the
last checkpoint — a count bounded at 1,000 by design — and a real decision record
is about 2 KB, so that tail is about 2 MB: all of SQLite's default page cache,
shared with every other table in the database. The same count took 1.59 ms at the
default cache and 0.058 ms at 16 MB.

**What changes and when:** the cache is 16 MB in CAIRN's source from 2026-09-16,
with a test that fails if the cache cannot hold the tail of real-sized records
twice over.

**It has now shipped, and the third column is that fix as downloaded.** Writes went
from 1.870 ms to 0.258 ms against the published `.deb`, and the sawtooth across each
checkpoint cycle is gone at the median. **2.10.1 as downloaded still behaves as the
middle column** — the fix is in 2.10.2 and there is no automatic update, so an
install that has not been replaced still has it.

The point of this directory is that you did not have to take either number from us,
and did not have to take the correction from us either.

### Things these numbers are not

- **Not throughput.** One sequential caller. The gate has never been measured
  under concurrency, and "per second" in the script's output is 1/latency.
- **Not the approval path.** A decision that waits for a person costs the
  person's time; the scenarios avoid it and the script reports if one slips in.
- **Not portable across operating systems for code execution.** The ~330 ms row is
  Windows spawning `powershell.exe` to parse a script. On Linux, PowerShell
  analysis is unavailable and CAIRN says so; that row will measure a different
  path, and the difference is itself a result worth reporting.
- **Not a promise about your hardware.** Re-take it. That is what this directory
  is for.
