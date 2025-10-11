import * as vscode from 'vscode';
import { ILLMProvider } from './ILLMProvider';
import { LMStudioProvider } from './lmStudioProvider';
import { OpenRouterProvider } from './openRouterProvider';
import { OpenAIProvider } from './openAIProvider';

/**
 * Supported LLM provider types
 */
export type ProviderType = 'lmstudio' | 'openrouter' | 'openai';

/**
 * Factory for creating LLM provider instances
 */
export class ProviderFactory {
    private static currentProvider: ILLMProvider | undefined;
    private static currentProviderType: ProviderType | undefined;

    /**
     * Create or get the current provider based on configuration
     */
    static getProvider(): ILLMProvider {
        const config = vscode.workspace.getConfiguration('autotex');
        const providerType = config.get<ProviderType>('provider', 'lmstudio');

        // If the provider type has changed, dispose the old provider and create a new one
        if (this.currentProviderType !== providerType) {
            if (this.currentProvider && this.currentProvider.dispose) {
                this.currentProvider.dispose();
            }
            this.currentProvider = this.createProvider(providerType);
            this.currentProviderType = providerType;
        }

        // If no current provider exists, create one
        if (!this.currentProvider) {
            this.currentProvider = this.createProvider(providerType);
            this.currentProviderType = providerType;
        }

        return this.currentProvider;
    }

    /**
     * Create a new provider instance
     */
    private static createProvider(providerType: ProviderType): ILLMProvider {
        switch (providerType) {
            case 'lmstudio':
                return new LMStudioProvider();
            case 'openrouter':
                return new OpenRouterProvider();
            case 'openai':
                return new OpenAIProvider();
            default:
                // Default to LM Studio
                vscode.window.showWarningMessage(
                    `Unknown provider type: ${providerType}. Falling back to LM Studio.`
                );
                return new LMStudioProvider();
        }
    }

    /**
     * Dispose the current provider
     */
    static dispose(): void {
        if (this.currentProvider && this.currentProvider.dispose) {
            this.currentProvider.dispose();
        }
        this.currentProvider = undefined;
        this.currentProviderType = undefined;
    }

    /**
     * Get all available provider types
     */
    static getAvailableProviders(): Array<{ id: ProviderType; name: string; description: string }> {
        return [
            {
                id: 'lmstudio',
                name: 'LM Studio',
                description: 'Local LLM server running on your machine',
            },
            {
                id: 'openrouter',
                name: 'OpenRouter',
                description: 'Access to multiple models via OpenRouter API',
            },
            {
                id: 'openai',
                name: 'OpenAI',
                description: 'OpenAI GPT models (requires API key)',
            },
        ];
    }
}

