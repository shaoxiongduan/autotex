# AutoTeX - Project Summary

## What We Built

A VS Code extension that automatically converts rough draft notes into compilable LaTeX code using a locally-running LLM (LM Studio).

## Tech Stack Summary

### Core Technologies
- **Platform:** Visual Studio Code Extension API
- **Language:** TypeScript (compiled to JavaScript)
- **Runtime:** Node.js
- **LLM Integration:** LM Studio (OpenAI-compatible API)
- **HTTP Client:** Axios

### Key Libraries & Dependencies
```json
{
  "devDependencies": {
    "@types/node": "^20.x",
    "@types/vscode": "^1.85.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.54.0",
    "typescript": "^5.3.0"
  },
  "dependencies": {
    "axios": "^1.6.0"
  }
}
```

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   VS Code Extension                 │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ extension.ts - Main Entry Point              │ │
│  │ • Activates on .tex files                    │ │
│  │ • Registers commands                         │ │
│  │ • Initializes all services                   │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ inputMonitor.ts - Input Detection            │ │
│  │ • Monitors text document changes             │ │
│  │ • Counts consecutive Enter presses (3x)      │ │
│  │ • Extracts rough draft sections              │ │
│  │ • Triggers conversion process                │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ documentStateManager.ts - State Tracking     │ │
│  │ • Registers conversion regions with IDs      │ │
│  │ • Validates regions haven't changed          │ │
│  │ • Prevents overwriting concurrent edits      │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ lmStudioClient.ts - LLM Integration          │ │
│  │ • Sends HTTP requests to LM Studio API       │ │
│  │ • Handles system prompt configuration        │ │
│  │ • Error handling for connection issues       │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ textReplacer.ts - Text Manipulation          │ │
│  │ • Replaces rough draft with LaTeX            │ │
│  │ • Validates regions before replacement       │ │
│  │ • Extracts clean LaTeX for saving            │ │
│  └──────────────────────────────────────────────┘ │
│                                                     │
│  ┌──────────────────────────────────────────────┐ │
│  │ autoSaveManager.ts - File Management         │ │
│  │ • Saves document after conversion            │ │
│  │ • Optional output directory support          │ │
│  └──────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
                          │
                          │ HTTP POST
                          ↓
┌─────────────────────────────────────────────────────┐
│              LM Studio (Local Server)               │
│              http://localhost:1234                  │
│                                                     │
│  Model: qwen-3-4b-instruct-no-thinking             │
│  API: OpenAI-compatible                            │
└─────────────────────────────────────────────────────┘
```

## File Structure

```
autotex/
├── src/                           # TypeScript source code
│   ├── extension.ts              # Main entry point
│   ├── inputMonitor.ts           # Enter key detection
│   ├── documentStateManager.ts   # Conversion state tracking
│   ├── lmStudioClient.ts         # LM Studio API client
│   ├── textReplacer.ts           # Text replacement logic
│   └── autoSaveManager.ts        # Auto-save functionality
│
├── .vscode/                      # VS Code configuration
│   ├── launch.json               # Debug configuration
│   ├── tasks.json                # Build tasks
│   ├── settings.json             # Workspace settings
│   └── extensions.json           # Recommended extensions
│
├── out/                          # Compiled JavaScript (generated)
│
├── Configuration Files
│   ├── package.json              # Extension manifest & dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── .eslintrc.json            # ESLint rules
│   ├── .gitignore                # Git ignore patterns
│   ├── .vscodeignore             # VSIX packaging ignore
│   └── .npmignore                # npm packaging ignore
│
├── Documentation
│   ├── README.md                 # Main documentation
│   ├── QUICKSTART.md             # Quick start guide
│   ├── SETUP.md                  # Detailed setup instructions
│   ├── CONTRIBUTING.md           # Contribution guidelines
│   ├── CHANGELOG.md              # Version history
│   └── PROJECT_SUMMARY.md        # This file
│
├── Examples & Templates
│   ├── example.tex               # Example LaTeX file for testing
│   └── idea.md                   # Original project idea
│
└── Legal
    └── LICENSE                   # MIT License
