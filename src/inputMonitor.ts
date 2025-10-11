import * as vscode from 'vscode';
import { DocumentStateManager } from './documentStateManager';
import { ProviderFactory } from './providers/providerFactory';
import { TextReplacer } from './textReplacer';
import { AutoSaveManager } from './autoSaveManager';
import { ServerManager } from './serverManager';
import { DebugPanel } from './debugPanel';
import { DraftDetector, DraftRegion } from './draftDetector';
import { DraftVisualizer } from './draftVisualizer';

export class InputMonitor implements vscode.Disposable {
    private disposables: vscode.Disposable[] = [];
    private debugPanel: DebugPanel | undefined;
    private draftDetector: DraftDetector;
    private draftVisualizer: DraftVisualizer;
    private updateTimeout: NodeJS.Timeout | undefined;
    
    constructor(
        private documentStateManager: DocumentStateManager,
        private textReplacer: TextReplacer,
        private autoSaveManager: AutoSaveManager,
        private serverManager: ServerManager
    ) {
        this.draftDetector = new DraftDetector();
        this.draftVisualizer = new DraftVisualizer();

        // Listen to text document changes
        this.disposables.push(
            vscode.workspace.onDidChangeTextDocument(this.onDocumentChange.bind(this))
        );

        // Listen to document saves to update saved state
        this.disposables.push(
            vscode.workspace.onDidSaveTextDocument(this.onDocumentSave.bind(this))
        );

        // Listen to active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(this.onActiveEditorChange.bind(this))
        );

