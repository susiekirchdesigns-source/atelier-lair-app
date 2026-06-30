"use client";

import { useTransition } from "react";
import { achieveGoalTier } from "@/app/actions";

type Goal = {
  id: string;
  title: string;
  good: string | null;
  better: string | null;
  best: string | null;
  achievedTier: string | null;
};

const TIERS: { key: "good" | "better" | "best"; label: string; points: number }[] = [
  { key: "good", label: "Good", points: 10 },
  { key: "better", label: "Better", points: 15 },
  { key: "best", label: "Best", points: 25 },
];

const TIER_STYLES = {
  good: {
    active: "border-foreground bg-foreground/10 text-foreground",
    inactive: "border-border text-ivory-dim hover:border-foreground/50",
    label: "text-foreground",
  },
  better: {
    active: "border-teal bg-teal/10 text-teal",
    inactive: "border-border text-ivory-dim hover:border-teal/50",
    label: "text-teal",
  },
  best: {
    active: "border-gold bg-gold/10 text-gold",
    inactive: "border-border text-ivory-dim hover:border-gold/50",
    label: "text-gold",
  },
};

function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();

  function handleTier(tier: "good" | "better" | "best") {
    const next = goal.achievedTier === tier ? null : tier;
    startTransition(() => achieveGoalTier(goal.id, next, goal.title));
  }

  return (
    <div className={`rounded-xl border px-4 py-3 transition-colors ${goal.achievedTier ? "border-gold/30 bg-background" : "border-border bg-background"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className={`text-sm font-semibold ${goal.achievedTier ? "text-ivory-dim line-through" : ""}`}>
          {goal.title}
        </p>
        {goal.achievedTier && (
          <span className="text-xs font-bold text-gold">
            +{TIERS.find(t => t.key === goal.achievedTier)?.points}pts ✓
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {TIERS.map(({ key, label }) => {
          const tierText = goal[key];
          if (!tierText) return null;
          const isActive = goal.achievedTier === key;
          const styles = TIER_STYLES[key];
          return (
            <button
              key={key}
              type="button"
              disabled={isPending}
              onClick={() => handleTier(key)}
              className={`rounded-md border px-2.5 py-1 text-xs transition-colors disabled:opacity-50 ${isActive ? styles.active : styles.inactive}`}
            >
              <span className={`mr-1 font-bold ${isActive ? "" : styles.label}`}>{label}:</span>
              {tierText}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function GoalsPanel({
  word,
  goals,
}: {
  word: string | null;
  goals: Goal[];
}) {
  if (goals.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {goals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}
