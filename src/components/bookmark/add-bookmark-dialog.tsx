"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUIStore } from "@/store/ui-store";
import { useCreateBookmark } from "@/hooks/use-bookmarks";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const addBookmarkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

type AddBookmarkFormData = z.infer<typeof addBookmarkSchema>;

// ============================================================================
// ADD BOOKMARK DIALOG
// ============================================================================
export function AddBookmarkDialog() {
  const { isAddBookmarkOpen, setAddBookmarkOpen } = useUIStore();
  const createBookmark = useCreateBookmark();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddBookmarkFormData>({
    resolver: zodResolver(addBookmarkSchema),
    defaultValues: {
      url: "",
    },
  });

  const onSubmit = async (data: AddBookmarkFormData) => {
    setError(null);
    try {
      await createBookmark.mutateAsync({ url: data.url });
      reset();
      setAddBookmarkOpen(false);
    } catch (err) {
      console.error("Failed to create bookmark:", err);
      setError("Failed to add bookmark. Please try again.");
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      reset();
      setError(null);
    }
    setAddBookmarkOpen(open);
  };

  return (
    <Dialog open={isAddBookmarkOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Add Bookmark
          </DialogTitle>
          <DialogDescription>
            Paste a URL to save it to your collection. We&apos;ll automatically
            fetch the title, description, and preview image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              autoComplete="off"
              autoFocus
              {...register("url")}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createBookmark.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBookmark.isPending}>
              {createBookmark.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Bookmark"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
