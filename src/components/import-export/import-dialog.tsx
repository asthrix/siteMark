"use client";

import { useState, useCallback } from "react";
import { motion } from "motion/react";
import { Upload, FileText, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { parseBookmarks, ImportedBookmark } from "@/lib/import-export";
import { useCreateBookmark } from "@/hooks/use-bookmarks";

// ============================================================================
// IMPORT DIALOG
// ============================================================================
interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedBookmarks, setParsedBookmarks] = useState<ImportedBookmark[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null);

  const createBookmark = useCreateBookmark();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setParseError(null);
    setParsedBookmarks([]);
    setImportResults(null);

    try {
      const content = await selectedFile.text();
      const bookmarks = parseBookmarks(content);
      setParsedBookmarks(bookmarks);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Failed to parse file");
    }
  }, []);

  const handleImport = async () => {
    if (parsedBookmarks.length === 0) return;

    setIsImporting(true);
    setImportProgress(0);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < parsedBookmarks.length; i++) {
      const bookmark = parsedBookmarks[i];
      try {
        await createBookmark.mutateAsync({ url: bookmark.url });
        success++;
      } catch (error) {
        console.error(`Failed to import ${bookmark.url}:`, error);
        failed++;
      }
      setImportProgress(((i + 1) / parsedBookmarks.length) * 100);
    }

    setImportResults({ success, failed });
    setIsImporting(false);
  };

  const handleClose = () => {
    if (isImporting) return;
    onOpenChange(false);
    setFile(null);
    setParsedBookmarks([]);
    setParseError(null);
    setImportProgress(0);
    setImportResults(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            Import Bookmarks
          </DialogTitle>
          <DialogDescription>
            Import bookmarks from Chrome, Firefox, or a JSON file.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-8 text-center
              transition-colors cursor-pointer
              ${file ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"}
            `}
          >
            <input
              type="file"
              accept=".html,.json"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">
              {file ? file.name : "Drop a file here or click to browse"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports HTML (Chrome/Firefox export) or JSON
            </p>
          </div>

          {/* Parse Error */}
          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* Parsed Preview */}
          {parsedBookmarks.length > 0 && !importResults && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Found {parsedBookmarks.length} bookmarks</p>
                <Badge variant="secondary">Ready to import</Badge>
              </div>
              <ScrollArea className="h-40 rounded-lg border p-3">
                {parsedBookmarks.slice(0, 20).map((bookmark, i) => (
                  <div key={i} className="text-xs py-1 truncate text-muted-foreground">
                    {bookmark.title || bookmark.url}
                  </div>
                ))}
                {parsedBookmarks.length > 20 && (
                  <div className="text-xs py-1 text-muted-foreground">
                    ...and {parsedBookmarks.length - 20} more
                  </div>
                )}
              </ScrollArea>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Import Results */}
          {importResults && (
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Import Complete!</p>
                <p className="text-sm text-muted-foreground">
                  {importResults.success} imported, {importResults.failed} failed
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isImporting}>
            {importResults ? "Close" : "Cancel"}
          </Button>
          {!importResults && (
            <Button
              onClick={handleImport}
              disabled={parsedBookmarks.length === 0 || isImporting}
            >
              {isImporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                `Import ${parsedBookmarks.length} Bookmarks`
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
