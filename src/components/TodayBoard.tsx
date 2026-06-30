"use client";

import { useState, useTransition } from "react";
import {
  completeSubtask,
  completeTask,
  createSubtask,
  uncompleteSubtask,
  uncompleteTask,
  unpullTaskFromToday,
} from "@/app/actions";

type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

type Task = {
  id: string;
  title: string;
  done: boolean;
  quickWin: boolean;
  subtasks: Subtask[];
};

function SubtaskRow({ subtask, taskId }: { subtask: Subtask; taskId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="flex items-center gap-2.5 pl-2 text-sm">
      <input
        type="checkbox"
        checked={subtask.done}
        disabled={isPending}
        onChange={() =>
          startTransition(() =>
            subtask.done ? uncompleteSubtask(subtask.id) : completeSubtask(subtask.id)
          )
        }
        className="accent-teal"
      />
      <span className={subtask.done ? "text-ivory-dim line-through" : ""}>
        {subtask.title}
      </span>
    </li>
  );
}

function AddSubtaskForm({ taskId }: { taskId: string }) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    startTransition(() => createSubtask(taskId, trimmed));
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex gap-2 pl-2">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add a subtask..."
        autoComplete="off"
        className="flex-1 rounded-md border border-border bg-bg-panel px-2.5 py-1.5 text-xs text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-md border border-border px-2.5 py-1 text-xs text-teal hover:border-teal disabled:opacity-50"
      >
        Add
      </button>
    </form>
  );
}

function TodayTaskCard({ task }: { task: Task }) {
  const [isPending, startTransition] = useTransition();

  return (
    <li className="rounded-xl border border-border bg-background px-4 py-3.5">
      <div className="flex items-center justify-between gap-3">
        <label className="flex flex-1 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={task.done}
            disabled={isPending}
            onChange={() =>
              startTransition(() =>
                task.done ? uncompleteTask(task.id) : completeTask(task.id)
              )
            }
            className="h-4 w-4 accent-gold"
          />
          <span className={task.done ? "text-ivory-dim line-through" : "font-medium"}>
            {task.title}
          </span>
          {task.quickWin && (
            <span className="rounded-full border border-gold/50 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gold">
              Quick Win
            </span>
          )}
        </label>
        <div className="flex shrink-0 items-center gap-2">
          {task.done && <span className="text-xs font-semibold text-gold">+5</span>}
          {!task.done && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => unpullTaskFromToday(task.id))}
              className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
            >
              Send Back
            </button>
          )}
        </div>
      </div>

      {task.subtasks.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {task.subtasks.map((subtask) => (
            <SubtaskRow key={subtask.id} subtask={subtask} taskId={task.id} />
          ))}
        </ul>
      )}

      <AddSubtaskForm taskId={task.id} />
    </li>
  );
}

export function TodayBoard({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-sm italic text-ivory-dim">
        Today is clear. Pull a task when you&apos;re ready.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <TodayTaskCard key={task.id} task={task} />
      ))}
    </ul>
  );
}
