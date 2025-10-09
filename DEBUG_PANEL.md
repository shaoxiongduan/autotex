# AutoTeX Debug Panel

## Overview

The AutoTeX Debug Panel provides real-time visibility into how the extension detects and extracts rough draft content from your LaTeX documents. This helps you understand exactly what content will be converted when you trigger the auto-conversion feature.

## How to Open the Debug Panel

1. Open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Type "AutoTeX: Show Debug Panel"
3. Press Enter

The debug panel will open beside your editor and update in real-time as you type.

## Panel Features

### 1. **Status Overview**
- **Status Badge**: Shows whether draft content is currently detected (Active/Empty)
- **Range**: Displays the line range of the detected draft
- **Length**: Shows the character count of the current draft

### 2. **Draft Detection Details** 🎯

This section provides detailed information about how the draft detection algorithm works:

#### Detection Method
Shows which method was used to identify the draft boundary:
- **"Empty line after formatted LaTeX"**: Draft starts after finding an empty line that follows formatted LaTeX code
- **"Document start"**: No clear boundary found, so draft starts from the beginning of the document

#### Cursor Position
Displays the current line number where your cursor is located.

#### Empty Line Boundary
- ✓ **Yes**: An empty line was found that marks the draft boundary
- ✗ **No**: No empty line boundary was found

#### Formatted LaTeX Found
- ✓ **Yes**: The algorithm detected formatted LaTeX code before the draft
- ✗ **No**: No formatted LaTeX was detected

#### Previous LaTeX Line
If formatted LaTeX was found, this shows the actual LaTeX code that was detected. This helps you understand what patterns the algorithm recognizes as "formatted LaTeX."

#### Detection Process
A step-by-step log showing exactly how the draft was detected:
- Where the detection started (cursor position)
- What boundaries were found
- Where the draft begins and ends
- Any important detection notes

### 3. **Current Draft Content**
Shows the exact text that will be sent to the LLM for conversion. This is what you've typed that the extension considers "rough draft" content.

## How Draft Detection Works

The AutoTeX extension uses a smart algorithm to distinguish between formatted LaTeX code and rough draft content:

1. **Starts at Cursor**: Detection begins at your current cursor position
2. **Looks Backward**: Scans backward through the document line by line
3. **Finds Boundaries**: Looks for:
   - Empty lines followed by formatted LaTeX patterns
   - LaTeX commands like `\begin{`, `\end{`, `\section`, `\documentclass`, etc.
4. **Extracts Draft**: Everything between the boundary and cursor is considered the draft
5. **Cleans Up**: Removes trailing empty lines from the draft

### Formatted LaTeX Patterns

The extension recognizes these patterns as formatted LaTeX:
- `\begin{...}`
- `\end{...}`
- `\section`, `\subsection`, `\chapter`
- `\documentclass`
- `\usepackage`
- Any LaTeX command with braces: `\command{...}`

## Example Workflow

1. **Open a LaTeX file** in VS Code
2. **Open the Debug Panel** (Command Palette → "AutoTeX: Show Debug Panel")
3. **Start typing rough draft text** at the bottom of your document
4. **Watch the panel update** in real-time showing:
   - The detected draft content
   - Where the draft starts and ends
   - What boundary was used for detection
5. **Press Enter 3 times** to trigger auto-conversion when ready

## Troubleshooting

### Draft Not Detected
If your draft isn't being detected:
- Check the "Detection Process" notes to see what the algorithm found
- Make sure there's an empty line between your formatted LaTeX and rough draft
- Verify your cursor is positioned in the draft area

### Wrong Content Detected
If the wrong content is being detected as a draft:
- Look at "Previous LaTeX Line" to see what was recognized as formatted LaTeX
- The draft always starts after the last empty line following formatted LaTeX
- Add an empty line before your draft to create a clear boundary

### Panel Not Updating
If the panel isn't updating:
- Make sure you're editing a `.tex` or LaTeX file
- Check that AutoTeX is enabled (Command Palette → "AutoTeX: Toggle Auto-Convert")
- Close and reopen the debug panel

## Technical Details

The debug panel is implemented as a VS Code Webview and communicates with the extension through message passing. It receives real-time updates whenever:
- The document content changes
- The cursor position changes
- A new draft is detected or the current draft changes

The detection information includes:
- Detection method used
- Line numbers (start, end, cursor)
- Boolean flags for boundaries found
- The actual LaTeX code that triggered detection
- Step-by-step detection notes for debugging

