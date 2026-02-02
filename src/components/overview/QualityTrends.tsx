import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface QualityTrendsProps {
  embryoData: EmbryoResult[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-fade-in">
        <p className="text-xs font-semibold text-gray-900 mb-2">{payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-700">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function QualityTrends({ embryoData }: QualityTrendsProps) {
  const data = embryoData.map((embryo, index) => ({
    name: `E${index + 1}`,
    viability: embryo.viabilityScore,
    symmetry: embryo.features.symmetry === 'Excellent' ? 95 : 
              embryo.features.symmetry === 'Good' ? 80 :
              embryo.features.symmetry === 'Fair' ? 60 : 40
  }));

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Quality Metrics Trends</h3>
      
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
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
          <Line 
            type="monotone" 
            dataKey="viability" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', className: 'animate-pulse' }}
            name="Viability"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
          <Line 
            type="monotone" 
            dataKey="symmetry" 
            stroke="#06b6d4" 
            strokeWidth={3}
            dot={{ fill: '#06b6d4', r: 5, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', className: 'animate-pulse' }}
            name="Symmetry"
            animationDuration={1000}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
