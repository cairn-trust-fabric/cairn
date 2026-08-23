# Contributing to CAIRN Trust Fabric

Thank you for your interest in CAIRN Trust Fabric.

## Licence, and what happens to what you send

CAIRN Trust Fabric is published under the **Business Source License 1.1** (see
[LICENSE](LICENSE)). It is source-available rather than OSI open source: you may
run it, modify it and self-host it, including in production and inside a
commercial organisation. What you may not do is offer it to third parties as a
competing hosted service. Each version converts to Apache 2.0 four years after
its release.

**By submitting a contribution you certify the Developer Certificate of Origin
([DCO 1.1](https://developercertificate.org/))** — in short, that you wrote the
contribution or otherwise have the right to submit it under this project's
licence, and that you understand it is public and is kept indefinitely.

Certify it by signing off each commit:

```
git commit -s -m "your message"
```

which appends `Signed-off-by: Your Name <your@email>` using your `git config`
identity. Use your real name.

Contributions are accepted under the same licence as the project. If your
employer holds rights in your work, get their agreement before you send it.

## How to contribute

1. **Bug reports and feedback**: open an issue using the [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
2. **Feature requests and proposals**: use the [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).
3. **Documentation and examples**: contributions to integration examples,
   documentation guides and sandbox policy recipes are welcome.

This repository is the public face of CAIRN — documentation, examples and
releases. The implementation is developed privately, so a pull request changing
behaviour has nowhere here to land; open an issue describing the change instead
and it can be discussed against the real tree.

## A note on claims

CAIRN's documentation is governed by an internal claims register, and one rule
from it applies to anything you write here: **describe what has been observed,
not what the design intends.** If a mechanism exists but has never been run,
that is what the text should say. Contributions that state a capability more
confidently than the evidence supports will be asked to soften, not because the
capability is doubted but because overstating one is the failure this product
exists to refuse.

## Security disclosures

For security-sensitive vulnerability reports, follow [SECURITY.md](SECURITY.md)
rather than opening a public issue.

## Code of conduct

All contributors and participants are expected to uphold a respectful,
professional and welcoming environment.
