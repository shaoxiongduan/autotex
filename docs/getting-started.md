# Getting Started with AutoTeX

This guide will help you get AutoTeX up and running in minutes.

## Prerequisites

- **VS Code** 1.85.0 or higher
- **An LLM provider** (choose one):
  - LM Studio (local, free, private)
  - OpenRouter (cloud, many free models)
  - OpenAI (cloud, paid)

## Installation

### Option 1: Install from VSIX

1. Download the latest `autotex-x.x.x.vsix` file from releases
2. Open VS Code
3. Go to Extensions view (`Ctrl+Shift+X` / `Cmd+Shift+X`)
4. Click the `...` menu → **Install from VSIX...**
5. Select the downloaded `.vsix` file
6. Reload VS Code when prompted

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/autotex.git
cd autotex

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .

# Press F5 to run in Extension Development Host
```

## Choose Your Provider

AutoTeX works with three different AI providers. Choose the one that fits your needs:

### LM Studio (Recommended for Beginners)

**Pros**: Free, private, no API costs, works offline  
**Cons**: Requires ~4GB+ RAM, slower than cloud

1. Download LM Studio from [lmstudio.ai](https://lmstudio.ai/)
2. Install a model (recommended: `qwen/qwen3-4b-2507` or similar 4B parameter model)
3. Go to the **Developer** tab
4. Click **Start Server** (default port: 1234)
5. In VS Code settings, set:
   - `autotex.provider`: `lmstudio`
   - `autotex.lmStudio.modelName`: Your model name

### OpenRouter

**Pros**: Multiple models, some free options, fast  
**Cons**: Requires internet, API key

1. Sign up at [openrouter.ai](https://openrouter.ai/)
2. Generate an API key
3. In VS Code settings, set:
   - `autotex.provider`: `openrouter`
   - `autotex.openRouter.apiKey`: Your API key
   - `autotex.openRouter.modelName`: `meta-llama/llama-3.1-8b-instruct:free` (or any model)

### OpenAI

**Pros**: High quality, very fast  
**Cons**: Costs money, requires internet

1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Add credits to your account
3. Generate an API key
4. In VS Code settings, set:
   - `autotex.provider`: `openai`
   - `autotex.openAI.apiKey`: Your API key
   - `autotex.openAI.modelName`: `gpt-4o-mini` (recommended)

## First Conversion

1. Create or open a `.tex` file
2. Type some rough notes:
   ```
   solve x^2 + 5x + 6 = 0
   using quadratic formula
   ```
3. Press **Shift twice** (double-tap Shift key)
4. Watch it transform into:
   ```latex
   Solve $x^2 + 5x + 6 = 0$ using the quadratic formula:
   \begin{equation}
   x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
   \end{equation}
   ```

## Basic Workflow

### Quick Conversion Mode (Default)

1. **Type** rough notes naturally
2. **Save** the file (`Ctrl+S` / `Cmd+S`) - this helps AutoTeX track changes
3. Draft sections will **highlight** in green/yellow
4. Press **Shift twice** to convert all highlighted sections
5. File **auto-saves** after conversion

### Manual Draft Blocks

For more control, mark sections explicitly:

````
```autotex
for each vertex v in graph G:
  if v.color == white:
    DFS(v)
```
````

Press **Shift twice** to convert all marked blocks.

## Quick Tips

- **Save frequently**: Draft detection works better when AutoTeX knows the last saved state
- **Green = confident**: High-confidence drafts (green) are definitely rough notes
- **Yellow = uncertain**: Low-confidence drafts (yellow) might already be formatted
- **Edit safely**: You can continue typing elsewhere while conversion is in progress
- **Undo works**: Use `Ctrl+Z` / `Cmd+Z` to revert any conversion

## Next Steps

- Read [Provider Configuration](providers.md) for detailed provider setup
- Check [Configuration](configuration.md) for all available settings
- Learn about [Features](features.md) to understand how draft detection works
- See [Troubleshooting](troubleshooting.md) if you encounter issues

## Common First-Time Issues

### "Cannot connect to LM Studio"

**Solution**: Make sure LM Studio is running and the server is started in the Developer tab.

### "No drafts detected"

**Solution**: Save your file first (`Ctrl+S`), then type new content. AutoTeX detects changes from the saved state.

### "API key invalid" (OpenRouter/OpenAI)

**Solution**: Double-check your API key in VS Code settings. Make sure there are no extra spaces.

### Conversion takes too long

**Solution**: 
- For LM Studio: Try a smaller/faster model
- For cloud providers: Check your internet connection
- Use `AutoTeX: Show Debug Panel` to see what's happening

