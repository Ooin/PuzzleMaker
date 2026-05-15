"use client";

import { createClient } from "./client";
import type { CellData } from "@/components/Grid";

export type Puzzle = {
  id: string;
  name: string;
  grid_size: number;
  grid_data: CellData[][];
  created_at: string;
  updated_at: string;
};

export async function savePuzzle(
  name: string,
  grid: CellData[][],
  gridSize: number
): Promise<Puzzle | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("puzzles")
    .insert({ name, grid_size: gridSize, grid_data: grid, user_id: user.id })
    .select()
    .single();

  if (error) {
    console.error("Failed to save puzzle:", error);
    return null;
  }
  return data;
}

export async function updatePuzzle(
  id: string,
  name: string,
  grid: CellData[][],
  gridSize: number
): Promise<Puzzle | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("puzzles")
    .update({ name, grid_size: gridSize, grid_data: grid })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Failed to update puzzle:", error);
    return null;
  }
  return data;
}

export async function deletePuzzle(id: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.from("puzzles").delete().eq("id", id);
  if (error) {
    console.error("Failed to delete puzzle:", error);
    return false;
  }
  return true;
}

export async function listPuzzles(): Promise<Puzzle[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Failed to list puzzles:", error);
    return [];
  }
  return data ?? [];
}

export async function getPuzzle(id: string): Promise<Puzzle | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("puzzles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Failed to get puzzle:", error);
    return null;
  }
  return data;
}
