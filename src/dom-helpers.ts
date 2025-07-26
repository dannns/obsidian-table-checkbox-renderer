export function createSpanElement(cell: HTMLElement, text: string) {
  cell.createEl('span', { text });
}

export function createCheckboxElement(cell: HTMLElement, checked: boolean, onChange: () => void) {
  const box = cell.createEl('input', { type: 'checkbox' }) as HTMLInputElement;
  box.className = 'task-list-item-checkbox';
  box.checked = checked;
  box.addEventListener('change', onChange);
  return box;
}

export async function handleCheckboxChange({ box, plugin, file, lineNum, idx }: { box: HTMLInputElement, plugin: any, file: any, lineNum: number, idx: number }) {
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
