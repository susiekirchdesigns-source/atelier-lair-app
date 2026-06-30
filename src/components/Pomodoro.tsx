"use client";

import { useEffect, useRef, useState } from "react";

const FOCUS_MINUTES = 25;
const BREAK_MINUTES = 5;

export function Pomodoro() {
  const [mode, setMode] = useState<"focus" | "break">("focus");
  const [secondsLeft, setSecondsLeft] = useState(FOCUS_MINUTES * 60);
  const [running, setRunning] = useState(false);
  const [sessionsToday, setSessionsToday] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = (mode === "focus" ? FOCUS_MINUTES : BREAK_MINUTES) * 60;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    if (!running) return;

    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (mode === "focus") {
            setSessionsToday((n) => n + 1);
            setMode("break");
            setSecondsLeft(BREAK_MINUTES * 60);
          } else {
            setMode("focus");
            setSecondsLeft(FOCUS_MINUTES * 60);
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current!);
  }, [running, mode]);

  function handleStart() {
    setRunning(true);
  }

  function handleSkip() {
    clearInterval(intervalRef.current!);
    setRunning(false);
    if (mode === "focus") {
      setSessionsToday((n) => n + 1);
      setMode("break");
      setSecondsLeft(BREAK_MINUTES * 60);
    } else {
      setMode("focus");
      setSecondsLeft(FOCUS_MINUTES * 60);
    }
  }

  function handleReset() {
    clearInterval(intervalRef.current!);
    setRunning(false);
    setMode("focus");
    setSecondsLeft(FOCUS_MINUTES * 60);
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-ivory-dim">
          <span className={`inline-block h-2 w-2 rounded-full ${running ? "bg-teal" : "bg-border"}`} />
          {mode === "focus" ? "Focus" : "Break"}
        </span>
      </div>

      <div className="my-3 text-center">
        <span className="font-numeric text-6xl font-bold tracking-tight text-foreground">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>

      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-teal transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex justify-center gap-2.5">
        <button
          type="button"
          onClick={running ? () => setRunning(false) : handleStart}
          className="rounded-lg bg-gold px-5 py-2 text-sm font-semibold text-background hover:brightness-110"
        >
          {running ? "Pause" : "Start"}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-lg border border-border px-4 py-2 text-sm text-ivory-dim hover:border-ivory-dim"
        >
          Skip
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-border px-4 py-2 text-sm text-ivory-dim hover:border-ivory-dim"
        >
          Reset
        </button>
      </div>

      <p className="mt-3 text-center text-[11px] text-ivory-dim">
        {sessionsToday} focus session{sessionsToday !== 1 ? "s" : ""} today
      </p>
    </div>
  );
}
