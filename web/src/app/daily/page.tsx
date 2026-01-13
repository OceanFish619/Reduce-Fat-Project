import FlashButton from "@/components/FlashButton";

export default function DailySamplePage() {
  return (
    <div className="page-shell min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--mint-5)]">
              今日范例
            </p>
            <h1 className="font-display text-3xl text-[var(--ink)] md:text-4xl">
              轻盈日程示例
            </h1>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              看看一天的饮食与运动如何组合，保持轻盈和饱腹。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <FlashButton variant="outline" href="/">
              返回首页
            </FlashButton>
            <FlashButton href="/onboarding">定制我的计划</FlashButton>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card rounded-[28px] p-6">
            <p className="text-sm font-semibold text-[var(--ink)]">
              饮食节奏
            </p>
            <div className="mt-4 space-y-4 text-sm text-[var(--ink-soft)]">
              {[
                {
                  title: "早餐 08:00",
                  items: ["希腊酸奶 150g", "蓝莓 1 小碗", "奇亚籽 5g"],
                },
                {
                  title: "午餐 12:30",
                  items: ["鸡胸 120g", "糙米饭半碗", "羽衣甘蓝沙拉"],
                },
                {
                  title: "加餐 16:00",
                  items: ["黄瓜条", "无糖气泡水", "杏仁 6 颗"],
                },
                {
                  title: "晚餐 18:30",
                  items: ["三文鱼 100g", "烤南瓜", "西兰花"],
                },
              ].map((meal) => (
                <div
                  key={meal.title}
                  className="rounded-3xl border border-white/70 bg-white/80 p-4"
                >
                  <p className="text-sm font-semibold text-[var(--ink)]">
                    {meal.title}
                  </p>
                  <ul className="mt-3 space-y-2">
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

          <div className="space-y-6">
            <div className="glass-card rounded-[28px] p-6">
              <p className="text-sm font-semibold text-[var(--ink)]">
                今日训练
              </p>
              <p className="mt-3 text-sm text-[var(--ink-soft)]">
                35 分钟低强度有氧 + 15 分钟核心力量。
              </p>
              <div className="mt-4 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-xs text-[var(--ink-soft)]">
                推荐心率区间：最大心率 60% - 70%
              </div>
            </div>
            <div className="glass-card rounded-[28px] p-6">
              <p className="text-sm font-semibold text-[var(--ink)]">
                今日目标
              </p>
              <ul className="mt-4 space-y-3 text-sm text-[var(--ink-soft)]">
                <li>饮水 2.2L</li>
                <li>步数 8,000</li>
                <li>睡眠 7 小时以上</li>
              </ul>
              <div className="mt-6">
                <FlashButton className="w-full" href="/onboarding">
                  获取我的专属日程
                </FlashButton>
              </div>
            </div>
            <div className="rounded-3xl border border-white/70 bg-white/70 px-5 py-4 text-xs text-[var(--ink-soft)]">
              注：这是范例计划，实际会根据你的 BMI 与目标动态调整。
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
