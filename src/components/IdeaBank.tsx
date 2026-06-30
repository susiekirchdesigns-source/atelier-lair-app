"use client";

import { useState, useTransition } from "react";
import { bankIdea, letGoIdea, marinateIdea, promoteIdea } from "@/app/actions";

type Idea = {
  id: string;
  text: string;
  resurfaceAt: string;
};

function BankIdeaForm() {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    startTransition(() => bankIdea(trimmed));
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="An idea worth keeping..."
        autoComplete="off"
        className="flex-1 rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-gold px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        Bank It
      </button>
    </form>
  );
}

function IdeaCard({ idea, isResurfacing }: { idea: Idea; isResurfacing: boolean }) {
  const [isPending, startTransition] = useTransition();

  const daysUntil = Math.max(
    0,
    Math.ceil((new Date(idea.resurfaceAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  return (
    <li
      className={`rounded-xl border px-4 py-3.5 ${
        isResurfacing ? "border-gold/50 bg-background" : "border-border bg-background opacity-70"
      }`}
    >
      <p className="mb-3 text-sm">{idea.text}</p>
      {!isResurfacing && (
        <p className="mb-3 text-[11px] text-ivory-dim">Resurfaces in {daysUntil} days</p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => promoteIdea(idea.id))}
          className="rounded-md border border-teal/60 px-3 py-1.5 text-xs text-teal hover:border-teal disabled:opacity-50"
        >
          Promote to Task
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => marinateIdea(idea.id))}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
        >
          Let It Marinate
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => letGoIdea(idea.id))}
          className="rounded-md border border-border px-3 py-1.5 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
        >
          Let It Go
        </button>
      </div>
    </li>
  );
}

export function IdeaBank({
  resurfacing,
  marinating,
}: {
  resurfacing: Idea[];
  marinating: Idea[];
}) {
  return (
    <div>
      <BankIdeaForm />

      <div className="mt-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gold">
          Resurfacing Now
        </h3>
        {resurfacing.length === 0 ? (
          <p className="text-sm italic text-ivory-dim">
            Nothing resurfacing today. Quiet in the bank.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {resurfacing.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} isResurfacing />
            ))}
          </ul>
        )}
      </div>

      {marinating.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-teal">
            Marinating
          </h3>
          <ul className="flex flex-col gap-2">
            {marinating.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} isResurfacing={false} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
