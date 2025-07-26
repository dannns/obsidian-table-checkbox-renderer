/**
 * Returns the number of checkboxes in each cell of a markdown table row.
 * @param line - The markdown table row as a string
 * @returns An array of checkbox counts per cell
 */
export function getCheckboxCountsPerCell(line: string): number[] {
  const cells = line.split('|');
  if (cells.length > 1 && !cells[0].trim()) cells.shift();
  if (cells.length > 1 && !cells[cells.length - 1].trim()) cells.pop();
  return cells.map(cell => (cell.match(/\[( |x)\]/g) || []).length);
}

/**
 * Returns the source line number for a table row, given section info and row index.
 * @param section - The section info object with lineStart
 * @param row - The row index
 * @returns The source line number or null if section is null
 */
export function getSourceLineNumber(section: { lineStart: number } | null, row: number): number | null {
  if (!section) return null;
  return section.lineStart + row + 1;
}

/**
 * Returns the line at the given index from the content, or null if out of bounds.
 * @param content - The full file content as a string
 * @param idx - The line index
 * @returns The line at the given index, or null if out of bounds
 */
export function getSourceLineFromContent(content: string, idx: number): string | null {
  if (!content) return null;
  const lines = content.split(/\r?\n/);
  return idx >= 0 && idx < lines.length ? lines[idx] : null;
}
