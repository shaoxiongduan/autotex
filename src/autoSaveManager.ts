import * as vscode from 'vscode';
import * as path from 'path';

export class AutoSaveManager {
    /**
     * Save the clean LaTeX file (without rough drafts)
     * The clean file is the current state of the document after conversion
     */
    async saveCleanLatex(editor: vscode.TextEditor): Promise<void> {
        const document = editor.document;
        const config = vscode.workspace.getConfiguration('autotex');
        
        // Since we already replaced the rough draft with formatted LaTeX,
        // we just need to save the current document
        
        // Save the document
        const saved = await document.save();
        
        if (!saved) {
            vscode.window.showWarningMessage('Failed to save the document');
            return;
        }

        // Optionally, create a backup or separate clean file
        const outputDirectory = config.get<string>('outputDirectory', '');
        
        if (outputDirectory && outputDirectory.trim() !== '') {
            await this.saveToOutputDirectory(document, outputDirectory);
        }
    }

    /**
     * Save a copy to a specified output directory
     */
    private async saveToOutputDirectory(
        document: vscode.TextDocument,
        outputDirectory: string
    ): Promise<void> {
        try {
            const originalPath = document.uri.fsPath;
            const fileName = path.basename(originalPath);
            
            // Resolve the output directory (can be relative or absolute)
            let outputDir: string;
            if (path.isAbsolute(outputDirectory)) {
                outputDir = outputDirectory;
            } else {
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                if (!workspaceFolder) {
                    throw new Error('No workspace folder found');
                }
                outputDir = path.join(workspaceFolder.uri.fsPath, outputDirectory);
            }

            // Create output directory if it doesn't exist
            const outputDirUri = vscode.Uri.file(outputDir);
            try {
                await vscode.workspace.fs.stat(outputDirUri);
            } catch {
                // Directory doesn't exist, create it
                await vscode.workspace.fs.createDirectory(outputDirUri);
            }

            // Save to output directory
            const outputPath = path.join(outputDir, fileName);
            const outputUri = vscode.Uri.file(outputPath);
            
            const content = Buffer.from(document.getText(), 'utf8');
            await vscode.workspace.fs.writeFile(outputUri, content);

            console.log(`Saved clean LaTeX to: ${outputPath}`);
        } catch (error) {
            console.error('Error saving to output directory:', error);
            vscode.window.showWarningMessage(
                `Could not save to output directory: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }
}

