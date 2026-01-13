"use client";

import { supabase } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthState = {
  email?: string | null;
  loading: boolean;
};

export default function AuthBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<AuthState>({
    email: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) {
          return;
        }
        setState({
          email: data.session?.user?.email ?? null,
          loading: false,
        });
      })
      .catch(() => {
        if (active) {
          setState({ email: null, loading: false });
        }
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setState({ email: nextSession?.user?.email ?? null, loading: false });
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (pathname !== "/") {
      router.push("/");
    }
  };

  if (state.loading) {
    return null;
  }

  return (
    <div className="pointer-events-auto">
      <div className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs text-[var(--ink-soft)] shadow-sm">
        {state.email ? (
          <>
            <span>已登录：{state.email}</span>
            <button
              className="rounded-full border border-[var(--mint-3)] px-3 py-1 text-[10px] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
              onClick={handleLogout}
            >
              退出登录
            </button>
          </>
        ) : (
          <>
            <span>未登录</span>
            <button
              className="rounded-full border border-[var(--mint-3)] px-3 py-1 text-[10px] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
              onClick={() => router.push("/onboarding")}
            >
              登录 / 注册
            </button>
          </>
        )}
      </div>
    </div>
  );
}
