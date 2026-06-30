"use client";

import { useState, useTransition } from "react";
import { claimReward, createReward, retireReward } from "@/app/actions";

type Reward = {
  id: string;
  title: string;
  cost: number;
};

function AddRewardForm() {
  const [title, setTitle] = useState("");
  const [cost, setCost] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    const parsedCost = parseInt(cost, 10);
    if (!trimmed || !Number.isFinite(parsedCost) || parsedCost <= 0) return;

    setTitle("");
    setCost("");
    startTransition(() => createReward(trimmed, parsedCost));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2.5">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="A reward worth working for..."
        autoComplete="off"
        className="flex-1 min-w-[180px] rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <input
        type="number"
        min={1}
        value={cost}
        onChange={(e) => setCost(e.target.value)}
        placeholder="Cost"
        className="w-24 rounded-xl border border-border bg-background px-3 py-3 text-foreground placeholder:text-ivory-dim focus:outline-none focus:border-teal"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-teal px-5 font-semibold text-background hover:brightness-110 disabled:opacity-60"
      >
        Add Reward
      </button>
    </form>
  );
}

function RewardCard({ reward, rewardCredits }: { reward: Reward; rewardCredits: number }) {
  const [isPending, startTransition] = useTransition();
  const [confirmingRetire, setConfirmingRetire] = useState(false);
  const canAfford = rewardCredits >= reward.cost;

  return (
    <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3.5">
      <div>
        <p className="font-semibold">{reward.title}</p>
        <p className="text-xs font-bold text-gold">{reward.cost} credits</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          disabled={!canAfford || isPending}
          onClick={() => startTransition(() => claimReward(reward.id))}
          className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-background hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Claim
        </button>
        {confirmingRetire ? (
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => retireReward(reward.id))}
            className="rounded-lg border border-border px-3 py-2 text-xs text-ivory-dim hover:border-ivory-dim disabled:opacity-50"
          >
            Confirm?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingRetire(true)}
            className="rounded-lg border border-border px-3 py-2 text-xs text-ivory-dim hover:border-ivory-dim"
          >
            Retire
          </button>
        )}
      </div>
    </li>
  );
}

export function RewardsPanel({
  rewards,
  rewardCredits,
}: {
  rewards: Reward[];
  rewardCredits: number;
}) {
  return (
    <div>
      <AddRewardForm />

      {rewards.length === 0 ? (
        <p className="mt-4 text-sm italic text-ivory-dim">
          No rewards set up yet. Add something worth working toward.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {rewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} rewardCredits={rewardCredits} />
          ))}
        </ul>
      )}
    </div>
  );
}
