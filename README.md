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

## Available cards

1. AI or Nay? (live)
2. Agent or Not? (agent necessity and architecture)
3. Model Routing Lab
4. AI Harness Builder
5. Prompt Design Studio (human vs machine output)
6. AI Maturity Navigator
7. AI Roadmap Builder
8. AI Toolchain Composer

All seven concept cards lead to their own URL using `tools/coming-soon/?tool=<id>`. These show **illustrative outputs** rather than real calculations. The three access models (48h €9, 7 days €24, 30 days €89) are **fully fictitious and non-purchasable**. There is no authentication, purchase, payment or access-management backend.

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

The intro dialog shows once **per browser/device and tool**, can be reopened via a visible info button, and offers a DE/EN choice. Clearing localStorage causes it to display again. The existing AI or Nay application's own language switch remains independent.

## Deployment and preview

GitHub Pages project-site paths are relative to `/Prototypes/` (no root-absolute `/assets` references).

- Portfolio: https://janbreuer.github.io/Prototypes/
- Catalog: https://janbreuer.github.io/Prototypes/prototypes.html
- Live app: https://janbreuer.github.io/Prototypes/tools/ai-or-nay/
- Concept example: https://janbreuer.github.io/Prototypes/tools/coming-soon/?tool=agent-necessary

The existing production site stays unchanged until the draft pull request is merged into `main`. External branch previews (e.g. GitHack) are third-party and are not formal deployment tests.

## Checks and caveats

- Repository references and asset paths were reviewed.
- The three JavaScript assets passed syntax compilation checks.
- AI or Nay's original HTML, embedded business logic, styles and scripts were preserved byte-for-byte; only four introductory presentation tags were inserted ahead of `</body>` in the live copy.
- A full browser regression test, screenshot-based layout QA and GitHub Pages deployment test **were not performed**.
- Fictitious prices are for a product concept only. No commercial offering exists.
