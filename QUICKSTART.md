# AutoTeX Quick Start

Get up and running with AutoTeX in 5 minutes!

## 1. Install Dependencies

```bash
npm install
```

## 2. Set Up LM Studio

1. **Download LM Studio:** https://lmstudio.ai/
2. **Install the model:**
   - Open LM Studio
   - Go to "Search" tab
   - Search for "qwen-3-4b-instruct-no-thinking"
   - Click Download
3. **Start the server:**
   - Go to "Developer" tab
   - Select the model from dropdown
   - Click "Start Server"
   - Ensure it shows: `Server running on http://localhost:1234`

## 3. Build the Extension

```bash
npm run compile
```

## 4. Run the Extension

1. Open this project in VS Code
2. Press **F5** to launch Extension Development Host
3. In the new window, open `example.tex`
4. Try typing some rough draft text:
   ```
   solve for x: 2x + 5 = 15
   ```
5. Press **Enter 3 times** consecutively
6. Watch it convert to LaTeX! ✨

## 5. Verify It Works

You should see the text transform to:
```latex
Solve for $x$:
\begin{align}
2x + 5 &= 15 \\
x &= \frac{15-5}{2} = 5
\end{align}
```

## Common Issues

### "Cannot connect to LM Studio"
- Make sure LM Studio server is running on port 1234
- Check that a model is loaded

### Extension doesn't activate
- Make sure you're editing a `.tex` file
- Check the language mode (bottom right corner)

### Conversion not triggered
- Press Enter 3 times **consecutively** (within 2 seconds)
- Make sure `autotex.enabled` is `true` in settings

## Next Steps

- Read [README.md](README.md) for detailed documentation
- See [SETUP.md](SETUP.md) for advanced configuration
- Check [CONTRIBUTING.md](CONTRIBUTING.md) to contribute

## Package for Distribution

```bash
# Install vsce
npm install -g @vscode/vsce

# Package
vsce package

# This creates: autotex-0.0.1.vsix
# Install it: Extensions → ... → Install from VSIX
```

Happy LaTeXing! 🎉

