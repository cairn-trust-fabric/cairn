# Example configuration

Seven declared files govern what CAIRN may do and who it thinks you are — five
written by the operator, and two (from v3 B5) written by an agent's publisher and
signed. **All seven ship declaring nothing**, and a stock installation therefore
demonstrates none of them — which is the honest default, and the reason these
examples exist.

The count was "four" until 2026-09-03 and the table had grown past it twice. A
number in prose beside a list that can grow is a fact with no guard on it; the
test below checks that every file here is _named_, which is what actually catches
an undocumented example.

Copy a file into the vault, edit it, and it takes effect on the next tool call.
CAIRN never reads anything from this directory.

| Control                                              | Copy to                                      | Effect when absent                                                                                                                                                                            |
| ---------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Protected targets                                    | `vault/protectedTargets.json`                | Consequence is recorded as **not assessed**. Risk is graded from mechanism alone                                                                                                              |
| Autonomy ladder                                      | `vault/autonomyPolicy.json`                  | The ladder is **not enforced**. No maximum level is applied                                                                                                                                   |
| Corporate policy — `corporatePolicy.example.json`    | `vault/corporate_policy.json`                | No corporate rules are in force. See below — this one must be **signed**, and an unverified policy is refused rather than downgraded                                                          |
| SSO — `sso.example.json`                             | `vault/sso.json`                             | No SSO. Identities grade `os`/`vault` and `identityAuthenticated` is **false**, which is the honest answer                                                                                    |
| Principal                                            | `vault/principal.json`                       | Your role and clearance come from environment variables, then from build defaults. Every decision record says which                                                                           |
| Agent manifest — `agent-manifest.example.json`       | `vault/agents/<agentId>/agent-manifest.json` | An agent's capabilities are the operator's declaration alone, with no statement from the publisher about what the agent actually needs                                                        |
| Agent revocations — `agent-revocations.example.json` | `vault/agents/revocations.json`              | Revocation is **not configured**, which is not the same as nothing being revoked. `isRevoked()` answers `null` for unknown, and the default posture proceeds while recording that nobody knew |

Where the vault is depends on the installation; `CAIRN_VAULT_DIR` overrides it.
The Trust & Audit tab reports the resolved path.

## The important property

**An absent control is recorded as absent, never as a pass.** A decision record
carries `assessed: false` for consequence and `enforced: false` for the ladder,
each with a reason. Nothing in the ledger reads as "this was checked and found
fine" when nothing was checked — that distinction is the difference between an
audit trail and a reassuring one, and it is asserted by the test suites in both
directions.

The same rule applies to a file you write badly. A malformed register is reported
as `INVALID` by name and is **not** enforced; an individual entry that could never
match — no match rule, an unrecognised criticality — is rejected by name rather
than half-applied. Neither fails closed: an unsigned local file that can only
restrict must not be able to stop all work on a node because of a trailing comma.
Check the decision record after editing; it names anything it could not read.

## Protected targets

`protectedTargets.example.json`

Declares what matters, so that risk reflects what an action would **affect** and
not only how it would do it. Without it, "run a script" grades MEDIUM whether the
script prints a message or reconfigures a production cluster.

Matching is literal — identifiers, path prefixes, regular expressions — against
the tool name, the argument values, and the **resolved execution payload**, which
includes the contents of a vault script invoked by name. Naming a script instead
of pasting it does not evade a target.

A **read** of a protected target is recorded but does not raise the grade. Reading
a file under a protected path does not affect the protected thing, and grading
every such read CRITICAL produces an alert stream that is ignored within a week.

## Autonomy ladder

`autonomyPolicy.example.json`

```text
0 OBSERVE   1 ANALYSE   2 RECOMMEND   3 PREPARE   4 EXECUTE_WITH_APPROVAL   5 EXECUTE_AUTONOMOUSLY
```

Maps (action class × target class × identity) to a maximum permitted level. A
read needs ANALYSE, a write needs PREPARE, anything that executes needs
EXECUTE_WITH_APPROVAL — including a tool CAIRN does not recognise, which is
treated as the most restrictive class.

**Rules combine by lowering only.** The lowest matching ceiling wins, so adding a
rule can never widen what is permitted. If you need to permit more, raise the
ceiling that is currently binding rather than adding an exception — an exception
will not override it.

**Say which kind of principal a rule means.** Write `"identity": "user:alice"` for
an operating-system username, `"identity": "role:auditor"` for a role declared in
`vault/principal.json`, or `"*"` for everyone.

A **bare name still works** and is matched against _both_ — which is why, before
2.6.0, a rule written for a role also applied to a user of that name. Under this
ladder that could only ever over-restrict, so the effect was somebody limited when
nobody meant to limit them. Bare names are reported as out of date when you
preview a policy; the qualified form removes the ambiguity.

**A rule keyed to a role now records what it rested on.** The decision record says
which attribute matched and whether that attribute came from the operating system,
from a file you wrote, or from an unverified claim. Nothing about what is
permitted changes — the record simply stops presenting checked and unchecked
evidence identically.

