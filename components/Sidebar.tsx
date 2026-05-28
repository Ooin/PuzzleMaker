"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { listPuzzles, deletePuzzle, type Puzzle } from "@/lib/supabase/puzzleStorage";
import type { CellData } from "@/components/Grid";

type SidebarProps = {
  grid: CellData[][];
  gridSize: number;
  onLoadPuzzle: (puzzle: Puzzle) => void;
  currentPuzzleId: string | null;
  onSaved: (puzzle: Puzzle) => void;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({
  grid,
  gridSize,
  onLoadPuzzle,
  currentPuzzleId,
  onSaved,
  open,
  onClose,
}: SidebarProps) {
  const supabase = createClient();
  const [user, setUser] = useState<object | null>(null);
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [saveName, setSaveName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const refresh = useCallback(async () => {
    const list = await listPuzzles();
    setPuzzles(list);
  }, []);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  if (!user) return null;

  const handleSave = async () => {
    const name = saveName.trim() || "Untitled";
    setSaving(true);

    const { savePuzzle, updatePuzzle } = await import(
      "@/lib/supabase/puzzleStorage"
    );

    let result: Puzzle | null;
    if (currentPuzzleId) {
      result = await updatePuzzle(currentPuzzleId, name, grid, gridSize);
    } else {
      result = await savePuzzle(name, grid, gridSize);
    }

    if (result) {
      setSaveName("");
      onSaved(result);
      await refresh();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await deletePuzzle(id);
    await refresh();
  };

  const handleShare = async (id: string) => {
    const url = `${window.location.origin}?puzzle=${id}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`flex flex-col gap-3 min-w-[220px] max-w-[260px] ${
          open
            ? "fixed left-2 top-2 bottom-2 z-20 bg-gray-900 p-2 rounded-lg shadow-2xl"
            : "hidden"
        } lg:relative lg:flex lg:top-auto lg:left-auto lg:bottom-auto lg:z-auto lg:bg-transparent lg:p-0 lg:shadow-none`}
      >
        <div className="flex items-center justify-between lg:hidden">
          <span className="text-sm font-semibold text-gray-300">Puzzles</span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3 bg-gray-800 rounded-lg">
          <input
            type="text"
            placeholder="Puzzle name..."
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="px-2 py-1 rounded bg-gray-700 text-white text-sm placeholder-gray-400"
          />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 bg-green-700 hover:bg-green-600 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
          >
            {saving ? "Saving..." : currentPuzzleId ? "Update" : "Save"}
          </button>
        </div>

        <div className="flex flex-col gap-1 overflow-y-auto">
          {puzzles.length === 0 && (
            <span className="text-gray-500 text-xs text-center">No saved puzzles</span>
          )}
          {puzzles.map((p) => (
            <div
              key={p.id}
              className={`flex items-center gap-1 p-2 rounded text-sm cursor-pointer transition-colors ${
                currentPuzzleId === p.id
                  ? "bg-blue-800 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <span
                className="flex-1 truncate"
                onClick={() => { onLoadPuzzle(p); onClose(); }}
                title={p.name}
              >
                {p.name}
              </span>
              <button
                onClick={() => handleShare(p.id)}
                className="text-xs text-gray-400 hover:text-white shrink-0"
                title="Copy share link"
              >
                🔗
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(p.id);
                }}
                className="text-xs text-gray-400 hover:text-red-400 shrink-0"
                title="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
