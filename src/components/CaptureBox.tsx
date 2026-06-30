"use client";

import { useRef, useState, useTransition } from "react";
import { captureThought } from "@/app/actions";

export function CaptureBox() {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;

    setValue("");
    startTransition(async () => {
      await captureThought(text);
      inputRef.current?.focus();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2.5">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Get it out of your head..."
        autoComplete="off"
        className="flex-1 rounded-xl border border-border bg-background px-4 py-3.5 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-teal px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        Capture
      </button>
    </form>
  );
}
