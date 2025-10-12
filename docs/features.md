# Features Explained

Deep dive into how AutoTeX works and its key features.

## Draft Detection

AutoTeX uses intelligent algorithms to identify which parts of your document are rough drafts vs. finished LaTeX.

### Detection Methods

#### Diff-Based Detection (Recommended)

Compares current document with the last saved state:

1. **Save** your document (`Ctrl+S`)
2. **Type** new content or modify existing text
3. AutoTeX **compares** current vs. saved using Myers diff algorithm
4. **New/changed sections** are marked as potential drafts
5. **Confidence score** assigned based on LaTeX patterns

**Advantages**:
- Accurate - knows exactly what's new
- Handles paste operations well
- Works with any content style

**When it works best**:
- Save frequently while working
- Let AutoTeX track your changes
- Add new sections below existing LaTeX

#### Heuristic Detection

Analyzes text patterns to identify rough drafts:

**Draft indicators**:
- Natural language sentences
- Plain text equations like `x = 5 + 3`
- Pseudocode patterns: `for i in range`, `if x > 5`
- Informal notation
- Missing LaTeX commands

**LaTeX indicators**:
- Backslash commands: `\frac`, `\begin`, `\section`
- Math environments: `\[ ... \]`, `$ ... $`
- Package usage: `\usepackage`, `\documentclass`
- Bibliography: `\cite`, `\bibliography`

**Advantages**:
- Works without saved state
- Can detect drafts in newly opened files
- Useful for legacy documents

**Limitations**:
- May misidentify formatted text as drafts
- Confidence scores less reliable

#### Both Methods

Uses both diff and heuristic detection:

```json
{
  "autotex.draftDetectionMethod": "both"
}
```

Drafts are detected if **either** method identifies them. This maximizes detection but may have more false positives.

---

## Confidence Scoring

Each detected draft gets a confidence score (0-1) indicating how likely it is to be a rough draft.

### Score Interpretation

| Score | Color | Meaning |
|-------|-------|---------|
| 0.6 - 1.0 | Green | High confidence - definitely a draft |
| 0.4 - 0.6 | Yellow | Medium confidence - likely a draft |
| 0.0 - 0.4 | None | Low confidence - not highlighted |

Adjust threshold:
```json
{
  "autotex.minDraftConfidence": 0.4  // Only highlight ≥0.4
}
```

### Confidence Factors

**Increases confidence**:
- Natural language patterns
- Plain text equations
- Pseudocode syntax
- New/changed content (diff method)
- Lack of LaTeX commands

**Decreases confidence**:
- Existing LaTeX commands
- Math environments
- Formal notation
- Content unchanged since save

### View Confidence Details

Use the **Debug Panel** to see detailed confidence breakdown:

1. `Ctrl+Shift+P` / `Cmd+Shift+P`
2. `AutoTeX: Show Debug Panel`
3. Hover over detected draft sections

---

## Manual Draft Blocks

For precise control, mark sections explicitly with code blocks.

### Basic Usage

````
```autotex
Your rough draft text here
Can span multiple lines
Will be converted when triggered
```
````

**Advantages**:
- Exact control over what gets converted
- Works in any document, even without saves
- No false positives
- Can be used in non-LaTeX files (if enabled)

### Triggering Conversion

**Method 1**: Double-tap Shift (`Shift+Shift`)
- Converts all `autotex` blocks in document
- Fast for batch processing

**Method 2**: Command Palette
- `AutoTeX: Convert All Drafts to LaTeX`
- Same effect as `Shift+Shift`


### Inserting Blocks Quickly

Press **Ctrl twice** (`Ctrl+Ctrl`) to insert:
````
```autotex
█  ← cursor here
```
````

### Nested Content

Manual blocks work with any content type:

````
```autotex
Prove that for all n >= 1:
sum from i=1 to n of i^2 = n(n+1)(2n+1)/6

Proof by induction:
Base case: n=1, LHS = 1, RHS = 1*2*3/6 = 1 ✓
Inductive step: assume true for n=k...
```
````

Converts to proper LaTeX proof structure.

---

## Visual Highlighting

Draft sections are highlighted in the editor for easy identification.

### Highlight Colors

- **Green background**: High-confidence drafts (≥0.6)
- **Yellow background**: Medium-confidence drafts (0.4-0.6)
- **Scrollbar markers**: Shows draft locations in long documents

### Hover Tooltips

Hover over a highlighted section to see:
- Confidence score
- Detection method used
- Breakdown of confidence factors
- Preview of what will be converted

### Toggle Highlighting

**Disable temporarily**:
```
AutoTeX: Toggle Draft Highlighting
```

