import { describe, it, expect } from 'vitest';
import { getCheckboxCountsPerCell, getSourceLineNumber, getSourceLineFromContent } from '../src/markdown-helpers';

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
