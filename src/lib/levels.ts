// Bookish, gothic-leaning level names — purely cosmetic, easy to rename.
const LEVEL_NAMES = [
  "Inkling",
  "Marginalia",
  "First Draft",
  "Dog-Eared",
  "Annotated",
  "Candlelit Study",
  "Spine Cracked",
  "Plot Thickens",
  "Ink-Stained",
  "Velvet Bookmark",
  "Marbled Endpapers",
  "Folio",
  "Bound and Determined",
  "Gothic Bloom",
  "Leather Bound",
  "Illuminated Manuscript",
  "Rare Find",
  "Collector's Shelf",
  "Special Collections",
  "The Stacks",
  "Reading Room",
  "Gilded Edition",
  "First Edition",
  "Archivist",
  "Bibliophile's Reach",
  "Library Wing",
  "Tome Keeper",
  "Folio Society",
  "Keeper of the Lair",
  "The Atelier, Fully Lit",
] as const;

// Cumulative lifetime points required to REACH each level.
// Level 1 starts at 0; each subsequent level requires a growing chunk more.
function buildThresholds(): number[] {
  const thresholds = [0];
  let requirement = 50;
  for (let i = 1; i < LEVEL_NAMES.length; i++) {
    thresholds.push(thresholds[i - 1] + requirement);
    requirement += 15;
  }
  return thresholds;
}

const THRESHOLDS = buildThresholds();
export const MAX_LEVEL = LEVEL_NAMES.length;

export type LevelProgress = {
  level: number;
  name: string;
  isMaxLevel: boolean;
  currentLevelFloor: number;
  pointsIntoLevel: number;
  pointsToNextLevel: number | null;
  levelRange: number | null;
  percentToNextLevel: number;
  nextLevelName: string | null;
};

export function getLevelProgress(lifetimePoints: number): LevelProgress {
  let levelIndex = 0;
  for (let i = 0; i < THRESHOLDS.length; i++) {
    if (lifetimePoints >= THRESHOLDS[i]) levelIndex = i;
    else break;
  }

  const isMaxLevel = levelIndex === LEVEL_NAMES.length - 1;
  const currentLevelFloor = THRESHOLDS[levelIndex];
  const nextThreshold = isMaxLevel ? null : THRESHOLDS[levelIndex + 1];
  const levelRange = nextThreshold === null ? null : nextThreshold - currentLevelFloor;
  const pointsIntoLevel = lifetimePoints - currentLevelFloor;
  const pointsToNextLevel = nextThreshold === null ? null : nextThreshold - lifetimePoints;
  const percentToNextLevel =
    levelRange === null ? 100 : Math.min(100, Math.round((pointsIntoLevel / levelRange) * 100));

  return {
    level: levelIndex + 1,
    name: LEVEL_NAMES[levelIndex],
    isMaxLevel,
    currentLevelFloor,
    pointsIntoLevel,
    pointsToNextLevel,
    levelRange,
    percentToNextLevel,
    nextLevelName: isMaxLevel ? null : LEVEL_NAMES[levelIndex + 1],
  };
}
