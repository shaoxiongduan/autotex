# AutoTeX Workflow Visualization

## Complete Conversion Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIVITY                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 1. User types rough draft in .tex file                          │
│    Example: "solve for x: 2x + 5 = 15"                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. User presses Enter → Enter → Enter (3x consecutively)       │
│    Timer: Must be within 2 seconds                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      INPUT MONITOR                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Detects 3 consecutive Enter presses                     │  │
│  │ • Extracts rough draft section                            │  │
│  │   - From last formatted LaTeX block                       │  │
│  │   - Or from document start                                │  │
│  │   - Excludes trailing newlines                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   DOCUMENT STATE MANAGER                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Creates unique conversion ID                            │  │
│  │   ID: "conversion_1_1728518400000"                       │  │
│  │ • Records region boundaries                               │  │
│  │   Range: Line 15, Char 0 → Line 18, Char 45             │  │
│  │ • Stores original text for validation                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    LM STUDIO CLIENT                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ HTTP POST to http://localhost:1234/v1/chat/completions   │  │
│  │                                                           │  │
│  │ Request Body:                                             │  │
│  │ {                                                         │  │
│  │   "model": "qwen-3-4b-instruct-no-thinking",             │  │
│  │   "messages": [                                           │  │
│  │     {                                                     │  │
│  │       "role": "system",                                   │  │
│  │       "content": "Convert rough draft text into..."       │  │
│  │     },                                                    │  │
│  │     {                                                     │  │
│  │       "role": "user",                                     │  │
│  │       "content": "solve for x: 2x + 5 = 15"              │  │
│  │     }                                                     │  │
│  │   ],                                                      │  │
│  │   "temperature": 0.3,                                     │  │
│  │   "max_tokens": 2048                                      │  │
│  │ }                                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      LM STUDIO SERVER                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Processes request with local LLM                        │  │
│  │ • Model: qwen-3-4b-instruct-no-thinking                  │  │
│  │ • Infers content type (equation)                          │  │
│  │ • Generates LaTeX code                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    RESPONSE RECEIVED                            │
│                                                                 │
│  Response:                                                      │
│  "Solve for $x$:\n\begin{align}\n2x + 5 &= 15 \\\n             │
│   x &= \frac{15-5}{2} = 5\n\end{align}"                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     TEXT REPLACER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Validation:                                               │  │
│  │ • Check conversion ID exists                              │  │
│  │ • Verify document URI matches                             │  │
│  │ • Confirm region boundaries still valid                   │  │
│  │ • Compare current text with stored original               │  │
│  │                                                           │  │
│  │ If valid:                                                 │  │
│  │ • Replace rough draft with formatted LaTeX                │  │
│  │                                                           │  │
│  │ If invalid:                                               │  │
│  │ • Abort replacement (region was edited)                   │  │
│  │ • Show warning to user                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AUTO-SAVE MANAGER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ If autotex.autoSaveEnabled == true:                       │  │
│  │                                                           │  │
│  │ • Save current document                                   │  │
│  │ • Check if outputDirectory is set                        │  │
│  │   - If yes: Also save copy to output dir                 │  │
│  │   - If no: Only save current file                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS NOTIFICATION                        │
│                                                                 │
│  "✓ Converted to LaTeX successfully"                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         CLEANUP                                  │
│                                                                 │
│  • Unregister conversion ID                                     │
│  • Free memory                                                  │
│  • Ready for next conversion                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Concurrent Editing Scenario

```
Timeline: User working while LLM processes

t=0s    User presses 3x Enter
        ↓
        Extension captures region: Lines 10-15
        Conversion ID: "conv_123"
        Original text: "solve for x..."
        
        → Sends to LM Studio ⏳

t=1s    User starts typing at Line 20 ← Safe! Different region
        
        → LLM still processing ⏳

t=2s    User edits Line 12 ← Danger! Same region as conversion
        
        → LLM still processing ⏳

t=3s    LM Studio returns formatted LaTeX
        
        → Extension validates region
        → Checks if Line 10-15 still has "solve for x..."
        → MISMATCH! User edited it
        → ❌ ABORT replacement
        → Show warning: "Region was modified"

Alternative (Safe scenario):

t=0s    User presses 3x Enter
        Region: Lines 10-15 captured
        
t=1s    User types at Line 20 ← Different region
        
t=2s    User types at Line 25 ← Different region
        
t=3s    LM Studio returns
        → Validates: Lines 10-15 unchanged ✓
        → Replaces text successfully ✓
        → Line 20, 25 untouched ✓
```

