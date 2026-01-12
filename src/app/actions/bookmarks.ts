"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { scrapeMetadata } from "@/lib/scraper";
import { captureScreenshot } from "@/lib/screenshot";
import { uploadScreenshot, deleteScreenshot } from "@/lib/storage";

// ============================================================================
// TYPES
// ============================================================================
export interface BookmarkFilters {
  search?: string;
  tags?: string[];
  collectionId?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title" | "domain";
  sortDirection?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface CreateBookmarkInput {
  url: string;
  collectionId?: string;
  tagIds?: string[];
}

export interface UpdateBookmarkInput {
  id: string;
  title?: string;
  description?: string;
  collectionId?: string | null;
  tagIds?: string[];
}

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

  // Ensure user exists in database
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url,
    },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url,
    },
  });

  return dbUser;
}

// ============================================================================
// GET BOOKMARKS
// ============================================================================
export async function getBookmarks(filters: BookmarkFilters = {}) {
  const user = await getCurrentUser();

  const {
    search,
    tags,
    collectionId,
    isFavorite,
    isArchived = false, // Default to non-archived
    sortBy = "createdAt",
    sortDirection = "desc",
    limit = 50,
    offset = 0,
  } = filters;

  const where = {
    userId: user.id,
    isArchived,
    ...(isFavorite !== undefined && { isFavorite }),
    ...(collectionId && { collectionId }),
    ...(tags &&
      tags.length > 0 && {
        tags: {
          some: {
            tagId: { in: tags },
          },
        },
      }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
        { url: { contains: search, mode: "insensitive" as const } },
        { domain: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const [bookmarks, total] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        collection: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
      },
      orderBy: { [sortBy]: sortDirection },
      take: limit,
      skip: offset,
    }),
    prisma.bookmark.count({ where }),
  ]);

  return {
    bookmarks,
    total,
    hasMore: offset + bookmarks.length < total,
  };
}

// ============================================================================
// CREATE BOOKMARK
// ============================================================================
export async function createBookmark(input: CreateBookmarkInput) {
  const user = await getCurrentUser();

  // 1. Scrape metadata
  const metadata = await scrapeMetadata(input.url);

  // 2. Determine image strategy
  let finalImageUrl = metadata.imageUrl;
  let finalImageWidth = metadata.imageWidth;
  let finalImageHeight = metadata.imageHeight;

  // If no OG image, try to capture a screenshot
  if (!finalImageUrl) {
    const screenshot = await captureScreenshot(input.url);
    if (screenshot) {
      finalImageUrl = screenshot.url;
      finalImageWidth = screenshot.width;
      finalImageHeight = screenshot.height;
    }
  }

  // 3. Create bookmark
  const bookmark = await prisma.bookmark.create({
    data: {
      url: input.url,
      title: metadata.title,
      description: metadata.description,
      imageUrl: finalImageUrl,
      imageWidth: finalImageWidth,
      imageHeight: finalImageHeight,
      faviconUrl: metadata.faviconUrl,
      domain: metadata.domain,
      ogType: metadata.ogType,
      userId: user.id,
      collectionId: input.collectionId,
      tags: input.tagIds
        ? {
            create: input.tagIds.map((tagId) => ({ tagId })),
          }
        : undefined,
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      collection: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  // 4. Background: Upload external screenshot to permanent storage
  if (finalImageUrl?.includes("microlink.io")) {
    uploadScreenshot(finalImageUrl, bookmark.id)
      .then((permanentUrl) => {
        if (permanentUrl) {
          return prisma.bookmark.update({
            where: { id: bookmark.id },
            data: { imageUrl: permanentUrl },
          });
        }
      })
      .catch(console.error);
  }

  revalidatePath("/");
  return bookmark;
}

// ============================================================================
// UPDATE BOOKMARK
// ============================================================================
export async function updateBookmark(input: UpdateBookmarkInput) {
  const user = await getCurrentUser();

  // Verify ownership
  const existing = await prisma.bookmark.findFirst({
    where: { id: input.id, userId: user.id },
  });

  if (!existing) {
    throw new Error("Bookmark not found");
  }

  // Update tags if provided
  if (input.tagIds !== undefined) {
    // Remove existing tags
    await prisma.bookmarkTag.deleteMany({
      where: { bookmarkId: input.id },
    });

    // Add new tags
    if (input.tagIds.length > 0) {
      await prisma.bookmarkTag.createMany({
        data: input.tagIds.map((tagId) => ({
          bookmarkId: input.id,
          tagId,
        })),
      });
    }
  }

  const bookmark = await prisma.bookmark.update({
    where: { id: input.id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.collectionId !== undefined && { collectionId: input.collectionId }),
    },
    include: {
      tags: {
        include: {
          tag: true,
        },
      },
      collection: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  revalidatePath("/");
  return bookmark;
}

// ============================================================================
// DELETE BOOKMARK
// ============================================================================
export async function deleteBookmark(id: string) {
  const user = await getCurrentUser();

  // Verify ownership
  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: user.id },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  // Delete screenshot from storage
  await deleteScreenshot(id);

  // Delete from database
  await prisma.bookmark.delete({
    where: { id },
  });

  revalidatePath("/");
  return { success: true };
}

// ============================================================================
// TOGGLE FAVORITE
// ============================================================================
export async function toggleFavorite(id: string) {
  const user = await getCurrentUser();

  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: user.id },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  const updated = await prisma.bookmark.update({
    where: { id },
    data: { isFavorite: !bookmark.isFavorite },
  });

  revalidatePath("/");
  return updated;
}

// ============================================================================
// TOGGLE ARCHIVE
// ============================================================================
export async function toggleArchive(id: string) {
  const user = await getCurrentUser();

  const bookmark = await prisma.bookmark.findFirst({
    where: { id, userId: user.id },
  });

  if (!bookmark) {
    throw new Error("Bookmark not found");
  }

  const updated = await prisma.bookmark.update({
    where: { id },
    data: { isArchived: !bookmark.isArchived },
  });

  revalidatePath("/");
  return updated;
}
