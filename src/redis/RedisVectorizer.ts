import { RedisConnector } from "./connection";
import { createEmbedding } from "../embedding/embeddingService";
import { RedisJsonHelper } from "./redisHelper";

export class RedisVectorizer {
	/**
	 * Fetches all values for keys matching the pattern. If the value type is JSON, resends the data under a new key.
	 * @param pattern Redis key pattern (e.g. 'user:*')
	 * @param newKeyPrefix Prefix for new keys to store JSON values
	 */
	static async vectorize(payload: any) {

		const pattern = payload.pattern;
		const newKeyPrefix = "new:";
		const indexableFields: string[] = payload.columns.index;
		const embeddableFields: Record<string, string> = Object.fromEntries((payload.columns.vectorize as string[]).map(_ => [_, `${_}_embedding`]));

		const conn = RedisConnector.lastConnection;
		if (!conn) throw new Error("No active Redis connection");

		const client = conn.getClient();
		if (!client) throw new Error("No active Redis client");
		const redisHelper = new RedisJsonHelper(client);

		const keys = await client.keys(pattern + "*");
		let keysFound = keys.length;
		let keysIndexed = 0;

			for (const key of keys) {
				let type = await client.type(key);
				// Check for ReJSON-RL type
				if (type === "none") {
					try {
						const moduleType = await client.sendCommand(["TYPE", key]);
						if (moduleType === "ReJSON-RL") {
							type = "ReJSON-RL";
						}
					} catch { }
				}
				let value: any = null;
				if (type === "ReJSON-RL") {
					value = await redisHelper.getone<any>(key, "$")
					if (value) {
						let indexed = false;
						for (const field of Object.keys(embeddableFields)) {
							if (value.hasOwnProperty(field) && typeof value[field] === "string") {
								try {
									const embedding = await createEmbedding(value[field], "all-MiniLM-L6-v2");
									value[embeddableFields[field]] = embedding;
									indexed = true;

								} catch (err) {
									value[`${field}_embedding`] = null;
								}
							}
						}
						if (indexed) keysIndexed++;
					}
					// Resend JSON data under a new key
					const newKey = `${newKeyPrefix}${key}`;
					await redisHelper.set(newKey, "$", value);
				}
			}
		return { keysFound, keysIndexed, indexableFields, embeddableFields };
	}


	/**
	 * Builds a Redis search index for the given key prefix, using text and vector fields.
	 * @param indexName Name of the index to create
	 * @param keyPrefix Prefix for keys to index
	 * @param indexableFields Array of text field names
	 * @param embeddableFields Object mapping original field names to embedding field names
	 */
	static async buildIndex(indexName: string, keyPrefix: string, indexableFields: string[], embeddableFields: Record<string, string>) {
		const conn = RedisConnector.lastConnection;
		if (!conn) throw new Error("No active Redis connection");
		const client = conn.getClient();
		if (!client) throw new Error("No active Redis client");

		// Drop index if exists
		try {
			await client.sendCommand(["FT.DROPINDEX", indexName, "DD"]);
		} catch {}

		// Build schema
		const schema: string[] = [];
		for (const field of indexableFields) {
			schema.push(`$.${field}`);
			schema.push("AS");
			schema.push(field);
			schema.push("TEXT");
		}
		for (const field of Object.values(embeddableFields)) {
			schema.push(`$.${field}`);
			schema.push("AS");
			schema.push(field);
			schema.push("VECTOR");
			schema.push("FLAT");
			schema.push("6"); // Number of dimensions for MiniLM-L6-v2 (384)
			schema.push("TYPE");
			schema.push("FLOAT32");
			schema.push("DISTANCE_METRIC");
			schema.push("COSINE");
		}

		// Create index
		await client.sendCommand([
			"FT.CREATE",
			indexName,
			"ON", "JSON",
			"PREFIX", "1", keyPrefix,
			"SCHEMA",
			...schema
		]);
		return { indexName, keyPrefix, textFields: indexableFields, vectorFields: Object.values(embeddableFields) };
	}
}
