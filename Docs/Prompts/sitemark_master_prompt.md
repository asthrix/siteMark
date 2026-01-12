# VISUALMARK: COMPLETE IMPLEMENTATION PROMPT

## ROLE & CONTEXT
You are a Senior Full-Stack Architect specializing in modern React/Next.js applications. You are building **VisualMark**, a collaborative visual bookmark manager that solves "bookmark rot" by presenting saved URLs as a rich, interactive masonry grid with automated thumbnail generation.

---

## PROJECT SPECIFICATIONS

### Technology Stack (NON-NEGOTIABLE)
- **Framework**: Next.js 15 (App Router) with TypeScript
- **UI Library**: Shadcn UI (Radix Primitives + Tailwind CSS)
- **Client State**: Zustand (UI state, filters)
- **Server State**: TanStack Query v5 (data fetching, caching)
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **ORM**: Prisma v6
- **Styling**: Tailwind CSS (Dark Mode First)

### Core Features to Implement

#### Phase 1: MVP
1. **Authentication**
   - Google OAuth via Supabase Auth
   - Protected routes with middleware
   - User session management

2. **Bookmark Management**
   - Add bookmark via URL input
   - Automatic metadata extraction (title, description, favicon)
   - Thumbnail generation strategy:
     - Primary: Extract Open Graph image
     - Fallback: Microlink API screenshot
     - Storage: Hybrid (OG images as URLs, screenshots uploaded to Supabase Storage)
   - Display in responsive masonry grid (CSS columns)
   - Edit/Delete bookmarks
   - Toggle favorite status
   - Archive bookmarks

3. **Visual Interface**
   - Masonry grid layout with Framer Motion stagger animation
   - BookmarkCard component with hover effects
   - Responsive (1 col mobile, 2 tablet, 3-4 desktop)
   - Dark mode optimized design

4. **Search & Filter**
   - Real-time search by title/description
   - Filter by favorites
   - Sort by created date, updated date, title

#### Phase 2: Advanced Features
1. **Collections (Folders)**
   - Create/edit/delete collections
   - Assign bookmarks to collections
   - Collection color coding
   - Filter bookmarks by collection

2. **Tags**
   - Create/manage tags
   - Multi-tag assignment to bookmarks
   - Filter by tags (multi-select)
   - Tag color customization

3. **Collaboration**
   - Share collections via public links
   - Invite users to collections (OWNER, EDITOR, VIEWER roles)
   - View shared collections

4. **Import/Export**
   - Import browser bookmarks (HTML file parser)
   - Export bookmarks as JSON/CSV

5. **Enhanced UX**
   - Command Menu (Cmd+K) for global search
   - Keyboard shortcuts
   - Infinite scroll
   - Bulk actions (multi-select)
   - Drag & drop organization

---

## DATABASE SCHEMA (PRISMA)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String              @id @default(cuid())
  email             String              @unique
  name              String?
  avatarUrl         String?
  createdAt         DateTime            @default(now())
  bookmarks         Bookmark[]
  collections       Collection[]
  tags              Tag[]
  sharedCollections CollectionMember[]
  @@map("users")
}

model Bookmark {
  id           String        @id @default(cuid())
  url          String
  title        String?
  description  String?       @db.Text
  imageUrl     String?
  imageWidth   Int?
  imageHeight  Int?
  faviconUrl   String?
  domain       String?
  ogType       String?
  isFavorite   Boolean       @default(false)
  isArchived   Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  collectionId String?
  collection   Collection?   @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  tags         BookmarkTag[]
  @@index([userId])
  @@index([collectionId])
  @@index([url])
  @@index([domain])
  @@map("bookmarks")
}

model Collection {
  id          String             @id @default(cuid())
  name        String
  description String?            @db.Text
  color       String?
  icon        String?
  isPublic    Boolean            @default(false)
  createdAt   DateTime           @default(now())
  updatedAt   DateTime           @updatedAt
  userId      String
  user        User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookmarks   Bookmark[]
  members     CollectionMember[]
  @@unique([name, userId])
  @@index([userId])
  @@map("collections")
}

