import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface QualityMetricsChartProps {
  embryoData: EmbryoResult[];
}

export function QualityMetricsChart({ embryoData }: QualityMetricsChartProps) {
  const data = embryoData.map((embryo, index) => {
    const icmScore = embryo.features.innerCellMass?.includes('A') ? 90 :
                     embryo.features.innerCellMass?.includes('B') ? 75 :
                     embryo.features.innerCellMass?.includes('C') ? 55 : 0;
    
    const teScore = embryo.features.trophectoderm?.includes('A') ? 90 :
                    embryo.features.trophectoderm?.includes('B') ? 75 :
                    embryo.features.trophectoderm?.includes('C') ? 55 : 0;

    return {
      name: `E${index + 1}`,
      ICM: icmScore,
      TE: teScore
    };
  }).filter(d => d.ICM > 0 || d.TE > 0);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Inner Cell Mass & Trophectoderm Quality
        </h3>
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-500">
          No blastocyst data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Inner Cell Mass & Trophectoderm Quality
      </h3>
      
      <ResponsiveContainer width="100%" height={200}>
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
          />
          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px' }}
          />
          <Bar dataKey="ICM" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Inner Cell Mass" />
          <Bar dataKey="TE" fill="#06b6d4" radius={[4, 4, 0, 0]} name="Trophectoderm" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
