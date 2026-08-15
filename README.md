<p align="center">
  <img src="./tool-thumb.jpg" alt="Tool" width="100%" />
</p>

<p align="center">
  <a href="https://github.com/rafifmsn/tool/actions/workflows/ci.yml">
    <img src="https://github.com/rafifmsn/tool/actions/workflows/ci.yml/badge.svg" alt="CI Build Status" />
  </a>
  <a href="https://github.com/rafifmsn/tool/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/rafifmsn/tool" alt="License" />
  </a>
  <a href="https://astro.build">
    <img src="https://img.shields.io/badge/built%20with-Astro-ff5d01.svg" alt="Built with Astro" />
  </a>
</p>

## Getting Started

The project uses **pnpm** as its package manager.

```bash
pnpm install
pnpm run dev      # http://localhost:4321
pnpm run build    # static output → dist/
pnpm run preview  # preview the built site
pnpm run test     # runs the test suite
```

## Monorepo Subprojects

Under `monorepo/` we have independent static subprojects configured with standalone package rules:

- **[link](./monorepo/link/README.md)**: Serverless URL Shortener.
- **[note](./monorepo/note/README.md)**: Markdown Editor (latex, mermaid, file management), Kanban, and Task.

To work inside a subproject, cd into its folder and use pnpm ignoring workspaces:

```bash
cd monorepo/note
pnpm install --ignore-workspace
pnpm run dev
pnpm run build
pnpm run test
```

## Project Structure

```
src/
├── components/
│   ├── Head.astro          # Meta tags (OG, Twitter, canonical)
│   └── Topbar.astro        # Top navigation bar with title + action slot
├── data/
│   └── pages.json          # Tool registry — add one entry per tool
├── layouts/
│   └── BaseLayout.astro    # Root layout: Topbar, `<slot>`, footer, globals.css import
├── pages/
│   ├── index.astro         # Dashboard — reads pages.json and renders a grid
│   ├── privacy.astro       # Privacy policy (rendered from Markdown via `marked`)
│   ├── terms.astro         # Terms of service (rendered from Markdown via `marked`)
│   └── [slug].astro        # Each slug represent a tool
├── utils/
│   └── [slug]/*            # Utilities needed for the tool
└── globals.css             # Tailwind v4 @theme custom properties
```

## Adding a New Tool

1. **Register it** in `src/data/pages.json`:

   ```json
   {
     "slug": "my-tool",
     "title": "My Tool",
     "description": "What it does.",
     "type": "page",
     "icon": "Timer"
   }
   ```

   Available Lucide icons, use the PascalCase name (e.g. `Timer`, `Calendar`, `PenLine`).

2. **Create the page** at `src/pages/my-tool.astro`.

3. **Add utility code** under `src/utils/my-tool/` for any client-side logic.

4. Done. The dashboard auto-discovers it from `pages.json`.

## License

MIT — see [LICENSE](LICENSE).
