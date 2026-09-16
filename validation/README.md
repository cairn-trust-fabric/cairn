# Checking CAIRN's numbers yourself

**Written:** 2026-09-16 · **Applies to:** CAIRN Trust Fabric 2.10.1

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
| **Release integrity** — that a download is unaltered | **Published, reproducible.** `verify-release.cjs` ships beside the 2.10.1 installers |
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
[2.10.1 release](https://github.com/cairn-trust-fabric/cairn/releases/tag/2.10.1),
then:

```bash
node verify-release.cjs
```

The `.deb` used for the published result below has SHA-256
`104045cf15c47a5bd795cf31d72b8b8de7090931219f321596d59833f1201434`.

### 2. Extract the application code

The JavaScript that makes every decision ships inside `app.asar`.

```bash
# Linux, from the .deb
ar x cairn-trust-fabric_2.10.1_amd64.deb && tar -xf data.tar.xz

# Windows 10/11 — the built-in tar reads .deb archives too
tar -xf cairn-trust-fabric_2.10.1_amd64.deb
tar -xf data.tar.xz

# then, on either
npx @electron/asar extract "opt/CAIRN Trust Fabric/resources/app.asar" cairn-2.10.1
```

### 3. Measure

Node 22.5 or later (the ledger uses Node's built-in SQLite).

```bash
node measure-gate.mjs --src cairn-2.10.1 --n 500 --json my-result.json
```

It creates a temporary vault, writes nothing outside it except the `--json` file
you name, and deletes the vault when it finishes. The five scenarios take different paths through the gate on
purpose; the header of the script explains each.

---

## What we measured, and what it found

Host: Intel Core i9-12900K, 24 logical cores, 31.7 GB, Windows 11, Node 24.2.0.
500 iterations per scenario after 20 warm-up. p50 in milliseconds.

| Scenario | 2.10.1 as shipped | Source after the fix below (unreleased) |
| --- | --- | --- |
| Read, no payload | 0.227 | 0.213 |
| Write, with a path argument | **1.870** | 0.230 |
| Execute, already CRITICAL | **1.888** | 0.269 |
| Denied, unclassified tool | 0.234 | 0.214 |
| Execute with a payload (PowerShell analysed) | 331 | 326 |

Raw: [`results/gate-2.10.1-shipped-2026-09-16.json`](results/gate-2.10.1-shipped-2026-09-16.json)
and [`results/gate-unreleased-after-fix-2026-09-16.json`](results/gate-unreleased-after-fix-2026-09-16.json).

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
twice over. It reaches users in the next release. **2.10.1 as downloaded today
behaves as the middle column above**, and cairnetp.com now states the 2.10.1
range rather than the older figure.

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
