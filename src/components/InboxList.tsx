"use client";

import { useTransition } from "react";
import { bankIdeaFromInbox, createTaskFromInbox, deleteInboxItem } from "@/app/actions";

type InboxItem = {
  id: string;
  text: string;
};

export function InboxList({ items }: { items: InboxItem[] }) {
  const [isPending, startTransition] = useTransition();

  if (items.length === 0) {
    return <p className="mt-4 text-sm italic text-ivory-dim">Inbox is clear.</p>;
  }

  return (
    <ul className="mt-4 flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-3 text-sm"
        >
          <span>{item.text}</span>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => createTaskFromInbox(item.id, item.text))
              }
              className="rounded-md border border-border px-2.5 py-1 text-xs text-teal hover:border-teal disabled:opacity-50"
            >
              Make Task
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(() => bankIdeaFromInbox(item.id, item.text))
              }
              className="rounded-md border border-border px-2.5 py-1 text-xs text-gold hover:border-gold disabled:opacity-50"
            >
              Bank Idea
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => deleteInboxItem(item.id))}
              className="rounded-md border border-border px-2.5 py-1 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
