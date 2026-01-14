"use client";

import FlashButton from "@/components/FlashButton";
import { apiPost } from "@/lib/api";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    goalWeight: "",
    planDuration: "8 周稳定",
    height: "",
    weight: "",
    age: "",
    sex: "女性",
    activityLevel: "每周轻度运动",
  });

  const canSubmitSignup =
    form.email.trim() &&
    form.password.trim().length >= 6 &&
    form.height.trim() &&
    form.weight.trim() &&
    !loading;
  const canSubmitLogin = form.email.trim() && form.password.trim() && !loading;

  const handleSubmit = async () => {
    setNotice(null);
    if (mode === "signup" && !canSubmitSignup) {
      setNotice("请填写邮箱、密码、身高、体重。");
      return;
    }
    if (mode === "login" && !canSubmitLogin) {
      setNotice("请输入邮箱与密码。");
      return;
    }
    setLoading(true);
    const redirectBase =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (typeof window !== "undefined" ? window.location.origin : "");
    const emailRedirectTo = redirectBase
      ? `${redirectBase.replace(/\/$/, "")}/onboarding`
      : undefined;
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: {
              height_cm: form.height,
              weight_kg: form.weight,
              age: form.age,
              sex: form.sex,
              activity_level: form.activityLevel,
              goal_weight: form.goalWeight,
              plan_duration: form.planDuration,
            },
            emailRedirectTo,
          },
        });
        if (error) {
          setNotice(error.message);
          return;
        }
        if (!data.session) {
          setNotice("注册成功，请前往邮箱验证后再登录。");
          return;
        }
        await apiPost(
          "/profiles",
          {
            height_cm: Number(form.height) || null,
            weight_kg: Number(form.weight) || null,
            age: Number(form.age) || null,
            sex: form.sex,
            activity_level: form.activityLevel,
            goal_weight: Number(form.goalWeight) || null,
          },
          data.session.access_token
        );
        router.push("/plan");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email,
        password: form.password,
      });
      if (error) {
        setNotice(error.message);
        return;
      }
      if (data.session && form.weight && form.height) {
        await apiPost(
          "/profiles",
          {
            height_cm: Number(form.height) || null,
            weight_kg: Number(form.weight) || null,
            age: Number(form.age) || null,
            sex: form.sex,
            activity_level: form.activityLevel,
            goal_weight: Number(form.goalWeight) || null,
          },
          data.session.access_token
        );
      }
      router.push("/tracking");
    } catch (error) {
      setNotice("注册/登录失败，请检查网络或配置。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
              注册 / 建档
            </p>
            <h1 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
              先建立你的身体档案
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              仅需 2 分钟，生成专属饮食与运动节奏。
            </p>
          </div>
          <FlashButton variant="outline" href="/">
            返回首页
          </FlashButton>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="glass-card rounded-[28px] p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--ink)]">
                  账号与目标
                </p>
                <p className="mt-2 text-sm text-[var(--ink-soft)]">
                  注册或登录后保存你的计划与进度。
                </p>
              </div>
              <div className="flex items-center rounded-full border border-white/70 bg-white/70 p-1 text-xs">
                {["signup", "login"].map((value) => (
                  <button
                    key={value}
                    className={`rounded-full px-3 py-1 transition ${
                      mode === value
                        ? "bg-[var(--mint-4)] text-white"
                        : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
                    }`}
                    onClick={() => setMode(value as "signup" | "login")}
                  >
                    {value === "signup" ? "注册" : "登录"}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-6 space-y-4 text-sm text-[var(--ink-soft)]">
              <label className="space-y-2">
                <span>邮箱</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>{mode === "signup" ? "设置密码" : "密码"}</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="至少 6 位"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>目标体重 (kg)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="55"
                  value={form.goalWeight}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      goalWeight: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>计划周期</span>
                <select
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  value={form.planDuration}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      planDuration: event.target.value,
                    }))
                  }
                >
                  <option>4 周起步</option>
                  <option>8 周稳定</option>
                  <option>12 周深入</option>
                </select>
              </label>
            </div>
            {notice && (
              <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-[var(--ink-soft)]">
                {notice}
              </div>
            )}
          </div>

          <div className="glass-card rounded-[28px] p-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              身体数据
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              用于计算 BMI / BMR / TDEE。
            </p>
            <div className="mt-6 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              <label className="space-y-2">
                <span>身高 (cm)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="168"
                  value={form.height}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      height: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>体重 (kg)</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="62"
                  value={form.weight}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      weight: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>年龄</span>
                <input
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  placeholder="24"
                  value={form.age}
                  inputMode="decimal"
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      age: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="space-y-2">
                <span>性别</span>
                <select
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  value={form.sex}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      sex: event.target.value,
                    }))
                  }
                >
                  <option>女性</option>
                  <option>男性</option>
                  <option>其他 / 不透露</option>
                </select>
              </label>
              <label className="space-y-2 sm:col-span-2">
                <span>日常活动量</span>
                <select
                  className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                  value={form.activityLevel}
                  onChange={(event) =>
                    setForm((prev) => ({
                      ...prev,
                      activityLevel: event.target.value,
                    }))
                  }
                >
                  <option>久坐办公</option>
                  <option>每周轻度运动</option>
                  <option>每周 3-5 次运动</option>
                  <option>高强度训练者</option>
                </select>
              </label>
            </div>
            <div className="mt-5 rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-xs text-[var(--ink-soft)]">
              {mode === "signup"
                ? "默认建议热量差 12% - 18%，避免过度节食。"
                : "登录模式下可不填写身体数据。"}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <FlashButton
                onClick={handleSubmit}
                disabled={mode === "signup" ? !canSubmitSignup : !canSubmitLogin}
              >
                {loading
                  ? "处理中..."
                  : mode === "signup"
                    ? "创建账号并生成计划"
                    : "登录并继续"}
              </FlashButton>
              <FlashButton variant="ghost" href="/daily">
                先看范例
              </FlashButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
