// Grid dimensions (default sandbox)
export const GRID_W = 50;
export const GRID_H = 50;
export const SIZE = GRID_W * GRID_H;

// Grid size presets for levels
export const GRID_SIZES = {
  level1: [1, 1] as const,
  level2: [10, 10] as const,
  level3: [20, 20] as const,
  sandbox: [50, 50] as const,
} as const;

// Simulation parameters (from paper appendix)
export const BASE_PTR = 0.12;
export const COST = 0.01;
export const BENEFIT = 0.03;
export const MUTATION_RATE = 0.005;
export const DEATH_RATE = 0.1;
export const IMMIGRATION_RATE = 1;

// Speed options (ticks per second)
export const SPEEDS = [1, 2, 5, 10, 30, 60, 120, 300, 600, 1200] as const;

// Scenario modes
export const SCENARIO_STANDARD = 'standard';
export const SCENARIO_CLASH = 'clash';

export type ScenarioMode = typeof SCENARIO_STANDARD | typeof SCENARIO_CLASH;

// Phenotype labels (used for UI display)
export const PHENOTYPE_LABELS = {
  ethnocentric: { ig: 1, og: 0 },
  altruist: { ig: 1, og: 1 },
  egoist: { ig: 0, og: 0 },
  traitor: { ig: 0, og: 1 },
} as const;

export type Phenotype = keyof typeof PHENOTYPE_LABELS;

export type ColorMode = 'tags' | 'strategy';

// Color-blind friendly palette: Blue, Orange, Teal, Magenta (for tags)
export const TAG_COLORS = [
  '#3b82f6', // Blue
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#d946ef', // Magenta
] as const;

// Strategy-to-color mapping (Stages 1–4: color = strategy)
export const STRATEGY_COLORS: Record<Phenotype, string> = {
  altruist: '#3b82f6',
  ethnocentric: '#a855f7',
  egoist: '#ef4444',
  traitor: '#eab308',
};

// Distribution presets for Stage 4
export interface Distribution {
  ethnocentric: number;
  altruist: number;
  egoist: number;
  traitor: number;
}

export const DISTRIBUTION_PRESETS: Record<string, Distribution> = {
  'Equal Mix': { ethnocentric: 0.25, altruist: 0.25, egoist: 0.25, traitor: 0.25 },
  'Heavy Altruist': { ethnocentric: 0.05, altruist: 0.9, egoist: 0.05, traitor: 0 },
  'Heavy Ethnocentric': { ethnocentric: 0.8, altruist: 0.1, egoist: 0.1, traitor: 0 },
  'Heavy Egoist': { ethnocentric: 0.05, altruist: 0.05, egoist: 0.9, traitor: 0 },
  'Heavy Traitor': { ethnocentric: 0.05, altruist: 0.05, egoist: 0, traitor: 0.9 },
  'Low Ethno, High Altruist': { ethnocentric: 0.1, altruist: 0.7, egoist: 0.1, traitor: 0.1 },
};

// God Mode default parameters
export interface SimulationParams {
  cost?: number;
  benefit?: number;
  basePtr?: number;
  deathRate?: number;
  mutationRate?: number;
  immigrationRate?: number;
}

export const DEFAULT_PARAMS: Required<SimulationParams> = {
  cost: 0.01,
  benefit: 0.03,
  basePtr: 0.12,
  deathRate: 0.1,
  mutationRate: 0.005,
  immigrationRate: 1,
};
