# AI or Nay collaboration
## Branches and responsibilities
main = live GitHub Pages; develop = integration; feature/ai-or-nay-<issue>-<slug> and fix/ai-or-nay-<issue>-<slug> = isolated work. The product owner approves releases. Branches are repository-wide, not directory-level permission boundaries. Collaborators with write access can affect the whole portfolio; consider a separate company-owned repository before broad access.
## Workflow
1. Open an issue with scope, acceptance criteria and synthetic examples.
2. Assign a human or authorized AI agent. Start from develop, read tools/ai-or-nay/AGENTS.md and avoid other tools.
3. Open PR against develop. Document changes, tests, limitations and screenshots for UI changes.
4. Human reviewer checks calculations, compatibility, security and scope. Squash feature PRs after approval.
5. Test integration branch locally or in an approved preview environment. Release via develop → main PR (merge commit to retain branch ancestry). Tag release after verification. Sync main hotfixes back into develop.
## Admin setup (not enforced by this document)
Protect main and develop: require PR, approval by another authorized reviewer, dismiss stale approvals, require successful checks once configured, prohibit force push and deletion. Restrict main merges to maintainers where plan supports it. Use CODEOWNERS if appropriate. GitHub does not allow authors to approve their own PRs.
Create a GitHub Project with Backlog, In progress, Review, Ready for release, Released. Invite only approved identities; never share accounts. Confirm employer approval and AI tool data policies. Do not enable public previews for confidential content.
## Preview and tests
Serve repository root locally (python -m http.server 8000) and open /tools/ai-or-nay/. Hosted integration: https://ai-or-nay-review.pages.dev/tools/ai-or-nay/. Do not change the GitHub Pages live deployment source.
Baseline automated tests should cover known numeric fixtures and browser scenarios before requiring checks. Do not claim tests pass when not executed.

## Preview hosting and owner approval
Keep GitHub Pages live on its existing publishing source. Use a dedicated Cloudflare Pages project in the existing account, with develop as its production branch (integration only), custom preview branches feature/ai-or-nay-* and fix/ai-or-nay-*, and PR comments. Connect only the intended repository without revoking existing installations. The product owner explicitly chose public previews without Cloudflare Access because the repository is public. Automatic deployments are enabled for develop and the two AI or Nay branch patterns; Cloudflare PR comments are enabled. All published portfolio files and preview branches are public. Use synthetic data only. No private project bindings, secrets or account memberships. The earlier Git authorization error 8000011 is resolved. The sole owner merges colleagues' PRs after review and may merge own PRs through an authorized admin bypass, not self-approval. Until owner-only merge enforcement is verified, prefer public forks with no upstream write access; fork preview support must be verified separately. No confidential examples in public code, PRs or artifacts.
