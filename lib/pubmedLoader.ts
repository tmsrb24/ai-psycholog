import axios from 'axios';
import { JSDOM } from 'jsdom';

interface PubMedArticleChunk {
  articleId: string;
  source: string;
  chunkText: string;
  chunkOrder: number; // To maintain order if needed
}

export async function loadAndChunkPubMedArticles(
  query: string = "psychology", 
  maxArticles: number = 3 // Keep low for lite version
): Promise<PubMedArticleChunk[]> {
  const allChunks: PubMedArticleChunk[] = [];
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pmc&term=${encodeURIComponent(query)}&retmax=${maxArticles}&retmode=json`;
  
  let pmcIds: string[] = [];
  try {
    const searchResponse = await axios.get(searchUrl);
    if (searchResponse.data && searchResponse.data.esearchresult && searchResponse.data.esearchresult.idlist) {
      pmcIds = searchResponse.data.esearchresult.idlist;
    } else {
      console.warn(`[PubMedLoader] No IDs found or unexpected format for query: ${query}`, searchResponse.data);
      return [];
    }
  } catch (error: any) {
    console.error(`[PubMedLoader] Error searching PubMed for query "${query}":`, error.message);
    return [];
  }

  if (pmcIds.length === 0) {
    console.log(`[PubMedLoader] No articles found for query: ${query}`);
    return [];
  }

  console.log(`[PubMedLoader] Found ${pmcIds.length} article IDs. Fetching and chunking...`);

  for (const pmcId of pmcIds) {
    const articleUrl = `https://www.ncbi.nlm.nih.gov/pmc/articles/PMC${pmcId}/`;
    try {
      const htmlResponse = await axios.get(articleUrl, { timeout: 10000 }); // 10s timeout
      const html = htmlResponse.data;
      if (html) {
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        const title = document.querySelector('h1.content-title')?.textContent?.trim() || `Article PMC${pmcId}`;

        let abstractText = "";
        const abstractSection = document.querySelector('div.abstract, section[data-abstract]') ; 
        if (abstractSection) {
            const abstractParagraphs = Array.from(abstractSection.querySelectorAll("p")) as HTMLParagraphElement[];
            abstractText = abstractParagraphs.map(p => p.textContent?.trim()).filter(Boolean).join("\n");
        }
        
        if (abstractText) {
            allChunks.push({
                articleId: `PMC${pmcId}`,
                source: articleUrl,
                chunkText: `Title: ${title}\nAbstract: ${abstractText}`,
                chunkOrder: 0 
            });
        }
        
        const mainContentElement = document.querySelector('div.article, div.main-content, article'); 
        const contentElement = mainContentElement || document.body; 

        const paragraphs = Array.from(contentElement.querySelectorAll("p")) as HTMLParagraphElement[];
        let chunkOrder = abstractText ? 1 : 0;

        for (const p of paragraphs) {
          const pText = p.textContent?.trim();
          if (pText && (!abstractSection || !abstractSection.contains(p))) { 
            if (pText.length < 50 || pText.toLowerCase().includes("copyright") || pText.toLowerCase().includes("figure")) {
                continue;
            }
            allChunks.push({
              articleId: `PMC${pmcId}`,
              source: articleUrl,
              chunkText: pText,
              chunkOrder: chunkOrder++
            });
          }
        }
        console.log(`[PubMedLoader] Processed and chunked article PMC${pmcId}`);
      }
    } catch (error: any) {
      console.error(`[PubMedLoader] Error fetching or parsing article PMC${pmcId} from ${articleUrl}:`, error.message);
    }
  }
  console.log(`[PubMedLoader] Total chunks created: ${allChunks.length}`);
  return allChunks;
}

// Example usage (for testing):
// async function main() {
//   const chunks = await loadAndChunkPubMedArticles("cognitive behavioral therapy", 2);
//   chunks.forEach(chunk => {
//     console.log(`\n--- Chunk from ${chunk.articleId} (Source: ${chunk.source}) ---`);
//     console.log(chunk.chunkText.substring(0, 200) + "...");
//   });
// }
// main();
