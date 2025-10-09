# Draft Confidence Hover Tooltips

## Overview

When you hover over a highlighted draft section, you'll see a detailed breakdown of how the confidence score was calculated. This transparency helps you understand why text is classified as a draft and what factors influenced the score.

## Hover Tooltip Format

### High Confidence Draft (≥60%)

```
### 🟢 High Confidence Draft (85%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Positive Factors:**
- ✅ Natural language: 75% (×0.6 = 45%)
- ✅ Multi-line (4 lines) +10%
- ✅ Incomplete math ($...) +30%

_Final score = 85% (capped at 100%)_

---

💡 **Press Enter 3 times** to convert to LaTeX
```

### Low Confidence Draft (40-60%)

```
### 🟡 Low Confidence Draft (48%)

**Type:** 📋 Pasted

#### Confidence Calculation:

**Positive Factors:**
- ✅ Natural language: 80% (×0.6 = 48%)

_Final score = 48% (capped at 100%)_

---

💡 **Press Enter 3 times** to convert to LaTeX
```

### Text with Penalties

```
### 🟡 Low Confidence Draft (20%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Penalties:**
- ⚠️ Contains \begin{}\end{}
- ⚠️ High LaTeX command density

_Note: Contains formatted LaTeX, likely not a draft_

---

💡 **Press Enter 3 times** to convert to LaTeX
```

## Confidence Factors Explained

### Positive Factors (Increase Confidence)

#### 1. Natural Language Score
```
Natural language: 75% (×0.6 = 45%)
```
- Calculated as: (sentences without heavy LaTeX) / (total sentences)
- Multiplied by 0.6 to get the base score
- Higher percentage = more natural language = higher draft confidence

#### 2. Incomplete LaTeX
```
Incomplete math ($...) +30%
Incomplete command +30%
```
- **Incomplete math**: Unclosed `$` symbol at end of text
- **Incomplete command**: LaTeX command without braces at end (e.g., `\textbf`)
- These are strong indicators of work-in-progress (draft)
- Adds 30% to confidence score

#### 3. Multi-line Text
```
Multi-line (4 lines) +10%
```
- Text spanning more than 2 lines
- Longer text more likely to be draft notes
- Adds 10% to confidence score

### Penalties (Decrease Confidence)

#### 1. Formatted LaTeX Commands
```
Contains \begin{}\end{}
Contains section commands
High LaTeX command density
```
- **\begin{}\end{}**: Environment blocks indicate formatted code
- **Section commands**: `\section`, `\subsection`, etc. indicate structure
- **High density**: More than 1 command per 20 characters
- Sets confidence to 20% (very low)

#### 2. Short Text
```
Short text (<10 chars)
```
- Text shorter than 10 characters
- Too short to reliably classify
- Sets confidence to 30%

## Examples

### Example 1: High Confidence Draft

**Text:**
```
need to add proof here
basically we use induction on n
the base case is when n=1
```

**Hover shows:**
```
### 🟢 High Confidence Draft (78%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Positive Factors:**
- ✅ Natural language: 100% (×0.6 = 60%)
- ✅ Multi-line (3 lines) +10%

_Final score = 70% (capped at 100%)_
```

**Why this score:**
- 100% natural language (no LaTeX commands) → 60% base
- Multi-line text → +10%
- Total: 70%

### Example 2: With Incomplete Math

**Text:**
```
the equation is 2x + 5 = $
```

**Hover shows:**
```
### 🟢 High Confidence Draft (90%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Positive Factors:**
- ✅ Natural language: 100% (×0.6 = 60%)
- ✅ Incomplete math ($...) +30%

_Final score = 90% (capped at 100%)_
```

**Why this score:**
- Natural language → 60% base
- Unclosed `$` at end → +30%
- Total: 90%

### Example 3: Formatted LaTeX (Low Confidence)

**Text:**
```latex
\begin{theorem}
For all $n \geq 1$...
\end{theorem}
```

**Hover shows:**
```
### 🟡 Low Confidence Draft (20%)

**Type:** 📋 Pasted

#### Confidence Calculation:

**Penalties:**
- ⚠️ Contains \begin{}\end{}

_Note: Contains formatted LaTeX, likely not a draft_
```

**Why this score:**
- Has `\begin{}` and `\end{}` → recognized as formatted
- Confidence set to 20% (unlikely to be draft)

### Example 4: Natural Language with Some LaTeX

**Text:**
```
we need to prove that $x > 0$ for all cases
this follows from the definition
```

