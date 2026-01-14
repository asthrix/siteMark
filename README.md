# SiteMark

A visual bookmark manager that presents your saved URLs as a rich, interactive masonry grid with automated thumbnail generation.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

## Features

- 📸 **Visual Bookmarks** - Automatic thumbnail generation for saved URLs
- 🗂️ **Collections** - Organize bookmarks into custom collections
- 🏷️ **Tags** - Add tags for flexible categorization and filtering
- ⭐ **Favorites** - Quick access to your most important links
- 📦 **Archive** - Archive old bookmarks without deleting them
- 🔍 **Search & Filter** - Find bookmarks instantly with search, tag, and collection filters
- 📊 **Multiple Views** - Grid (masonry) and Table view options
- 🌓 **Dark/Light Mode** - Animated theme toggle
- 📥 **Import/Export** - Import from browser exports (HTML/JSON) and export your data
- ⌨️ **Command Menu** - Quick actions with ⌘K shortcut
- 🔐 **Google Auth** - Secure authentication via Supabase

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | [TypeScript](https://typescriptlang.org) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| UI Components | [Shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com) |
| Animations | [Motion](https://motion.dev) (Framer Motion) |
| Database | [PostgreSQL](https://postgresql.org) via [Supabase](https://supabase.com) |
| ORM | [Prisma](https://prisma.io) |
| Auth | [Supabase Auth](https://supabase.com/auth) (Google OAuth) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm/yarn/pnpm
- Supabase project (for database and auth)

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (Supabase PostgreSQL)
DATABASE_URL=your_database_url
```

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/site-mark.git
cd site-mark

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema (first time setup)
npx prisma db push

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes Prisma generate) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (app)/             # Authenticated routes
│   │   ├── bookmarks/     # All bookmarks page
│   │   ├── favorites/     # Favorites page
│   │   ├── archived/      # Archived bookmarks
│   │   ├── collections/   # Collections pages
│   │   └── settings/      # User settings
│   ├── (auth)/            # Auth routes (login)
│   └── actions/           # Server actions
├── components/
│   ├── ui/                # Shadcn/ui components
│   ├── layout/            # Sidebar, TopBar
│   ├── bookmark/          # Bookmark cards, table, dialogs
│   ├── collection/        # Collection components
│   ├── tag/               # Tag components
│   └── import-export/     # Import/Export dialogs
├── hooks/                 # Custom React hooks
├── store/                 # Zustand stores
├── lib/                   # Utilities
│   ├── prisma.ts          # Prisma client
│   └── supabase/          # Supabase client
└── prisma/
    └── schema.prisma      # Database schema
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

> **Important**: The build script includes `prisma generate` automatically.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using Next.js and Supabase
