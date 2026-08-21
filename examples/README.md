# Example configuration

Three operator-declared controls govern what CAIRN may do. **All three ship
declaring nothing**, and a stock installation therefore demonstrates none of
them — which is the honest default, and the reason these examples exist.

Copy a file into the vault, edit it, and it takes effect on the next tool call.
CAIRN never reads anything from this directory.

| Control | Copy to | Effect when absent |
| --- | --- | --- |
| Protected targets | `vault/protectedTargets.json` | Consequence is recorded as **not assessed**. Risk is graded from mechanism alone |
| Autonomy ladder | `vault/autonomyPolicy.json` | The ladder is **not enforced**. No maximum level is applied |
| Corporate policy | `vault/corporate_policy.json` | No corporate rules are in force. See below — this one must be **signed** |

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

The model has no say in its own level. Levels are resolved from the action class,
the target class and the operating-system principal, and the resolver has no
parameter through which model output could arrive.

## Corporate policy

Not an example file, because an unsigned one would be misleading: a corporate
policy is **Ed25519-signed by the organisation**, and CAIRN fails closed into
lockdown if the signature does not verify. The payload shape, the signing
procedure and the full rule reference are in
[`docs/SIGNED_CORPORATE_POLICY_ENGINE.md`](../docs/SIGNED_CORPORATE_POLICY_ENGINE.md).

Unlike the two files above, this one is an authority boundary: a tampered policy
stops the node rather than being reported and ignored.
