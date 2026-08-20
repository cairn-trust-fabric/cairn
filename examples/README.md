# Example configuration

CAIRN ships with **nothing declared**. Out of the box it grades an action by what
kind of thing it is, not by what it would affect, and it applies no ceiling to
what it may do on its own.

That is the honest default rather than a gap: CAIRN cannot know which of your
systems matter, and guessing would be worse than saying so. What it does instead
is record the absence — a decision record says consequence was *not assessed*, never
that it was assessed and found fine.

These files are what you copy to change that. Both take effect on the next
request; there is nothing to restart.

| File | Copy it to | What CAIRN does without it |
| --- | --- | --- |
| `protectedTargets.example.json` | `protectedTargets.json` in your vault | Grades risk from the mechanism alone, and records that consequence was not assessed |
| `autonomyPolicy.example.json` | `autonomyPolicy.json` in your vault | Applies no ceiling, and records that no ladder is in force |

Your vault directory is shown in **Settings → Trust & Audit**. Open either file,
delete the entries that do not describe your estate, and put in the ones that do.

## What happens if you get it wrong

Nothing silent. A file that will not parse is reported as invalid and **is not
enforced** — CAIRN will not stop working because of a trailing comma, and it will
not pretend the file is in force either. An individual entry that could never match
anything, or names a criticality that does not exist, is rejected by name and the
rest of the file still applies.

Check a decision record after editing; it names anything CAIRN could not read.

## Protected targets

Declares what matters, so that risk reflects what an action would **affect** and
not only how it would do it. Without it, "run a script" carries the same grade
whether the script prints a message or reconfigures a production cluster.

Matching is exact — identifiers, folder prefixes, patterns — and is checked against
what the action would actually run, including the contents of a saved script
invoked by name. Naming a script instead of pasting it does not get around a target.

**CAIRN never decides for itself what counts as critical.** Every match is a literal
comparison against something you wrote.

A **read** of something you have marked critical is recorded but does not raise the
grade. Reading a file does not change it, and an alert on every read is an alert
nobody keeps reading.

## Autonomy ladder

```
0 OBSERVE   1 ANALYSE   2 RECOMMEND   3 PREPARE   4 EXECUTE WITH APPROVAL   5 EXECUTE UNATTENDED
```

Maps combinations of action, target and user to a maximum permitted level. Reading
needs ANALYSE, writing needs PREPARE, and anything that executes needs EXECUTE WITH
APPROVAL — including a tool CAIRN does not recognise, which is treated as the most
restrictive case rather than the least.

**Rules only ever narrow.** The lowest matching ceiling wins, so adding a rule can
never accidentally widen what is permitted. If you need to permit more, raise the
ceiling that is currently binding — an exception will not override it.

**The model has no say in its own level.** Levels are worked out from the action,
the target and the operating-system user, and there is no route by which the model
could supply one.

## Corporate policy

Not included here, because an unsigned example would be misleading.

A corporate policy is signed by your organisation with an Ed25519 key, and CAIRN
stops rather than continues if the signature does not verify. Unlike the two files
above — which are yours, local, and can only ever *restrict* what CAIRN does — that
one is an authority boundary. Contact us if you are deploying one across a fleet.
