import path from 'path';

// The harness Markdown (docs/*.md, .claude/guides/*.md) links to files by
// their repo path, which is right for Claude and on GitHub. On the site:
// - a link to another page the site shows stays a Markdown link (Docusaurus
//   resolves it) or becomes that page's site URL when it's in another section,
// - a link to any other repo file (src/, .claude/skills/...) goes to GitHub.
// The source files are never changed.

type Options = {
  repoRoot: string; // absolute path of the repo
  repoUrl: string; // https://github.com/<org>/<repo>
  branch?: string;
  // repo folder (posix, relative to the repo) -> site route of its docs section
  sections: Record<string, string>;
};

type Node = {type: string; url?: string; children?: Node[]};

const isExternal = (url: string) =>
  /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith('//') || url.startsWith('#') || url.startsWith('/');

export default function repoLinks(options: Options) {
  const {repoRoot, repoUrl, branch = 'main', sections} = options;

  return (tree: Node, file: {path?: string}) => {
    if (!file.path) return;
    const fileDir = path.dirname(file.path);
    const fileSection = path.relative(repoRoot, fileDir).split(path.sep).join('/');

    const walk = (node: Node) => {
      if ((node.type === 'link' || node.type === 'definition') && node.url && !isExternal(node.url)) {
        const [target, hash = ''] = node.url.split('#');
        if (target) {
          const abs = path.resolve(fileDir, decodeURI(target));
          const rel = path.relative(repoRoot, abs).split(path.sep).join('/');
          const anchor = hash ? `#${hash}` : '';
          if (!rel.startsWith('..')) {
            const dir = path.posix.dirname(rel);
            const route = sections[dir];
            if (route !== undefined && rel.endsWith('.md')) {
              // A page this site shows: same section -> leave it to Docusaurus.
              if (dir !== fileSection) {
                node.url = `${route}/${path.posix.basename(rel, '.md')}${anchor}`;
              }
            } else {
              node.url = `${repoUrl}/blob/${branch}/${encodeURI(rel)}${anchor}`;
            }
          }
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}