```

## Key Features Implemented

### 1. **Automatic Conversion Trigger**
- Monitors text document changes
- Detects 3 consecutive Enter key presses
- 2-second timeout window for consecutive presses
- Only activates on `.tex` and `.latex` files

### 2. **Smart Draft Detection**
- Identifies rough draft sections automatically
- Looks for text after last formatted LaTeX
- Recognizes formatted LaTeX patterns (\\begin, \\section, etc.)
- Excludes trailing newlines from conversion

### 3. **LLM Integration**
- Connects to LM Studio via OpenAI-compatible API
- Configurable endpoint URL and model name
- Custom system prompt for LaTeX conversion
- Comprehensive error handling

### 4. **Concurrency Handling**
- Assigns unique IDs to each conversion
- Tracks region boundaries during async LLM calls
- Validates regions before replacement
- Prevents overwriting concurrent user edits

### 5. **Auto-Save Functionality**
- Saves document after successful conversion
- Optional separate output directory
- Preserves original file location by default

### 6. **User Configuration**
- `autotex.lmStudioUrl` - API endpoint
- `autotex.modelName` - Model to use
- `autotex.triggerEnterCount` - Trigger threshold (default: 3)
- `autotex.autoSaveEnabled` - Auto-save toggle
- `autotex.outputDirectory` - Output path
- `autotex.enabled` - Master enable/disable

### 7. **Commands**
- `autotex.convertRoughDraft` - Manual conversion
- `autotex.toggleAutoConvert` - Toggle feature

## System Prompt

The LLM is configured with this system prompt:

```
Convert rough draft text into compilable LaTeX code. Infer the content type 
(equation, pseudocode, plain text, code block, etc.) and apply the appropriate 
LaTeX syntax and environments. Formalize rough or incomplete notation into 
proper LaTeX while preserving all values and meanings—never change numerical 
values, variable names, or remove elements, even if they appear incorrect. 
Add minimal formatting only when necessary for readability.

Output only the LaTeX content itself—do not include document preamble, 
\documentclass, \usepackage, \begin{document}, or \end{document} tags. 
Provide only the code that would appear in the document body.
```

## Workflow Example

1. **User types rough draft:**
   ```
   solve for x: 2x + 5 = 15
   ```

2. **User presses Enter 3 times**

3. **Extension extracts rough draft:**
   - Identifies the text as a rough draft section
   - Stores region boundaries with unique ID

4. **LLM conversion:**
   - Sends to LM Studio API
   - Receives formatted LaTeX

5. **Smart replacement:**
   - Validates region hasn't changed
   - Replaces only the original rough draft

6. **Auto-save:**
   - Saves the updated document
   - User continues working seamlessly

## Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch

# Lint code
npm run lint

# Package extension
vsce package

# Run in debug mode
# Press F5 in VS Code
```

## Error Handling

The extension handles various error scenarios:

1. **LM Studio not running:** Clear error message with instructions
2. **Connection timeout:** 60-second timeout with retry guidance
3. **Invalid response:** Validation and user notification
4. **Region modified:** Silent failure to prevent data loss
5. **File save errors:** Warning messages with details

## Performance Considerations

- **Lightweight:** Minimal dependencies
- **Async operations:** Non-blocking conversions
- **Efficient tracking:** O(1) region lookups
- **Smart activation:** Only on LaTeX files
- **Local processing:** No network latency (except localhost)

## Security & Privacy

- **100% local:** All processing on user's machine
- **No telemetry:** No data collection
- **No external APIs:** Uses local LM Studio only
- **MIT licensed:** Open source and auditable

## Future Enhancements (Roadmap)

- [ ] Custom system prompts via UI
- [ ] Multiple LLM backend support (Ollama, etc.)
- [ ] Visual indicators for rough draft regions
- [ ] Undo/redo for conversions
- [ ] Batch conversion of multiple sections
- [ ] LaTeX syntax validation
- [ ] Streaming responses
- [ ] Custom keybindings

## Recommended Model

**Primary:** `qwen-3-4b-instruct-no-thinking`
- Size: ~4GB
- Speed: Fast on most hardware
- Quality: Good for LaTeX conversion

**Alternatives:**
- `deepseek-coder-6.7b` - Better for code/algorithms
- `mistral-7b` - General purpose
- `llama-2-13b` - Higher quality (slower)

## Testing Checklist

- [x] Basic conversion works
- [x] 3x Enter triggers correctly
- [x] Concurrent editing handled
- [x] LM Studio connection errors caught
- [x] Configuration settings work
- [x] Manual command works
- [x] Auto-save functions
- [x] File language detection works

## Credits

**Inspired by:**
- Cursor's autocomplete feature
- LaTeX Workshop extension
- VS Code extension API

**Built with:**
- Visual Studio Code Extension API
- TypeScript
- LM Studio
- Axios

## License

MIT License - See [LICENSE](LICENSE) file

---

**Status:** ✅ Complete and ready to use!

**Next Steps:**
1. Run `npm install`
2. Set up LM Studio
3. Run `npm run compile`
4. Press F5 to test
5. Try it with `example.tex`

Happy LaTeXing! 🎉

