import { describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';

import * as domHelpers from '../src/dom-helpers';
import { getCheckboxCountsPerCell, getSourceLineNumber, getSourceLineFromContent } from '../src/markdown-helpers';
import TableCheckboxRendererPlugin from '../src/main';
import { renderCellCheckboxes } from '../src/render-cell-checkboxes';

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
  it('returns correct line number for valid sectionInfo and dataRowIdx', () => {
    expect(getSourceLineNumber({ lineStart: 5 }, 2)).toBe(9);
    expect(getSourceLineNumber({ lineStart: 0 }, 0)).toBe(2);
  });

  it('returns null if sectionInfo is null', () => {
    expect(getSourceLineNumber(null, 3)).toBeNull();
  });

  it('handles negative dataRowIdx', () => {
    expect(getSourceLineNumber({ lineStart: 5 }, -1)).toBe(6);
  });

  it('is immune to extra non-td rows (Sheets Extended scenario)', () => {
    // The caller (main.ts) passes dataRowIdx=0 for the first data row regardless of
    // how many extra non-td <tr> rows Sheets Extended prepends to the HTML table.
    // Without this fix, rowIdx=3 (2 extra SE rows + 1 header) would give lineStart+3+1=lineStart+4 (wrong).
    // With dataRowIdx=0 the formula gives lineStart+0+2=lineStart+2 (correct).
    expect(getSourceLineNumber({ lineStart: 0 }, 0)).toBe(2);   // first data row
    expect(getSourceLineNumber({ lineStart: 0 }, 1)).toBe(3);   // second data row
    expect(getSourceLineNumber({ lineStart: 0 }, 19)).toBe(21); // 20th data row
  });
});

describe('renderCellCheckboxes', () => {
  it('renders spans and checkboxes in a table cell', () => {
    const cell = document.createElement('td');
    cell.textContent = 'foo [ ] bar [x]';
    renderCellCheckboxes({
      cell,
      cellIdx: 0,
      counts: [2],
      srcLine: 'foo [ ] bar [x]',
      lineNum: 0,
      file: {},
      plugin: {} as any,
      idx: 0
    });
    expect(cell.querySelectorAll('span, input[type="checkbox"]').length).toBeGreaterThan(0);
  });

  it('preserves link elements while rendering checkboxes', () => {
    const cell = document.createElement('td');
    // Create a link element
    const link = document.createElement('a');
    link.href = 'https://example.com';
    link.textContent = 'Example Link';
    cell.appendChild(link);
    // Add text with checkbox after the link
    cell.appendChild(document.createTextNode(' [ ] '));

    renderCellCheckboxes({
      cell,
      cellIdx: 0,
      counts: [1],
      srcLine: '[Example Link](https://example.com) [ ]',
      lineNum: 0,
      file: {},
      plugin: {} as any,
      idx: 0
    });

    // Link should still exist
    const preservedLink = cell.querySelector('a');
    expect(preservedLink).toBeTruthy();
    expect(preservedLink?.href).toBe('https://example.com/');
    expect(preservedLink?.textContent).toBe('Example Link');

    // Checkbox should be rendered
    const checkbox = cell.querySelector('input[type="checkbox"]');
    expect(checkbox).toBeTruthy();
  });

  it('preserves links with checkboxes in mixed content', () => {
    const cell = document.createElement('td');
    // Build: "[ ] " + <a>Link</a> + " [x]"
    cell.appendChild(document.createTextNode('[ ] '));
    const link = document.createElement('a');
    link.href = 'https://github.com';
    link.textContent = 'GitHub';
    cell.appendChild(link);
    cell.appendChild(document.createTextNode(' [x]'));

    renderCellCheckboxes({
      cell,
      cellIdx: 0,
      counts: [2],
      srcLine: '[ ] [GitHub](https://github.com) [x]',
      lineNum: 0,
      file: {},
      plugin: {} as any,
      idx: 0
    });

    // Link should be preserved
    const preservedLink = cell.querySelector('a');
    expect(preservedLink).toBeTruthy();
    expect(preservedLink?.textContent).toBe('GitHub');

    // Both checkboxes should be rendered
    const checkboxes = cell.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBe(2);
  });

  it('calls handleCheckboxChange when checkbox is clicked', () => {
    const cell = document.createElement('td');
    cell.textContent = '[ ] foo';
    const handleCheckboxChange = vi.spyOn(domHelpers, 'handleCheckboxChange').mockImplementation(() => {});
    renderCellCheckboxes({
      cell,
      cellIdx: 0,
      counts: [1],
      srcLine: '[ ] foo',
      lineNum: 0,
      file: {},
      plugin: {} as any,
      idx: 0
    });
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
      // Mock context - sourcePath identifies the rendered file directly
      const ctx = {
        getSectionInfo: () => ({ lineStart: 0 }),
        sourcePath: 'mock.md',
      };
      // Directly assign mock app property
      // vault.getAbstractFileByPath is used instead of getActiveFile for reliable file resolution
      plugin.app = {
        vault: {
          read: async () => 'line0\nline1\n[ ] foo',
          modify: vi.fn(),
          getAbstractFileByPath: () => ({ path: 'mock.md' }),
        },
      };
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
