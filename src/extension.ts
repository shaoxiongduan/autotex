import * as vscode from 'vscode';
import { InputMonitor } from './inputMonitor';
import { DocumentStateManager } from './documentStateManager';
import { ProviderFactory } from './providers/providerFactory';
import { TextReplacer } from './textReplacer';
import { AutoSaveManager } from './autoSaveManager';
import { ServerManager } from './serverManager';
import { DebugPanel } from './debugPanel';

let inputMonitor: InputMonitor | undefined;
let documentStateManager: DocumentStateManager;
let textReplacer: TextReplacer;
let autoSaveManager: AutoSaveManager;
let serverManager: ServerManager;
let debugPanel: DebugPanel;

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoTeX extension is now active');

    // Initialize services
    documentStateManager = new DocumentStateManager();
    textReplacer = new TextReplacer();
    autoSaveManager = new AutoSaveManager();
    serverManager = new ServerManager();
    debugPanel = new DebugPanel(context);

    // Start server monitoring
    serverManager.startMonitoring();

    // Initialize input monitor
    inputMonitor = new InputMonitor(
        documentStateManager,
        textReplacer,
        autoSaveManager,
        serverManager
    );

    // Connect debug panel to input monitor
    inputMonitor.setDebugPanel(debugPanel);

    // Register commands
    const convertCommand = vscode.commands.registerCommand(
        'autotex.convertRoughDraft',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            await inputMonitor?.manualConvert(editor);
        }
    );

    const toggleCommand = vscode.commands.registerCommand(
        'autotex.toggleAutoConvert',
        () => {
            const config = vscode.workspace.getConfiguration('autotex');
            const currentValue = config.get<boolean>('enabled', true);
            config.update('enabled', !currentValue, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
                `AutoTeX auto-convert ${!currentValue ? 'enabled' : 'disabled'}`
            );
        }
    );

    const checkServerCommand = vscode.commands.registerCommand(
        'autotex.checkServerStatus',
        async () => {
            const config = vscode.workspace.getConfiguration('autotex');
            const providerType = config.get<string>('provider', 'lmstudio');
            const providerNames: Record<string, string> = {
                'lmstudio': 'LM Studio',
                'openrouter': 'OpenRouter',
                'openai': 'OpenAI'
            };
            const providerName = providerNames[providerType] || providerType;

            const isRunning = await serverManager.checkServerStatus();
            if (!isRunning) {
                if (providerType === 'lmstudio') {
                    const action = await vscode.window.showWarningMessage(
                        'LM Studio server is not running',
                        'Start Server',
                        'Cancel'
                    );
                    if (action === 'Start Server') {
                        await serverManager.startServer();
                    }
                } else {
                    vscode.window.showWarningMessage(
                        `${providerName} is not available. Please check your settings and API key.`
                    );
                }
            } else {
                vscode.window.showInformationMessage(`${providerName} is available and ready!`);
            }
        }
    );

    const startServerCommand = vscode.commands.registerCommand(
        'autotex.startServer',
        async () => {
            await serverManager.startServer();
        }
    );

    const showDebugPanelCommand = vscode.commands.registerCommand(
        'autotex.showDebugPanel',
        () => {
            debugPanel.show();
        }
    );

    const toggleDraftHighlightingCommand = vscode.commands.registerCommand(
        'autotex.toggleDraftHighlighting',
        () => {
            const config = vscode.workspace.getConfiguration('autotex');
            const currentValue = config.get<boolean>('highlightDrafts', true);
            config.update('highlightDrafts', !currentValue, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(
                `Draft highlighting ${!currentValue ? 'enabled' : 'disabled'}`
            );
        }
    );

    const convertAllDraftsCommand = vscode.commands.registerCommand(
        'autotex.convertAllDrafts',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            await inputMonitor?.manualConvert(editor);
        }
    );

    const insertCodeBlockCommand = vscode.commands.registerCommand(
        'autotex.insertCodeBlock',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor found');
                return;
            }

            const position = editor.selection.active;
            const snippet = new vscode.SnippetString('```autotex\n$0\n```');
            
            await editor.insertSnippet(snippet, position);
        }
    );

    const selectProviderCommand = vscode.commands.registerCommand(
        'autotex.selectProvider',
        async () => {
            const providers = ProviderFactory.getAvailableProviders();
            const items = providers.map(p => ({
                label: p.name,
                description: p.description,
                detail: p.id,
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select an LLM provider for AutoTeX',
            });

            if (selected) {
                const config = vscode.workspace.getConfiguration('autotex');
                await config.update('provider', selected.detail, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`AutoTeX provider switched to ${selected.label}`);
                
                // Check the new provider's status
                await serverManager.checkServerStatus();
            }
        }
    );

    // Register disposables
    context.subscriptions.push(
        convertCommand,
        toggleCommand,
        checkServerCommand,
        startServerCommand,
        showDebugPanelCommand,
        toggleDraftHighlightingCommand,
        convertAllDraftsCommand,
        insertCodeBlockCommand,
        selectProviderCommand,
        serverManager,
        debugPanel
    );

    // Show activation message
    vscode.window.showInformationMessage('AutoTeX is ready!');
}

export function deactivate() {
    if (inputMonitor) {
        inputMonitor.dispose();
    }
    if (serverManager) {
        serverManager.dispose();
    }
    // Dispose provider factory
    ProviderFactory.dispose();
}

