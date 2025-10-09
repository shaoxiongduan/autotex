import * as vscode from 'vscode';
import { DraftRegion } from './draftDetector';

export class DebugPanel implements vscode.Disposable {
    private panel: vscode.WebviewPanel | undefined;
    private disposables: vscode.Disposable[] = [];
    private draftRegions: DraftRegion[] = [];

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Show or focus the debug panel
     */
    public show(): void {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Beside);
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'autotexDebug',
            'AutoTeX Debug',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
            }
        );

        this.panel.webview.html = this.getWebviewContent();

        this.panel.onDidDispose(
            () => {
                this.panel = undefined;
            },
            null,
            this.disposables
        );

        // Update the panel with current data
        this.updatePanel();
    }

    /**
     * Update the draft regions
     */
    public updateDrafts(regions: DraftRegion[]): void {
        this.draftRegions = regions;
        this.updatePanel();
    }

    /**
     * Clear all draft regions
     */
    public clearDrafts(): void {
        this.draftRegions = [];
        this.updatePanel();
    }

    /**
     * Update the webview panel with current data
     */
    private updatePanel(): void {
        if (!this.panel) {
            return;
        }

        // Transform draft regions to a format suitable for the webview
        const draftData = this.draftRegions.map((region, index) => ({
            id: index,
            text: region.text,
            range: `Lines ${region.range.start.line + 1}-${region.range.end.line + 1}`,
            type: region.type,
            confidence: region.confidence,
            breakdown: region.breakdown,
        }));

        this.panel.webview.postMessage({
            type: 'update',
            drafts: draftData,
            isEmpty: this.draftRegions.length === 0,
        });
    }

    /**
     * Get the HTML content for the webview
     */
    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoTeX Debug</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            padding: 20px;
            margin: 0;
        }

        .header {
            border-bottom: 1px solid var(--vscode-panel-border);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }

        h1 {
            margin: 0 0 10px 0;
            font-size: 18px;
            font-weight: 600;
            color: var(--vscode-foreground);
        }

        .summary-stats {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
            font-size: 13px;
        }

        .stat-item {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .stat-label {
            color: var(--vscode-descriptionForeground);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .stat-value {
            color: var(--vscode-foreground);
            font-weight: 500;
        }

        .status-badge {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            font-size: 12px;
            font-weight: 500;
        }

        .status-active {
            background-color: var(--vscode-testing-iconPassed);
            color: var(--vscode-editor-background);
        }

        .status-empty {
            background-color: var(--vscode-descriptionForeground);
            color: var(--vscode-editor-background);
        }

        .empty-state {
            color: var(--vscode-descriptionForeground);
            font-style: italic;
            text-align: center;
            padding: 40px 20px;
            background-color: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
        }

        .draft-section {
            background-color: var(--vscode-editorWidget-background);
            border: 2px solid var(--vscode-panel-border);
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }

        .draft-section.manual {
            border-color: var(--vscode-textLink-foreground);
        }

        .draft-section.auto {
            border-color: var(--vscode-testing-iconPassed);
        }

        .draft-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
            padding-bottom: 10px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }

        .draft-title {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
            font-size: 14px;
        }

        .draft-type-badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 10px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-manual {
            background-color: var(--vscode-textLink-foreground);
            color: white;
        }

        .badge-auto {
            background-color: var(--vscode-testing-iconPassed);
            color: white;
        }

        .draft-metadata {
            display: flex;
            gap: 15px;
            margin-bottom: 10px;
            font-size: 12px;
        }

        .metadata-item {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        .metadata-label {
            color: var(--vscode-descriptionForeground);
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .metadata-value {
            color: var(--vscode-foreground);
            font-weight: 500;
        }

        .confidence-bar-container {
            width: 80px;
            height: 8px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            overflow: hidden;
        }

        .confidence-bar {
            height: 100%;
            transition: width 0.3s ease;
        }

        .confidence-high {
            background-color: var(--vscode-testing-iconPassed);
        }

        .confidence-medium {
            background-color: #FFA500;
        }

        .confidence-low {
            background-color: var(--vscode-testing-iconFailed);
        }

        .draft-content-container {
            background-color: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 12px;
            margin-bottom: 10px;
        }

        .draft-content {
            white-space: pre-wrap;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
            line-height: 1.5;
            color: var(--vscode-editor-foreground);
            max-height: 300px;
            overflow-y: auto;
        }

        .breakdown-section {
            margin-top: 10px;
        }

        .breakdown-toggle {
            cursor: pointer;
            color: var(--vscode-textLink-foreground);
            font-size: 12px;
            user-select: none;
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .breakdown-toggle:hover {
            text-decoration: underline;
        }

        .breakdown-content {
            margin-top: 10px;
            padding: 10px;
            background-color: var(--vscode-textCodeBlock-background);
            border-radius: 4px;
            font-size: 12px;
        }

        .breakdown-content.hidden {
            display: none;
        }

        .breakdown-item {
            margin: 5px 0;
            padding: 4px 0;
        }

        .breakdown-factors {
            margin-top: 8px;
        }

        .breakdown-factors-title {
            font-weight: 600;
            margin-bottom: 4px;
            color: var(--vscode-descriptionForeground);
        }

        .breakdown-factor {
            padding: 4px 8px;
            margin: 3px 0;
            background-color: rgba(0, 150, 0, 0.1);
            border-left: 3px solid var(--vscode-testing-iconPassed);
            font-size: 11px;
        }

        .breakdown-penalty {
            padding: 4px 8px;
            margin: 3px 0;
            background-color: rgba(200, 0, 0, 0.1);
            border-left: 3px solid var(--vscode-testing-iconFailed);
            font-size: 11px;
        }

        .arrow {
            display: inline-block;
            transition: transform 0.2s;
        }

        .arrow.expanded {
            transform: rotate(90deg);
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 AutoTeX Debug Panel</h1>
        <p style="margin: 5px 0 0 0; color: var(--vscode-descriptionForeground); font-size: 13px;">
            Monitor all detected rough draft sections in real-time
        </p>
    </div>

    <div class="summary-stats">
        <div class="stat-item">
            <span class="stat-label">Status</span>
            <span class="stat-value">
                <span id="status-badge" class="status-badge status-empty">Empty</span>
            </span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Draft Sections</span>
            <span id="draft-count" class="stat-value">0</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">Total Characters</span>
            <span id="total-chars" class="stat-value">0</span>
        </div>
    </div>

    <div id="drafts-container">
        <div class="empty-state">
            No draft content available. Start typing in a LaTeX file to see drafts here.
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();

        window.addEventListener('message', event => {
            const message = event.data;
            
            if (message.type === 'update') {
                updateDrafts(message);
            }
        });

        function updateDrafts(message) {
            const container = document.getElementById('drafts-container');
            const statusBadge = document.getElementById('status-badge');
            const draftCount = document.getElementById('draft-count');
            const totalChars = document.getElementById('total-chars');

            if (message.isEmpty) {
                container.innerHTML = '<div class="empty-state">No draft content available. Start typing in a LaTeX file to see drafts here.</div>';
                statusBadge.textContent = 'Empty';
                statusBadge.className = 'status-badge status-empty';
                draftCount.textContent = '0';
                totalChars.textContent = '0';
            } else {
                statusBadge.textContent = 'Active';
                statusBadge.className = 'status-badge status-active';
                draftCount.textContent = message.drafts.length;
                
                const total = message.drafts.reduce((sum, d) => sum + d.text.length, 0);
                totalChars.textContent = total.toLocaleString();

                container.innerHTML = '';
                message.drafts.forEach((draft, index) => {
                    const section = createDraftSection(draft, index);
                    container.appendChild(section);
                });
            }
        }

        function createDraftSection(draft, index) {
            const section = document.createElement('div');
            section.className = 'draft-section ' + draft.type;

            const typeLabel = draft.type === 'manual' ? 'Manual' : 'Auto-detected';
            const badgeClass = draft.type === 'manual' ? 'badge-manual' : 'badge-auto';
            
            const confidencePercent = Math.round(draft.confidence * 100);
            const confidenceClass = 
                draft.confidence >= 0.7 ? 'confidence-high' :
                draft.confidence >= 0.4 ? 'confidence-medium' : 'confidence-low';

            section.innerHTML = \`
                <div class="draft-header">
                    <div class="draft-title">
                        <span>Draft Section \${index + 1}</span>
                        <span class="draft-type-badge \${badgeClass}">\${typeLabel}</span>
                    </div>
                </div>
                
                <div class="draft-metadata">
                    <div class="metadata-item">
                        <span class="metadata-label">Range</span>
                        <span class="metadata-value">\${draft.range}</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Confidence</span>
                        <span class="metadata-value">\${confidencePercent}%</span>
                    </div>
                    <div class="metadata-item">
                        <span class="metadata-label">Length</span>
                        <span class="metadata-value">\${draft.text.length} chars</span>
                    </div>
                </div>

                <div class="confidence-bar-container">
                    <div class="confidence-bar \${confidenceClass}" style="width: \${confidencePercent}%"></div>
                </div>

                <div class="draft-content-container">
                    <div class="draft-content">\${escapeHtml(draft.text)}</div>
                </div>

                <div class="breakdown-section">
                    <div class="breakdown-toggle" onclick="toggleBreakdown(\${index})">
                        <span class="arrow" id="arrow-\${index}">▶</span>
                        <span>Show Analysis Details</span>
                    </div>
                    <div class="breakdown-content hidden" id="breakdown-\${index}">
                        \${generateBreakdown(draft.breakdown)}
                    </div>
                </div>
            \`;

            return section;
        }

        function generateBreakdown(breakdown) {
            if (!breakdown) {
                return '<div>No breakdown information available</div>';
            }

            let html = '<div class="breakdown-item"><strong>Base Score:</strong> ' + Math.round(breakdown.baseScore * 100) + '%</div>';
            html += '<div class="breakdown-item"><strong>Natural Language Score:</strong> ' + Math.round(breakdown.naturalLanguageScore * 100) + '%</div>';
            html += '<div class="breakdown-item"><strong>Incomplete LaTeX:</strong> ' + (breakdown.incompleteLaTeX ? 'Yes' : 'No') + '</div>';
            html += '<div class="breakdown-item"><strong>Multi-line:</strong> ' + (breakdown.multiLine ? 'Yes' : 'No') + '</div>';
            html += '<div class="breakdown-item"><strong>Has Formatted LaTeX:</strong> ' + (breakdown.hasFormattedLaTeX ? 'Yes' : 'No') + '</div>';
            
            if (breakdown.factors && breakdown.factors.length > 0) {
                html += '<div class="breakdown-factors"><div class="breakdown-factors-title">Positive Factors:</div>';
                breakdown.factors.forEach(factor => {
                    html += '<div class="breakdown-factor">' + escapeHtml(factor) + '</div>';
                });
                html += '</div>';
            }

            if (breakdown.penalties && breakdown.penalties.length > 0) {
                html += '<div class="breakdown-factors"><div class="breakdown-factors-title">Penalties:</div>';
                breakdown.penalties.forEach(penalty => {
                    html += '<div class="breakdown-penalty">' + escapeHtml(penalty) + '</div>';
                });
                html += '</div>';
            }

            return html;
        }

        function toggleBreakdown(index) {
            const content = document.getElementById('breakdown-' + index);
            const arrow = document.getElementById('arrow-' + index);
            
            if (content.classList.contains('hidden')) {
                content.classList.remove('hidden');
                arrow.classList.add('expanded');
            } else {
                content.classList.add('hidden');
                arrow.classList.remove('expanded');
            }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;
    }

    /**
     * Check if the panel is visible
     */
    public isVisible(): boolean {
        return this.panel !== undefined;
    }

    dispose(): void {
        if (this.panel) {
            this.panel.dispose();
        }
        this.disposables.forEach(d => d.dispose());
    }
}

