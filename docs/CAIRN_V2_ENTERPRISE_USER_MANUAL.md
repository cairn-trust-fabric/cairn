# CAIRN V2 Enterprise User Manual & Onboarding Guide
## The Enterprise Trust Operating System (Trust Plane)

Welcome to **CAIRN V2**. CAIRN is not just an AI assistant or prompt gateway —
it sits below downstream AI applications, copilots and autonomous agents to
provide a unified **Trust Plane** grounded in normalised enterprise evidence,
trust scoring, executable policy enforcement, an identity model that records how
each attribute was established, and a **tamper-evident** decision ledger.

> **Corrected 2026-09-05.** This paragraph overstated two things, and the
> original wording is quoted below rather than silently dropped.
>
> **Corrected claims:** `tamper-proof`, `rbac`
>
> - It said *immutable*. The ledger is hash-chained, which makes alteration
>   **detectable** rather than impossible: anyone who can write the file can
>   still write to it, and the chain is what tells you.
> - It said *zero-trust RBAC/ABAC identity*. Role-based access control **is not
>   built**. Identity is graded by how each attribute was established — `os`,
>   `vault`, `asserted`, or verified by an identity provider — which is a
>   different and weaker thing, honestly labelled.
>
> `docs/CLAIMS.md` governs both, and **this manual sat outside every check that
> reads it until today.**

---

## 1. Out-of-the-Box Quickstart (No Jira or Confluence Required)

You do **not** need external enterprise services like Jira or Confluence to evaluate CAIRN V2. Out of the box, CAIRN V2 can immediately ingest and reason over:
- **Your local Git repository** (commits, diffs, branch history).
- **Your local workspace documents** (ADRs, architecture specs, READMEs, markdown files).
- **Local environment & system configuration**.

### Running the CAIRN V2 Onboarding Script

To test the full Trust Plane out of the box, execute:

```bash
node scripts/demo_cairn_v2.js
```

This script will:
1. **Ingest your Git repository** using the `GitAdapter`.
2. **Scan workspace architecture docs & ADRs** using the `WorkspaceAdapter`.
3. **Calculate dynamic Trust Scores** across all ingested evidence using the `TrustEngine`.
4. **Execute Evidence-Oriented Retrieval (EOR)** to ground queries in deterministic evidence rather than vector hallucination.
5. **Issue a Reasoner query** against the `/api/v2/reason` REST endpoint.
6. **Record a tamper-evident audit entry** in the `DecisionLedger` (ARCHIVE).

---

## 2. Core Concepts & Terminology

| Component | Description | Enterprise Role |
| :--- | :--- | :--- |
| **Evidence** | Cryptographically hashed ($SHA\text{-}256$), normalized enterprise data items (from Git, Jira, local files). | Replaces unstructured text chunks with hashed records whose alteration is detectable. |
| **Trust Score** | Dynamic multi-factor rating ($0\%\text{--}100\%$) based on Verification, Freshness, Source Reputation, and Policy Alignment. | Allows AI models to reason over enterprise *trust* rather than vector similarity. |
| **EOR Engine** | Evidence-Oriented Retrieval pipeline combining Evidence Search, Graph Traversal (ATLAS), Trust Ranking, and FTS. | Grounds answers in retrieved evidence and names what it retrieved. It does not eliminate hallucination and does not claim to — it makes the basis of an answer checkable. |
| **Decision Ledger** | Tamper-evident append-only audit trail (`ARCHIVE`) recording every decision, output, confidence rating, and provenance chain. Each record commits to its predecessor, so removing or editing one breaks the chain. | Answers "why did we execute X?" with a record whose integrity you can check yourself. |
| **Policy Engine** | Executable policy rules (`COMPASS`) covering Security, Financial, Operational, and Legal boundaries. | Prevents safety bypasses and unauthorized tool calls. |
| **Identity Engine** | Attribute-based filtering of evidence by clearance, where **every attribute records how it was established** — read from the OS, declared in the vault, asserted, or verified by an identity provider. | Lets a reader tell a checked fact from a convention. Role-based access control is **not** built; see `docs/CLAIMS.md`. |

---

## 3. Testing Enterprise REST Endpoints

Start the CAIRN V2 server:

```bash
npm start
```

### A. Execute Grounded Reasoning (`POST /api/v2/reason`)

**Request**:
```bash
curl -X POST http://localhost:3000/api/v2/reason \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What architecture decisions govern our cloud deployment?",
    "identity": { "username": "chris", "clearance": "CONFIDENTIAL", "projects": ["*"] }
  }'
```

**Response**:
```json
{
  "success": true,
  "query": "What architecture decisions govern our cloud deployment?",
  "reasoningOutput": "[CAIRN V2 TRUST PLANE] Query analyzed across 3 verified evidence items. Trust Score: 94%.",
  "overallTrustScore": 0.94,
  "provenanceChain": [
    {
      "evidenceId": "ev-file-4144522d3030",
      "source": "WORKSPACE",
      "trustScore": 0.96,
      "hash": "8f3a9e...",
      "verified": true
    }
  ],
  "decisionRecordId": "dec-e3b0c44298fc",
  "contractCompliant": true
}
```

