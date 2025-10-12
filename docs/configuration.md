# Configuration

Complete reference for AutoTeX settings and commands.

## Settings

Access settings via: **File → Preferences → Settings** (or `Ctrl+,` / `Cmd+,`), then search "AutoTeX".

### Provider Settings

#### `autotex.provider`
- **Type**: `string`
- **Default**: `"lmstudio"`
- **Options**: `"lmstudio"`, `"openrouter"`, `"openai"`
- **Description**: Which AI provider to use for conversions

#### LM Studio Settings

```json
{
  "autotex.lmStudio.apiUrl": "http://localhost:1234/v1/chat/completions",
  "autotex.lmStudio.modelName": "qwen/qwen3-4b-2507"
}
```

#### OpenRouter Settings

```json
{
  "autotex.openRouter.apiUrl": "https://openrouter.ai/api/v1/chat/completions",
  "autotex.openRouter.apiKey": "",
  "autotex.openRouter.modelName": "meta-llama/llama-3.1-8b-instruct:free"
}
```

#### OpenAI Settings

```json
{
  "autotex.openAI.apiUrl": "https://api.openai.com/v1/chat/completions",
  "autotex.openAI.apiKey": "",
  "autotex.openAI.modelName": "gpt-4o-mini"
}
```

### Behavior Settings

#### `autotex.enabled`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable/disable AutoTeX extension features

#### `autotex.autoSaveEnabled`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Automatically save file after successful conversion

#### `autotex.outputDirectory`
- **Type**: `string`
- **Default**: `""` (same directory as source)
- **Description**: Directory to save converted LaTeX files

#### `autotex.temperature`
- **Type**: `number`
- **Default**: `0.3`
- **Range**: `0.0 - 1.0`
- **Description**: LLM temperature (lower = more deterministic)

#### `autotex.maxTokens`
- **Type**: `number`
- **Default**: `2048`
- **Description**: Maximum tokens for LLM response

### Draft Detection Settings

#### `autotex.highlightDrafts`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Visually highlight draft sections in the editor

#### `autotex.draftHighlightColor`
- **Type**: `string`
- **Default**: `"green"`
- **Options**: `"green"`, `"yellow"`, `"blue"`, `"purple"`, `"custom"`
- **Description**: Color scheme for draft highlighting

#### `autotex.draftDetectionMethod`
- **Type**: `string`
- **Default**: `"diff"`
- **Options**: `"diff"`, `"heuristic"`, `"both"`
- **Description**: Method for detecting draft sections
  - `diff`: Compare with saved state (recommended)
  - `heuristic`: Pattern-based detection
  - `both`: Use both methods

#### `autotex.minDraftConfidence`
- **Type**: `number`
- **Default**: `0.4`
- **Range**: `0.0 - 1.0`
- **Description**: Minimum confidence to treat text as draft

#### `autotex.automaticDraftDetection`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Automatically detect drafts as you type (experimental)

#### `autotex.manualDraftBlocks`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Enable manual draft marking with `` ```autotex `` blocks

### File Type Settings

#### `autotex.enabledFileTypes`
- **Type**: `array`
- **Default**: `["latex", "tex"]`
- **Description**: File types to enable AutoTeX for
- **Example**: `["latex", "tex", "markdown"]` to include Markdown files

### Advanced Settings

#### `autotex.systemPrompt`
- **Type**: `string`
- **Default**: (see below)
- **Description**: Custom system prompt for the LLM

**Default prompt**:
```
Convert rough draft text into compilable LaTeX code. Infer the content type (equation, pseudocode, plain text, code block, etc.) and apply the appropriate LaTeX syntax and environments. Formalize rough or incomplete notation into proper LaTeX while preserving all values and meanings—never change numerical values, variable names, or remove elements, even if they appear incorrect. Add minimal formatting only when necessary for readability.

Output only the LaTeX content itself—do not include document preamble, \documentclass, \usepackage, \begin{document}, or \end{document} tags. Provide only the code that would appear in the document body.
```

---

## Commands

Access commands via **Command Palette** (`Ctrl+Shift+P` / `Cmd+Shift+P`).

### `AutoTeX: Convert All Drafts to LaTeX`
- **Keybinding**: `Shift+Shift` (double-tap Shift)
- **Description**: Convert all detected draft sections in the current document
- **Use case**: Quick conversion of all highlighted drafts at once

