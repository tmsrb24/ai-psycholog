/**
 * Types for the RAG (Retrieval-Augmented Generation) system
 */

export interface Document {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    category?: string;
    tags?: string[];
    [key: string]: any;
  };
}

export interface VectorizedDocument extends Document {
  embedding: number[];
}

export interface SearchResult {
  document: Document;
  score: number;
}

export interface RagOptions {
  maxDocuments?: number;
  similarityThreshold?: number;
  includeMetadata?: boolean;
}
