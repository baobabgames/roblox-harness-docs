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
| Guide | `website/docs/` (written for people) | `/docs` |
| Systems | `../docs/*.md`, read in place | `/systems` |
| AI guides | `../.claude/guides/*.md`, read in place | `/ai-guides` |

Systems and AI guides are never copied: edit the harness files and the site follows. Their repo-path links (`../src/...`, `../.claude/guides/...`) are rewritten for the site by `src/remark/repoLinks.ts`: to the matching site page, or to the file on GitHub.

`.md` files are plain Markdown (`markdown.format: 'detect'`), so `{ }` and `<Name>` in the harness docs are safe. Use `.mdx` only for pages that need React.

New games made from the template don't keep this folder: `/setup` removes it.
