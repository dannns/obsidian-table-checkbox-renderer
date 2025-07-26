import { Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';
import { getCheckboxCountsPerCell, getSourceLineNumber } from './markdown-helpers';
import { getActiveFile, getSourceLine } from './obsidian-helpers';
import { renderCellCheckboxes } from './render-cell-checkboxes';

/**
 * Main plugin class for rendering interactive checkboxes in Markdown tables.
 */
export default class TableCheckboxRendererPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      el.querySelectorAll('table').forEach(table => {
        table.querySelectorAll('tr').forEach(async (row, rowIdx) => {
          if (!row.querySelector('td')) return;
          const section = typeof ctx.getSectionInfo === 'function' ? ctx.getSectionInfo(el) : null;
          const lineNum = getSourceLineNumber(section, rowIdx);
          const file = getActiveFile(this) as TFile | null;
          if (!file || lineNum == null) return;
          const srcLine = await getSourceLine(this, file, lineNum);
          if (!srcLine) return;
          const counts = getCheckboxCountsPerCell(srcLine);
          let idx = 0;
          row.querySelectorAll('td').forEach((cell, cellIdx) => {
            idx = renderCellCheckboxes({
              cell,
              cellIdx,
              counts,
              srcLine,
              lineNum,
              file,
              plugin: this,
              idx
            });
          });
        });
      });
    });
  }
}
