import * as vscode from 'vscode';
import { DocumentStateManager } from './documentStateManager';

export class TextReplacer {
    /**
     * Replace the rough draft text with formatted LaTeX code
     * Returns true if successful, false if the region was modified
     */
    async replaceRoughDraft(
        editor: vscode.TextEditor,
        conversionId: string,
        latexCode: string,
        stateManager: DocumentStateManager
    ): Promise<boolean> {
        const conversion = stateManager.getConversion(conversionId);
        if (!conversion) {
            return false;
        }

        const document = editor.document;
        
        // Verify the document matches
        if (document.uri.toString() !== conversion.documentUri) {
            return false;
        }

        // Get the original text to verify it hasn't changed
        const originalText = document.getText(conversion.range);

        // Verify the region is still valid
        if (!stateManager.isRegionValid(conversionId, document, originalText)) {
            return false;
        }

        // Perform the replacement
        const success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(conversion.range, latexCode);
        });

        return success;
    }

    /**
     * Extract only the formatted LaTeX (excluding rough drafts)
     * This is used for saving the clean working file
     */
    extractCleanLatex(document: vscode.TextDocument, roughDraftRanges: vscode.Range[]): string {
        // Get the full document text
        let cleanText = document.getText();

        // Sort ranges in reverse order so we can remove them without affecting positions
        const sortedRanges = roughDraftRanges.sort((a, b) => {
            return b.start.line - a.start.line || b.start.character - a.start.character;
        });

        // Remove rough draft sections
        for (const range of sortedRanges) {
            const before = cleanText.substring(0, document.offsetAt(range.start));
            const after = cleanText.substring(document.offsetAt(range.end));
            cleanText = before + after;
        }

        return cleanText.trim();
    }
}

