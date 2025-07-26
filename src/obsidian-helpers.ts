import { MarkdownView } from "obsidian";

export function getActiveFile(plugin: any) {
	const view = plugin.app.workspace.getActiveViewOfType(MarkdownView);
	return view?.file || plugin.app.workspace.getActiveFile();
}

export async function getSourceLine(plugin: any, file: any, idx: number) {
	try {
		const content = await plugin.app.vault.read(file);
		const lines = content.split(/\r?\n/);
		return idx >= 0 && idx < lines.length ? lines[idx] : null;
	} catch {
		return null;
	}
}
