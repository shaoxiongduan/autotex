# Troubleshooting

Common issues and how to fix them.

## Connection Issues

### "Cannot connect to LM Studio"

**Cause**: LM Studio server is not running or not accessible.

**Solutions**:

1. **Check if server is running**:
   - Open LM Studio
   - Go to **Developer** tab
   - Look for "Server running on http://localhost:1234"
   - If not running, click **Start Server**

2. **Verify port**:
   - LM Studio should use port 1234 (default)
   - Check VS Code settings: `autotex.lmStudio.apiUrl`
   - Should be: `http://localhost:1234/v1/chat/completions`

3. **Test connection manually**:
   ```bash
   curl http://localhost:1234/v1/models
   ```
   Should return model information. If not, LM Studio isn't responding.

4. **Firewall issues**:
   - Check if firewall is blocking localhost:1234
   - Try temporarily disabling firewall
   - Add exception for LM Studio

5. **Port conflict**:
   - Another application might be using port 1234
   - In LM Studio, change to different port (e.g., 1235)
   - Update `autotex.lmStudio.apiUrl` accordingly

### "OpenRouter API key invalid"

**Cause**: API key is incorrect or missing.

**Solutions**:

1. **Verify API key**:
   - Go to [openrouter.ai/keys](https://openrouter.ai/keys)
   - Check your key is active
   - Copy it exactly (no spaces, complete string)

2. **Check VS Code settings**:
   - Open Settings → Search "AutoTeX"
   - Find `autotex.openRouter.apiKey`
   - Paste key (starts with `sk-or-v1-`)
   - No quotes needed in UI, quotes needed in JSON

3. **Regenerate key**:
   - Delete old key in OpenRouter dashboard
   - Create new key
   - Update VS Code settings

### "OpenAI authentication failed"

**Cause**: API key is incorrect or account has no credits.

**Solutions**:

1. **Verify API key**:
   - Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
   - Keys start with `sk-proj-` or `sk-`
   - Create new key if needed (old ones can't be viewed again)

2. **Check billing**:
   - Go to [platform.openai.com/account/billing](https://platform.openai.com/account/billing)
   - Ensure you have credits or payment method
   - New accounts might need to add credits first

3. **Rate limits**:
   - New accounts have lower rate limits
   - Wait a few minutes between requests
   - Check [platform.openai.com/account/rate-limits](https://platform.openai.com/account/rate-limits)

---

## Detection Issues

### "No drafts detected"

**Cause**: Draft detection can't find any rough draft sections.

**Solutions**:

1. **Save your document first**:
   - Press `Ctrl+S` / `Cmd+S`
   - Draft detection compares with saved state
   - Type new content after saving

2. **Check detection method**:
   ```json
   {
     "autotex.draftDetectionMethod": "both"
   }
   ```
   Try "both" for maximum detection.

3. **Lower confidence threshold**:
   ```json
   {
     "autotex.minDraftConfidence": 0.3
   }
   ```
   Lower threshold = more drafts detected.

4. **Use manual blocks**:
   ````
   ```autotex
   Your draft content here
   ```
   ````
   Manual blocks always work, regardless of detection.

5. **Check highlighting is enabled**:
   ```json
   {
     "autotex.highlightDrafts": true
   }
   ```

### "False positives" (LaTeX detected as draft)

**Cause**: Confidence scoring too aggressive.

**Solutions**:

1. **Increase threshold**:
   ```json
   {
     "autotex.minDraftConfidence": 0.6
   }
   ```
   Higher = fewer false positives.

2. **Use diff-only detection**:
   ```json
   {
     "autotex.draftDetectionMethod": "diff"
   }
   ```
   More accurate than heuristic for existing documents.

3. **Save frequently**:
   - Save after writing LaTeX
   - AutoTeX won't mark saved content as new

4. **Check Debug Panel**:
   - `AutoTeX: Show Debug Panel`
   - See why text was marked as draft
   - Adjust settings based on factors shown

### Highlighting not showing

**Cause**: Highlighting disabled or color too subtle.

**Solutions**:

1. **Enable highlighting**:
   ```json
   {
     "autotex.highlightDrafts": true
   }
   ```

2. **Try different color**:
   ```json
   {
     "autotex.draftHighlightColor": "yellow"
   }
   ```

3. **Customize colors**:
   ```json
   {
     "workbench.colorCustomizations": {
       "autotex.draftBackground": "#00ff0050"  // Brighter green
     }
   }
   ```

4. **Check theme compatibility**:
   - Some themes override colors
   - Try with default VS Code theme

---

## Conversion Issues

### Conversion takes too long

**Cause**: Model is slow, or API has high latency.

**Solutions**:

**For LM Studio**:
1. Use smaller model (e.g., 4B parameters instead of 7B)
2. Close other memory-intensive applications
3. Reduce `maxTokens`:
   ```json
   {
     "autotex.maxTokens": 1024
   }
   ```

**For Cloud Providers**:
1. Check internet connection
2. Try faster model:
   - OpenRouter: Use `:free` models
   - OpenAI: Use `gpt-4o-mini` instead of `gpt-4o`
3. Check provider status page

**General**:
- Convert smaller sections at a time
- Use manual blocks for specific sections
- Enable debug panel to see what's taking time

### Conversion produces incorrect LaTeX

**Cause**: Model doesn't understand your input or prompt isn't clear.

**Solutions**:

1. **Try different model**:
   - LM Studio: Try Qwen or Mistral models
   - OpenRouter: Try Claude or GPT models
   - OpenAI: Use `gpt-4o` for better quality

2. **Improve your draft**:
   - Be more explicit: "solve for x" → "solve the equation for x"
   - Add context: "using quadratic formula"
   - Use proper terminology

3. **Customize system prompt**:
   ```json
   {
     "autotex.systemPrompt": "Convert to LaTeX. For equations, use align environment. For algorithms, use algorithmic package syntax. Preserve all variable names exactly."
   }
   ```

4. **Adjust temperature**:
   ```json
   {
     "autotex.temperature": 0.1  // More consistent
   }
   ```

5. **Manual correction**:
   - Use `Ctrl+Z` / `Cmd+Z` to undo
   - Edit the draft to be clearer
   - Try conversion again

### "Conversion failed" error

**Cause**: API error, network issue, or malformed response.

**Solutions**:

1. **Check error message**:
   - Read the notification carefully
   - Shows specific error from provider

2. **Common errors**:
   - "Model not found": Check model name in settings
   - "Rate limit exceeded": Wait and retry
   - "Invalid request": Check API URL in settings

3. **View debug logs**:
   - `AutoTeX: Show Debug Panel`
   - Check "Last Error" section
   - Look for API response details

4. **Test provider connection**:
   - `AutoTeX: Check Server Status` (LM Studio)
   - Verify API keys are correct
   - Try provider's website to confirm service is up

---

## Performance Issues

### VS Code becomes slow/unresponsive

**Cause**: AutoTeX is consuming too many resources.

**Solutions**:

1. **Disable automatic detection**:
   ```json
   {
     "autotex.automaticDraftDetection": false
   }
   ```
   Reduces real-time processing.

2. **Disable highlighting**:
   ```json
   {
     "autotex.highlightDrafts": false
   }
   ```
   Reduces rendering load.

3. **Use manual blocks only**:
   ```json
   {
     "autotex.manualDraftBlocks": true,
     "autotex.draftDetectionMethod": "heuristic"
   }
   ```
   Only process when explicitly marked.

4. **Limit file types**:
   ```json
   {
     "autotex.enabledFileTypes": ["latex"]
   }
   ```
   Don't run on every file.

### High memory usage

**Cause**: Large document or many draft sections.

**Solutions**:

1. **Split large documents**:
   - Use `\input{section.tex}` for modular documents
   - Convert sections individually

2. **Clear detection cache**:
   - Save document
   - Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")

3. **Reduce history**:
   - AutoTeX keeps conversion history
   - Restart VS Code to clear

---

## Keybinding Issues

### "Shift+Shift doesn't work"

**Cause**: Keybinding conflict or timing too strict.

**Solutions**:

1. **Check keybinding conflicts**:
   - Open Keyboard Shortcuts (`Ctrl+K Ctrl+S`)
   - Search for `shift shift`
   - Look for conflicts

2. **Use command palette instead**:
   - `Ctrl+Shift+P` / `Cmd+Shift+P`
   - Type "AutoTeX: Convert All Drafts"

3. **Change keybinding**:
   ```json
   {
     "key": "ctrl+alt+l",
     "command": "autotex.convertAllDrafts",
     "when": "editorTextFocus"
   }
   ```


## Installation Issues

### "Extension not found" when installing VSIX

**Cause**: VSIX file is corrupted or wrong VS Code version.

**Solutions**:

1. **Check VS Code version**:
   - Help → About
   - Needs 1.85.0 or higher
   - Update VS Code if needed

2. **Re-download VSIX**:
   - Download might have been interrupted
   - Verify file size is reasonable (>100KB)

3. **Install via command line**:
   ```bash
   code --install-extension autotex-0.0.1.vsix
   ```

### Build fails when compiling from source

**Cause**: Missing dependencies or wrong Node version.

**Solutions**:

1. **Check Node version**:
   ```bash
   node --version  # Should be v18 or higher
   ```

2. **Clean install**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run compile
   ```

3. **Check for errors**:
   - Read compile error messages
   - Usually indicates missing dependencies
   - Run `npm install` again

---

## Getting More Help

### Debug Panel

**Best tool for troubleshooting**:

1. `Ctrl+Shift+P` / `Cmd+Shift+P`
2. Type "AutoTeX: Show Debug Panel"
3. View:
   - Current provider and settings
   - Detected draft sections
   - Last error messages
   - Confidence score breakdowns

### Enable Developer Tools

For deep debugging:

1. Help → Toggle Developer Tools
2. Go to Console tab
3. Look for AutoTeX logs
4. Check for JavaScript errors

### Report an Issue

If problem persists:

1. Go to [GitHub Issues](https://github.com/yourusername/autotex/issues)
2. Search for similar issues
3. If not found, create new issue with:
   - VS Code version
   - AutoTeX version
   - Provider used
   - Steps to reproduce
   - Error messages from Debug Panel
   - Logs from Developer Tools

### Community Support

- [GitHub Discussions](https://github.com/yourusername/autotex/discussions)
- Include relevant settings (without API keys!)
- Share example draft that fails to convert

