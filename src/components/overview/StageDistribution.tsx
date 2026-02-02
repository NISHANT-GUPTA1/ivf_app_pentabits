import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from 'recharts';
import type { EmbryoResult } from '../../types/embryo';

interface StageDistributionProps {
  embryoData: EmbryoResult[];
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="font-bold text-xl">
        {value}
      </text>
      <text x={cx} y={cy + 15} dy={8} textAnchor="middle" fill="#666" className="text-sm">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg"
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

export function StageDistribution({ embryoData }: StageDistributionProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  // Filter out placeholder embryos
  const realEmbryos = embryoData.filter(e => e.id !== 'placeholder-embryo');
  
  // Show empty state if no real embryos
  if (realEmbryos.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Embryo Stage Distribution</h3>
        <div className="flex flex-col items-center justify-center h-[220px] text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">No embryo data available</p>
          <p className="text-xs text-gray-500 mt-1">Upload embryos to see stage distribution</p>
        </div>
      </div>
    );
  }
  
  const stageCounts = realEmbryos.reduce((acc, embryo) => {
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
  const totalEmbryos = data.reduce((sum, entry) => sum + entry.value, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center justify-between">
        <span>Embryo Stage Distribution</span>
        <span className="text-xs text-gray-500 font-normal">Total: {totalEmbryos}</span>
      </h3>
      
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            onMouseEnter={onPieEnter}
            animationBegin={0}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((_, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              />
            ))}
          </Pie>
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value, entry: any) => {
              const percentage = ((entry.payload.value / totalEmbryos) * 100).toFixed(1);
              return (
                <span className="text-xs text-gray-700 font-medium">
                  {value} <span className="text-gray-500">({entry.payload.value} - {percentage}%)</span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
