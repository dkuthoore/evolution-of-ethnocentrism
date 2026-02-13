import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { DISTRIBUTION_PRESETS } from '../../lib/constants';
import type { SimulationParams } from '../../lib/constants';

const GRID_SIZE = 25;
const CANVAS_SIZE = 400;
const FILL_RATIO = 0.5;

export function Stage6GodMode({ params }: { params: SimulationParams }) {
  const [preset, setPreset] = useState<string>('Equal Mix');
  const simApiRef = useRef<SimulationWidgetApi | null>(null);

  const distribution = DISTRIBUTION_PRESETS[preset] ?? DISTRIBUTION_PRESETS['Equal Mix']!;

  const onReady = useCallback((api: SimulationWidgetApi) => {
    api.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  useEffect(() => {
    simApiRef.current?.setParams(params);
  }, [params]);

  useEffect(() => {
    simApiRef.current?.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-4 overflow-hidden">
      <h2 className="flex-shrink-0 text-2xl font-bold text-white">Playground</h2>
      <div className="flex-shrink-0 max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
        <p className="text-slate-300 text-center">
          Feel free to tweak parameters, make your own simulations, see what you find!
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center min-w-0 w-full max-w-4xl">
        <SimulationWidget
          gridW={GRID_SIZE}
          gridH={GRID_SIZE}
          canvasSize={CANVAS_SIZE}
          colorMode="strategy"
          speedIndex={4}
          showChart={true}
          enableHistory={true}
          enableParticles={false}
          playPauseVariant="greenRed"
          speedSliderVariant="index1To5"
          params={params}
          allowPainting={false}
          extraControls={
            <select
              value={preset}
              onChange={(e) => setPreset(e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm min-w-0 max-w-[160px] shrink-0"
            >
              {Object.keys(DISTRIBUTION_PRESETS).map((key) => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          }
          simApiRef={simApiRef}
          onReady={onReady}
          onReset={() => simApiRef.current?.seedByDistribution(distribution, FILL_RATIO)}
        />
      </div>
    </div>
  );
}
