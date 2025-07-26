import { describe, expect, it, vi } from 'vitest';
import { getActiveFile, getSourceLine } from '../src/obsidian-helpers';

vi.mock('obsidian');

describe('getActiveFile', () => {
  it('returns file from active MarkdownView', () => {
    const file = { path: 'foo.md' };
    const plugin = {
      app: {
        workspace: {
          getActiveViewOfType: vi.fn(() => ({ file })),
          getActiveFile: vi.fn()
        }
      }
    };
    expect(getActiveFile(plugin)).toBe(file);
  });

  it('returns file from workspace if no MarkdownView', () => {
    const file = { path: 'bar.md' };
    const plugin = {
      app: {
        workspace: {
          getActiveViewOfType: vi.fn(() => null),
          getActiveFile: vi.fn(() => file)
        }
      }
    };
    expect(getActiveFile(plugin)).toBe(file);
  });
});

describe('getSourceLine', () => {
  it('returns the correct line for valid index', async () => {
    const plugin = {
      app: {
        vault: {
          read: vi.fn(async () => 'a\nb\nc')
        }
      }
    };
    const file = {};
    expect(await getSourceLine(plugin, file, 1)).toBe('b');
  });

  it('returns null for out-of-bounds index', async () => {
    const plugin = {
      app: {
        vault: {
          read: vi.fn(async () => 'a\nb\nc')
        }
      }
    };
    const file = {};
    expect(await getSourceLine(plugin, file, 5)).toBeNull();
    expect(await getSourceLine(plugin, file, -1)).toBeNull();
  });

  it('returns null on read error', async () => {
    const plugin = {
      app: {
        vault: {
          read: vi.fn(async () => { throw new Error('fail'); })
        }
      }
    };
    const file = {};
    expect(await getSourceLine(plugin, file, 0)).toBeNull();
  });
});
