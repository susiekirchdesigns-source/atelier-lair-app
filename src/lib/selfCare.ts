export const SELF_CARE_ACTIONS = [
  { id: "real-break", label: "Real Break", points: 3 },
  { id: "stopped-early", label: "Stopped Early", points: 5 },
  { id: "day-off", label: "Took a Day Off", points: 5 },
  { id: "said-no", label: "Said No", points: 4 },
  { id: "moved-body", label: "Moved My Body", points: 4 },
  { id: "good-enough", label: "Good Enough", points: 5 },
] as const;

export type SelfCareActionId = (typeof SELF_CARE_ACTIONS)[number]["id"];
