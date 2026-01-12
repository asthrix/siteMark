"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// GET CURRENT USER
// ============================================================================
async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { id: user.id };
}

// ============================================================================
// GET COLLECTIONS
// ============================================================================
export async function getCollections() {
  const user = await getCurrentUser();

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return collections;
}

// ============================================================================
// CREATE COLLECTION
// ============================================================================
export interface CreateCollectionInput {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export async function createCollection(input: CreateCollectionInput) {
  const user = await getCurrentUser();

  const collection = await prisma.collection.create({
    data: {
      name: input.name,
      description: input.description,
      color: input.color || "#6366f1", // Default indigo
      icon: input.icon || "Folder",
      userId: user.id,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  revalidatePath("/");
  return collection;
}

// ============================================================================
// UPDATE COLLECTION
// ============================================================================
export interface UpdateCollectionInput {
  id: string;
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

export async function updateCollection(input: UpdateCollectionInput) {
  const user = await getCurrentUser();

  // Verify ownership
  const existing = await prisma.collection.findFirst({
    where: { id: input.id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Collection not found");
  }

  const collection = await prisma.collection.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.color && { color: input.color }),
      ...(input.icon && { icon: input.icon }),
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  revalidatePath("/");
  return collection;
}

// ============================================================================
// DELETE COLLECTION
// ============================================================================
export async function deleteCollection(id: string) {
  const user = await getCurrentUser();

  // Verify ownership
  const collection = await prisma.collection.findFirst({
    where: { id, userId: user.id },
  });

  if (!collection) {
    throw new Error("Collection not found");
  }

  await prisma.collection.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}
