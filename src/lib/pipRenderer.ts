import { getPhenotype } from './engine';
import type { Agent } from './engine';
import { TAG_COLORS, STRATEGY_COLORS } from './constants';
import type { ColorMode, Phenotype } from './constants';

export type PipViewMode = 'tags' | 'strategies' | 'xray';

/**
 * Draw a single Pip (soft blob creature). Identity is by color only.
 */
export function drawPip(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  _viewMode: PipViewMode,
  _timeMs?: number,
  colorMode: ColorMode = 'tags'
): void {
  const cx = x + cellW / 2;
  const cy = y + cellH / 2;
  const r = Math.min(cellW, cellH) * 0.4;
  const color = colorMode === 'strategy' ? STRATEGY_COLORS[getPhenotype(agent)] : TAG_COLORS[agent.tag];

  // Soft blob body (ellipse)
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(cx, cy, r * 0.9, r * 1.05, 0, 0, Math.PI * 2);
  ctx.fill();

  // Slight highlight for depth
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.2, cy - r * 0.3, r * 0.35, r * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fill();

  // Identity by color only (no halo, mustache, headband, etc.)
}

/**
 * Phenotype fill colors for chart/UI consistency.
 */
export const PHENOTYPE_COLORS: Record<Phenotype, string> = {
  ethnocentric: '#3b82f6',
  altruist: '#22c55e',
  egoist: '#f59e0b',
  traitor: '#d946ef',
};
