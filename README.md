# 🏠 Home Projects Kanban

A modern kanban board for home projects — built with **Next.js**, **Supabase**, **TanStack React Query**, and **dnd-kit**.

## Features

- 📋 Three columns: **Backlog**, **Active**, **Done**
- 🖱️ Drag-and-drop projects between columns
- ✅ Task checklists per project with progress bar
- ✏️ Inline editing for project title & description
- ⚡ Real-time optimistic UI with TanStack React Query
- 🗄️ Supabase backend (Postgres + RLS)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial.sql` via the SQL editor
3. Copy your project URL and anon key

### 2. Environment

```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run locally

```bash
npm install
npm run dev
```

### 4. Deploy to Vercel

```bash
npx vercel --prod
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Database | Supabase (Postgres) |
| Data fetching | TanStack React Query v5 |
| Drag & drop | dnd-kit |
| Icons | Lucide React |
