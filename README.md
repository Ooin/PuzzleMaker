# Sudoku Tool

A web-based puzzle designer and player for grid-based logic puzzles with regions (walls). Design custom puzzles, play them, and share them with others.

## Features

- **Design mode** — create puzzles from scratch: set grid size (2–9), place numbers, draw walls (edges), and disable cells
- **Play mode** — solve puzzles with typed/keyboard input, violation highlighting, and a timer
- **Room-based validation** — input is constrained to the size of the room (region bounded by walls)
- **Save & share** — authenticated users can save puzzles and share them via a link
- **Responsive grid** — scales to fill the available screen space

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) — auth, database, RLS

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<your-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-publishable-key>
```

### Database

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create the `puzzles` table and RLS policies.

## Deployment

Compatbiel with any Next.js hosting (Vercel, Netlify, GitHub Pages via `next export`).
