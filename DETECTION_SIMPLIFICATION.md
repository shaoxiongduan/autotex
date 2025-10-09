# Detection Logic Simplification

## Overview

The draft detection logic has been simplified by removing the distinction between "typed" and "pasted" text. All text is now analyzed uniformly using the confidence calculation algorithm.

## Changes Made

### 1. Removed Paste Tracking System

**Removed Components:**
- `PasteEvent` interface
- `pasteEvents` Map from DraftDetector
- `trackPasteEvent()` method
- `detectPasteEvent()` method in InputMonitor
- `findPasteEventForRegion()` method
- `rangesOverlap()` method
- `isPastedTextDraft()` method

**Why:**
The paste tracking system was attempting to distinguish between typed and pasted text, but was:
- Treating almost all text as "pasted" 
- Adding unnecessary complexity
- Using different analysis logic for pasted vs typed text

### 2. Unified Detection Logic

**Before:**
```typescript
if (pasteEvent) {
    // Use isPastedTextDraft() - different logic
    const isDraft = this.isPastedTextDraft(regionText);
    // ...
} else {
    // Use confidence calculation - different logic
    const result = this.calculateDraftConfidenceWithBreakdown(regionText);
    // ...
}
```

**After:**
```typescript
// All text uses the same confidence calculation
const result = this.calculateDraftConfidenceWithBreakdown(regionText);
if (result.confidence > 0.3) {
    draftRegions.push({
        range: region,
        text: regionText,
        type: 'auto',
        confidence: result.confidence,
        breakdown: result.breakdown
    });
}
```

### 3. Renamed Type System

**Before:** `type: 'typed' | 'pasted'`
**After:** `type: 'auto' | 'manual'`

**Reasoning:**
- 'auto' = Auto-detected drafts (using confidence calculation)
- 'manual' = Manually marked drafts (using ````autotex` code blocks)
- More accurate and meaningful than typed/pasted
- Better represents how the system actually works

### 4. Updated Display

**Before:** `Type: typed` or `Type: pasted`
**After:** `Type: 🔍 Auto-detected` or `Type: 📝 Manually marked`

More user-friendly labels with visual icons.

## Benefits

### 1. Consistency
- All text is analyzed using the same algorithm
- No more confusion about why some text behaves differently
- Predictable confidence scores

### 2. Simplicity
- Removed ~150 lines of paste tracking code
- Single code path for all draft detection
- Easier to understand and maintain

### 3. Accuracy
- The confidence calculation is more sophisticated than the old paste detection
- Natural language scoring works better
- Proper handling of LaTeX vs natural text

### 4. Better User Experience
- Clear distinction between auto-detected and manually marked drafts
- Confidence scores make sense and match the displayed breakdown
- Fewer edge cases and weird behaviors

## How It Works Now

### Auto-Detection (`type: 'auto'`)
1. Compare current document with saved state (diff-based detection)
2. For each changed region, calculate confidence using:
   - Natural language score (checks for English words vs LaTeX)
   - Incomplete LaTeX detection
   - Multi-line bonus
   - Formatted LaTeX penalty
3. If confidence > 30%, mark as draft

### Manual Detection (`type: 'manual'`)
1. Scan document for ````autotex` code blocks
2. Extract content between markers
3. Always mark as draft with 100% confidence
4. Show special "Manually marked" indicator

## Migration Notes

- No user action required - changes are internal
- Settings remain the same
- Existing drafts will be re-detected using the new logic
- After restart, everything will work the same but more consistently

