"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, Loader2 } from "lucide-react";
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
import { InlineColorPicker } from "@/components/ui/color-picker";
import { useCreateTag, useUpdateTag } from "@/hooks/use-tags";

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================
const tagSchema = z.object({
  name: z.string().min(1, "Name is required").max(30, "Name too long"),
  color: z.string().nullable(),
});

type TagFormData = z.infer<typeof tagSchema>;

// ============================================================================
// TYPES
// ============================================================================
interface TagData {
  id: string;
  name: string;
  color?: string | null;
}

interface TagDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: TagData | null;
}

// ============================================================================
// TAG DIALOG
// ============================================================================
export function TagDialog({ open, onOpenChange, tag }: TagDialogProps) {
  const isEditMode = !!tag;
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
    defaultValues: {
      name: "",
      color: "#6366F1",
    },
  });

  // Reset form when tag changes
  useEffect(() => {
    if (tag) {
      reset({
        name: tag.name,
        color: tag.color || "#6366F1",
      });
    } else {
      reset({
        name: "",
        color: "#6366F1",
      });
    }
  }, [tag, reset]);

  const onSubmit = async (data: TagFormData) => {
    try {
      if (isEditMode && tag) {
        await updateTag.mutateAsync({
          id: tag.id,
          ...data,
          color: data.color || undefined,
        });
      } else {
        await createTag.mutateAsync({
          ...data,
          color: data.color || undefined,
        });
      }
      handleClose();
    } catch (error) {
      console.error("Failed to save tag:", error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const isPending = createTag.isPending || updateTag.isPending;
  const watchedColor = watch("color");
  const watchedName = watch("name");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            {isEditMode ? "Edit Tag" : "Create Tag"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? "Update your tag." : "Create a new tag for labeling bookmarks."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Preview */}
          <div className="flex items-center justify-center py-2">
            <div
              className="px-3 py-1.5 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: watchedColor || "#6366F1" }}
            >
              {watchedName || "Tag name"}
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter tag name"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <InlineColorPicker
                  value={field.value}
                  onChange={field.onChange}
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
                "Save"
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
