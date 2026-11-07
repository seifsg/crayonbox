import { BLANK } from './sheet.ts';

const PREFIX = 'crayonbox:v1:';
const HEX = /^#[0-9a-f]{6}$/;
let warned = false;

/** Logs a storage failure once: blocked storage must never stop a child from coloring. */
const warn = (what: string, e: unknown): void => {
  if (!warned) console.warn(`crayonbox: storage ${what} failed, progress will not be kept`, e);
  warned = true;
};

/** Storage read that never throws. */
const read = (key: string): string | null => {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch (e) {
    warn('read', e);
    return null;
  }
};

/** Storage write that never throws. */
const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch (e) {
    warn('write', e);
  }
};

/** JSON parse that turns junk into null (a blank page). */
const parse = (text: string | null): unknown => {
  try {
    return text === null ? null : JSON.parse(text);
  } catch (e) {
    console.warn('crayonbox: saved page unreadable, starting blank', e);
    return null;
  }
};

/** Turns whatever storage held into exactly `n` valid colors. Wrong length (page art changed) → blank page. */
export const normalize = (raw: unknown, n: number): string[] => {
  const list = Array.isArray(raw) && raw.length === n ? (raw as unknown[]) : [];
  return Array.from({ length: n }, (_, i) => {
    const c = list[i];
    return typeof c === 'string' && HEX.test(c) ? c : BLANK;
  });
};

/** A page's saved colors, or a blank page when there are none or they no longer fit the art. */
export const loadColors = (pageId: string, n: number): string[] => normalize(parse(read(`page:${pageId}`)), n);
/** Remembers a page's colors on this device. */
export const saveColors = (pageId: string, colors: readonly string[]): void => write(`page:${pageId}`, JSON.stringify(colors));

type Pref = 'last' | 'color';
/** Last page or crayon; null when unknown. */
export const loadPref = (key: Pref): string | null => read(key);
/** Remembers the last page or crayon. */
export const savePref = (key: Pref, value: string): void => write(key, value);
