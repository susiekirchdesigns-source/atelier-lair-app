"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { SELF_CARE_ACTIONS, type SelfCareActionId } from "@/lib/selfCare";

async function getOrCreateAppState() {
  return prisma.appState.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
  });
}

// --- Capture / Inbox ---

export async function captureThought(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await prisma.inboxItem.create({ data: { text: trimmed } });
  revalidatePath("/");
}

export async function deleteInboxItem(id: string) {
  await prisma.inboxItem.delete({ where: { id } });
  revalidatePath("/");
}

export async function bankIdeaFromInbox(inboxId: string, text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await prisma.$transaction([
    prisma.idea.create({ data: { text: trimmed } }),
    prisma.inboxItem.delete({ where: { id: inboxId } }),
  ]);
  revalidatePath("/");
  revalidatePath("/ideas");
}

// --- Tasks ---

export async function createTask(title: string, quickWin: boolean) {
  const trimmed = title.trim();
  if (!trimmed) return;

  await prisma.task.create({ data: { title: trimmed, quickWin } });
  revalidatePath("/");
}

export async function createTaskFromInbox(inboxId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  await prisma.$transaction([
    prisma.task.create({ data: { title: trimmed } }),
    prisma.inboxItem.delete({ where: { id: inboxId } }),
  ]);
  revalidatePath("/");
}

const TODAY_SLOT_LIMIT = 3;

export async function pullTaskToToday(taskId: string) {
  const activeTodayCount = await prisma.task.count({
    where: { pulledToToday: true, done: false },
  });
  if (activeTodayCount >= TODAY_SLOT_LIMIT) return;

  await prisma.task.update({
    where: { id: taskId },
    data: { pulledToToday: true },
  });
  revalidatePath("/");
}

export async function unpullTaskFromToday(taskId: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { pulledToToday: false },
  });
  revalidatePath("/");
}

export async function completeTask(taskId: string) {
  const task = await prisma.task.findUniqueOrThrow({ where: { id: taskId } });
  if (task.done) return;

  const points = 5;
  const now = new Date();

  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { done: true, doneAt: now },
    }),
    prisma.momentumEvent.create({
      data: {
        type: "task",
        label: task.title,
        points,
        occurredAt: now,
        taskId,
      },
    }),
  ]);
  revalidatePath("/");
}

// Un-checking a mistaken completion removes that completion's points.
// This is the one allowed subtraction — correcting an error, not a penalty.
export async function uncompleteTask(taskId: string) {
  await prisma.$transaction([
    prisma.task.update({
      where: { id: taskId },
      data: { done: false, doneAt: null },
    }),
    prisma.momentumEvent.deleteMany({
      where: { taskId, type: "task" },
    }),
  ]);
  revalidatePath("/");
}

export async function deleteTask(taskId: string) {
  await prisma.task.delete({ where: { id: taskId } });
  revalidatePath("/");
}

// --- Subtasks ---

export async function createSubtask(taskId: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  await prisma.subtask.create({ data: { taskId, title: trimmed } });
  revalidatePath("/");
}

export async function completeSubtask(subtaskId: string) {
  const subtask = await prisma.subtask.findUniqueOrThrow({
    where: { id: subtaskId },
  });
  if (subtask.done) return;

  const now = new Date();

  await prisma.$transaction([
    prisma.subtask.update({
      where: { id: subtaskId },
      data: { done: true, doneAt: now },
    }),
    prisma.momentumEvent.create({
      data: {
        type: "subtask",
        label: subtask.title,
        points: 2,
        occurredAt: now,
        taskId: subtask.taskId,
      },
    }),
  ]);
  revalidatePath("/");
}

export async function uncompleteSubtask(subtaskId: string) {
  const subtask = await prisma.subtask.findUniqueOrThrow({
    where: { id: subtaskId },
  });

  await prisma.$transaction([
    prisma.subtask.update({
      where: { id: subtaskId },
      data: { done: false, doneAt: null },
    }),
    prisma.momentumEvent.deleteMany({
      where: { taskId: subtask.taskId, type: "subtask", label: subtask.title },
    }),
  ]);
  revalidatePath("/");
}

export async function deleteSubtask(subtaskId: string) {
  await prisma.subtask.delete({ where: { id: subtaskId } });
  revalidatePath("/");
}

// --- Self-Care (Work-Recovery) ---

export async function logSelfCare(actionId: SelfCareActionId) {
  const action = SELF_CARE_ACTIONS.find((a) => a.id === actionId);
  if (!action) return;

  const state = await getOrCreateAppState();

  const alreadyLoggedThisCycle = await prisma.momentumEvent.findFirst({
    where: {
      type: "selfcare",
      selfCareId: actionId,
      occurredAt: { gte: state.recoveryCycleStartedAt },
    },
  });
  if (alreadyLoggedThisCycle) return;

  await prisma.momentumEvent.create({
    data: {
      type: "selfcare",
      label: action.label,
      points: action.points,
      selfCareId: actionId,
    },
  });
  revalidatePath("/");
}

