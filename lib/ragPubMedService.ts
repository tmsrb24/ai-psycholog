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

    if (embedder && rawChunks.length > 0) {
      const chunkTexts = rawChunks.map(c => c.chunkText);
      try {
        console.log(`[RAGPubMedService] Starting batch embedding for ${chunkTexts.length} texts.`);
        const outputs = await embedder(chunkTexts, { pooling: 'mean', normalize: true });
        console.log(`[RAGPubMedService] Batch embedding completed.`);

        // Assuming 'outputs.data' is a flat Float32Array for all embeddings concatenated
        // and 'outputs.dims' gives dimensions, e.g., [num_texts, embedding_dim]
        // Or, if the structure is different, this part needs adjustment based on Xenova's actual batched output.
        // For now, let's assume a common pattern: output.data is flat, output.dims tells us structure.
        if (outputs.data && typeof outputs.dims === 'object' && outputs.dims.length === 2) {
          const batchOutputData = outputs.data as Float32Array;
          const numEmbeddingsInBatch = outputs.dims[0];
          const embeddingDim = outputs.dims[1];

          if (numEmbeddingsInBatch === rawChunks.length && batchOutputData.length === numEmbeddingsInBatch * embeddingDim) {
            for (let i = 0; i < numEmbeddingsInBatch; i++) {
              const embedding = Array.from(batchOutputData.slice(i * embeddingDim, (i + 1) * embeddingDim));
              storedPubMedChunks.push({ ...rawChunks[i], embedding });
            }
          } else {
            console.error('[RAGPubMedService] Mismatch in batch embedding dimensions or count. Falling back to sequential.');
            // Fallback to sequential if batch processing assumptions are wrong or fail
            for (const chunk of rawChunks) {
              const output = await embedder(chunk.chunkText, { pooling: 'mean', normalize: true });
              const embedding = Array.from(output.data as Float32Array);
              storedPubMedChunks.push({ ...chunk, embedding });
            }
          }
        } else {
           console.warn('[RAGPubMedService] Unexpected output structure from batch embedding. Falling back to sequential.');
           // Fallback for unexpected structure
           for (const chunk of rawChunks) {
             const output = await embedder(chunk.chunkText, { pooling: 'mean', normalize: true });
             const embedding = Array.from(output.data as Float32Array);
             storedPubMedChunks.push({ ...chunk, embedding });
           }
        }
      } catch (batchError: any) {
        console.error('[RAGPubMedService] Error during batch embedding, falling back to sequential:', batchError.message);
        // Fallback to sequential on any batch processing error
        for (const chunk of rawChunks) {
          // Ensure embedder is still valid if an error occurred
          if (embedder) {
            try {
              const output = await embedder(chunk.chunkText, { pooling: 'mean', normalize: true });
              const embedding = Array.from(output.data as Float32Array);
              storedPubMedChunks.push({ ...chunk, embedding });
            } catch (seqError: any) {
              console.error(`[RAGPubMedService] Error during sequential fallback for chunk "${chunk.chunkText.substring(0,20)}...":`, seqError.message);
            }
          }
        }
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
