import * as vscode from 'vscode';
import * as Diff from 'diff';

export interface ConfidenceBreakdown {
    baseScore: number;
    naturalLanguageScore: number;
    incompleteLaTeX: boolean;
    multiLine: boolean;
    hasFormattedLaTeX: boolean;
    isShortText: boolean;
    factors: string[];
    penalties: string[];
}

export interface DraftRegion {
    range: vscode.Range;
    text: string;
    type: 'auto' | 'manual';
    confidence: number; // 0-1, how confident we are this is a draft
    breakdown?: ConfidenceBreakdown;
}

export class DraftDetector {
    private savedDocumentStates: Map<string, string> = new Map();
    private lastDocumentVersions: Map<string, number> = new Map();

    /**
     * Update the saved state when document is saved
     */
    public updateSavedState(documentUri: string, content: string): void {
        this.savedDocumentStates.set(documentUri, content);
    }

    /**
     * Get the saved state for a document
     */
    public getSavedState(documentUri: string): string | undefined {
        return this.savedDocumentStates.get(documentUri);
    }

    /**
     * Detect all draft regions in the document using diff-based detection
     */
    public detectDraftRegions(
        document: vscode.TextDocument, 
        useAutomatic: boolean = true, 
        useManual: boolean = true
    ): DraftRegion[] {
        const allRegions: DraftRegion[] = [];

        // Check for manual code blocks first if enabled
        // Manual blocks are already separate and should never be merged
        let manualRegions: DraftRegion[] = [];
        if (useManual) {
            manualRegions = this.detectManualCodeBlocks(document);
            allRegions.push(...manualRegions);
        }

        // Check for automatic detection if enabled
        // Pass manual regions to exclude them from automatic detection
        // Auto regions are already merged within detectAutomaticDrafts
        if (useAutomatic) {
            const autoRegions = this.detectAutomaticDrafts(document, manualRegions);
            allRegions.push(...autoRegions);
        }

        // Return all regions without further merging
        // Manual regions are kept separate, auto regions are already merged
        return allRegions;
    }

    /**
     * Detect automatic draft regions using diff-based or heuristic detection
     * Excludes any regions that overlap with manual code blocks
     */
    private detectAutomaticDrafts(document: vscode.TextDocument, manualRegions: DraftRegion[] = []): DraftRegion[] {
        const documentUri = document.uri.toString();
        const currentContent = document.getText();
        const savedContent = this.savedDocumentStates.get(documentUri);

        // If no saved state, use heuristic detection
        if (!savedContent) {
            return this.filterOutManualRegions(this.detectDraftsHeuristic(document), manualRegions);
        }

        // Compute diff between saved and current
        const draftRegions: DraftRegion[] = [];
        const diffRegions = this.computeDiff(savedContent, currentContent, document);

        // Analyze each diff region
        for (const region of diffRegions) {
            // Skip if this region overlaps with any manual code block
            if (this.overlapsWithManualRegion(region, manualRegions)) {
                continue;
            }

            const regionText = document.getText(region);
            
            // Analyze all text uniformly using confidence calculation
            const result = this.calculateDraftConfidenceWithBreakdown(regionText);
            if (result.confidence > 0.3) { // Only include if confidence is reasonable
                draftRegions.push({
                    range: region,
                    text: regionText,
                    type: 'auto', // Auto-detected draft
                    confidence: result.confidence,
                    breakdown: result.breakdown
                });
            }
        }

        return this.mergeContinuousDrafts(draftRegions, document);
    }

    /**
     * Detect manual draft regions marked with ```autotex code blocks
     * Manual blocks are NEVER merged - each block is treated separately
     */
    private detectManualCodeBlocks(document: vscode.TextDocument): DraftRegion[] {
        const draftRegions: DraftRegion[] = [];
        const text = document.getText();
        
        // Match ```autotex ... ``` code blocks (non-greedy to match each block separately)
        const codeBlockRegex = /```autotex\n([\s\S]*?)```/g;
        let match: RegExpExecArray | null;
        
        while ((match = codeBlockRegex.exec(text)) !== null) {
            // Range includes the full code block markers (for highlighting)
            const blockStartIndex = match.index;
            const blockEndIndex = match.index + match[0].length;
            
            const startPos = document.positionAt(blockStartIndex);
            const endPos = document.positionAt(blockEndIndex);
            const range = new vscode.Range(startPos, endPos);
            
            // Text is just the content (without markers, for sending to model)
            const draftText = match[1];
            
            // Manual code blocks always have high confidence (1.0)
            draftRegions.push({
                range,
                text: draftText,
                type: 'manual',
                confidence: 1.0,
                breakdown: {
                    baseScore: 1.0,
                    naturalLanguageScore: 1.0,
                    incompleteLaTeX: false,
                    multiLine: draftText.split('\n').length > 2,
                    hasFormattedLaTeX: false,
                    isShortText: false,
                    factors: ['Manually marked with ```autotex code block'],
                    penalties: []
                }
            });
        }
        
        // Return without merging - each manual block is intentionally separate
        return draftRegions;
    }

