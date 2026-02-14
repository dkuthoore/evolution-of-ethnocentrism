import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { DISTRIBUTION_PRESETS } from '../../lib/constants';
import type { SimulationParams } from '../../lib/constants';

const GRID_SIZE = 25;
const CANVAS_SIZE = 385;
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
    <div className="flex min-h-0 flex-1 flex-col px-4 overflow-hidden">
      <div className="shrink-0 pt-4 h-16 w-full">
        <h2 className="text-2xl font-bold text-white text-center">Playground</h2>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-4 shrink-0 w-full max-w-4xl">
          <div className="flex-shrink-0 max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
            <p className="text-white text-center">
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
          chartInLeftPane={true}
          enableParticles={false}
          playPauseVariant="greenRed"
          speedSliderVariant="index1To5"
          chartShiftLeft
          params={params}
          allowPainting={false}
          extraControls={
            <div className="self-start w-28 sm:w-32 md:w-40 min-w-0">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value)}
                className="w-full min-w-0 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
              >
                {Object.keys(DISTRIBUTION_PRESETS).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          }
          simApiRef={simApiRef}
          onReady={onReady}
          onReset={() => simApiRef.current?.seedByDistribution(distribution, FILL_RATIO)}
        />
          </div>
        </div>
      </div>
    </div>
  );
}
