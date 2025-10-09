import * as vscode from 'vscode';
import { DraftRegion } from './draftDetector';

export class DraftVisualizer implements vscode.Disposable {
    private decorationType: vscode.TextEditorDecorationType;
    private lowConfidenceDecorationType: vscode.TextEditorDecorationType;
    private disposables: vscode.Disposable[] = [];
    private enabled: boolean = true;

    constructor() {
        // Create decoration types for draft highlighting
        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('autotex.draftBackground'),
            borderRadius: '3px',
            isWholeLine: true,
            overviewRulerColor: new vscode.ThemeColor('autotex.draftOverviewRuler'),
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });

        this.lowConfidenceDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('autotex.draftBackgroundLowConfidence'),
            borderRadius: '3px',
            isWholeLine: true,
            overviewRulerColor: new vscode.ThemeColor('autotex.draftOverviewRulerLowConfidence'),
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });

        // Update decorations when active editor changes
        this.disposables.push(
            vscode.window.onDidChangeActiveTextEditor(() => {
                this.updateDecorations();
            })
        );

        // Update when configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration(e => {
                if (e.affectsConfiguration('autotex.highlightDrafts')) {
                    this.updateEnabled();
                    this.updateDecorations();
                }
                if (e.affectsConfiguration('autotex.draftHighlightColor')) {
                    this.recreateDecorations();
                    this.updateDecorations();
                }
            })
        );

        this.updateEnabled();
    }

    /**
     * Update enabled state from configuration
     */
    private updateEnabled(): void {
        const config = vscode.workspace.getConfiguration('autotex');
        this.enabled = config.get<boolean>('highlightDrafts', true);
    }

    /**
     * Recreate decoration types (e.g., when color changes)
     */
    private recreateDecorations(): void {
        this.decorationType.dispose();
        this.lowConfidenceDecorationType.dispose();

        this.decorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('autotex.draftBackground'),
            borderRadius: '3px',
            isWholeLine: true,
            overviewRulerColor: new vscode.ThemeColor('autotex.draftOverviewRuler'),
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });

        this.lowConfidenceDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: new vscode.ThemeColor('autotex.draftBackgroundLowConfidence'),
            borderRadius: '3px',
            isWholeLine: true,
            overviewRulerColor: new vscode.ThemeColor('autotex.draftOverviewRulerLowConfidence'),
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
    }

    /**
     * Highlight draft regions in the editor
     */
    public highlightDrafts(editor: vscode.TextEditor, draftRegions: DraftRegion[]): void {
        if (!this.enabled) {
            this.clearHighlights(editor);
            return;
        }

        // Separate regions by confidence level
        const highConfidenceDecorations: vscode.DecorationOptions[] = [];
        const lowConfidenceDecorations: vscode.DecorationOptions[] = [];

        for (const draft of draftRegions) {
            const hoverMessage = this.createHoverMessage(draft);
            
            const decoration: vscode.DecorationOptions = {
                range: draft.range,
                hoverMessage
            };

            if (draft.confidence >= 0.6) {
                highConfidenceDecorations.push(decoration);
            } else {
                lowConfidenceDecorations.push(decoration);
            }
        }

        editor.setDecorations(this.decorationType, highConfidenceDecorations);
        editor.setDecorations(this.lowConfidenceDecorationType, lowConfidenceDecorations);
    }

    /**
     * Clear all draft highlights from the editor
     */
    public clearHighlights(editor: vscode.TextEditor): void {
        editor.setDecorations(this.decorationType, []);
        editor.setDecorations(this.lowConfidenceDecorationType, []);
    }

    /**
     * Update decorations in the active editor
     */
    private updateDecorations(): void {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // The actual draft regions will be provided by the input monitor
        // This is just to clear when disabled
        if (!this.enabled) {
            this.clearHighlights(editor);
        }
    }

    /**
     * Create detailed hover message with confidence breakdown
     */
    private createHoverMessage(draft: DraftRegion): vscode.MarkdownString {
        const confidencePercent = Math.round(draft.confidence * 100);
        const confidenceLevel = draft.confidence >= 0.6 ? 'High' : 'Low';
        
        let message = `**Draft Section: ${confidencePercent}% confidence (${confidenceLevel})**\n\n`;
        const typeLabel = draft.type === 'manual' ? '📝 Manually marked' : '🔍 Auto-detected';
        message += `Type: ${typeLabel}\n\n`;
        
        // Debug: log if breakdown exists
        console.log('Draft breakdown exists:', !!draft.breakdown, 'Confidence:', confidencePercent);
        if (draft.breakdown) {
            console.log('Breakdown factors:', draft.breakdown.factors);
            console.log('Breakdown penalties:', draft.breakdown.penalties);
        }
        
        // Add confidence breakdown if available
        if (draft.breakdown) {
            message += `**Confidence Breakdown:**\n\n`;
            
            if (draft.breakdown.factors.length > 0) {
                message += `Positive factors:\n`;
                for (const factor of draft.breakdown.factors) {
                    message += `  + ${factor}\n`;
                }
                message += `\n`;
            }
            
            if (draft.breakdown.penalties.length > 0) {
                message += `Penalties:\n`;
                for (const penalty of draft.breakdown.penalties) {
                    message += `  - ${penalty}\n`;
                }
                message += `\n`;
            }
            
            // Add explanation
            if (draft.breakdown.isShortText) {
                message += `Note: Short text has reduced confidence\n\n`;
            } else if (draft.breakdown.hasFormattedLaTeX) {
                message += `Note: Contains formatted LaTeX, likely not a draft\n\n`;
            } else {
                message += `Final score = ${confidencePercent}%\n\n`;
            }
        }
        
        message += `---\n\n`;
        message += `💡 Press **Shift twice** to convert to LaTeX`;
        
        const markdown = new vscode.MarkdownString(message);
        markdown.isTrusted = true;
        return markdown;
    }

    /**
     * Toggle highlighting on/off
     */
    public toggleHighlighting(): void {
        this.enabled = !this.enabled;
        
        const config = vscode.workspace.getConfiguration('autotex');
        config.update('highlightDrafts', this.enabled, vscode.ConfigurationTarget.Global);

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            if (this.enabled) {
                this.updateDecorations();
            } else {
                this.clearHighlights(editor);
            }
        }

        vscode.window.showInformationMessage(
            `Draft highlighting ${this.enabled ? 'enabled' : 'disabled'}`
        );
    }

    dispose(): void {
        this.decorationType.dispose();
        this.lowConfidenceDecorationType.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}

