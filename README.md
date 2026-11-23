# Prototypes

A lightweight GitHub Pages portfolio for standalone browser-based tools.

## Repository layout

```text
Prototypes/
├── index.html                  # Portfolio homepage
├── prototypes.html             # Dynamically generated tool catalog
├── assets/
│   ├── css/style.css           # Shared website styles
│   ├── js/main.js              # Navigation, featured card and search
│   └── images/.gitkeep         # Place optional shared images here
├── data/projects.js            # Single registry for catalog entries
├── tools/
│   └── ai-or-nay/
│       └── index.html          # Original standalone AI or Nay application
└── .nojekyll                   # Serve files directly on GitHub Pages
```

## Add another tool

1. Create `tools/your-tool/index.html` (and optional local assets).
2. Add one entry to the `window.PROTOTYPE_PROJECTS` array in `data/projects.js`.
3. Set `href: "tools/your-tool/"` and optionally `featured: true`.
4. Commit. The catalog is populated automatically when visitors open `prototypes.html`.

The portfolio uses plain HTML, CSS and JavaScript with no build process. Avoid root-absolute URLs (`/assets/...`) because GitHub Pages project sites typically use a repository prefix such as `/Prototypes/`.

## Deployment

In **Settings → Pages**, publish from **main** / **(root)** after reviewing and merging the portfolio pull request. The expected addresses are:

- Portfolio: https://janbreuer.github.io/Prototypes/
- Tool list: https://janbreuer.github.io/Prototypes/prototypes.html
- AI or Nay: https://janbreuer.github.io/Prototypes/tools/ai-or-nay/

This branch does not modify the Pages deployment settings.

## AI or Nay preservation

`tools/ai-or-nay/index.html` reuses the **exact original Git blob** from the former root `index.html`. Its embedded HTML, CSS, JavaScript, data import/export and calculations were not modified by the portfolio restructuring.

The page's source and paths have been reviewed for local external dependencies. **Runtime/UI tests of every AI or Nay workflow have not been executed**, so verify the tool's main operations before merging.
