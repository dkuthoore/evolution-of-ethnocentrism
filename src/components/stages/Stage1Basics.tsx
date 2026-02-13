import { useRef, useCallback, useEffect } from 'react';
import { createAgentWithPhenotype } from '../../lib/engine';
import { drawPip } from '../../lib/pipRenderer';
import { ParticleSystem } from '../../lib/particles';
import { COST, BENEFIT, BASE_PTR } from '../../lib/constants';
import type { Stage1MatrixCell } from '../ParametersPanel';

const GRID_W = 2;
const GRID_H = 1;
const CANVAS_SIZE = 300;
const CELL_W = CANVAS_SIZE / GRID_W;
const CELL_H = CANVAS_SIZE / GRID_H;

function createInitialAgents() {
  return [createAgentWithPhenotype('altruist', 0), createAgentWithPhenotype('altruist', 0)];
}

interface Stage1BasicsProps {
  onCooperate?: () => void;
  /** Called with the matrix cell key when user clicks a scenario button (cc, cd, or dd). */
  onScenarioClick?: (cell: Stage1MatrixCell) => void;
}

const COOP_OPTS = {
  numberLifetime: 3200,
  numberVy: -0.12,
  spawnFlow: true,
  numberOffsetY: CELL_H * 0.3,
  spawnLine: false,
  numberDelayMs: 900,
  receiverText: `+${BENEFIT.toFixed(2)}`,
  giverText: `−${COST.toFixed(2)}`,
};

