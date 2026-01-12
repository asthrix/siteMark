"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionDialog } from "@/components/collection/collection-dialog";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { useCollections, useDeleteCollection } from "@/hooks/use-collections";
import { getIconComponent } from "@/components/ui/icon-picker";
import { staggerContainer, staggerItem, cardHover } from "@/lib/animations";
import Link from "next/link";

// ============================================================================
// COLLECTION CARD COMPONENT
// ============================================================================
interface CollectionCardProps {
  collection: {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    isPublic: boolean;
    _count: { bookmarks: number };
  };
  onEdit: () => void;
  onDelete: () => void;
}

function CollectionCard({ collection, onEdit, onDelete }: CollectionCardProps) {
  const IconComponent = collection.icon
    ? getIconComponent(collection.icon)
    : FolderOpen;

  return (
    <motion.div
      variants={staggerItem}
      whileHover={cardHover.hover}
      whileTap={cardHover.tap}
    >
      <Card className="group relative overflow-hidden cursor-pointer h-full">
        <Link href={`/dashboard/collections/${collection.id}`}>
          <CardContent className="p-6">
            {/* Icon */}
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ backgroundColor: collection.color || "#6366F1" }}
            >
              {IconComponent && (
                <IconComponent className="h-6 w-6 text-white" />
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-lg mb-1 truncate">
              {collection.name}
            </h3>

            {/* Description */}
            {collection.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {collection.description}
              </p>
            )}

            {/* Footer */}
            <div className="flex items-center gap-2 mt-auto">
              <Badge variant="secondary" className="text-xs">
                {collection._count.bookmarks} bookmark
                {collection._count.bookmarks !== 1 ? "s" : ""}
              </Badge>
              {collection.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
          </CardContent>
        </Link>

        {/* Actions (on hover) */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
          >
            ✏️
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            🗑️
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// COLLECTIONS PAGE
// ============================================================================
export default function CollectionsPage() {
  const { data: collections, isLoading } = useCollections();
  const deleteCollection = useDeleteCollection();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<typeof collections extends (infer T)[] | undefined ? T | null : never>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCollection, setDeletingCollection] = useState<{id: string; name: string} | null>(null);

  const handleEdit = (collection: NonNullable<typeof editingCollection>) => {
    setEditingCollection(collection);
    setDialogOpen(true);
  };

  const handleDelete = (collection: {id: string; name: string}) => {
    setDeletingCollection(collection);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCollection) {
      await deleteCollection.mutateAsync(deletingCollection.id);
      setDeletingCollection(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between gap-4 px-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Collections</h1>
            <p className="text-sm text-muted-foreground">
              Organize your bookmarks into folders
            </p>
          </div>
          <Button onClick={() => { setEditingCollection(null); setDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            New Collection
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && collections?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <FolderOpen className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No collections yet</h2>
            <p className="text-muted-foreground max-w-sm mb-6">
              Create your first collection to start organizing your bookmarks.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Collection
            </Button>
          </motion.div>
        )}

        {/* Collections Grid */}
        {!isLoading && collections && collections.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={() => handleEdit(collection)}
                onDelete={() => handleDelete({ id: collection.id, name: collection.name })}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Dialogs */}
      <CollectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        collection={editingCollection}
      />
      
      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Collection"
        itemName={deletingCollection?.name}
        isLoading={deleteCollection.isPending}
      />
    </div>
  );
}
