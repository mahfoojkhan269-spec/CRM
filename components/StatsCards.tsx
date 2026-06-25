type StatItem = {
  label: string;
  count: number;
  tone: "default" | "warn" | "good" | "overdue";
};

const TONE_STYLES: Record<StatItem["tone"], { color: string; bg: string }> = {
  default: { color: "var(--ink)", bg: "var(--paper-raised)" },
  warn: { color: "var(--status-pending)", bg: "var(--status-pending-bg)" },
  good: { color: "var(--status-filed)", bg: "var(--status-filed-bg)" },
  overdue: { color: "var(--overdue)", bg: "var(--overdue-bg)" },
};

export default function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
      {stats.map((s) => {
        const style = TONE_STYLES[s.tone];
        return (
          <div
            key={s.label}
            className="border border-rule rounded-lg p-3 flex flex-col gap-1"
            style={{ backgroundColor: style.bg }}
          >
            <span className="font-data text-2xl font-bold" style={{ color: style.color }}>
              {s.count}
            </span>
            <span className="text-xs text-ink-soft leading-tight">{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}