// Minimal mock for Obsidian API used in tests
export class Plugin {
  async onload() {}
  onunload() {}
}

export class MarkdownView {}

// Provide a minimal mock of the vault API when imported indirectly.
export class Vault {
  data: Record<string, string> = {};
  async read(file: any): Promise<string> { return this.data[file.path] ?? ''; }
  async modify(file: any, content: string): Promise<void> { this.data[file.path] = content; }
  async process(file: any, fn: (data: string) => string): Promise<void> {
    const current = await this.read(file);
    const updated = fn(current);
    if (typeof updated === 'string' && updated !== current) {
      await this.modify(file, updated);
    }
  }
}

