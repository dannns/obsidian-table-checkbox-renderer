import { describe, it, expect } from 'vitest';
import { renderCellCheckboxesPure } from '../src/render-cell-checkboxes';

describe('renderCellCheckboxesPure', () => {
  it('returns a single span if no checkboxes', () => {
    expect(renderCellCheckboxesPure('hello world')).toEqual([
      { type: 'span', text: 'hello world' }
    ]);
  });

  it('renders a single unchecked checkbox', () => {
    expect(renderCellCheckboxesPure('foo [ ] bar')).toEqual([
      { type: 'span', text: 'foo ' },
      { type: 'checkbox', checked: false },
      { type: 'span', text: ' bar' }
    ]);
  });

  it('renders a single checked checkbox', () => {
    expect(renderCellCheckboxesPure('foo [x] bar')).toEqual([
      { type: 'span', text: 'foo ' },
      { type: 'checkbox', checked: true },
      { type: 'span', text: ' bar' }
    ]);
  });

  it('renders multiple checkboxes', () => {
    expect(renderCellCheckboxesPure('[ ] foo [x] bar [ ]')).toEqual([
      { type: 'checkbox', checked: false },
      { type: 'span', text: ' foo ' },
      { type: 'checkbox', checked: true },
      { type: 'span', text: ' bar ' },
      { type: 'checkbox', checked: false }
    ]);
  });

  it('handles only checkboxes', () => {
    expect(renderCellCheckboxesPure('[ ] [x]')).toEqual([
      { type: 'checkbox', checked: false },
      { type: 'span', text: ' ' },
      { type: 'checkbox', checked: true }
    ]);
  });

  it('handles empty string', () => {
    expect(renderCellCheckboxesPure('')).toEqual([
      { type: 'span', text: '' }
    ]);
  });
});
