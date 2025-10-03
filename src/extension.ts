import { commands, ExtensionContext, window } from "vscode";
import { HelloWorldPanel } from "./panels/HelloWorldPanel";
import { PyFilesTreeProvider } from "./file/ConfigurationFilesTreeProvider";
import { ConfigurationLoader } from "./file/ConfigurationLoader";
import * as vscode from "vscode";
import RedisWrapper from "./adapter/rediswrapper";
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

    // Define chat participant
    const handler: vscode.ChatRequestHandler = async (
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ) => {
        const userPrompt = request.prompt;
        const metaContext = await RedisWrapper.search(userPrompt, true)

        // init the user prompt
        const messages = [vscode.LanguageModelChatMessage.User(userPrompt)];

        // add in the metadata ffom redis
        messages.push(vscode.LanguageModelChatMessage.User(metaContext));

        // send the request
        const chatResponse = await request.model.sendRequest(messages, {}, token);

        const markdown = 'Hover over this <span title="This is the hover text!">word</span> to see a tooltip.';

        stream.markdown(markdown);

        // stream the response
        for await (const fragment of chatResponse.text) {
            console.log(fragment);
            stream.markdown(fragment);
        }
        return;
    };

    // create participant
    const tutor = vscode.chat.createChatParticipant('redis-context.helper', handler);

    // add icon to participant
    tutor.iconPath = vscode.Uri.joinPath(context.extensionUri, 'assets' ,'tutor.jpeg');



    // Add command to the extension context
    context.subscriptions.push(showHelloWorldCommand);

    // Register the TreeDataProvider for semanticSearchView
    const pyFilesProvider = new PyFilesTreeProvider();
    context.subscriptions.push(
        window.registerTreeDataProvider("semanticSearchView", pyFilesProvider)
    );

    // Register search command
    const searchCommand = commands.registerCommand("web-view.search", async (arg) => {
        const query = await vscode.window.showInputBox({
            prompt: "Enter your semantic search query",
            placeHolder: "Type your query here...",
            title: "Query"
        });
        if (query) {
            const result = await RedisWrapper.search(query, true);
            const formattted_query = `question: ${query}, context: ${result}`
            await vscode.commands.executeCommand("workbench.action.chat.open");
            await new Promise(resolve => setTimeout(resolve, 300));
            await vscode.commands.executeCommand("workbench.action.chat.copyToChat", formattted_query);
            console.log(result);
        }
    });
    context.subscriptions.push(searchCommand);

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