"use client";

import { useState, useTransition } from "react";
import { createTask, deleteTask, pullTaskToToday } from "@/app/actions";

type Task = {
  id: string;
  title: string;
  quickWin: boolean;
};

const TODAY_SLOT_LIMIT = 3;

export function TaskList({
  tasks,
  todayActiveCount,
}: {
  tasks: Task[];
  todayActiveCount: number;
}) {
  const [title, setTitle] = useState("");
  const [quickWin, setQuickWin] = useState(false);
  const [isPending, startTransition] = useTransition();
  const todayIsFull = todayActiveCount >= TODAY_SLOT_LIMIT;

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;

    setTitle("");
    const wasQuickWin = quickWin;
    setQuickWin(false);
    startTransition(() => createTask(trimmed, wasQuickWin));
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex flex-wrap gap-2.5">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task..."
          autoComplete="off"
          className="flex-1 min-w-[160px] rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
        />
        <label className="flex items-center gap-1.5 text-xs text-ivory-dim">
          <input
            type="checkbox"
            checked={quickWin}
            onChange={(e) => setQuickWin(e.target.checked)}
            className="accent-gold"
          />
          Quick Win
        </label>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-teal px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
        >
          Add
        </button>
      </form>

      {tasks.length === 0 ? (
        <p className="mt-4 text-sm italic text-ivory-dim">
          No tasks waiting. Pull from your Inbox, or add one above.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-3 text-sm"
            >
              <span className="flex items-center gap-2">
                {task.title}
                {task.quickWin && (
                  <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
                    Quick Win
                  </span>
                )}
              </span>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={isPending || todayIsFull}
                  onClick={() => startTransition(() => pullTaskToToday(task.id))}
                  title={todayIsFull ? "Today's 3 slots are full" : undefined}
                  className="rounded-md border border-gold/60 px-2.5 py-1 text-xs text-gold hover:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Pull to Today
                </button>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => startTransition(() => deleteTask(task.id))}
                  className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
