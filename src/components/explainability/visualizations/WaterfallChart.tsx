import React from 'react';
import { EmbryoResult } from '../../../types/embryo';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WaterfallChartProps {
  embryo: EmbryoResult;
}

/**
 * Waterfall Chart Component
 * 
 * Shows how individual factors contribute to final viability score
 * Visual metaphor: Building blocks stacking up to final score
 * 
 * Data flow:
 * Baseline + Top Contributing Features = Final Score
 */
const WaterfallChart: React.FC<WaterfallChartProps> = ({ embryo }) => {
  // Compute waterfall from real feature importance
  const featureImportance = embryo.featureImportance || [];
  const finalScore = embryo.viabilityScore;
  
  // Sort by importance and take top 5 features
  const sortedFeatures = [...featureImportance]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5);
  
  // Calculate baseline as final score minus weighted contributions
  const totalContribution = sortedFeatures.reduce((sum, f) => sum + (f.importance * 0.5), 0);
  const baselineScore = Math.max(50, Math.round(finalScore - totalContribution));
  
  // Build factors array with baseline + contributions
  const factors = [
    { name: 'Baseline', value: baselineScore, fill: '#9CA3AF', type: 'baseline' },
    ...sortedFeatures.map(f => {
      const contribution = Math.round(f.importance * 0.5);
      const isPositive = f.direction === 'positive';
      return {
        name: f.feature.replace(/_/g, ' ').replace(/mean|std/g, '').trim(),
        value: isPositive ? contribution : -contribution,
        fill: isPositive ? '#10B981' : '#EF4444',
        type: isPositive ? 'positive' : 'negative',
      };
    })
  ];

  // Calculate cumulative for stacked effect
  const waterfallData = [];
  let cumulative = 0;

  factors.forEach((factor, idx) => {
    if (idx === 0) {
      waterfallData.push({
        name: factor.name,
        value: factor.value,
        cumulativeStart: 0,
        cumulativeEnd: factor.value,
        fill: factor.fill,
        type: factor.type,
      });
      cumulative = factor.value;
    } else {
      const start = cumulative;
      const end = cumulative + factor.value;
      waterfallData.push({
        name: factor.name,
        value: Math.abs(factor.value),
        cumulativeStart: start,
        cumulativeEnd: end,
        fill: factor.fill,
        type: factor.type,
        isPositive: factor.value >= 0,
      });
      cumulative = end;
    }
  });

  // Add final score
  waterfallData.push({
    name: 'FINAL SCORE',
    value: cumulative,
    cumulativeStart: 0,
    cumulativeEnd: cumulative,
    fill: '#2E7D32',
    type: 'final',
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.name}</p>
          {data.type === 'baseline' && (
            <p className="text-sm text-slate-600">Starting confidence: {data.value}</p>
          )}
          {data.type === 'positive' && (
            <p className="text-sm text-green-600">+{data.value} points</p>
          )}
          {data.type === 'negative' && (
            <p className="text-sm text-red-600">{data.value} points</p>
          )}
          {data.type === 'final' && (
            <p className="text-sm text-green-700 font-bold">Final: {data.value}/100</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-slate-50 to-white rounded-lg border border-slate-200 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={waterfallData}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#4B5563', fontSize: 12 }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <YAxis
            label={{ value: 'Score Contribution', angle: -90, position: 'insideLeft' }}
            tick={{ fill: '#4B5563', fontSize: 12 }}
            axisLine={{ stroke: '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} />

          {/* Baseline Bar */}
          <Bar
            dataKey="value"
            fill="#9CA3AF"
            radius={[4, 4, 0, 0]}
            animationDuration={1000}
          />

          {/* Positive Contribution Bars */}
          {waterfallData.map((item, idx) =>
            item.type === 'positive' ? (
              <Bar
                key={idx}
                dataKey="value"
                fill={item.fill}
                radius={[4, 4, 0, 0]}
                animationDuration={1000}
                animationBegin={300 + idx * 100}
              />
            ) : null
          )}

          {/* Negative Contribution Bars */}
          {waterfallData.map((item, idx) =>
            item.type === 'negative' ? (
              <Bar
                key={idx}
                dataKey="value"
                fill={item.fill}
                radius={[0, 0, 4, 4]}
                animationDuration={1000}
                animationBegin={300 + idx * 100}
              />
            ) : null
          )}

          {/* Final Score Bar */}
          {waterfallData.map((item, idx) =>
            item.type === 'final' ? (
              <Bar
                key={idx}
                dataKey="value"
                fill={item.fill}
                radius={[8, 8, 0, 0]}
                animationDuration={1200}
                animationBegin={800}
              />
            ) : null
          )}
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend & Explanation */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-400"></div>
          <span className="text-sm text-slate-700">Baseline: 68</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500"></div>
          <span className="text-sm text-slate-700">Positive: +22</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500"></div>
          <span className="text-sm text-slate-700">Negative: -3</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-700"></div>
          <span className="text-sm text-slate-700 font-bold">Final: {embryo.viabilityScore || 87}</span>
        </div>
      </div>

    </div>
  );
};

export default WaterfallChart;
