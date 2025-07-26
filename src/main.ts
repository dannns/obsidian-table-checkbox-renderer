import { Plugin, MarkdownView, MarkdownPostProcessorContext } from 'obsidian';
import { getCheckboxCountsPerCell, getSourceLineNumber } from './markdown-helpers';
import { getActiveFile, getSourceLine } from './obsidian-helpers';
import { renderCellCheckboxesPure } from './render-cell-checkboxes';
import { createSpanElement, createCheckboxElement, handleCheckboxChange } from './dom-helpers';

export default class TableCheckboxRendererPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      el.querySelectorAll('table').forEach(table => {
        table.querySelectorAll('tr').forEach(async (row, rowIdx) => {
          if (!row.querySelector('td')) return;
          const section = typeof ctx.getSectionInfo === 'function' ? ctx.getSectionInfo(el) : null;
          const lineNum = getSourceLineNumber(section, rowIdx);
          const file = getActiveFile(this);
          if (!file || lineNum == null) return;
          const srcLine = await getSourceLine(this, file, lineNum);
          if (!srcLine) return;
          const counts = getCheckboxCountsPerCell(srcLine);
          let idx = 0;
          row.querySelectorAll('td').forEach((cell, cellIdx) => {
            idx = renderCellCheckboxes(cell, cellIdx, counts, srcLine, lineNum, file, this, idx);
          });
        });
      });
    });
  }
}

export function renderCellCheckboxes(cell: any, cellIdx: any, counts: any, srcLine: any, lineNum: any, file: any, plugin: any, idx: number) {
  const text = cell.textContent || '';
  const actions = renderCellCheckboxesPure(text);
  while (cell.firstChild) cell.removeChild(cell.firstChild);
  let localIdx = 0;
  actions.forEach(action => {
    if (action.type === 'span') {
      createSpanElement(cell, action.text!);
    } else if (action.type === 'checkbox') {
      const globalIdx = idx + localIdx;
      const box = createCheckboxElement(cell, action.checked!, () => {
        handleCheckboxChange({ box, plugin, file, lineNum, idx: globalIdx });
      });
      localIdx++;
    }
  });
  return idx + localIdx;
}
