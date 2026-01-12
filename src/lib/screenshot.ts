// ============================================================================
// SCREENSHOT CAPTURE (Microlink API)
// ============================================================================
// Fallback screenshot capture for URLs without OG images

interface MicrolinkResponse {
  status: string;
  data?: {
    screenshot?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export async function captureScreenshot(
  url: string
): Promise<{ url: string; width: number; height: number } | null> {
  try {
    const microlinkUrl = new URL("https://api.microlink.io");
    microlinkUrl.searchParams.set("url", url);
    microlinkUrl.searchParams.set("screenshot", "true");
    microlinkUrl.searchParams.set("meta", "false");
    microlinkUrl.searchParams.set("embed", "screenshot.url");

    // Optional: Add API key for higher rate limits
    const apiKey = process.env.MICROLINK_API_KEY;
    if (apiKey) {
      microlinkUrl.searchParams.set("apiKey", apiKey);
    }

    const response = await fetch(microlinkUrl.toString(), {
      signal: AbortSignal.timeout(30000), // 30 second timeout for screenshots
    });

    if (!response.ok) {
      throw new Error(`Microlink API error: ${response.status}`);
    }

    const data: MicrolinkResponse = await response.json();

    if (data.status === "success" && data.data?.screenshot) {
      return {
        url: data.data.screenshot.url,
        width: data.data.screenshot.width || 1200,
        height: data.data.screenshot.height || 630,
      };
    }

    return null;
  } catch (error) {
    console.error(`Failed to capture screenshot for ${url}:`, error);
    return null;
  }
}

// ============================================================================
// FULL SCREENSHOT URL (for embedding)
// ============================================================================
export function getScreenshotUrl(url: string, options?: {
  width?: number;
  height?: number;
  type?: "png" | "jpeg";
}): string {
  const microlinkUrl = new URL("https://api.microlink.io");
  microlinkUrl.searchParams.set("url", url);
  microlinkUrl.searchParams.set("screenshot", "true");
  microlinkUrl.searchParams.set("meta", "false");
  microlinkUrl.searchParams.set("embed", "screenshot.url");

  if (options?.width) {
    microlinkUrl.searchParams.set("screenshot.width", options.width.toString());
  }
  if (options?.height) {
    microlinkUrl.searchParams.set("screenshot.height", options.height.toString());
  }
  if (options?.type) {
    microlinkUrl.searchParams.set("screenshot.type", options.type);
  }

  const apiKey = process.env.MICROLINK_API_KEY;
  if (apiKey) {
    microlinkUrl.searchParams.set("apiKey", apiKey);
  }

  return microlinkUrl.toString();
}
