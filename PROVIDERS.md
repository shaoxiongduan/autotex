# AutoTeX Multi-Provider Support

AutoTeX now supports multiple LLM providers, giving you flexibility in how you convert your rough drafts to LaTeX.

## Available Providers

### 1. LM Studio (Local)
**Best for**: Privacy-conscious users, offline work, no API costs

- **Type**: Local LLM server
- **Setup Required**: Install and run LM Studio
- **Cost**: Free (uses your local hardware)
- **Models**: Any model supported by LM Studio
- **Configuration**:
  ```json
  {
    "autotex.provider": "lmstudio",
    "autotex.lmStudio.apiUrl": "http://localhost:1234/v1/chat/completions",
    "autotex.lmStudio.modelName": "qwen/qwen3-4b-2507"
  }
  ```

### 2. OpenRouter
**Best for**: Access to multiple models, pay-per-use, no setup

- **Type**: Cloud API
- **Setup Required**: Get API key from [openrouter.ai](https://openrouter.ai/)
- **Cost**: Pay per token (many free models available)
- **Models**: Hundreds of models including Llama, Claude, GPT, etc.
- **Configuration**:
  ```json
  {
    "autotex.provider": "openrouter",
    "autotex.openRouter.apiKey": "your-api-key-here",
    "autotex.openRouter.modelName": "meta-llama/llama-3.1-8b-instruct:free"
  }
  ```

### 3. OpenAI
**Best for**: High-quality results, GPT models

- **Type**: Cloud API
- **Setup Required**: Get API key from [platform.openai.com](https://platform.openai.com/)
- **Cost**: Pay per token
- **Models**: GPT-4o, GPT-4o-mini, GPT-4-turbo, etc.
- **Configuration**:
  ```json
  {
    "autotex.provider": "openai",
    "autotex.openAI.apiKey": "your-api-key-here",
    "autotex.openAI.modelName": "gpt-4o-mini"
  }
  ```

## Quick Setup Guide

### Switching Providers

1. **Using Command Palette** (Recommended):
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "AutoTeX: Select Provider"
   - Choose your desired provider

2. **Using Settings**:
   - Open VS Code Settings
   - Search for "autotex.provider"
   - Select from dropdown: `lmstudio`, `openrouter`, or `openai`

### Provider-Specific Setup

#### LM Studio Setup
1. Download and install [LM Studio](https://lmstudio.ai/)
2. Download a model (recommended: Qwen 3 4B for fast performance)
3. Go to the "Developer" tab in LM Studio
4. Select your model and click "Start Server"
5. AutoTeX will detect the server automatically

#### OpenRouter Setup
1. Sign up at [openrouter.ai](https://openrouter.ai/)
2. Get your API key from the dashboard
3. Open VS Code Settings
4. Set `autotex.openRouter.apiKey` to your API key
5. (Optional) Choose a different model with `autotex.openRouter.modelName`

**Free Models on OpenRouter**:
- `meta-llama/llama-3.1-8b-instruct:free` (default)
- `google/gemini-flash-1.5`
- `mistralai/mistral-7b-instruct:free`

#### OpenAI Setup
1. Sign up at [platform.openai.com](https://platform.openai.com/)
2. Add credits to your account
3. Get your API key from the API keys section
4. Open VS Code Settings
5. Set `autotex.openAI.apiKey` to your API key
6. (Optional) Choose a different model with `autotex.openAI.modelName`

**Recommended Models**:
- `gpt-4o-mini` - Fast and affordable (default)
- `gpt-4o` - Best quality
- `gpt-4-turbo` - Good balance

## Common Settings

These settings apply to all providers:

```json
{
  "autotex.temperature": 0.3,        // Lower = more deterministic
  "autotex.maxTokens": 2048,         // Maximum response length
  "autotex.systemPrompt": "..."      // Customize the AI's behavior
}
```

## Status Bar

The status bar at the bottom right shows your current provider's status:
- `$(vm-running) Provider Name` - Provider is available
- `$(vm-outline) Provider Name` - Provider is not available (click to diagnose)
- `$(question) Provider Name` - Status unknown

## Troubleshooting

### LM Studio
- **Problem**: "Cannot connect to LM Studio"
  - **Solution**: Make sure LM Studio is running and the server is started
  - Check that the URL is correct (default: `http://localhost:1234/v1/chat/completions`)

### OpenRouter
- **Problem**: "Invalid OpenRouter API key"
  - **Solution**: Verify your API key in settings
  - Make sure you copied the entire key without spaces

- **Problem**: "Insufficient credits"
  - **Solution**: Add credits to your OpenRouter account or use a free model

### OpenAI
- **Problem**: "Invalid OpenAI API key"
  - **Solution**: Verify your API key in settings
  - Make sure your API key has the correct permissions

- **Problem**: "Rate limit exceeded"
  - **Solution**: Wait a moment before trying again
  - Consider upgrading your OpenAI plan

## Architecture

The multi-provider system is built with a clean, modular architecture:

```
providers/
├── ILLMProvider.ts          # Base interface for all providers
├── lmStudioProvider.ts      # LM Studio implementation
├── openRouterProvider.ts    # OpenRouter implementation
├── openAIProvider.ts        # OpenAI implementation
└── providerFactory.ts       # Factory for creating providers
```

### Adding a New Provider

To add support for a new provider:

1. Create a new provider class in `src/providers/`:
   ```typescript
   import { BaseProvider, ProviderConfig, ProviderStatus } from './ILLMProvider';
   
   export class MyProvider extends BaseProvider {
       getName(): string { return 'My Provider'; }
       getConfig(): ProviderConfig { /* ... */ }
       async checkAvailability(): Promise<ProviderStatus> { /* ... */ }
       async convertToLatex(text: string): Promise<string> { /* ... */ }
   }
   ```

2. Add it to the factory in `providerFactory.ts`:
   ```typescript
   case 'myprovider':
       return new MyProvider();
   ```

3. Add configuration to `package.json`:
   ```json
   {
       "autotex.provider": {
           "enum": ["lmstudio", "openrouter", "openai", "myprovider"]
       }
   }
   ```

## Best Practices

1. **For Development**: Use LM Studio for fast, free, and private development
2. **For Production**: Use OpenAI or OpenRouter for consistent, high-quality results
3. **For Budget**: Use OpenRouter with free models or LM Studio
4. **For Privacy**: Use LM Studio exclusively (all processing stays local)

## Performance Comparison

| Provider | Speed | Quality | Cost | Privacy |
|----------|-------|---------|------|---------|
| LM Studio | Fast (depends on hardware) | Good | Free | Excellent |
| OpenRouter (free) | Medium | Good | Free | Requires internet |
| OpenRouter (paid) | Fast | Excellent | Low-Medium | Requires internet |
| OpenAI | Very Fast | Excellent | Medium | Requires internet |

## API Rate Limits

- **LM Studio**: No limits (local)
- **OpenRouter**: Varies by model (see openrouter.ai)
- **OpenAI**: Depends on your plan (see platform.openai.com)

## Security Notes

- API keys are stored in VS Code settings
- Never commit API keys to version control
- Use environment variables or VS Code's secret storage for sensitive projects
- LM Studio keeps all data local (no internet required)

## Support

If you encounter any issues:
1. Check the AutoTeX output channel (View → Output → AutoTeX Provider)
2. Verify your provider's status in the status bar
3. Run "AutoTeX: Check Server Status" from the command palette
4. Review the troubleshooting section above