export async function resetRecoveryCycle() {
  await prisma.appState.upsert({
    where: { id: 1 },
    update: { recoveryCycleStartedAt: new Date() },
    create: { id: 1 },
  });
  revalidatePath("/");
}

// --- Daily Rituals (standing check-ins) ---

export async function createRitual(label: string, points: number) {
  const trimmed = label.trim();
  if (!trimmed || !Number.isFinite(points) || points <= 0) return;

  await prisma.ritual.create({ data: { label: trimmed, points: Math.round(points) } });
  revalidatePath("/");
}

// Retiring hides a ritual without deleting its history in the ledger.
export async function retireRitual(ritualId: string) {
  await prisma.ritual.update({
    where: { id: ritualId },
    data: { active: false },
  });
  revalidatePath("/");
}

export async function logRitual(ritualId: string) {
  const ritual = await prisma.ritual.findUniqueOrThrow({ where: { id: ritualId } });
  const state = await getOrCreateAppState();

  const alreadyLoggedThisCycle = await prisma.momentumEvent.findFirst({
    where: {
      type: "ritual",
      ritualId,
      occurredAt: { gte: state.recoveryCycleStartedAt },
    },
  });
  if (alreadyLoggedThisCycle) return;

  await prisma.momentumEvent.create({
    data: {
      type: "ritual",
      label: ritual.label,
      points: ritual.points,
      ritualId,
    },
  });
  revalidatePath("/");
}

// --- Rewards ---

export async function createReward(title: string, cost: number) {
  const trimmed = title.trim();
  if (!trimmed || !Number.isFinite(cost) || cost <= 0) return;

  await prisma.reward.create({ data: { title: trimmed, cost: Math.round(cost) } });
  revalidatePath("/rewards");
}

// Retiring hides a reward without deleting its claim history —
// the same "let go without guilt" spirit as the rest of the app.
export async function retireReward(rewardId: string) {
  await prisma.reward.update({
    where: { id: rewardId },
    data: { active: false },
  });
  revalidatePath("/rewards");
}

export async function claimReward(rewardId: string) {
  const reward = await prisma.reward.findUniqueOrThrow({ where: { id: rewardId } });

  const [pointsAgg, claimsAgg] = await Promise.all([
    prisma.momentumEvent.aggregate({ _sum: { points: true } }),
    prisma.rewardClaim.aggregate({ _sum: { costAtClaim: true } }),
  ]);

  const lifetimePoints = pointsAgg._sum.points ?? 0;
  const spent = claimsAgg._sum.costAtClaim ?? 0;
  const availableCredits = lifetimePoints - spent;

  if (availableCredits < reward.cost) return;

  await prisma.rewardClaim.create({
    data: { rewardId, costAtClaim: reward.cost },
  });
  revalidatePath("/rewards");
  revalidatePath("/");
}

// --- Idea Bank ---

const MARINATE_DAYS = 14;

export async function bankIdea(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return;

  await prisma.idea.create({ data: { text: trimmed } });
  revalidatePath("/ideas");
}

export async function promoteIdea(ideaId: string) {
  const idea = await prisma.idea.findUniqueOrThrow({ where: { id: ideaId } });
  if (idea.status !== "active") return;

  const task = await prisma.task.create({ data: { title: idea.text } });
  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: "promoted", promotedTaskId: task.id },
  });
  revalidatePath("/ideas");
  revalidatePath("/");
}

export async function marinateIdea(ideaId: string) {
  const resurfaceAt = new Date();
  resurfaceAt.setDate(resurfaceAt.getDate() + MARINATE_DAYS);

  await prisma.idea.update({
    where: { id: ideaId },
    data: { resurfaceAt },
  });
  revalidatePath("/ideas");
}

// Letting go archives the idea — it's never deleted, just hidden from
// the active views. No guilt, nothing lost.
export async function letGoIdea(ideaId: string) {
  await prisma.idea.update({
    where: { id: ideaId },
    data: { status: "let-go" },
  });
  revalidatePath("/ideas");
}

// --- Monthly Planning ---

async function getOrCreateMonthPlan(monthKey: string) {
  return prisma.monthPlan.upsert({
    where: { monthKey },
    update: {},
    create: { monthKey },
  });
}

export async function setMonthWord(monthKey: string, word: string) {
  await getOrCreateMonthPlan(monthKey);
  await prisma.monthPlan.update({
    where: { monthKey },
    data: { word: word.trim() || null },
  });
  revalidatePath("/plan");
}

export async function createGoal(monthKey: string, title: string) {
  const trimmed = title.trim();
  if (!trimmed) return;

  const plan = await getOrCreateMonthPlan(monthKey);
  await prisma.goal.create({ data: { monthPlanId: plan.id, title: trimmed } });
  revalidatePath("/plan");
}

export async function updateGoalTier(
  goalId: string,
  tier: "good" | "better" | "best",
  value: string
) {
  await prisma.goal.update({
    where: { id: goalId },
    data: { [tier]: value.trim() || null },
  });
  revalidatePath("/plan");
}

export async function deleteGoal(goalId: string) {
  await prisma.goal.delete({ where: { id: goalId } });
  revalidatePath("/plan");
}
