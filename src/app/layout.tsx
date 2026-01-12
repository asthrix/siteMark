import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: {
    default: "VisualMark - Visual Bookmark Manager",
    template: "%s | VisualMark",
  },
  description:
    "A collaborative visual bookmark manager that presents your saved URLs as a rich, interactive masonry grid with automated thumbnail generation.",
  keywords: [
    "bookmarks",
    "visual bookmarks",
    "bookmark manager",
    "link organizer",
    "web collection",
  ],
  authors: [{ name: "VisualMark" }],
  creator: "VisualMark",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://visualmark.app",
    title: "VisualMark - Visual Bookmark Manager",
    description:
      "A collaborative visual bookmark manager with automated thumbnail generation.",
    siteName: "VisualMark",
  },
  twitter: {
    card: "summary_large_image",
    title: "VisualMark - Visual Bookmark Manager",
    description:
      "A collaborative visual bookmark manager with automated thumbnail generation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
