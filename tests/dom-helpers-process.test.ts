import { describe, it, expect, vi } from 'vitest';
import { handleCheckboxChange } from '../src/dom-helpers';

// Test that when vault.process is available, it is used instead of read/modify directly.
describe('handleCheckboxChange with vault.process', () => {
  it('updates content atomically via process', async () => {
    const file = { path: 'foo.md' };
    let content = 'a\n[ ] task\nc';
    const process = vi.fn(async (_file, fn: (data: string) => string) => {
      content = fn(content);
    });
    const read = vi.fn(async () => content);
    const modify = vi.fn(async (_file, data) => { content = data; });
    const plugin = { app: { vault: { process, read, modify } } };
    const box: any = { checked: true };
    await handleCheckboxChange({ box, plugin, file, lineNum: 1, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe('a\n[x] task\nc');
    expect(box.checked).toBe(true);
    // ensure fallback methods were not called in this path
    expect(read).not.toHaveBeenCalled();
    expect(modify).not.toHaveBeenCalled();
  });

  it('gracefully no-op when line out of bounds', async () => {
    const file = { path: 'foo.md' };
    let content = 'single';
    const process = vi.fn(async (_file, fn: (data: string) => string) => { content = fn(content); });
    const plugin = { app: { vault: { process } } };
    const box: any = { checked: true };
    await handleCheckboxChange({ box, plugin, file, lineNum: 5, idx: 0 });
    expect(process).toHaveBeenCalled();
    expect(content).toBe('single');
  });
});
