# AutoTeX Setup Guide

## Quick Start (5 minutes)

### 1. Install LM Studio

1. Download LM Studio from https://lmstudio.ai/
2. Install and open the application
3. Go to the "Search" tab and download `qwen-3-4b-instruct-no-thinking` model
   - Or search for "qwen" and choose the 4B parameter model
   - Wait for download to complete

### 2. Start the LM Studio Server

1. In LM Studio, go to the "Developer" tab (or "Local Server")
2. Select your downloaded model from the dropdown
3. Click "Start Server"
4. Verify it shows: `Server running on http://localhost:1234`

### 3. Install the Extension

#### Option A: Development Mode (Recommended for testing)

```bash
# Clone the repository
git clone <your-repo-url>
cd autotex

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
```

#### Option B: Install from VSIX

```bash
# Package the extension
npm install -g @vscode/vsce
vsce package

# Install in VS Code
# Extensions → ... → Install from VSIX → select autotex-0.0.1.vsix
```

### 4. Test the Extension

1. Open the included `example.tex` file
2. Scroll to the end (after the Introduction section)
3. Type some rough draft text, for example:
   ```
   solve this equation:
   x^2 + 2x - 8 = 0
   using the quadratic formula
   ```
4. Press **Enter three times** consecutively
5. Watch the magic happen! ✨

## Configuration

### Basic Settings

Open VS Code settings (Cmd/Ctrl + ,) and search for "AutoTeX":

```json
{
    "autotex.lmStudioUrl": "http://localhost:1234/v1/chat/completions",
    "autotex.modelName": "qwen-3-4b-instruct-no-thinking",
    "autotex.triggerEnterCount": 3,
    "autotex.autoSaveEnabled": true,
    "autotex.enabled": true
}
```

### Advanced: Custom Output Directory

To save clean LaTeX files to a separate directory:

```json
{
    "autotex.outputDirectory": "output"  // relative to workspace
    // or
    "autotex.outputDirectory": "/Users/yourname/Documents/latex-output"  // absolute path
}
```

## Troubleshooting

### Issue: "Cannot connect to LM Studio"

**Checklist:**
- [ ] LM Studio is running
- [ ] Server is started (shows "Server running on...")
- [ ] Model is loaded
- [ ] Port is 1234 (or update settings if different)
- [ ] No firewall blocking localhost:1234

**Test connection:**
```bash
curl -X POST http://localhost:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen-3-4b-instruct-no-thinking",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

### Issue: Extension not activating

**Checklist:**
- [ ] You're editing a `.tex` or `.latex` file
- [ ] Extension is installed and enabled
- [ ] Check Output panel: View → Output → Select "AutoTeX"

### Issue: Conversion not triggered

**Checklist:**
- [ ] You pressed Enter 3 times consecutively (not just 3 times anywhere)
- [ ] Auto-convert is enabled: `autotex.enabled: true`
- [ ] You have text typed (rough draft)
- [ ] Less than 2 seconds between Enter presses

### Issue: Bad LaTeX output

**Solutions:**
1. **Try a different model:**
   - In LM Studio, download models like:
     - `deepseek-coder-6.7b`
     - `llama-2-13b`
     - `mistral-7b`
   - Update `autotex.modelName` setting

2. **Adjust model parameters in LM Studio:**
   - Temperature: 0.1-0.3 (lower = more consistent)
   - Max tokens: 2048+

3. **Modify system prompt** (requires editing source):
   - Edit `src/lmStudioClient.ts`
   - Modify the `SYSTEM_PROMPT` constant
   - Recompile: `npm run compile`

## Using with Different Models

### Ollama Support (Future)

To use Ollama instead of LM Studio:

1. Install Ollama: https://ollama.ai
2. Run: `ollama pull qwen:4b`
3. Update settings:
   ```json
   {
       "autotex.lmStudioUrl": "http://localhost:11434/v1/chat/completions",
       "autotex.modelName": "qwen:4b"
   }
   ```

### Cloud API Support (Not Recommended)

While you *could* use OpenAI/Anthropic APIs, this defeats the purpose of local, private processing. If needed:

```json
{
    "autotex.lmStudioUrl": "https://api.openai.com/v1/chat/completions",
    "autotex.modelName": "gpt-4"
}
```
⚠️ **Warning:** This will send your notes to external servers and incur API costs.

## Tips for Best Results

### 1. Write Clear Rough Drafts

**Good:**
```
integral from 0 to pi of sin(x) dx
result is 2
```

**Better:**
```
calculate: ∫[0,π] sin(x) dx = 2
```

### 2. Specify Content Type

**For equations:**
```
equation: E = mc^2
```

**For algorithms:**
```
algorithm bubble sort:
for i = 1 to n-1
  for j = 0 to n-i-1
    if arr[j] > arr[j+1] then swap
```

**For code blocks:**
```
python code:
def fibonacci(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)
```

### 3. Use Separate Rough Draft Sections

Don't mix rough drafts with formatted LaTeX. Keep them in separate areas:

```latex
\section{Formatted Content}
This is already formatted and complete.

% Now add rough draft below:


my rough notes here...
[Press Enter 3x]
```

## Performance Optimization

### Model Selection by Use Case

| Use Case | Recommended Model | Size | Speed |
|----------|------------------|------|-------|
| Math equations | qwen-3-4b | 4GB | Fast |
| Code/Algorithms | deepseek-coder-6.7b | 7GB | Medium |
| General LaTeX | mistral-7b | 7GB | Medium |
| Complex documents | llama-2-13b | 13GB | Slow |

### Hardware Requirements

- **Minimum:** 8GB RAM, any CPU (slow)
- **Recommended:** 16GB RAM, M1/M2 Mac or modern GPU
- **Optimal:** 32GB RAM, M2 Ultra or RTX 3090+

### Speed Tips

1. Use smaller models (4B parameters)
2. Reduce max_tokens in `lmStudioClient.ts`
3. Keep rough drafts concise
4. Close other applications

## Development Workflow

### Making Changes

1. Edit TypeScript files in `src/`
2. Run `npm run compile` or `npm run watch`
3. Reload Extension Host window (Ctrl+R / Cmd+R)
4. Test your changes

### Adding Features

1. Create a new branch: `git checkout -b feature-name`
2. Implement feature
3. Test thoroughly
4. Update CHANGELOG.md
5. Submit PR

## Support

- **Issues:** https://github.com/yourusername/autotex/issues
- **Discussions:** https://github.com/yourusername/autotex/discussions
- **Email:** your.email@example.com

## Next Steps

1. ✅ Install LM Studio and start server
2. ✅ Install AutoTeX extension
3. ✅ Test with example.tex
4. 📚 Read the full README.md
5. ⚙️ Customize settings to your preferences
6. 🚀 Start using it in your real LaTeX documents!

Happy LaTeXing! 🎉

