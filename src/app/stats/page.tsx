import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { computeStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const events = await prisma.momentumEvent.findMany({
    select: { occurredAt: true, points: true, type: true },
  });

  const stats = computeStats(events);
  const weekDelta = stats.thisWeekPoints - stats.lastWeekPoints;
  const maxDayPoints = Math.max(1, ...stats.last7Days.map((d) => d.points));

  return (
    <div className="min-h-screen px-5 py-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight">Trophy Room</h1>
          <p className="text-sm tracking-wide text-ivory-dim">
            Proof of momentum, built entirely from what you've already done.
          </p>
        </header>

        <Nav active="stats" />

        <div className="grid grid-cols-2 gap-3 mb-6 sm:grid-cols-4">
          <StatCard label="Lifetime Points" value={stats.lifetimePoints} accent="gold" />
          <StatCard label="Total Wins" value={stats.totalWins} accent="teal" />
          <StatCard label="Active Days" value={stats.activeDaysCount} accent="teal" />
          <StatCard
            label="Pace / Active Day"
            value={stats.pointsPerActiveDay.toFixed(1)}
            accent="gold"
          />
        </div>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            This Week vs Last
          </h2>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-xs uppercase tracking-wider text-ivory-dim">This Week</p>
              <p className="text-3xl font-bold text-gold">{stats.thisWeekPoints}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-ivory-dim">Last Week</p>
              <p className="text-3xl font-bold text-ivory-dim">{stats.lastWeekPoints}</p>
            </div>
            {weekDelta !== 0 && (
              <p className={`text-sm font-semibold ${weekDelta > 0 ? "text-teal" : "text-ivory-dim"}`}>
                {weekDelta > 0 ? "+" : ""}
                {weekDelta} vs last week
              </p>
            )}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Last 7 Days
          </h2>
          <div className="flex items-end justify-between gap-2 h-32">
            {stats.last7Days.map((day, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-24 w-full items-end">
                  <div
                    className="w-full rounded-t-md bg-teal"
                    style={{
                      height: `${Math.max(4, (day.points / maxDayPoints) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-ivory-dim">{day.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Best Days
          </h2>
          {stats.bestDays.length === 0 ? (
            <p className="text-sm italic text-ivory-dim">No wins logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.bestDays.map((day, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm"
                >
                  <span>{day.label}</span>
                  <span className="font-bold text-gold">{day.points} pts</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Work / Recovery Mix
          </h2>
          <div className="mb-2 h-3 w-full overflow-hidden rounded-full bg-background">
            <div className="h-full bg-teal" style={{ width: `${100 - stats.recoveryShare}%` }} />
          </div>
          <div className="flex justify-between text-xs text-ivory-dim">
            <span>Work · {stats.workPoints} pts</span>
            <span>Recovery · {stats.recoveryPoints} pts ({stats.recoveryShare}%)</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: "gold" | "teal";
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-panel px-4 py-3.5 text-center">
      <p className="mb-1 text-[10px] uppercase tracking-wider text-ivory-dim">{label}</p>
      <p className={`text-2xl font-bold ${accent === "gold" ? "text-gold" : "text-teal"}`}>
        {value}
      </p>
    </div>
  );
}
