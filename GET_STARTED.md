# 🚀 Get Started with AutoTeX

Your LaTeX editor extension is ready! Here's everything you need to know.

## ✅ What's Been Built

A complete VS Code extension that automatically converts rough draft notes into compilable LaTeX code using a local LLM.

## 📁 Project Structure

```
autotex/
├── 📄 Core Extension Code
│   ├── src/extension.ts              # Main entry point
│   ├── src/inputMonitor.ts           # Detects 3x Enter trigger
│   ├── src/documentStateManager.ts   # Tracks conversions
│   ├── src/lmStudioClient.ts         # LM Studio integration
│   ├── src/textReplacer.ts           # Smart text replacement
│   └── src/autoSaveManager.ts        # Auto-save functionality
│
├── ⚙️ Configuration
│   ├── package.json                  # Extension manifest
│   ├── tsconfig.json                 # TypeScript config
│   ├── .eslintrc.json                # Linting rules
│   ├── .vscode/launch.json           # Debug config
│   └── .vscode/tasks.json            # Build tasks
│
├── 📚 Documentation
│   ├── README.md                     # Full documentation
│   ├── QUICKSTART.md                 # 5-minute setup
│   ├── SETUP.md                      # Detailed setup guide
│   ├── WORKFLOW.md                   # Visual workflow diagrams
│   ├── PROJECT_SUMMARY.md            # Technical overview
│   ├── CONTRIBUTING.md               # Contribution guide
│   ├── CHANGELOG.md                  # Version history
│   └── GET_STARTED.md                # This file
│
├── 📝 Examples
│   ├── example.tex                   # Test LaTeX file
│   └── idea.md                       # Original concept
│
└── ⚖️ License
    └── LICENSE                       # MIT License
```

## 🎯 Key Features

✨ **Auto-Conversion**: Press Enter 3x to trigger conversion  
🤖 **Local LLM**: Uses LM Studio (privacy-first, no cloud)  
🔄 **Smart Tracking**: Prevents overwriting concurrent edits  
💾 **Auto-Save**: Saves clean LaTeX automatically  
⚙️ **Configurable**: Full control via VS Code settings  
🎨 **Intelligent**: Detects equations, code, pseudocode, etc.  

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd /Users/admin/Documents/Github/autotex
npm install
```

### Step 2: Setup LM Studio

1. **Download**: https://lmstudio.ai/
2. **Install model**: Search for `qwen-3-4b-instruct-no-thinking`
3. **Start server**: Developer tab → Start Server (port 1234)

### Step 3: Run the Extension

```bash
# Compile TypeScript
npm run compile

# Open in VS Code
code .

# Press F5 to launch Extension Development Host
```

## 🧪 Test It Out

1. In the Extension Development Host window
2. Open `example.tex`
3. Scroll to the bottom
4. Type: `solve for x: 2x + 5 = 15`
5. Press **Enter 3 times**
6. Watch the magic! ✨

## 📋 Tech Stack Summary

| Component | Technology |
|-----------|------------|
| **Platform** | VS Code Extension API |
| **Language** | TypeScript |
| **Runtime** | Node.js |
| **LLM** | LM Studio (qwen-3-4b) |
| **HTTP Client** | Axios |
| **Build Tool** | TypeScript Compiler |

## 🔧 Configuration Options

```json
{
  "autotex.lmStudioUrl": "http://localhost:1234/v1/chat/completions",
  "autotex.modelName": "qwen-3-4b-instruct-no-thinking",
  "autotex.triggerEnterCount": 3,
  "autotex.autoSaveEnabled": true,
  "autotex.outputDirectory": "",
  "autotex.enabled": true
}
```

## 📦 Package for Distribution

```bash
# Install packaging tool
npm install -g @vscode/vsce

# Package extension
vsce package

# Install the .vsix file
# Extensions → ... → Install from VSIX → autotex-0.0.1.vsix
```

## 🎬 How It Works

```
User types rough draft
         ↓
Presses Enter 3x
         ↓
Extension captures text
         ↓
Sends to LM Studio (local)
         ↓
Receives formatted LaTeX
         ↓
Smart replacement (validates region)
         ↓
Auto-save
         ↓
Done! ✨
```

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Compile once
npm run compile

# Watch mode (auto-compile)
npm run watch

# Lint code
npm run lint

# Run extension (or press F5)
code . && # Press F5
```

## 📖 Documentation Guide

| Document | Purpose |
|----------|---------|
| **GET_STARTED.md** | You are here! Quick overview |
| **QUICKSTART.md** | 5-minute setup guide |
| **README.md** | Complete user documentation |
| **SETUP.md** | Detailed setup & troubleshooting |
| **WORKFLOW.md** | Visual diagrams & flows |
| **PROJECT_SUMMARY.md** | Technical architecture |
| **CONTRIBUTING.md** | Developer contribution guide |

## 🔍 Example Conversion

**Before:**
```
for loop from 1 to n:
  sum = sum + i
return sum
```

**After (auto-converted):**
```latex
\begin{algorithm}
\begin{algorithmic}
\For{$i = 1$ to $n$}
    \State $\text{sum} \gets \text{sum} + i$
\EndFor
\State \Return sum
\end{algorithmic}
\end{algorithm}
```

## ⚡ Performance Tips

- Use 4B parameter models for speed
- Keep rough drafts concise
- Close other heavy apps
- Use SSD for better I/O

## 🐛 Common Issues & Fixes

### "Cannot connect to LM Studio"
✅ **Fix**: Start LM Studio server (Developer tab)

### "No rough draft found"
✅ **Fix**: Make sure you typed text before pressing Enter 3x

### Extension doesn't activate
✅ **Fix**: Ensure you're editing a `.tex` file

## 🎯 Next Steps

1. ✅ Run `npm install`
2. ✅ Setup LM Studio
3. ✅ Run `npm run compile`
4. ✅ Press F5 to test
5. ✅ Try `example.tex`
6. 📚 Read full README.md
7. 🎨 Customize settings
8. 🚀 Start using in real projects!

## 🌟 Features Roadmap

- [ ] Custom system prompts via UI
- [ ] Ollama backend support
- [ ] Visual indicators for drafts
- [ ] Undo/redo conversions
- [ ] Batch conversion
- [ ] Streaming responses
- [ ] Custom keybindings

## 📝 Important Files to Know

- **package.json**: Extension manifest, dependencies, commands
- **src/extension.ts**: Main entry point, initialization
- **src/inputMonitor.ts**: Core trigger logic
- **src/lmStudioClient.ts**: LLM API integration (customize here!)
- **.vscode/launch.json**: Debug configuration

## 🤝 Contributing

Want to improve AutoTeX? Check out **CONTRIBUTING.md**!

## 📄 License

MIT License - Free to use, modify, and distribute!

## 🆘 Get Help

- 📖 Read: README.md, SETUP.md
- 🐛 Issues: GitHub Issues
- 💬 Discuss: GitHub Discussions
- 📧 Email: [Your email]

---

## ⚡ TL;DR - Get Running Now!

```bash
# In the autotex directory:
npm install                    # Install dependencies
npm run compile               # Compile TypeScript
code .                        # Open in VS Code
# Press F5                    # Launch extension
# Open example.tex            # Test file
# Type something & Enter 3x   # See the magic!
```

**Remember**: LM Studio must be running with the server started on port 1234!

---

**Status**: ✅ **Complete and Ready to Use!**

Happy LaTeXing! 🎉✨📝

