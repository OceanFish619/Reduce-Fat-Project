import type { CSSProperties } from "react";
import FlashButton from "@/components/FlashButton";

const revealStyle = (delay: number): CSSProperties =>
  ({
    "--delay": `${delay}ms`,
  } as CSSProperties);

export default function Home() {
  return (
    <div className="page-shell min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-32 right-[-5%] h-72 w-72 rounded-full bg-[var(--mint-3)] opacity-40 blur-3xl float-slow" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-8%] h-80 w-80 rounded-full bg-[var(--sun)] opacity-70 blur-3xl float-slower" />

      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--mint-2)] text-[var(--mint-5)] shadow-[0_12px_20px_rgba(20,138,97,0.2)]">
              <span className="text-lg font-semibold">LF</span>
            </div>
            <div>
              <p className="font-display text-lg text-[var(--ink)]">轻盈计划</p>
              <p className="text-xs text-[var(--ink-soft)]">Lean Flow Lab</p>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-sm text-[var(--ink-soft)] md:flex">
            <a className="transition hover:text-[var(--ink)]" href="#plan">
              方案逻辑
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#custom">
              定制入口
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#daily">
              每日范例
            </a>
          </div>
          <FlashButton className="text-sm" variant="outline" href="/onboarding">
            免费定制
          </FlashButton>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 pb-20 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-7">
            <div
              className="reveal inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--mint-5)]"
              style={revealStyle(60)}
            >
              14 天轻盈挑战
            </div>
            <h1
              className="reveal font-display text-4xl leading-tight text-[var(--ink)] md:text-5xl"
              style={revealStyle(120)}
            >
              用绿色习惯叠加，打造属于你的减脂节奏
            </h1>
            <p
              className="reveal max-w-xl text-base leading-relaxed text-[var(--ink-soft)] md:text-lg"
              style={revealStyle(180)}
            >
              轻盈计划把饮食、运动与作息拆成可执行的日步骤，让你在不焦虑的
              情况下稳定下降体脂。每周自动调整，轻松对齐目标。
            </p>
            <div className="reveal flex flex-wrap gap-4" style={revealStyle(240)}>
              <FlashButton href="/onboarding">生成我的计划</FlashButton>
              <FlashButton variant="ghost" href="/daily">
                查看一日范例
              </FlashButton>
            </div>
            <div
              className="reveal grid grid-cols-1 gap-4 pt-2 text-sm text-[var(--ink-soft)] sm:grid-cols-3"
              style={revealStyle(300)}
            >
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  每日热量
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  1,650 kcal
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  目标周期
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  8-12 周
                </p>
              </div>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                  计划匹配
                </p>
                <p className="mt-2 text-xl font-semibold text-[var(--ink)]">
                  92% 适配
                </p>
              </div>
            </div>
          </div>

          <div className="reveal" style={revealStyle(220)}>
            <div className="glass-card rounded-[28px] p-6">
              <div className="flex items-center justify-between text-sm text-[var(--ink-soft)]">
                <span>今日计划</span>
                <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-xs text-[var(--mint-5)]">
                  第 4 天
                </span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                      热量目标
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-[var(--ink)]">
                      1,650 kcal
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--ink-soft)]">
                    <p>早餐 30%</p>
                    <p>午餐 40%</p>
                    <p>晚餐 30%</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-white/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                    今日训练
                  </p>
                  <p className="mt-2 text-base font-semibold text-[var(--ink)]">
                    45 分钟节奏有氧 + 核心
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-[var(--mint-5)]">
                      心率区间 2-3
                    </span>
                    <span className="rounded-full bg-[var(--mint-2)] px-3 py-1 text-[var(--mint-5)]">
                      放松伸展 10 分钟
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-[var(--ink-soft)]">
                    <span>今日完成度</span>
                    <span>68%</span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-[var(--mint-2)]">
                    <div className="h-2 w-[68%] rounded-full bg-[var(--mint-4)]" />
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-[var(--ink-soft)]">
                  <span>饮水提醒</span>
                  <span className="font-semibold text-[var(--ink)]">1.8L / 2.2L</span>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-[var(--ink-soft)]">
              <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                低油盐轻食
              </span>
              <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                轻断食窗口
              </span>
              <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                睡眠优先
              </span>
            </div>
          </div>
        </section>

        <section
          id="plan"
          className="mx-auto w-full max-w-6xl px-6 pb-20"
        >
          <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                方案逻辑
              </p>
              <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
                四步建立减脂节奏
              </h2>
              <p className="text-base text-[var(--ink-soft)]">
                不再靠意志力硬撑，用你能坚持的小步骤，稳定地下降体脂。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "身高体重建档",
                  desc: "自动计算 BMI、BMR 与每日热量需求。",
                },
                {
                  title: "饮食结构拆分",
                  desc: "蛋白优先，控制精致碳水与油脂。",
                },
                {
                  title: "训练强度匹配",
                  desc: "根据活动量安排有氧与力量比例。",
                },
                {
                  title: "每周复盘调整",
                  desc: "每 7 天微调热量与训练曲线。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="soft-shadow rounded-3xl border border-white/70 bg-white/80 p-6"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm text-[var(--ink-soft)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="custom"
          className="mx-auto w-full max-w-6xl px-6 pb-20"
        >
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
            <div className="space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                个性化入口
              </p>
              <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
                填几项基础数据，拿到你的轻盈方案
              </h2>
              <p className="text-base text-[var(--ink-soft)]">
                我们会根据身高体重、目标体重与活动水平，自动生成饮食与运动
                节奏，并同步建议的热量区间。
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-[var(--ink-soft)]">
                <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                  晨起体重追踪
                </span>
                <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                  低负担备餐建议
                </span>
                <span className="rounded-full border border-white/70 bg-white/60 px-3 py-1">
                  每日动作清单
                </span>
              </div>
            </div>
            <div className="glass-card rounded-[28px] p-6">
              <form className="space-y-4 text-sm text-[var(--ink-soft)]">
                <div className="grid grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span>身高 (cm)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="168"
                    />
                  </label>
                  <label className="space-y-2">
                    <span>体重 (kg)</span>
                    <input
                      className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                      placeholder="62"
                    />
                  </label>
                </div>
                <label className="space-y-2">
                  <span>目标体重 (kg)</span>
                  <input
                    className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]"
                    placeholder="55"
                  />
                </label>
                <label className="space-y-2">
                  <span>活动量</span>
                  <select className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]">
                    <option>久坐办公</option>
                    <option>每周轻度运动</option>
                    <option>每周 3-5 次运动</option>
                    <option>高强度训练者</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span>计划周期</span>
                  <select className="w-full rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-[var(--ink)] outline-none focus:ring-2 focus:ring-[var(--mint-3)]">
                    <option>4 周起步</option>
                    <option>8 周稳定</option>
                    <option>12 周深入</option>
                  </select>
                </label>
                <div className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-xs text-[var(--ink-soft)]">
                  预计每周下降 0.4 - 0.6kg，能量差控制在 15% 左右。
                </div>
                <FlashButton className="w-full" href="/onboarding">
                  生成 14 天计划
                </FlashButton>
              </form>
            </div>
          </div>
        </section>

        <section id="daily" className="mx-auto w-full max-w-6xl px-6 pb-24">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                每日范例
              </p>
              <h2 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
                从今天开始的轻盈日程
              </h2>
              <p className="text-base text-[var(--ink-soft)]">
                轻盈计划会把每一天拆成清晰的执行项，给你轻食组合、运动
                建议与放松提醒。
              </p>
              <FlashButton variant="ghost" href="/daily">
                下载今天清单
              </FlashButton>
            </div>
            <div className="grid gap-4">
              {[
                {
                  title: "早餐",
                  items: ["希腊酸奶 + 蓝莓", "坚果 10g", "黑咖啡"],
                },
                {
                  title: "午餐",
                  items: ["香煎鸡胸 120g", "藜麦 80g", "蔬菜沙拉"],
                },
                {
                  title: "加餐",
                  items: ["黄瓜条", "无糖气泡水"],
                },
                {
                  title: "晚餐",
                  items: ["三文鱼 100g", "烤南瓜", "西兰花"],
                },
              ].map((meal) => (
                <div
                  key={meal.title}
                  className="rounded-3xl border border-white/70 bg-white/80 p-5"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {meal.title}
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-[var(--ink-soft)]">
                    {meal.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-[var(--mint-4)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/60 bg-white/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-2xl text-[var(--ink)]">
              现在开始轻盈计划
            </p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              每天 20 分钟，建立可持续的减脂节奏。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <FlashButton href="/onboarding">加入轻盈计划</FlashButton>
            <FlashButton variant="outline" href="/onboarding">
              预约体测
            </FlashButton>
          </div>
        </div>
      </footer>
    </div>
  );
}
