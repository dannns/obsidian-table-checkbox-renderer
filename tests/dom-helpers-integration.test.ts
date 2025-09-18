import { describe, expect, it, vi } from 'vitest';
import { handleCheckboxChange } from '../src/dom-helpers';

describe('handleCheckboxChange (process only)', () => {
  it('updates the correct line and sets checkbox state (checked)', async () => {
    let content = 'a\n[ ] foo\nc';
    const process = vi.fn(async (_file, fn: (data: string) => string) => { content = fn(content); });
    const plugin = { app: { vault: { process } } };
    const file = {};
    const box = { checked: true } as any;
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe('a\n[x] foo\nc');
    expect(box.checked).toBe(true);
  });

  it('updates the correct line and sets checkbox state (unchecked)', async () => {
    let content = 'a\n[x] foo\nc';
    const process = vi.fn(async (_file, fn: (data: string) => string) => { content = fn(content); });
    const plugin = { app: { vault: { process } } };
    const file = {};
    const box = { checked: false } as any;
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe('a\n[ ] foo\nc');
    expect(box.checked).toBe(false);
  });

  it('does nothing if lineNum is out of bounds', async () => {
    let content = 'a\nb\nc';
    const original = content;
    const process = vi.fn(async (_file, fn: (data: string) => string) => { content = fn(content); });
    const plugin = { app: { vault: { process } } };
    const file = {};
    const box = { checked: true } as any;
    await handleCheckboxChange({ box, plugin, file, lineNum: 5, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe(original);
  });

  it('does nothing if checkbox index is not found', async () => {
    let content = 'a\nfoo\nc';
    const original = content;
    const process = vi.fn(async (_file, fn: (data: string) => string) => { content = fn(content); });
    const plugin = { app: { vault: { process } } };
    const file = {};
    const box = { checked: true } as any;
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe(original);
  });
});
