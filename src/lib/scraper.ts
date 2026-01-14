import * as cheerio from "cheerio";

// ============================================================================
// METADATA SCRAPER
// ============================================================================
// Extracts Open Graph and meta tags from URLs for bookmark previews

export interface ScrapedMetadata {
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageWidth: number | null;
  imageHeight: number | null;
  faviconUrl: string | null;
  domain: string;
  ogType: string | null;
}

export async function scrapeMetadata(url: string): Promise<ScrapedMetadata> {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname.replace(/^www\./, "");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SiteMark/1.0; +https://SiteMark.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title (OG > Twitter > title tag)
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      domain;

    // Extract description
    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      null;

    // Extract image
    let imageUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[property="og:image:url"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[name="twitter:image:src"]').attr("content") ||
      null;

    // Make relative image URLs absolute
    if (imageUrl && !imageUrl.startsWith("http")) {
      imageUrl = new URL(imageUrl, url).toString();
    }

    // Extract image dimensions
    const imageWidth = parseInt(
      $('meta[property="og:image:width"]').attr("content") || "",
      10
    );
    const imageHeight = parseInt(
      $('meta[property="og:image:height"]').attr("content") || "",
      10
    );

    // Extract favicon (multiple strategies)
    let faviconUrl =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      null;

    // Fallback to default favicon location
    if (!faviconUrl) {
      faviconUrl = `${parsedUrl.origin}/favicon.ico`;
    } else if (!faviconUrl.startsWith("http")) {
      faviconUrl = new URL(faviconUrl, url).toString();
    }

    // Extract OG type
    const ogType = $('meta[property="og:type"]').attr("content") || null;

    return {
      title: title.trim().slice(0, 500), // Limit title length
      description: description?.trim().slice(0, 1000) || null, // Limit description
      imageUrl,
      imageWidth: isNaN(imageWidth) ? null : imageWidth,
      imageHeight: isNaN(imageHeight) ? null : imageHeight,
      faviconUrl,
      domain,
      ogType,
    };
  } catch (error) {
    console.error(`Failed to scrape metadata for ${url}:`, error);

    // Return minimal metadata on failure
    return {
      title: domain,
      description: null,
      imageUrl: null,
      imageWidth: null,
      imageHeight: null,
      faviconUrl: `${parsedUrl.origin}/favicon.ico`,
      domain,
      ogType: null,
    };
  }
}
