import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CaptureBox } from "@/components/CaptureBox";
import { InboxList } from "@/components/InboxList";
import { TaskList } from "@/components/TaskList";
import { TodayBoard } from "@/components/TodayBoard";
import { SelfCareGrid } from "@/components/SelfCareGrid";
import { DailyRituals } from "@/components/DailyRituals";
import { Nav } from "@/components/Nav";
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

  const [
    inboxItems,
    waitingTasks,
    todayTasks,
    balances,
    selfCareEvents,
    monthPlan,
    rituals,
    ritualEvents,
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
    prisma.monthPlan.findUnique({ where: { monthKey } }),
    prisma.ritual.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.momentumEvent.findMany({
      where: {
        type: "ritual",
        occurredAt: { gte: appState.recoveryCycleStartedAt },
      },
      select: { ritualId: true },
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

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen px-5 py-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight">
            The Atelier Lair
          </h1>
          <p className="mb-4 text-sm tracking-wide text-ivory-dim">{todayLabel}</p>

          {monthPlan?.word && (
            <Link
              href="/plan"
              className="mb-4 inline-block rounded-full border border-gold/40 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-gold hover:border-gold"
            >
              Month Word · {monthPlan.word}
            </Link>
          )}

          <div className="flex flex-wrap items-stretch justify-center gap-3">
            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-bg-panel px-7 py-4 shadow-[0_0_24px_rgba(232,184,75,0.08)]">
              <span className="text-xs uppercase tracking-[0.12em] text-ivory-dim">
                Lifetime Points
              </span>
              <span className="text-4xl font-bold text-gold drop-shadow-[0_0_18px_rgba(232,184,75,0.35)]">
                {lifetimePoints}
              </span>
            </div>

            <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-bg-panel px-7 py-4">
              <span className="text-xs uppercase tracking-[0.12em] text-ivory-dim">
                Reward Credits
              </span>
              <span className="text-4xl font-bold text-teal">{rewardCredits}</span>
            </div>

            <div className="flex min-w-[220px] flex-col justify-center gap-1.5 rounded-2xl border border-border bg-bg-panel px-7 py-4 text-left">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-xs uppercase tracking-[0.12em] text-ivory-dim">
                  Lvl {levelProgress.level}
                </span>
                <span className="text-xs text-gold">{levelProgress.percentToNextLevel}%</span>
              </div>
              <span className="text-base font-semibold">{levelProgress.name}</span>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-background">
                <div
                  className="h-full rounded-full bg-gold"
                  style={{ width: `${levelProgress.percentToNextLevel}%` }}
                />
              </div>
              <span className="text-[11px] text-ivory-dim">
                {levelProgress.isMaxLevel
                  ? "Max level reached"
                  : `${levelProgress.pointsToNextLevel} pts → ${levelProgress.nextLevelName}`}
              </span>
            </div>
          </div>
        </header>

        <Nav active="day" />

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <DailyRituals rituals={rituals} usedIds={usedRitualIds} />
        </section>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Capture
          </h2>
          <CaptureBox />
          <InboxList items={inboxItems} />
        </section>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <div className="mb-3.5 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-teal">
              Today
            </h2>
            <span className="text-xs text-ivory-dim">{todayActiveCount}/3 slots</span>
          </div>
          <TodayBoard tasks={todayTasks} />
        </section>

        <section className="mb-6 rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Tasks
          </h2>
          <TaskList tasks={waitingTasks} todayActiveCount={todayActiveCount} />
        </section>

        <section className="rounded-2xl border border-border bg-bg-panel p-5">
          <SelfCareGrid usedIds={usedSelfCareIds} />
        </section>
      </div>
    </div>
  );
}
