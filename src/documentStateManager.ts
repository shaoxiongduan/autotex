import * as vscode from 'vscode';

interface ConversionRegion {
    id: string;
    documentUri: string;
    range: vscode.Range;
    timestamp: number;
}

export class DocumentStateManager {
    private conversions: Map<string, ConversionRegion> = new Map();
    private conversionCounter = 0;

    /**
     * Register a new conversion with its rough draft region
     * @returns A unique conversion ID
     */
    registerConversion(documentUri: string, range: vscode.Range): string {
        const id = `conversion_${++this.conversionCounter}_${Date.now()}`;
        
        this.conversions.set(id, {
            id,
            documentUri,
            range,
            timestamp: Date.now(),
        });

        return id;
    }

    /**
     * Get the conversion region by ID
     */
    getConversion(id: string): ConversionRegion | undefined {
        return this.conversions.get(id);
    }

    /**
     * Unregister a conversion after it's complete
     */
    unregisterConversion(id: string): void {
        this.conversions.delete(id);
    }

    /**
     * Check if a region is still valid (hasn't been modified by the user)
     * This is a basic check - in a production system you might want more sophisticated tracking
     */
    isRegionValid(
        id: string,
        document: vscode.TextDocument,
        originalText: string
    ): boolean {
        const conversion = this.conversions.get(id);
        if (!conversion) {
            return false;
        }

        if (conversion.documentUri !== document.uri.toString()) {
            return false;
        }

        // Check if the range is still within document bounds
        if (conversion.range.end.line >= document.lineCount) {
            return false;
        }

        // Check if the text at that range matches what we expect
        const currentText = document.getText(conversion.range);
        return currentText === originalText;
    }

    /**
     * Clean up old conversions (e.g., ones that took too long)
     */
    cleanupOldConversions(maxAgeMs: number = 300000): void {
        const now = Date.now();
        const toDelete: string[] = [];

        this.conversions.forEach((conversion, id) => {
            if (now - conversion.timestamp > maxAgeMs) {
                toDelete.push(id);
            }
        });

        toDelete.forEach(id => this.conversions.delete(id));
    }
}

