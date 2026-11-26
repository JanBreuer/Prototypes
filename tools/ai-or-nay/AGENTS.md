# AI or Nay — agent instructions
Scope: this directory. Shared portfolio assets require explicit approval before modification.

- Work from develop in feature/ai-or-nay-<issue>-<slug> or fix/ai-or-nay-<issue>-<slug>. Never push to main or develop directly. Open a PR to develop, linked to an issue.
- Preserve the existing responsive Magenta (#E20074) design, DE/EN language support, existing intro and portfolio integration.
- Preserve monthly cost normalization, input units, required/optional semantics, both time-input modes, rule-based comparison, shared platform costs and JSON import/export compatibility. Do not change formulas silently; document units, assumptions and worked examples.
- Use synthetic data only. Never commit customer data, credentials or proprietary material not approved for repository use.
- Keep changes small; avoid unrelated refactors and changes to original-v3.3.html.
- Test desktop/mobile, both languages, empty/zero inputs, monthly/annual conversions, negative ROI, shared costs and import/export as applicable. Add regression tests for changed calculations. Clearly disclose unrun tests.
- Human review is required before merging. Release only through a develop-to-main PR approved by the product owner.

## Product owner review
Use the AI or Nay PR template. Summarize changes in at most five nontechnical bullets, include interactive test steps with synthetic inputs and expected results, exact preview commit/link if available, before/after screenshots for UI changes, and actual test results. Only the product owner merges; own PRs may be merged by the owner via authorized bypass rather than self-approval. Do not expose private projects or modify Cloudflare account-level settings.
