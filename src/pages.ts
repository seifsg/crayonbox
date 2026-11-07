import type { Edit } from './sheet.ts';

export interface Page {
  readonly id: string;
  readonly title: string;
  readonly svg: string;
}

// Every page ships inside the bundle, so the service worker precaches them all and paging needs no network.
const files = import.meta.glob<string>('./pages/*.svg', { query: '?raw', import: 'default', eager: true });

const toPage = ([path, svg]: [string, string]): Page => {
  const id = path.slice(path.lastIndexOf('/') + 1, -'.svg'.length);
  const title = /<title>([^<]+)<\/title>/.exec(svg)?.[1];
  if (!title) throw new Error(`page ${id}: missing <title>`);
  return { id, title, svg };
};

/** All pages, ordered by file name (01-..., 02-...). */
export const PAGES: readonly Page[] = Object.entries(files)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(toPage);

if (!PAGES.length) throw new Error('no coloring pages in src/pages');

/** Puts a page's art into `host` and returns its fillable regions; a region's index is its id. */
export const mount = (host: Element, page: Page): SVGElement[] => {
  host.innerHTML = page.svg;
  const svg = host.querySelector('svg');
  if (!svg) throw new Error(`page ${page.id}: no <svg>`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', page.title);
  return [...svg.querySelectorAll<SVGElement>('.regions > *')];
};

/** Draws edits as `fill` attributes (not CSS), so saved PNGs and prints carry the colors. */
export const paint = (regions: readonly SVGElement[], edits: readonly Edit[]): void => {
  for (const [i, , to] of edits) regions[i]?.setAttribute('fill', to);
};

/** Draws a whole color list, e.g. a saved page. */
export const fillAll = (regions: readonly SVGElement[], colors: readonly string[]): void => {
  colors.forEach((c, i) => regions[i]?.setAttribute('fill', c));
};
