import { createClient, RedisClientType } from 'redis';

export type RedisConnectionMode = 'default' | 'connectString' | 'hostPort';

export interface RedisConnectorParams {
	mode: RedisConnectionMode;
	host?: string;
	port?: number;
	user?: string;
	password?: string;
	connectString?: string;
}

export abstract class RedisConnector {
	private static _lastConnection: RedisConnector | null = null;

	public static async create(params: RedisConnectorParams): Promise<RedisConnector> {
		let connector: RedisConnector;
		switch (params.mode) {
			case 'default':
				connector = new ConnectDefault();
				break;
			case 'connectString':
				if (!params.connectString) throw new Error('connectString required for connectString mode');
				connector = new ConnectWithConnectString(params.connectString);
				break;
			case 'hostPort':
				if (!params.host || !params.port) throw new Error('host and port required for hostPort mode');
				connector = new ConnectWithUserPass(params.host, params.port, params.user, params.password);
				break;
			default:
				throw new Error('Invalid connection mode');
		}
		await connector.connect();
		RedisConnector._lastConnection = connector;
		return connector;
	}

		public getClient(): RedisClientType | null {
			return this.client;
		}
	public static get lastConnection(): RedisConnector | null {
		return RedisConnector._lastConnection;
	}

	public static hasLastConnection(): boolean {
		return RedisConnector._lastConnection !== null;
	}

	protected client: RedisClientType | null = null;
	abstract connect(): Promise<void>;
	async ping(): Promise<boolean> {
		try {
			if (!this.client) return false;
			const data = await this.client.ping();
			console.log(data);
			return true;
		} catch (err) {
			console.error('Redis ping error:', err);
			return false;
		}
	}
	async quit(): Promise<void> {
		if (this.client) await this.client.quit();
	}
}

export class ConnectDefault extends RedisConnector {
	async connect(): Promise<void> {
		this.client = createClient();
		await this.client.connect();
	}
}

export class ConnectWithConnectString extends RedisConnector {
	constructor(private readonly connectionString: string) {
		super();
	}
	async connect(): Promise<void> {
		this.client = createClient({ url: this.connectionString });
		await this.client.connect();
	}
}

export class ConnectWithUserPass extends RedisConnector {
	constructor(
		private readonly host: string,
		private readonly port: number,
		private readonly user?: string,
		private readonly password?: string
	) {
		super();
	}
	async connect(): Promise<void> {
		let url = 'redis://';
		if (this.user && this.password) {
			url += `${this.user}:${this.password}@`;
		}
		url += `${this.host}:${this.port}`;
		this.client = createClient({ url });
		await this.client.connect();
	}
}