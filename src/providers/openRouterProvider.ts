import * as vscode from 'vscode';
import axios, { AxiosError } from 'axios';
import { BaseProvider, ProviderConfig, ProviderStatus } from './ILLMProvider';

interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface ChatCompletionRequest {
    model: string;
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;
}

interface ChatCompletionResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

/**
 * OpenRouter provider implementation
 * https://openrouter.ai/docs
 */
export class OpenRouterProvider extends BaseProvider {
    constructor() {
        super('AutoTeX - OpenRouter');
    }

    getName(): string {
        return 'OpenRouter';
    }

    getConfig(): ProviderConfig {
        const config = vscode.workspace.getConfiguration('autotex');
        return {
            apiUrl: config.get<string>('openRouter.apiUrl', 'https://openrouter.ai/api/v1/chat/completions'),
            apiKey: config.get<string>('openRouter.apiKey', ''),
            modelName: config.get<string>('openRouter.modelName', 'meta-llama/llama-3.1-8b-instruct:free'),
            temperature: config.get<number>('temperature', 0.3),
            maxTokens: config.get<number>('maxTokens', 2048),
            systemPrompt: config.get<string>('systemPrompt', 
                'Convert rough draft text into compilable LaTeX code. Infer the content type (equation, pseudocode, plain text, code block, etc.) and apply the appropriate LaTeX syntax and environments. Formalize rough or incomplete notation into proper LaTeX while preserving all values and meanings—never change numerical values, variable names, or remove elements, even if they appear incorrect. Add minimal formatting only when necessary for readability.\nOutput only the LaTeX content itself—do not include document preamble, \\documentclass, \\usepackage, \\begin{document}, or \\end{document} tags. Provide only the code that would appear in the document body.'
            ),
            timeout: 60000, // 1 minute timeout
        };
    }

    async checkAvailability(): Promise<ProviderStatus> {
        const config = this.getConfig();

        if (!config.apiKey || config.apiKey.trim() === '') {
            this.logError('OpenRouter API key is not configured');
            return {
                isAvailable: false,
                message: 'OpenRouter API key is not configured. Please set autotex.openRouter.apiKey in settings.',
            };
        }

        try {
            // Try a simple request to verify the API key
            await axios.get('https://openrouter.ai/api/v1/models', {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: 5000,
            });
            
            this.log('OpenRouter API is available');
            return {
                isAvailable: true,
                message: 'OpenRouter API is configured and available',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401) {
                    this.logError('OpenRouter API key is invalid', error);
                    return {
                        isAvailable: false,
                        message: 'Invalid OpenRouter API key. Please check your configuration.',
                    };
                }
            }
            this.logError('OpenRouter API is not available', error);
            return {
                isAvailable: false,
                message: 'Cannot connect to OpenRouter API. Please check your internet connection.',
            };
        }
    }

    async convertToLatex(roughDraftText: string): Promise<string> {
        const config = this.getConfig();

        if (!config.apiKey || config.apiKey.trim() === '') {
            throw new Error('OpenRouter API key is not configured. Please set autotex.openRouter.apiKey in settings.');
        }

        const apiUrl = config.apiUrl || 'https://openrouter.ai/api/v1/chat/completions';

        const requestData: ChatCompletionRequest = {
            model: config.modelName,
            messages: [
                {
                    role: 'system',
                    content: config.systemPrompt,
                },
                {
                    role: 'user',
                    content: roughDraftText,
                },
            ],
            temperature: config.temperature,
            max_tokens: config.maxTokens,
        };

        this.log(`Converting text using OpenRouter (model: ${config.modelName})`);

        try {
            const response = await axios.post<ChatCompletionResponse>(
                apiUrl,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'https://github.com/autotex', // Optional: for OpenRouter analytics
                        'X-Title': 'AutoTeX VS Code Extension', // Optional: for OpenRouter analytics
                    },
                    timeout: config.timeout || 60000,
                }
            );

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from OpenRouter');
            }

            const latexCode = response.data.choices[0].message.content.trim();
            this.log('Successfully converted text to LaTeX');
            return latexCode;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
                    throw new Error(
                        'Request timed out. The model may be taking too long to respond.'
                    );
                } else if (axiosError.response) {
                    const status = axiosError.response.status;
                    const data = axiosError.response.data;
                    
                    if (status === 401) {
                        throw new Error('Invalid OpenRouter API key. Please check your configuration.');
                    } else if (status === 402) {
                        throw new Error('Insufficient credits in your OpenRouter account.');
                    } else if (status === 429) {
                        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
                    } else if (status === 400) {
                        throw new Error(
                            `Invalid request to OpenRouter: ${JSON.stringify(data)}`
                        );
                    } else if (status === 500 || status === 503) {
                        throw new Error(
                            `OpenRouter service error: ${JSON.stringify(data)}. Please try again later.`
                        );
                    } else {
                        throw new Error(
                            `OpenRouter API error: ${status} - ${JSON.stringify(data)}`
                        );
                    }
                } else if (axiosError.request) {
                    throw new Error('No response from OpenRouter. Please check your internet connection.');
                } else {
                    throw new Error(`Request failed: ${axiosError.message}`);
                }
            }
            throw error;
        }
    }
}