    /**
     * Check if a range overlaps with any manual region
     */
    private overlapsWithManualRegion(range: vscode.Range, manualRegions: DraftRegion[]): boolean {
        for (const manual of manualRegions) {
            if (this.rangesOverlap(range, manual.range)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if two ranges overlap
     */
    private rangesOverlap(range1: vscode.Range, range2: vscode.Range): boolean {
        // Ranges overlap if one starts before the other ends
        return !(range1.end.isBefore(range2.start) || range2.end.isBefore(range1.start));
    }

    /**
     * Filter out any draft regions that overlap with manual regions
     */
    private filterOutManualRegions(draftRegions: DraftRegion[], manualRegions: DraftRegion[]): DraftRegion[] {
        return draftRegions.filter(draft => !this.overlapsWithManualRegion(draft.range, manualRegions));
    }

    /**
     * Compute diff regions between saved and current content using Myers diff
     * This properly handles shifted/moved content and only detects truly new additions
     */
    private computeDiff(
        savedContent: string,
        currentContent: string,
        document: vscode.TextDocument
    ): vscode.Range[] {
        const diffRegions: vscode.Range[] = [];
        
        // Use proper Myers diff algorithm
        const changes = Diff.diffLines(savedContent, currentContent);
        
        let currentLine = 0;
        
        for (const change of changes) {
            const lineCount = change.count || 0;
            
            if (change.added) {
                // This is truly new content (not just shifted)
                const startLine = currentLine;
                const endLine = currentLine + lineCount - 1;
                
                if (startLine <= endLine) {
                    const endLineText = document.lineAt(endLine).text;
                    diffRegions.push(new vscode.Range(
                        new vscode.Position(startLine, 0),
                        new vscode.Position(endLine, endLineText.length)
                    ));
                }
                
                currentLine += lineCount;
            } else if (change.removed) {
                // Content was removed from saved version - skip in current
                // Don't increment currentLine since these lines don't exist in current
            } else {
                // Unchanged content (includes shifted content that matches)
                currentLine += lineCount;
            }
        }
        
        return diffRegions;
    }

    /**
     * Calculate how much text looks like natural language
     */
    private calculateNaturalLanguageScore(text: string): number {
        const trimmed = text.trim();
        
        // Check for pure LaTeX constructs that should score 0
        const pureLatexPatterns = [
            /^\\[a-zA-Z]+\{[^}]*\}$/,  // Single command like \include{file}
            /^\\[a-zA-Z]+$/,            // Single command without args
            /^\$.*\$$/s,                // Pure math mode
            /^\\begin\{[^}]+\}.*\\end\{[^}]+\}$/s, // Environment block
        ];
        
        for (const pattern of pureLatexPatterns) {
            if (pattern.test(trimmed)) {
                return 0;
            }
        }
        
        // Count actual English words (3+ letters, alphabetic)
        const englishWords = (trimmed.match(/\b[a-zA-Z]{3,}\b/g) || []).length;
        
        // Count LaTeX commands
        const latexCommands = (trimmed.match(/\\[a-zA-Z]+/g) || []).length;
        
        // Count math delimiters and special chars
        const mathSymbols = (trimmed.match(/[\$\{\}\[\]\\]/g) || []).length;
        
        // If mostly commands and symbols, not natural language
        if (latexCommands > englishWords || mathSymbols > englishWords * 0.5) {
            return 0;
        }
        
        // Calculate ratio of English words to total characters
        const totalChars = trimmed.length;
        const englishCharRatio = (englishWords * 5) / Math.max(1, totalChars); // Assume avg word length 5
        
        // Score based on presence of English words and lack of LaTeX
        const score = Math.min(1, englishCharRatio * 1.5);
        
        return score;
    }

