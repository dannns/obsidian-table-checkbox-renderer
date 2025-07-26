import { describe, it, expect, vi } from 'vitest';
import { renderCellCheckboxesPure } from '../src/render-cell-checkboxes';
import { createSpanElement, createCheckboxElement, handleCheckboxChange } from '../src/dom-helpers';

describe('integration: renderCellCheckboxes and handleCheckboxChange', () => {
  it('updates the correct checkbox in markdown when toggled', async () => {
    const markdown = '| [ ] foo | bar [x] |';
    const lineNum = 0;
    const file = {};
    let content = markdown;
    const plugin = {
      app: {
        vault: {
          read: vi.fn(async () => content),
          modify: vi.fn(async (_file, newContent) => { content = newContent; })
        }
      }
    };
    const cells = [
      { textContent: '[ ] foo', children: [], createEl: vi.fn(), firstChild: null, removeChild: vi.fn() },
      { textContent: 'bar [x]', children: [], createEl: vi.fn(), firstChild: null, removeChild: vi.fn() }
    ];
    let idx = 0;
    const boxes: any[] = [];
    for (const cell of cells) {
      const text = cell.textContent || '';
      const actions = renderCellCheckboxesPure(text);
      while (cell.firstChild) cell.removeChild(cell.firstChild);
      let localIdx = 0;
      for (const action of actions) {
        if (action.type === 'span') {
          createSpanElement(cell as any, action.text!);
        } else if (action.type === 'checkbox') {
          const box = { checked: action.checked };
          boxes.push(box);
          const globalIdx = idx + localIdx;
          box.checked = !box.checked;
          await handleCheckboxChange({ box, plugin, file, lineNum, idx: globalIdx });
          localIdx++;
        }
      }
      idx += localIdx;
    }
    expect(content).toBe('| [x] foo | bar [ ] |');
  });
});
