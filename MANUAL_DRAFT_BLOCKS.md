# Manual Draft Blocks Feature

## Overview

You can now manually mark draft sections using ````autotex` code blocks, giving you full control over what gets converted to LaTeX.

## Settings

Two new settings have been added to control draft detection:

### `autotex.automaticDraftDetection` (default: `true`)
- Enable/disable automatic draft detection based on text analysis
- When disabled, only manual code blocks will be detected

### `autotex.manualDraftBlocks` (default: `true`)
- Enable/disable manual draft marking using ````autotex` code blocks
- When disabled, code blocks will be ignored

## Usage

### Basic Example

In your LaTeX file, wrap draft text with ````autotex` code blocks:

```latex
\section{Introduction}

```autotex
need to explain the background here
basically we use machine learning to solve this problem
```

\section{Methods}
```

The text inside the code block will be:
- Highlighted as a draft (with 100% confidence)
- Convertible using the same Enter key trigger (3 presses by default)
- Shown in the hover tooltip as "Manually marked with ```autotex code block"

### Multiple Draft Blocks

You can have multiple manual blocks in the same file:

```latex
\section{Results}

```autotex
show the accuracy results here
compare with baseline methods
```

\section{Discussion}

```autotex
discuss why our method works better
mention limitations and future work
```
```

### Combining Automatic and Manual Detection

By default, both methods work together:
- **Automatic detection** finds drafts based on text patterns and diff analysis
- **Manual blocks** are always detected regardless of content

You can configure which methods to use in settings:

| Automatic | Manual | Behavior |
|-----------|--------|----------|
| ✅ | ✅ | Both automatic and manual detection (default) |
| ✅ | ❌ | Only automatic detection |
| ❌ | ✅ | Only manual code blocks |
| ❌ | ❌ | No draft detection (highlighting disabled) |

### Use Cases

**1. Precise Control**
- Disable automatic detection: `"autotex.automaticDraftDetection": false`
- Only manual blocks will be converted
- Perfect for when you want exact control

**2. Forcing Draft Detection**
- Some text isn't detected automatically? Wrap it in ````autotex`
- Guaranteed 100% confidence detection

**3. Mixed Workflow**
- Use automatic detection for most drafts
- Add manual blocks for edge cases or important sections

## How It Works

When manual blocks are enabled, the extension:
1. Scans the document for ````autotex` code blocks
2. Extracts the content between the markers
3. Creates draft regions with 100% confidence
4. Highlights and enables conversion just like automatic drafts

The code block markers themselves are **not** included in the conversion - only the content inside.

## Settings Quick Reference

Access settings via:
- `Cmd+,` (Mac) or `Ctrl+,` (Windows/Linux)
- Search for "autotex"
- Find "Automatic Draft Detection" and "Manual Draft Blocks"

Or edit `settings.json`:
```json
{
  "autotex.automaticDraftDetection": true,
  "autotex.manualDraftBlocks": true
}
```

## Tips

1. **Code blocks require exact syntax**: Must be ````autotex` (lowercase, no spaces)
2. **Newline required**: The opening ````autotex` must be followed by a newline
3. **Closing marker**: Use three backticks ```` to close
4. **Works everywhere**: Can be used in any LaTeX file, any section

## Restart Required

After changing settings or adding the feature:
- Press the **Restart** button (⟳) in the debug toolbar
- Or reload VS Code: `Cmd+Shift+P` → "Developer: Reload Window"

