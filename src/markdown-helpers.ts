// Checkbox and table helpers

export function getCheckboxCountsPerCell(line: string): number[] {
  const cells = line.split('|');
  if (cells.length > 1 && !cells[0].trim()) cells.shift();
  if (cells.length > 1 && !cells[cells.length - 1].trim()) cells.pop();
  return cells.map(cell => (cell.match(/\[( |x)\]/g) || []).length);
}

export function getSourceLineNumber(section: { lineStart: number } | null, row: number): number | null {
  if (!section) return null;
  return section.lineStart + row + 1;
}

export function getSourceLineFromContent(content: string, idx: number): string | null {
  if (!content) return null;
  const lines = content.split(/\r?\n/);
  return idx >= 0 && idx < lines.length ? lines[idx] : null;
}
