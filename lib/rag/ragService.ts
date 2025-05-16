import { Document, SearchResult, RagOptions } from './types';
import { InMemoryVectorStore } from './vectorStore';
import { EmbeddingService } from './embeddingService';

/**
 * Main RAG (Retrieval-Augmented Generation) service
 * Combines document storage, embedding, and retrieval
 */
export class RagService {
  private vectorStore: InMemoryVectorStore;
  private embeddingService: EmbeddingService;
  
  constructor() {
    this.vectorStore = new InMemoryVectorStore();
    this.embeddingService = new EmbeddingService();
  }
  
  /**
   * Add a document to the RAG system
   * @param document The document to add
   */
  async addDocument(document: Document): Promise<void> {
    const embedding = await this.embeddingService.embedText(document.content);
    await this.vectorStore.addDocument(document, embedding);
  }
  
  /**
   * Add multiple documents to the RAG system
   * @param documents The documents to add
   */
  async addDocuments(documents: Document[]): Promise<void> {
    // Process documents in batches to avoid memory issues with large collections
    const batchSize = 100;
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const contents = batch.map(doc => doc.content);
      const embeddings = await this.embeddingService.embedTexts(contents);
      
      const vectorizedDocs = batch.map((doc, index) => ({
        ...doc,
        embedding: embeddings[index]
      }));
      
      await this.vectorStore.addDocuments(vectorizedDocs);
    }
  }
  
  /**
   * Query the RAG system to find relevant documents
   * @param query The query text
   * @param options Search options
   * @returns Array of search results
   */
  async query(query: string, options: RagOptions = {}): Promise<SearchResult[]> {
    const queryEmbedding = await this.embeddingService.embedText(query);
    return this.vectorStore.search(queryEmbedding, options);
  }
  
  /**
   * Generate context for an LLM prompt based on a query
   * @param query The query text
   * @param options Search options
   * @returns A string containing the retrieved context
   */
  async generateContext(query: string, options: RagOptions = {}): Promise<string> {
    const results = await this.query(query, options);
    
    if (results.length === 0) {
      return "";
    }
    
    // Format the results into a context string
    return results.map(result => {
      const doc = result.document;
      const metadata = doc.metadata;
      const source = metadata.source ? `Source: ${metadata.source}` : '';
      const title = metadata.title ? `Title: ${metadata.title}` : '';
      
      const header = [title, source].filter(Boolean).join(' | ');
      
      return `${header ? header + '\n' : ''}${doc.content}`;
    }).join('\n\n');
  }
  
  /**
   * Clear all documents from the RAG system
   */
  clear(): void {
    this.vectorStore.clear();
  }
  
  /**
   * Get the vector store instance
   * @returns The vector store
   */
  getVectorStore(): InMemoryVectorStore {
    return this.vectorStore;
  }
  
  /**
   * Get the embedding service instance
   * @returns The embedding service
   */
  getEmbeddingService(): EmbeddingService {
    return this.embeddingService;
  }
}

// Create a singleton instance for use throughout the application
export const ragService = new RagService();
