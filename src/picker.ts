import { PAGES, fillAll, mount, type Page } from './pages.ts';

/** Colors to show for a page with `n` regions (live sheet or saved progress). */
export type ColorsOf = (page: Page, n: number) => readonly string[];

/** Opens the page picker; thumbnails show each page as the child left it. */
export const openPicker = (dialog: HTMLDialogElement, current: Page, colorsOf: ColorsOf, onPick: (page: Page) => void): void => {
  const grid = dialog.querySelector('.thumbs');
  if (!grid) throw new Error('picker: missing .thumbs');
  grid.replaceChildren(
    ...PAGES.map((page) => {
      const b = Object.assign(document.createElement('button'), { type: 'button', className: 'thumb', title: page.title });
      b.setAttribute('aria-label', page.title);
      b.toggleAttribute('aria-current', page === current);
      const regions = mount(b, page);
      fillAll(regions, colorsOf(page, regions.length));
      b.addEventListener('click', () => {
        dialog.close();
        onPick(page);
      });
      return b;
    }),
  );
  dialog.showModal();
  grid.querySelector<HTMLElement>('[aria-current]')?.focus();
};

/** Closes the dialog on its close button or a tap on the backdrop. */
export const bindPickerClose = (dialog: HTMLDialogElement): void => {
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog || (e.target as Element).closest('.close')) dialog.close();
  });
};
