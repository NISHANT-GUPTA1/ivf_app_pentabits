import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface QualityTrendsProps {
  embryoData: EmbryoResult[];
}

export function QualityTrends({ embryoData }: QualityTrendsProps) {
  if (embryoData.length === 0) {
    return null;
  }
  
  const data = embryoData.map((embryo, index) => ({
    name: `E${index + 1}`,
    viability: embryo.viabilityScore,
    symmetry: embryo.features.symmetry === 'Excellent' ? 95 : 
              embryo.features.symmetry === 'Good' ? 80 :
              embryo.features.symmetry === 'Fair' ? 60 : 40
  }));

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Quality Metrics Trends</h3>
      
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
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
          />
          <Line 
            type="monotone" 
            dataKey="viability" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Viability"
          />
          <Line 
            type="monotone" 
            dataKey="symmetry" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 4 }}
            name="Symmetry"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
