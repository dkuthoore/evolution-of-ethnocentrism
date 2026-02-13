import { getPhenotype } from './engine';
import type { Agent } from './engine';
import { TAG_COLORS, STRATEGY_COLORS } from './constants';
import type { ColorMode } from './constants';
import type { Phenotype } from './constants';
import { drawPip } from './pipRenderer';
import type { PipViewMode } from './pipRenderer';

export type ViewMode = 'tags' | 'strategies' | 'xray';

export type DrawGridOpts = {
  usePips?: boolean;
  timeMs?: number;
  colorMode?: ColorMode;
  /** When set, draw a ring around agents with this phenotype (e.g. to highlight ethnocentrists when color = tag). */
  highlightPhenotype?: Phenotype;
};

/**
 * Draw the simulation grid on a canvas 2D context.
 * Supports classic rectangles or Pip characters.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: (Agent | null)[],
  viewMode: ViewMode,
  canvasWidth: number,
  canvasHeight: number,
  gridW: number,
  gridH: number,
  opts?: DrawGridOpts
): void {
  const cellW = canvasWidth / gridW;
  const cellH = canvasHeight / gridH;
  const usePips = opts?.usePips ?? false;
  const timeMs = opts?.timeMs ?? 0;
  const colorMode = opts?.colorMode ?? 'tags';
  const highlightPhenotype = opts?.highlightPhenotype;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  for (let i = 0; i < grid.length; i++) {
    const agent = grid[i];
    if (!agent) continue;

    const x = (i % gridW) * cellW;
    const y = Math.floor(i / gridW) * cellH;

    if (usePips) {
      drawPip(ctx, agent, x, y, cellW, cellH, viewMode, timeMs, colorMode);
    } else {
      drawClassicCell(ctx, agent, x, y, cellW, cellH, viewMode, colorMode);
    }

    if (highlightPhenotype && getPhenotype(agent) === highlightPhenotype) {
      drawHighlightDot(ctx, x, y, cellW, cellH);
    }
  }
}

/** Draw a black dot in the cell center to highlight a phenotype (e.g. ethnocentrists when color = tag). */
function drawHighlightDot(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellW: number,
  cellH: number
): void {
  const cx = x + cellW / 2;
  const cy = y + cellH / 2;
  const r = Math.max(1.5, Math.min(cellW, cellH) * 0.18);
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(cx, cy, r, r, 0, 0, Math.PI * 2);
  ctx.fill();
}

function getAgentColor(agent: Agent, colorMode: ColorMode): string {
  if (colorMode === 'strategy') return STRATEGY_COLORS[getPhenotype(agent)];
  return TAG_COLORS[agent.tag];
}

function drawClassicCell(
  ctx: CanvasRenderingContext2D,
  agent: Agent,
  x: number,
  y: number,
  cellW: number,
  cellH: number,
  _viewMode: ViewMode,
  colorMode: ColorMode
): void {
  const color = getAgentColor(agent, colorMode);

  // Identity by color only (no symbols)
  ctx.fillStyle = color;
  ctx.fillRect(x, y, cellW, cellH);
}