model Tag {
  id        String        @id @default(cuid())
  name      String
  color     String?
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  bookmarks BookmarkTag[]
  @@unique([name, userId])
  @@index([userId])
  @@map("tags")
}

model BookmarkTag {
  bookmarkId String
  bookmark   Bookmark @relation(fields: [bookmarkId], references: [id], onDelete: Cascade)
  tagId      String
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  @@id([bookmarkId, tagId])
  @@index([bookmarkId])
  @@index([tagId])
  @@map("bookmark_tags")
}

model CollectionMember {
  id           String     @id @default(cuid())
  role         MemberRole @default(VIEWER)
  addedAt      DateTime   @default(now())
  collectionId String
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  userId       String
  user         User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([collectionId, userId])
  @@index([collectionId])
  @@index([userId])
  @@map("collection_members")
}

enum MemberRole {
  OWNER
  EDITOR
  VIEWER
}
```

---

## STATE MANAGEMENT ARCHITECTURE

### Zustand Stores

```typescript
// store/ui-store.ts - Client UI State
interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isAddBookmarkOpen: boolean;
  setAddBookmarkOpen: (open: boolean) => void;
  viewMode: 'grid' | 'list' | 'compact';
  setViewMode: (mode: 'grid' | 'list' | 'compact') => void;
  gridColumns: number;
  setGridColumns: (columns: number) => void;
}

// store/filter-store.ts - Filter State
interface FilterStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTags: string[];
  toggleTag: (tagId: string) => void;
  clearTags: () => void;
  selectedCollection: string | null;
  setSelectedCollection: (collectionId: string | null) => void;
  showFavorites: boolean;
  toggleFavorites: () => void;
  sortBy: 'createdAt' | 'updatedAt' | 'title';
  setSortBy: (sort: 'createdAt' | 'updatedAt' | 'title') => void;
  resetFilters: () => void;
}
```

### TanStack Query Hooks

```typescript
// hooks/use-bookmarks.ts
export function useBookmarks() {
  const filters = useFilterStore();
  return useQuery({
    queryKey: ['bookmarks', filters],
    queryFn: () => getBookmarks(filters),
    staleTime: 30000,
  });
}

export function useCreateBookmark() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBookmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
```

---

## VISUAL ENGINE IMPLEMENTATION

### Metadata Scraper
```typescript
// lib/scraper.ts
import * as cheerio from 'cheerio';

export async function scrapeMetadata(url: string) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; VisualMark/1.0)',
    },
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  const domain = new URL(url).hostname;
  
  return {
    domain,
    title: $('meta[property="og:title"]').attr('content') || $('title').text() || url,
    description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    imageUrl: $('meta[property="og:image"]').attr('content'),
    faviconUrl: $('link[rel="icon"]').attr('href'),
    ogType: $('meta[property="og:type"]').attr('content'),
  };
}
```

### Screenshot Capture (Microlink)
```typescript
// lib/screenshot.ts
export async function captureScreenshot(url: string): Promise<string | null> {
  const microlinkUrl = new URL('https://api.microlink.io');
  microlinkUrl.searchParams.set('url', url);
  microlinkUrl.searchParams.set('screenshot', 'true');
  microlinkUrl.searchParams.set('embed', 'screenshot.url');
  
  const response = await fetch(microlinkUrl.toString());
  const data = await response.json();
  return data.screenshot?.url || null;
}
```

### Supabase Storage Upload
```typescript
// lib/storage.ts
export async function uploadScreenshot(imageUrl: string, bookmarkId: string): Promise<string> {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  
  const { data, error } = await supabase.storage
    .from('screenshots')
    .upload(`${bookmarkId}.jpg`, blob, { upsert: true });
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from('screenshots')
    .getPublicUrl(`${bookmarkId}.jpg`);
  
  return publicUrl;
}
```

### Complete Bookmark Creation Flow
```typescript
// app/actions/bookmarks.ts
'use server';

