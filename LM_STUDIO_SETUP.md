# LM Studio Setup Guide for AutoTeX

## What I've Built

I've created a complete TypeScript-based server management system for AutoTeX with the following features:

### 1. **ServerManager** (`src/serverManager.ts`)
- **Automatic Server Detection**: Checks if LM Studio server is running every 30 seconds
- **Status Bar Indicator**: Shows real-time server status in VS Code status bar
  - 🟢 Green: Server running
  - 🟡 Yellow: Server stopped (click to start)
  - ❓ Gray: Status unknown
- **Auto-Start Capability**: Can attempt to launch LM Studio automatically
- **Smart Prompts**: Guides you through starting the server manually if auto-start fails

### 2. **Enhanced LM Studio Client** (`src/lmStudioClient.ts`)
- **Updated Model Name**: Now defaults to `qwen/qwen3-4b-2507`
- **Better Error Messages**: Specific error handling for:
  - Connection refused (server not running)
  - Timeouts (model taking too long)
  - Model not found (wrong model name)
  - Server internal errors
- **Configurable Settings**:
  - Temperature (default: 0.3)
  - Max tokens (default: 2048)
  - Timeout (2 minutes)

### 3. **New Commands**
- `AutoTeX: Check Server Status` - Check if LM Studio is running
- `AutoTeX: Start LM Studio Server` - Attempt to start the server

### 4. **New Configuration Options**
```json
{
  "autotex.modelName": "qwen/qwen3-4b-2507",
  "autotex.temperature": 0.3,
  "autotex.maxTokens": 2048
}
```

## Quick Start

### Step 1: Start LM Studio
1. Open LM Studio
2. Go to the **"Developer"** or **"Local Server"** tab
3. Select your `qwen/qwen3-4b-2507` model
4. Click **"Start Server"**
5. Verify it shows: `Server running on http://localhost:1234`

### Step 2: The Extension Will Handle the Rest!
- The status bar will show: `🟢 LM Studio` when connected
- If the server is not running, AutoTeX will:
  1. Detect it's offline
  2. Ask if you want to start it
  3. Guide you through the process

## How It Works

### Auto-Detection Flow
1. Extension activates when you open a `.tex` file
2. `ServerManager` starts monitoring the server every 30 seconds
3. Status bar updates to show current state
4. When you trigger conversion (3 Enter presses), it:
   - Checks if server is running
   - Prompts you to start it if not
   - Proceeds with conversion once server is available

### Manual Controls
- **Click the status bar** to check server status
- **Command Palette** → `AutoTeX: Start LM Studio Server`
- **Command Palette** → `AutoTeX: Check Server Status`

## Configuration

Your workspace is already configured with:
```json
{
  "autotex.modelName": "qwen/qwen3-4b-2507"
}
```

You can adjust additional settings in VS Code Settings (Cmd+,):
- **Temperature**: Lower (0.1-0.3) = more consistent, Higher (0.7-1.0) = more creative
- **Max Tokens**: Maximum length of LLM response

## Troubleshooting

### Server Status Shows "Unknown"
- The extension is still checking
- Wait a few seconds for the first check to complete

### Server Won't Start Automatically
- This is normal! LM Studio doesn't have a command-line interface
- Follow the prompts to start it manually
- Once started, AutoTeX will detect it automatically

### Model Not Found Error
- Ensure the model name matches exactly: `qwen/qwen3-4b-2507`
- Check LM Studio to see the exact model name
- Update `autotex.modelName` setting if different

### Connection Timeout
- Your model might be too large/slow
- Try increasing the timeout (would need code change)
- Or use a smaller/faster model

## What's Different from Before

### Before:
- ❌ No server status indication
- ❌ Cryptic error messages
- ❌ Manual server management only
- ❌ Wrong default model name

### Now:
- ✅ Real-time status bar indicator
- ✅ Clear, actionable error messages
- ✅ Automatic server detection and startup prompts
- ✅ Correct model name (`qwen/qwen3-4b-2507`)
- ✅ Configurable temperature and token limits
- ✅ Better timeout handling (2 minutes)

## Next Steps

1. **Test It**: 
   - Open `example.tex`
   - Make sure LM Studio server is running
   - Type some rough text and press Enter 3 times
   - Watch the status bar during conversion

2. **Customize**:
   - Adjust temperature for your needs
   - Change max tokens if responses are cut off
   - Try different models

3. **Enjoy**:
   - The extension now handles most server issues automatically
   - Focus on writing, not troubleshooting!

## Technical Details

### Files Modified
- `src/serverManager.ts` (NEW) - Server management and monitoring
- `src/lmStudioClient.ts` - Enhanced error handling
- `src/extension.ts` - Integrated ServerManager
- `src/inputMonitor.ts` - Added server checks before conversion
- `package.json` - Updated commands and settings
- `.vscode/settings.json` - Set correct model name

### Architecture
```
Extension Activation
    ↓
ServerManager.startMonitoring()
    ↓
Check server every 30s
    ↓
Update status bar
    ↓
On conversion trigger → Check server → Ensure running → Convert
```

---

**Status**: ✅ Ready to use!

Just make sure LM Studio is running and you're all set! 🚀

