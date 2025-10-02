const EMBED_SERVICE_URL = "http://localhost:5100/embed"


/**
 * Creates a vector embedding for the given text using the specified model.
 * @param text The input text to embed
 * @param model The embedding model to use (e.g., 'all-MiniLM-L6-v2')
 * @returns Promise<number[]> The embedding vector
 */
export async function createEmbedding(text: string, model: string): Promise<number[]> {

	const payload = { text }

	const request = new Request(EMBED_SERVICE_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json'
		},
		body: JSON.stringify(payload)
	})

	const res = await fetch(request);
	if (res.ok) {
		const json = await res.json() as {embedding: number[]};
		return json.embedding;
	}

	throw Error("failed to gather embeddings.");
}
