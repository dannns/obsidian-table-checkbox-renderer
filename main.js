"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => TableCheckboxRendererPlugin,
  renderCellCheckboxes: () => renderCellCheckboxes
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/markdown-helpers.ts
function getCheckboxCountsPerCell(line) {
  const cells = line.split("|");
  if (cells.length > 1 && !cells[0].trim()) cells.shift();
  if (cells.length > 1 && !cells[cells.length - 1].trim()) cells.pop();
  return cells.map((cell) => (cell.match(/\[( |x)\]/g) || []).length);
}
function getSourceLineNumber(section, row) {
  if (!section) return null;
  return section.lineStart + row + 1;
}

// src/obsidian-helpers.ts
var import_obsidian = require("obsidian");
function getActiveFile(plugin) {
  const view = plugin.app.workspace.getActiveViewOfType(import_obsidian.MarkdownView);
  return view?.file || plugin.app.workspace.getActiveFile();
}
async function getSourceLine(plugin, file, idx) {
  try {
    const content = await plugin.app.vault.read(file);
    const lines = content.split(/\r?\n/);
    return idx >= 0 && idx < lines.length ? lines[idx] : null;
  } catch {
    return null;
  }
}

// src/render-cell-checkboxes.ts
function renderCellCheckboxesPure(text) {
  const pattern = /\[( |x)\]/g;
  const matches = [...text.matchAll(pattern)];
  if (!matches.length) return [{ type: "span", text }];
  let last = 0;
  const actions = [];
  matches.forEach((match) => {
    if (match.index > last) {
      actions.push({ type: "span", text: text.slice(last, match.index) });
    }
    actions.push({ type: "checkbox", checked: match[0] === "[x]" });
    last = match.index + match[0].length;
  });
  if (last < text.length) {
    actions.push({ type: "span", text: text.slice(last) });
  }
  return actions;
}

// src/dom-helpers.ts
function createSpanElement(cell, text) {
  cell.createEl("span", { text });
}
function createCheckboxElement(cell, checked, onChange) {
  const box = cell.createEl("input", { type: "checkbox" });
  box.className = "task-list-item-checkbox";
  box.checked = checked;
  box.addEventListener("change", onChange);
  return box;
}
async function handleCheckboxChange({ box, plugin, file, lineNum, idx }) {
  const content = await plugin.app.vault.read(file);
  const lines = content.split(/\r?\n/);
  if (lineNum >= lines.length) return;
  const line = lines[lineNum];
  const srcMatches = [...line.matchAll(/\[( |x)\]/g)];
  const mIdx = srcMatches[idx]?.index ?? -1;
  if (mIdx === -1) return;
  let state = "[ ]";
  if (box.checked) state = "[x]";
  lines[lineNum] = line.substring(0, mIdx) + state + line.substring(mIdx + 3);
  await plugin.app.vault.modify(file, lines.join("\n"));
  box.checked = state === "[x]";
}

// src/main.ts
var TableCheckboxRendererPlugin = class extends import_obsidian2.Plugin {
  async onload() {
    this.registerMarkdownPostProcessor(async (el, ctx) => {
      el.querySelectorAll("table").forEach((table) => {
        table.querySelectorAll("tr").forEach(async (row, rowIdx) => {
          if (!row.querySelector("td")) return;
          const section = typeof ctx.getSectionInfo === "function" ? ctx.getSectionInfo(el) : null;
          const lineNum = getSourceLineNumber(section, rowIdx);
          const file = getActiveFile(this);
          if (!file || lineNum == null) return;
          const srcLine = await getSourceLine(this, file, lineNum);
          if (!srcLine) return;
          const counts = getCheckboxCountsPerCell(srcLine);
          let idx = 0;
          row.querySelectorAll("td").forEach((cell, cellIdx) => {
            idx = renderCellCheckboxes(cell, cellIdx, counts, srcLine, lineNum, file, this, idx);
          });
        });
      });
    });
  }
};
function renderCellCheckboxes(cell, cellIdx, counts, srcLine, lineNum, file, plugin, idx) {
  const text = cell.textContent || "";
  const actions = renderCellCheckboxesPure(text);
  while (cell.firstChild) cell.removeChild(cell.firstChild);
  let localIdx = 0;
  actions.forEach((action) => {
    if (action.type === "span") {
      createSpanElement(cell, action.text);
    } else if (action.type === "checkbox") {
      const globalIdx = idx + localIdx;
      const box = createCheckboxElement(cell, action.checked, () => {
        handleCheckboxChange({ box, plugin, file, lineNum, idx: globalIdx });
      });
      localIdx++;
    }
  });
  return idx + localIdx;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  renderCellCheckboxes
});
