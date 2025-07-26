import { describe, expect, it, vi } from 'vitest';
import { createSpanElement, createCheckboxElement } from '../src/dom-helpers';

describe('createSpanElement', () => {
  it('creates a span with the correct text', () => {
    const cell = { createEl: vi.fn() };
    createSpanElement(cell as any, 'foo');
    expect(cell.createEl).toHaveBeenCalledWith('span', { text: 'foo' });
  });
});

describe('createCheckboxElement', () => {
  it('creates a checkbox with correct checked state and class', () => {
    const addEventListener = vi.fn();
    const box = { className: '', checked: false, addEventListener };
    const cell = {
      createEl: vi.fn(() => box)
    };
    const onChange = vi.fn();
    const result = createCheckboxElement(cell as any, true, onChange);
    expect(cell.createEl).toHaveBeenCalledWith('input', { type: 'checkbox' });
    expect(result.className).toBe('task-list-item-checkbox');
    expect(result.checked).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith('change', onChange);
  });
});
