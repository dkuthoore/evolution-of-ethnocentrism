import { useState } from 'react';
import { COST, BENEFIT, DEFAULT_PARAMS } from '../lib/constants';
import type { SimulationParams } from '../lib/constants';
import { CLASH_CASES, type ClashCaseId } from './stages/Stage3Clash';

/** Allow only digits, one decimal point, and optional leading minus for numeric input. */
function sanitizeNumericInput(s: string, allowNegative: boolean): string {
  let t = s.replace(/[^\d.-]/g, '');
  const parts = t.split('.');
  if (parts.length > 2) t = parts[0] + '.' + parts.slice(1).join('');
  if (!allowNegative) t = t.replace(/-/g, '');
  return t;
}

/** Cell keys: A's action (c/d), B's action (c/d). */
export type Stage1MatrixCell = 'cc' | 'cd' | 'dc' | 'dd';

const NET_CC = BENEFIT - COST; // +0.02 when both cooperate

const STAGE1_DEFECTION_LINE =
  'Defection is always the individually rational choice in a single interaction (you either free-ride or avoid being exploited), but mutual cooperation beats mutual defection.';

const STAGE1_PD_VARIABLES = (
  <div className="text-white text-xs space-y-1.5">
    <div className="space-y-0.5 pl-0.5 leading-relaxed">
      <em>B</em> = benefit to recipient<br />
      <em>C</em> = cost to donor<br />
      <em>R</em> = reward (both cooperate)<br />
      <em>S</em> = sucker&apos;s payoff (you cooperate, they defect)<br />
      <em>T</em> = temptation (you defect, they cooperate)<br />
      <em>P</em> = punishment (both defect)
    </div>
    <div className="space-y-0.5 pl-0.5 leading-relaxed">
      <strong className="text-white font-semibold">Our model:</strong><br />
      <em>T</em> = <em>B</em> = 0.03<br />
      <em>R</em> = <em>B</em> − <em>C</em> = 0.02<br />
      <em>P</em> = 0<br />
      <em>S</em> = −<em>C</em> = −0.01
    </div>
    <div className="pl-0.5 leading-relaxed">
      <strong className="text-white font-semibold">T &gt; R &gt; P &gt; S and <em className="text-white">B</em> &gt; <em className="text-white">C</em></strong>
    </div>
  </div>
);

export function Stage1LeftPanel({ revealedCells }: { revealedCells?: Set<Stage1MatrixCell> }) {
  const allFourRevealed =
    revealedCells?.size === 4 &&
    ['cc', 'cd', 'dc', 'dd'].every((c) => revealedCells.has(c as Stage1MatrixCell));
  if (!allFourRevealed) return null;
  return (
    <aside className="absolute left-12 top-1/2 -translate-y-1/2 w-72 z-10 max-h-[85vh] overflow-y-auto px-3" aria-label="Prisoner's Dilemma variables">
      <p className="font-semibold text-white text-sm mb-2">Prisoner&apos;s Dilemma Variables</p>
      {STAGE1_PD_VARIABLES}
    </aside>
  );
}

function PayoffMatrix({ revealedCells }: { revealedCells?: Set<Stage1MatrixCell> }) {
  const net = NET_CC.toFixed(2);
  const cost = COST.toFixed(2);
  const benefit = BENEFIT.toFixed(2);
  const empty = <span className="text-slate-200">—</span>;
  const show = (cell: Stage1MatrixCell) => revealedCells?.has(cell) ?? false;
  const allFourRevealed =
    revealedCells?.size === 4 &&
    ['cc', 'cd', 'dc', 'dd'].every((c) => revealedCells.has(c as Stage1MatrixCell));
  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Payoff matrix (PTR change)</h3>
      <p className="text-xs text-white text-center mb-2">(A, B)</p>
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-xs">
          <colgroup>
            <col className="w-24" />
            <col className="w-auto" />
            <col className="w-auto" />
          </colgroup>
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="w-24" />
              <th className="px-2 py-2 text-center font-medium">B cooperates</th>
              <th className="px-2 py-2 text-center font-medium">B defects</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            <tr className="border-t border-slate-700">
              <td className="px-2 py-2 bg-slate-800 text-white font-medium">A cooperates</td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('cc') ? <span className="text-emerald-400">+{net}, +{net}</span> : empty}
              </td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('cd') ? (
                  <><span className="text-rose-400">−{cost}</span>, <span className="text-emerald-400">+{benefit}</span></>
                ) : empty}
              </td>
            </tr>
            <tr className="border-t border-slate-700">
              <td className="px-2 py-2 bg-slate-800 text-white font-medium">A defects</td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('dc') ? (
                  <><span className="text-emerald-400">+{benefit}</span>, <span className="text-rose-400">−{cost}</span></>
                ) : empty}
              </td>
              <td className="px-2 py-2 text-center bg-slate-800/80">
                {show('dd') ? <span className="text-white">0, 0</span> : empty}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {allFourRevealed && (
        <p className="text-white text-xs text-center mt-3">{STAGE1_DEFECTION_LINE}</p>
      )}
    </div>
  );
}

