import * as vscode from 'vscode';
import { InputMonitor } from './inputMonitor';
import { DocumentStateManager } from './documentStateManager';
import { LMStudioClient } from './lmStudioClient';
import { TextReplacer } from './textReplacer';
import { AutoSaveManager } from './autoSaveManager';
import { ServerManager } from './serverManager';
import { DebugPanel } from './debugPanel';

let inputMonitor: InputMonitor | undefined;
let documentStateManager: DocumentStateManager;
let lmStudioClient: LMStudioClient;
let textReplacer: TextReplacer;
let autoSaveManager: AutoSaveManager;
let serverManager: ServerManager;
let debugPanel: DebugPanel;

export function activate(context: vscode.ExtensionContext) {
    console.log('AutoTeX extension is now active');

    // Initialize services
    documentStateManager = new DocumentStateManager();
    lmStudioClient = new LMStudioClient();
    textReplacer = new TextReplacer();
    autoSaveManager = new AutoSaveManager();
    serverManager = new ServerManager();
    debugPanel = new DebugPanel(context);

    // Start server monitoring
    serverManager.startMonitoring();

    // Initialize input monitor
    inputMonitor = new InputMonitor(
        documentStateManager,
        lmStudioClient,
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
            const isRunning = await serverManager.checkServerStatus();
            if (!isRunning) {
                const action = await vscode.window.showWarningMessage(
                    'LM Studio server is not running',
                    'Start Server',
                    'Cancel'
                );
                if (action === 'Start Server') {
                    await serverManager.startServer();
                }
            } else {
                vscode.window.showInformationMessage('LM Studio server is running!');
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
}

