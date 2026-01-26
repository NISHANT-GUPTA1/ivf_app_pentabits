import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface StageDistributionProps {
  embryoData: EmbryoResult[];
}

export function StageDistribution({ embryoData }: StageDistributionProps) {
  const stageCounts = embryoData.reduce((acc, embryo) => {
    const stage = embryo.features.developmentalStage;
    if (stage.includes('Blastocyst')) {
      acc.Blastocyst = (acc.Blastocyst || 0) + 1;
    } else if (stage.includes('8-cell')) {
      acc.Cleavage = (acc.Cleavage || 0) + 1;
    } else {
      acc.Morula = (acc.Morula || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(stageCounts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6'];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Embryo Stage Distribution</h3>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => (
              <span className="text-sm text-gray-700">
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
