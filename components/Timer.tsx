"use client";
import { useState, useEffect, useRef } from "react";

export default function Timer({ running }: { running: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const wasRunning = useRef(false);

  useEffect(() => {
    if (running && !wasRunning.current) {
      setElapsed(0);
    }
    wasRunning.current = running;
  }, [running]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <div className="text-3xl font-mono text-gray-200 tracking-wider">
      {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </div>
  );
}
