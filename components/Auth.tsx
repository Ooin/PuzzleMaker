"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center gap-3 p-4 bg-gray-800 rounded-lg min-w-[280px]">
      <h2 className="text-white font-semibold">
        {isSignUp ? "Sign Up" : "Sign In"}
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="px-3 py-1.5 rounded bg-gray-700 text-white text-sm placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="px-3 py-1.5 rounded bg-gray-700 text-white text-sm placeholder-gray-400"
        />
        {error && <span className="text-red-400 text-xs">{error}</span>}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded text-sm text-white transition-colors"
        >
          {loading ? "..." : isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-xs text-gray-400 hover:text-white transition-colors"
      >
        {isSignUp ? "Already have an account? Sign in" : "No account? Sign up"}
      </button>
    </div>
  );
}
