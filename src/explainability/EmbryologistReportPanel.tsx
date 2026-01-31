import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { EmbryoResult } from '../../types/embryo';
import { Download, CheckCircle2, Settings2, AlertTriangle, XCircle, BadgeCheck } from 'lucide-react';

interface EmbryologistReportPanelProps {
  embryo: EmbryoResult;
  onAcceptScore?: (embryoId: string) => void;
  onOverrideScore?: (embryoId: string, newScore: number, reason: string) => void;
  onGenerateReport?: (embryoId: string) => void;
}

const EmbryologistReportPanel: React.FC<EmbryologistReportPanelProps> = ({
  embryo,
  onAcceptScore,
  onOverrideScore,
  onGenerateReport,
}) => {
  const score = embryo.viabilityScore || 0;
  const gardnerGrade = getGardnerGrade(embryo);
  const expansionLabel = gardnerGrade.expansion === 'N/A' ? 'N/A' : `${gardnerGrade.expansion} (Expanded)`;
  const icmLabel = gardnerGrade.icm === 'N/A' ? 'N/A' : `${gardnerGrade.icm} (Good)`;
  const teLabel = gardnerGrade.te === 'N/A' ? 'N/A' : `${gardnerGrade.te} (Good)`;

  // Get recommendation based on score
  const getRecommendation = (score: number) => {
    if (score >= 75) {
      return {
        action: 'PROCEED TO TRANSFER',
        color: 'bg-green-50 border-green-200 text-green-900',
        rationale: [
          `Score ${score}/100 (Viable)`,
          `Gardner ${gardnerGrade.expansion}${gardnerGrade.icm}${gardnerGrade.te} (Good quality)`,
          'Low fragmentation (8%)',
          '100% model agreement',
        ],
      };
    } else if (score >= 50) {
      return {
        action: 'CONSIDER FREEZE FOR LATER',
        color: 'bg-amber-50 border-amber-200 text-amber-900',
        rationale: [
          `Score ${score}/100 (Fair)`,
          `Gardner ${gardnerGrade.expansion}${gardnerGrade.icm}${gardnerGrade.te} (Moderate quality)`,
          'Moderate fragmentation noted',
          'Recommend careful review before transfer',
        ],
      };
    } else {
      return {
        action: 'DISCARD (Recommended)',
        color: 'bg-red-50 border-red-200 text-red-900',
        rationale: [
          `Score ${score}/100 (Poor)`,
          'Multiple morphological concerns',
          'High fragmentation or abnormalities detected',
          'Low implantation potential',
        ],
      };
    }
  };

  const recommendation = getRecommendation(score);
  const RecommendationIcon = score >= 75 ? BadgeCheck : score >= 50 ? AlertTriangle : XCircle;

  return (
    <Card className="sticky top-32 h-fit shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
        <h3 className="font-bold text-slate-900">Embryologist Report</h3>
        <p className="text-xs text-slate-600 mt-1">Quick Action Panel</p>
      </div>

      <div className="p-6 space-y-5">
        {/* Gardner Grade Card */}
        <div className="space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700">Gardner Grade</h4>
            <a href="#" className="text-xs text-blue-600 hover:text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded">
              Learn Scale
            </a>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {gardnerGrade.expansion}
                <span className="text-xl">{gardnerGrade.icm}</span>
                <span className="text-xl">{gardnerGrade.te}</span>
              </span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">Expansion:</span>
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  {expansionLabel}
                  {gardnerGrade.expansion === 'N/A' ? null : <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">ICM Grade:</span>
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  {icmLabel}
                  {gardnerGrade.icm === 'N/A' ? null : <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-700">TE Grade:</span>
                <span className="font-semibold text-slate-900 inline-flex items-center gap-1">
                  {teLabel}
                  {gardnerGrade.te === 'N/A' ? null : <CheckCircle2 className="w-3.5 h-3.5 text-green-700" />}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Morphometry Summary */}
        <div className="space-y-3 animate-fadeIn animation-delay-100">
          <h4 className="text-sm font-semibold text-slate-700">Morphometry Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-700">Circularity:</span>
              <span className="font-bold text-slate-900">92/100</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-700">Fragmentation:</span>
              <span className="font-bold text-slate-900">8%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-700">Boundary Integrity:</span>
              <span className="font-bold text-slate-900">78/100</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-50 rounded border border-slate-200">
              <span className="text-slate-700">Symmetry:</span>
              <span className="font-bold text-green-700">Excellent</span>
            </div>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded">
            View Full Metrics →
          </button>
        </div>

        {/* Abnormality Flags */}
        <div className="space-y-3 animate-fadeIn animation-delay-200">
          <h4 className="text-sm font-semibold text-slate-700">Abnormality Flags</h4>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-sm font-medium text-green-900">None Detected</span>
          </div>
          <button className="text-xs text-slate-600 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 rounded">
            Review Abnormality Rules →
          </button>
        </div>

        {/* Clinical Recommendation */}
        <div className="space-y-3 animate-fadeIn animation-delay-300">
          <h4 className="text-sm font-semibold text-slate-700">Clinical Recommendation</h4>
          <div className={`border-l-4 border-green-500 ${recommendation.color} rounded-lg p-4 space-y-3`}>
            <div className="flex items-center gap-2">
              <RecommendationIcon className="w-5 h-5" />
              <span className="font-bold text-lg">{recommendation.action}</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Rationale:</p>
              <ul className="text-xs space-y-1">
                {recommendation.rationale.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-3 space-y-2 border-t border-current opacity-20">
              <p className="text-xs font-semibold text-slate-700">Alternative Options:</p>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span>Freeze for Later</span>
              </label>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" className="w-4 h-4" disabled />
                <span>Discard (Not Recommended)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Confidence Indicators */}
        <div className="space-y-3 animate-fadeIn animation-delay-400 pt-3 border-t border-slate-200">
          <h4 className="text-sm font-semibold text-slate-700">Confidence Metrics</h4>
          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-700">Model Confidence:</span>
                <span className="font-semibold">85%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="h-full w-5/6 bg-green-600 rounded-full"></div>
              </div>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Score Uncertainty:</span>
              <span className="font-semibold text-slate-900">±7 points</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Recommendation Reliability:</span>
              <span className="font-semibold text-slate-900">94%</span>
            </div>
          </div>
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 rounded">
            What do these mean? →
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-4 border-t border-slate-200 animate-fadeIn animation-delay-500">
          <Button
            onClick={() => onAcceptScore?.(embryo.id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all hover:shadow-md"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Accept & Confirm
          </Button>
          <Button
            onClick={() => onOverrideScore?.(embryo.id, embryo.viabilityScore, 'Manual review')}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Settings2 className="w-4 h-4 mr-2" />
            Override Score
          </Button>
          <Button
            onClick={() => onGenerateReport?.(embryo.id)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all hover:shadow-md"
          >
            <Download className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmbryologistReportPanel;

function getGardnerGrade(embryo: EmbryoResult) {
  const expansionMatch = embryo.features?.blastocystExpansion?.match(/Grade\s(\d)/i);
  const icmMatch = embryo.features?.innerCellMass?.match(/Grade\s([A-C])/i);
  const teMatch = embryo.features?.trophectoderm?.match(/Grade\s([A-C])/i);

  const expansion = expansionMatch?.[1] ?? 'N/A';
  const icm = icmMatch?.[1] ?? 'N/A';
  const te = teMatch?.[1] ?? 'N/A';

  return {
    expansion,
    icm,
    te,
  };
}
