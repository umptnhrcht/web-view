import { commands, ExtensionContext } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
// import * as cp from "child_process";
// import * as path from "path";

export function activate(context: ExtensionContext) {
	// Create the show hello world command
	const showHelloWorldCommand = commands.registerCommand("web-view.helloWorld", () => {
		HelloWorldPanel.render(context.extensionUri);
	});

	// Add command to the extension context
	context.subscriptions.push(showHelloWorldCommand);
	
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