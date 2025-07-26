import type { Plugin } from 'obsidian';

import { createCheckboxElement, createSpanElement, handleCheckboxChange } from './dom-helpers';

export interface RenderCellCheckboxesOptions {
  cell: HTMLElement;
  cellIdx: number;
  counts: number[];
  srcLine: string;
  lineNum: number;
  file: any;
  plugin: Plugin;
  idx: number;
}

/**
 * Renders checkboxes and spans into a table cell based on its text content.
 * @param options - Rendering options and context
 * @param options.cell - The table cell element
 * @param options.cellIdx - The cell index in the row
 * @param options.counts - Array of checkbox counts per cell
 * @param options.srcLine - The source line for the row
 * @param options.lineNum - The line number in the file
 * @param options.file - The file being modified
 * @param options.plugin - The plugin instance
 * @param options.idx - The global checkbox index
 * @returns The next global checkbox index after rendering
 */
export function renderCellCheckboxes({
  cell,
  cellIdx,
  counts,
  srcLine,
  lineNum,
  file,
  plugin,
  idx
}: RenderCellCheckboxesOptions): number {
  const text = cell.textContent || '';
  const actions = renderCellCheckboxesPure(text);
  while (cell.firstChild) cell.removeChild(cell.firstChild);
  let localIdx = 0;
  actions.forEach(action => {
    if (action.type === 'span') {
      createSpanElement(cell, action.text!);
    } else if (action.type === 'checkbox') {
      const globalIdx = idx + localIdx;
      const box = createCheckboxElement(cell, action.checked!, () => {
        handleCheckboxChange({ box, plugin, file, lineNum, idx: globalIdx });
      });
      localIdx++;
    }
  });
  return idx + localIdx;
}

/**
 * Represents a render action for a table cell: either a span or a checkbox.
 * @typedef {Object} CheckboxRenderAction
 * @property {'span'|'checkbox'} type - The type of render action
 * @property {string} [text] - The text for a span
 * @property {boolean} [checked] - The checked state for a checkbox
 */
export interface CheckboxRenderAction {
  type: 'span' | 'checkbox';
  text?: string;
  checked?: boolean;
}

/**
 * Parses a cell's text and returns a sequence of render actions (spans and checkboxes).
 * @param text - The cell text to parse
 * @returns An array of CheckboxRenderAction objects
 */
export function renderCellCheckboxesPure(text: string): CheckboxRenderAction[] {
  const pattern = /\[( |x)\]/g;
  const matches = [...text.matchAll(pattern)];
  if (!matches.length) return [{ type: 'span', text }];
  let last = 0;
  const actions: CheckboxRenderAction[] = [];
  matches.forEach(match => {
    if (match.index! > last) {
      actions.push({ type: 'span', text: text.slice(last, match.index) });
    }
    actions.push({ type: 'checkbox', checked: match[0] === '[x]' });
    last = match.index! + match[0].length;
  });
  if (last < text.length) {
    actions.push({ type: 'span', text: text.slice(last) });
  }
  return actions;
}
