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
 * OpenAI provider implementation
 * https://platform.openai.com/docs/api-reference/chat
 */
export class OpenAIProvider extends BaseProvider {
    constructor() {
        super('AutoTeX - OpenAI');
    }

    getName(): string {
        return 'OpenAI';
    }

    getConfig(): ProviderConfig {
        const config = vscode.workspace.getConfiguration('autotex');
        return {
            apiUrl: config.get<string>('openAI.apiUrl', 'https://api.openai.com/v1/chat/completions'),
            apiKey: config.get<string>('openAI.apiKey', ''),
            modelName: config.get<string>('openAI.modelName', 'gpt-4o-mini'),
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
            this.logError('OpenAI API key is not configured');
            return {
                isAvailable: false,
                message: 'OpenAI API key is not configured. Please set autotex.openAI.apiKey in settings.',
            };
        }

        try {
            // Try a simple request to verify the API key
            await axios.get('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                },
                timeout: 5000,
            });
            
            this.log('OpenAI API is available');
            return {
                isAvailable: true,
                message: 'OpenAI API is configured and available',
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.response?.status === 401) {
                    this.logError('OpenAI API key is invalid', error);
                    return {
                        isAvailable: false,
                        message: 'Invalid OpenAI API key. Please check your configuration.',
                    };
                }
            }
            this.logError('OpenAI API is not available', error);
            return {
                isAvailable: false,
                message: 'Cannot connect to OpenAI API. Please check your internet connection.',
            };
        }
    }

    async convertToLatex(roughDraftText: string): Promise<string> {
        const config = this.getConfig();

        if (!config.apiKey || config.apiKey.trim() === '') {
            throw new Error('OpenAI API key is not configured. Please set autotex.openAI.apiKey in settings.');
        }

        const apiUrl = config.apiUrl || 'https://api.openai.com/v1/chat/completions';

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

        this.log(`Converting text using OpenAI (model: ${config.modelName})`);

        try {
            const response = await axios.post<ChatCompletionResponse>(
                apiUrl,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${config.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: config.timeout || 60000,
                }
            );

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from OpenAI');
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
                        throw new Error('Invalid OpenAI API key. Please check your configuration.');
                    } else if (status === 429) {
                        throw new Error('Rate limit exceeded or insufficient quota. Please check your OpenAI account.');
                    } else if (status === 400) {
                        throw new Error(
                            `Invalid request to OpenAI: ${JSON.stringify(data)}`
                        );
                    } else if (status === 500 || status === 503) {
                        throw new Error(
                            `OpenAI service error: ${JSON.stringify(data)}. Please try again later.`
                        );
                    } else {
                        throw new Error(
                            `OpenAI API error: ${status} - ${JSON.stringify(data)}`
                        );
                    }
                } else if (axiosError.request) {
                    throw new Error('No response from OpenAI. Please check your internet connection.');
                } else {
                    throw new Error(`Request failed: ${axiosError.message}`);
                }
            }
            throw error;
        }
    }
}

