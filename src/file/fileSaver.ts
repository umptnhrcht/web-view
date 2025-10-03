import { window, workspace } from "vscode";

export async function saveFile() {
	try {
		// Ask user where to save the file
		const uri = await window.showSaveDialog({
			filters: { 'Text files': ['txt'], 'All files': ['*'] }
		});

		if (!uri) {
			window.showInformationMessage('Save cancelled.');
			return;
		}

		const content = "Hello, VS Code! File saved via extension 🚀";

		// Save the file
		await workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));

		window.showInformationMessage(`File saved: ${uri.fsPath}`);
	} catch (err: any) {
		window.showErrorMessage(`Error saving file: ${err.message}`);
	}
}