export async function createBookmark(url: string, collectionId?: string, tagIds?: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Unauthorized');
  
  // 1. Scrape metadata
  const metadata = await scrapeMetadata(url);
  
  // 2. Determine image strategy
  let finalImageUrl = metadata.imageUrl;
  if (!finalImageUrl) {
    const screenshotUrl = await captureScreenshot(url);
    if (screenshotUrl) finalImageUrl = screenshotUrl;
  }
  
  // 3. Create bookmark
  const bookmark = await prisma.bookmark.create({
    data: {
      url,
      title: metadata.title,
      description: metadata.description,
      imageUrl: finalImageUrl,
      faviconUrl: metadata.faviconUrl,
      domain: metadata.domain,
      ogType: metadata.ogType,
      userId: user.id,
      collectionId,
      tags: tagIds ? { create: tagIds.map(tagId => ({ tagId })) } : undefined,
    },
    include: { tags: { include: { tag: true } } },
  });
  
  // 4. Background upload if using external screenshot
  if (finalImageUrl?.includes('microlink.io')) {
    uploadScreenshot(finalImageUrl, bookmark.id)
      .then(permanentUrl => prisma.bookmark.update({
        where: { id: bookmark.id },
        data: { imageUrl: permanentUrl },
      }))
      .catch(console.error);
  }
  
  return bookmark;
}
```

---

## COMPONENT SPECIFICATIONS

### MasonryGrid with Framer Motion
```typescript
// components/layout/masonry-grid.tsx
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function MasonryGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4"
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={item} className="break-inside-avoid mb-4">
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### BookmarkCard Component
```typescript
// components/bookmark/bookmark-card.tsx
import { motion } from 'framer-motion';
import Image from 'next/image';

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  return (
    <motion.div whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden border-2 hover:border-primary transition-colors">
        <div className="relative aspect-video">
          <Image 
            src={bookmark.imageUrl || '/placeholder.png'} 
            fill 
            className="object-cover" 
            alt={bookmark.title || 'Bookmark'}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2"
            onClick={() => toggleFavorite(bookmark.id)}
          >
            <Star className={bookmark.isFavorite ? 'fill-yellow-400' : ''} />
          </Button>
        </div>
        
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center gap-2">
            {bookmark.faviconUrl && (
              <Image src={bookmark.faviconUrl} width={16} height={16} alt="" />
            )}
            <p className="text-xs text-muted-foreground truncate">
              {bookmark.domain}
            </p>
          </div>
          
          <h3 className="font-semibold truncate">{bookmark.title}</h3>
          
          {bookmark.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {bookmark.description}
            </p>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex gap-2 flex-wrap">
          {bookmark.tags.map(({ tag }) => (
            <Badge key={tag.id} style={{ backgroundColor: tag.color }}>
              {tag.name}
            </Badge>
          ))}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
```