        // Initialize saved states for open documents
        this.initializeSavedStates();
    }

    /**
     * Set the debug panel for this monitor
     */
    public setDebugPanel(panel: DebugPanel): void {
        this.debugPanel = panel;
    }

    private onDocumentChange(event: vscode.TextDocumentChangeEvent): void {
        const config = vscode.workspace.getConfiguration('autotex');
        const enabled = config.get<boolean>('enabled', true);
        
        if (!enabled) {
            return;
        }

        const document = event.document;
        
        // Check if current file type is enabled
        const enabledFileTypes = config.get<string[]>('enabledFileTypes', ['latex', 'tex']);
        if (!enabledFileTypes.includes(document.languageId)) {
            return;
        }

        // Get the active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document !== document) {
            return;
        }

        // Debounce the visualization update
        this.scheduleVisualizationUpdate(editor);

        // Update debug panel with current draft content
        this.updateDebugPanel(editor);
    }

    /**
     * Update the debug panel with current draft content
     */
    private updateDebugPanel(editor: vscode.TextEditor): void {
        if (!this.debugPanel || !this.debugPanel.isVisible()) {
            return;
        }

        const draftRegions = this.getAllDraftRegions(editor);

        if (draftRegions.length > 0) {
            this.debugPanel.updateDrafts(draftRegions);
        } else {
            this.debugPanel.clearDrafts();
        }
    }

    private async triggerConversion(editor: vscode.TextEditor): Promise<void> {
        // Check if server is running first
        if (!this.serverManager.getServerStatus()) {
            const serverStarted = await this.serverManager.ensureServerRunning();
            if (!serverStarted) {
                vscode.window.showErrorMessage('LM Studio server is not running. Please start it to use AutoTeX.');
                return;
            }
        }

        // Use the new multi-draft conversion method
        await this.convertAllDrafts(editor);
    }

    public async manualConvert(editor: vscode.TextEditor): Promise<void> {
        await this.triggerConversion(editor);
    }

    /**
     * Initialize saved states for all open documents with enabled file types
     */
    private initializeSavedStates(): void {
        const config = vscode.workspace.getConfiguration('autotex');
        const enabledFileTypes = config.get<string[]>('enabledFileTypes', ['latex', 'tex']);
        
        for (const document of vscode.workspace.textDocuments) {
            if (enabledFileTypes.includes(document.languageId)) {
                if (!document.isDirty && document.uri.scheme === 'file') {
                    // Document is saved, use current content as saved state
                    this.draftDetector.updateSavedState(document.uri.toString(), document.getText());
                }
            }
        }
    }

    /**
     * Handle document save event
     */
    private onDocumentSave(document: vscode.TextDocument): void {
        const config = vscode.workspace.getConfiguration('autotex');
        const enabledFileTypes = config.get<string[]>('enabledFileTypes', ['latex', 'tex']);
        
        if (enabledFileTypes.includes(document.languageId)) {
            this.draftDetector.updateSavedState(document.uri.toString(), document.getText());
            
            // Update visualization after save (may affect draft detection)
            const editor = vscode.window.activeTextEditor;
            if (editor && editor.document === document) {
                this.updateVisualization(editor);
            }
        }
    }

    /**
     * Handle active editor change
     */
    private onActiveEditorChange(editor: vscode.TextEditor | undefined): void {
        if (!editor) return;

        const config = vscode.workspace.getConfiguration('autotex');
        const enabledFileTypes = config.get<string[]>('enabledFileTypes', ['latex', 'tex']);
        const document = editor.document;
        
        if (enabledFileTypes.includes(document.languageId)) {
            // Check if we have a saved state for this document
            if (!this.draftDetector.getSavedState(document.uri.toString())) {
                // Initialize saved state if document is not dirty
                if (!document.isDirty && document.uri.scheme === 'file') {
                    this.draftDetector.updateSavedState(document.uri.toString(), document.getText());
                }
            }

            this.updateVisualization(editor);
        }
    }

    /**
     * Schedule visualization update with debouncing
     */
    private scheduleVisualizationUpdate(editor: vscode.TextEditor): void {
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }

        this.updateTimeout = setTimeout(() => {
            this.updateVisualization(editor);
        }, 300); // 300ms debounce
    }

    /**
     * Update draft visualization in editor
     */
    private updateVisualization(editor: vscode.TextEditor): void {
        const config = vscode.workspace.getConfiguration('autotex');
        const highlightEnabled = config.get<boolean>('highlightDrafts', true);

        if (!highlightEnabled) {
            this.draftVisualizer.clearHighlights(editor);
            return;
        }

        // Get detection settings
        const useAutomatic = config.get<boolean>('automaticDraftDetection', true);
        const useManual = config.get<boolean>('manualDraftBlocks', true);

        const draftRegions = this.draftDetector.detectDraftRegions(editor.document, useAutomatic, useManual);
        this.draftVisualizer.highlightDrafts(editor, draftRegions);
    }

    /**
     * Get all draft regions in the current document
     */
    private getAllDraftRegions(editor: vscode.TextEditor): DraftRegion[] {
        const config = vscode.workspace.getConfiguration('autotex');
        const useAutomatic = config.get<boolean>('automaticDraftDetection', true);
        const useManual = config.get<boolean>('manualDraftBlocks', true);
        return this.draftDetector.detectDraftRegions(editor.document, useAutomatic, useManual);
    }

    /**
     * Convert all draft regions to LaTeX
     */
    private async convertAllDrafts(editor: vscode.TextEditor): Promise<void> {
        const draftRegions = this.getAllDraftRegions(editor);
        
        if (draftRegions.length === 0) {
            vscode.window.showInformationMessage('No draft regions found to convert');
            return;
        }

        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Converting ${draftRegions.length} draft section(s) to LaTeX...`,
                cancellable: false,
            },
            async (progress) => {
                const increment = 100 / draftRegions.length;
                let successCount = 0;

                // Sort regions from bottom to top (to preserve positions during replacement)
                const sortedRegions = [...draftRegions].sort((a, b) => 
                    b.range.start.line - a.range.start.line
                );

                for (let i = 0; i < sortedRegions.length; i++) {
                    const draft = sortedRegions[i];
                    
                    progress.report({ 
                        increment, 
                        message: `Converting section ${i + 1}/${sortedRegions.length}...` 
                    });

                    try {
                        // Only convert if confidence is high enough
                        if (draft.confidence < 0.4) {
                            continue;
                        }

                        // Skip if text is empty or only whitespace (important: check this right before conversion)
                        if (draft.text.trim().length === 0) {
                            continue;
                        }

                        // Call LM Studio
                        const provider = ProviderFactory.getProvider();
                        const latexCode = await provider.convertToLatex(draft.text);

                        // Register conversion
                        const conversionId = this.documentStateManager.registerConversion(
                            editor.document.uri.toString(),
                            draft.range
                        );

                        // Replace the text
                        const success = await this.textReplacer.replaceRoughDraft(
                            editor,
                            conversionId,
                            latexCode,
                            this.documentStateManager
                        );

                        if (success) {
                            successCount++;
                        }

                        this.documentStateManager.unregisterConversion(conversionId);
                    } catch (error) {
                        console.error('Error converting draft region:', error);
                    }
                }

                if (successCount > 0) {
                    // Update saved state after conversion
                    this.draftDetector.updateSavedState(
                        editor.document.uri.toString(),
                        editor.document.getText()
                    );

                    // Auto-save if enabled
                    const config = vscode.workspace.getConfiguration('autotex');
                    const autoSaveEnabled = config.get<boolean>('autoSaveEnabled', true);
                    
                    if (autoSaveEnabled) {
                        await this.autoSaveManager.saveCleanLatex(editor);
                    }

                    vscode.window.showInformationMessage(
                        `✓ Converted ${successCount}/${draftRegions.length} draft section(s) to LaTeX`
                    );
                } else {
                    vscode.window.showWarningMessage('No draft sections were converted');
                }

                // Update visualization
                this.updateVisualization(editor);
            }
        );
    }

    dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.draftVisualizer.dispose();
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
}

