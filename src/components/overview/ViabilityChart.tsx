import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface ViabilityChartProps {
  embryoData: EmbryoResult[];
  selectedEmbryo: EmbryoResult | null;
}

export function ViabilityChart({ embryoData, selectedEmbryo }: ViabilityChartProps) {
  const data = embryoData.map((embryo, index) => ({
    name: `E${index + 1}`,
    score: embryo.viabilityScore,
    id: embryo.id
  }));

  const getBarColor = (score: number, isSelected: boolean) => {
    if (isSelected) return '#1e40af';
    if (score >= 80) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Viability Score by Embryo</h3>
      
      <ResponsiveContainer width="100%" height={282.5}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
            domain={[0, 100]}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number) => [`${value}%`, 'Viability']}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell 
                key={entry.id} 
                fill={getBarColor(entry.score, selectedEmbryo ? entry.id === selectedEmbryo.id : false)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-600">High (≥80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span className="text-gray-600">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600">Low</span>
        </div>
      </div>
    </div>
  );
}