    /**
     * Calculate confidence that text is a draft with detailed breakdown
     */
    private calculateDraftConfidence(text: string): number {
        const result = this.calculateDraftConfidenceWithBreakdown(text);
        return result.confidence;
    }

    /**
     * Calculate confidence with detailed breakdown for hover display
     */
    private calculateDraftConfidenceWithBreakdown(text: string): { confidence: number; breakdown: ConfidenceBreakdown } {
        const trimmed = text.trim();
        const factors: string[] = [];
        const penalties: string[] = [];
        
        if (trimmed.length === 0) {
            return {
                confidence: 0,
                breakdown: {
                    baseScore: 0,
                    naturalLanguageScore: 0,
                    incompleteLaTeX: false,
                    multiLine: false,
                    hasFormattedLaTeX: false,
                    isShortText: true,
                    factors: ['Empty text'],
                    penalties: []
                }
            };
        }

        // Very short text is likely not meaningful
        const isShortText = trimmed.length < 10;
        if (isShortText) {
            penalties.push(`Short text (<10 chars)`);
            return {
                confidence: 0.3,
                breakdown: {
                    baseScore: 0.3,
                    naturalLanguageScore: 0,
                    incompleteLaTeX: false,
                    multiLine: false,
                    hasFormattedLaTeX: false,
                    isShortText: true,
                    factors: [],
                    penalties
                }
            };
        }

        // Check for formatted LaTeX
        const hasBeginEnd = /\\(begin|end)\{/.test(trimmed);
        const hasSection = /\\(section|subsection|chapter)/.test(trimmed);
        const hasManyCommands = (trimmed.match(/\\[a-zA-Z]+/g) || []).length > trimmed.length / 20;
        const hasFormattedLaTeX = hasBeginEnd || hasSection || hasManyCommands;

        // Check for natural language patterns first
        const naturalScore = this.calculateNaturalLanguageScore(trimmed);
        
        // If has formatted LaTeX AND low natural language score, it's likely not a draft
        if (hasFormattedLaTeX && naturalScore < 0.3) {
            if (hasBeginEnd) penalties.push('Contains \\begin{}\\end{}');
            if (hasSection) penalties.push('Contains section commands');
            if (hasManyCommands) penalties.push('High LaTeX command density');
            
            return {
                confidence: 0.2,
                breakdown: {
                    baseScore: 0.2,
                    naturalLanguageScore: naturalScore,
                    incompleteLaTeX: false,
                    multiLine: false,
                    hasFormattedLaTeX: true,
                    isShortText: false,
                    factors: [],
                    penalties
                }
            };
        }
        
        // Check for incomplete LaTeX (good indicator of draft)
        const hasIncompleteMath = /\$[^$]*$/.test(trimmed); // Unclosed $
        const hasIncompleteCmd = /\\[a-zA-Z]+\s*$/.test(trimmed); // Command without braces at end
        const incompleteLaTeX = hasIncompleteMath || hasIncompleteCmd;

        let confidence = naturalScore * 0.6;
        factors.push(`Natural language: ${Math.round(naturalScore * 100)}% (×0.6 = ${Math.round(naturalScore * 60)}%)`);
        
        if (incompleteLaTeX) {
            confidence += 0.3;
            if (hasIncompleteMath) factors.push('Incomplete math ($...) +30%');
            if (hasIncompleteCmd) factors.push('Incomplete command +30%');
        }

        // Multi-line text is more likely to be draft
        const lineCount = trimmed.split('\n').length;
        const multiLine = lineCount > 2;
        if (multiLine) {
            confidence += 0.1;
            factors.push(`Multi-line (${lineCount} lines) +10%`);
        }

        // Apply formatted LaTeX penalty if present (but still has natural language)
        if (hasFormattedLaTeX && naturalScore >= 0.3) {
            confidence *= 0.7; // 30% penalty
            if (hasBeginEnd) penalties.push('Contains \\begin{}\\end{} (-30%)');
            if (hasSection) penalties.push('Contains section commands (-30%)');
            if (hasManyCommands) penalties.push('High LaTeX command density (-30%)');
        }

        const finalConfidence = Math.min(1, confidence);

        return {
            confidence: finalConfidence,
            breakdown: {
                baseScore: finalConfidence,
                naturalLanguageScore: naturalScore,
                incompleteLaTeX,
                multiLine,
                hasFormattedLaTeX: hasFormattedLaTeX && naturalScore >= 0.3,
                isShortText: false,
                factors,
                penalties
            }
        };
    }

    /**
     * Merge continuous draft regions that are close together
     * Manual drafts are kept completely separate from automatic drafts
     */
    private mergeContinuousDrafts(regions: DraftRegion[], document: vscode.TextDocument): DraftRegion[] {
        if (regions.length === 0) return [];

        // Sort by start position
        const sorted = [...regions].sort((a, b) => {
            if (a.range.start.line !== b.range.start.line) {
                return a.range.start.line - b.range.start.line;
            }
            return a.range.start.character - b.range.start.character;
        });

        const merged: DraftRegion[] = [];
        let current = sorted[0];

        for (let i = 1; i < sorted.length; i++) {
            const next = sorted[i];
            
            // Never merge manual and automatic drafts together
            if (current.type !== next.type) {
                merged.push(current);
                current = next;
                continue;
            }
            
            // Check if regions are close (within 2 lines)
            const gap = next.range.start.line - current.range.end.line;
            
            if (gap <= 2) {
                // Check if lines between are empty
                let allEmpty = true;
                for (let line = current.range.end.line + 1; line < next.range.start.line; line++) {
                    if (document.lineAt(line).text.trim() !== '') {
                        allEmpty = false;
                        break;
                    }
                }

                if (allEmpty) {
                    // Merge only if same type (already verified above)
                    const newRange = new vscode.Range(current.range.start, next.range.end);
                    current = {
                        range: newRange,
                        text: document.getText(newRange),
                        type: current.type,
                        confidence: Math.max(current.confidence, next.confidence)
                    };
                    continue;
                }
            }

            // No merge, add current and move to next
            merged.push(current);
            current = next;
        }

        // Add the last one
        merged.push(current);

        return merged;
    }

    /**
     * Fallback heuristic detection when no saved state exists
     */
    private detectDraftsHeuristic(document: vscode.TextDocument): DraftRegion[] {
        const regions: DraftRegion[] = [];
        const lines = document.getText().split('\n');
        
        let inDraft = false;
        let draftStart = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isFormatted = this.looksLikeFormattedLatex(line);
            const isEmpty = line.trim() === '';

            if (!inDraft && !isFormatted && !isEmpty) {
                // Start of a potential draft
                inDraft = true;
                draftStart = i;
            } else if (inDraft && (isFormatted || isEmpty)) {
                // End of draft
                if (i > draftStart) {
                    const range = new vscode.Range(
                        new vscode.Position(draftStart, 0),
                        new vscode.Position(i - 1, lines[i - 1].length)
                    );
                    const text = document.getText(range);
                    const result = this.calculateDraftConfidenceWithBreakdown(text);
                    
                    if (result.confidence > 0.3) {
                        regions.push({
                            range,
                            text,
                            type: 'auto',
                            confidence: result.confidence,
                            breakdown: result.breakdown
                        });
                    }
                }
                inDraft = false;
            }
        }

        // Handle draft at end of document
        if (inDraft && draftStart < lines.length) {
            const range = new vscode.Range(
                new vscode.Position(draftStart, 0),
                new vscode.Position(lines.length - 1, lines[lines.length - 1].length)
            );
            const text = document.getText(range);
            const result = this.calculateDraftConfidenceWithBreakdown(text);
            
            if (result.confidence > 0.3) {
                regions.push({
                    range,
                    text,
                    type: 'auto',
                    confidence: result.confidence,
                    breakdown: result.breakdown
                });
            }
        }

        return regions;
    }

    /**
     * Check if a line looks like formatted LaTeX
     */
    private looksLikeFormattedLatex(text: string): boolean {
        const latexPatterns = [
            /\\begin\{/,
            /\\end\{/,
            /\\section/,
            /\\subsection/,
            /\\chapter/,
            /\\documentclass/,
            /\\usepackage/,
            /\\title/,
            /\\author/,
            /\\maketitle/,
        ];

        return latexPatterns.some(pattern => pattern.test(text));
    }

    /**
     * Clear all tracked data for a document
     */
    public clearDocument(documentUri: string): void {
        this.savedDocumentStates.delete(documentUri);
        this.lastDocumentVersions.delete(documentUri);
    }
}

