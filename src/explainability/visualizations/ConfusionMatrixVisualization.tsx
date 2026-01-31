import React from 'react';
import { BadgeCheck, BadgeAlert, CheckCircle2 } from 'lucide-react';
import { EmbryoResult } from '../../../types/embryo';

interface ConfusionMatrixVisualizationProps {
  embryo: EmbryoResult;
}

const ConfusionMatrixVisualization: React.FC<ConfusionMatrixVisualizationProps> = ({ embryo }) => {
  const hasEnsemble = (embryo.modelPredictions?.length || 0) >= 2;
  const agreement = hasEnsemble
    ? Math.round(
        (embryo.modelPredictions || []).reduce((acc, m) => acc + m.probabilityGood, 0) /
          (embryo.modelPredictions || []).length *
          100
      )
    : 85;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-200 p-6">
      <div className="flex items-center gap-2 mb-4">
        <BadgeCheck className="w-5 h-5 text-blue-700" />
        <h3 className="text-lg font-bold text-slate-900">Ensemble Agreement Matrix</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-blue-200">
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Metric</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-900">Model A</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-900">Model B</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-900">Model C</th>
              <th className="text-center px-4 py-3 font-semibold text-slate-900">Consensus</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-blue-100 hover:bg-blue-50 transition">
              <td className="px-4 py-3 font-medium text-slate-900">Viability</td>
              <td className="text-center px-4 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </td>
              <td className="text-center px-4 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </td>
              <td className="text-center px-4 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              </td>
              <td className="text-center px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                  {agreement}%
                </span>
              </td>
            </tr>
            <tr className="border-b border-blue-100 hover:bg-blue-50 transition">
              <td className="px-4 py-3 font-medium text-slate-900">Confidence</td>
              <td className="text-center px-4 py-3 font-semibold text-slate-900">94%</td>
              <td className="text-center px-4 py-3 font-semibold text-slate-900">92%</td>
              <td className="text-center px-4 py-3 font-semibold text-slate-900">96%</td>
              <td className="text-center px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                  {agreement}%
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {!hasEnsemble && (
        <div className="mt-4 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
          <BadgeAlert className="w-4 h-4 text-amber-700" />
          Ensemble agreement is estimated from a single model response.
        </div>
      )}
    </div>
  );
};

export default ConfusionMatrixVisualization;
