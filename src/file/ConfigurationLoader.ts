import * as vscode from "vscode";

export class ConfigurationLoader {
    private static _instance: ConfigurationLoader;
    private static _currentController: AbortController | null = null;

    private constructor() {}

    public static get instance(): ConfigurationLoader {
        if (!ConfigurationLoader._instance) {
            ConfigurationLoader._instance = new ConfigurationLoader();
        }
        return ConfigurationLoader._instance;
    }

    public static async load(uri: vscode.Uri): Promise<any> {
        // Abort any previous load
        if (ConfigurationLoader._currentController) {
            ConfigurationLoader._currentController.abort();
        }
        const controller = new AbortController();
        ConfigurationLoader._currentController = controller;

        // Reads the file and parses its content as JSON
        try {
            const bytes = await vscode.workspace.fs.readFile(uri);
            if (controller.signal.aborted) {
                throw new Error("Load aborted by a newer request.");
            }
            const text = Buffer.from(bytes).toString("utf8");
            return JSON.parse(text);
        } catch (err) {
            if (controller.signal.aborted) {
                throw new Error("Load aborted by a newer request.");
            }
            throw new Error("Invalid JSON in configuration file: " + err);
        } finally {
            // Only clear if this is the latest controller
            if (ConfigurationLoader._currentController === controller) {
                ConfigurationLoader._currentController = null;
            }
        }
    }
}
