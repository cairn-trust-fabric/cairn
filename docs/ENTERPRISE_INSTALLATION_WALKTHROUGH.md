# CAIRN Trust Fabric — Installation & Deployment Walkthrough

> **For:** IT administrators, security engineers and operators installing CAIRN
> Trust Fabric on a Windows workstation or server.
>
> **Corrected 2026-09-05.** This document previously told you to clone
> `cyarwood80/CAIRN` and build the installer yourself. **That repository is
> private**, so the instructions could not be followed by the people they were
> addressed to — and the launch step named the **2.0.0** installer, a release
> withdrawn in the archive purge and no longer downloadable. Both are fixed below.
>
> The old filename is described rather than written out, because
> `scripts/enforcement/user-docs-lint.mjs` checks that every installer named in
> these documents can actually be obtained, and a reader who copied it would be
> sent looking for a file that is deliberately gone.
> The build-from-source path is kept, in §6, correctly labelled as being for
> people who have source access.

---

## 1. What you need first

| | |
| --- | --- |
| **Windows** | Windows 11 or Windows Server 2022, x64 |
| **A model runtime** | [Ollama](https://ollama.com) — `winget install Ollama.Ollama`. **Without this CAIRN starts and can do nothing**, because there is no model to reason with |
| **Docker Desktop** *(recommended)* | [docker.com](https://www.docker.com/products/docker-desktop/) — `winget install Docker.DockerDesktop`. Without it, generated code is checked for syntax only and CAIRN says so rather than implying more |
| **Node.js** *(optional)* | [nodejs.org](https://nodejs.org) — not needed to run CAIRN. Needed to verify a download before installing, and to run `cairn-aggregate` |

CAIRN checks all of these itself. After installing, ask it:

```
cairn_status --section prerequisites
```

It names what is missing **and the command to install it**. Nothing is assumed
present.

---

## 2. Download and verify

Releases are published at
[github.com/cairn-trust-fabric/cairn/releases](https://github.com/cairn-trust-fabric/cairn/releases).
Take the newest, along with `SHA256SUMS.txt`, `SHA256SUMS.txt.sig`,
`release-pubkey.pem` and `verify-release.cjs`.

**Verify before you install.** The verifier is a single dependency-free script:

```powershell
node verify-release.cjs
```

It checks every file against the hash recorded when it was built, and checks that
the list of hashes carries a valid signature from the key that signed previous
releases. It prints a fingerprint; **compare it against the one published in the
[repository README](https://github.com/cairn-trust-fabric/cairn#release-signing-key)**
before trusting a first download. A public key served from the same page as the
installer is worth exactly as much as that page.

> **Windows will warn you.** SmartScreen will say *"Windows protected your PC"*,
> because CAIRN has no code-signing certificate — a recurring cost that has not
> been taken on. The warning means *"this publisher has not paid for an identity
> check"*, not *"this file is dangerous"*, and verifying the download is the
> stronger check of the two. There is no macOS build.

---

## 3. Install

Run the installer. It is a standard per-machine NSIS package: it creates a
Start-menu entry, a desktop shortcut, and an Add/Remove Programs entry, and
installs to `C:\Program Files\CAIRN Trust Fabric`.

Measured on a clean Windows 11 machine, 2026-09-05: **13 seconds, 142 files,
616 MB**, and the application served its health endpoint **three seconds** after
launch.

> **The installer wizard has not been tested by a person clicking through it.**
> The clean-machine install above was run silently. This is stated because it is
> true, not because it is expected to fail.

---

## 4. First run

CAIRN opens with what it has actually measured — not a claim that everything is
online. Expect it to tell you, accurately, that:

- **no licence is installed**, and that it is running as Community. Governance,
  the decision ledger, sandboxed execution and audit are **never** gated;
- **how many pillars have a model assigned**, which is none until a model runtime
  is present and models are pulled;
- **what is missing on this machine**, with the command to install each;
- **whether anything leaves this machine**, which by default is nothing.

Ask it for the whole picture at any time:

```
cairn_status
```

### Pulling models

CAIRN sizes its own fleet to your hardware. On a large-memory workstation:

```powershell
ollama pull qwen2.5:32b
ollama pull qwen2.5-coder:32b
```

Then ask CAIRN to run its first fleet assessment — it will compare what you have
against what it recommends and tell you what it found. **The model names above
are a starting point, not a requirement**; the assessment is the authority on
what suits the machine in front of you.

---

## 5. What a licence adds

Community is fully governed and fully audited. A licence adds packaging and
integration capabilities rather than turning safety on — the ledger and the gate
are never behind it.

Install a licence by uploading the file in the application; it is checked and
what it grants is stated before anything is installed. A trial licence says
plainly that it is an evaluation, how many days remain, and what survives its
expiry — which is everything you have recorded.

---

## 6. Building from source *(only with source access)*

**This section is for people who have the private source repository.** It is not
the installation path and it is not needed to deploy CAIRN.

```powershell
git clone <the private source repository> CAIRN-Trust-Fabric
cd CAIRN-Trust-Fabric
npm install
npm test
npm run build:win            # empties dist/, then builds the Windows installer
npm run build:linux:docker   # adds the AppImage and .deb
npm run release:sign         # hashes and signs whatever is in dist/
```

The order matters: `build:win` cleans `dist/`, so building Linux first loses it.
`docs/RELEASE-CHECKLIST.md` is the procedure and this is a summary of it.

---

## 7. Confirming it works

Open the Terminal tab, or read the console, and look for `[TRUST]` traces — one
per pillar, each stating what it did and how strongly it was verified:

```text
[TRUST] CRUCIBLE → sandboxed:true method:docker ran:true (140ms)
[TRUST] CRUCIBLE → skipped — image node:20-alpine is not present on this machine
```

**Both of those lines are the product working.** The second is CAIRN declining to
claim a verification it did not perform, which is the behaviour the whole system
exists to provide.

For evidence you can hand to an auditor, export a bundle: it is signed, it names
the machine that produced it, and it carries `VERIFY.md` telling the reader how
to check it without trusting CAIRN. Across several machines,
`cairn-aggregate` reads a folder of bundles and reports over them —
see the [repository README](https://github.com/cairn-trust-fabric/cairn#reading-evidence-from-several-machines).

---

## 8. Known limits

Stated here rather than discovered later:

- **The installers are not code-signed**, and there is no automatic update.
- **There is no macOS build.** None has ever been produced.
- **The installer has not been run by a person on a clean machine** — only
  silently, and only once.
- **Nothing here certifies compliance with anything.** CAIRN records what it did
  and whether the record verifies. `docs/CLAIMS.md` is the register that governs
  every capability claim, and it says where each one stops.
