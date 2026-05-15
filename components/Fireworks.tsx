"use client";

export default function Fireworks() {
  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      <div className="flex gap-4 text-5xl">
        {["🎆", "🎉", "🎊", "✨", "🌟"].map((emoji, i) => (
          <span
            key={i}
            className="inline-block"
            style={{
              animation: `firework 1.5s ${i * 0.2}s ease-out both`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
