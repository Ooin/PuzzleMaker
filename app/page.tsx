"use client";

import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import Grid, { type CellData } from "@/components/Grid";
import Keyboard from "@/components/Keyboard";
import Timer from "@/components/Timer";
import Fireworks from "@/components/Fireworks";
import Auth from "@/components/Auth";
import AuthStatus from "@/components/AuthStatus";
import Sidebar from "@/components/Sidebar";
import { findViolations, isComplete, getRoomSize } from "@/lib/rules";
import { getPuzzle, type Puzzle } from "@/lib/supabase/puzzleStorage";
import type { User } from "@supabase/supabase-js";

type Mode = "design" | "play";

const createGrid = (n: number): CellData[][] =>
  Array.from({ length: n }, () =>
    Array.from({ length: n }, () => ({
      value: null,
      locked: false,
      disabled: false,
      edges: { top: false, right: false, bottom: false, left: false },
    }))
  );

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPuzzleId, setCurrentPuzzleId] = useState<string | null>(null);
  const [gridSize, setGridSize] = useState(4);
  const [grid, setGrid] = useState<CellData[][]>(() => createGrid(4));
  const [mode, setMode] = useState<Mode>("design");
  const [selected, setSelected] = useState<[number, number] | null>([0, 0]);
  const [edgeMode, setEdgeMode] = useState(false);
  const [disableMode, setDisableMode] = useState(false);
  const [showViolations, setShowViolations] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const gridAreaRef = useRef<HTMLDivElement>(null);
  const [gridPx, setGridPx] = useState(0);
  const gridRef = useRef(grid);
  gridRef.current = grid;

  useLayoutEffect(() => {
    const el = gridAreaRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) setGridPx(Math.min(width, height));
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setGridPx(Math.min(width, height));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const puzzleId = params.get("puzzle");
    if (puzzleId) {
      getPuzzle(puzzleId).then((p) => {
        if (p) {
          setGridSize(p.grid_size);
          setGrid(p.grid_data);
          setMode("play");
        }
      });
    }
  }, []);

  const handleLoadPuzzle = useCallback((puzzle: Puzzle) => {
    setGridSize(puzzle.grid_size);
    setGrid(puzzle.grid_data);
    setCurrentPuzzleId(puzzle.id);
    setMode("play");
    setSelected([0, 0]);
  }, []);

  const handleSaved = useCallback((puzzle: Puzzle) => {
    setCurrentPuzzleId(puzzle.id);
  }, []);

  const resetGrid = useCallback(() => {
    setGrid(createGrid(gridSize));
    setSelected([0, 0]);
    setCurrentPuzzleId(null);
  }, [gridSize]);

  const changeSize = useCallback((n: number) => {
    const size = Math.max(2, Math.min(9, n));
    setGridSize(size);
    setGrid(createGrid(size));
    setSelected([0, 0]);
  }, []);

  const toggleEdge = useCallback(
    (i: number, j: number, direction: "top" | "right" | "bottom" | "left") => {
      setGrid((prev) => {
        const next = prev.map((row) =>
          row.map((cell) => ({ ...cell, edges: { ...cell.edges } }))
        );
        next[i][j].edges[direction] = !next[i][j].edges[direction];
        if (direction === "top" && i > 0)
          next[i - 1][j].edges.bottom = next[i][j].edges.top;
        else if (direction === "bottom" && i < gridSize - 1)
          next[i + 1][j].edges.top = next[i][j].edges.bottom;
        else if (direction === "left" && j > 0)
          next[i][j - 1].edges.right = next[i][j].edges.left;
        else if (direction === "right" && j < gridSize - 1)
          next[i][j + 1].edges.left = next[i][j].edges.right;
        return next;
      });
    },
    [gridSize]
  );

  const clickCell = useCallback(
    (i: number, j: number) => {
      if (grid[i][j].disabled) return;
      if (mode === "design") {
        if (disableMode) {
          setGrid((prev) => {
            const next = prev.map((r) => r.map((c) => ({ ...c })));
            next[i][j].disabled = !next[i][j].disabled;
            return next;
          });
        } else {
          setSelected([i, j]);
        }
      } else {
        setSelected([i, j]);
      }
    },
    [mode, disableMode, grid]
  );

  const rightClickCell = useCallback(
    (i: number, j: number) => {
      if (mode === "design") {
        setGrid((prev) => {
          const next = prev.map((r) => r.map((c) => ({ ...c })));
          next[i][j].disabled = !next[i][j].disabled;
          return next;
        });
      }
    },
    [mode]
  );

  const inputNumber = useCallback(
    (num: number) => {
      if (!selected) return;
      const [i, j] = selected;
      const maxNum = getRoomSize(gridRef.current, i, j, gridSize);
      if (num < 1 || num > maxNum) return;
      setGrid((prev) => {
        if (prev[i][j].disabled) return prev;
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (mode === "design") {
          next[i][j] = { ...next[i][j], value: num, locked: true, disabled: false };
        } else {
          if (next[i][j].locked) return prev;
          next[i][j].value = next[i][j].value === num ? null : num;
        }
        return next;
      });
    },
    [selected, mode, gridSize]
  );

  const handleClear = useCallback(() => {
    if (!selected) return;
    const [i, j] = selected;
    setGrid((prev) => {
      if (prev[i][j].disabled) return prev;
      const next = prev.map((r) => r.map((c) => ({ ...c })));
      if (mode === "design") {
        next[i][j] = { ...next[i][j], value: null, locked: false, disabled: false };
      } else {
        if (next[i][j].locked) return prev;
        next[i][j].value = null;
      }
      return next;
    });
  }, [selected, mode]);

  const clearPlayEntries = useCallback(() => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          !cell.locked && !cell.disabled
            ? { ...cell, value: null }
            : cell
        )
      )
    );
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT") return;
      const n = parseInt(e.key);
      if (n >= 1 && n <= 9) {
        inputNumber(n);
        return;
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        handleClear();
        return;
      }
      if (!selected) return;
      const [i, j] = selected;
      let ni = i;
      let nj = j;
      const g = gridRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          for (let step = 0; step < gridSize; step++) {
            ni = (ni - 1 + gridSize) % gridSize;
            if (!g[ni][j].disabled) break;
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          for (let step = 0; step < gridSize; step++) {
            ni = (ni + 1) % gridSize;
            if (!g[ni][j].disabled) break;
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          for (let step = 0; step < gridSize; step++) {
            nj = (nj - 1 + gridSize) % gridSize;
            if (!g[i][nj].disabled) break;
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          for (let step = 0; step < gridSize; step++) {
            nj = (nj + 1) % gridSize;
            if (!g[i][nj].disabled) break;
          }
          break;
        default:
          return;
      }
      e.preventDefault();
      setSelected([ni, nj]);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selected, gridSize, inputNumber, handleClear]);

  const maxUsable = selected
    ? getRoomSize(grid, selected[0], selected[1], gridSize)
    : gridSize;
  const violations = mode === "play" && showViolations ? findViolations(grid, gridSize) : new Set<string>();
  const solved =
    mode === "play" &&
    violations.size === 0 &&
    grid.every((row) => row.every((c) => c.disabled || c.value !== null));

  return (
    <main className="min-h-screen bg-gray-900 flex flex-col p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {user && (
            <button
              onClick={() => setSidebarOpen((p) => !p)}
              className="lg:hidden w-8 h-8 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded text-white text-lg"
            >
              ☰
            </button>
          )}
          <h1 className="text-lg font-bold text-white">Sudoku Tool</h1>
        </div>
        <AuthStatus onAuthChange={setUser} />
      </div>

      {!user ? (
        <div className="flex-1 flex items-center justify-center">
          <Auth />
        </div>
      ) : (
        <div className="flex-1 flex gap-4 min-h-0">
          <Sidebar
            grid={grid}
            gridSize={gridSize}
            onLoadPuzzle={handleLoadPuzzle}
            currentPuzzleId={currentPuzzleId}
            onSaved={handleSaved}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <div className="flex-1 flex flex-col min-h-0">
              <div className="flex items-start justify-between gap-2 px-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <Timer running={!paused && mode === "play" && !solved} />
                  {mode === "play" && (
                    <button
                      onClick={() => setPaused((p) => !p)}
                      className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
                    >
                      {paused ? "▶" : "⏸"}
                    </button>
                  )}
                  <div className="flex items-center gap-1.5 lg:hidden">
                    {mode === "play" && (
                      <>
                        <button
                          onClick={clearPlayEntries}
                          className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-500 rounded text-xs text-white transition-colors whitespace-nowrap"
                        >
                          Clear
                        </button>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={showViolations}
                            onChange={(e) => setShowViolations(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Highlights
                        </label>
                      </>
                    )}
                    {mode === "design" && (
                      <>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400">Size:</span>
                          <button
                            onClick={() => changeSize(gridSize - 1)}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold leading-none text-xs"
                          >
                            −
                          </button>
                          <span className="w-4 text-center text-white font-medium text-xs">
                            {gridSize}
                          </span>
                          <button
                            onClick={() => changeSize(gridSize + 1)}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold leading-none text-xs"
                          >
                            +
                          </button>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={edgeMode}
                            onChange={(e) => setEdgeMode(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Edges
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={disableMode}
                            onChange={(e) => setDisableMode(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Disable
                        </label>
                        <button
                          onClick={resetGrid}
                          className="px-3 py-1 bg-red-800 hover:bg-red-700 active:bg-red-600 rounded text-xs text-white transition-colors whitespace-nowrap"
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMode("design")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        mode === "design"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Design
                    </button>
                    <button
                      onClick={() => setMode("play")}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        mode === "play"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Play
                    </button>
                  </div>
                  <div className="hidden lg:flex lg:items-center lg:gap-1.5">
                    {mode === "play" && (
                      <>
                        <button
                          onClick={clearPlayEntries}
                          className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 active:bg-yellow-500 rounded text-xs text-white transition-colors whitespace-nowrap"
                        >
                          Clear
                        </button>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={showViolations}
                            onChange={(e) => setShowViolations(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Highlights
                        </label>
                      </>
                    )}
                    {mode === "design" && (
                      <>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-400">Size:</span>
                          <button
                            onClick={() => changeSize(gridSize - 1)}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold leading-none text-xs"
                          >
                            −
                          </button>
                          <span className="w-4 text-center text-white font-medium text-xs">
                            {gridSize}
                          </span>
                          <button
                            onClick={() => changeSize(gridSize + 1)}
                            className="w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded text-white font-bold leading-none text-xs"
                          >
                            +
                          </button>
                        </div>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={edgeMode}
                            onChange={(e) => setEdgeMode(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Edges
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={disableMode}
                            onChange={(e) => setDisableMode(e.target.checked)}
                            className="accent-blue-500"
                          />
                          Disable
                        </label>
                        <button
                          onClick={resetGrid}
                          className="px-3 py-1 bg-red-800 hover:bg-red-700 active:bg-red-600 rounded text-xs text-white transition-colors whitespace-nowrap"
                        >
                          Reset
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {solved && <Fireworks />}

              <div ref={gridAreaRef} className="flex-1 min-h-0 flex items-center justify-center">
                <div className="overflow-hidden shrink-0" style={{ width: gridPx, height: gridPx, maxWidth: '100%', maxHeight: '100%' }}>
                  <Grid
                    grid={grid}
                    gridSize={gridSize}
                    selectedCell={selected}
                    edgeMode={edgeMode && mode === "design"}
                    violations={violations}
                    paused={paused}
                    onCellClick={clickCell}
                    onCellRightClick={rightClickCell}
                    onEdgeToggle={toggleEdge}
                  />
                </div>
              </div>

              <div className="flex justify-center px-1 pb-1">
                <Keyboard maxDigit={maxUsable} onNumber={inputNumber} onClear={handleClear} />
              </div>
            </div>
        </div>
      )}
    </main>
  );
}
