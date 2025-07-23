import { Plugin, MarkdownView, MarkdownPostProcessorContext } from 'obsidian';

export default class TableCheckboxRendererPlugin extends Plugin {
    async onload() {
        this.registerMarkdownPostProcessor(async (element: HTMLElement, context: MarkdownPostProcessorContext) => {
            const tables = element.querySelectorAll('table');
            tables.forEach(table => {
                table.querySelectorAll('tr').forEach(async (row, rowIdx) => {
                    const lineNumber = getSourceLineNumber(context, element, table, rowIdx);
                    const file = getActiveFile(this);
                    if (!file || lineNumber === null) return;
                    const sourceLine = await getSourceLine(this, file, lineNumber);
                    if (!sourceLine) return;
                    const cellCheckboxCounts = getCheckboxCountsPerCell(sourceLine);
                    let globalCheckboxIdx = 0;
                    row.querySelectorAll('td').forEach((cell, cellIdx) => {
                        globalCheckboxIdx = renderCellCheckboxes(cell, cellIdx, cellCheckboxCounts, sourceLine, lineNumber, file, this, globalCheckboxIdx);
                    });
                });
            });
        });
    }

    async onunload() {
    }
}

function getSourceLineNumber(context: any, element: any, table: any, rowIdx: any) {
    const sectionInfo = typeof context.getSectionInfo === 'function'
        ? context.getSectionInfo(element)
        : null;
    if (!sectionInfo) return null;
    return sectionInfo.lineStart + rowIdx + 1;
}

function getActiveFile(plugin: any) {
    const activeView = plugin.app.workspace.getActiveViewOfType(MarkdownView);
    return activeView?.file || plugin.app.workspace.getActiveFile();
}

async function getSourceLine(plugin: any, file: any, lineNumber: any) {
    try {
        const fileContent = await plugin.app.vault.read(file);
        const lines = fileContent.split(/\r?\n/);
        if (lineNumber >= lines.length) return null;
        return lines[lineNumber];
    } catch {
        return null;
    }
}

function getCheckboxCountsPerCell(sourceLine: any) {
    return sourceLine.split('|').map((s: any) => [...s.trim().matchAll(/\[( |x)\]/g)].length);
}

function renderCellCheckboxes(cell: any, cellIdx: any, cellCheckboxCounts: any, sourceLine: any, lineNumber: any, file: any, plugin: any, globalCheckboxIdx: number) {
    const checkboxPattern = /\[( |x)\]/g;
    const cellText = cell.textContent || '';
    const matches = [...cellText.matchAll(checkboxPattern)];
    if (matches.length === 0) return globalCheckboxIdx;
    let lastIndex = 0;
    while (cell.firstChild) cell.removeChild(cell.firstChild);
    matches.forEach((match) => {
        if (match.index! > lastIndex) {
            cell.createEl('span', { text: cellText.slice(lastIndex, match.index) });
        }
        lastIndex = match.index! + match[0].length;
        const checkbox = cell.createEl('input', { type: 'checkbox' });
        checkbox.className = 'task-list-item-checkbox';
        checkbox.checked = match[0] === '[x]';
        const thisCheckboxIdx = globalCheckboxIdx;
        checkbox.addEventListener('change', async () => {
            const fileContent = await plugin.app.vault.read(file);
            const lines = fileContent.split(/\r?\n/);
            if (lineNumber >= lines.length) return;
            const lineContent = lines[lineNumber];
            const sourceMatches = [...lineContent.matchAll(checkboxPattern)];
            const matchIndex = sourceMatches[thisCheckboxIdx]?.index ?? -1;
            if (matchIndex === -1) return;
            let newState = '[ ]';
            if (checkbox.checked) newState = '[x]';
            lines[lineNumber] =
                lineContent.substring(0, matchIndex) +
                newState +
                lineContent.substring(matchIndex + 3);
            await plugin.app.vault.modify(file, lines.join('\n'));
            checkbox.checked = newState === '[x]';
        });
        globalCheckboxIdx++;
    });
    if (lastIndex < cellText.length) {
        cell.createEl('span', { text: cellText.slice(lastIndex) });
    }
    return globalCheckboxIdx;
}
