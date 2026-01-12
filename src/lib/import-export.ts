// ============================================================================
// IMPORT/EXPORT UTILITIES
// ============================================================================
// Parse Chrome/Firefox bookmarks, export to JSON/HTML, batch import

import { z } from "zod";

// ============================================================================
// TYPES
// ============================================================================
export interface ImportedBookmark {
  url: string;
  title?: string;
  description?: string;
  addedAt?: Date;
  folder?: string;
}

export interface BookmarkExport {
  version: string;
  exportedAt: string;
  bookmarks: {
    url: string;
    title: string | null;
    description: string | null;
    imageUrl: string | null;
    createdAt: string;
    isFavorite: boolean;
    collection?: string;
    tags?: string[];
  }[];
  collections: {
    name: string;
    color: string | null;
    icon: string | null;
  }[];
  tags: {
    name: string;
    color: string | null;
  }[];
}

// ============================================================================
// PARSE CHROME/FIREFOX HTML BOOKMARKS
// ============================================================================
export function parseBookmarksHtml(html: string): ImportedBookmark[] {
  const bookmarks: ImportedBookmark[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // Find all anchor tags (bookmarks)
  const links = doc.querySelectorAll("a");
  
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || !href.startsWith("http")) return;
    
    // Get add date if available
    const addDate = link.getAttribute("add_date");
    const addedAt = addDate ? new Date(parseInt(addDate) * 1000) : undefined;
    
    // Try to find parent folder
    let folder: string | undefined;
    let parent = link.parentElement;
    while (parent) {
      if (parent.previousElementSibling?.tagName === "H3") {
        folder = parent.previousElementSibling.textContent || undefined;
        break;
      }
      parent = parent.parentElement;
    }
    
    bookmarks.push({
      url: href,
      title: link.textContent || undefined,
      addedAt,
      folder,
    });
  });
  
  return bookmarks;
}

// ============================================================================
// PARSE JSON IMPORT
// ============================================================================
const jsonImportSchema = z.array(
  z.object({
    url: z.string().url(),
    title: z.string().optional(),
    description: z.string().optional(),
  })
);

export function parseBookmarksJson(json: string): ImportedBookmark[] {
  try {
    const parsed = JSON.parse(json);
    const validated = jsonImportSchema.parse(parsed);
    return validated;
  } catch (error) {
    console.error("Failed to parse JSON bookmarks:", error);
    throw new Error("Invalid JSON format. Expected an array of bookmark objects with url, title, and description.");
  }
}

// ============================================================================
// DETECT IMPORT FORMAT
// ============================================================================
export function detectImportFormat(content: string): "html" | "json" | "unknown" {
  const trimmed = content.trim();
  
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<")) {
    return "html";
  }
  
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return "json";
  }
  
  return "unknown";
}

// ============================================================================
// PARSE BOOKMARKS (auto-detect)
// ============================================================================
export function parseBookmarks(content: string): ImportedBookmark[] {
  const format = detectImportFormat(content);
  
  switch (format) {
    case "html":
      return parseBookmarksHtml(content);
    case "json":
      return parseBookmarksJson(content);
    default:
      throw new Error("Unknown file format. Please upload an HTML or JSON file.");
  }
}

// ============================================================================
// EXPORT TO JSON
// ============================================================================
export function exportToJson(data: BookmarkExport): string {
  return JSON.stringify(data, null, 2);
}

// ============================================================================
// EXPORT TO HTML (Netscape Bookmark Format)
// ============================================================================
export function exportToHtml(data: BookmarkExport): string {
  const lines: string[] = [
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>',
    '<!-- This is an automatically generated file by VisualMark -->',
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">',
    '<TITLE>Bookmarks</TITLE>',
    '<H1>Bookmarks</H1>',
    '<DL><p>',
  ];
  
  // Group by collection
  const byCollection = new Map<string, typeof data.bookmarks>();
  byCollection.set("Unsorted", []);
  
  data.bookmarks.forEach((bookmark) => {
    const key = bookmark.collection || "Unsorted";
    if (!byCollection.has(key)) {
      byCollection.set(key, []);
    }
    byCollection.get(key)!.push(bookmark);
  });
  
  // Output each collection
  byCollection.forEach((bookmarks, collectionName) => {
    lines.push(`    <DT><H3>${escapeHtml(collectionName)}</H3>`);
    lines.push('    <DL><p>');
    
    bookmarks.forEach((bookmark) => {
      const addDate = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
      lines.push(
        `        <DT><A HREF="${escapeHtml(bookmark.url)}" ADD_DATE="${addDate}">${escapeHtml(bookmark.title || bookmark.url)}</A>`
      );
    });
    
    lines.push('    </DL><p>');
  });
  
  lines.push('</DL><p>');
  
  return lines.join('\n');
}

// ============================================================================
// EXPORT TO CSV
// ============================================================================
export function exportToCsv(data: BookmarkExport): string {
  const headers = ["URL", "Title", "Description", "Collection", "Tags", "Favorite", "Created At"];
  const rows = data.bookmarks.map((b) => [
    b.url,
    b.title || "",
    b.description || "",
    b.collection || "",
    (b.tags || []).join("; "),
    b.isFavorite ? "Yes" : "No",
    b.createdAt,
  ]);
  
  const escapeCsv = (val: string) => {
    if (val.includes(",") || val.includes('"') || val.includes("\n")) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };
  
  return [
    headers.join(","),
    ...rows.map((row) => row.map(escapeCsv).join(",")),
  ].join("\n");
}

// ============================================================================
// HELPER: Escape HTML
// ============================================================================
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ============================================================================
// DOWNLOAD FILE
// ============================================================================
export function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