The model has no say in its own level. Levels are resolved from the action class,
the target class and the operating-system principal, and the resolver has no
parameter through which model output could arrive.

## Principal — who CAIRN thinks you are

`principal.example.json` → `vault/principal.json`. **New in 2.6.0.**

The autonomy ladder can restrict by ROLE. Before 2.6.0 that role came from the
`CAIRN_ROLE` environment variable, so a desktop shortcut, a shell, a parent
process or a scheduled task could all decide what the ladder matched against.
Declaring it here narrows that to whoever can write the vault — which is already
whoever can rewrite `autonomyPolicy.json`, the ladder the role is checked against.

```jsonc
{
    "roles": ["platform-engineer", "on-call"],
    "clearance": "CONFIDENTIAL",
    "capabilities": ["read"], // optional — can only take permissions away
}
```

**It does not authenticate you**, and CAIRN does not pretend otherwise. Declaring
your own role in your own vault is still you declaring your own role. What the
product does instead is record every attribute's **source** — from the operating
system, from this file, from an environment variable, or from a build default —
so a decision record never presents a declared role as a verified one. Real
authentication means SSO, and that is not built.

Three things the file may not do, each refused rather than ignored:

|                                     | Why                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Declare a `username`, `id` or `sid` | Those come from the operating system, and the username is what the audit trail records as the actor. Silently dropping a declared one would leave you believing an impersonation had taken effect |
| Name a role containing a colon      | A ladder selector is written `role:<name>`, so such a role could never be matched by any rule                                                                                                     |
| Use an unrecognised clearance       | It would otherwise score as `INTERNAL` and read as a real level                                                                                                                                   |

`capabilities` is optional and can **only ever narrow**: the effective set is what
the build grants intersected with what you list, so listing something the build
does not grant gains nothing. `["read"]` makes an installation unable to write or
execute anything. An empty list is refused — it would refuse every tool.

## Corporate policy

Not an example file, because an unsigned one would be misleading: a corporate
policy is **Ed25519-signed by the organisation**, and CAIRN fails closed into
lockdown if the signature does not verify. The payload shape, the signing
procedure and the full rule reference are in
[`docs/SIGNED_CORPORATE_POLICY_ENGINE.md`](../docs/SIGNED_CORPORATE_POLICY_ENGINE.md).

Unlike the two files above, this one is an authority boundary: a tampered policy
stops the node rather than being reported and ignored.

---

## Agent manifests and revocation (ADR-0018, v3 B5) — built, and reached

`agent-manifest.example.json` → `vault/agents/<agentId>/agent-manifest.json`
`agent-revocations.example.json` → `vault/agents/revocations.json`

**This section said the opposite for one day, and the correction is worth
keeping.** When these examples were first written the machinery was built,
tested against real Ed25519 signatures, and **reached by nothing** —
`authorizeAction()` accepted an agent chain and no call site passed one. A file
in a vault that looks like a control and is not one is worse than no file, so it
was stated here rather than left to be discovered.

**It is wired now (2026-09-04, ADR-0019 §7).** The MCP gateway reads the chain
from the call and hands it to the governance gate, and the tests drive a chain
through the registry so the wiring cannot silently come apart. A manifest you
place today is read by the running product.

**The chain is a CLAIM, and is accepted unauthenticated on purpose.** Every term
in the effective capability set is an intersection, so naming more agents can
only ever REMOVE capability, and the most permissive thing a caller can do is
claim no chain at all. A liar can only lie themselves into a smaller set. It
buys attribution, not authorisation, and the decision record says so.

**What the shapes commit to.**

- A manifest is **signed by its publisher** and verified with the same canonical
  JSON corporate policy uses — one implementation, so a signature cannot verify
  in one path and fail in the other.
- **`agentId` must match its directory.** A manifest signed for one agent does
  not describe another, however valid the signature.
- **`expiresAt` is re-checked on every read**, never once at load. That is
  ADR-0016's finding, which cost a live fail-open when a verdict was cached.
- **An unsigned manifest is refused** unless `CAIRN_AGENT_DEV_UNSIGNED=1`, and
  that mode marks every resulting decision **unverified** rather than skipping the
  check. A build that reported `verified: true` there would have ended the item.
- **`maxDelegationDepth` is 0 when absent.** In a chain the minimum governs, so
  one undeclared link would otherwise remove the ceiling for everybody.
- **`exec:host` may appear in a manifest and is never granted to an agent
  arriving through the MCP gateway.** First-party agents and the operator keep
  it; that is a different trust relationship and it is stated rather than assumed.
- **A revocation list that cannot be read is never treated as empty.** Absent,
  unparseable, unsigned and tampered all yield _unknown_, and
  `CAIRN_AGENT_REVOCATION_POSTURE=strict` refuses what cannot be established while
  the default `disclose` proceeds and records that nobody knew, with the list's
  age. Neither is silent.
