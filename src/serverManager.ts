import * as vscode from 'vscode';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { ProviderFactory } from './providers/providerFactory';

const execAsync = promisify(exec);

export class ServerManager {
    private serverCheckInterval: NodeJS.Timeout | undefined;
    private isServerRunning: boolean = false;
    private statusBarItem: vscode.StatusBarItem;
    private currentProviderName: string = '';

    constructor() {
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'autotex.checkServerStatus';
        this.updateStatusBar('unknown');
        this.statusBarItem.show();
    }

    /**
     * Start monitoring the provider server/API
     */
    async startMonitoring(): Promise<void> {
        // Initial check
        await this.checkServerStatus();

        // Check every 30 seconds
        this.serverCheckInterval = setInterval(async () => {
            await this.checkServerStatus();
        }, 30000);

        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('autotex.provider')) {
                this.checkServerStatus();
            }
        });
    }

    /**
     * Check if the current provider is available
     */
    async checkServerStatus(): Promise<boolean> {
        try {
            const provider = ProviderFactory.getProvider();
            this.currentProviderName = provider.getName();
            
            const status = await provider.checkAvailability();
            
            this.isServerRunning = status.isAvailable;
            this.updateStatusBar(status.isAvailable ? 'running' : 'stopped', status.message);
            return status.isAvailable;
        } catch (error) {
            this.isServerRunning = false;
            this.updateStatusBar('stopped', 'Failed to check provider status');
            return false;
        }
    }

    /**
     * Attempt to start the LM Studio server (only applicable for LM Studio provider)
     */
    async startServer(): Promise<boolean> {
        const config = vscode.workspace.getConfiguration('autotex');
        const providerType = config.get<string>('provider', 'lmstudio');

        // Only LM Studio needs manual server start
        if (providerType !== 'lmstudio') {
            vscode.window.showInformationMessage(
                `The ${this.currentProviderName} provider doesn't require a local server.`
            );
            return await this.checkServerStatus();
        }

        const modelName = config.get<string>('lmStudio.modelName', 'qwen/qwen3-4b-2507');

        try {
            // Show progress
            return await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: 'Starting LM Studio Server...',
                    cancellable: false,
                },
                async (progress) => {
                    progress.report({ message: 'Checking for LM Studio...' });

                    // Check if LM Studio is installed (macOS)
                    const lmStudioPaths = [
                        '/Applications/LM Studio.app',
                        '~/Applications/LM Studio.app',
                    ];

                    let lmStudioPath: string | null = null;
                    for (const path of lmStudioPaths) {
                        try {
                            await execAsync(`test -d "${path}"`);
                            lmStudioPath = path;
                            break;
                        } catch {
                            continue;
                        }
                    }

                    if (!lmStudioPath) {
                        vscode.window.showErrorMessage(
                            'LM Studio not found. Please install it from https://lmstudio.ai/'
                        );
                        return false;
                    }

                    progress.report({ message: 'Opening LM Studio...' });

                    // Open LM Studio
                    await execAsync(`open -a "LM Studio"`);

                    // Wait a bit for the app to start
                    await new Promise((resolve) => setTimeout(resolve, 3000));

                    progress.report({ message: 'Waiting for server to start...' });

                    // Try to start server via CLI (if LM Studio supports it)
                    // Note: This is a placeholder - LM Studio may not have CLI support
                    // Users will need to manually start the server in the app
                    
                    // Wait and check if server is running
                    for (let i = 0; i < 10; i++) {
                        await new Promise((resolve) => setTimeout(resolve, 2000));
                        if (await this.checkServerStatus()) {
                            vscode.window.showInformationMessage('LM Studio server is running!');
                            return true;
                        }
                    }

                    // Server didn't start automatically
                    const action = await vscode.window.showWarningMessage(
                        'LM Studio is open, but the server is not running. Please start it manually:\n' +
                        '1. Go to the "Developer" tab in LM Studio\n' +
                        `2. Select the "${modelName}" model\n` +
                        '3. Click "Start Server"',
                        'I Started It',
                        'Cancel'
                    );

                    if (action === 'I Started It') {
                        // Check again
                        for (let i = 0; i < 5; i++) {
                            await new Promise((resolve) => setTimeout(resolve, 1000));
                            if (await this.checkServerStatus()) {
                                vscode.window.showInformationMessage('Server connected!');
                                return true;
                            }
                        }
                    }

                    return false;
                }
            );
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to start LM Studio: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
            return false;
        }
    }

    /**
     * Ensure provider is available, start it if needed (for LM Studio)
     */
    async ensureServerRunning(): Promise<boolean> {
        if (this.isServerRunning) {
            return true;
        }

        const isRunning = await this.checkServerStatus();
        if (isRunning) {
            return true;
        }

        const config = vscode.workspace.getConfiguration('autotex');
        const providerType = config.get<string>('provider', 'lmstudio');

        // For API-based providers, just show the configuration error
        if (providerType === 'openrouter' || providerType === 'openai') {
            const providerName = providerType === 'openrouter' ? 'OpenRouter' : 'OpenAI';
            const settingName = providerType === 'openrouter' ? 'autotex.openRouter.apiKey' : 'autotex.openAI.apiKey';
            
            const action = await vscode.window.showErrorMessage(
                `${providerName} is not configured or unavailable. Please check your API key and settings.`,
                'Open Settings',
                'Cancel'
            );

            if (action === 'Open Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', settingName);
            }
            return false;
        }

        // For LM Studio, ask if they want to start the server
        const action = await vscode.window.showWarningMessage(
            'LM Studio server is not running. Would you like to start it?',
            'Start Server',
            'Start Manually',
            'Cancel'
        );

        if (action === 'Start Server') {
            return await this.startServer();
        } else if (action === 'Start Manually') {
            const modelName = config.get<string>('lmStudio.modelName', 'qwen/qwen3-4b-2507');
            
            vscode.window.showInformationMessage(
                'Please start LM Studio manually:\n' +
                '1. Open LM Studio\n' +
                '2. Go to the "Developer" tab\n' +
                `3. Select the "${modelName}" model\n` +
                '4. Click "Start Server"'
            );
            return false;
        }

        return false;
    }

    /**
     * Update status bar item
     */
    private updateStatusBar(status: 'running' | 'stopped' | 'unknown', message?: string): void {
        const providerName = this.currentProviderName || 'AutoTeX';
        
        switch (status) {
            case 'running':
                this.statusBarItem.text = `$(vm-running) ${providerName}`;
                this.statusBarItem.tooltip = message || `${providerName} is available`;
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'stopped':
                this.statusBarItem.text = `$(vm-outline) ${providerName}`;
                this.statusBarItem.tooltip = message || `${providerName} is not available (click to check)`;
                this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.warningBackground'
                );
                break;
            case 'unknown':
                this.statusBarItem.text = `$(question) ${providerName}`;
                this.statusBarItem.tooltip = message || `${providerName} status unknown`;
                this.statusBarItem.backgroundColor = undefined;
                break;
        }
    }

    /**
     * Get server running status
     */
    getServerStatus(): boolean {
        return this.isServerRunning;
    }

    /**
     * Dispose resources
     */
    dispose(): void {
        if (this.serverCheckInterval) {
            clearInterval(this.serverCheckInterval);
        }
        this.statusBarItem.dispose();
    }
}

