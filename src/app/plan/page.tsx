import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { MonthPlanPanel } from "@/components/MonthPlanPanel";

export const dynamic = "force-dynamic";

function monthKeyToDate(monthKey: string): Date {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function dateToMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function shiftMonthKey(monthKey: string, delta: number): string {
  const date = monthKeyToDate(monthKey);
  date.setMonth(date.getMonth() + delta);
  return dateToMonthKey(date);
}

function formatMonthLabel(monthKey: string): string {
  return monthKeyToDate(monthKey).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const params = await searchParams;
  const monthKey = params.m ?? dateToMonthKey(new Date());

  const plan = await prisma.monthPlan.findUnique({
    where: { monthKey },
    include: { goals: { orderBy: { createdAt: "asc" } } },
  });

  const prevKey = shiftMonthKey(monthKey, -1);
  const nextKey = shiftMonthKey(monthKey, 1);

  return (
    <div className="min-h-screen px-5 py-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight">Monthly Planning</h1>
          <div className="flex items-center justify-center gap-4">
            <Link
              href={`/plan?m=${prevKey}`}
              className="text-ivory-dim hover:text-foreground"
              aria-label="Previous month"
            >
              ←
            </Link>
            <p className="text-sm tracking-wide text-ivory-dim">
              {formatMonthLabel(monthKey)}
            </p>
            <Link
              href={`/plan?m=${nextKey}`}
              className="text-ivory-dim hover:text-foreground"
              aria-label="Next month"
            >
              →
            </Link>
          </div>
        </header>

        <Nav active="plan" />

        <section className="rounded-2xl border border-border bg-bg-panel p-5">
          <MonthPlanPanel
            key={monthKey}
            monthKey={monthKey}
            word={plan?.word ?? null}
            goals={plan?.goals ?? []}
          />
        </section>
      </div>
    </div>
  );
}