## Error Handling Flow

```
┌─────────────────────────────────────┐
│   LM Studio Connection Error        │
└─────────────────────────────────────┘
                │
                ↓
        Is ECONNREFUSED?
                │
        ┌───────┴───────┐
        │               │
       Yes             No
        │               │
        ↓               ↓
  "Cannot connect    Check if
   to LM Studio.    timeout or
   Please ensure    other error
   it's running"        │
                        ↓
                  Show specific
                  error message
                  with details
```

## Configuration Impact

```
User Configuration → Behavior

┌─────────────────────────────────────────────────────┐
│ autotex.enabled = false                             │
│ → Extension does nothing (dormant)                  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ autotex.triggerEnterCount = 2                       │
│ → Triggers on 2 Enter presses instead of 3          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ autotex.autoSaveEnabled = false                     │
│ → Converts but doesn't auto-save                    │
│ → User must manually save (Cmd+S / Ctrl+S)          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ autotex.outputDirectory = "output/"                 │
│ → Saves to workspace/output/filename.tex            │
│ → Also saves original file                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ autotex.lmStudioUrl = "http://localhost:8080/..."  │
│ → Uses different port/endpoint                      │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ autotex.modelName = "deepseek-coder-6.7b"          │
│ → Uses different model (better for code)            │
└─────────────────────────────────────────────────────┘
```

## File Language Detection

```
File opened in VS Code
        │
        ↓
    Check extension
        │
    ┌───┴───┐
    │       │
  .tex    .latex  → Activate extension
    │       │
    └───┬───┘
        │
        ↓
Extension monitors
document changes
```

## State Lifecycle

```
Conversion State Lifecycle:

1. CREATED
   ↓
   documentStateManager.registerConversion()
   → Assigns ID
   → Stores range
   → Records timestamp

2. IN_PROGRESS
   ↓
   LLM processing...
   → User can edit elsewhere
   → State tracks original region

3. VALIDATION
   ↓
   documentStateManager.isRegionValid()
   → Compare current vs original text
   → Check range still in bounds

4. COMPLETED or ABORTED
   ↓
   documentStateManager.unregisterConversion()
   → Remove from tracking
   → Free memory

5. CLEANUP
   ↓
   documentStateManager.cleanupOldConversions()
   → Remove conversions > 5 minutes old
   → Prevent memory leaks
```

## User Experience Flow

```
┌──────────────────────────────────────────────────┐
│            USER TYPES ROUGH DRAFT                 │
│  "calculate integral sin x from 0 to pi"         │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│         USER PRESSES ENTER 3 TIMES                │
│              [within 2 seconds]                   │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│       PROGRESS NOTIFICATION APPEARS               │
│  "Converting rough draft to LaTeX..."            │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│      USER CONTINUES WORKING (optional)            │
│   Can type elsewhere in document safely          │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│         CONVERSION COMPLETES (1-5 sec)            │
│  Text automatically replaced with LaTeX          │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│          SUCCESS NOTIFICATION                     │
│     "✓ Converted to LaTeX successfully"          │
└──────────────────────────────────────────────────┘
                       ↓
┌──────────────────────────────────────────────────┐
│           FILE AUTO-SAVED                         │
│   Clean LaTeX ready to compile                   │
└──────────────────────────────────────────────────┘
```

## Result

**Input:**
```
calculate integral sin x from 0 to pi
```

**Output:**
```latex
Calculate the integral:
\[
\int_0^\pi \sin(x) \, dx = 2
\]
```

---

**Complete workflow in action:** Type → Enter 3x → Wait 2-5s → Done! ✨

