import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { HistoryEntry } from '../hooks/useSimulation';
import { STRATEGY_COLORS } from '../lib/constants';

interface PopulationChartProps {
  history: HistoryEntry[];
  /** Pixel height or '100%' to fill the parent (parent must have a defined height) */
  height?: number | '100%';
}

export function PopulationChart({ history, height = 200 }: PopulationChartProps) {
  const maxGen = history.length > 0 ? history[history.length - 1]!.generation : 0;
  const xDomain: [number, number] = [0, maxGen];
  const useFullHeight = height === '100%';

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
          <Tooltip
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
            }}
            labelFormatter={(v) => `Generation ${v}`}
            formatter={(value: number, name: string) => [value, name]} 
          />
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
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
