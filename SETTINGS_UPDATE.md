# Settings Update Summary

This document summarizes the new settings and configuration options added to AutoTeX.

## New Settings Added

### 1. **Enable for Multiple File Types** (`autotex.enabledFileTypes`)
- **Type**: Array of strings
- **Default**: `["latex", "tex"]`
- **Description**: List of file types/language IDs to enable AutoTeX for
- **Example values**: `"markdown"`, `"plaintext"`, `"latex"`, `"tex"`, `"html"`, etc.
- **Usage**: Add any VS Code language ID to enable AutoTeX for that file type

### 2. **Custom System Prompt** (`autotex.systemPrompt`)
- **Type**: String (multiline)
- **Default**: The original LaTeX conversion prompt
- **Description**: Customize how the AI converts your drafts
- **Usage**: Edit this prompt to change the AI's behavior, output format, or conversion style

### 3. **Automatic Draft Detection Default Changed**
- **Setting**: `autotex.automaticDraftDetection`
- **New Default**: `false` (previously `true`)
- **Description**: Automatic draft detection is now disabled by default
- **Note**: Manual `\`\`\`autotex` code blocks still work regardless of this setting

## Changed Behavior

### Extension Activation
- **Previous**: Only activated for LaTeX/TeX files
- **New**: Activates on startup and works with any configured file type
- **Benefit**: More flexible and supports multiple document types

### Keybinding
- **Previous**: Only worked in LaTeX files
- **New**: Works in any editor with text focus
- **Note**: The extension still checks if the current file type is enabled before processing

## How to Use

### Enable AutoTeX for Markdown Files
1. Open VS Code Settings (Cmd/Ctrl + ,)
2. Search for "AutoTeX: Enabled File Types"
3. Click "Add Item"
4. Enter `markdown`
5. Click OK

### Customize the System Prompt
1. Open VS Code Settings
2. Search for "AutoTeX: System Prompt"
3. Click "Edit in settings.json" or edit directly in the UI
4. Modify the prompt to your needs

### Example Custom Prompts

#### For Markdown to LaTeX:
```
Convert markdown-style draft text into compilable LaTeX code. Preserve markdown formatting intentions while converting to appropriate LaTeX commands. Convert # headers to \section{}, ** bold ** to \textbf{}, etc.
```

#### For Plain Text Notes:
```
Convert informal notes into well-formatted LaTeX. Be conservative - only convert content that clearly needs LaTeX formatting. Leave plain text as-is when appropriate.
```

## Settings Reference

All AutoTeX settings can be found in VS Code settings under "AutoTeX" or by searching for `autotex.` in settings.

Key settings:
- `autotex.enabledFileTypes` - File types to enable
- `autotex.systemPrompt` - AI conversion instructions
- `autotex.automaticDraftDetection` - Auto-detect drafts (default: false)
- `autotex.manualDraftBlocks` - Enable `\`\`\`autotex` blocks (default: true)
- `autotex.enabled` - Master enable/disable switch
- `autotex.highlightDrafts` - Show draft highlighting

