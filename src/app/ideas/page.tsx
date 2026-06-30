import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { IdeaBank } from "@/components/IdeaBank";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const now = new Date();

  const [resurfacing, marinating] = await Promise.all([
    prisma.idea.findMany({
      where: { status: "active", resurfaceAt: { lte: now } },
      orderBy: { bankedAt: "asc" },
    }),
    prisma.idea.findMany({
      where: { status: "active", resurfaceAt: { gt: now } },
      orderBy: { resurfaceAt: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen px-5 py-8 pb-16">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 text-center">
          <h1 className="mb-1.5 text-3xl font-semibold tracking-tight">Idea Bank</h1>
          <p className="text-sm tracking-wide text-ivory-dim">
            A separate home for the ones not ready to be tasks yet.
          </p>
        </header>

        <Nav active="ideas" />

        <section className="rounded-2xl border border-border bg-bg-panel p-5">
          <IdeaBank
            resurfacing={resurfacing.map((i) => ({
              ...i,
              resurfaceAt: i.resurfaceAt.toISOString(),
            }))}
            marinating={marinating.map((i) => ({
              ...i,
              resurfaceAt: i.resurfaceAt.toISOString(),
            }))}
          />
        </section>
      </div>
    </div>
  );
}
