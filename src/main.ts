import './css/base.css';
import './css/layout.css';
import './css/tools.css';
import './css/crayons.css';
import './css/picker.css';
import './css/print.css';
import { printPage, savePng } from './export.ts';
import { PAGES, fillAll, mount, paint, type Page } from './pages.ts';
import { DEFAULT_COLOR, isCrayon, renderPalette } from './palette.ts';
import { bindPickerClose, openPicker } from './picker.ts';
import { Sheet, type Edit } from './sheet.ts';
import { loadColors, loadPref, saveColors, savePref } from './store.ts';

const $ = <T extends Element>(selector: string): T => {
  const found = document.querySelector<T>(selector);
  if (!found) throw new Error(`crayonbox: missing ${selector}`);
  return found;
};

const app = $<HTMLElement>('.app');
const art = $<HTMLElement>('#art');
const undoBtn = $<HTMLButtonElement>('#undo');
const clearBtn = $<HTMLButtonElement>('#clear');
const picker = $<HTMLDialogElement>('#picker');

// One sheet per page for the whole visit, so Undo history survives switching pages.
const sheets = new Map<string, Sheet>();
const sheetOf = (page: Page, n: number): Sheet => {
  const known = sheets.get(page.id);
  if (known) return known;
  const fresh = new Sheet(loadColors(page.id, n));
  sheets.set(page.id, fresh);
  return fresh;
};

let page: Page = PAGES.find((p) => p.id === loadPref('last')) ?? PAGES[0]!;
let regions: SVGElement[] = [];
let sheet: Sheet;
const savedColor = loadPref('color');
let color = isCrayon(savedColor) ? savedColor : DEFAULT_COLOR;

const sync = (): void => {
  undoBtn.disabled = !sheet.canUndo;
  clearBtn.disabled = sheet.isBlank;
};

/** Draws edits, then saves progress; every color change goes through here. */
const draw = (edits: readonly Edit[]): void => {
  if (!edits.length) return;
  paint(regions, edits);
  saveColors(page.id, sheet.colors);
  sync();
};

const open = (next: Page): void => {
  page = next;
  regions = mount(art, next);
  sheet = sheetOf(next, regions.length);
  fillAll(regions, sheet.colors);
  savePref('last', next.id);
  sync();
};

const pick = (hex: string): void => {
  color = hex;
  app.style.setProperty('--current', hex);
  savePref('color', hex);
  select(hex);
};
const select = renderPalette($('#crayons'), pick);

const undo = (): void => draw(sheet.undo());

art.addEventListener('click', (e) => {
  const i = regions.indexOf(e.target as SVGElement);
  if (i >= 0) draw(sheet.paint(i, color));
});
undoBtn.addEventListener('click', undo);
clearBtn.addEventListener('click', () => draw(sheet.clear()));
$('#save').addEventListener('click', () => {
  savePng($<SVGSVGElement>('#art svg'), `crayonbox-${page.id}`).catch((e: unknown) => console.error('crayonbox: save failed', e));
});
$('#print').addEventListener('click', printPage);
$('#pages').addEventListener('click', () => openPicker(picker, page, (p, n) => sheetOf(p, n).colors, open));
bindPickerClose(picker);
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undo();
  }
});

open(page);
pick(color);