const STAGE2_PARAMETERS = [
  { param: 'Cost', description: 'PTR −1% when donating. Giving is costly.' },
  { param: 'Benefit', description: 'PTR +3% when receiving. Receiving helps.' },
  { param: 'BasePTR', description: 'PTR reset to 12% at start of each tick.' },
  { param: 'DeathRate', description: '10% chance per agent per tick to die. Creates space.' },
];

const STAGE4_PARAMETERS = [
  { param: 'Cost', description: 'PTR −1% when donating. Giving is costly.' },
  { param: 'Benefit', description: 'PTR +3% when receiving. Receiving helps.' },
  { param: 'BasePTR', description: 'PTR reset to 12% at start of each tick.' },
  { param: 'Death rate', description: '10% chance per agent per generation to die.' },
  { param: 'Mutation rate', description: 'Chance an offspring is a different strategy (e.g. 0.5% per birth).' },
  { param: 'Immigration rate', description: 'Each generation, one new Pip is generated in a random empty cell.' },
];

const STAGE6_EDITABLE_PARAMS: Array<{
  key: keyof SimulationParams;
  label: string;
  description: string;
  step: number;
  min: number;
  max: number;
}> = [
  { key: 'cost', label: 'Cost', description: 'PTR drop when donating.', step: 0.001, min: 0, max: 0.1 },
  { key: 'benefit', label: 'Benefit', description: 'PTR rise when receiving.', step: 0.001, min: 0, max: 0.2 },
  { key: 'basePtr', label: 'Base PTR', description: 'PTR reset each tick.', step: 0.01, min: 0, max: 1 },
  { key: 'deathRate', label: 'Death rate', description: 'Chance per agent per tick to die.', step: 0.01, min: 0, max: 1 },
  { key: 'mutationRate', label: 'Mutation rate', description: 'Chance offspring is different strategy.', step: 0.001, min: 0, max: 0.1 },
  { key: 'immigrationRate', label: 'Immigration rate', description: 'New Pips per tick (empty cell).', step: 1, min: 0, max: 10 },
];

/** Format number for display so small values show enough significant digits (e.g. 0.005, 0.01). */
function formatParamValue(value: number, key: keyof SimulationParams): string {
  if (key === 'immigrationRate') return String(Math.round(value));
  if (value >= 1 || value <= 0) return value.toFixed(2);
  const decimals = value < 0.01 ? 4 : value < 0.1 ? 3 : 2;
  return value.toFixed(decimals);
}

/** Format a PD payoff value for display (e.g. 0.02, -0.01). */
function formatPdValue(v: number): string {
  const abs = Math.abs(v);
  if (abs >= 1) return v.toFixed(2);
  const decimals = abs < 0.01 ? 4 : abs < 0.1 ? 3 : 2;
  return v.toFixed(decimals);
}

