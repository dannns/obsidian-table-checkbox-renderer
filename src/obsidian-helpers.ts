import type { TFile, Plugin } from 'obsidian';
import { MarkdownView } from 'obsidian';

/**
 * Returns the active file from the current Markdown view or workspace.
 * @param plugin - The plugin instance with app and workspace
 * @returns The active TFile or null
 */
export function getActiveFile(plugin: Plugin): TFile | null {
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	return view?.file || plugin.app.workspace.getActiveFile();
}

/**
 * Reads the file and returns the line at the given index, or null if out of bounds or error.
 * @param plugin - The plugin instance with app and vault
 * @param file - The file to read
 * @param idx - The line index
 * @returns The line at the given index, or null if out of bounds or error
 */
export async function getSourceLine(plugin: Plugin, file: TFile, idx: number): Promise<string | null> {
	try {
		const content = await plugin.app.vault.read(file);
		const lines = content.split(/\r?\n/);
		return idx >= 0 && idx < lines.length ? lines[idx] : null;
	} catch {
		return null;
	}
}
