// embeddingService.ts
// Dummy implementation for local development. Replace with actual API integration for production.

/**
 * Creates a vector embedding for the given text using the specified model.
 * @param text The input text to embed
 * @param model The embedding model to use (e.g., 'all-MiniLM-L6-v2')
 * @returns Promise<number[]> The embedding vector
 */
export async function createEmbedding(text: string, model: string): Promise<number[]> {
  // Simulate an embedding with random numbers for local testing
  // Replace this with a call to an actual embedding API/service
  const dimension = 384; // all-MiniLM-L6-v2 output size
  return Array.from({ length: dimension }, () => Math.random());
}
