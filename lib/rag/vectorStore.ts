import { Document, VectorizedDocument, SearchResult, RagOptions } from './types';

/**
 * Simple in-memory vector store for RAG
 * In a production environment, this would be replaced with a proper vector database
 */
export class InMemoryVectorStore {
  private documents: VectorizedDocument[] = [];
  
  /**
   * Add a document to the vector store
   * @param document The document to add
   * @param embedding The embedding vector for the document
   */
  async addDocument(document: Document, embedding: number[]): Promise<void> {
    this.documents.push({
      ...document,
      embedding
    });
  }
  
  /**
   * Add multiple documents to the vector store
   * @param documents The documents to add with their embeddings
   */
  async addDocuments(documents: VectorizedDocument[]): Promise<void> {
    this.documents.push(...documents);
  }
  
  /**
   * Search for similar documents using cosine similarity
   * @param queryEmbedding The embedding vector for the query
   * @param options Search options
   * @returns Array of search results sorted by similarity score
   */
  async search(queryEmbedding: number[], options: RagOptions = {}): Promise<SearchResult[]> {
    const { 
      maxDocuments = 3, 
      similarityThreshold = 0.7,
      includeMetadata = true
    } = options;
    
    // Calculate cosine similarity for each document
    const results = this.documents.map(doc => {
      const score = this.cosineSimilarity(queryEmbedding, doc.embedding);
      return {
        document: includeMetadata ? doc : { 
          id: doc.id, 
          content: doc.content, 
          metadata: {} 
        },
        score
      };
    });
    
    // Filter by threshold and sort by score (descending)
    return results
      .filter(result => result.score >= similarityThreshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxDocuments);
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param vecA First vector
   * @param vecB Second vector
   * @returns Cosine similarity score (0-1)
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensions');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Get all documents in the vector store
   * @returns All documents
   */
  getAllDocuments(): VectorizedDocument[] {
    return [...this.documents];
  }
  
  /**
   * Clear all documents from the vector store
   */
  clear(): void {
    this.documents = [];
  }
}
