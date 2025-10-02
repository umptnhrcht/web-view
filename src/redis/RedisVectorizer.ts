import { RedisConnector } from "./connection";
import { createEmbedding } from "../embedding/embeddingService"; // You must implement this service or use an API

export class RedisVectorizer {
  /**
   * Fetches all values for keys matching the pattern. If the value type is JSON, resends the data under a new key.
   * @param pattern Redis key pattern (e.g. 'user:*')
   * @param newKeyPrefix Prefix for new keys to store JSON values
   */
  static async vectorize(payload: any) {

	const pattern = payload.pattern;
	const newKeyPrefix = "new:";
	const indexableFields: string[] =  payload.index;
	const embeddableFields: Record<string, string> = Object.fromEntries((payload.vectorize as string[]).map(_ => [_, ""]));

    const conn = RedisConnector.lastConnection;
    if (!conn) throw new Error("No active Redis connection");
    const client = conn.getClient();
    if (!client) throw new Error("No active Redis client");
    const keys = await client.keys(pattern + "*");
    for (const key of keys) {
      let type = await client.type(key);
      // Check for ReJSON-RL type
      if (type === "none") {
        try {
          const moduleType = await client.sendCommand(["TYPE", key]);
          if (moduleType === "ReJSON-RL") {
            type = "ReJSON-RL";
          }
        } catch {}
      }
      let value: any = null;
      if (type === "ReJSON-RL") {
        const rawJson = await client.sendCommand(["JSON.GET", key]);
        if (typeof rawJson === "string") {
          try {
            value = JSON.parse(rawJson);
            // Check for embeddable fields and create embeddings
            for (const field of Object.keys(embeddableFields)) {
              if (value.hasOwnProperty(field) && typeof value[field] === "string") {
                // Call embedding service for the field value
                try {
                  const embedding = await createEmbedding(value[field], "all-MiniLM-L6-v2");
                  value[`${field}_embedding`] = embedding;
                } catch (err) {
                  value[`${field}_embedding`] = null;
                }
              }
            }
          } catch {
            value = rawJson;
          }
        } else {
          value = rawJson;
        }
        // Resend JSON data under a new key
        const newKey = `${newKeyPrefix}${key}`;
        await client.set(newKey, JSON.stringify(value));
      }
    }
  }
}
