import { RedisConnector } from "./connection";

export class InfetDataType {
	/**
	 * Fetches all keys from Redis matching the given pattern using the last connection.
	 * @param pattern Redis key pattern (e.g. 'user:*')
	 */
	static async infer(pattern: string): Promise<Array<{ column: string, types: string[] }>> {
		const conn = RedisConnector.lastConnection;
		if (!conn) throw new Error('No active Redis connection');
		const client = conn.getClient();
		if (!client) throw new Error('No active Redis client');
		// Use SCAN for large keyspaces, but KEYS for simplicity here
		let data = await client.keys(pattern + '*');
		// Limit to 50 results
		if (data.length > 50) {
			data = data.slice(0, 50);
		}
		// Pick 5 random results from the set
		const picked: string[] = [];
		const used = new Set<number>();
		const max = Math.min(5, data.length);
		while (picked.length < max) {
			const idx = Math.floor(Math.random() * data.length);
			if (!used.has(idx)) {
				picked.push(data[idx]);
				used.add(idx);
			}
		}
		// Fetch values for all picked keys, regardless of type
		const results: { key: string, type: string, value: any }[] = [];
		for (const key of picked) {
			let type = 'none';
			let value: any = null;
			try {
				type = await client.type(key);
				// Check module type for ReJSON-RL
				if (type === 'none') {
					// Try module info for ReJSON-RL
					try {
						const moduleType = await client.sendCommand(['TYPE', key]);
						if (moduleType === 'ReJSON-RL') {
							type = 'ReJSON-RL';
						}
					} catch {}
				}
				switch (type) {
					case 'string':
						value = await client.get(key);
						break;
					case 'hash':
						value = await client.hGetAll(key);
						break;
					case 'list':
						value = await client.lRange(key, 0, -1);
						break;
					case 'set':
						value = await client.sMembers(key);
						break;
					case 'zset':
						value = await client.zRange(key, 0, -1);
						break;
					case 'ReJSON-RL':
						// Use JSON.GET for ReJSON-RL keys
						const rawJson = await client.sendCommand(['JSON.GET', key]);
						try {
							if (typeof rawJson === 'string') {
								value = rawJson ? JSON.parse(rawJson) : null;
							} else {
								value = rawJson;
							}
						} catch (err) {
							value = rawJson;
						}
						break;
					default:
						value = null;
				}
			} catch (err) {
				value = null;
			}
			results.push({ key, type, value });
		}
		console.log(results);

		// Infer column types from JSON results only
		const columnTypes: Record<string, Set<string>> = {};
		for (const item of results) {
			if (item.type !== 'ReJSON-RL' || typeof item.value !== 'object' || item.value === null) continue;
			// Flatten top-level keys and their types
			for (const [key, val] of Object.entries(item.value)) {
				const valType = Array.isArray(val) ? 'array' : typeof val;
				if (!columnTypes[key]) columnTypes[key] = new Set();
				columnTypes[key].add(valType);
			}
		}
		// Format as array of { column: string, types: string[] }
		const inferredColumns = Object.entries(columnTypes).map(([column, types]) => ({ column, types: Array.from(types) }));
		return inferredColumns;
	}
}