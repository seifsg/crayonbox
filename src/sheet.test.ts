import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BLANK, Sheet } from './sheet.ts';

const R = '#e63946';
const B = '#1971c2';

test('paint fills one region and undo walks back to blank', () => {
  const s = new Sheet([BLANK, BLANK]);
  s.paint(0, R);
  s.paint(0, B);
  assert.deepEqual(s.colors, [B, BLANK]);
  assert.deepEqual(s.undo(), [[0, B, R]]);
  s.undo();
  assert.deepEqual(s.colors, [BLANK, BLANK]);
  assert.equal(s.canUndo, false);
  assert.deepEqual(s.undo(), []);
});

test('same color or unknown region is no step', () => {
  const s = new Sheet([R]);
  assert.deepEqual(s.paint(0, R), []);
  assert.deepEqual(s.paint(5, B), []);
  assert.equal(s.canUndo, false);
});

test('clear is one step; one undo restores every color', () => {
  const s = new Sheet([R, BLANK, B]);
  s.clear();
  assert.equal(s.isBlank, true);
  s.undo();
  assert.deepEqual(s.colors, [R, BLANK, B]);
  assert.deepEqual(new Sheet([BLANK]).clear(), []);
});
