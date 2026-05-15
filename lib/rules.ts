import type { CellData } from "@/components/Grid";

function findDups(
  grid: CellData[][],
  r1: number, c1: number,
  r2: number, c2: number
) {
  const seen = new Map<number, { row: number; col: number }[]>();
  const dups: { row: number; col: number }[] = [];

  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      const cell = grid[r][c];
      if (cell.disabled || cell.value === null) continue;
      if (!seen.has(cell.value)) seen.set(cell.value, []);
      seen.get(cell.value)!.push({ row: r, col: c });
    }
  }

  for (const [, positions] of seen) {
    if (positions.length > 1) dups.push(...positions);
  }
  return dups;
}

export function findViolations(grid: CellData[][], gridSize: number): Set<string> {
  const violations = new Set<string>();

  // horizontal segments — split where a cell has a highlighted right edge
  for (let row = 0; row < gridSize; row++) {
    let start = 0;
    for (let col = 0; col < gridSize; col++) {
      if (col === gridSize - 1 || grid[row][col].edges.right) {
        const dups = findDups(grid, row, start, row, col);
        for (const p of dups) violations.add(`${p.row},${p.col}`);
        start = col + 1;
      }
    }
  }

  // vertical segments — split where a cell has a highlighted bottom edge
  for (let col = 0; col < gridSize; col++) {
    let start = 0;
    for (let row = 0; row < gridSize; row++) {
      if (row === gridSize - 1 || grid[row][col].edges.bottom) {
        const dups = findDups(grid, start, col, row, col);
        for (const p of dups) violations.add(`${p.row},${p.col}`);
        start = row + 1;
      }
    }
  }

  return violations;
}

export function getRoomSize(
  grid: CellData[][],
  row: number,
  col: number,
  gridSize: number
): number {
  let left = col;
  while (left > 0 && !grid[row][left].edges.left) left--;
  let right = col;
  while (right < gridSize - 1 && !grid[row][right].edges.right) right++;
  const hSize = right - left + 1;

  let top = row;
  while (top > 0 && !grid[top][col].edges.top) top--;
  let bottom = row;
  while (bottom < gridSize - 1 && !grid[bottom][col].edges.bottom) bottom++;
  const vSize = bottom - top + 1;

  return Math.min(hSize, vSize);
}

export function isComplete(grid: CellData[][], gridSize: number): boolean {
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!grid[i][j].disabled && grid[i][j].value === null) return false;
    }
  }
  return findViolations(grid, gridSize).size === 0;
}
