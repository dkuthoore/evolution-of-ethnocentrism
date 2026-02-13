import { useRef, useState, useCallback, useEffect } from 'react';
import { createAgentWithPhenotype } from '../../lib/engine';
import { drawPip } from '../../lib/pipRenderer';
import { ParticleSystem } from '../../lib/particles';
import { COST, BENEFIT } from '../../lib/constants';

const GRID_W = 2;
const GRID_H = 1;
const CANVAS_SIZE = 300;
const CELL_W = CANVAS_SIZE / GRID_W;
const CELL_H = CANVAS_SIZE / GRID_H;

function createInitialAgents() {
  return [createAgentWithPhenotype('altruist', 0), createAgentWithPhenotype('altruist', 0)];
}

export function Stage1Basics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ParticleSystem | null>(null);
  const [hasCooperated, setHasCooperated] = useState(false);
  const agentsRef = useRef(createInitialAgents());

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
    const pCanvas = particleCanvasRef.current;
    if (!pCanvas || !particlesRef.current) return;
    const ctx = pCanvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    const start = performance.now();
    const loop = (now: number) => {
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      particlesRef.current!.update(now);
      particlesRef.current!.render(ctx, now, CELL_W, CELL_H);
      if (now - start < PARTICLE_DURATION_MS) {
        rafId = requestAnimationFrame(loop);
      }
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    draw();
  }, [draw, hasCooperated]);

  const handleCooperate = useCallback(() => {
    const agents = agentsRef.current;
    agents[0]!.ptr -= COST;
    agents[1]!.ptr += BENEFIT;

    particlesRef.current?.spawnCooperation(0, 0, CELL_W, 0, CELL_W, CELL_H, '#3b82f6', {
      numberLifetime: 3200,
      numberVy: -0.12,
      spawnFlow: true,
      numberOffsetY: CELL_H * 0.3,
      spawnLine: false,
      numberDelayMs: 900,
    });
    setHasCooperated(true);
    animateParticles();
  }, [animateParticles]);

  const handleReset = useCallback(() => {
    agentsRef.current = createInitialAgents();
    particlesRef.current?.clear();
    const pCanvas = particleCanvasRef.current;
    if (pCanvas) {
      const ctx = pCanvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    setHasCooperated(false);
    draw();
  }, [draw]);

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <h2 className="text-2xl font-bold text-white text-center mt-4 mb-2 shrink-0">Stage 1: The Basics</h2>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-4 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
            <p className="text-slate-400 text-center">
              Below we have two &quot;Pips&quot;. Pips mind their own business and are happy on their own, but sometimes Pips have neighbors.
            </p>
            <p className="text-slate-400 text-center mt-4">
              When a Pip has a neighbor, they can either cooperate with them or not. If they cooperate, it costs them something — but they increase their neighbor&apos;s &quot;Potential to Reproduce&quot; (PTR), which helps that neighbor reproduce in the next generation.
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
          <div className="flex gap-4">
            <button
              onClick={handleCooperate}
              disabled={hasCooperated}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg text-white font-bold text-lg transition-colors"
            >
              Cooperate
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg text-white font-bold text-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
      {hasCooperated && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10">
          <h3 className="text-sm font-semibold text-white mb-2 text-center">Parameters</h3>
          <div className="rounded-lg border border-slate-700 overflow-hidden">
            <table className="w-full text-xs table-fixed">
              <colgroup>
                <col className="w-16" />
                <col className="w-auto" />
              </colgroup>
              <thead>
                <tr className="bg-slate-800 text-slate-300">
                  <th className="px-2 py-1.5 text-left font-medium">Param</th>
                  <th className="px-2 py-1.5 text-left font-medium">What it does</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-slate-700">
                  <td className="px-2 py-1.5 text-slate-200 font-medium">Cost</td>
                  <td className="px-2 py-1.5 text-slate-400">PTR −1% when donating. Giving is costly.</td>
                </tr>
                <tr className="border-t border-slate-700">
                  <td className="px-2 py-1.5 text-slate-200 font-medium">Benefit</td>
                  <td className="px-2 py-1.5 text-slate-400">PTR +3% when receiving. Receiving helps.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
