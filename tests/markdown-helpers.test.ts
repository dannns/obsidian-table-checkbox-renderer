import { describe, it, expect } from 'vitest';
import { getSourceLineFromContent } from '../src/markdown-helpers';

describe('getSourceLineFromContent', () => {
  it('returns the correct line for valid index', () => {
    expect(getSourceLineFromContent('a\nb\nc', 1)).toBe('b');
  });

  it('returns null for out-of-bounds index', () => {
    expect(getSourceLineFromContent('a\nb\nc', 5)).toBeNull();
    expect(getSourceLineFromContent('a\nb\nc', -1)).toBeNull();
  });

  it('returns null for empty content', () => {
    expect(getSourceLineFromContent('', 0)).toBeNull();
  });
});
