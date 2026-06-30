import Link from "next/link";

export function Nav({
  active,
}: {
  active: "day" | "rewards" | "ideas" | "plan" | "stats";
}) {
  const tabs = [
    { href: "/", label: "Day", key: "day" as const },
    { href: "/ideas", label: "Ideas", key: "ideas" as const },
    { href: "/plan", label: "Plan", key: "plan" as const },
    { href: "/rewards", label: "Rewards", key: "rewards" as const },
    { href: "/stats", label: "Stats", key: "stats" as const },
  ];

  return (
    <nav className="mb-8 inline-flex gap-1 rounded-xl border border-border bg-bg-panel p-1">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
            active === tab.key
              ? "bg-teal text-background"
              : "text-ivory-dim hover:text-foreground"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
