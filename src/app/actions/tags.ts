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
// GET TAGS
// ============================================================================
export async function getTags() {
  const user = await getCurrentUser();

  const tags = await prisma.tag.findMany({
    where: { userId: user.id },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return tags;
}

// ============================================================================
// CREATE TAG
// ============================================================================
export interface CreateTagInput {
  name: string;
  color?: string;
}

export async function createTag(input: CreateTagInput) {
  const user = await getCurrentUser();

  // Check if tag already exists for this user
  const existingTag = await prisma.tag.findFirst({
    where: {
      name: input.name,
      userId: user.id,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  // Return existing tag if found (no error, just return it)
  if (existingTag) {
    return existingTag;
  }

  // Create new tag
  const tag = await prisma.tag.create({
    data: {
      name: input.name,
      color: input.color || "#8b5cf6", // Default violet
      userId: user.id,
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  revalidatePath("/");
  return tag;
}

// ============================================================================
// UPDATE TAG
// ============================================================================
export interface UpdateTagInput {
  id: string;
  name?: string;
  color?: string;
}

export async function updateTag(input: UpdateTagInput) {
  const user = await getCurrentUser();

  // Verify ownership
  const existing = await prisma.tag.findFirst({
    where: { id: input.id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Tag not found");
  }

  const tag = await prisma.tag.update({
    where: { id: input.id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.color && { color: input.color }),
    },
    include: {
      _count: {
        select: { bookmarks: true },
      },
    },
  });

  revalidatePath("/");
  return tag;
}

// ============================================================================
// DELETE TAG
// ============================================================================
export async function deleteTag(id: string) {
  const user = await getCurrentUser();

  // Verify ownership
  const tag = await prisma.tag.findFirst({
    where: { id, userId: user.id },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  await prisma.tag.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}