### B. Inspect Entity Trust Scores (`GET /api/v2/trust`)

```bash
curl "http://localhost:3000/api/v2/trust?entityId=ev-git-HEAD"
```

### C. Audit Decision History (`GET /api/v2/decision`)

```bash
curl "http://localhost:3000/api/v2/decision"
```

---

## 4. What arrived in 2.9.0 and 2.10.0

**None of this was in this manual until 2026-09-05.** The claims register is
reconciled every release; this document was reconciled by nobody, so a customer
was handed an account of the product two releases behind it.

### Identity, and who an action is attributed to

CAIRN can **verify an OIDC ID token** issued by Microsoft Entra ID, Google or
AWS Cognito, bind the person it names to their session, and record **them** in
the audit trail rather than the account CAIRN runs as. It verifies a token it is
handed; acquiring one stays the job of whatever signs you in. Configured in
`vault/sso.json`; `examples/sso.example.json` ships as a worked example, disabled.

> **Stated limit:** this has never been tested against a live identity provider.
> The signature checking is genuinely exercised; the claim shapes are read from
> published documentation and driven only against stand-ins. If a provider has
> renamed a claim, CAIRN grants **no** role rather than the wrong one — but treat
> your first sign-in as the test.

### Seats

A licence carries a seat count and it is now enforced, on the sign-in path.
How it refuses matters more than that it refuses:

- the account CAIRN runs under is **never** refused;
- somebody who already holds a seat is never refused for returning;
- the first person over the limit is **admitted** for a 14-day grace period and
  told;
- if the number in use cannot be established, **nobody** is refused;
- a refusal is reported as a licensing matter, not a permissions error.

This is metering, not copy protection, and has never been sold as the latter.

### Trials

A trial licence is issued, verified and enforced, and its expiry is re-checked on
every read rather than once at startup. `cairn_status` says plainly that a licence
is an evaluation, how many days remain, and what survives expiry — which is
everything you have recorded.

### Agents that carry a signed statement of what they need

An agent reaching CAIRN through the MCP gateway can present an **agent manifest**
signed by its publisher. Where several agents are involved their permissions are
**intersected**, so naming more of them can only ever *remove* permission.
Publishers can revoke, and a revocation list that cannot be read is reported as
unknown rather than treated as empty. **An agent arriving from outside is never
granted permission to run commands on the host**, whatever its manifest asks for.

The gateway also speaks Streamable HTTP as well as a local pipe, both through the
same single approval path, and a client's name can be proved with a per-client
token rather than taken on trust.

### Evidence that names the machine it came from

An exported bundle now records **which node produced it, inside the signature**.
Relabelling it afterwards breaks verification. Give a machine a name with the
node identity record in your vault; an unnamed machine still exports and says it
is unnamed rather than inventing one.

### Reading evidence from several machines

`cairn-aggregate` reads a folder of bundles, **verifies every one
independently**, and reports per machine and across them. A bundle that fails
verification is **named and left out of the totals** rather than dropped, and
overlapping export windows do not count the same decision twice.

In an installed build it is at:

```
<install dir>
esourcespp.asar.unpacked	ools\cairn-aggregate\cairn-aggregate.mjs
```

It needs only Node.js and can be copied to wherever your evidence is collected —
which does not have to be a machine running CAIRN.

**There is no collector and no central database, deliberately.** Each machine
signs its own records and the reader checks them; sending them to a collector
would make their integrity depend on whoever ran it. It also means the reader
cannot see a machine that has never exported, and it says so.

### Getting the evidence there

CAIRN can write a bundle to a directory you name, on a schedule you set — a
share, a synced folder, anywhere your existing tooling already moves files from.
**CAIRN does not send anything anywhere:** no address, no credential, no network
connection, and a web address in that setting is refused. The local copy is
always written first, so an unreachable share costs you the copy and never costs
the machine its records.

`cairn_status --section collection` tells you whether that is off, working, or
failing, and why. **Off is reported too** — from the far end of a share, a
machine nobody configured and a machine whose export has broken look identical.

---

## 5. Connecting External Enterprise Adapters

When ready to connect Jira, Confluence, or GitHub webhooks:
1. **GitHub MCP / Webhook**: Store a `GITHUB_TOKEN` credential with the
   `manage_secrets` tool to stream commit pushes and PR approvals into the
   `GitAdapter`. **Do not put it in `.env`.** Credentials handed to
   `manage_secrets` are encrypted at rest — Windows DPAPI where available, bound
   to your Windows account, so a copied vault is undecryptable elsewhere. A token
   written into `.env` is cleartext on disk and is exactly what that protection
   exists to remove.
2. **Jira REST API**: Supply Jira API tokens to automatically sync ticket status transitions (`IN_PROGRESS` -> `CLOSED`) into `JiraAdapter`.
3. **Confluence Batch Crawl**: Use the scheduled compiler to index specs into `vault/knowledge/`.
