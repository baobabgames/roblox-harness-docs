// Copies the harness Markdown the Systems and AI guides sections show into
// harness/ (docs/*.md and .claude/guides/*.md, top level only), replacing what
// was there. Run it after the harness docs change, then commit the result:
//   npm run sync-harness                       # from ../roblox-harness
//   npm run sync-harness -- path/to/harness    # from somewhere else
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.resolve(process.argv[2] ?? path.join(siteRoot, '..', 'roblox-harness'));
const target = path.join(siteRoot, 'harness');
const folders = ['docs', path.join('.claude', 'guides')];
// Not shown on the site (see docusaurus.config.ts).
const skip = new Set(['ROBLOX_AI_TEMPLATE_GUIDE.md']);

for (const folder of folders) {
  const from = path.join(source, folder);
  if (!fs.existsSync(from)) {
    console.error(`Not found: ${from}\nPass the harness folder: npm run sync-harness -- <path>`);
    process.exit(1);
  }
  const to = path.join(target, folder);
  fs.rmSync(to, {recursive: true, force: true});
  fs.mkdirSync(to, {recursive: true});
  const files = fs
    .readdirSync(from, {withFileTypes: true})
    .filter((e) => e.isFile() && e.name.endsWith('.md') && !skip.has(e.name));
  for (const f of files) fs.copyFileSync(path.join(from, f.name), path.join(to, f.name));
  console.log(`${folder}: ${files.length} files`);
}
console.log(`Copied from ${source}`);
