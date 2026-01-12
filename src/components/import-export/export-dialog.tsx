"use client";

import { useState } from "react";
import { Download, FileJson, FileText, Sheet, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  exportToJson,
  exportToHtml,
  exportToCsv,
  downloadFile,
  BookmarkExport,
} from "@/lib/import-export";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { useCollections } from "@/hooks/use-collections";
import { useTags } from "@/hooks/use-tags";

// ============================================================================
// EXPORT DIALOG
// ============================================================================
interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ExportFormat = "json" | "html" | "csv";

const formatOptions = [
  {
    value: "json" as const,
    label: "JSON",
    description: "Full data with collections and tags",
    icon: FileJson,
  },
  {
    value: "html" as const,
    label: "HTML",
    description: "Browser-compatible bookmark file",
    icon: FileText,
  },
  {
    value: "csv" as const,
    label: "CSV",
    description: "Spreadsheet format",
    icon: Sheet,
  },
];

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState(false);

  const { data: bookmarksData, isLoading: isLoadingBookmarks } = useBookmarks();
  const { data: collections, isLoading: isLoadingCollections } = useCollections();
  const { data: tags, isLoading: isLoadingTags } = useTags();

  const isLoading = isLoadingBookmarks || isLoadingCollections || isLoadingTags;
  const bookmarkCount = bookmarksData?.bookmarks.length || 0;

  const handleExport = async () => {
    if (!bookmarksData) return;

    setIsExporting(true);

    // Build export data
    const exportData: BookmarkExport = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      bookmarks: bookmarksData.bookmarks.map((b) => ({
        url: b.url,
        title: b.title,
        description: b.description,
        imageUrl: b.imageUrl,
        createdAt: b.createdAt.toISOString(),
        isFavorite: b.isFavorite,
        collection: b.collection?.name,
        tags: b.tags.map((t) => t.tag.name),
      })),
      collections: (collections || []).map((c) => ({
        name: c.name,
        color: c.color,
        icon: c.icon,
      })),
      tags: (tags || []).map((t) => ({
        name: t.name,
        color: t.color,
      })),
    };

    // Generate file content
    let content: string;
    let filename: string;
    let mimeType: string;

    const date = new Date().toISOString().split("T")[0];

    switch (format) {
      case "json":
        content = exportToJson(exportData);
        filename = `visualmark-export-${date}.json`;
        mimeType = "application/json";
        break;
      case "html":
        content = exportToHtml(exportData);
        filename = `visualmark-bookmarks-${date}.html`;
        mimeType = "text/html";
        break;
      case "csv":
        content = exportToCsv(exportData);
        filename = `visualmark-export-${date}.csv`;
        mimeType = "text/csv";
        break;
    }

    downloadFile(content, filename, mimeType);
    setIsExporting(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Export Bookmarks
          </DialogTitle>
          <DialogDescription>
            Export your {bookmarkCount} bookmark{bookmarkCount !== 1 ? "s" : ""} to a file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={format} onValueChange={(v) => setFormat(v as ExportFormat)}>
            {formatOptions.map((option) => (
              <div
                key={option.value}
                className={`
                  flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors
                  ${format === option.value ? "border-primary bg-primary/5" : "hover:bg-muted/50"}
                `}
                onClick={() => setFormat(option.value)}
              >
                <RadioGroupItem value={option.value} id={option.value} />
                <option.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor={option.value} className="cursor-pointer font-medium">
                    {option.label}
                  </Label>
                  <p className="text-xs text-muted-foreground">{option.description}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isLoading || isExporting || bookmarkCount === 0}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
