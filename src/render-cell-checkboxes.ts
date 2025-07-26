export interface CheckboxRenderAction {
  type: 'span' | 'checkbox';
  text?: string;
  checked?: boolean;
}

export function renderCellCheckboxesPure(text: string): CheckboxRenderAction[] {
  const pattern = /\[( |x)\]/g;
  const matches = [...text.matchAll(pattern)];
  if (!matches.length) return [{ type: 'span', text }];
  let last = 0;
  const actions: CheckboxRenderAction[] = [];
  matches.forEach(match => {
    if (match.index! > last) {
      actions.push({ type: 'span', text: text.slice(last, match.index) });
    }
    actions.push({ type: 'checkbox', checked: match[0] === '[x]' });
    last = match.index! + match[0].length;
  });
  if (last < text.length) {
    actions.push({ type: 'span', text: text.slice(last) });
  }
  return actions;
}
