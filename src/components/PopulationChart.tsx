import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryEntry } from '../hooks/useSimulation';
import { STRATEGY_COLORS, TAG_COLORS, TAG_LABELS } from '../lib/constants';

interface PopulationChartProps {
  history: HistoryEntry[];
  /** Pixel height or '100%' to fill the parent (parent must have a defined height) */
  height?: number | '100%';
  /** When true, overlay tag counts as lines (e.g. Stage 5). */
  showTagOverlay?: boolean;
}

export function PopulationChart({ history, height = 200, showTagOverlay = false }: PopulationChartProps) {
  const maxGen = history.length > 0 ? history[history.length - 1]!.generation : 0;
  const xDomain: [number, number] = [0, maxGen];
  const useFullHeight = height === '100%';
  const tagKeys = ['tag0', 'tag1', 'tag2', 'tag3'] as const;

  return (
    <div
      className={`w-full ${useFullHeight ? 'h-full' : ''}`}
      style={useFullHeight ? undefined : { height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={history}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="generation"
            type="number"
            domain={xDomain}
            allowDataOverflow
            stroke="#94a3b8"
            fontSize={11}
            tickFormatter={(v) => `Gen ${v}`}
          />
          <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => v} />
          <Area
            type="monotone"
            dataKey="ethnocentric"
            stackId="1"
            stroke={STRATEGY_COLORS.ethnocentric}
            fill={STRATEGY_COLORS.ethnocentric}
            fillOpacity={0.7}
            name="Ethnocentrist"
          />
          <Area
            type="monotone"
            dataKey="altruist"
            stackId="1"
            stroke={STRATEGY_COLORS.altruist}
            fill={STRATEGY_COLORS.altruist}
            fillOpacity={0.7}
            name="Altruist"
          />
          <Area
            type="monotone"
            dataKey="egoist"
            stackId="1"
            stroke={STRATEGY_COLORS.egoist}
            fill={STRATEGY_COLORS.egoist}
            fillOpacity={0.7}
            name="Egoist"
          />
          <Area
            type="monotone"
            dataKey="traitor"
            stackId="1"
            stroke={STRATEGY_COLORS.traitor}
            fill={STRATEGY_COLORS.traitor}
            fillOpacity={0.7}
            name="Traitor"
          />
          {showTagOverlay && tagKeys.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={TAG_COLORS[i]}
              strokeWidth={2}
              dot={false}
              name={TAG_LABELS[i]}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
