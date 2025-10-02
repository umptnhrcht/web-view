import { RedisClientType } from 'redis';

/**
 * Wrapper for RedisJSON get/set operations.
 */
export class RedisJsonHelper {
	constructor(private client: RedisClientType) { }

	/**
	 * Sets a JSON document at the specified key and path.
	 * @param key Redis key
	 * @param path JSON path (usually '$')
	 * @param value JS object to set
	 */
	async set<T>(key: string, path: string, value: T): Promise<void> {
		await this.client.sendCommand([
			'JSON.SET',
			key,
			path,
			JSON.stringify(value)
		]);
	}

	/**
	 * Gets and parses a JSON document at the specified key and path.
	 * @param key Redis key
	 * @param path JSON path (usually '$')
	 */
	async get<T>(key: string, path: string): Promise<T | null> {
		const result = await this.client.sendCommand([
			'JSON.GET',
			key,
			path
		]);
		if (!result || typeof result !== 'string') return null;
		return JSON.parse(result) as T;
	}

	/**
	 * Gets and parses a JSON document at the specified key and path.
	 * @param key Redis key
	 * @param path JSON path (usually '$')
	 */
	async getone<T>(key: string, path: string): Promise<T | null> {
		const result = await this.client.sendCommand([
			'JSON.GET',
			key,
			path
		]);
		if (!result || typeof result !== 'string') return null;
		return (JSON.parse(result) as T[]).at(0) ?? null;
	}
}