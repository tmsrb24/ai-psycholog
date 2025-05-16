/**
 * Service for generating embeddings for documents and queries
 * In a production environment, this would use a proper embedding model API
 */

/**
 * Simple embedding service that uses a mock embedding function
 * In a real application, this would call an embedding API like OpenAI's text-embedding-ada-002
 */
export class EmbeddingService {
  private readonly dimensions: number;
  
  constructor(dimensions: number = 384) {
    this.dimensions = dimensions;
  }
  
  /**
   * Generate an embedding for a text
   * @param text The text to embed
   * @returns The embedding vector
   */
  async embedText(text: string): Promise<number[]> {
    // In a real implementation, this would call an embedding API
    // For now, we'll use a deterministic mock function
    return this.mockEmbedding(text);
  }
  
  /**
   * Generate embeddings for multiple texts
   * @param texts Array of texts to embed
   * @returns Array of embedding vectors
   */
  async embedTexts(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(text => this.embedText(text)));
  }
  
  /**
   * Mock embedding function that generates deterministic vectors based on text content
   * This is only for demonstration purposes and should be replaced with a real embedding model
   * @param text The text to embed
   * @returns A mock embedding vector
   */
  private mockEmbedding(text: string): number[] {
    // Create a simple hash of the text
    const hash = this.simpleHash(text);
    
    // Generate a deterministic vector based on the hash
    const embedding = new Array(this.dimensions).fill(0);
    for (let i = 0; i < this.dimensions; i++) {
      // Use the hash to seed a simple PRNG
      const value = Math.sin(hash * (i + 1)) * 0.5 + 0.5;
      embedding[i] = value;
    }
    
    // Normalize the vector
    return this.normalize(embedding);
  }
  
  /**
   * Simple hash function for strings
   * @param text The text to hash
   * @returns A numeric hash
   */
  private simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }
  
  /**
   * Normalize a vector to unit length
   * @param vector The vector to normalize
   * @returns The normalized vector
   */
  private normalize(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) {
      return vector;
    }
    return vector.map(val => val / magnitude);
  }
}
