import { useRef, useCallback, useEffect } from 'react';
import { SimulationWidget } from '../SimulationWidget';
import type { SimulationWidgetApi } from '../SimulationWidget';
import { SCENARIO_CLASH } from '../../lib/constants';
import { STRATEGY_COLORS, type Phenotype } from '../../lib/constants';

export type ClashCaseId =
  | 'altruist-vs-egoist'
  | 'ethnocentric-vs-egoist'
  | 'ethnocentric-vs-altruist'
  | 'altruist-vs-traitor'
  | 'ethnocentric-vs-traitor'
  | 'egoist-vs-traitor';

export interface ClashCase {
  id: ClashCaseId;
  label: string;
  groupA: Phenotype;
  groupB: Phenotype;
  whatHappens: React.ReactNode;
  implication: React.ReactNode;
}

export const CLASH_CASES: ClashCase[] = [
  {
    id: 'altruist-vs-egoist',
    label: 'Altruists vs Egoists',
    groupA: 'altruist',
    groupB: 'egoist',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> exploit{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> at first (they get the benefit, Altruists pay the cost).
        As <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> die out,{' '}
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> lose their &quot;hosts&quot; and go extinct.
        Cooperators disappear first; defectors then collapse.
      </>
    ),
    implication: (
      <>
        Free-riders can&apos;t survive without cooperators. A simple, memorable lesson that sets up why <em>who you&apos;re with</em> matters.
      </>
    ),
  },
  {
    id: 'ethnocentric-vs-egoist',
    label: 'Ethnocentrists vs Egoists',
    groupA: 'ethnocentric',
    groupB: 'egoist',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> cooperate with each other and defect on{' '}
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span>.{' '}
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> get no cooperation from anyone.{' '}
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> thrive;{' '}
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> go extinct. You see a clear &quot;wall&quot; of in-group cooperation.
      </>
    ),
    implication: (
      <>
        Ethnocentrism (in-group cooperation, out-group defection) is a <em>robust</em> strategy against pure defection. It sets up the paper&apos;s main point: ethnocentrism can evolve because it does well in mixed populations.
      </>
    ),
  },
  {
    id: 'ethnocentric-vs-altruist',
    label: 'Ethnocentrists vs Altruists',
    groupA: 'ethnocentric',
    groupB: 'altruist',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> cooperate with their own and defect on{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span>;{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> help everyone. So{' '}
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> get in-group benefit and also exploit{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span>;{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> pay cost to Ethnocentrists and get nothing back. Often Ethnocentrists win or do very well.
      </>
    ),
    implication: (
      <>
        Ethnocentrism can outcompete <em>pure</em> cooperation (altruism). The downside of being indiscriminately nice when others use in-group / out-group rules.
      </>
    ),
  },
  {
    id: 'altruist-vs-traitor',
    label: 'Altruists vs Traitors',
    groupA: 'altruist',
    groupB: 'traitor',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span> help everyone;{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> defect on their own group and <em>help</em> the other. So{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> actually give benefits to{' '}
        <span style={{ color: STRATEGY_COLORS.altruist }}>Altruists</span>, while defecting on each other. Altruists get cooperation from everyone; Traitors get it only from Altruists. Altruists tend to thrive.
      </>
    ),
    implication: (
      <>
        In-group exploiters (Traitors) still help the out-group—so when the out-group is made of cooperators, those cooperators get extra help and usually win.
      </>
    ),
  },
  {
    id: 'ethnocentric-vs-traitor',
    label: 'Ethnocentrists vs Traitors',
    groupA: 'ethnocentric',
    groupB: 'traitor',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span> help same-tag, defect other;{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> do the opposite (defect same-tag, help other). So{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> actually give to{' '}
        <span style={{ color: STRATEGY_COLORS.ethnocentric }}>Ethnocentrists</span>, while Ethnocentrists defect on Traitors and help only each other. Ethnocentrists get cooperation from their own and from Traitors; Traitors get nothing from anyone. Ethnocentrists tend to thrive, Traitors go extinct.
      </>
    ),
    implication: (
      <>
        When one strategy helps the other but the other defects back, the defector wins—here, Ethnocentrists free-ride on Traitors&apos; one-way help.
      </>
    ),
  },
  {
    id: 'egoist-vs-traitor',
    label: 'Egoists vs Traitors',
    groupA: 'egoist',
    groupB: 'traitor',
    whatHappens: (
      <>
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> never cooperate;{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> help the other group and defect on their own. So{' '}
        <span style={{ color: STRATEGY_COLORS.traitor }}>Traitors</span> give to{' '}
        <span style={{ color: STRATEGY_COLORS.egoist }}>Egoists</span> and get nothing back. Egoists free-ride; Traitors tend to go extinct.
      </>
    ),
    implication: (
      <>
        Pure defectors can drive out in-group exploiters when the only cooperation flows one way toward the defectors.
      </>
    ),
  },
];

export function Stage3Clash({
  selectedCaseId,
  onCaseChange,
}: {
  selectedCaseId: ClashCaseId;
  onCaseChange: (id: ClashCaseId) => void;
}) {
  const simApiRef = useRef<SimulationWidgetApi | null>(null);

  const selectedCase = CLASH_CASES.find((c) => c.id === selectedCaseId) ?? CLASH_CASES[0];

  const onReady = useCallback(
    (api: SimulationWidgetApi) => {
      api.seedTwoGroups(selectedCase.groupA, selectedCase.groupB, 0.5, 0.5);
    },
    [selectedCase.groupA, selectedCase.groupB]
  );

  useEffect(() => {
    simApiRef.current?.seedTwoGroups(selectedCase.groupA, selectedCase.groupB, 0.5, 0.5);
  }, [selectedCase.groupA, selectedCase.groupB]);

  return (
    <div className="h-full flex flex-col px-4 overflow-hidden relative">
      <div className="shrink-0 pt-4 h-16">
        <h2 className="text-2xl font-bold text-white text-center">The Clash of Two</h2>
      </div>
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center py-4">
        <div className="flex flex-col items-center gap-5 shrink-0">
          <div className="max-w-xl w-full rounded-xl bg-slate-800/50 border border-slate-700 px-6 py-5">
            <p className="text-white text-center">
              Let&apos;s see what happens when <em>two</em> strategies coexist in the same grid! Pick a case below and hit Play.
            </p>
          </div>
          <SimulationWidget
            gridW={15}
            gridH={15}
            canvasSize={385}
            scenario={SCENARIO_CLASH}
            colorMode="strategy"
            speedIndex={4}
            showChart={false}
            showSpeed={true}
            showDemographics={true}
            enableParticles={false}
            playPauseVariant="greenRed"
            speedSliderVariant="index1To5"
            params={{ mutationRate: 0, immigrationRate: 0 }}
            simApiRef={simApiRef}
            onReady={onReady}
            onReset={() => simApiRef.current?.seedTwoGroups(selectedCase.groupA, selectedCase.groupB, 0.5, 0.5)}
            extraControls={
              <div className="self-start w-28 sm:w-32 md:w-40 min-w-0">
                <select
                  value={selectedCaseId}
                  onChange={(e) => onCaseChange(e.target.value as ClashCaseId)}
                  className="w-full min-w-0 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-sm"
                >
                  {CLASH_CASES.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
