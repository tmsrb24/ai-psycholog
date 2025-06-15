import axios from 'axios';

interface PubMedArticleChunk {
  articleId: string;
  source: string;
  chunkText: string;
  chunkOrder: number;
}

// Helper function to strip HTML tags
const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

export async function loadAndChunkPubMedArticles(
  query: string = "psychology", 
  maxArticles: number = 3
): Promise<PubMedArticleChunk[]> {
  const allChunks: PubMedArticleChunk[] = [];
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query)}&retmax=${maxArticles}&retmode=json`;
  
  let pmcIds: string[] = [];
  try {
    const searchResponse = await axios.get(searchUrl);
    pmcIds = searchResponse.data?.esearchresult?.idlist || [];
  } catch (error: any) {
    console.error(`[PubMedLoader] Error searching PubMed for query "${query}":`, error.message);
    return [];
  }

  if (pmcIds.length === 0) {
    console.log(`[PubMedLoader] No articles found for query: ${query}`);
    return [];
  }

  console.log(`[PubMedLoader] Found ${pmcIds.length} article IDs. Fetching...`);

  const articleProcessingPromises = pmcIds.map(async (pmcId) => {
    const articleUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcId}/`;
    const articleChunks: PubMedArticleChunk[] = [];
    try {
      const htmlResponse = await axios.get(articleUrl, { timeout: 10000 });
      const html = htmlResponse.data;
      if (!html) return [];

      // Extract title
      const titleMatch = html.match(/<h1 class="content-title"[^>]*>([\s\S]*?)<\/h1>/);
      const title = titleMatch ? stripHtml(titleMatch[1]) : `Article PMC${pmcId}`;

      // Extract abstract
      const abstractMatch = html.match(/<div class="abstract"[^>]*>([\s\S]*?)<\/div>/);
      let abstractText = "";
      if (abstractMatch) {
        const pMatches = [...abstractMatch[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
        abstractText = pMatches.map(m => stripHtml(m[1])).join('\n');
      }
      
      if (abstractText) {
        articleChunks.push({
            articleId: `PMC${pmcId}`,
            source: articleUrl,
            chunkText: `Title: ${title}\nAbstract: ${abstractText}`,
            chunkOrder: 0 
        });
      }
      
      // Extract main content paragraphs
      const bodyMatch = html.match(/<div class="article"[^>]*>([\s\S]*?)<\/div>/) || html.match(/<article[^>]*>([\s\S]*?)<\/article>/);
      if (bodyMatch) {
        const allParagraphs = [...bodyMatch[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)];
        let chunkOrder = abstractText ? 1 : 0;
        
        for (const pMatch of allParagraphs) {
          const pText = stripHtml(pMatch[1]);
          if (pText && pText.length > 50 && !pText.toLowerCase().includes("copyright") && !pText.toLowerCase().includes("figure")) {
            articleChunks.push({
              articleId: `PMC${pmcId}`,
              source: articleUrl,
              chunkText: pText,
              chunkOrder: chunkOrder++
            });
          }
        }
      }
      
      console.log(`[PubMedLoader] Processed and chunked article PMC${pmcId}`);
      return articleChunks;

    } catch (error: any) {
      console.error(`[PubMedLoader] Error fetching or parsing article PMC${pmcId}:`, error.message);
    }
    return [];
  });

  const chunkArrays = await Promise.all(articleProcessingPromises);
  const allProcessedChunks = chunkArrays.flat().filter(Boolean);

  console.log(`[PubMedLoader] Total chunks created: ${allProcessedChunks.length}`);
  return allProcessedChunks;
}
