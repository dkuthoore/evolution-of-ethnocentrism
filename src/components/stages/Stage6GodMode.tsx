import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import type { SimulationParams } from '../../lib/constants';

export function Stage6GodMode() {
  const [params, setParams] = useState<SimulationParams>({});
  const simApiRef = useRef<SimulationWidgetApi | null>(null);

  const updateParam = useCallback(<K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => {
    setParams((p) => ({ ...p, [key]: value }));
  }, []);

  useEffect(() => {
    simApiRef.current?.setParams(params);
  }, [params]);

  return (
    <div className="h-full flex flex-col items-center justify-center gap-6 px-4 overflow-auto">
      <h2 className="text-2xl font-bold text-white">God Mode</h2>
      <p className="text-slate-400 text-center max-w-xl">
        Tweak the parameters. Use the brush to paint, the meteor to clear, or inspect any Pip.
      </p>
      <SimulationWidget
        gridW={50}
        gridH={50}
        canvasSize={400}
        colorMode="tags"
        speedIndex={5}
        showChart={true}
        enableHistory={true}
        enableParticles={false}
        params={params}
        allowPainting={true}
        simApiRef={simApiRef}
        extraControls={
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-xs text-slate-400 block">Cost %</label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={(params.cost ?? 0.01) * 100}
                onChange={(e) => updateParam('cost', Number(e.target.value) / 100)}
                className="w-24 accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block">Benefit %</label>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={(params.benefit ?? 0.03) * 100}
                onChange={(e) => updateParam('benefit', Number(e.target.value) / 100)}
                className="w-24 accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block">Death Rate %</label>
              <input
                type="range"
                min={0}
                max={30}
                step={1}
                value={(params.deathRate ?? 0.1) * 100}
                onChange={(e) => updateParam('deathRate', Number(e.target.value) / 100)}
                className="w-24 accent-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block">Mutation %</label>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={(params.mutationRate ?? 0.005) * 100}
                onChange={(e) => updateParam('mutationRate', Number(e.target.value) / 100)}
                className="w-24 accent-blue-500"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
