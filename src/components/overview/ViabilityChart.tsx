import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface ViabilityChartProps {
  embryoData: EmbryoResult[];
  selectedEmbryo: EmbryoResult | null;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const getStatusColor = (score: number) => {
      if (score >= 80) return 'text-green-600';
      if (score >= 70) return 'text-blue-600';
      if (score >= 50) return 'text-amber-600';
      return 'text-red-600';
    };
    
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-fade-in">
        <p className="text-xs font-semibold text-gray-900 mb-1">{payload[0].payload.name}</p>
        <p className={`text-sm font-bold ${getStatusColor(score)}`}>{score}% Viability</p>
      </div>
    );
  }
  return null;
};

export function ViabilityChart({ embryoData, selectedEmbryo }: ViabilityChartProps) {
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  const data = embryoData.map((embryo, index) => ({
    name: `E${index + 1}`,
    score: embryo.viabilityScore,
    id: embryo.id
  }));

  const getBarColor = (score: number, isSelected: boolean, isHovered: boolean) => {
    if (isSelected) return '#1e40af';
    if (isHovered) {
      if (score >= 80) return '#16a34a';
      if (score >= 70) return '#2563eb';
      if (score >= 50) return '#d97706';
      return '#dc2626';
    }
    if (score >= 80) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Viability Score by Embryo</h3>
      
      <ResponsiveContainer width="100%" height={282.5}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
            axisLine={{ strokeWidth: 1 }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            stroke="#d1d5db"
            domain={[0, 100]}
            axisLine={{ strokeWidth: 1 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="score" 
            radius={[8, 8, 0, 0]}
            animationDuration={1000}
            animationEasing="ease-out"
            onMouseEnter={(data) => setHoveredBar(data.id)}
            onMouseLeave={() => setHoveredBar(null)}
          >
            {data.map((entry) => (
              <Cell 
                key={entry.id} 
                fill={getBarColor(
                  entry.score, 
                  selectedEmbryo ? entry.id === selectedEmbryo.id : false,
                  hoveredBar === entry.id
                )}
                className="cursor-pointer transition-all duration-200 hover:opacity-90"
                style={{ filter: hoveredBar === entry.id ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : 'none' }}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-green-500 rounded shadow-sm"></div>
          <span className="text-gray-600 font-medium">High (≥80%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-amber-500 rounded shadow-sm"></div>
          <span className="text-gray-600 font-medium">Moderate</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-red-500 rounded shadow-sm"></div>
          <span className="text-gray-600 font-medium">Low</span>
        </div>
      </div>
    </div>
  );
}
