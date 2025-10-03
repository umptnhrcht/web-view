import * as vscode from "vscode";
import * as path from "path";


const __CONFIGURATION_EXTENSION = "rconf"

export class PyFilesTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem | undefined | void> = new vscode.EventEmitter<vscode.TreeItem | undefined | void>();
	readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined | void> = this._onDidChangeTreeData.event;

	private loadingFile: string | null = null;

	async getChildren(element?: vscode.TreeItem): Promise<vscode.TreeItem[]> {
		if (element) {
			return [];
		}
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) return [];
		const pyFiles: vscode.TreeItem[] = [];
		for (const folder of workspaceFolders) {
			const files = await vscode.workspace.findFiles(new vscode.RelativePattern(folder, `**/*.${__CONFIGURATION_EXTENSION}`));
			for (const file of files) {
				const item = new vscode.TreeItem(path.basename(file.fsPath));
				item.contextValue = "pyFile";
				item.resourceUri = file;
				item.command = {
					command: "web-view.loadConfFile",
					title: "Load Configuration",
					arguments: [item]
				};
				pyFiles.push(item);
			}
		}
		return pyFiles;
	}

	getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
		// Show animated SVG spinner if this item is loading
		if (element.resourceUri && this.loadingFile === element.resourceUri.fsPath) {
			const spinnerPath = path.join(__dirname, '../assets/spinner.svg');
			element.iconPath = spinnerPath;
		}
		return element;
	}

	setLoading(filePath: string | null) {
		this.loadingFile = filePath;
		this._onDidChangeTreeData.fire();
	}

	public refresh() {
		this._onDidChangeTreeData.fire();
	}
}
