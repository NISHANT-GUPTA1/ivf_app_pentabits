import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface QualityMetricsChartProps {
  embryoData: EmbryoResult[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 animate-fade-in">
        <p className="text-xs font-semibold text-gray-900 mb-2">{payload[0].payload.name}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
            <span className="text-gray-700">{entry.name}:</span>
            <span className="font-bold text-gray-900">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function QualityMetricsChart({ embryoData }: QualityMetricsChartProps) {
  // Filter out placeholder embryos
  const realEmbryos = embryoData.filter(e => e.id !== 'placeholder-embryo');
  
  // Show empty state if no real embryos
  if (realEmbryos.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Inner Cell Mass & Trophectoderm Quality
        </h3>
        <div className="flex flex-col items-center justify-center h-[282.5px] text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No embryo data available</p>
          <p className="text-xs text-gray-500 mt-1">Upload embryos to see quality metrics</p>
        </div>
      </div>
    );
  }
  
  // Use real-time data from comprehensiveAnalysis if available, otherwise fallback
  const data = realEmbryos.map((embryo, index) => {
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

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Inner Cell Mass & Trophectoderm Quality
      </h3>
      
      <ResponsiveContainer width="100%" height={282.5}>
        <BarChart data={data}>
          <defs>
            <linearGradient id="icmGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.7}/>
            </linearGradient>
            <linearGradient id="teGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1}/>
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.7}/>
            </linearGradient>
          </defs>
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
          <Legend 
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', fontWeight: 500 }}
          />
          <Bar 
            dataKey="ICM" 
            fill="url(#icmGradient)" 
            radius={[8, 8, 0, 0]} 
            name="Inner Cell Mass"
            animationDuration={1000}
            animationEasing="ease-out"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
          <Bar 
            dataKey="TE" 
            fill="url(#teGradient)" 
            radius={[8, 8, 0, 0]} 
            name="Trophectoderm"
            animationDuration={1000}
            animationEasing="ease-out"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
