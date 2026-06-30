import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CaptureBox } from "@/components/CaptureBox";
import { InboxList } from "@/components/InboxList";
import { TaskList } from "@/components/TaskList";
import { TodayBoard } from "@/components/TodayBoard";
import { SelfCareGrid } from "@/components/SelfCareGrid";
import { DailyRituals } from "@/components/DailyRituals";
import { Pomodoro } from "@/components/Pomodoro";
import { Nav } from "@/components/Nav";
import { GoalsPanel } from "@/components/GoalsPanel";
import { getBalances } from "@/lib/balances";
import { getLevelProgress } from "@/lib/levels";

export const dynamic = "force-dynamic";

async function getOrCreateAppState() {
  return prisma.appState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function Home() {
  const appState = await getOrCreateAppState();
  const monthKey = currentMonthKey();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    inboxItems,
    waitingTasks,
    todayTasks,
    balances,
    selfCareEvents,
    monthPlan,
    rituals,
    ritualEvents,
    doneTodayCount,
    thisWeekPoints,
    lastWeekPoints,
  ] = await Promise.all([
    prisma.inboxItem.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.task.findMany({
      where: { pulledToToday: false, done: false },
      orderBy: { createdAt: "desc" },
    }),
    prisma.task.findMany({
      where: { pulledToToday: true },
      include: { subtasks: { orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    }),
    getBalances(),
    prisma.momentumEvent.findMany({
      where: {
        type: "selfcare",
        occurredAt: { gte: appState.recoveryCycleStartedAt },
      },
      select: { selfCareId: true },
    }),
    prisma.monthPlan.findUnique({ where: { monthKey }, include: { goals: { orderBy: { createdAt: "asc" } } } }),
    prisma.ritual.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.momentumEvent.findMany({
      where: {
        type: "ritual",
        occurredAt: { gte: appState.recoveryCycleStartedAt },
      },
      select: { ritualId: true },
    }),
    prisma.momentumEvent.count({
      where: { occurredAt: { gte: todayStart } },
    }),
    prisma.momentumEvent.aggregate({
      where: { occurredAt: { gte: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); d.setHours(0,0,0,0); return d; })() } },
      _sum: { points: true },
    }),
    prisma.momentumEvent.aggregate({
      where: {
        occurredAt: {
          gte: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) - 7); d.setHours(0,0,0,0); return d; })(),
          lt: (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); d.setHours(0,0,0,0); return d; })(),
        },
      },
      _sum: { points: true },
    }),
  ]);

  const { lifetimePoints, rewardCredits } = balances;
  const levelProgress = getLevelProgress(lifetimePoints);
  const todayActiveCount = todayTasks.filter((t: { done: boolean }) => !t.done).length;
  const usedSelfCareIds = selfCareEvents
    .map((e: { selfCareId: string | null }) => e.selfCareId)
    .filter((id: string | null): id is string => Boolean(id));
  const usedRitualIds = ritualEvents
    .map((e: { ritualId: string | null }) => e.ritualId)
    .filter((id: string | null): id is string => Boolean(id));
  const thisWeek = thisWeekPoints._sum.points ?? 0;
  const lastWeek = lastWeekPoints._sum.points ?? 0;
  const weekDelta = thisWeek - lastWeek;

  return (
    <div className="min-h-screen px-5 py-6 pb-16">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-ivory-dim">
              The Atelier Lair // Command Center
            </p>
            <h1 className="text-sm font-bold leading-relaxed tracking-widest uppercase max-w-md" style={{ fontFamily: "var(--font-cinzel)" }}>
              &ldquo;A king may be the most important piece on the chessboard; however, the queen is the most powerful.&rdquo;
              <span className="mt-1 block text-sm font-normal text-ivory-dim">— Karim R. Ellis</span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal">
                <span className="inline-block h-2 w-2 rounded-full bg-teal shadow-[0_0_6px_rgba(43,191,145,0.8)]" />
                Atelier Online
              </span>
              {monthPlan?.word && (
                <Link
                  href="/plan"
                  className="rounded-full border border-gold/40 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-gold hover:border-gold"
                >
                  Month Word // {monthPlan.word}
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <StatChip label="Lifetime" value={lifetimePoints} accent="gold" />
            <StatChip label="Credits" value={rewardCredits} accent="teal" />
            <StatChip label="Done Today" value={doneTodayCount} accent="ivory" />
            <div className="flex min-w-[140px] flex-col justify-between rounded-xl border border-border bg-bg-panel px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-numeric text-[10px] uppercase tracking-wider text-ivory-dim">
                  Lvl {levelProgress.level}
                </span>
                <span className="font-numeric text-[10px] text-gold">{levelProgress.percentToNextLevel}%</span>
              </div>
              <p className="text-sm font-semibold">{levelProgress.name}</p>
              <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-background">
                <div className="h-full rounded-full bg-gold" style={{ width: `${levelProgress.percentToNextLevel}%` }} />
              </div>
              <p className="font-numeric mt-1 text-[10px] text-ivory-dim">
                {levelProgress.isMaxLevel ? "Max level" : `${levelProgress.pointsToNextLevel} pts → ${levelProgress.nextLevelName}`}
              </p>
            </div>
          </div>
        </header>

        <Nav active="day" />

        {/* Trophy ticker */}
        <Link
          href="/stats"
          className="mb-5 flex items-center justify-between rounded-xl border border-border bg-bg-panel px-4 py-2.5 text-xs text-ivory-dim hover:border-teal hover:text-foreground"
        >
          <span className="font-semibold uppercase tracking-wider text-teal">Trophy Room</span>
          <span className="font-numeric">
            {thisWeek} pts this week
            {lastWeek > 0 && (
              <span className={weekDelta >= 0 ? "text-teal" : ""}>
                {" "}— {weekDelta >= 0 ? "+" : ""}{weekDelta} vs last week
              </span>
            )}
          </span>
          <span>→</span>
        </Link>

        {/* Monthly Goals */}
        {monthPlan?.goals && monthPlan.goals.length > 0 && (
          <section className="mb-5 rounded-2xl border border-border bg-bg-panel p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-ivory-dim">This Month</p>
                <h2 className="text-lg font-bold">
                  {monthPlan.word ? `${monthPlan.word} — ` : ""}Goals
                </h2>
              </div>
              <Link href="/plan" className="text-xs text-ivory-dim hover:text-foreground">
                Edit →
              </Link>
            </div>
            <GoalsPanel word={monthPlan.word ?? null} goals={monthPlan.goals} />
          </section>
        )}

        {/* 2-column main layout */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">

          {/* Left column */}
          <div className="flex flex-col gap-5 lg:col-span-3">
            <section className="rounded-2xl border border-border bg-bg-panel p-5">
              <DailyRituals rituals={rituals} usedIds={usedRitualIds} />
            </section>

            <section className="rounded-2xl border border-border bg-bg-panel p-5">
              <div className="mb-3.5 flex items-baseline justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-ivory-dim">Today&apos;s Operation</p>
                  <h2 className="text-lg font-bold">Three moves. Keep it winnable.</h2>
                </div>
                <span className="text-xs text-ivory-dim">{todayActiveCount}/3</span>
              </div>
              <TodayBoard tasks={todayTasks} />
            </section>

            <section className="rounded-2xl border border-border bg-bg-panel p-5">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-ivory-dim">Recovery Protocol</p>
              <h2 className="mb-3.5 text-lg font-bold">Protecting the operator counts.</h2>
              <SelfCareGrid usedIds={usedSelfCareIds} />
            </section>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5 lg:col-span-2">
            <section className="rounded-2xl border border-border bg-bg-panel p-5">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-ivory-dim">Focus</p>
              <h2 className="mb-4 text-lg font-bold">Pomodoro</h2>
              <Pomodoro />
            </section>

            <section className="rounded-2xl border border-border bg-bg-panel p-5">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-ivory-dim">Field Intel</p>
              <h2 className="mb-3.5 text-lg font-bold">Drop the thought. Sort it later.</h2>
              <CaptureBox />
              <InboxList items={inboxItems} />
            </section>
          </div>
        </div>

        {/* Full-width Tasks */}
        <section className="mt-5 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">Tasks</h2>
          <TaskList tasks={waitingTasks} todayActiveCount={todayActiveCount} />
        </section>

      </div>
    </div>
  );
}

function StatChip({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "gold" | "teal" | "ivory";
}) {
  const colorMap = {
    gold: "text-gold drop-shadow-[0_0_12px_rgba(232,184,75,0.4)]",
    teal: "text-teal",
    ivory: "text-foreground",
  };
  return (
    <div className="flex flex-col justify-between rounded-xl border border-border bg-bg-panel px-4 py-3 min-w-[80px]">
      <span className="text-[10px] uppercase tracking-wider text-ivory-dim">{label}</span>
      <span className={`text-3xl font-bold ${colorMap[accent]}`} style={{ fontFamily: "var(--font-geist-sans)" }}>{value}</span>
    </div>
  );
}
