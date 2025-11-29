// factcheck.js
import { tavily } from "@tavily/core";
const tvly = tavily({  apiKey: process.env.TAVILY_API_KEY });

export async function factCheck({ claim }) {
  // 1) Compose query variants to broaden coverage
  const queries = [
    claim,
    `${claim} news`,
    `${claim} fact check`,
    `${claim} official statement`,
  ];

  const results = [];

  for (const q of queries) {
    try {
      const resp = await tvly.search(q);
      if (resp?.results?.length) {
        resp.results.forEach(r => {
          results.push({
            title: r.title || "",
            url: r.url || "",
            snippet: r.content?.slice(0, 800) || ""
          });
        });
      }
    } catch (err) {
      console.error("tvly.search error:", err);
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  const deduped = results.filter(r => {
    if (!r.url) return false;
    if (seen.has(r.url)) return false;
    seen.add(r.url);
    return true;
  });

  // Build evidence text for LLM summarization
  const evidenceText = deduped.slice(0, 8).map((r, i) => `SOURCE ${i+1}: ${r.title}
${r.url}
${r.snippet}`).join("\n\n");

  // Return structured data LLM expects
  return JSON.stringify({
    claim,
    evidenceText,
    sources: deduped.slice(0, 6).map(s => ({title: s.title, url: s.url}))
  });
}