**Hover shows:**
```
### 🟢 High Confidence Draft (70%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Positive Factors:**
- ✅ Natural language: 100% (×0.6 = 60%)
- ✅ Multi-line (2 lines) +10%

_Final score = 70% (capped at 100%)_
```

**Why this score:**
- Has some math (`$x > 0$`) but mostly natural language
- Sentences have minimal LaTeX (< 30% of words)
- Counted as natural language → 60% base
- Multi-line → +10%
- Total: 70%

### Example 5: Short Text

**Text:**
```
add here
```

**Hover shows:**
```
### 🟡 Low Confidence Draft (30%)

**Type:** ⌨️ Typed

#### Confidence Calculation:

**Penalties:**
- ⚠️ Short text (<10 chars)

_Note: Short text has reduced confidence_
```

**Why this score:**
- Only 8 characters long
- Too short for reliable classification
- Fixed at 30% confidence

## Confidence Threshold

The default minimum confidence threshold is **40%**:
- Text with ≥40% confidence is highlighted
- Text with <40% confidence is not highlighted
- You can adjust this in settings: `autotex.minDraftConfidence`

### Adjusting the Threshold

```json
{
  // Only highlight high-confidence drafts
  "autotex.minDraftConfidence": 0.6,
  
  // Highlight all potential drafts (more aggressive)
  "autotex.minDraftConfidence": 0.3,
  
  // Default balanced setting
  "autotex.minDraftConfidence": 0.4
}
```

## Visual Indicators

### Color Coding

| Confidence | Color | Meaning |
|------------|-------|---------|
| 60-100% | 🟢 Green | High confidence - definitely a draft |
| 40-60% | 🟡 Yellow | Low confidence - possibly a draft |
| 0-40% | No highlight | Below threshold - likely formatted |

### Emoji Indicators

| Emoji | Meaning |
|-------|---------|
| 🟢 | High confidence draft |
| 🟡 | Low confidence draft |
| ⌨️ | Typed by user |
| 📋 | Pasted content |
| ✅ | Positive factor (increases confidence) |
| ⚠️ | Penalty (decreases confidence) |
| 💡 | Action tip |

## Benefits

### 1. Transparency
- See exactly why text is classified as draft
- Understand the confidence calculation
- Build trust in the system

### 2. Learning
- Learn what patterns indicate drafts
- Understand how to write for better detection
- See how different factors contribute

### 3. Debugging
- Quickly identify why something is/isn't highlighted
- Adjust your writing if needed
- Fine-tune settings based on hover info

### 4. Confidence
- Know when a draft will definitely convert (high %)
- Be cautious with low confidence drafts
- Make informed decisions about conversion

## Tips

### To Increase Draft Confidence:
1. **Write naturally** - use full sentences in natural language
2. **Leave LaTeX incomplete** - unclosed `$` or unfinished commands
3. **Use multiple lines** - longer drafts score higher
4. **Avoid formatted commands** - no `\begin{}`, `\section{}`, etc.

### To Decrease Draft Confidence (for formatted LaTeX):
1. **Use environments** - `\begin{}...\end{}`
2. **Add structure** - `\section{}`, `\subsection{}`
3. **High command density** - lots of `\` commands
4. **Complete all syntax** - close all `$`, finish all commands

## Troubleshooting

### "Why is my draft text highlighted yellow instead of green?"

Check the hover tooltip:
- Look at the confidence percentage
- If 40-60%, it's in the yellow (low confidence) range
- Check the factors - might need more natural language or multi-line text

### "Why isn't my draft highlighted at all?"

Hover over the text to see if it's detected:
- If no hover, confidence is below threshold (default 40%)
- Check penalties - might have too much formatted LaTeX
- Try lowering `autotex.minDraftConfidence` in settings

### "Why is formatted LaTeX highlighted as a draft?"

Hover to see the breakdown:
- If it has penalties but still highlighted, confidence is 40-60%
- The text might be ambiguous (mix of natural language and LaTeX)
- Increase `autotex.minDraftConfidence` to 0.6 to only show high confidence

## Summary

The hover tooltips provide complete transparency into draft detection:

- **🟢/🟡 Header**: Confidence level and percentage
- **Type**: Typed vs pasted content
- **Positive Factors**: What increases confidence (✅)
- **Penalties**: What decreases confidence (⚠️)
- **Action**: How to trigger conversion (💡)

This helps you understand exactly why text is classified as a draft and builds confidence in the system's accuracy!

