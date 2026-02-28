import { Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';
import { getCheckboxCountsPerCell, getSourceLineNumber } from './markdown-helpers';
import { getSourceLine } from './obsidian-helpers';
import { renderCellCheckboxes } from './render-cell-checkboxes';

/**
 * Main plugin class for rendering interactive checkboxes in Markdown tables.
 */
export default class TableCheckboxRendererPlugin extends Plugin {
  async onload() {
    this.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
      el.querySelectorAll('table').forEach(table => {
        let dataRowIdx = 0;
        table.querySelectorAll('tr').forEach(async (row) => {
          if (!row.querySelector('td')) return;
          const section = typeof ctx.getSectionInfo === 'function' ? ctx.getSectionInfo(el) : null;
          const lineNum = getSourceLineNumber(section, dataRowIdx);
          dataRowIdx++;
          const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath) as TFile | null;
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
