"use client";

import { useTransition } from "react";
import { logSelfCare, resetRecoveryCycle } from "@/app/actions";
import { SELF_CARE_ACTIONS, type SelfCareActionId } from "@/lib/selfCare";

export function SelfCareGrid({ usedIds }: { usedIds: string[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div className="mb-3.5 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal">
          Work-Recovery
        </h2>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => resetRecoveryCycle())}
          className="rounded-lg border border-border px-3.5 py-1.5 text-xs text-ivory-dim hover:border-teal hover:text-foreground disabled:opacity-50"
        >
          Reset for New Day
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SELF_CARE_ACTIONS.map((action) => {
          const isUsed = usedIds.includes(action.id);
          return (
            <button
              key={action.id}
              type="button"
              disabled={isUsed || isPending}
              onClick={() =>
                startTransition(() => logSelfCare(action.id as SelfCareActionId))
              }
              className={`flex flex-col gap-1 rounded-xl border px-3.5 py-4 text-left text-sm font-semibold transition ${
                isUsed
                  ? "border-gold shadow-[0_0_14px_rgba(232,184,75,0.18)] opacity-45"
                  : "border-border hover:border-teal hover:-translate-y-0.5"
              }`}
            >
              <span>{action.label}</span>
              <span className="text-sm font-bold text-gold">+{action.points}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
