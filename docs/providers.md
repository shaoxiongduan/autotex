# Provider Configuration

AutoTeX supports three AI providers. This guide covers detailed setup for each.

## LM Studio (Local)

LM Studio runs AI models locally on your machine. Best for privacy and offline work.

### Installation

1. Download from [lmstudio.ai](https://lmstudio.ai/)
2. Install the application
3. Launch LM Studio

### Model Selection

**Recommended Models**:
- `qwen/qwen3-4b-2507` - Fast, good for LaTeX (4GB RAM)
- `microsoft/Phi-3-mini-4k-instruct` - Compact, decent quality (3GB RAM)
- `mistralai/Mistral-7B-Instruct-v0.2` - Better quality, slower (8GB RAM)

**To Download a Model**:
1. Go to the **Search** tab in LM Studio
2. Search for model name (e.g., "qwen 3 4b")
3. Click **Download**
4. Wait for download to complete

### Starting the Server

1. Go to the **Developer** tab
2. Select your downloaded model from the dropdown
3. Click **Start Server**
4. Verify it says "Server running on http://localhost:1234"

### VS Code Configuration

```json
{
  "autotex.provider": "lmstudio",
  "autotex.lmStudio.apiUrl": "http://localhost:1234/v1/chat/completions",
  "autotex.lmStudio.modelName": "qwen/qwen3-4b-2507"
}
```

**Note**: The `modelName` should match what's shown in LM Studio's model list.

### Troubleshooting

**Server won't start**:
- Make sure no other application is using port 1234
- Try restarting LM Studio
- Check if model is fully downloaded

**Connection refused**:
- Verify server is running in LM Studio (Developer tab)
- Check firewall isn't blocking localhost:1234
- Try running `curl http://localhost:1234/v1/models` in terminal

**Slow responses**:
- Use a smaller model (4B parameters or less)
- Close other memory-intensive applications
- Reduce `autotex.maxTokens` in settings

---

## OpenRouter (Cloud)

OpenRouter provides access to multiple AI models through a single API, including free options.

### Setup

1. Visit [openrouter.ai](https://openrouter.ai/)
2. Click **Sign In** (supports GitHub, Google)
3. Go to **Keys** page
4. Click **Create Key**
5. Name your key (e.g., "AutoTeX")
6. Copy the generated API key

### Model Selection

**Free Models** (no cost):
- `meta-llama/llama-3.1-8b-instruct:free` - Fast, good quality
- `google/gemma-2-9b-it:free` - Google's model
- `mistralai/mistral-7b-instruct:free` - Mistral AI

**Paid Models** (better quality):
- `anthropic/claude-3.5-sonnet` - Best quality (~$0.003/1K tokens)
- `openai/gpt-4-turbo` - OpenAI via OpenRouter
- `google/gemini-pro-1.5` - Google's latest

Browse all models at [openrouter.ai/models](https://openrouter.ai/models)

### VS Code Configuration

```json
{
  "autotex.provider": "openrouter",
  "autotex.openRouter.apiKey": "sk-or-v1-xxxxx",
  "autotex.openRouter.modelName": "meta-llama/llama-3.1-8b-instruct:free",
  "autotex.openRouter.apiUrl": "https://openrouter.ai/api/v1/chat/completions"
}
```

### Cost Management

- **Free tier**: Some models are completely free (labeled `:free`)
- **Paid tier**: Add credits at [openrouter.ai/credits](https://openrouter.ai/credits)
- **Monitor usage**: Check usage stats in your OpenRouter dashboard

### Troubleshooting

**Authentication failed**:
- Verify API key is correct (starts with `sk-or-v1-`)
- Check key isn't expired in OpenRouter dashboard
- No spaces before/after key in settings

**Rate limited**:
- Free models have rate limits
- Wait a minute and try again
- Consider upgrading to paid models

**Model not found**:
- Check exact model name at [openrouter.ai/models](https://openrouter.ai/models)
- Model names are case-sensitive
- Some models require credits even if not marked `:free`

---

## OpenAI (Cloud)

Direct access to OpenAI's GPT models. Highest quality but costs money.

### Setup

1. Visit [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **Create new secret key**
5. Name it (e.g., "AutoTeX")
6. Copy the key (shown only once!)
7. Add credits: Go to **Billing** → **Add payment method**

### Model Selection

**Recommended**:
- `gpt-4o-mini` - Fast, cheap, good quality (~$0.15/1M tokens)
- `gpt-4o` - Better quality (~$2.50/1M tokens)
- `gpt-4-turbo` - High quality, slower (~$10/1M tokens)

### VS Code Configuration

```json
{
  "autotex.provider": "openai",
  "autotex.openAI.apiKey": "sk-proj-xxxxx",
  "autotex.openAI.modelName": "gpt-4o-mini",
  "autotex.openAI.apiUrl": "https://api.openai.com/v1/chat/completions"
}
```

### Cost Estimation

Typical LaTeX conversion uses ~200-500 tokens per draft.

**Example costs with gpt-4o-mini**:
- 100 conversions ≈ 50,000 tokens ≈ $0.0075
- 1,000 conversions ≈ 500,000 tokens ≈ $0.075

Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)

### Troubleshooting

**Incorrect API key**:
- Verify key starts with `sk-proj-` or `sk-`
- Generate a new key if lost (old one can't be recovered)
- Check project restrictions if using project keys

**Insufficient quota**:
- Add credits in Billing section
- New accounts may have spending limits

**Model access denied**:
- Some models require higher usage tiers
- Stick to `gpt-4o-mini` or `gpt-3.5-turbo` for guaranteed access

---

## Switching Providers

You can switch providers anytime using the command palette:

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`
2. Type `AutoTeX: Select Provider`
3. Choose from the list
4. Configure the new provider's settings

Or change directly in settings:

```json
{
  "autotex.provider": "lmstudio"  // or "openrouter" or "openai"
}
```

---

## Advanced Configuration

### Custom API Endpoints

All providers support custom endpoints for compatibility:

```json
{
  "autotex.lmStudio.apiUrl": "http://custom-server:8000/v1/chat/completions",
  "autotex.openRouter.apiUrl": "https://custom-proxy.com/api/v1/chat/completions",
  "autotex.openAI.apiUrl": "https://custom-openai-api.com/v1/chat/completions"
}
```

### Temperature & Token Settings

Control AI behavior:

```json
{
  "autotex.temperature": 0.3,  // Lower = more deterministic (0.0-1.0)
  "autotex.maxTokens": 2048     // Max response length
}
```

**Recommendations**:
- LaTeX conversion: `temperature: 0.2-0.3` (deterministic)
- Creative writing: `temperature: 0.7-0.9` (varied)

### Custom System Prompt

Customize how AI converts your drafts:

```json
{
  "autotex.systemPrompt": "Convert to LaTeX. Use align environment for equations. Include comments explaining each step."
}
```

See [Configuration](configuration.md) for the default prompt.

