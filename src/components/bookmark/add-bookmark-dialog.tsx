"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { useUIStore } from "@/store/ui-store";
import { useCreateBookmark } from "@/hooks/use-bookmarks";
import { useCollections } from "@/hooks/use-collections";
import { useTags, useCreateTag } from "@/hooks/use-tags";

// ============================================================================
// TYPES
// ============================================================================
interface Collection {
  id: string;
  name: string;
  color?: string | null;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const addBookmarkSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  collectionId: z.string().nullable().optional(),
  tagIds: z.array(z.string()).optional(),
});

type AddBookmarkFormData = z.infer<typeof addBookmarkSchema>;

// ============================================================================
// ADD BOOKMARK DIALOG
// ============================================================================
export function AddBookmarkDialog() {
  const { isAddBookmarkOpen, setAddBookmarkOpen } = useUIStore();
  const createBookmark = useCreateBookmark();
  const { data: collections } = useCollections();
  const { data: tags } = useTags();
  const createTag = useCreateTag();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddBookmarkFormData>({
    resolver: zodResolver(addBookmarkSchema),
    defaultValues: {
      url: "",
      collectionId: null,
      tagIds: [],
    },
  });

  const onSubmit = async (data: AddBookmarkFormData) => {
    setError(null);
    try {
      await createBookmark.mutateAsync({
        url: data.url,
        collectionId: data.collectionId || undefined,
        tagIds: data.tagIds,
      });
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

  const handleCreateTag = async (name: string) => {
    const result = await createTag.mutateAsync({ name });
    return result;
  };

  return (
    <Dialog open={isAddBookmarkOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5 text-primary" />
            Add Bookmark
          </DialogTitle>
          <DialogDescription>
            Paste a URL to save it to your collection. Optionally assign a
            collection and tags.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* URL Input */}
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

          {/* Collection Selector */}
          <div className="space-y-2">
            <Label>Collection (optional)</Label>
            <Controller
              name="collectionId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || "none"}
                  onValueChange={(val) =>
                    field.onChange(val === "none" ? null : val)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No collection</SelectItem>
                    {collections?.map((collection: Collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-sm"
                            style={{
                              backgroundColor: collection.color || "#6366f1",
                            }}
                          />
                          {collection.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Tags Input */}
          <div className="space-y-2">
            <Label>Tags (optional)</Label>
            <Controller
              name="tagIds"
              control={control}
              render={({ field }) => (
                <TagInput
                  value={field.value || []}
                  onChange={field.onChange}
                  availableTags={tags || []}
                  onCreateTag={handleCreateTag}
                  placeholder="Add tags..."
                />
              )}
            />
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
