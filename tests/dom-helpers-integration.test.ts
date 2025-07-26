import { describe, it, expect, vi } from 'vitest';
import { handleCheckboxChange } from '../src/dom-helpers';

describe('handleCheckboxChange', () => {
  it('modifies the correct line and sets checkbox state (checked)', async () => {
    const modify = vi.fn();
    const read = vi.fn(async () => 'a\n[ ] foo\nc');
    const plugin = { app: { vault: { read, modify } } };
    const file = {};
    const box = { checked: true };
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(modify).toHaveBeenCalledWith(file, 'a\n[x] foo\nc');
    expect(box.checked).toBe(true);
  });

  it('modifies the correct line and sets checkbox state (unchecked)', async () => {
    const modify = vi.fn();
    const read = vi.fn(async () => 'a\n[x] foo\nc');
    const plugin = { app: { vault: { read, modify } } };
    const file = {};
    const box = { checked: false };
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(modify).toHaveBeenCalledWith(file, 'a\n[ ] foo\nc');
    expect(box.checked).toBe(false);
  });

  it('does nothing if lineNum is out of bounds', async () => {
    const modify = vi.fn();
    const read = vi.fn(async () => 'a\nb\nc');
    const plugin = { app: { vault: { read, modify } } };
    const file = {};
    const box = { checked: true };
    await handleCheckboxChange({ box, plugin, file, lineNum: 5, idx: 0 });
    expect(modify).not.toHaveBeenCalled();
  });

  it('does nothing if checkbox index is not found', async () => {
    const modify = vi.fn();
    const read = vi.fn(async () => 'a\nfoo\nc');
    const plugin = { app: { vault: { read, modify } } };
    const file = {};
    const box = { checked: true };
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(modify).not.toHaveBeenCalled();
  });
});
