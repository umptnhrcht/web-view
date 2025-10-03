import { commands, ExtensionContext, window, workspace } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { PyFilesTreeProvider } from "./file/ConfigurationFilesTreeProvider";
import { ConfigurationLoader } from "./file/ConfigurationLoader";
import * as vscode from "vscode";
// import * as cp from "child_process";
// import * as path from "path";

export function activate(context: ExtensionContext) {
	// Register the refresh button command for the tree view
	const refreshConfTreeCommand = commands.registerCommand("web-view.refreshConfTree", () => {
		pyFilesProvider.setLoading(null); // Clear any loading state
		pyFilesProvider.refresh(); // Refresh the tree
	});
	context.subscriptions.push(refreshConfTreeCommand);
	// Create the show hello world command
	const showHelloWorldCommand = commands.registerCommand("web-view.helloWorld", () => {
		HelloWorldPanel.render(context.extensionUri);
	});

	// Add command to the extension context
	context.subscriptions.push(showHelloWorldCommand);

	// Register the TreeDataProvider for semanticSearchView
	const pyFilesProvider = new PyFilesTreeProvider();
	context.subscriptions.push(
		window.registerTreeDataProvider("semanticSearchView", pyFilesProvider)
	);

	// Register the loadPyFile command for context menu
	const loadPyFileCommand = commands.registerCommand("web-view.loadConfFile", async (item) => {
		if (item && item.resourceUri) {
			pyFilesProvider.setLoading(item.resourceUri.fsPath);
			try {
				const config = await ConfigurationLoader.load(item.resourceUri);
				// Flask is already populated with all reqd data. keep sending requests now.
				pyFilesProvider.setLoading(null);
				vscode.window.showInformationMessage(`Loaded: ${item.resourceUri.fsPath}`);
				// You can add your custom logic here, e.g. use config
			} catch (err: any) {
				pyFilesProvider.setLoading(null);
				vscode.window.showErrorMessage(`Failed to load config: ${err.message}`);
			}
		}
	});
	context.subscriptions.push(loadPyFileCommand);

	// uncomment on prod
	// Spawn Flask embedding service as a background process
	// const flaskScript = path.join(context.extensionPath, "scripts", "run-flask.mjs");
	// const flaskProcess = cp.spawn("node", [flaskScript], {
	// 	cwd: context.extensionPath,
	// 	detached: true,
	// 	stdio: "ignore"
	// });
	// flaskProcess.unref();
}