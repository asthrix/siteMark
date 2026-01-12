"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// ============================================================================
// TYPES
// ============================================================================
interface Tag {
  id: string;
  name: string;
  color?: string | null;
}

interface TagInputProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  availableTags: Tag[];
  onCreateTag?: (name: string) => Promise<Tag>;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// TAG INPUT COMPONENT
// ============================================================================
export function TagInput({
  value,
  onChange,
  availableTags,
  onCreateTag,
  placeholder = "Add tags...",
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected tags
  const selectedTags = availableTags.filter((tag) => value.includes(tag.id));
  
  // Get unselected tags for suggestions
  const suggestions = availableTags.filter(
    (tag) =>
      !value.includes(tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches any existing tag
  const canCreate =
    onCreateTag &&
    inputValue.trim() &&
    !availableTags.some(
      (tag) => tag.name.toLowerCase() === inputValue.toLowerCase()
    );

  const handleSelect = useCallback(
    (tagId: string) => {
      if (!value.includes(tagId)) {
        onChange([...value, tagId]);
      }
      setInputValue("");
      inputRef.current?.focus();
    },
    [value, onChange]
  );

  const handleRemove = useCallback(
    (tagId: string) => {
      onChange(value.filter((id) => id !== tagId));
    },
    [value, onChange]
  );

  const handleCreate = useCallback(async () => {
    if (!onCreateTag || !canCreate) return;

    setIsCreating(true);
    try {
      const newTag = await onCreateTag(inputValue.trim());
      onChange([...value, newTag.id]);
      setInputValue("");
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  }, [onCreateTag, canCreate, inputValue, value, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        // Remove last tag
        handleRemove(value[value.length - 1]);
      } else if (e.key === "Enter" && canCreate) {
        e.preventDefault();
        handleCreate();
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [inputValue, value, canCreate, handleRemove, handleCreate]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            "flex flex-wrap gap-1.5 min-h-10 w-full rounded-md border border-input",
            "bg-background px-3 py-2 text-sm ring-offset-background",
            "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
            "cursor-text",
            className
          )}
          onClick={() => inputRef.current?.focus()}
        >
          {/* Selected Tags */}
          <AnimatePresence mode="popLayout">
            {selectedTags.map((tag) => (
              <motion.div
                key={tag.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                layout
              >
                <Badge
                  variant="secondary"
                  className="gap-1 pr-1"
                  style={{
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(tag.id);
                    }}
                    className="ml-1 rounded-full hover:bg-foreground/10 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Input */}
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            {suggestions.length === 0 && !canCreate && (
              <CommandEmpty>No tags found</CommandEmpty>
            )}
            
            {suggestions.length > 0 && (
              <CommandGroup heading="Tags">
                {suggestions.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleSelect(tag.id)}
                    className="gap-2"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color || "#71717A" }}
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {canCreate && (
              <CommandGroup heading="Create">
                <CommandItem
                  onSelect={handleCreate}
                  disabled={isCreating}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create &quot;{inputValue}&quot;
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
