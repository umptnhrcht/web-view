class GlobalEventHandler {
    private static instance: GlobalEventHandler;
    private callbackStore: Record<string, { callback: Function, args?: any }> = {};

    private constructor() {
        window.addEventListener('message', this.handleEvent.bind(this));
    }

    public static getInstance(): GlobalEventHandler {
        if (!GlobalEventHandler.instance) {
            GlobalEventHandler.instance = new GlobalEventHandler();
        }
        return GlobalEventHandler.instance;
    }

    public register(id: string, callback: Function, args?: any) {
        this.callbackStore[id] = { callback, args };
    }

    private handleEvent(event: MessageEvent) {
        if (event.data && event.data.id && this.callbackStore[event.data.id]) {
            const storeEntry = this.callbackStore[event.data.id];
            storeEntry.callback({
                externalpayload: event.data,
                args: storeEntry.args
            });
            delete this.callbackStore[event.data.id];
        }
    }
}

export default GlobalEventHandler;
