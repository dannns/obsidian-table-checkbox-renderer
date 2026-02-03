import type { Plugin } from 'obsidian';

import { handleCheckboxChange } from './dom-helpers';

// Node type constants (for environments where Node is not globally defined)
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

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
 * Preserves existing element nodes (links, etc.) and only processes text nodes.
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
  let localIdx = 0;

  /**
   * Process a single text node, replacing checkbox patterns with actual checkboxes.
   * Returns an array of nodes (text nodes and checkbox elements) to replace the original.
   */
  const processTextNode = (textNode: Text): Node[] => {
    const text = textNode.textContent || '';
    const actions = renderCellCheckboxesPure(text);

    // If no checkboxes found, keep the original text node
    if (actions.length === 1 && actions[0].type === 'span') {
      return [textNode];
    }

    const fragment: Node[] = [];
    actions.forEach(action => {
      if (action.type === 'span') {
        fragment.push(document.createTextNode(action.text!));
      } else if (action.type === 'checkbox') {
        const globalIdx = idx + localIdx;
        const box = document.createElement('input');
        box.type = 'checkbox';
        box.className = 'task-list-item-checkbox';
        box.checked = action.checked!;
        box.addEventListener('change', () => {
          handleCheckboxChange({ box, plugin, file, lineNum, idx: globalIdx });
        });
        fragment.push(box);
        localIdx++;
      }
    });
    return fragment;
  };

  /**
   * Recursively process all child nodes, preserving element nodes
   * and only transforming text nodes that contain checkbox patterns.
   */
  const processNode = (node: Node): void => {
    const childNodes = Array.from(node.childNodes);
    for (const child of childNodes) {
      if (child.nodeType === TEXT_NODE) {
        const replacements = processTextNode(child as Text);
        if (replacements.length === 1 && replacements[0] === child) {
          // No change needed
          continue;
        }
        // Replace the text node with the new nodes
        const parent = child.parentNode;
        if (parent) {
          replacements.forEach(newNode => {
            parent.insertBefore(newNode, child);
          });
          parent.removeChild(child);
        }
      } else if (child.nodeType === ELEMENT_NODE) {
        // Recursively process element nodes (but preserve the element itself)
        processNode(child);
      }
    }
  };

  processNode(cell);
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
