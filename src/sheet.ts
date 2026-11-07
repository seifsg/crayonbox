export const BLANK = '#ffffff';

/** One region change: [region index, color before, color after]. */
export type Edit = readonly [index: number, from: string, to: string];

/** One page's colors plus its undo stack. Pure (no DOM) so the core rules stay testable. */
export class Sheet {
  readonly colors: string[];
  #done: Edit[][] = [];

  constructor(colors: string[]) {
    this.colors = colors;
  }

  get canUndo(): boolean {
    return this.#done.length > 0;
  }

  get isBlank(): boolean {
    return this.colors.every((c) => c === BLANK);
  }

  /** Fills region `i`; returns the edits to draw ([] when nothing changes). */
  paint(i: number, color: string): Edit[] {
    const from = this.colors[i];
    return from === undefined || from === color ? [] : this.#apply([[i, from, color]]);
  }

  /** Blanks every colored region as ONE undo step, so a mis-tap on Clear is one Undo away. */
  clear(): Edit[] {
    return this.#apply(this.colors.flatMap((c, i): Edit[] => (c === BLANK ? [] : [[i, c, BLANK]])));
  }

  /** Reverts the last step; returns the edits to draw. */
  undo(): Edit[] {
    const back = (this.#done.pop() ?? []).map(([i, from, to]): Edit => [i, to, from]);
    this.#set(back);
    return back;
  }

  #apply(edits: Edit[]): Edit[] {
    if (edits.length) {
      this.#set(edits);
      this.#done.push(edits);
    }
    return edits;
  }

  #set(edits: readonly Edit[]): void {
    for (const [i, , to] of edits) this.colors[i] = to;
  }
}
