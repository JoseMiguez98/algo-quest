import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Plugin } from 'vite';

interface Page {
  category: string;
  id: string;
  title: string;
  description: string;
}

/** Discovers algorithms from src/algorithms/<category>/<id>/index.ts; no hand-kept list. */
export function discoverPages(root: string): Page[] {
  const base = resolve(root, 'src/algorithms');
  return readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .flatMap((cat) =>
      readdirSync(join(base, cat.name), { withFileTypes: true })
        .filter((d) => d.isDirectory() && existsSync(join(base, cat.name, d.name, 'index.ts')))
        .map((d) => {
          const content = readFileSync(join(base, cat.name, d.name, 'content.en.ts'), 'utf8');
          const pick = (key: string) => content.match(new RegExp(`${key}:\\s*'((?:[^'\\\\]|\\\\.)*)'`))?.[1]?.replace(/\\'/g, "'") ?? d.name;
          return { category: cat.name, id: d.name, title: pick('name'), description: pick('tagline') };
        }),
    );
}

const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Serves /<category>/<id>/ from visualizer.html in dev, and emits one static HTML per
 * algorithm at build time so every visualizer has a clean, crawlable URL.
 */
export function algorithmPages(): Plugin {
  let root = process.cwd();
  let outDir = 'dist';
  let pages: Page[] = [];
  return {
    name: 'algorithm-pages',
    configResolved(c) {
      root = c.root;
      outDir = resolve(c.root, c.build.outDir);
      pages = discoverPages(root);
    },
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const path = (req.url ?? '').split('?')[0]!.replace(server.config.base, '/');
        const match = pages.find((p) => path === `/${p.category}/${p.id}/` || path === `/${p.category}/${p.id}`);
        const query = (req.url ?? '').includes('?') ? `?${(req.url ?? '').split('?')[1]}` : '';
        if (match) req.url = `${server.config.base}visualizer.html${query}`;
        if (path === '/compare/' || path === '/compare') req.url = `${server.config.base}compare.html${query}`;
        next();
      });
    },
    closeBundle() {
      const compare = join(outDir, 'compare.html');
      if (existsSync(compare)) {
        mkdirSync(join(outDir, 'compare'), { recursive: true });
        writeFileSync(join(outDir, 'compare', 'index.html'), readFileSync(compare, 'utf8'));
      }
      const template = join(outDir, 'visualizer.html');
      if (!existsSync(template)) return;
      const html = readFileSync(template, 'utf8');
      const setMeta = (doc: string, attr: string, value: string) =>
        doc.replace(new RegExp(`(<meta ${attr} content=")[^"]*(")`), `$1${escape(value)}$2`);
      for (const p of pages) {
        const dir = join(outDir, p.category, p.id);
        const title = `${p.title} · Algo Quest`;
        mkdirSync(dir, { recursive: true });
        let page = html.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`);
        page = setMeta(page, 'name="description"', p.description);
        page = setMeta(page, 'property="og:title"', title);
        page = setMeta(page, 'property="og:description"', p.description);
        writeFileSync(join(dir, 'index.html'), page);
      }
    },
  };
}
