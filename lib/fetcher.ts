import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { Analyst, AnalystPost } from "./analysts";

const rssParser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; InvestmentDashboard/1.0; +https://github.com)",
  },
});

async function fetchRSS(url: string, analyst: Analyst): Promise<AnalystPost[]> {
  const feed = await rssParser.parseURL(url);
  return (feed.items || []).slice(0, 5).map((item) => ({
    analystId: analyst.id,
    analystName: analyst.displayName,
    title: item.title || "Untitled",
    summary: stripHtml(item.contentSnippet || item.summary || item.content || ""),
    url: item.link || url,
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    content: stripHtml(item.content || item.contentSnippet || ""),
    tags: analyst.tags,
  }));
}

async function fetchWeb(url: string, analyst: Analyst): Promise<AnalystPost[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
    },
    signal: AbortSignal.timeout(12000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const posts: AnalystPost[] = [];

  // Generic article/post extraction
  const selectors = [
    "article",
    ".post",
    ".entry",
    ".blog-post",
    ".newsletter-item",
    "[class*='post']",
    "[class*='article']",
  ];

  for (const selector of selectors) {
    const elements = $(selector);
    if (elements.length > 0) {
      elements.slice(0, 5).each((_, el) => {
        const titleEl = $(el).find("h1, h2, h3, h4").first();
        const title = titleEl.text().trim();
        if (!title) return;

        const linkEl = titleEl.find("a").first().length
          ? titleEl.find("a").first()
          : $(el).find("a").first();
        const href = linkEl.attr("href") || "";
        const postUrl = href.startsWith("http")
          ? href
          : href
          ? new URL(href, url).toString()
          : url;

        const dateEl = $(el).find("time, .date, [class*='date'], [class*='time']").first();
        const dateText = dateEl.attr("datetime") || dateEl.text().trim();

        const bodyEl = $(el).find("p").first();
        const summary = bodyEl.text().trim().slice(0, 400);

        if (title.length > 10) {
          posts.push({
            analystId: analyst.id,
            analystName: analyst.displayName,
            title,
            summary: summary || `Latest content from ${analyst.displayName}`,
            url: postUrl,
            publishedAt: parseDateString(dateText) || new Date().toISOString(),
            tags: analyst.tags,
          });
        }
      });
      if (posts.length > 0) break;
    }
  }

  // Fallback: grab all meaningful links with text
  if (posts.length === 0) {
    $("a").each((_, el) => {
      const text = $(el).text().trim();
      const href = $(el).attr("href") || "";
      if (text.length > 30 && text.length < 200 && href) {
        const postUrl = href.startsWith("http")
          ? href
          : new URL(href, url).toString();
        posts.push({
          analystId: analyst.id,
          analystName: analyst.displayName,
          title: text,
          summary: `Article from ${analyst.displayName}`,
          url: postUrl,
          publishedAt: new Date().toISOString(),
          tags: analyst.tags,
        });
      }
      return posts.length < 5;
    });
  }

  return posts.slice(0, 5);
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
}

function parseDateString(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString();
  } catch {}
  return null;
}

export async function fetchAnalystContent(analyst: Analyst): Promise<AnalystPost[]> {
  const posts: AnalystPost[] = [];

  for (const source of analyst.sources) {
    try {
      if (source.type === "rss") {
        const items = await fetchRSS(source.url, analyst);
        posts.push(...items);
      } else if (source.type === "web") {
        const items = await fetchWeb(source.url, analyst);
        posts.push(...items);
      } else if (source.type === "twitter") {
        // Twitter requires auth; return placeholder with link
        posts.push({
          analystId: analyst.id,
          analystName: analyst.displayName,
          title: `Follow ${analyst.name} on X/Twitter`,
          summary: `${analyst.description}. Click to view latest posts from ${source.label}.`,
          url: source.url,
          publishedAt: new Date().toISOString(),
          tags: analyst.tags,
        });
      } else if (source.type === "manual") {
        posts.push({
          analystId: analyst.id,
          analystName: analyst.displayName,
          title: `${analyst.name} — Newsletter`,
          summary: `${analyst.description}. Subscribe to ${source.label} for institutional macro research.`,
          url: `mailto:${source.url}`,
          publishedAt: new Date().toISOString(),
          tags: analyst.tags,
        });
      }
    } catch (err) {
      console.error(`[fetcher] Error fetching ${source.url}:`, err);
      // Return error placeholder so UI still shows the analyst
      posts.push({
        analystId: analyst.id,
        analystName: analyst.displayName,
        title: `${analyst.displayName} — Unable to fetch`,
        summary: `Could not retrieve content from ${source.label}. Check the source directly.`,
        url: source.url,
        publishedAt: new Date().toISOString(),
        tags: analyst.tags,
      });
    }
  }

  return posts;
}
