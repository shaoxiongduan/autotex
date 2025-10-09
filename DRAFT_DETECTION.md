# Draft Detection and Visualization

This document explains the new diff-based draft detection system with paste handling and visualization features.

## Overview

AutoTeX now uses an advanced draft detection system that:
- Uses diff-based detection to identify changes between saved and current states
- Handles pasted text differently with intelligent analysis
- Supports multiple independent draft sections in a single file
- Provides visual highlighting of draft sections
- Converts all drafts with a single command

## Draft Detection Methods

### 1. Diff-Based Detection (Primary)

The diff-based detection uses the **Myers diff algorithm** to compare the current document state with the last saved state. This properly identifies truly new content while ignoring shifted/moved lines.

**How it works:**
1. When a document is saved, its content is stored as the "saved state"
2. As you type, the system uses Myers diff to compare current vs saved content
3. **Only truly added lines** are marked as potential drafts (shifted content is ignored)
4. Each region is analyzed for confidence scoring

**Key Feature - Smart Shift Handling:**
- When you press Enter above existing code, the code shifts down
- Myers diff recognizes the shifted lines still exist (just moved)
- Only your newly typed content is marked as a draft ✅
- Existing code that moved is NOT marked as draft ✅

**Advantages:**
- Extremely accurate - only detects truly new content
- Handles line insertions/shifts perfectly
- No false positives from moved code
- Works well with incremental writing

### 2. Paste Detection

Pasted text is detected and analyzed separately to determine if it's a draft or formatted LaTeX.

**Paste Detection Criteria:**
- Text changes larger than 50 characters
- Multi-line text insertions
- Rapid text insertion (typical of paste operations)

**Paste Analysis:**
The system analyzes pasted content for:

**Formatted LaTeX indicators (NOT a draft):**
- `\begin{}` and `\end{}` commands
- Section commands (`\section`, `\subsection`, `\chapter`)
- Text formatting (`\textbf`, `\textit`, `\emph`)
- References (`\label`, `\ref`, `\cite`)
- Display math (`\[...\]`, `$$...$$`)

**Draft indicators (IS a draft):**
- Starts with lowercase letters
- Contains casual words (basically, like, kinda, maybe, etc.)
- Lowercase after punctuation
- Draft markers (TODO, FIXME, note to self)
- High natural language score
- Minimal LaTeX commands

### 3. Heuristic Detection (Fallback)

When no saved state exists (e.g., new unsaved file), the system falls back to heuristic detection that looks for patterns indicating draft vs formatted LaTeX.

## Draft Confidence Scoring

Each detected draft region has a confidence score (0-1):

- **0.6-1.0 (High Confidence)**: Highlighted in green, definitely a draft
- **0.4-0.6 (Medium Confidence)**: Highlighted in yellow/orange, likely a draft  
- **0.0-0.4 (Low Confidence)**: Not highlighted, probably formatted LaTeX

**Confidence Factors:**
- Natural language patterns (+)
- Incomplete LaTeX syntax (+)
- Multi-line content (+)
- Formatted LaTeX commands (-)
- Section headers (-)
- Many LaTeX commands (-)

## Multiple Draft Sections

The system supports multiple independent draft sections:

1. **Detection**: All draft regions in the document are identified
2. **Merging**: Continuous drafts separated by empty lines are merged
3. **Independent Processing**: Each draft is converted separately
4. **Position Preservation**: Drafts are processed bottom-to-top to maintain positions

## Visual Highlighting

### Color Scheme

**High Confidence Drafts (Green):**
- Background: Subtle green tint
- Overview Ruler: Green indicator
- Hover: Shows confidence % and type

**Low Confidence Drafts (Yellow):**
- Background: Subtle yellow tint
- Overview Ruler: Yellow indicator
- Hover: Shows confidence % and type

### Customization

Configure highlighting in VS Code settings:

```json
{
  "autotex.highlightDrafts": true,
  "autotex.draftHighlightColor": "green",
  "autotex.minDraftConfidence": 0.4
}
```

## Commands

### Convert All Drafts
**Command:** `AutoTeX: Convert All Drafts to LaTeX`

Converts all detected draft sections in the current document to LaTeX in a single operation.

### Toggle Draft Highlighting
**Command:** `AutoTeX: Toggle Draft Highlighting`

Enable or disable visual highlighting of draft sections.

### Convert Rough Draft (Manual)
**Command:** `AutoTeX: Convert Rough Draft to LaTeX`

Manually trigger conversion (same as pressing Enter 3 times).

## Configuration Options

### `autotex.highlightDrafts`
- **Type:** boolean
- **Default:** `true`
- **Description:** Enable/disable draft highlighting

### `autotex.draftDetectionMethod`
- **Type:** string
- **Default:** `"diff"`
- **Options:** `"diff"`, `"heuristic"`, `"both"`
- **Description:** Method for detecting drafts

