import { prisma } from "@/lib/prisma";
import { getBalances } from "@/lib/balances";
import { getLevelProgress } from "@/lib/levels";
import { Nav } from "@/components/Nav";
import { RewardsPanel } from "@/components/RewardsPanel";

export const dynamic = "force-dynamic";

export default async function RewardsPage() {
  const [rewards, balances] = await Promise.all([
    prisma.reward.findMany({
      where: { active: true },
      orderBy: { cost: "asc" },
    }),
    getBalances(),
  ]);

  const levelProgress = getLevelProgress(balances.lifetimePoints);

  return (
    <div className="min-h-screen px-5 py-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight">Rewards</h1>
          <p className="mb-4 text-sm tracking-wide text-ivory-dim">
            Lvl {levelProgress.level} · {levelProgress.name}
          </p>

          <div className="inline-flex flex-col items-center gap-1 rounded-2xl border border-border bg-bg-panel px-9 py-4">
            <span className="text-xs uppercase tracking-[0.12em] text-ivory-dim">
              Reward Credits
            </span>
            <span className="text-4xl font-bold text-teal">{balances.rewardCredits}</span>
          </div>
        </header>

        <Nav active="rewards" />

        <section className="rounded-2xl border border-border bg-bg-panel p-5">
          <h2 className="mb-3.5 text-sm font-semibold uppercase tracking-wider text-teal">
            Claim Something
          </h2>
          <RewardsPanel rewards={rewards} rewardCredits={balances.rewardCredits} />
        </section>
      </div>
    </div>
  );
}
