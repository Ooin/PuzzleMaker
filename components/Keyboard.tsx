"use client";

type KeyboardProps = {
  maxDigit: number;
  onNumber: (n: number) => void;
  onClear: () => void;
};

export default function Keyboard({ maxDigit, onNumber, onClear }: KeyboardProps) {
  const cols = maxDigit <= 3 ? maxDigit : 3;

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${cols}, 44px)` }}
      >
        {Array.from({ length: maxDigit }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onNumber(n)}
            className="w-11 h-11 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-lg font-bold text-white transition-colors"
          >
            {n}
          </button>
        ))}
      </div>
      <button
        onClick={onClear}
        className="px-6 py-1.5 bg-red-900 hover:bg-red-800 active:bg-red-700 rounded text-sm text-white transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
