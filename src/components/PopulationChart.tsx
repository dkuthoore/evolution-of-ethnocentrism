import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { HistoryEntry } from '../hooks/useSimulation';
import { PHENOTYPE_COLORS } from '../lib/pipRenderer';

interface PopulationChartProps {
  history: HistoryEntry[];
  height?: number;
}

export function PopulationChart({ history, height = 200 }: PopulationChartProps) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={history}
          margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="generation"
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
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => (
              <span className="text-slate-300 capitalize">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="ethnocentric"
            stackId="1"
            stroke={PHENOTYPE_COLORS.ethnocentric}
            fill={PHENOTYPE_COLORS.ethnocentric}
            fillOpacity={0.7}
            name="Ethnocentric"
          />
          <Area
            type="monotone"
            dataKey="altruist"
            stackId="1"
            stroke={PHENOTYPE_COLORS.altruist}
            fill={PHENOTYPE_COLORS.altruist}
            fillOpacity={0.7}
            name="Altruist"
          />
          <Area
            type="monotone"
            dataKey="egoist"
            stackId="1"
            stroke={PHENOTYPE_COLORS.egoist}
            fill={PHENOTYPE_COLORS.egoist}
            fillOpacity={0.7}
            name="Egoist"
          />
          <Area
            type="monotone"
            dataKey="traitor"
            stackId="1"
            stroke={PHENOTYPE_COLORS.traitor}
            fill={PHENOTYPE_COLORS.traitor}
            fillOpacity={0.7}
            name="Traitor"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