### `AutoTeX: Convert Rough Draft to LaTeX`
- **Keybinding**: None (use Command Palette)
- **Description**: Manually trigger conversion of all detected drafts
- **Use case**: Alternative to Shift×2 keybinding

### `AutoTeX: Insert Code Block`
- **Keybinding**: `Ctrl+Ctrl` (double-tap Ctrl)
- **Description**: Insert a `` ```autotex...``` `` code block at cursor
- **Use case**: Mark specific sections for manual conversion

### `AutoTeX: Select Provider`
- **Keybinding**: None
- **Description**: Quick-pick menu to switch between providers
- **Use case**: Quickly switch from LM Studio to OpenRouter, etc.

### `AutoTeX: Toggle Auto-Convert`
- **Keybinding**: None
- **Description**: Enable/disable AutoTeX extension
- **Use case**: Temporarily disable all AutoTeX features

### `AutoTeX: Toggle Draft Highlighting`
- **Keybinding**: None
- **Description**: Show/hide draft section highlights
- **Use case**: Reduce visual clutter while editing

### `AutoTeX: Check Server Status`
- **Keybinding**: None
- **Description**: Check if current provider is available and working
- **Use case**: Troubleshooting connection and API key issues
- **Note**: Works for all providers (LM Studio, OpenRouter, OpenAI)

### `AutoTeX: Start LM Studio Server`
- **Keybinding**: None
- **Description**: Attempt to start LM Studio server (LM Studio only)
- **Use case**: Quick server startup for LM Studio users
- **Note**: Only applicable when using LM Studio provider

### `AutoTeX: Show Debug Panel`
- **Keybinding**: None
- **Description**: Show debug information panel
- **Use case**: View draft detection details, confidence scores, and logs

---

## Keyboard Shortcuts

| Shortcut | Command | Description |
|----------|---------|-------------|
| `Shift` + `Shift` | Convert All Drafts | Double-tap Shift key to convert all drafts |
| `Ctrl` + `Ctrl` | Insert Code Block | Double-tap Ctrl (or Cmd on Mac) |

### Customizing Keybindings

1. Open **Keyboard Shortcuts** (`Ctrl+K Ctrl+S` / `Cmd+K Cmd+S`)
2. Search for "AutoTeX"
3. Click the pencil icon to edit
4. Press your desired key combination

**Example** - Change convert all drafts to `Ctrl+Alt+L`:
```json
{
  "key": "ctrl+alt+l",
  "command": "autotex.convertAllDrafts",
  "when": "editorTextFocus"
}
```

---

## Color Customization

AutoTeX uses theme-aware colors for draft highlighting. Customize in `settings.json`:

```json
{
  "workbench.colorCustomizations": {
    "autotex.draftBackground": "#00ff0020",
    "autotex.draftBackgroundLowConfidence": "#ffff0015",
    "autotex.draftOverviewRuler": "#00ff0080",
    "autotex.draftOverviewRulerLowConfidence": "#ffff0080"
  }
}
```

**Color Meanings**:
- `draftBackground`: High-confidence drafts (default: green)
- `draftBackgroundLowConfidence`: Low-confidence drafts (default: yellow)
- `draftOverviewRuler`: Scrollbar markers for high-confidence drafts
- `draftOverviewRulerLowConfidence`: Scrollbar markers for low-confidence drafts

---

## Example Configurations

### Minimal Setup (LM Studio)

```json
{
  "autotex.provider": "lmstudio",
  "autotex.lmStudio.modelName": "qwen/qwen3-4b-2507"
}
```

### Power User Setup (OpenAI)

```json
{
  "autotex.provider": "openai",
  "autotex.openAI.apiKey": "sk-proj-xxxxx",
  "autotex.openAI.modelName": "gpt-4o",
  "autotex.temperature": 0.2,
  "autotex.maxTokens": 4096,
  "autotex.draftDetectionMethod": "both",
  "autotex.minDraftConfidence": 0.5,
  "autotex.autoSaveEnabled": true
}
```

### Privacy-Focused Setup

```json
{
  "autotex.provider": "lmstudio",
  "autotex.automaticDraftDetection": false,
  "autotex.manualDraftBlocks": true,
  "autotex.autoSaveEnabled": false
}
```

Use manual `autotex` code blocks only, no automatic detection or saving.

---

## Workspace vs User Settings

- **User Settings**: Apply globally to all projects
- **Workspace Settings**: Apply only to current project (stored in `.vscode/settings.json`)

**Recommended approach**:
- Provider credentials: User settings (global)
- Project-specific prompts: Workspace settings

