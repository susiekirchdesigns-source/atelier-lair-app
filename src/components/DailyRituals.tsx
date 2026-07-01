"use client";

import { useState, useTransition } from "react";
import { createRitual, logRitual, retireRitual, resetRecoveryCycle } from "@/app/actions";

type Ritual = {
  id: string;
  label: string;
  points: number;
};

function AddRitualForm() {
  const [label, setLabel] = useState("");
  const [points, setPoints] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = label.trim();
    const parsedPoints = parseInt(points, 10);
    if (!trimmed || !Number.isFinite(parsedPoints) || parsedPoints <= 0) return;

    setLabel("");
    setPoints("");
    startTransition(() => createRitual(trimmed, parsedPoints));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="A standing check-in..."
        autoComplete="off"
        className="flex-1 min-w-[160px] rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <input
        type="number"
        min={1}
        value={points}
        onChange={(e) => setPoints(e.target.value)}
        placeholder="Pts"
        className="w-20 rounded-xl border border-border bg-background px-3 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-teal px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        Add
      </button>
    </form>
  );
}

function RitualButton({ ritual, isUsed }: { ritual: Ritual; isUsed: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingRetire, setConfirmingRetire] = useState(false);

  if (confirmingRetire) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border px-3.5 py-4">
        <span className="flex-1 text-sm">Retire &ldquo;{ritual.label}&rdquo;?</span>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => retireRitual(ritual.id))}
          className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
        >
          Confirm
        </button>
        <button
          type="button"
          onClick={() => setConfirmingRetire(false)}
          className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group relative flex flex-col gap-1 rounded-xl border px-3.5 py-4 text-left transition ${
        isUsed
          ? "border-gold shadow-[0_0_14px_rgba(232,184,75,0.18)] opacity-45"
          : "border-border hover:border-teal"
      }`}
    >
      <button
        type="button"
        disabled={isUsed || isPending}
        onClick={() => startTransition(() => logRitual(ritual.id))}
        className="flex w-full flex-col gap-1 text-left text-sm font-semibold disabled:cursor-not-allowed"
      >
        <span>{ritual.label}</span>
        <span className="text-sm font-bold text-gold">+{ritual.points}</span>
      </button>
      <button
        type="button"
        onClick={() => setConfirmingRetire(true)}
        className="absolute right-2 top-2 text-[10px] text-ivory-dim opacity-0 group-hover:opacity-100 hover:text-foreground"
        aria-label={`Retire ${ritual.label}`}
      >
        ✕
      </button>
    </div>
  );
}

function ResetButton() {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(() => resetRecoveryCycle())}
      className="rounded-lg border border-border px-3.5 py-1.5 text-xs text-ivory-dim hover:border-teal hover:text-foreground disabled:opacity-50"
    >
      Reset for New Day
    </button>
  );
}

export function DailyRituals({
  rituals,
  usedIds,
}: {
  rituals: Ritual[];
  usedIds: string[];
}) {
  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal">
          Daily Rituals
        </h2>
        <ResetButton />
      </div>

      <AddRitualForm />

      {rituals.length === 0 ? (
        <p className="mt-4 text-sm italic text-ivory-dim">
          No standing check-ins yet. Add the things you keep forgetting.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {rituals.map((ritual) => (
            <RitualButton key={ritual.id} ritual={ritual} isUsed={usedIds.includes(ritual.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
