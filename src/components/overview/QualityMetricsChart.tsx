import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface QualityMetricsChartProps {
  embryoData: EmbryoResult[];
}

export function QualityMetricsChart({ embryoData }: QualityMetricsChartProps) {
  // Filter out placeholder embryo
  const realEmbryos = embryoData.filter(e => e.id !== 'placeholder-embryo');
  const hasOnlyPlaceholder = realEmbryos.length === 0;
  
  // Use real-time data from comprehensiveAnalysis if available, otherwise fallback
  const data = hasOnlyPlaceholder ? [
    { name: 'E1', ICM: 0, TE: 0 }
  ] : realEmbryos.map((embryo, index) => {
    // Try to get from comprehensiveAnalysis first (real-time)
    let icmScore = 0;
    let teScore = 0;
    
    console.log(`[QualityMetricsChart] Embryo ${index + 1}:`, embryo);
    console.log(`[QualityMetricsChart] comprehensiveAnalysis:`, embryo.comprehensiveAnalysis);
    
    if (embryo.comprehensiveAnalysis?.blastocyst_grading) {
      const icmGrade = embryo.comprehensiveAnalysis.blastocyst_grading.inner_cell_mass_grade;
      const teGrade = embryo.comprehensiveAnalysis.blastocyst_grading.trophectoderm_grade;
      
      console.log(`[QualityMetricsChart] ICM Grade: ${icmGrade}, TE Grade: ${teGrade}`);
      
      icmScore = icmGrade === 'A' ? 90 : icmGrade === 'B' ? 75 : icmGrade === 'C' ? 55 : 40;
      teScore = teGrade === 'A' ? 90 : teGrade === 'B' ? 75 : teGrade === 'C' ? 55 : 40;
    } else {
      // Fallback to features if comprehensiveAnalysis not available
      console.log(`[QualityMetricsChart] Using fallback features`);
      icmScore = embryo.features.innerCellMass?.includes('A') ? 90 :
                 embryo.features.innerCellMass?.includes('B') ? 75 :
                 embryo.features.innerCellMass?.includes('C') ? 55 : 40;
      
      teScore = embryo.features.trophectoderm?.includes('A') ? 90 :
                embryo.features.trophectoderm?.includes('B') ? 75 :
                embryo.features.trophectoderm?.includes('C') ? 55 : 40;
    }

    return {
      name: `E${index + 1}`,
      ICM: icmScore,
      TE: teScore
    };
  });

  // Only show "no data" message if there's truly no data and no placeholder
  if (data.length === 0 && !hasOnlyPlaceholder) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Inner Cell Mass & Trophectoderm Quality
        </h3>
        <div className="h-[260px] flex items-center justify-center text-sm text-gray-500">
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