**Disable permanently**:
```json
{
  "autotex.highlightDrafts": false
}
```

---

## Conversion Process

Understanding how conversion works helps optimize your workflow.

### Step-by-Step Flow

1. **Trigger** (Shift×2 or command)
2. **Detect** all draft sections in document
3. **Sort** drafts bottom-to-top (preserves positions)
4. **Send** each draft to AI provider
5. **Receive** LaTeX conversion
6. **Replace** draft text with LaTeX
7. **Verify** document integrity
8. **Save** automatically (if enabled)

### Concurrent Processing

All draft sections are sent to AI **simultaneously** for speed:

```
Draft 1 ──┐
Draft 2 ──┤→ AI Provider → LaTeX 1, 2, 3
Draft 3 ──┘
```

**Benefits**:
- 3 drafts = same time as 1 draft
- Efficient for large documents
- Real-time status notifications

### Position Tracking

AutoTeX tracks document changes during conversion:

- **Safe editing**: Type elsewhere while conversion runs
- **Position preservation**: Drafts replaced at original locations
- **Conflict detection**: Warns if you edit a converting region

---

## Auto-Save

Automatically saves your document after successful conversion.

### How It Works

1. Conversion completes successfully
2. **Checks** if document has unsaved changes
3. **Saves** using VS Code's save API
4. Shows notification: "AutoTeX: Saved"

### Configuration

**Enable/disable**:
```json
{
  "autotex.autoSaveEnabled": true
}
```

**Custom output directory**:
```json
{
  "autotex.outputDirectory": "./output"
}
```

Saves converted file to `output/yourfile.tex` instead of overwriting source.

### Manual Save

Auto-save only activates on successful conversion. You still need to save manually:
- While typing
- After failed conversions
- When `autoSaveEnabled: false`

---

## Smart Paste Detection

AutoTeX analyzes pasted content to determine if it's a draft.

### How It Works

1. You **paste** text into document
2. AutoTeX **analyzes** content patterns
3. If looks like rough draft → **highlights** as draft
4. If looks like LaTeX → **ignores**

### Paste Examples

**Detected as draft**:
```
sum of i from 1 to n = n(n+1)/2
```

**Detected as LaTeX**:
```latex
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
```

### Disable Paste Detection

```json
{
  "autotex.automaticDraftDetection": false
}
```

This disables real-time analysis. Pasted content still detected on next save using diff method.

---

## Multi-Draft Support

Convert multiple draft sections simultaneously.

### Example Document

```latex
\section{Introduction}
... existing LaTeX ...

First draft: solve x^2 = 16

\section{Methods}
... existing LaTeX ...

Second draft: for each vertex v:
  mark v as visited

\section{Results}
... existing LaTeX ...

Third draft: calculate mean = sum / count
```

Press `Shift+Shift` → **All three drafts** convert at once.

### Benefits

- **Efficient**: Convert entire document in one go
- **Consistent**: Same AI model handles all sections
- **Fast**: Parallel processing

---

## File Type Support

AutoTeX can work with any file type, not just `.tex` files.

### Default Support

- `.tex` files (LaTeX)
- `.latex` files

### Enable for Other Types

```json
{
  "autotex.enabledFileTypes": ["latex", "tex", "markdown", "plaintext"]
}
```

**Use cases**:
- **Markdown**: Convert math in `.md` files
- **Plain text**: Draft anywhere, convert to LaTeX
- **Custom**: Any file type you specify

### Language IDs

VS Code uses language IDs, not file extensions. Common IDs:
- `latex` → `.tex` files
- `markdown` → `.md` files
- `plaintext` → `.txt` files
- `python` → `.py` files (if you want LaTeX in comments?)

---

## Advanced Features

### Custom System Prompts

Modify how AI converts your drafts:

```json
{
  "autotex.systemPrompt": "Convert to LaTeX. Use align* for equations. Add explanatory comments above each block. Prefer amsmath environments."
}
```

**Examples**:

**For academic papers**:
```
Convert to LaTeX suitable for academic papers. Use formal language, proper citations format (\cite{}), and standard theorem environments.
```

**For presentations**:
```
Convert to LaTeX for Beamer slides. Keep text concise. Use \alert{} for emphasis. Format equations for visibility.
```

### Temperature Control

Adjust AI creativity:

```json
{
  "autotex.temperature": 0.1  // Very deterministic
}
```

- **0.0-0.3**: Consistent, reliable conversions (recommended)
- **0.4-0.6**: More variation, creative formatting
- **0.7-1.0**: Highly creative (may be inconsistent)

### Token Limits

Control response length:

```json
{
  "autotex.maxTokens": 4096  // Longer responses
}
```

Increase for large draft sections, decrease to save costs/speed.

