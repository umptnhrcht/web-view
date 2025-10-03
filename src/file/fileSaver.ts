import * as fs from 'fs';
import * as path from 'path';

export function saveJsonToFile(jsonData: any, filePath: string) {
	const prettyJson = JSON.stringify(jsonData, null, 2);
	fs.writeFileSync(path.resolve(filePath), prettyJson, 'utf8');
}
import { window, workspace } from "vscode";

export async function saveJSONFile(object: any) {
	try {
		// Ask user where to save the file
		let uri = await window.showSaveDialog({
			filters: { 'config files': ['rconf'], 'All files': ['*'] }
		});

		if (!uri) {
			window.showInformationMessage('Save cancelled.');
			return;
		}

		// Ensure .rconf extension
		let fsPath = uri.fsPath;
		if (!fsPath.endsWith('.rconf')) {
			fsPath += '.rconf';
			uri = uri.with({ path: fsPath });
		}

		const prettyJson = JSON.stringify(object, null, 2);

		// Save the file
		await workspace.fs.writeFile(uri, Buffer.from(prettyJson, 'utf8'));

		window.showInformationMessage(`File saved: ${uri.fsPath}`);
		// Close the active webview panel if present
		if (window.activeTextEditor) {
			await window.activeTextEditor.document.save();
		}
		
	} catch (err: any) {
		window.showErrorMessage(`Error saving file: ${err.message}`);
	}
}