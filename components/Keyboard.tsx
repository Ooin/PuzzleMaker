"use client";

type KeyboardProps = {
  maxDigit: number;
  onNumber: (n: number) => void;
  onClear: () => void;
};

export default function Keyboard({ maxDigit, onNumber, onClear }: KeyboardProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => {
          const disabled = n > maxDigit;
          return (
            <button
              key={n}
              onClick={() => onNumber(n)}
              disabled={disabled}
              className={`w-11 h-11 rounded-lg text-lg font-bold transition-colors ${
                disabled
                  ? "bg-gray-800 text-gray-600 cursor-default"
                  : "bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white cursor-pointer"
              }`}
            >
              {n}
            </button>
          );
        })}
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
