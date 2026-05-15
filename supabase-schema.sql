-- Run this in the Supabase SQL Editor
-- Create puzzles table
create table puzzles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null default 'Untitled',
  grid_size int not null,
  grid_data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table puzzles enable row level security;

-- Users can CRUD only their own puzzles
create policy "Users can insert their own puzzles"
  on puzzles for insert
  with check (auth.uid() = user_id);

create policy "Users can view their own puzzles"
  on puzzles for select
  using (auth.uid() = user_id);

create policy "Users can update their own puzzles"
  on puzzles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own puzzles"
  on puzzles for delete
  using (auth.uid() = user_id);

-- Allow anyone to read a puzzle by id (for sharing)
create policy "Anyone can view a shared puzzle"
  on puzzles for select
  using (true);
