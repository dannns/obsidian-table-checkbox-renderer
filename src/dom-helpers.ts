/**
 * Creates a <span> element with the given text and appends it to the cell.
 * @param cell - The table cell element
 * @param text - The text to display inside the span
 * @returns void
 */
export function createSpanElement(cell: HTMLElement, text: string): void {
  cell.createEl('span', { text });
}

/**
 * Creates a checkbox input element, sets its state, and appends it to the cell.
 * @param cell - The table cell element
 * @param checked - Whether the checkbox is checked
 * @param onChange - Callback for change event
 * @returns The created checkbox element
 */
export function createCheckboxElement(cell: HTMLElement, checked: boolean, onChange: () => void): HTMLInputElement {
  const box = cell.createEl('input', { type: 'checkbox' }) as HTMLInputElement;
  box.className = 'task-list-item-checkbox';
  box.checked = checked;
  box.addEventListener('change', onChange);
  return box;
}

/**
 * Handles checkbox state changes and updates the corresponding markdown line.
 * @param params - Object containing box, plugin, file, lineNum, and idx
 * @returns Promise<void>
 */
export async function handleCheckboxChange({ box, plugin, file, lineNum, idx }: { box: HTMLInputElement, plugin: any, file: any, lineNum: number, idx: number }): Promise<void> {
  const content = await plugin.app.vault.read(file);
  const lines = content.split(/\r?\n/);
  if (lineNum >= lines.length) return;
  const line = lines[lineNum];
  const srcMatches = [...line.matchAll(/\[( |x)\]/g)];
  const mIdx = srcMatches[idx]?.index ?? -1;
  if (mIdx === -1) return;
  let state = '[ ]';
  if (box.checked) state = '[x]';
  lines[lineNum] = line.substring(0, mIdx) + state + line.substring(mIdx + 3);
  await plugin.app.vault.modify(file, lines.join('\n'));
  box.checked = state === '[x]';
}
