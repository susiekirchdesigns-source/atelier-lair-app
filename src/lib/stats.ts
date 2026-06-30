export type LedgerEvent = {
  occurredAt: Date;
  points: number;
  type: string; // "task" | "subtask" | "selfcare"
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

function startOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day; // week starts Monday
  d.setDate(d.getDate() + diff);
  return d;
}

export type StatsSummary = {
  lifetimePoints: number;
  totalWins: number;
  taskWins: number;
  subtaskWins: number;
  selfCareWins: number;
  activeDaysCount: number;
  pointsPerActiveDay: number;
  thisWeekPoints: number;
  lastWeekPoints: number;
  last7Days: { label: string; points: number }[];
  bestDays: { label: string; points: number }[];
  workPoints: number;
  recoveryPoints: number;
  recoveryShare: number; // 0-100
};

export function computeStats(events: LedgerEvent[]): StatsSummary {
  const lifetimePoints = events.reduce((sum, e) => sum + e.points, 0);
  const totalWins = events.length;
  const taskWins = events.filter((e) => e.type === "task").length;
  const subtaskWins = events.filter((e) => e.type === "subtask").length;
  const selfCareWins = events.filter((e) => e.type === "selfcare").length;

  const pointsByDay = new Map<string, number>();
  for (const e of events) {
    const key = dayKey(e.occurredAt);
    pointsByDay.set(key, (pointsByDay.get(key) ?? 0) + e.points);
  }
  const activeDaysCount = pointsByDay.size;
  const pointsPerActiveDay = activeDaysCount === 0 ? 0 : lifetimePoints / activeDaysCount;

  const now = new Date();
  const thisWeekStart = startOfWeek(now);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);

  let thisWeekPoints = 0;
  let lastWeekPoints = 0;
  for (const e of events) {
    if (e.occurredAt >= thisWeekStart) thisWeekPoints += e.points;
    else if (e.occurredAt >= lastWeekStart) lastWeekPoints += e.points;
  }

  const last7Days: { label: string; points: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = dayKey(d);
    last7Days.push({
      label: d.toLocaleDateString(undefined, { weekday: "short" }),
      points: pointsByDay.get(key) ?? 0,
    });
  }

  const bestDays = [...pointsByDay.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, points]) => {
      const [y, m, d] = key.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      return {
        label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        points,
      };
    });

  const workPoints = events
    .filter((e) => e.type === "task" || e.type === "subtask")
    .reduce((sum, e) => sum + e.points, 0);
  const recoveryPoints = events
    .filter((e) => e.type === "selfcare")
    .reduce((sum, e) => sum + e.points, 0);
  const recoveryShare =
    lifetimePoints === 0 ? 0 : Math.round((recoveryPoints / lifetimePoints) * 100);

  return {
    lifetimePoints,
    totalWins,
    taskWins,
    subtaskWins,
    selfCareWins,
    activeDaysCount,
    pointsPerActiveDay,
    thisWeekPoints,
    lastWeekPoints,
    last7Days,
    bestDays,
    workPoints,
    recoveryPoints,
    recoveryShare,
  };
}