### `autotex.minDraftConfidence`
- **Type:** number
- **Default:** `0.4`
- **Range:** 0-1
- **Description:** Minimum confidence to treat text as draft

### `autotex.draftHighlightColor`
- **Type:** string
- **Default:** `"green"`
- **Options:** `"green"`, `"yellow"`, `"blue"`, `"purple"`, `"custom"`
- **Description:** Color scheme for highlighting

## Workflow Examples

### Example 1: Writing a New Section

1. Save your LaTeX file (Cmd/Ctrl+S) - establishes saved state
2. Type rough notes in natural language:
   ```
   need to add a section about the proof
   basically we use induction on n
   the base case is trivial
   ```
3. The text is highlighted in green (high confidence draft)
4. Press Enter 3 times or run "Convert All Drafts"
5. AutoTeX converts to:
   ```latex
   \section{Proof}
   We proceed by induction on $n$. The base case is trivial.
   ```

### Example 1b: Pressing Enter Above Existing Code (Works Perfectly!)

**Saved state:**
```latex
\section{Introduction}
This is the introduction.
```

**You press Enter at the top and type:**
```latex
need to add abstract here
↓ (Enter was pressed here, shifting existing code down)
\section{Introduction}
This is the introduction.
```

**What happens:**
- Myers diff detects: `"need to add abstract here"` is NEW ✅
- Myers diff recognizes: `\section{Introduction}` and `This is the introduction.` EXIST in saved state (just moved) ✅
- **Only** `"need to add abstract here"` is highlighted as draft
- Existing code is NOT highlighted (even though it shifted)
- Perfect detection! 🎯

### Example 2: Pasting Mixed Content

1. Paste formatted LaTeX from another source:
   ```latex
   \begin{theorem}
   For all $n \geq 1$, we have...
   \end{theorem}
   ```
2. System detects paste, analyzes content
3. Recognizes formatted LaTeX (many `\` commands, `\begin`/`\end`)
4. NOT highlighted as draft
5. Paste natural language notes:
   ```
   need to explain why this theorem is important
   ```
6. System detects paste, analyzes content
7. Recognizes as draft (natural language, no LaTeX commands)
8. Highlighted as draft
9. Convert with Enter×3 or "Convert All Drafts"

### Example 3: Multiple Drafts

1. Document with multiple rough sections:
   ```latex
   \section{Introduction}
   \begin{document}
   
   need intro paragraph about motivation
   
   \section{Background}
   
   explain the history of this problem
   maybe mention Smith's 2020 paper
   
   \section{Methods}
   
   describe the algorithm
   complexity is O(n log n)
   ```
2. All three draft regions highlighted
3. Run "Convert All Drafts"
4. All three sections converted simultaneously
5. Each maintains proper context and LaTeX structure

## Troubleshooting

### Drafts Not Detected

**Cause:** No saved state exists
**Solution:** Save the document (Cmd/Ctrl+S) to establish a baseline

### False Positives (LaTeX Highlighted as Draft)

**Cause:** Low LaTeX command density
**Solution:** Increase `autotex.minDraftConfidence` setting

### Pasted LaTeX Treated as Draft

**Cause:** Paste detection sensitivity
**Solution:** The paste analysis should handle this, but you can manually toggle highlighting off

### Highlighting Doesn't Show

**Cause:** Highlighting disabled
**Solution:** Check `autotex.highlightDrafts` setting or run "Toggle Draft Highlighting"

## Technical Details

### Draft Detector (`draftDetector.ts`)

**Key Methods:**
- `detectDraftRegions()`: Main detection logic using diff
- `computeDiff()`: Line-by-line diff algorithm
- `isPastedTextDraft()`: Analyzes pasted content
- `calculateDraftConfidence()`: Scores draft likelihood
- `mergeContinuousDrafts()`: Combines adjacent drafts

### Draft Visualizer (`draftVisualizer.ts`)

**Features:**
- Theme-aware color decorations
- Hover tooltips with confidence scores
- Overview ruler indicators
- Real-time updates

### Input Monitor (`inputMonitor.ts`)

**Enhanced Features:**
- Multiple draft conversion
- Paste event tracking
- Saved state management
- Debounced visualization updates
- Bottom-to-top processing for position preservation

## Performance Considerations

- Diff computation: O(n×m) where n,m are line counts
- Paste detection: O(1) per change event
- Visualization: Debounced 300ms to reduce overhead
- Multiple conversions: Sequential to preserve positions

## Future Enhancements

Potential improvements:
- More sophisticated diff algorithms (Myers, patience diff)
- Machine learning-based draft detection
- Custom confidence thresholds per project
- Draft templates and patterns
- Incremental diff updates
- GPU-accelerated visualization for large files

