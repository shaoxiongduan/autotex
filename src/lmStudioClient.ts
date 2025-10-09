import * as vscode from 'vscode';
import axios, { AxiosError } from 'axios';

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

export class LMStudioClient {
    /**
     * Convert rough draft text to LaTeX using LM Studio
     */
    async convertToLatex(roughDraftText: string): Promise<string> {
        const config = vscode.workspace.getConfiguration('autotex');
        const apiUrl = config.get<string>('lmStudioUrl', 'http://localhost:1234/v1/chat/completions');
        const modelName = config.get<string>('modelName', 'qwen/qwen3-4b-2507');
        const temperature = config.get<number>('temperature', 0.3);
        const maxTokens = config.get<number>('maxTokens', 2048);
        const systemPrompt = config.get<string>('systemPrompt', 
            'Convert rough draft text into compilable LaTeX code. Infer the content type (equation, pseudocode, plain text, code block, etc.) and apply the appropriate LaTeX syntax and environments. Formalize rough or incomplete notation into proper LaTeX while preserving all values and meanings—never change numerical values, variable names, or remove elements, even if they appear incorrect. Add minimal formatting only when necessary for readability.\nOutput only the LaTeX content itself—do not include document preamble, \\documentclass, \\usepackage, \\begin{document}, or \\end{document} tags. Provide only the code that would appear in the document body.'
        );

        const requestData: ChatCompletionRequest = {
            model: modelName,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'user',
                    content: roughDraftText,
                },
            ],
            temperature: temperature,
            max_tokens: maxTokens,
        };

        try {
            const response = await axios.post<ChatCompletionResponse>(
                apiUrl,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 120000, // 2 minute timeout
                }
            );

            if (!response.data.choices || response.data.choices.length === 0) {
                throw new Error('No response from LM Studio');
            }

            const latexCode = response.data.choices[0].message.content.trim();
            return latexCode;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const axiosError = error as AxiosError;
                if (axiosError.code === 'ECONNREFUSED') {
                    throw new Error(
                        'Cannot connect to LM Studio. The server is not running. Please start it in the Developer tab.'
                    );
                } else if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
                    throw new Error(
                        'Request timed out. The model may be taking too long to respond. Try a smaller model or increase timeout.'
                    );
                } else if (axiosError.response) {
                    const status = axiosError.response.status;
                    const data = axiosError.response.data;
                    
                    if (status === 404) {
                        throw new Error(
                            `Model "${modelName}" not found. Please check that the model is loaded in LM Studio.`
                        );
                    } else if (status === 500) {
                        throw new Error(
                            `LM Studio internal error: ${JSON.stringify(data)}. Try restarting the server.`
                        );
                    } else {
                        throw new Error(
                            `LM Studio API error: ${status} - ${JSON.stringify(data)}`
                        );
                    }
                } else if (axiosError.request) {
                    throw new Error('No response from LM Studio. Please check your network connection and server status.');
                } else {
                    throw new Error(`Request failed: ${axiosError.message}`);
                }
            }
            throw error;
        }
    }

    /**
     * Test the connection to LM Studio
     */
    async testConnection(): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('autotex');
        const apiUrl = config.get<string>('lmStudioUrl', 'http://localhost:1234/v1/chat/completions');

        try {
            // Try a simple request
            await axios.post(
                apiUrl,
                {
                    model: 'test',
                    messages: [{ role: 'user', content: 'test' }],
                    max_tokens: 1,
                },
                {
                    timeout: 5000,
                }
            );
            return true;
        } catch (error) {
            return false;
        }
    }
}