function EditableParametersTable({
  params,
  onParamChange,
  onReset,
}: {
  params: SimulationParams;
  onParamChange: (key: keyof SimulationParams, value: number) => void;
  onReset: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Record<keyof SimulationParams, string>>>({});

  const handleReset = () => {
    onReset();
    setEditing({});
  };

  const B = params.benefit ?? DEFAULT_PARAMS.benefit;
  const C = params.cost ?? DEFAULT_PARAMS.cost;
  const R = B - C;
  const S = -C;
  const T = B;
  const P = 0;
  const pdInequalitiesHold = T > R && R > P && P > S && B > C;

  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-80 z-10 max-h-[85vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-white text-center mb-2">Parameters</h3>
      <div className="text-white text-xs mb-3 space-y-1.5">
        <p className="font-semibold text-white">Prisoner&apos;s Dilemma Variables</p>
        <div className="space-y-0.5 pl-0.5 leading-relaxed">
          <em>B</em> = benefit to recipient<br />
          <em>C</em> = cost to donor<br />
          <em>R</em> = reward (both cooperate)<br />
          <em>S</em> = sucker’s payoff (you cooperate, they defect)<br />
          <em>T</em> = temptation (you defect, they cooperate)<br />
          <em>P</em> = punishment (both defect)
        </div>
        <div className="space-y-0.5 pl-0.5 leading-relaxed">
          <strong className="text-white font-semibold">Your model:</strong><br />
          <em>T</em> = <em>B</em> = {formatPdValue(T)}<br />
          <em>R</em> = <em>B</em> − <em>C</em> = {formatPdValue(R)}<br />
          <em>P</em> = {formatPdValue(P)}<br />
          <em>S</em> = −<em>C</em> = {formatPdValue(S)}
        </div>
        <div className="pl-0.5 leading-relaxed flex items-center gap-1.5">
          <strong className="text-white font-semibold">T &gt; R &gt; P &gt; S and <em className="text-white">B</em> &gt; <em className="text-white">C</em></strong>
          <span aria-hidden>{pdInequalitiesHold ? '✅' : '❌'}</span>
        </div>
      </div>
      <div className="flex justify-center mb-2">
        <button
          type="button"
          onClick={handleReset}
          className="btn-interactive px-2 py-1 text-xs font-medium rounded bg-slate-600 hover:bg-slate-500 text-white transition-colors duration-150"
        >
          Reset
        </button>
      </div>
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col className="w-20" />
            <col className="w-auto" />
            <col className="w-24" />
          </colgroup>
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-2 py-1.5 text-left font-medium">Param</th>
              <th className="px-2 py-1.5 text-left font-medium">What it does</th>
              <th className="px-2 py-1.5 text-left font-medium">Value</th>
            </tr>
          </thead>
          <tbody>
            {STAGE6_EDITABLE_PARAMS.map(({ key, label, description, step, min, max }) => {
              const value = params[key] ?? DEFAULT_PARAMS[key];
              const displayValue = formatParamValue(value, key);
              const rawValue = editing[key] ?? displayValue;
              return (
                <tr key={key} className="border-t border-slate-700">
                  <td className="px-2 py-1.5 text-slate-200 font-medium">{label}</td>
                  <td className="px-2 py-1.5 text-white">{description}</td>
                  <td className="px-2 py-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={rawValue}
                      onChange={(e) => {
                        const sanitized = sanitizeNumericInput(e.target.value, false);
                        setEditing((prev) => ({ ...prev, [key]: sanitized }));
                        const v = Number(sanitized);
                        if (sanitized !== '' && !Number.isNaN(v)) {
                          const clamped = Math.min(max, Math.max(min, v));
                          onParamChange(key, clamped);
                        }
                      }}
                      onBlur={() => {
                        setEditing((prev) => ({ ...prev, [key]: undefined }));
                      }}
                      className="w-full min-w-[4.5rem] bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-white text-xs tabular-nums"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ParametersTable({
  parameters,
  colWidth = 'w-28',
}: {
  parameters: { param: string; description: string }[];
  colWidth?: string;
}) {
  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Parameters</h3>
      <div className="rounded-lg border border-slate-700 overflow-hidden">
        <table className="w-full text-xs table-fixed">
          <colgroup>
            <col className={colWidth} />
            <col className="w-auto" />
          </colgroup>
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="px-2 py-1.5 text-left font-medium">Param</th>
              <th className="px-2 py-1.5 text-left font-medium">What it does</th>
            </tr>
          </thead>
          <tbody>
            {parameters.map(({ param, description }) => (
              <tr key={param} className="border-t border-slate-700">
                <td className="px-2 py-1.5 text-slate-200 font-medium">{param}</td>
                <td className="px-2 py-1.5 text-white">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stage5KeyTakeaway() {
  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-72 z-10 max-h-[85vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-3 text-center">💡 Observations</h3>
      <ul className="rounded-lg border border-slate-700 bg-slate-800/90 px-3 py-3 space-y-2 list-disc list-inside text-white text-xs leading-relaxed">
        <li>
          <strong className="text-slate-200">Tags are independent of strategy.</strong> The population by color does not change as drastically as the population by strategy. The tags are essentially meaningless. 
        </li>
        <li>
          <strong className="text-slate-200">Ethnocentrism dominates.</strong> Notice how clusters form for each color, where almost all Pips eventually have black dots (the ethnocentric markers).
        </li>
        <li>
          <strong className="text-slate-200">Self-Sustaining Clusters.</strong> Once a tag-based group forms, they support their own kind and resist "invasion" from other strategies, regardless of the tag's meaning.
        </li>
        <li>
          <strong className="text-slate-200">The Power of Visibility.</strong> Because Pips can see tags but not strategies, they use color as a proxy for trust, creating the "us vs. them" dynamic you see on the grid.
        </li>
      </ul>
    </div>
  );
}

function Stage3CasePanel({ selectedCaseId }: { selectedCaseId: ClashCaseId }) {
  const selectedCase = CLASH_CASES.find((c) => c.id === selectedCaseId) ?? CLASH_CASES[0];
  return (
    <div className="absolute right-12 top-1/2 -translate-y-1/2 w-64 z-10 max-h-[85vh] overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-2 text-center">Case</h3>
      <div className="rounded-lg border border-slate-700 bg-slate-800/90 overflow-hidden space-y-0">
        <div className="px-3 py-2 border-b border-slate-700">
          <h4 className="text-xs font-semibold text-white mb-1">What happens</h4>
          <p className="text-white text-xs leading-relaxed">{selectedCase.whatHappens}</p>
        </div>
        <div className="px-3 py-2">
          <h4 className="text-xs font-semibold text-white mb-1">What this demonstrates</h4>
          <p className="text-white text-xs leading-relaxed">{selectedCase.implication}</p>
        </div>
      </div>
    </div>
  );
}

export function ParametersPanel({
  stage,
  stage1RevealedCells,
  stage3CaseId,
  onStage3CaseChange,
  stage6Params,
  onStage6ParamsChange,
}: {
  stage: number;
  stage1RevealedCells?: Set<Stage1MatrixCell>;
  stage3CaseId?: ClashCaseId;
  onStage3CaseChange?: (id: ClashCaseId) => void;
  stage6Params?: SimulationParams;
  onStage6ParamsChange?: (params: SimulationParams | ((prev: SimulationParams) => SimulationParams)) => void;
}) {
  if (stage === 1) {
    return <PayoffMatrix revealedCells={stage1RevealedCells} />;
  }
  if (stage === 2) {
    return <ParametersTable parameters={STAGE2_PARAMETERS} />;
  }
  if (stage === 3 && stage3CaseId !== undefined) {
    return <Stage3CasePanel selectedCaseId={stage3CaseId} />;
  }
  if (stage === 4) {
    return <ParametersTable parameters={STAGE4_PARAMETERS} />;
  }
  if (stage === 5) {
    return <Stage5KeyTakeaway />;
  }
  if (stage === 6 && stage6Params !== undefined && onStage6ParamsChange) {
    return (
      <EditableParametersTable
        params={stage6Params}
        onParamChange={(key, value) => {
          onStage6ParamsChange((prev) => ({ ...prev, [key]: value }));
        }}
        onReset={() => onStage6ParamsChange({ ...DEFAULT_PARAMS })}
      />
    );
  }
  return null;
}
