"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FolderOpen, Loader2 } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { ColorPicker } from "@/components/ui/color-picker";
import { IconPicker, getIconComponent } from "@/components/ui/icon-picker";
import { useCreateCollection, useUpdateCollection } from "@/hooks/use-collections";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const collectionSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  description: z.string().max(200, "Description too long").optional(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  isPublic: z.boolean(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

// ============================================================================
// TYPES
// ============================================================================
interface Collection {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  isPublic: boolean;
}

interface CollectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection?: Collection | null; // If provided, edit mode
}

// ============================================================================
// COLLECTION DIALOG
// ============================================================================
export function CollectionDialog({
  open,
  onOpenChange,
  collection,
}: CollectionDialogProps) {
  const isEditMode = !!collection;
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366F1",
      icon: "Folder",
      isPublic: false,
    },
  });

  // Reset form when collection changes
  useEffect(() => {
    if (collection) {
      reset({
        name: collection.name,
        description: collection.description || "",
        color: collection.color || "#6366F1",
        icon: collection.icon || "Folder",
        isPublic: collection.isPublic,
      });
    } else {
      reset({
        name: "",
        description: "",
        color: "#6366F1",
        icon: "Folder",
        isPublic: false,
      });
    }
  }, [collection, reset]);

  const onSubmit = async (data: CollectionFormData) => {
    try {
      if (isEditMode && collection) {
        await updateCollection.mutateAsync({
          id: collection.id,
          ...data,
          color: data.color || undefined,
          icon: data.icon || undefined,
        });
      } else {
        await createCollection.mutateAsync({
          ...data,
          color: data.color || undefined,
          icon: data.icon || undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save collection:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const isPending = createCollection.isPending || updateCollection.isPending;
  const watchedColor = watch("color");
  const watchedIcon = watch("icon");
  const IconComponent = watchedIcon ? getIconComponent(watchedIcon) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-primary" />
            {isEditMode ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update your collection details."
              : "Create a new collection to organize your bookmarks."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center py-4">
            <div
              className="flex items-center justify-center h-16 w-16 rounded-xl shadow-lg"
              style={{ backgroundColor: watchedColor || "#6366F1" }}
            >
              {IconComponent && (
                <IconComponent className="h-8 w-8 text-white" />
              )}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="My Collection"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="What's this collection for?"
              {...register("description")}
            />
          </div>

          {/* Color & Icon */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <ColorPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Controller
                name="icon"
                control={control}
                render={({ field }) => (
                  <IconPicker
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="public">Public Collection</Label>
              <p className="text-xs text-muted-foreground">
                Allow others to view this collection
              </p>
            </div>
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <Switch
                  id="public"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isEditMode ? "Saving..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Save Changes"
              ) : (
                "Create Collection"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
