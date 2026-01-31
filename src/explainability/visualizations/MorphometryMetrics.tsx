import React from 'react';
import { EmbryoResult } from '../../../types/embryo';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MorphometryMetricsProps {
  embryo: EmbryoResult;
}

/**
 * Morphometry Metrics Component
 * 
 * Displays detailed morphological measurements:
 * - Circularity Index (0-100)
 * - Fragmentation Percentage (0-100)
 * - Boundary Integrity Score
 * - Optional: Time-series trends if video uploaded
 */
const MorphometryMetrics: React.FC<MorphometryMetricsProps> = ({ embryo: _embryo }) => {
  // Mock morphometry data
  const metrics = [
    {
      name: 'Circularity Index',
      value: 92,
      max: 100,
      interpretation: 'Excellent',
      description: 'Nucleus and cell shape are optimally round and well-defined',
      color: '#10B981',
    },
    {
      name: 'Fragmentation',
      value: 8,
      max: 100,
      interpretation: 'Minimal',
      description: 'Very low cell damage detected - excellent cytoplasm quality',
      color: '#10B981',
    },
    {
      name: 'Boundary Integrity',
      value: 78,
      max: 100,
      interpretation: 'Good',
      description: 'Regular outline with even borders - normal membrane health',
      color: '#10B981',
    },
    {
      name: 'Symmetry',
      value: 85,
      max: 100,
      interpretation: 'Excellent',
      description: 'Balanced blastomere distribution - uniform development',
      color: '#10B981',
    },
  ];

  // Mock time-series data for video analysis (if applicable)
  const timeSeriesData = [
    { frame: 'Frame 1', circularity: 82, fragmentation: 15, boundary: 72 },
    { frame: 'Frame 2', circularity: 84, fragmentation: 12, boundary: 74 },
    { frame: 'Frame 3', circularity: 88, fragmentation: 10, boundary: 76 },
    { frame: 'Frame 4', circularity: 91, fragmentation: 9, boundary: 77 },
    { frame: 'Frame 5', circularity: 92, fragmentation: 8, boundary: 78 },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900">{data.frame || data.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getMetricBadgeColor = (interpretation: string) => {
    const mapping: { [key: string]: string } = {
      'Excellent': 'bg-green-100 text-green-700',
      'Good': 'bg-blue-100 text-blue-700',
      'Fair': 'bg-amber-100 text-amber-700',
      'Minimal': 'bg-green-100 text-green-700',
    };
    return mapping[interpretation] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow animate-fadeIn"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900">{metric.name}</h3>
                <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getMetricBadgeColor(metric.interpretation)}`}>
                  {metric.interpretation}
                </span>
              </div>

              {/* Score Display */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold" style={{ color: metric.color }}>
                    {metric.value}
                  </span>
                  <span className="text-sm text-slate-600">/ {metric.max}</span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${(metric.value / metric.max) * 100}%`,
                      backgroundColor: metric.color,
                    }}
                  ></div>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-600">{metric.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Time-Series Analysis (if video uploaded) */}
      <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">Morphometry Trends (Video Analysis)</h3>
        <p className="text-sm text-slate-600 mb-6">Tracking morphological changes across 5 frames</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Circularity Trend */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Circularity Trend: ↗ Improving</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="frame" tick={{ fontSize: 11 }} />
                  <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="circularity"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: '#10B981', r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-slate-600">
              Frame 1: 82% → Frame 5: 92% <span className="text-green-700 font-bold">+10%</span>
            </div>
          </div>

          {/* Fragmentation Trend */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Fragmentation Trend: ↘ Decreasing</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="frame" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 25]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="fragmentation"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-slate-600">
              Frame 1: 15% → Frame 5: 8% <span className="text-green-700 font-bold">-7%</span>
            </div>
          </div>

          {/* Boundary Trend */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Boundary Integrity: ↗ Improving</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="frame" tick={{ fontSize: 11 }} />
                  <YAxis domain={[65, 85]} tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="boundary"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 5 }}
                    activeDot={{ r: 7 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-sm text-slate-600">
              Frame 1: 72% → Frame 5: 78% <span className="text-green-700 font-bold">+6%</span>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900">Development Summary</h4>
            <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Overall Trend:</span>
                <span className="font-bold text-green-700">✓ Positive</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Stability:</span>
                <span className="font-bold text-slate-900">Very Good</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="text-slate-700">Quality Improvement:</span>
                <span className="font-bold text-green-700">Progressive</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-green-50 rounded border border-green-200">
                <span className="text-green-900 font-semibold">Development Score:</span>
                <span className="font-bold text-green-700">92/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900">Detailed Morphometry Measurements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-6 py-3 font-semibold text-slate-900">Measurement</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-900">Value</th>
                <th className="text-right px-6 py-3 font-semibold text-slate-900">Normal Range</th>
                <th className="text-center px-6 py-3 font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Mean Intensity', value: '180/255', range: '170-200', status: 'Normal' },
                { name: 'Contrast Ratio', value: '0.72', range: '0.60-0.85', status: 'Normal' },
                { name: 'Texture Entropy', value: '4.2', range: '3.5-5.0', status: 'Normal' },
                { name: 'Cell Count (Blastomeres)', value: '128', range: '100-150', status: 'Normal' },
                { name: 'Edge Density', value: '0.68', range: '0.55-0.75', status: 'Normal' },
              ].map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition">
                  <td className="px-6 py-3 font-medium text-slate-900">{row.name}</td>
                  <td className="text-right px-6 py-3 font-bold text-slate-900">{row.value}</td>
                  <td className="text-right px-6 py-3 text-slate-600">{row.range}</td>
                  <td className="text-center px-6 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default MorphometryMetrics;
