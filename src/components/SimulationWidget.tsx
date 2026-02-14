import { useRef, useEffect, useCallback, useState } from 'react';
import type { MouseEvent, MutableRefObject, ReactNode } from 'react';
import { useSimulation, type SimulationEngineApi } from '../hooks/useSimulation';
import { createAgentWithPhenotype, getPhenotype } from '../lib/engine';
import type { Agent } from '../lib/engine';
import { getGridIndexFromMouse } from '../lib/canvasUtils';
import { Pencil, Flame, Search } from 'lucide-react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { PopulationChart } from './PopulationChart';
import { SPEEDS, TAG_COLORS, TAG_LABELS } from '../lib/constants';
import type { ScenarioMode, SimulationParams } from '../lib/constants';
import type { Phenotype } from '../lib/constants';
export interface SimulationWidgetApi {
  seedByDistribution: (dist: import('../lib/constants').Distribution, fillRatio?: number) => void;
  seedTwoGroups: (a: Phenotype, b: Phenotype, ratio: number, fillRatio?: number) => void;
  reset: () => void;
  setCell: (idx: number, agent: import('../lib/engine').Agent | null) => void;
  clearRegion: (centerIdx: number, radius: number) => void;
  setParams: (params: SimulationParams) => void;
}

export interface SimulationWidgetProps {
  gridW: number;
  gridH: number;
  canvasSize?: number;
  speedIndex?: number;
  scenario?: ScenarioMode;
  params?: SimulationParams;
  colorMode?: 'tags' | 'strategy';
  showChart?: boolean;
  showSpeed?: boolean;
  showDemographics?: boolean;
  /** When true, show both "By strategy" and "By tag" demographics (Stage 5). */
  demographicsByTag?: boolean;
  enableParticles?: boolean;
  enableHistory?: boolean;
  /** Custom reset handler - e.g. reseed with distribution. If not provided, calls sim.reset() */
  onReset?: () => void;
  /** Expose sim api to parent for custom seeding */
  simApiRef?: MutableRefObject<SimulationWidgetApi | null>;
  /** Called when sim is ready - use to seed initial state */
  onReady?: (api: SimulationWidgetApi) => void;
  /** Enable brush, meteor, inspect tools */
  allowPainting?: boolean;
  extraControls?: ReactNode;
  /** 'greenRed': Play=green, Pause=red (for stage coherence with Stage 2) */
  playPauseVariant?: 'default' | 'greenRed';
  /** When 'index1To5', speed slider shows 1–5 (maps to speedIndex 0–4). Default 'tps'. */
  speedSliderVariant?: 'tps' | 'index1To5';
  /** Extra space above the grid (below controls). Use 'large' on Stage 4. */
  spaceBeforeCanvas?: 'default' | 'large';
  /** Slight left shift for the Population Over Time chart only (keeps header in place). */
  chartShiftLeft?: boolean;
  /** When set, draw a black dot on agents with this phenotype (e.g. Stage 5: ethnocentrists when color = tag). */
  highlightPhenotype?: Phenotype;
  /** When true, render the Population Over Time chart in the left sidebar (e.g. Stage 5). Only when paused. */
  chartInLeftPane?: boolean;
  /** When true, overlay tag demographics as lines on the chart (e.g. Stage 5). */
  chartShowTagOverlay?: boolean;
}

type GodTool = 'none' | 'brush' | 'meteor' | 'inspect';

