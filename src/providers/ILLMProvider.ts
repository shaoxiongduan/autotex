import * as vscode from 'vscode';

/**
 * Configuration for an LLM provider
 */
export interface ProviderConfig {
    apiUrl?: string;
    apiKey?: string;
    modelName: string;
    temperature: number;
    maxTokens: number;
    systemPrompt: string;
    timeout?: number;
}

/**
 * Status of a provider
 */
export interface ProviderStatus {
    isAvailable: boolean;
    message?: string;
}

/**
 * Base interface for all LLM providers
 */
export interface ILLMProvider {
    /**
     * Get the provider name (e.g., "LM Studio", "OpenRouter", "OpenAI")
     */
    getName(): string;

    /**
     * Check if the provider is available and properly configured
     */
    checkAvailability(): Promise<ProviderStatus>;

    /**
     * Convert rough draft text to LaTeX using the provider's LLM
     */
    convertToLatex(roughDraftText: string): Promise<string>;

    /**
     * Get the provider configuration from VS Code settings
     */
    getConfig(): ProviderConfig;

    /**
     * Dispose any resources used by the provider
     */
    dispose?(): void;
}

/**
 * Abstract base class with common functionality for all providers
 */
export abstract class BaseProvider implements ILLMProvider {
    protected outputChannel: vscode.OutputChannel;

    constructor(outputChannelName?: string) {
        this.outputChannel = vscode.window.createOutputChannel(
            outputChannelName || 'AutoTeX Provider'
        );
    }

    abstract getName(): string;
    abstract checkAvailability(): Promise<ProviderStatus>;
    abstract convertToLatex(roughDraftText: string): Promise<string>;
    abstract getConfig(): ProviderConfig;

    protected log(message: string): void {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] ${message}`);
    }

    protected logError(message: string, error?: any): void {
        this.outputChannel.appendLine(`[${new Date().toISOString()}] ERROR: ${message}`);
        if (error) {
            this.outputChannel.appendLine(JSON.stringify(error, null, 2));
        }
    }

    dispose(): void {
        this.outputChannel.dispose();
    }
}

