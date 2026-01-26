import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface ComparisonMetricsProps {
  embryoData: EmbryoResult[];
}

export function ComparisonMetrics({ embryoData }: ComparisonMetricsProps) {
  const data = embryoData.map((embryo, index) => {
    const symmetryScore = embryo.features.symmetry === 'Excellent' ? 95 :
                         embryo.features.symmetry === 'Good' ? 80 :
                         embryo.features.symmetry === 'Fair' ? 60 : 40;
    
    const fragScore = 100 - parseInt(embryo.features.fragmentation.match(/\d+/)?.[0] || '0');

    return {
      name: `E${index + 1}`,
      viability: embryo.viabilityScore,
      symmetry: symmetryScore,
      fragmentation: fragScore
    };
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="font-medium text-gray-900 mb-4">Comparative Metrics Analysis</h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="viability" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Viability Score" />
          <Bar dataKey="symmetry" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Symmetry Score" />
          <Bar dataKey="fragmentation" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Quality Index" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
