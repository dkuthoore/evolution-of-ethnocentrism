import { useRef, useState, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { DISTRIBUTION_PRESETS } from '../../lib/constants';

export function Stage4Population() {
  const [preset, setPreset] = useState<string>('Equal Mix');
  const simApiRef = useRef<SimulationWidgetApi | null>(null);

  const distribution = DISTRIBUTION_PRESETS[preset] ?? DISTRIBUTION_PRESETS['Equal Mix']!;

  const FILL_RATIO = 0.5;

  const onReady = useCallback((api: SimulationWidgetApi) => {
    api.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  useEffect(() => {
    simApiRef.current?.seedByDistribution(distribution, FILL_RATIO);
  }, [distribution]);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center gap-4 px-4 overflow-hidden">
      <div className="shrink-0 pt-4 h-16 w-full">
        <h2 className="text-2xl font-bold text-white text-center">Population Dynamics</h2>
      </div>
      <div className="flex-shrink-0 max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-4 py-3">
        <p className="text-slate-300 text-center text-sm">
          Now let&apos;s put all four strategies in one world. Choose a starting mix and hit Play to run. We also add two new forces to the simulation: <strong className="text-slate-200">mutation rate</strong> and <strong className="text-slate-200">immigration rate</strong>. Watch how the mix evolves and which strategy wins.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center min-w-0 w-full max-w-4xl">
        <SimulationWidget
        gridW={25}
        gridH={25}
        canvasSize={385}
        colorMode="strategy"
        speedIndex={4}
        showChart={true}
        enableHistory={true}
        enableParticles={false}
        playPauseVariant="greenRed"
        speedSliderVariant="index1To5"
        spaceBeforeCanvas="large"
        chartShiftLeft
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
  );
}