export function Stage1Basics({ onCooperate, onScenarioClick }: Stage1BasicsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const agentsRef = useRef(createInitialAgents());
  const animationRafRef = useRef<number | null>(null);

  useEffect(() => {
    particlesRef.current = new ParticleSystem();
    return () => {
      particlesRef.current = null;
    };
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const agents = agentsRef.current;
    for (let i = 0; i < agents.length; i++) {
      const x = i * CELL_W;
      const y = 0;
      drawPip(ctx, agents[i]!, x, y, CELL_W, CELL_H, 'xray', performance.now(), 'strategy');
    }

    // Labels: Pip A (left), Pip B (right)
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = 'bold 18px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Pip A', CELL_W / 2, CELL_H - 18);
    ctx.fillText('Pip B', CELL_W + CELL_W / 2, CELL_H - 18);
  }, []);

  const PARTICLE_DURATION_MS = 4500;

  const animateParticles = useCallback(() => {
    if (animationRafRef.current !== null) {
      cancelAnimationFrame(animationRafRef.current);
      animationRafRef.current = null;
    }
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas || !particlesRef.current) return;
    const ctx = pCanvas.getContext('2d');
    if (!ctx) return;

    const start = performance.now();
    const loop = (now: number) => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      particlesRef.current!.update(now);
      particlesRef.current!.render(ctx, now, CELL_W, CELL_H);
      if (now - start < PARTICLE_DURATION_MS) {
        animationRafRef.current = requestAnimationFrame(loop);
      } else {
        animationRafRef.current = null;
      }
    };
    animationRafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  /** Reset both PTRs to base so each scenario shows correct one-shot payoffs. */
  const resetToBase = useCallback(() => {
    const agents = agentsRef.current;
    agents[0]!.ptr = BASE_PTR;
    agents[1]!.ptr = BASE_PTR;
  }, []);

  const handleBothCooperate = useCallback(() => {
    onScenarioClick?.('cc');
    resetToBase();
    const agents = agentsRef.current;
    agents[0]!.ptr = BASE_PTR - COST + BENEFIT;
    agents[1]!.ptr = BASE_PTR - COST + BENEFIT;
    const sys = particlesRef.current;
    const netCc = (BENEFIT - COST).toFixed(2);
    const cy = CELL_H / 2 - CELL_H * 0.3;
    if (sys) {
      // A → B: line and flow only (no cost/benefit numbers)
      sys.spawnCooperation(0, 0, CELL_W, 0, CELL_W, CELL_H, '#3b82f6', {
        spawnLine: true,
        spawnFlow: true,
        spawnNumbers: false,
      });
      // B → A: line and flow only, slightly delayed
      sys.spawnCooperation(CELL_W, 0, 0, 0, CELL_W, CELL_H, '#3b82f6', {
        spawnLine: true,
        spawnFlow: true,
        spawnNumbers: false,
        numberDelayMs: 400,
      });
      // Net payoff for each Pip
      sys.spawn({ x: CELL_W / 2, y: cy, vx: 0, vy: -0.12, text: `+${netCc}`, color: '#22c55e', lifetime: 3200, type: 'number', delay: 900 });
      sys.spawn({ x: CELL_W + CELL_W / 2, y: cy, vx: 0, vy: -0.12, text: `+${netCc}`, color: '#22c55e', lifetime: 3200, type: 'number', delay: 900 });
    }
    onCooperate?.();
    animateParticles();
    draw();
  }, [resetToBase, onCooperate, onScenarioClick, animateParticles, draw]);

  const handleOneCooperateOneDefect = useCallback(() => {
    onScenarioClick?.('cd');
    onScenarioClick?.('dc');
    resetToBase();
    const agents = agentsRef.current;
    agents[0]!.ptr = BASE_PTR - COST;
    agents[1]!.ptr = BASE_PTR + BENEFIT;
    // A cooperates, B defects: show one flow from A (giver) to B (receiver), then numbers above each
    particlesRef.current?.spawnCooperation(0, 0, CELL_W, 0, CELL_W, CELL_H, '#3b82f6', {
      ...COOP_OPTS,
      spawnLine: true,
      spawnFlow: true,
      spawnNumbers: true,
      receiverText: `+${BENEFIT.toFixed(2)}`,
      giverText: `−${COST.toFixed(2)}`,
      numberDelayMs: 400,
    });
    onCooperate?.();
    animateParticles();
    draw();
  }, [resetToBase, onCooperate, onScenarioClick, animateParticles, draw]);

  const handleBothDefect = useCallback(() => {
    onScenarioClick?.('dd');
    resetToBase();
    const sys = particlesRef.current;
    const cxA = CELL_W / 2;
    const cy = CELL_H / 2 - CELL_H * 0.3;
    const cxB = CELL_W + CELL_W / 2;
    if (sys) {
      sys.spawn({ x: cxA, y: cy, vx: 0, vy: -0.12, text: '0', color: '#94a3b8', lifetime: 2200, type: 'number' });
      sys.spawn({ x: cxB, y: cy, vx: 0, vy: -0.12, text: '0', color: '#94a3b8', lifetime: 2200, type: 'number' });
    }
    animateParticles();
    draw();
  }, [resetToBase, onScenarioClick, animateParticles, draw]);

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <h2 className="text-2xl font-bold text-white text-center mt-4 mb-2 shrink-0">Meet the Pips</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5 space-y-4">
            <p className="text-slate-300 text-center">
              Below we have two &quot;Pips&quot;. When they meet, they can cooperate or defect with each other. This creates a classic <strong>Prisoner&apos;s Dilemma</strong>:
            </p>
            <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside pl-2">
              <li>If both cooperate, both gain net 0.02 (receive 0.03, pay 0.01)</li>
              <li>If one defects and the other cooperates, one gains 0.03 at no cost, while the other loses 0.01 and gains nothing.</li>
              <li>If both defect, nothing happens for either party.</li>
            </ul>
            <p className="text-slate-400 text-center text-sm">
              Click the 3 different options below to see the costs and payoffs.
            </p>
          </div>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="block rounded-lg border border-slate-700"
              style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
            />
            <canvas
              ref={particleCanvasRef}
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              className="absolute inset-0 pointer-events-none rounded-lg"
              aria-hidden
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={handleBothCooperate}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-semibold text-sm transition-colors"
            >
              Both cooperate
            </button>
            <button
              onClick={handleOneCooperateOneDefect}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg text-white font-semibold text-sm transition-colors"
            >
              One cooperates, one defects
            </button>
            <button
              onClick={handleBothDefect}
              className="px-5 py-2.5 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-semibold text-sm transition-colors"
            >
              Both defect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
