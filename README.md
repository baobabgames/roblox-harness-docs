# Harness docs site

The [Docusaurus](https://docusaurus.io) site for the Roblox Harness. Needs Node.js 20 or newer.

```bash
npm install      # once
npm start        # live preview at http://localhost:3000, reloads on edit
npm run build    # production build in build/, fails on broken links
npm run serve    # serve that build locally
```

## Where the pages come from

| Section | Source | Route |
|---|---|---|
| Guide | `docs/` (written for people) | `/docs` |
| Systems | `harness/docs/*.md`, copied from the harness | `/systems` |
| AI guides | `harness/.claude/guides/*.md`, copied from the harness | `/ai-guides` |

`harness/` holds copies of the [roblox-harness](https://github.com/baobabgames/roblox-harness) Markdown, kept in the harness's own layout. Don't edit them here: change the harness, then refresh the copies and commit them:

```bash
npm run sync-harness                      # from ../roblox-harness
npm run sync-harness -- path/to/harness   # from another checkout
```

Their repo-path links (`../src/...`, `../.claude/guides/...`) are rewritten for the site by `src/remark/repoLinks.ts`: to the matching site page, or to the file in the harness repo on GitHub.

`.md` files are plain Markdown (`markdown.format: 'detect'`), so `{ }` and `<Name>` in the harness docs are safe. Use `.mdx` only for pages that need React.

## Deploying

Every push to `main` builds the site and publishes it to GitHub Pages at https://baobabgames.github.io/roblox-harness-docs/ (`.github/workflows/deploy.yml`). You can also run it by hand from the Actions tab. The repo's **Settings → Pages → Source** must be set to **GitHub Actions**.
