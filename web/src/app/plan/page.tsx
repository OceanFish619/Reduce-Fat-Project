import FlashButton from "@/components/FlashButton";

export default function PlanPage() {
  return (
    <div className="page-shell min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
              专属计划
            </p>
            <h1 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
              你的轻盈计划已生成
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              这是基于当前输入生成的预览版，后续可继续微调。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <FlashButton variant="outline" href="/">
              返回首页
            </FlashButton>
            <FlashButton href="/daily">查看日程</FlashButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card rounded-[28px] p-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              核心指标
            </p>
            <div className="mt-5 grid gap-4 text-sm text-[var(--ink-soft)] sm:grid-cols-2">
              {[
                { label: "每日热量", value: "1,620 kcal" },
                { label: "蛋白目标", value: "95 g" },
                { label: "碳水比例", value: "40%" },
                { label: "脂肪比例", value: "30%" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3"
                >
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-[28px] p-6">
              <p className="text-sm font-semibold text-[var(--ink)]">
                每周训练节奏
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink-soft)]">
                <li>周一 / 周三 / 周五：45 分钟有氧</li>
                <li>周二 / 周四：力量 + 核心</li>
                <li>周末：拉伸与恢复</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-xs text-[var(--ink-soft)]">
              每周目标下降 0.4 - 0.6kg，确保代谢不过度下降。
            </div>
            <FlashButton className="w-full" href="/tracking">
              开始执行计划
            </FlashButton>
          </div>
        </div>
      </div>
    </div>
  );
}
