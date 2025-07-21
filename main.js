"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
// Table Checkbox Renderer: Interactive checkboxes in Markdown tables
class TableCheckboxRendererPlugin extends obsidian_1.Plugin {
    async onload() {
        console.log('Loading TableCheckboxRendererPlugin');
        this.registerMarkdownPostProcessor(async (element, context) => {
            const tables = element.querySelectorAll('table');
            tables.forEach(table => {
                table.querySelectorAll('tr').forEach(async (row, rowIdx) => {
                    const lineNumber = getSourceLineNumber(context, element, table, rowIdx);
                    const file = getActiveFile(this);
                    if (!file || lineNumber === null)
                        return;
                    const sourceLine = await getSourceLine(this, file, lineNumber);
                    if (!sourceLine)
                        return;
                    const cellCheckboxCounts = getCheckboxCountsPerCell(sourceLine);
                    row.querySelectorAll('td').forEach((cell, cellIdx) => {
                        renderCellCheckboxes(cell, cellIdx, cellCheckboxCounts, sourceLine, lineNumber, file, this);
                    });
                });
            });
        });
    }
    async onunload() {
        console.log('Unloading TableCheckboxRendererPlugin');
        // No explicit cleanup needed; Obsidian handles post-processor unregistering.
    }
}
exports.default = TableCheckboxRendererPlugin;
function getSourceLineNumber(context, element, table, rowIdx) {
    const sectionInfo = typeof context.getSectionInfo === 'function'
        ? context.getSectionInfo(element)
        : null;
    if (!sectionInfo)
        return null;
    return sectionInfo.lineStart + rowIdx + 1;
}
function getActiveFile(plugin) {
    const activeView = plugin.app.workspace.getActiveViewOfType(obsidian_1.MarkdownView);
    return activeView?.file || plugin.app.workspace.getActiveFile();
}
async function getSourceLine(plugin, file, lineNumber) {
    try {
        const fileContent = await plugin.app.vault.read(file);
        const lines = fileContent.split(/\r?\n/);
        if (lineNumber >= lines.length)
            return null;
        return lines[lineNumber];
    }
    catch {
        return null;
    }
}
function getCheckboxCountsPerCell(sourceLine) {
    return sourceLine.split('|').map((s) => s.trim()).filter((s) => s.length > 0)
        .map((cell) => [...cell.matchAll(/\[( |x)\]/g)].length);
}
function renderCellCheckboxes(cell, cellIdx, cellCheckboxCounts, sourceLine, lineNumber, file, plugin) {
    const checkboxPattern = /\[( |x)\]/g;
    const cellText = cell.textContent || '';
    const matches = [...cellText.matchAll(checkboxPattern)];
    if (matches.length === 0)
        return;
    let baseIdx = 0;
    for (let i = 0; i < cellIdx; i++)
        baseIdx += cellCheckboxCounts[i];
    let lastIndex = 0;
    while (cell.firstChild)
        cell.removeChild(cell.firstChild);
    matches.forEach((match, idx) => {
        if (match.index > lastIndex) {
            cell.createEl('span', { text: cellText.slice(lastIndex, match.index) });
        }
        lastIndex = match.index + match[0].length;
        const checkbox = cell.createEl('input', { type: 'checkbox' });
        checkbox.className = 'task-list-item-checkbox';
        checkbox.checked = match[0] === '[x]';
        const globalIdx = baseIdx + idx;
        checkbox.addEventListener('change', async () => {
            const fileContent = await plugin.app.vault.read(file);
            const lines = fileContent.split(/\r?\n/);
            if (lineNumber >= lines.length)
                return;
            const lineContent = lines[lineNumber];
            const sourceMatches = [...lineContent.matchAll(checkboxPattern)];
            const matchIndex = sourceMatches[globalIdx]?.index ?? -1;
            if (matchIndex === -1)
                return;
            let newState = '[ ]';
            if (checkbox.checked)
                newState = '[x]';
            lines[lineNumber] =
                lineContent.substring(0, matchIndex) +
                    newState +
                    lineContent.substring(matchIndex + 3);
            await plugin.app.vault.modify(file, lines.join('\n'));
            checkbox.checked = newState === '[x]';
        });
    });
    if (lastIndex < cellText.length) {
        cell.createEl('span', { text: cellText.slice(lastIndex) });
    }
}
