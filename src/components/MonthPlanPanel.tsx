"use client";

import { useState, useTransition } from "react";
import { createGoal, deleteGoal, setMonthWord, updateGoalTier } from "@/app/actions";

type Goal = {
  id: string;
  title: string;
  good: string | null;
  better: string | null;
  best: string | null;
  achievedTier: string | null;
};

function MonthWordInput({ monthKey, word }: { monthKey: string; word: string | null }) {
  const [value, setValue] = useState(word ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => startTransition(() => setMonthWord(monthKey, value))}
      disabled={isPending}
      placeholder="This month's word..."
      autoComplete="off"
      className="w-full rounded-xl border border-border bg-background px-4 py-3.5 text-center text-xl font-semibold text-gold placeholder:text-ivory-dim placeholder:font-normal focus:outline-none focus:border-teal"
    />
  );
}

function TierInput({
  goalId,
  tier,
  label,
  initialValue,
}: {
  goalId: string;
  tier: "good" | "better" | "best";
  label: string;
  initialValue: string | null;
}) {
  const [value, setValue] = useState(initialValue ?? "");
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex-1 min-w-[140px] rounded-lg border border-border bg-background px-3 py-2.5">
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-ivory-dim">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => startTransition(() => updateGoalTier(goalId, tier, value))}
        disabled={isPending}
        placeholder="..."
        autoComplete="off"
        className="w-full bg-transparent text-sm text-foreground placeholder:text-ivory-dim focus:outline-none"
      />
    </div>
  );
}

function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <li className="rounded-xl border border-border bg-bg-panel px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="font-semibold">{goal.title}</h3>
        {confirmingDelete ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => deleteGoal(goal.id))}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
          >
            Confirm Remove?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim"
          >
            Remove
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <TierInput goalId={goal.id} tier="good" label="Good" initialValue={goal.good} />
        <TierInput goalId={goal.id} tier="better" label="Better" initialValue={goal.better} />
        <TierInput goalId={goal.id} tier="best" label="Best" initialValue={goal.best} />
      </div>
    </li>
  );
}

function AddGoalForm({ monthKey }: { monthKey: string }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    startTransition(() => createGoal(monthKey, trimmed));
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What would make this month count?"
        autoComplete="off"
        className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-teal px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        Add Goal
      </button>
    </form>
  );
}

export function MonthPlanPanel({
  monthKey,
  word,
  goals,
}: {
  monthKey: string;
  word: string | null;
  goals: Goal[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <MonthWordInput monthKey={monthKey} word={word} />

      <div>
        <AddGoalForm monthKey={monthKey} />

        {goals.length === 0 ? (
          <p className="mt-4 text-sm italic text-ivory-dim">
            No goals yet this month. Add what would make it count.
          </p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
