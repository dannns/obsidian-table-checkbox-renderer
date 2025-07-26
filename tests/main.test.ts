import { describe, it, expect } from 'vitest';
import { getCheckboxCountsPerCell, getSourceLineNumber, getSourceLineFromContent } from '../src/markdown-helpers';
import TableCheckboxRendererPlugin, { renderCellCheckboxes } from '../src/main';
import { vi } from 'vitest';
import { JSDOM } from 'jsdom';
import * as domHelpers from '../src/dom-helpers';

// Mock DOM helpers
const createElMock = vi.fn((tag, opts) => {
  const el = document.createElement(tag);
  if (opts?.text) el.textContent = opts.text;
  if (opts?.type) el.type = opts.type;
  return el;
});

// Setup jsdom if not already present
defineDom();
function defineDom() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    const { window } = new JSDOM('<!doctype html><html><body></body></html>');
    global.window = window;
    global.document = window.document;
    global.HTMLElement = window.HTMLElement;
  }
}

// Patch createEl on HTMLElement prototype for all elements
if (typeof globalThis.HTMLElement !== 'undefined') {
  globalThis.HTMLElement.prototype.createEl = function(tag, opts) {
    const el = document.createElement(tag);
    if (opts?.text) el.textContent = opts.text;
    if (opts?.type) el.type = opts.type;
    this.appendChild(el);
    return el;
  };
}

describe('getCheckboxCountsPerCell', () => {
  it('counts checkboxes in each cell of a table row', () => {
    const line = '| [ ] | [x] [ ] | foo | [x] |';
    const result = getCheckboxCountsPerCell(line);
    expect(result).toEqual([1, 2, 0, 1]);
  });

  it('returns zeros for cells with no checkboxes', () => {
    const line = '| foo | bar | baz |';
    const result = getCheckboxCountsPerCell(line);
    expect(result).toEqual([0, 0, 0]);
  });

  it('handles empty lines', () => {
    const line = '';
    const result = getCheckboxCountsPerCell(line);
    expect(result).toEqual([0]);
  });

  it('handles mixed content', () => {
    const line = '| [ ] foo | bar [x] [ ] | [x]baz|';
    const result = getCheckboxCountsPerCell(line);
    expect(result).toEqual([1, 2, 1]);
  });
});

describe('getSourceLineNumber', () => {
  it('returns correct line number for valid sectionInfo and rowIdx', () => {
    expect(getSourceLineNumber({ lineStart: 5 }, 2)).toBe(8);
    expect(getSourceLineNumber({ lineStart: 0 }, 0)).toBe(1);
  });

  it('returns null if sectionInfo is null', () => {
    expect(getSourceLineNumber(null, 3)).toBeNull();
  });

  it('handles negative rowIdx', () => {
    expect(getSourceLineNumber({ lineStart: 5 }, -1)).toBe(5);
  });
});

describe('renderCellCheckboxes', () => {
  it('renders spans and checkboxes in a table cell', () => {
    const cell = document.createElement('td');
    cell.textContent = 'foo [ ] bar [x]';
    renderCellCheckboxes(cell, 0, [2], 'foo [ ] bar [x]', 0, {}, {}, 0);
    expect(cell.querySelectorAll('span, input[type="checkbox"]').length).toBeGreaterThan(0);
  });

  it('calls handleCheckboxChange when checkbox is clicked', () => {
    const cell = document.createElement('td');
    cell.textContent = '[ ] foo';
    const handleCheckboxChange = vi.spyOn(domHelpers, 'handleCheckboxChange').mockImplementation(() => {});
    renderCellCheckboxes(cell, 0, [1], '[ ] foo', 0, {}, {}, 0);
    const checkbox = cell.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
    checkbox.dispatchEvent(new window.Event('change'));
    expect(handleCheckboxChange).toHaveBeenCalled();
    handleCheckboxChange.mockRestore();
  });
});

describe('TableCheckboxRendererPlugin', () => {
  it('registers a markdown post processor and processes tables', async () => {
    const plugin = new TableCheckboxRendererPlugin();
    // Mock Obsidian plugin API
    plugin.registerMarkdownPostProcessor = vi.fn((cb) => {
      // Simulate a table in the DOM
      const table = document.createElement('table');
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.textContent = '[ ] foo';
      tr.appendChild(td);
      table.appendChild(tr);
      const el = document.createElement('div');
      el.appendChild(table);
      // Mock context
      const ctx = {
        getSectionInfo: () => ({ lineStart: 0 }),
      };
      // Directly assign mock app property
      plugin.app = {
        workspace: { getActiveViewOfType: () => ({ file: { path: 'mock.md' } }), getActiveFile: () => ({ path: 'mock.md' }) },
        vault: { read: async () => '[ ] foo', modify: vi.fn() },
      };
      // Patch getActiveFile and getSourceLine
      vi.mock('../src/obsidian-helpers', () => ({
        getActiveFile: () => ({ path: 'mock.md' }),
        getSourceLine: async () => '[ ] foo',
      }));
      // Call the processor
      return cb(el, ctx);
    });
    await plugin.onload();
    expect(plugin.registerMarkdownPostProcessor).toHaveBeenCalled();
  });

  it('handles missing table rows gracefully', async () => {
    const plugin = new TableCheckboxRendererPlugin();
    plugin.registerMarkdownPostProcessor = vi.fn((cb) => {
      const el = document.createElement('div');
      // No table in el
      const ctx = { getSectionInfo: () => null };
      return cb(el, ctx);
    });
    await plugin.onload();
    expect(plugin.registerMarkdownPostProcessor).toHaveBeenCalled();
  });
});
