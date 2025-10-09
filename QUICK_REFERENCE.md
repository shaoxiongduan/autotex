# AutoTeX Quick Reference Guide

## 🚀 Quick Start

1. **Save your .tex file** (Cmd/Ctrl+S) - This establishes the baseline
2. **Type rough notes** - They'll highlight in green
3. **Double tap Shift** (press Shift twice quickly)
4. **Watch the magic** ✨ - Your drafts become LaTeX!

## 🎨 Visual Indicators

| Color | Meaning | Confidence |
|-------|---------|------------|
| 🟢 Green | High-confidence draft | 60-100% |
| 🟡 Yellow | Low-confidence draft | 40-60% |
| No highlight | Formatted LaTeX or below threshold | <40% |

**Hover over highlighted text** to see:
- Confidence percentage and level (🟢 high / 🟡 low)
- Type (⌨️ typed vs 📋 pasted)
- **Detailed confidence breakdown**:
  - ✅ Positive factors (natural language %, incomplete LaTeX, multi-line)
  - ⚠️ Penalties (formatted LaTeX, short text)
  - Explanation of how the score was calculated
- 💡 Conversion instructions

## ⌨️ Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| Convert All Drafts | Shift+Shift | Convert all detected drafts |
| Convert Rough Draft | - | Convert drafts near cursor |
| Toggle Auto-Convert | - | Enable/disable auto-conversion |
| Toggle Draft Highlighting | - | Show/hide highlighting |
| Check Server Status | - | Check LM Studio status |
| Show Debug Panel | - | Open debug information |

**Tip:** Double tap Shift to quickly convert all drafts

## ⚙️ Essential Settings

```json
{
  // Enable visual highlighting
  "autotex.highlightDrafts": true,
  
  // Detection method (diff is best)
  "autotex.draftDetectionMethod": "diff",
  
  // Minimum confidence to highlight (0.0-1.0)
  "autotex.minDraftConfidence": 0.4,
  
  // Highlight color scheme
  "autotex.draftHighlightColor": "green",
  
  // Auto-save after conversion
  "autotex.autoSaveEnabled": true,
  
  // Number of Enter presses to trigger
  "autotex.triggerEnterCount": 3
}
```

## 📝 Workflow Examples

### Single Draft Section

```
1. Save file (Cmd/Ctrl+S)
2. Type: "prove using induction on n"
   → Highlights green
3. Press Enter×3
4. Result: "\begin{proof} We proceed by induction on $n$. \end{proof}"
```

### Multiple Draft Sections

```latex
\section{Introduction}

need to motivate the problem     ← Draft 1 (green)

\section{Methods}

describe the algorithm here      ← Draft 2 (green)

\section{Results}

performance is O(n log n)        ← Draft 3 (green)
```

**Run "Convert All Drafts"** → All three convert simultaneously!

### Paste Detection

