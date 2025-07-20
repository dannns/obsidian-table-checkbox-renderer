# Obsidian Table Checkbox Renderer

## Overview
This Obsidian plugin enables interactive checkboxes inside Markdown tables. When you click a checkbox in Reading Mode, the plugin updates the underlying Markdown source, keeping your table and file in sync. It supports multiple checkboxes per cell and works robustly for any table layout.

## Features
- Interactive checkboxes in Markdown tables (Reading Mode)
- Supports multiple checkboxes per cell and per row
- Changes are immediately saved to the Markdown file
- Robust mapping between rendered checkboxes and source Markdown
- Works with any table structure, including complex layouts

## How It Works
- The plugin parses the rendered table and the original Markdown source.
- For each table row, it matches checkboxes in each cell to the corresponding checkbox in the source line using a global index.
- When a checkbox is toggled, the plugin updates the correct `[ ]` or `[x]` in the Markdown file.
- In Edit Mode, a CodeMirror extension decorates checkboxes and allows toggling directly in the editor.

## Development Process
1. **Initial Implementation:** Basic checkbox rendering and toggling for single checkboxes per cell.
2. **Robust Mapping:** Improved logic to support multiple checkboxes per cell and correct mapping using global indices.
3. **File Update Logic:** Refactored to always use Obsidian's Vault API for reliable file updates.
4. **CodeMirror Integration:** Added a CodeMirror 6 extension for Edit Mode support.
5. **Architectural Refactor:** Split logic into helper functions for clarity and maintainability.
6. **Testing and Debugging:** Iteratively tested with various table layouts, added logging, and fixed edge cases.
7. **Final Cleanup:** Removed unnecessary code, improved efficiency, and documented the implementation.

## Usage
- Install the plugin in Obsidian.
- Create a Markdown table with checkboxes (e.g. `[ ]`, `[x]`).
- Click checkboxes in Reading Mode to toggle and save changes.
- In Edit Mode, checkboxes are rendered and can be toggled directly in the editor.

## Build Instructions

### Prerequisites
- Node.js and npm installed

### Install dependencies
```bash
npm install
```

### Build the plugin
```bash
npm run build
```
This will compile the TypeScript code and copy the manifest to the output directory.

### Development
- Edit the TypeScript source files in the project directory.
- Run `npm run build` after making changes to produce the updated plugin files.
- Load the plugin in Obsidian's community plugins folder for testing.

## Contributing
Pull requests and suggestions are welcome! See the code for architectural patterns and helper functions.

## License
MIT
