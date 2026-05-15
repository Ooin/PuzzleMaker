"use client";

import { useRef, useState, useEffect } from "react";
import type { MouseEvent } from "react";

export type CellEdges = {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
};

export type CellData = {
  value: number | null;
  locked: boolean;
  disabled: boolean;
  edges: CellEdges;
};

type GridProps = {
  grid: CellData[][];
  gridSize: number;
  selectedCell: [number, number] | null;
  edgeMode: boolean;
  violations?: Set<string>;
  onCellClick: (row: number, col: number) => void;
  onCellRightClick?: (row: number, col: number) => void;
  onEdgeToggle?: (
    row: number,
    col: number,
    direction: "top" | "right" | "bottom" | "left"
  ) => void;
};

export default function Grid({
  grid,
  gridSize,
  selectedCell,
  edgeMode,
  violations,
  onCellClick,
  onCellRightClick,
  onEdgeToggle,
}: GridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(48);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const size = entry.contentRect.width;
      setCellSize(size / gridSize);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [gridSize]);

  const fontSize = Math.max(12, cellSize * 0.55);

  const handleClick = (
    e: MouseEvent<HTMLDivElement>,
    i: number,
    j: number
  ) => {
    const cell = grid[i][j];

    if (edgeMode && !cell.disabled && onEdgeToggle) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const zone = 10;

      if (y < zone) {
        onEdgeToggle(i, j, "top");
        return;
      }
      if (y > 48 - zone) {
        onEdgeToggle(i, j, "bottom");
        return;
      }
      if (x < zone) {
        onEdgeToggle(i, j, "left");
        return;
      }
      if (x > 48 - zone) {
        onEdgeToggle(i, j, "right");
        return;
      }
    }

    onCellClick(i, j);
  };

  return (
    <div
      ref={gridRef}
      className="grid select-none w-full h-full"
      onContextMenu={(e) => e.preventDefault()}
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const selected = selectedCell?.[0] === i && selectedCell?.[1] === j;

          const bTop = cell.edges.top
            ? "2px solid #eab308"
            : "1px solid #4b5563";
          const bRight = cell.edges.right
            ? "2px solid #eab308"
            : "1px solid #4b5563";
          const bBottom = cell.edges.bottom
            ? "2px solid #eab308"
            : "1px solid #4b5563";
          const bLeft = cell.edges.left
            ? "2px solid #eab308"
            : "1px solid #4b5563";

          const inViolation = violations?.has(`${i},${j}`);

          let bg: string;
          let textColor: string;
          let fw: number;
          let outline: string | undefined;

          if (selected && inViolation) {
            bg = "#fef08a";
            textColor = "#dc2626";
            fw = 700;
            outline = "2px solid #dc2626";
          } else if (inViolation) {
            bg = "#dc2626";
            textColor = "#fff";
            fw = 700;
          } else if (cell.disabled) {
            bg = "#eab308";
            textColor = "#000";
            fw = 400;
          } else if (selected) {
            bg = "#fef08a";
            textColor = "#000";
            fw = 400;
          } else if (cell.locked) {
            bg = "#374151";
            textColor = "#60a5fa";
            fw = 700;
          } else {
            bg = "#1f2937";
            textColor = "#d1d5db";
            fw = 400;
          }

          return (
            <div
              key={`${i}-${j}`}
              className="flex items-center justify-center cursor-pointer select-none transition-colors duration-100"
              style={{
                borderTop: bTop,
                borderRight: bRight,
                borderBottom: bBottom,
                borderLeft: bLeft,
                outline,
                outlineOffset: -2,
                backgroundColor: bg,
                color: textColor,
                fontWeight: fw,
                fontSize,
              }}
              onClick={(e) => handleClick(e, i, j)}
              onContextMenu={(e) => {
                e.preventDefault();
                onCellRightClick?.(i, j);
              }}
            >
              {cell.disabled ? "" : cell.value ?? ""}
            </div>
          );
        })
      )}
    </div>
  );
}
