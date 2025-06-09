import { pipeline, Pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { loadAndChunkPubMedArticles } from './pubmedLoader'; // Assuming pubmedLoader.ts is in the same dir or correct path

interface PubMedArticleChunk {
  articleId: string;
  source: string;
  chunkText: string;
  chunkOrder: number;
}

interface StoredChunk extends PubMedArticleChunk {
  embedding: number[];
}

let embedder: FeatureExtractionPipeline | null = null;
let storedPubMedChunks: StoredChunk[] = [];
let isPubMedDataInitialized = false;

// Helper function to calculate cosine similarity
function calculateCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length || vecA.length === 0) {
    return 0;
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

export async function initializePubMedRAG(
  query: string = "psychology therapeutic techniques", 
  maxArticles: number = 3 // Keep low for initial lite version
): Promise<void> {
  if (isPubMedDataInitialized) {
    console.log('[RAGPubMedService] PubMed data already initialized.');
    return;
  }

  console.log('[RAGPubMedService] Initializing PubMed RAG data...');
  try {
    if (!embedder) {
      console.log('[RAGPubMedService] Loading embedding model Xenova/all-MiniLM-L6-v2...');
      embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // Use quantized model for faster loading & smaller size if acceptable
      });
      console.log('[RAGPubMedService] Embedding model loaded.');
    }

    const rawChunks = await loadAndChunkPubMedArticles(query, maxArticles);
    if (rawChunks.length === 0) {
      console.warn('[RAGPubMedService] No chunks loaded from PubMed.');
      isPubMedDataInitialized = true; // Mark as initialized even if empty to prevent re-attempts
      return;
    }

    console.log(`[RAGPubMedService] Generating embeddings for ${rawChunks.length} PubMed chunks...`);
    storedPubMedChunks = []; // Clear previous chunks if any

    for (const chunk of rawChunks) {
      if (embedder) {
        const output = await embedder(chunk.chunkText, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data as Float32Array); // Ensure it's a plain array
        storedPubMedChunks.push({ ...chunk, embedding });
      }
    }
    isPubMedDataInitialized = true;
    console.log(`[RAGPubMedService] PubMed RAG initialized with ${storedPubMedChunks.length} chunks.`);
  } catch (error: any) {
    console.error('[RAGPubMedService] Error initializing PubMed RAG:', error.message);
    // Do not set isPubMedDataInitialized to true on error, so it might retry or indicate failure
  }
}

export async function searchPubMedRAG(
  userQuery: string, 
  topK: number = 3
): Promise<{ chunkText: string; source: string; score: number }[]> {
  if (!isPubMedDataInitialized || !embedder || storedPubMedChunks.length === 0) {
    console.warn('[RAGPubMedService] PubMed RAG not initialized or no chunks available.');
    return [];
  }

  try {
    console.log(`[RAGPubMedService] Searching for relevant PubMed chunks for query: "${userQuery}"`);
    const queryOutput = await embedder(userQuery, { pooling: 'mean', normalize: true });
    const queryEmbedding = Array.from(queryOutput.data as Float32Array);

    const scoredChunks = storedPubMedChunks.map(chunk => ({
      chunkText: chunk.chunkText,
      source: chunk.source,
      score: calculateCosineSimilarity(queryEmbedding, chunk.embedding)
    }));

    scoredChunks.sort((a, b) => b.score - a.score); // Sort by score descending

    console.log(`[RAGPubMedService] Top ${topK} chunks found with scores:`, scoredChunks.slice(0, topK).map(c => ({source: c.source, score: c.score.toFixed(4)})));
    return scoredChunks.slice(0, topK);

  } catch (error: any) {
    console.error('[RAGPubMedService] Error searching PubMed RAG:', error.message);
    return [];
  }
}

// Optional: A way to get initialization status or trigger re-initialization
export function getPubMedRAGStatus() {
  return {
    isInitialized: isPubMedDataInitialized,
    chunkCount: storedPubMedChunks.length,
  };
}
