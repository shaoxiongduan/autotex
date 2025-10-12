# AutoTeX

**Convert rough draft notes into compilable LaTeX code using AI.**

AutoTeX is a VS Code extension that automatically transforms your rough mathematical notes, equations, and pseudocode into properly formatted LaTeX. Type naturally, press Shift twice, and watch your drafts become publication-ready code.

## Features

- 🤖 **Multiple AI Providers**: Use LM Studio (local/free), OpenRouter, or OpenAI
- ✨ **Smart Detection**: Automatically identifies draft sections that need formatting
- 🎨 **Visual Highlighting**: See draft sections highlighted as you type
- ⚡ **Quick Conversion**: Press Shift×2 to convert all drafts instantly
- 🔄 **Batch Processing**: Convert multiple draft sections simultaneously
- 💾 **Auto-Save**: Automatically save after successful conversion
- 🎯 **Code Blocks**: Mark specific sections with `` ```autotex `` blocks

## Quick Start

1. **Install the extension** from VSIX or build from source
2. **Choose a provider**:
   - **LM Studio** (recommended for privacy): Download from [lmstudio.ai](https://lmstudio.ai/), install a model, start the server
   - **OpenRouter**: Sign up at [openrouter.ai](https://openrouter.ai/) and get an API key
   - **OpenAI**: Get an API key from [platform.openai.com](https://platform.openai.com/)
3. **Configure** via Settings → AutoTeX
4. **Start writing** in any `.tex` file

## Basic Usage

### Quick Conversion

Type your rough draft and press **Shift twice** (double-tap Shift):

```
Before:
let x = (5 + 3) / 2
solve for x: 2x + 5 = 15

After (auto-converted):
Let $x = \frac{5 + 3}{2}$

Solve for $x$:
\begin{equation}
2x + 5 = 15
\end{equation}
```

### Manual Draft Blocks

Mark sections explicitly with code blocks:

````
```autotex
for i from 1 to n:
  sum += i * i
```
````

Press **Shift twice** to convert all marked sections.

## Installation

### From VSIX File

1. Download `autotex-x.x.x.vsix`
2. In VS Code: Extensions → `...` menu → Install from VSIX

### From Source

```bash
git clone https://github.com/yourusername/autotex.git
cd autotex
npm install
npm run compile
```

Press `F5` in VS Code to run in development mode.

## Documentation

- [Getting Started Guide](docs/getting-started.md) - Detailed setup instructions
- [Provider Configuration](docs/providers.md) - Setup LM Studio, OpenRouter, or OpenAI
- [Settings & Commands](docs/configuration.md) - All available settings and commands
- [Features Explained](docs/features.md) - How draft detection and conversion works
- [Troubleshooting](docs/troubleshooting.md) - Common issues and solutions

## Key Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `autotex.provider` | `lmstudio` | Which AI provider to use |
| `autotex.enabled` | `true` | Enable/disable auto-conversion |
| `autotex.highlightDrafts` | `true` | Highlight draft sections |
| `autotex.autoSaveEnabled` | `true` | Auto-save after conversion |
| `autotex.systemPrompt` | (built-in) | Customize AI behavior |

Open VS Code Settings and search "AutoTeX" to configure.

## Commands

- `AutoTeX: Convert All Drafts to LaTeX` (`Shift+Shift`) - Convert all detected drafts
- `AutoTeX: Insert Code Block` (`Ctrl+Ctrl`) - Insert a manual `autotex` block
- `AutoTeX: Select Provider` - Switch between LM Studio, OpenRouter, or OpenAI
- `AutoTeX: Check Server Status` - Verify provider is available
- `AutoTeX: Toggle Draft Highlighting` - Show/hide draft highlights

## How It Works

1. **Type** rough notes in your `.tex` file
2. **Detection** identifies draft sections using diff analysis or manual blocks
3. **Highlighting** shows drafts in green (high confidence) or yellow (low confidence)
4. **Trigger** conversion with Shift×2 or manual command
5. **AI processes** each draft section and generates LaTeX
6. **Replace** draft text with formatted LaTeX code
7. **Save** automatically (if enabled)

## Development

```bash
npm install          # Install dependencies
npm run compile      # Compile TypeScript
npm run watch        # Watch mode for development
npm run lint         # Run ESLint
```

## License

MIT License - See [LICENSE](LICENSE) for details

## Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/autotex/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/autotex/discussions)

---

*Built with ❤️ for the LaTeX community*
