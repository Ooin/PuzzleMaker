"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthStatus({
  onAuthChange,
}: {
  onAuthChange: (user: User | null) => void;
}) {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      onAuthChange(data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      onAuthChange(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-gray-400 truncate max-w-[120px]">{user.email}</span>
      <button
        onClick={handleSignOut}
        className="px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-gray-300 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
}
