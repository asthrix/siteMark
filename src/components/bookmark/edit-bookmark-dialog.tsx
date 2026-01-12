"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Pencil, Loader2, Trash2 } from "lucide-react";
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
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useUIStore } from "@/store/ui-store";
import { useUpdateBookmark, useDeleteBookmark } from "@/hooks/use-bookmarks";
import { useCollections } from "@/hooks/use-collections";
import { useTags, useCreateTag } from "@/hooks/use-tags";
import { getBookmarks } from "@/app/actions/bookmarks";

// ============================================================================
// TYPES
// ============================================================================
interface BookmarkData {
  id: string;
  title: string | null;
  description: string | null;
  collectionId: string | null;
  tags: { tag: { id: string } }[];
}

interface Collection {
  id: string;
  name: string;
  color?: string | null;
}

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const editBookmarkSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  collectionId: z.string().nullable().optional(),
  tagIds: z.array(z.string()),
});

type EditBookmarkFormData = z.infer<typeof editBookmarkSchema>;

// ============================================================================
// EDIT BOOKMARK DIALOG
// ============================================================================
export function EditBookmarkDialog() {
  const { editingBookmarkId, closeEditBookmark } = useUIStore();
  const isOpen = !!editingBookmarkId;
  
  const [bookmark, setBookmark] = useState<BookmarkData | null>(null);
  const [isLoadingBookmark, setIsLoadingBookmark] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const updateBookmark = useUpdateBookmark();
  const deleteBookmark = useDeleteBookmark();
  const { data: collections } = useCollections();
  const { data: tags } = useTags();
  const createTag = useCreateTag();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<EditBookmarkFormData>({
    resolver: zodResolver(editBookmarkSchema),
    defaultValues: {
      title: "",
      description: "",
      collectionId: null,
      tagIds: [],
    },
  });

  // Fetch bookmark data when dialog opens
  useEffect(() => {
    if (editingBookmarkId) {
      setIsLoadingBookmark(true);
      getBookmarks({ limit: 100 })
        .then((result) => {
          const found = result.bookmarks.find(
            (b: BookmarkData) => b.id === editingBookmarkId
          );
          if (found) {
            setBookmark(found);
            reset({
              title: found.title || "",
              description: found.description || "",
              collectionId: found.collectionId,
              tagIds: found.tags.map((t: { tag: { id: string } }) => t.tag.id),
            });
          }
        })
        .finally(() => setIsLoadingBookmark(false));
    }
  }, [editingBookmarkId, reset]);

  const onSubmit = async (data: EditBookmarkFormData) => {
    if (!editingBookmarkId) return;

    try {
      await updateBookmark.mutateAsync({
        id: editingBookmarkId,
        title: data.title,
        description: data.description || undefined,
        collectionId: data.collectionId || undefined,
        tagIds: data.tagIds,
      });
      handleClose();
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    }
  };

  const handleDelete = async () => {
    if (!editingBookmarkId) return;
    await deleteBookmark.mutateAsync(editingBookmarkId);
    handleClose();
  };

  const handleClose = () => {
    closeEditBookmark();
    setBookmark(null);
    reset();
  };

  const handleCreateTag = async (name: string) => {
    const result = await createTag.mutateAsync({ name });
    return result;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-primary" />
              Edit Bookmark
            </DialogTitle>
            <DialogDescription>
              Update the bookmark details, assign to a collection, or add tags.
            </DialogDescription>
          </DialogHeader>

          {isLoadingBookmark ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  {...register("description")}
                />
              </div>

              {/* Collection */}
              <div className="space-y-2">
                <Label>Collection</Label>
                <Controller
                  name="collectionId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || "none"}
                      onValueChange={(val) => field.onChange(val === "none" ? null : val)}
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
                                style={{ backgroundColor: collection.color || "#6366f1" }}
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

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <Controller
                  name="tagIds"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      value={field.value}
                      onChange={field.onChange}
                      availableTags={tags || []}
                      onCreateTag={handleCreateTag}
                      placeholder="Add tags..."
                    />
                  )}
                />
              </div>

              <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  className="sm:mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={updateBookmark.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateBookmark.isPending}>
                  {updateBookmark.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Bookmark"
        itemName={bookmark?.title || "this bookmark"}
        isLoading={deleteBookmark.isPending}
      />
    </>
  );
}