### AddBookmarkDialog
```typescript
// components/bookmark/add-bookmark-dialog.tsx
'use client';

import { useCreateBookmark } from '@/hooks/use-bookmarks';
import { useUIStore } from '@/store/ui-store';

export function AddBookmarkDialog() {
  const { isAddBookmarkOpen, setAddBookmarkOpen } = useUIStore();
  const createBookmark = useCreateBookmark();
  const [url, setUrl] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createBookmark.mutateAsync(url);
    setAddBookmarkOpen(false);
    setUrl('');
  };
  
  return (
    <Dialog open={isAddBookmarkOpen} onOpenChange={setAddBookmarkOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Bookmark</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            autoFocus
          />
          
          <DialogFooter>
            <Button type="submit" disabled={createBookmark.isPending}>
              {createBookmark.isPending ? 'Adding...' : 'Add Bookmark'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

### Command Menu (Cmd+K)
```typescript
// components/layout/command-menu.tsx
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: bookmarks } = useBookmarks();
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0">
        <Command>
          <CommandInput placeholder="Search bookmarks..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Bookmarks">
              {bookmarks?.map(bookmark => (
                <CommandItem
                  key={bookmark.id}
                  onSelect={() => {
                    window.open(bookmark.url, '_blank');
                    setOpen(false);
                  }}
                >
                  {bookmark.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

---

## DESIGN SYSTEM REQUIREMENTS

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(222.2 84% 4.9%)',
        foreground: 'hsl(210 40% 98%)',
        primary: 'hsl(217.2 91.2% 59.8%)',
        border: 'hsl(217.2 32.6% 17.5%)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
};
```

### Animation Principles
- **Stagger animations** for masonry grid (0.05s delay)
- **Hover lift** on cards (translateY -4px)
- **Spring transitions** for modals (damping: 25, stiffness: 300)
- **Smooth color transitions** on border hover (200ms)

---

## PROJECT STRUCTURE

```
visualmark/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── collections/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── favorites/page.tsx
│   │   └── archived/page.tsx
│   ├── api/
│   │   └── bookmarks/import/route.ts
│   └── actions/
│       ├── bookmarks.ts
│       ├── collections.ts
│       └── tags.ts
├── components/
│   ├── ui/                           # Shadcn components
│   ├── bookmark/
│   │   ├── bookmark-card.tsx
│   │   ├── add-bookmark-dialog.tsx
│   │   └── import-bookmarks-dialog.tsx
│   ├── layout/
│   │   ├── masonry-grid.tsx
│   │   ├── sidebar.tsx
│   │   ├── command-menu.tsx
│   │   └── top-bar.tsx
│   ├── collection/
│   │   ├── collection-card.tsx
│   │   └── create-collection-dialog.tsx
│   └── tag/
│       ├── tag-badge.tsx
│       └── tag-manager.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── prisma.ts
│   ├── scraper.ts
│   ├── screenshot.ts
│   └── storage.ts
├── store/
│   ├── ui-store.ts
│   └── filter-store.ts
├── hooks/
│   ├── use-bookmarks.ts
│   ├── use-collections.ts
│   └── use-tags.ts
└── prisma/
    └── schema.prisma
```

---

## IMPLEMENTATION PRIORITIES

### Phase 1 (Week 1-2): MVP
1. Setup Next.js + Supabase + Prisma
2. Authentication (Google OAuth)
3. Add bookmark (URL → Metadata → Screenshot → Database)
4. Display masonry grid
5. Basic filters (search, favorites)

### Phase 2 (Week 3-4): Advanced
1. Collections system
2. Tags system
3. Collaboration (sharing + roles)
4. Import browser bookmarks
5. Command menu (Cmd+K)

---

## DELIVERABLES REQUIRED

Generate the following files with complete, production-ready code:

### Core Files
1. `prisma/schema.prisma` - Complete database schema
2. `app/(dashboard)/page.tsx` - Main dashboard with masonry grid
3. `components/bookmark/bookmark-card.tsx` - Visual card component
4. `components/layout/masonry-grid.tsx` - Masonry with Framer Motion
5. `app/actions/bookmarks.ts` - Server Actions for CRUD
6. `lib/scraper.ts` - Metadata extraction
7. `lib/screenshot.ts` - Microlink integration
8. `lib/storage.ts` - Supabase Storage upload
9. `store/ui-store.ts` - Zustand UI state
10. `store/filter-store.ts` - Zustand filter state
11. `hooks/use-bookmarks.ts` - TanStack Query hooks
12. `components/bookmark/add-bookmark-dialog.tsx` - Add bookmark modal
13. `components/layout/command-menu.tsx` - Cmd+K search

### Configuration Files
14. `tailwind.config.js` - Dark mode theme
15. `next.config.js` - Image domains, standalone mode
16. `.env.example` - Environment variables template
17. `package.json` - All dependencies

### Documentation
18. `README.md` - Setup instructions
19. `DEPLOYMENT.md` - Vercel + Docker guides

---

## CRITICAL REQUIREMENTS

### Code Quality
- ✅ TypeScript strict mode
- ✅ Server Components by default (use 'use client' only when needed)
- ✅ Error boundaries for all async operations
- ✅ Loading states for all mutations
- ✅ Optimistic updates with TanStack Query
- ✅ Proper image optimization (next/image)
-