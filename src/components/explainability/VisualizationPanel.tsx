import React from 'react';
import { EmbryoResult } from '../../types/embryo';
import WaterfallChart from './visualizations/WaterfallChart';
import FeatureAttributionChart from './visualizations/FeatureAttributionChart';
import MorphometryMetrics from './visualizations/MorphometryMetrics';

interface VisualizationPanelProps {
  embryo: EmbryoResult;
  activeTab: string;
}

/**
 * Dynamic Visualization Panel
 * Renders different visualizations based on active tab
 * Supports: Summary (Waterfall), Morphometry, Feature Attribution, Decision Path
 */
const VisualizationPanel: React.FC<VisualizationPanelProps> = ({
  embryo,
  activeTab,
}) => {
  return (
    <div className="w-full h-full animate-fadeIn">
      {/* Summary Tab: Waterfall Chart */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Score Breakdown</h2>
            <p className="text-sm text-slate-600 mb-6">
              How individual morphological factors contributed to the final viability score of{' '}
              <span className="font-bold text-green-700">{embryo.viabilityScore}/100</span>
            </p>
          </div>
          <WaterfallChart embryo={embryo} />
        </div>
      )}

      {/* Morphometry Tab: Detailed Metrics */}
      {activeTab === 'morphometry' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Morphological Measurements</h2>
            <p className="text-sm text-slate-600 mb-6">
              Detailed morphometry analysis and quality metrics for this embryo
            </p>
          </div>
          <MorphometryMetrics embryo={embryo} />
        </div>
      )}

      {/* Feature Attribution Tab: Model Explainability */}
      {activeTab === 'attribution' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Key Contributing Factors</h2>
            <p className="text-sm text-slate-600 mb-6">
              Ranked importance of morphological characteristics that influenced the AI assessment
            </p>
          </div>
          <FeatureAttributionChart embryo={embryo} />
        </div>
      )}

      {/* Report Tab: PDF Export Preparation */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Generate Embryologist Report</h2>
            <p className="text-sm text-slate-600 mb-6">
              Prepare and export a comprehensive clinical report with all analysis metrics and recommendations
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
                ℹ
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">PDF Report Ready</h3>
                <p className="text-sm text-blue-800 mt-1">
                  Click the "Generate Report" button in the right panel to create a comprehensive PDF with all metrics, embeddings, and clinical recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Report Preview */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Report Contents</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Viability Score & Gardner Grade Summary
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Morphological Metrics (Circularity, Fragmentation, Boundary)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Feature Attribution Rankings
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Ensemble Model Agreement & Confidence Intervals
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Clinical Recommendation (Proceed/Freeze/Discard)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Analysis Timestamp & Model Version
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-600"></span>
                Audit Trail & QC Checklist
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
};

export default VisualizationPanel;