**Pasting Formatted LaTeX:**
```latex
\begin{theorem}
For all $n \geq 1$...
\end{theorem}
```
→ NOT highlighted (system recognizes it's formatted)

**Pasting Draft Notes:**
```
need to add proof of correctness here
```
→ Highlighted green (system recognizes it's a draft)

## 🔍 Draft Detection Logic

The system uses the **Myers diff algorithm** to detect truly new content:

**How it works:**
- Compares current document with last saved state
- Identifies only **truly added lines** (not shifted/moved lines)
- When you press Enter above code, shifted lines are recognized as existing ✅
- Only your new text is marked as draft ✅

The system then checks for:

### ✅ Draft Indicators (causes highlighting)
- Natural language sentences
- Casual words: "basically", "like", "maybe", "kinda"
- Lowercase after punctuation
- TODO markers: "TODO", "FIXME", "note to self"
- Incomplete LaTeX: unclosed $, unfinished commands
- Minimal LaTeX commands

### ❌ Formatted LaTeX Indicators (prevents highlighting)
- `\begin{}` and `\end{}`
- Section commands: `\section`, `\subsection`
- Text formatting: `\textbf`, `\textit`, `\emph`
- References: `\label`, `\ref`, `\cite`
- Display math: `\[...\]`, `$$...$$`
- High density of LaTeX commands

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| No highlighting | Save the file first (Cmd/Ctrl+S) |
| LaTeX highlighted as draft | Increase `minDraftConfidence` to 0.6-0.8 |
| Draft not detected | Lower `minDraftConfidence` to 0.3 |
| Server connection error | Start LM Studio server first |
| Wrong conversions | Try different LM Studio model |
| Highlighting too distracting | Toggle off with command |

## 💡 Pro Tips

1. **Save regularly** - The system uses saved state as baseline
2. **Watch the colors** - Green = definitely a draft, Yellow = maybe
3. **Batch convert** - Use "Convert All Drafts" for multiple sections
4. **Adjust confidence** - Tune `minDraftConfidence` to your style
5. **Paste freely** - System intelligently handles pasted content
6. **Debug panel** - Use debug panel to see detection details

## 📊 Confidence Scoring

```
High Confidence (0.6-1.0) → Green
├─ Natural language patterns
├─ Casual words and phrases
├─ Incomplete LaTeX syntax
└─ Multi-line content

Low Confidence (0.4-0.6) → Yellow
├─ Mixed LaTeX and natural language
├─ Some formatted elements
└─ Ambiguous patterns

Below Threshold (<0.4) → No highlight
├─ Heavily formatted LaTeX
├─ Many LaTeX commands
└─ Professional structure
```

## 🎯 Best Practices

### ✅ DO
- Save your file before starting (establishes baseline)
- Write naturally in your drafts
- Use "Convert All Drafts" for multiple sections
- Review conversions before saving
- Adjust confidence threshold to your needs

### ❌ DON'T
- Don't expect perfect detection on unsaved files
- Don't mix too much LaTeX in drafts (use natural language)
- Don't paste without checking if it's detected correctly
- Don't disable highlighting - it's helpful!
- Don't forget to save after major changes

## 🔗 Quick Links

- **Detailed Documentation**: See `DRAFT_DETECTION.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **General Setup**: See `README.md`
- **LM Studio Setup**: See `LM_STUDIO_SETUP.md`

## ⚡ Keyboard Workflow

```
1. Type draft      → Auto-highlights
2. Shift+Shift    → Triggers conversion
3. Wait            → LLM processes
4. Done!           → Auto-saves (if enabled)
```

**Super fast workflow:**
- Type → Double tap Shift → Done! ✨

## 🎨 Customization

### Change Highlight Colors

Edit VS Code `settings.json`:
```json
{
  "workbench.colorCustomizations": {
    "autotex.draftBackground": "#00ff0020",
    "autotex.draftBackgroundLowConfidence": "#ffff0015"
  }
}
```

### Disable Features Selectively

```json
{
  "autotex.highlightDrafts": false,      // No highlighting
  "autotex.autoSaveEnabled": false,      // Manual save
  "autotex.enabled": false               // Disable entirely
}
```

### Change Trigger

```json
{
  "autotex.triggerEnterCount": 2,  // Only 2 Enter presses
  "autotex.triggerEnterCount": 5   // Or 5 for safety
}
```

## 📈 Performance Tips

- **Large files**: Detection may be slower, but debouncing helps
- **Many drafts**: Batch conversion processes sequentially
- **Real-time updates**: Debounced at 300ms for smooth editing
- **Memory**: Saved states cleared when document closes

## 🆘 Emergency Actions

### If Something Goes Wrong

1. **Undo** - Standard Cmd/Ctrl+Z works!
2. **Disable** - Toggle auto-convert off
3. **Clear** - Close and reopen file to reset state
4. **Debug** - Use "Show Debug Panel" for details
5. **Restart** - Reload VS Code window if needed

---

**Happy LaTeX writing! 📄✨**

