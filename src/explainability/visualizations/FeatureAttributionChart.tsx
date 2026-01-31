import React from 'react';
import { EmbryoResult } from '../../../types/embryo';
import { Badge } from '../../ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Info } from 'lucide-react';
import ConfusionMatrixVisualization from './ConfusionMatrixVisualization';

interface FeatureAttributionChartProps {
  embryo: EmbryoResult;
}

/**
 * Feature Attribution Chart Component
 * 
 * Horizontal bar chart showing ranked feature importance
 * Top-10 features displayed in descending order
 * Color-coded: green for positive contributors, red for negative
 */
const FeatureAttributionChart: React.FC<FeatureAttributionChartProps> = ({ embryo }) => {
  const featureLabelMap: Record<string, string> = {
    std_dev_mean: 'Intensity Variance',
    mean_intensity_mean: 'Mean Intensity',
    contrast_mean: 'Contrast',
    entropy_mean: 'Texture Entropy',
    edge_density_mean: 'Edge Density',
    gradient_magnitude_mean: 'Gradient Magnitude',
    circularity_mean: 'Circularity Index',
    num_regions_mean: 'Region Count',
    frame_number: 'Frame Number',
    time_elapsed: 'Time Elapsed',
    frames_analyzed: 'Frames Analyzed',
    total_duration: 'Total Duration'
  };

  const featureImportance = (embryo.featureImportance || [
    { feature: 'Circularity Index', importance: 94, direction: 'positive' },
    { feature: 'Fragmentation Rate', importance: 78, direction: 'positive' },
    { feature: 'Nucleus Symmetry', importance: 68, direction: 'positive' },
    { feature: 'Boundary Regularity', importance: 65, direction: 'positive' },
    { feature: 'Mean Intensity', importance: 58, direction: 'neutral' },
    { feature: 'Texture Entropy', importance: 52, direction: 'positive' },
    { feature: 'Cell Count', importance: 48, direction: 'positive' },
    { feature: 'Edge Density', importance: 44, direction: 'neutral' },
    { feature: 'Gradient Magnitude', importance: 38, direction: 'positive' },
    { feature: 'Contrast Ratio', importance: 32, direction: 'neutral' },
  ]).map((item) => ({
    name: featureLabelMap[item.feature] || item.feature,
    importance: item.importance,
    direction: item.direction,
  }));

  const getColor = (direction: string) => {
    switch (direction) {
      case 'positive':
        return '#10B981';
      case 'negative':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.name}</p>
          <p className="text-sm text-slate-600">
            Impact: <span className="font-bold text-slate-900">{data.importance}%</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {data.direction === 'positive'
              ? 'Positive contributor'
              : data.direction === 'negative'
              ? 'Negative contributor'
              : 'Neutral factor'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Feature Importance Bar Chart */}
      <div className="bg-gradient-to-br from-slate-50 to-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Top 10 Features by Impact</h3>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={featureImportance}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 180, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: '#4B5563', fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={175} tick={{ fill: '#4B5563', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="importance"
                radius={[0, 8, 8, 0]}
                animationDuration={1000}
                isAnimationActive={true}
              >
                {featureImportance.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.direction)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-slate-700">Positive Contributor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-slate-700">Negative Contributor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-400"></div>
            <span className="text-sm text-slate-700">Neutral Factor</span>
          </div>
        </div>
      </div>

      {/* Ensemble Model Agreement Matrix */}
      <ConfusionMatrixVisualization embryo={embryo} />

      {/* Info Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-sm text-amber-900">
          <p className="font-semibold">Feature Attribution Note</p>
          <p className="mt-1">
            {embryo.explainabilityNote ||
              "These rankings show which morphological features had the strongest influence on the AI's final prediction. Features at the top are the primary drivers of the viability score."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeatureAttributionChart;
