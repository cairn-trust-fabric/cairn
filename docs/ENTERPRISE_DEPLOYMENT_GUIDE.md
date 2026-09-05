# CAIRN Enterprise AI — Enterprise Deployment Guide

This guide provides operational instructions for deploying CAIRN V2 across enterprise environments using native installers, background OS services, and containerized clusters.

---

## 1. Deployment Models Comparison

CAIRN supports two primary deployment topologies depending on enterprise infrastructure:

| Feature / Aspect | Model 1: Per-Machine Desktop Client | Model 2: Headless Server + Browser Clients |
| :--- | :--- | :--- |
| **Target Users** | Power users, developers, workstation operators | Entire teams (5–500 users) via web browser |
| **Client Requirement** | Install the CAIRN .exe package | Zero install — standard web browser (http://cairn-server:3000) |
| **AI Inference Host** | Local machine GPU/CPU via Ollama | Centralized Server GPU(s) via Ollama / Cloud API |
| **Prerequisites** | Ollama installed locally — **deployed by you, not by the installer** | Ollama service running on central server node |
| **Offline Capability** | Full offline air-gapped support | Dependent on local network connectivity to central server |
| **Auth Model** | Local OS Vault (%APPDATA%) | Session Token authentication / Single Shared Team Token |

---

## 2. Model 1: Per-Machine Desktop Deployment (Windows NSIS)

### Build Process (Dev / CI Machine)
You build the installer **once** on your build pipeline. End users execute the output installer without needing source code, Node.js, or development tools.

```powershell
# Build the Windows NSIS Installer (.exe)
npm run build:win
```
Outputs in dist/:
- dist/CAIRN Trust Fabric Setup X.Y.Z.exe (NSIS Installer, per-machine)

### Prerequisites are DETECTED, not installed

> **Corrected 2026-09-05.** This section described the NSIS installer checking
> the registry for Ollama, downloading `OllamaSetup.exe` from ollama.com and
> installing it silently, with a proxy-failure notice. **None of that exists.**
> `build/installer.nsh` contains no Ollama logic of any kind — it handles the
> per-user to per-machine upgrade dialog and user-data removal, and nothing else.
> A clean-machine install on 2026-09-05 confirmed it: after installing on a
> networked machine with no Ollama, there was still no Ollama.
>
> The comparison table above said the same thing and has been corrected with it.
> This was a described capability that did not exist, in the document a
> deployment team reads — the shape `docs/CLAIMS.md` exists to catch.

**The installer installs CAIRN and nothing else.** A model runtime is a separate
prerequisite and it is yours to deploy, alongside CAIRN, by whatever channel you
already use for third-party software:

`````powershell
winget install Ollama.Ollama
```

What CAIRN does do is **tell you what is missing, and how to get it**. On first
run, and at any time afterwards:

```
cairn_status --section prerequisites
```

It names each missing component and the command that installs it. It also reads
`CAIRN_OLLAMA_PATH` and `OLLAMA_PATH`, and looks for a runtime on
`http://localhost:11434`, so a non-standard installation is found rather than
reported as absent.

**Without a model runtime CAIRN starts, records, and can reason about nothing.**
Plan the two deployments together.

### Silent GPO / Intune Mass Deployment

**There is no MSI package today. Removed 2026-08-22, and it is not a channel you can plan around until it returns.**

An MSI was built alongside the NSIS installer from 2.0.0 to 2.5.0 and this guide
documented it as the Intune/GPO channel. Two facts about it were never checked:

- **It had never been installed or tested, in any version.**
- **It shared an install directory with the NSIS `.exe`.** Both resolved to
  `%ProgramFiles%\CAIRN Trust Fabric`, so uninstalling either removed files the
  other owned. On 2026-08-22 that destroyed a working install on the author's own
  machine.

Documenting a deployment channel is not the same as having one, and a silent
domain-wide rollout is the worst possible place to discover the difference. The
MSI returns when a clean-machine install has actually been performed and it has
its own install directory — `docs/ROADMAP-V3.md` R1b — and
`tests/installer_targets.test.js` fails the build if it reappears without one.

Until then the per-machine NSIS installer is the deployment artefact. It supports
unattended installation:

`````powershell
"CAIRN Trust Fabric Setup X.Y.Z.exe" /S
```

This is a per-machine install and requires elevation. It is **not** equivalent to
an MSI for Intune or GPO software-installation policy, both of which want a
Windows Installer package; deploy it as a packaged app or a startup script until
R1b lands.

---

## 3. Model 2: Headless Central Server Deployment (Browser Access)

In Model 2, CAIRN runs as a background service on a single GPU-equipped server. Team members access CAIRN through their standard web browser without installing any client software.

### Starting Headless Server
Run CAIRN without Electron UI dependencies:

`ash
# Start standalone HTTP / WebSocket server on port 3000
npm run server

# Development mode with auto-reload
npm run server:dev
```

### Windows Service Installation (Background Auto-Start)
To run CAIRN as a background Windows Service that starts automatically on server boot:

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process
.\deploy\windows-service\install-service.ps1 -InstallDir "C:\cairn" -Port 3000
```

### Linux Systemd Service Installation
For Linux central server hosting (Ubuntu, RHEL, Debian):

`ash
# Copy systemd unit
sudo cp deploy/linux/cairn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable cairn
sudo systemctl start cairn
```

### Enterprise Scaling & Authentication Path
- **Authentication**: access is secured by the session token in
  `vault/session_token.txt`, or by header authentication. **This is one shared
  token for the whole hub** — it establishes that a request came from somebody
  holding the token, and nothing about who that person is.
- **Attributing an action to a person**: CAIRN can **verify an OIDC ID token**
  issued by Microsoft Entra ID, Google or AWS Cognito, and record the person it
  names rather than the account the server runs as. Configured in
  `vault/sso.json`. **Stated limit: this has never been tested against a live
  identity provider.** The signature checking is genuinely exercised; the claim
  shapes are read from published documentation and driven only against stand-ins.
  CAIRN never acquires a token — it verifies one it is handed.
- **Putting a proxy in front**: a reverse proxy such as NGINX or Traefik can
  terminate authentication upstream and inject a bearer token. That is a
  supported topology and it is **your** integration rather than a CAIRN feature:
  nothing in CAIRN performs OAuth2 or SAML.

---

## 4. Binding what a node may do: signed corporate policy

An organisation can constrain every node it deploys, and the constraint is
**signed** so a node will not accept one it cannot verify.

A corporate policy is placed at `vault/corporate_policy.json` and verified
against a public key the organisation controls. `examples/corporatePolicy.example.json`
ships as a worked example, disabled. It can cap:

- **daily cloud spend**;
- **which model backings a role may use** (`allowedModelBacking`);
- **how many outside domains a tool offered to an external agent may contact**.

Three properties matter for deployment planning:

- **A ceiling only ever narrows.** The organisation's policy cannot widen what a
  node already permits — a machine configured to allow less keeps allowing less.
- **Expiry is re-checked on every read**, not once at startup, so a policy that
  lapses stops applying when it lapses rather than when the process restarts.
- **An unreadable policy locks down rather than falling open.** A node that
  cannot verify the policy it was given does not proceed as though there were
  none.

Distribution is your channel — a file, a share, MDM, Group Policy. **CAIRN does
not fetch policy from anywhere**, and there is no central console that pushes it;
see the release notes for what is deliberately not built.

---

## 5. Hardware Scan & Guided Setup Flow

CAIRN deliberately **does NOT arbitrarily pre-download models** upon installation. 
On first run (or when re-launching setup from Settings):
1. CAIRN executes a real-time hardware scan (VRAM, RAM, CPU cores, GPU architecture).
2. Proposes optimal open-source models tailored to the exact system specifications.
3. User explicitly approves model selection before downloading.
