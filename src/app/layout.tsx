import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";

export const metadata: Metadata = {
  title: {
    default: "SiteMark - Visual Bookmark Manager",
    template: "%s | SiteMark",
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
  authors: [{ name: "SiteMark" }],
  creator: "SiteMark",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://SiteMark.app",
    title: "SiteMark - Visual Bookmark Manager",
    description:
      "A collaborative visual bookmark manager with automated thumbnail generation.",
    siteName: "SiteMark",
  },
  twitter: {
    card: "summary_large_image",
    title: "SiteMark - Visual Bookmark Manager",
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
