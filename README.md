# AutoTeX

Automatically convert rough draft notes into compilable LaTeX code using a locally-running LLM.

## Features

- **Automatic Conversion**: Type rough notes in your LaTeX file, press Enter 3 times, and watch them transform into proper LaTeX code
- **Local LLM**: Uses LM Studio with `qwen-3-4b-instruct-no-thinking` model for privacy and speed
- **Smart Detection**: Automatically infers content type (equations, pseudocode, text, code blocks) and applies appropriate LaTeX syntax
- **Diff-Based Draft Detection**: Intelligently detects draft sections by comparing with saved state
- **Paste Intelligence**: Analyzes pasted content to determine if it's a draft or formatted LaTeX
- **Multiple Draft Support**: Detects and converts multiple independent draft sections simultaneously
- **Visual Highlighting**: Highlights draft sections in green/yellow with detailed hover tooltips showing confidence breakdown
- **Concurrent Editing**: Tracks conversion regions to prevent overwriting text you're currently editing
- **Auto-Save**: Automatically saves your clean LaTeX file after each conversion

## Prerequisites

1. **Visual Studio Code** (v1.85.0 or higher)
2. **LM Studio** installed and running
   - Download from: https://lmstudio.ai/
   - Install the `qwen-3-4b-instruct-no-thinking` model (or your preferred model)
   - Start the local API server (default: http://localhost:1234)

## Installation

### From Source

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/autotex.git
   cd autotex
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Open in VS Code and press `F5` to run the extension in a new Extension Development Host window

### From VSIX

1. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```

2. Install the generated `.vsix` file:
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
   - Click the "..." menu → "Install from VSIX..."
   - Select the `.vsix` file

## Usage

### Basic Workflow

1. Open or create a `.tex` file in VS Code
2. Type your rough draft notes (equations, pseudocode, etc.)
3. Press **Enter three times** consecutively
4. Wait for the conversion (you'll see a progress notification)
5. Your rough draft will be replaced with formatted LaTeX code

### Example

**Before (Rough Draft):**
```
let's solve for x:
2x + 5 = 15
x = (15-5)/2 = 5

now for the loop pseudocode:
for i from 1 to n:
  sum += i
return sum
```

**After (Auto-converted):**
```latex
Let's solve for $x$:
\begin{align}
2x + 5 &= 15 \\
x &= \frac{15-5}{2} = 5
\end{align}

Now for the loop pseudocode:
\begin{algorithm}
\begin{algorithmic}
\For{$i = 1$ to $n$}
    \State $\text{sum} \gets \text{sum} + i$
\EndFor
\State \Return sum
\end{algorithmic}
\end{algorithm}
```

## Configuration

Open VS Code settings and search for "AutoTeX":

| Setting | Default | Description |
|---------|---------|-------------|
| `autotex.lmStudioUrl` | `http://localhost:1234/v1/chat/completions` | LM Studio API endpoint |
| `autotex.modelName` | `qwen-3-4b-instruct-no-thinking` | Model name to use |
| `autotex.triggerEnterCount` | `3` | Number of consecutive Enter presses to trigger |
| `autotex.autoSaveEnabled` | `true` | Auto-save after conversion |
| `autotex.outputDirectory` | `""` | Directory for clean LaTeX files (empty = same as source) |
| `autotex.enabled` | `true` | Enable/disable auto-conversion |
| `autotex.highlightDrafts` | `true` | Highlight draft sections in editor |
| `autotex.draftDetectionMethod` | `diff` | Detection method: `diff`, `heuristic`, or `both` |
| `autotex.minDraftConfidence` | `0.4` | Minimum confidence (0-1) to treat text as draft |
| `autotex.draftHighlightColor` | `green` | Color scheme for draft highlighting |

## Commands

- **AutoTeX: Convert All Drafts to LaTeX** (`Shift+Shift` - double tap Shift) - Convert all detected draft sections in the document
- **AutoTeX: Convert Rough Draft to LaTeX** - Manually trigger conversion of drafts near cursor
- **AutoTeX: Toggle Auto-Convert** - Enable/disable automatic conversion
- **AutoTeX: Toggle Draft Highlighting** - Enable/disable visual highlighting of drafts
- **AutoTeX: Check Server Status** - Check if LM Studio server is running
- **AutoTeX: Start LM Studio Server** - Attempt to start LM Studio server
- **AutoTeX: Show Debug Panel** - Show debug information panel

## How It Works

1. **Saved State Tracking**: When you save a document, AutoTeX remembers the content as "saved state"
2. **Diff-Based Detection**: Compares current content with saved state to find new/changed sections
3. **Paste Analysis**: Detects pasted text and analyzes whether it's a draft or formatted LaTeX
4. **Confidence Scoring**: Each draft region gets a confidence score (0-1) based on patterns
5. **Visual Highlighting**: High-confidence drafts highlighted in green, low-confidence in yellow
6. **Trigger Detection**: Press Enter 3 times or use "Convert All Drafts" command
7. **Multi-Draft Conversion**: All draft regions converted simultaneously (bottom-to-top for position preservation)
8. **LLM Conversion**: Each draft sent to your local LM Studio instance
9. **Smart Replacement**: Replaces only the original draft regions, even if you've edited elsewhere
10. **Auto-Save**: Saves your document with the clean LaTeX code

For detailed technical information, see [DRAFT_DETECTION.md](DRAFT_DETECTION.md).

## Troubleshooting

### "Cannot connect to LM Studio"

**Solution:**
1. Open LM Studio
2. Go to the "Developer" tab
3. Click "Start Server"
4. Ensure it's running on port 1234 (or update the `autotex.lmStudioUrl` setting)

### "No rough draft text found"

**Solution:**
- Make sure you have some text typed before pressing Enter 3 times
- The extension looks for text after the last formatted LaTeX section

### Conversion produces incorrect LaTeX

**Solution:**
1. Try a different model in LM Studio
2. Adjust the system prompt in `src/lmStudioClient.ts`
3. Use the manual conversion command to retry

## Development

### Project Structure

```
autotex/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── inputMonitor.ts        # Detects Enter key presses & manages drafts
│   ├── draftDetector.ts       # Diff-based draft detection with paste handling
│   ├── draftVisualizer.ts     # Visual highlighting of draft sections
│   ├── documentStateManager.ts # Tracks conversion regions
│   ├── lmStudioClient.ts      # LM Studio API client
│   ├── textReplacer.ts        # Handles text replacement
│   ├── autoSaveManager.ts     # Auto-save functionality
│   ├── serverManager.ts       # LM Studio server management
│   └── debugPanel.ts          # Debug information panel
├── package.json               # Extension manifest
├── tsconfig.json             # TypeScript configuration
├── README.md                 # This file
└── DRAFT_DETECTION.md        # Detailed draft detection documentation
```

### Building

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch

# Lint code
npm run lint
```

### Testing

```bash
# Run linter
npm run lint

# Manual testing
# Press F5 in VS Code to launch Extension Development Host
```

## Technical Details

### Stack

- **Platform**: Visual Studio Code Extension API
- **Language**: TypeScript
- **LLM Integration**: LM Studio (OpenAI-compatible API)
- **HTTP Client**: Axios
- **Diff Algorithm**: Myers diff (via `diff` package)

### Key Features

- **Myers Diff Algorithm**: Industry-standard diff (same as Git) accurately detects only new content, ignoring shifted lines
- **Concurrency Handling**: Uses unique conversion IDs to track regions during async LLM calls
- **Document Tracking**: Monitors text changes to prevent overwriting user edits
- **Smart Detection**: Identifies formatted vs. rough draft LaTeX using pattern matching and confidence scoring
- **Error Handling**: Comprehensive error messages for connection and API issues

## License

MIT

## Contributing

Contributions welcome! Please feel free to submit issues and pull requests.

## Roadmap

- [x] Visual indicators for rough draft regions (completed with highlighting)
- [x] Batch conversion of multiple rough draft sections (completed with multi-draft support)
- [x] Diff-based draft detection (completed)
- [x] Paste intelligence (completed)
- [ ] Support for custom system prompts via UI
- [ ] Multiple LLM backend support (Ollama, etc.)
- [ ] Undo/redo for conversions
- [ ] LaTeX syntax validation before insertion
- [ ] Custom keybindings for trigger
- [ ] Streaming LLM responses for faster feedback
- [ ] Machine learning-based draft detection
- [ ] Custom confidence thresholds per project

## Credits

Built with inspiration from Cursor's autocomplete feature and the LaTeX Workshop extension.