export function SimulationWidget({
  gridW,
  gridH,
  canvasSize = 400,
  speedIndex: initialSpeedIndex = 0,
  scenario = 'standard',
  params,
  colorMode = 'strategy',
  showChart = false,
  showSpeed = true,
  showDemographics = true,
  demographicsByTag = false,
  enableParticles = true,
  enableHistory = false,
  onReset,
  simApiRef,
  onReady,
  allowPainting = false,
  extraControls,
  playPauseVariant = 'default',
  speedSliderVariant = 'tps',
  spaceBeforeCanvas = 'default',
  chartShiftLeft = false,
  highlightPhenotype,
  chartInLeftPane = false,
  chartShowTagOverlay = false,
}: SimulationWidgetProps) {
  const [activeTool, setActiveTool] = useState<GodTool>('none');
  const [brushPhenotype, setBrushPhenotype] = useState<Phenotype>('ethnocentric');
  const [hoveredAgent, setHoveredAgent] = useState<{ agent: Agent; idx: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);

  const sim = useSimulation(canvasRef, particleCanvasRef, {
    scenario,
    viewMode: 'xray',
    colorMode,
    canvasWidth: canvasSize,
    canvasHeight: canvasSize,
    gridW,
    gridH,
    usePips: true,
    enableParticles,
    enableHistory,
    params,
    initialSpeedIndex,
    highlightPhenotype,
    onEngineReady:
      simApiRef || onReady
        ? (api: SimulationEngineApi) => {
            if (simApiRef) simApiRef.current = api;
            onReady?.(api);
          }
        : undefined,
  });

  useEffect(() => {
    sim.draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- draw once on mount
  }, []);

  useEffect(() => {
    return () => {
      if (simApiRef) simApiRef.current = null;
    };
  }, [simApiRef]);

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      sim.reset();
    }
  };

  const total = sim.stats.total || 1;
  const pct = (c: Phenotype) => (((sim.stats.counts[c] ?? 0) / total) * 100).toFixed(1);

  const handleCanvasMouseMove = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!allowPainting || !canvasRef.current) return;
      const result = getGridIndexFromMouse(e.nativeEvent, canvasRef.current, gridW, gridH);
      if (!result) {
        setHoveredAgent(null);
        return;
      }
      const agent = sim.engineRef.current?.getGrid()[result.idx] ?? null;
      if (agent) {
        setHoveredAgent({ agent, idx: result.idx });
        setTooltipPos({ x: e.clientX, y: e.clientY });
      } else {
        setHoveredAgent(null);
      }
      if (activeTool === 'brush' && isDraggingRef.current && result) {
        sim.setCell(result.idx, createAgentWithPhenotype(brushPhenotype, 0));
      }
    },
    [allowPainting, activeTool, brushPhenotype, gridW, gridH, sim]
  );

  const handleCanvasMouseDown = useCallback(
    (e: MouseEvent<HTMLCanvasElement>) => {
      if (!allowPainting || !canvasRef.current) return;
      const result = getGridIndexFromMouse(e.nativeEvent, canvasRef.current, gridW, gridH);
      if (!result) return;
      if (activeTool === 'brush') {
        isDraggingRef.current = true;
        sim.setCell(result.idx, createAgentWithPhenotype(brushPhenotype, 0));
      } else if (activeTool === 'meteor') {
        sim.clearRegion(result.idx, 2);
      }
    },
    [allowPainting, activeTool, brushPhenotype, gridW, gridH, sim]
  );

  const handleCanvasMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  return (
    <div className="flex flex-col lg:flex-row gap-4 flex-wrap">
      <div className="flex flex-col gap-2 items-start shrink-0" style={{ minWidth: canvasSize }}>
        {allowPainting && (
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={() => setActiveTool('none')} className={`p-2 rounded ${activeTool === 'none' ? 'bg-slate-600' : 'bg-slate-700'}`}>—</button>
            <button onClick={() => setActiveTool('brush')} className={`p-2 rounded ${activeTool === 'brush' ? 'bg-blue-600' : 'bg-slate-700'}`}><Pencil size={18} /></button>
            <button onClick={() => setActiveTool('meteor')} className={`p-2 rounded ${activeTool === 'meteor' ? 'bg-amber-600' : 'bg-slate-700'}`}><Flame size={18} /></button>
            <button onClick={() => setActiveTool('inspect')} className={`p-2 rounded ${activeTool === 'inspect' ? 'bg-emerald-600' : 'bg-slate-700'}`}><Search size={18} /></button>
            {activeTool === 'brush' && (
              <select value={brushPhenotype} onChange={(e) => setBrushPhenotype(e.target.value as Phenotype)} className="bg-slate-700 rounded px-2 py-1 text-sm">
                {(['ethnocentric', 'altruist', 'egoist', 'traitor'] as const).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            )}
          </div>
        )}
        <div className="flex gap-2 items-center flex-nowrap">
          <button
            onClick={sim.isRunning ? sim.pause : sim.play}
            className={`inline-flex items-center justify-center gap-2 w-28 shrink-0 px-4 py-2 rounded-lg text-white font-medium ${
              playPauseVariant === 'greenRed'
                ? sim.isRunning
                  ? 'bg-red-600 hover:bg-red-500'
                  : 'bg-green-600 hover:bg-green-500'
                : 'bg-blue-600 hover:bg-blue-500'
            }`}
          >
            {sim.isRunning ? <Pause size={18} /> : <Play size={18} />}
            <span className="w-12 text-left inline-block">{sim.isRunning ? 'Pause' : 'Play'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-white"
          >
            <RotateCcw size={18} />
            Reset
          </button>
          {extraControls}
        </div>
        <div className={`relative bg-slate-800 rounded-lg overflow-hidden border border-slate-700 inline-block ${spaceBeforeCanvas === 'large' ? 'mt-2' : ''}`}>
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className="block"
            aria-label={`${gridW} by ${gridH} grid of Pips`}
            onMouseMove={allowPainting ? handleCanvasMouseMove : undefined}
            onMouseDown={allowPainting ? handleCanvasMouseDown : undefined}
            onMouseUp={allowPainting ? handleCanvasMouseUp : undefined}
            onMouseLeave={allowPainting ? handleCanvasMouseUp : undefined}
          />
          {allowPainting && activeTool === 'inspect' && hoveredAgent && (
            <div
              className="fixed z-50 bg-slate-900/95 border border-slate-600 rounded px-3 py-2 text-sm shadow-xl pointer-events-none"
              style={{ left: tooltipPos.x + 12, top: tooltipPos.y + 12 }}
            >
              <div className="font-medium">{getPhenotype(hoveredAgent.agent)}</div>
              <div className="text-xs text-white">PTR: {(hoveredAgent.agent.ptr * 100).toFixed(0)}%</div>
            </div>
          )}
          <canvas
            ref={particleCanvasRef}
            width={canvasSize}
            height={canvasSize}
            className="absolute inset-0 pointer-events-none"
            aria-hidden
          />
        </div>
      </div>

      <div className="flex flex-col gap-4 min-w-[200px]">
        {showSpeed && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Speed</h4>
            {speedSliderVariant === 'index1To5' ? (
              <>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={Math.min(5, Math.max(1, sim.speedIndex + 1))}
                  onChange={(e) => sim.setSpeedIndex(Math.max(0, Number(e.target.value) - 1))}
                  className="w-full accent-sky-500"
                />
                <p className="text-xs text-slate-200">{Math.min(5, Math.max(1, sim.speedIndex + 1))}</p>
              </>
            ) : (
              <>
                <input
                  type="range"
                  min={0}
                  max={SPEEDS.length - 1}
                  value={sim.speedIndex}
                  onChange={(e) => sim.setSpeedIndex(Number(e.target.value))}
                  className="w-full accent-sky-500"
                />
                <p className="text-xs text-slate-200">{SPEEDS[sim.speedIndex]} TPS</p>
              </>
            )}
          </div>
        )}
        <div className="text-sm text-white">
          Gen {sim.generation} · Pop {sim.stats.total}
        </div>
        {showDemographics && (
          <div className="space-y-4">
            {demographicsByTag && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Demographics (by tag)</h4>
                <div className="space-y-2">
                  {(TAG_LABELS as unknown as string[]).map((label, i) => {
                    const count = sim.stats.tagCounts[i] ?? 0;
                    const pctTag = sim.stats.total > 0 ? (100 * count) / sim.stats.total : 0;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs">
                          <span>{label}</span>
                          <span>{pctTag.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${pctTag}%`,
                              backgroundColor: TAG_COLORS[i],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">
                Demographics{demographicsByTag ? ' (by strategy)' : ''}
              </h4>
              <div className="space-y-2">
                {(['ethnocentric', 'altruist', 'egoist', 'traitor'] as const).map((key) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs">
                      <span>{key === 'ethnocentric' ? 'Ethnocentrist' : key === 'altruist' ? 'Altruist' : key === 'egoist' ? 'Egoist' : 'Traitor'}</span>
                      <span>{pct(key)}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct(key)}%`,
                          backgroundColor:
                            key === 'ethnocentric' ? '#a855f7' :
                            key === 'altruist' ? '#3b82f6' :
                            key === 'egoist' ? '#ef4444' : '#eab308',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {showChart && sim.history.length > 1 && chartInLeftPane && (
          <div className="fixed left-12 top-1/2 -translate-y-1/2 w-80 z-10 px-3" aria-label="Population over time">
            <h4 className="text-sm font-semibold text-white mb-1">Population Over Time</h4>
            <div className="-ml-8">
              <PopulationChart history={sim.history} height={320} showTagOverlay={chartShowTagOverlay} />
            </div>
          </div>
        )}
        {showChart && sim.history.length > 1 && !chartInLeftPane && (
          <div className="w-full max-w-sm">
            <h4 className="text-sm font-semibold text-white mb-1">Population Over Time</h4>
            <div className={chartShiftLeft ? '-ml-8' : undefined}>
              <PopulationChart history={sim.history} height={180} showTagOverlay={chartShowTagOverlay} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
