import { prisma } from "@/lib/prisma";

export async function getBalances() {
  const [pointsAgg, claimsAgg] = await Promise.all([
    prisma.momentumEvent.aggregate({ _sum: { points: true } }),
    prisma.rewardClaim.aggregate({ _sum: { costAtClaim: true } }),
  ]);

  const lifetimePoints = pointsAgg._sum.points ?? 0;
  const spentCredits = claimsAgg._sum.costAtClaim ?? 0;
  const rewardCredits = lifetimePoints - spentCredits;

  return { lifetimePoints, rewardCredits };
}
