# Magenta Lab — AI Tools & Prototypes

A Telekom-magenta-inspired, **independent** portfolio of AI decision-support concepts. This is **not** an official Deutsche Telekom product or payment service.

## Pages

- `index.html`: bilingual DE/EN homepage with featured tool and end-to-end journey.
- `prototypes.html`: searchable/filterable catalog, populated automatically from `data/projects.js`.
- `tools/ai-or-nay/index.html`: existing fully working AI or Nay application with **presentation-only** introductory dialog.
- `tools/ai-or-nay/original-v3.3.html`: unchanged original application snapshot (original Git blob SHA: `a521e35fa97aeb6e6c754cc8800e575f58869737`).
- `tools/coming-soon/index.html?tool=<id>`: template serving individual product-concept previews from the registry.
- `assets/css/style.css`: responsive magenta-inspired design system.
- `assets/css/tool-intro.css`: independent intro modal styling.
- `assets/js/main.js`: DE/EN switch, catalog search/filter, cards, concept preview rendering.
- `assets/js/tool-intro.js`: first-visit dialog + reopen control, with per-tool localStorage state.
- `data/projects.js`: central bilingual project registry.
- `access.html`: interactive, non-transactional access/licence concept.
- `assets/js/access.js`: client-side pass configuration, price examples, pass-preview rendering and bilingual content.
- `assets/css/access.css`: responsive access-studio styling.

## Available cards

1. AI or Nay? (live)
2. Agent or Not? (agent necessity and architecture)
3. Model Routing Lab
4. AI Harness Builder
5. Prompt Design Studio (human vs machine output)
6. AI Maturity Navigator
7. AI Roadmap Builder
8. AI Toolchain Composer

All seven concept cards lead to their own URL using `tools/coming-soon/?tool=<id>`. These show **illustrative outputs** rather than real calculations. The interactive [Access Studio](access.html) demonstrates **single-tool**, **full-suite**, and **5-person team** passes with **48h, 7-day and 30-day** durations. Prices are derived from a fixed illustrative matrix and **cannot be purchased**. There is no authentication, purchase, payment or access-management backend.

The tools are conceptually linked: business case → architecture choice → routing/harness/prompt design → maturity assessment → roadmap. Agentic Hub slides were not available to reliably ground the architecture, so the concepts follow the provided design notes only.

## Add a new concept

1. Add an object to `window.PROTOTYPE_PROJECTS` in `data/projects.js`.
2. Include `id`, `title`, localized `description`, `pitch`, `intro`, `inputs`, `output`, `steps`, `next` and status `soon`.
3. Set `href: "tools/coming-soon/?tool=<your-id>"`.
4. Optionally set `featured: true`.

For a working standalone app, add `tools/<id>/index.html`, set `status:"live"`, and include the following two assets after the app body content while keeping existing logic unchanged:

```html
<link rel="stylesheet" href="../../assets/css/tool-intro.css">
<script src="../../data/projects.js"></script>
<script src="../../assets/js/tool-intro.js" data-tool="<id>"></script>
```

The intro dialog shows once **per browser/device and tool for its current intro revision** (v2), can be reopened via a visible info button, and offers a DE/EN choice. Add `?intro=1` to the tool URL to force it to open (even after dismissal). Clearing localStorage causes it to display again. The existing AI or Nay application's own language switch remains independent.

## Deployment and preview

GitHub Pages project-site paths are relative to `/Prototypes/` (no root-absolute `/assets` references).

- Portfolio: https://janbreuer.github.io/Prototypes/
- Catalog: https://janbreuer.github.io/Prototypes/prototypes.html
- Access Studio (mockup): https://janbreuer.github.io/Prototypes/access.html
- Live app: https://janbreuer.github.io/Prototypes/tools/ai-or-nay/
- Concept example: https://janbreuer.github.io/Prototypes/tools/coming-soon/?tool=agent-necessary

The existing production site stays unchanged until the draft pull request is merged into `main`. External branch previews (e.g. GitHack) are third-party and are not formal deployment tests.

## Checks and caveats

- Repository references and asset paths were reviewed.
- The three JavaScript assets passed syntax compilation checks.
- AI or Nay's original HTML, embedded business logic, styles and scripts were preserved byte-for-byte; only four introductory presentation tags were inserted ahead of `</body>` in the live copy.
- A full browser regression test, screenshot-based layout QA and GitHub Pages deployment test **were not performed**.
- Fictitious prices are for a product concept only. No commercial offering exists.

## Access Studio behaviour (November 2026)

- Single tool, full suite (all eight registered tools), and five-seat team tier.
- Fictional example pricing (EUR; scope × duration):

  | Tier | 48h | 7 days | 30 days |
  |---|---:|---:|---:|
  | One tool | €9 | €19 | €49 |
  | Full suite | €29 | €59 | €149 |
  | Team (5 seats) | €89 | €149 | €399 |

- All 7 proposed tools are still **concepts**, not runnable applications. Prices and features do not imply availability.
- The pass preview is illustrative only. Checkout is disabled. There is no account creation, licensing, entitlement, payment or server-side security.
- Coming-soon tool pages link into Access Studio with a preselected tool.
- Concept cards are intentionally rendered in desaturated magenta; the live application keeps Telekom magenta (#E20074).
- Tool intro revision v2 triggers on the first visit per tool even if an older intro was previously dismissed. Use a tool URL with `?intro=1` to force its replay.

