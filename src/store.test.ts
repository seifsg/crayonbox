import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BLANK } from './sheet.ts';
import { normalize } from './store.ts';

test('normalize keeps valid saved colors', () => {
  assert.deepEqual(normalize(['#e63946', BLANK], 2), ['#e63946', BLANK]);
});

test('normalize blanks bad entries and mismatched or garbage data', () => {
  assert.deepEqual(normalize(['#e63946', 'red', 7], 3), ['#e63946', BLANK, BLANK]);
  assert.deepEqual(normalize(['#e63946'], 2), [BLANK, BLANK]);
  for (const junk of [null, undefined, 'x', {}, 42]) assert.deepEqual(normalize(junk, 1), [BLANK]);
});
