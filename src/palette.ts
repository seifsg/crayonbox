export interface Crayon {
  readonly hex: string;
  readonly name: string;
}

/** 36 crayons in rainbow order; white doubles as the eraser. */
export const CRAYONS: readonly Crayon[] = ([
  ['#ffffff', 'White'], ['#ffc2d4', 'Light pink'], ['#ff8fab', 'Pink'], ['#f72585', 'Magenta'],
  ['#ff6b6b', 'Coral'], ['#e63946', 'Red'], ['#c9184a', 'Raspberry'], ['#9d0208', 'Dark red'],
  ['#ffd8a8', 'Peach'], ['#ffa94d', 'Light orange'], ['#f77f00', 'Orange'], ['#fff3b0', 'Cream'],
  ['#ffd60a', 'Yellow'], ['#e9c46a', 'Mustard'], ['#b5e48c', 'Lime'], ['#8ce99a', 'Light green'],
  ['#2dc653', 'Green'], ['#2b9348', 'Forest green'], ['#606c38', 'Olive'], ['#99e9f2', 'Aqua'],
  ['#2ec4b6', 'Teal'], ['#a5d8ff', 'Light blue'], ['#4cc9f0', 'Sky blue'], ['#1971c2', 'Blue'],
  ['#1d3557', 'Navy'], ['#e0aaff', 'Lilac'], ['#b197fc', 'Lavender'], ['#7209b7', 'Purple'],
  ['#ffe8d6', 'Light tan'], ['#f1c27d', 'Sand'], ['#c68b59', 'Tan'], ['#8b5e34', 'Brown'],
  ['#5c3d2e', 'Dark brown'], ['#adb5bd', 'Grey'], ['#6c757d', 'Dark grey'], ['#212121', 'Black'],
] as const).map(([hex, name]) => ({ hex, name }));

export const DEFAULT_COLOR = '#e63946';
/** True for a color in the box, so a stale saved choice never selects nothing. */
export const isCrayon =(hex: string | null): hex is string => CRAYONS.some((c) => c.hex === hex);

/** One crayon drawing: tip, body and a darker paper wrapper. */
const crayonSvg = (hex: string): string =>
  `<svg viewBox="0 0 40 72" aria-hidden="true"><path class="tip" d="M13 6Q20 0 27 6L34 22H6Z" fill="${hex}"/>` +
  `<rect x="6" y="20" width="28" height="48" rx="5" fill="${hex}"/><rect class="wrap" x="6" y="32" width="28" height="22"/></svg>`;

/** Renders the crayon box into `host`; returns `select(hex)` to mark the chosen crayon. */
export const renderPalette = (host: HTMLElement, onPick: (hex: string) => void): ((hex: string) => void) => {
  host.innerHTML = CRAYONS.map(
    (c) => `<button class="crayon" type="button" data-hex="${c.hex}" aria-label="${c.name}" title="${c.name}" aria-pressed="false">${crayonSvg(c.hex)}</button>`,
  ).join('');
  const buttons = [...host.querySelectorAll<HTMLButtonElement>('.crayon')];
  host.addEventListener('click', (e) => {
    const hex = (e.target as Element).closest<HTMLButtonElement>('.crayon')?.dataset['hex'];
    if (hex) onPick(hex);
  });
  return (hex) => {
    for (const b of buttons) {
      const on = b.dataset['hex'] === hex;
      b.setAttribute('aria-pressed', String(on));
      if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  };
};
