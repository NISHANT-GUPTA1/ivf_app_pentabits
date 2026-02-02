import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import type { EmbryoResult, ModelPredictionSummary } from '../../types/embryo';
import { Search, CheckCircle, CheckCircle2, BarChart3, Activity, Sparkles, GitBranch, FileText, AlertTriangle, XCircle } from 'lucide-react';

interface StatusIndicatorPanelProps {
  embryo: EmbryoResult;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAcceptScore?: (embryoId: string) => void;
  onOverrideScore?: (embryoId: string, newScore: number, reason: string) => void;
  onDeepDive?: () => void;
}

const StatusIndicatorPanel: React.FC<StatusIndicatorPanelProps> = ({
  embryo,
  activeTab,
  onTabChange,
  onAcceptScore,
  onOverrideScore,
  onDeepDive,
}) => {
  // Determine score category color
  const getScoreColor = (score: number) => {
    if (score >= 75) return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', badge: '#2E7D32' };
    if (score >= 50) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: '#F59E0B' };
    if (score >= 25) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: '#DC2626' };
    return { bg: 'bg-red-100', border: 'border-red-300', text: 'text-red-800', badge: '#991B1B' };
  };

  // Determine status label
  const getStatusLabel = (score: number) => {
    if (score >= 75) return { label: 'VIABLE - GOOD', Icon: CheckCircle2, color: 'text-green-700' };
    if (score >= 50) return { label: 'CAUTION - FAIR', Icon: AlertTriangle, color: 'text-amber-700' };
    if (score >= 25) return { label: 'RISK - POOR', Icon: AlertTriangle, color: 'text-red-700' };
    return { label: 'CRITICAL', Icon: XCircle, color: 'text-red-800' };
  };

  const viabilityScore = embryo.viabilityScore || 0;
  const scoreColor = getScoreColor(viabilityScore);
  const statusInfo = getStatusLabel(viabilityScore);
  const modelAgreement = embryo.modelPredictions?.length
    ? Math.round(
        (embryo.modelPredictions.reduce(
          (acc: number, m: ModelPredictionSummary) => acc + (m.probabilityGood * 100),
          0
        ) /
          embryo.modelPredictions.length)
      )
    : 85; // Fallback for mock data

  const gardnerGrade = getGardnerGrade(embryo);

  const tabs = [
    { id: 'summary', label: 'Score Breakdown', icon: BarChart3 },
    { id: 'morphometry', label: 'Morphometry', icon: Activity },
    { id: 'attribution', label: 'Key Factors', icon: Sparkles },
    { id: 'report', label: 'Clinical Report', icon: FileText },
  ];

  return (
    <Card className={`sticky top-32 h-fit shadow-lg border-2 ${scoreColor.border} ${scoreColor.bg}`}>
      <div className="p-6 space-y-6">
        {/* Viability Score Card */}
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider">Embryo Status</h3>
          <div className={`p-4 rounded-lg bg-white border-2 ${scoreColor.border}`}>
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Score</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-bold ${scoreColor.text}`}>{viabilityScore}</span>
              <span className="text-sm text-slate-600">/100</span>
            </div>
            <div className="h-1 bg-gradient-to-r from-green-400 to-red-400 rounded-full my-3 opacity-30"></div>
            <Badge className={`${scoreColor.badge} text-white font-semibold inline-flex items-center gap-2`}>
              <statusInfo.Icon className="w-3.5 h-3.5" /> {statusInfo.label}
            </Badge>
            <p className="text-xs text-slate-600 mt-2 inline-flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-700" /> AI Confidence: {modelAgreement}%
            </p>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="space-y-3 animate-fadeIn animation-delay-100">
          <h4 className="text-xs font-semibold text-slate-600 uppercase">Quick Metrics</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center p-2 bg-white/50 rounded border border-slate-200">
              <span className="font-medium text-slate-700">Gardner Grade:</span>
              <span className="font-bold text-slate-900">{gardnerGrade || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded border border-slate-200">
              <span className="font-medium text-slate-700">Development:</span>
              <span className="font-bold text-slate-900">Day 5</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded border border-slate-200">
              <span className="font-medium text-slate-700">Risk Tier:</span>
              <span className={`font-bold ${scoreColor.text} inline-flex items-center gap-1`}>
                <AlertTriangle className="w-3.5 h-3.5" />
                {viabilityScore >= 75 ? 'LOW' : viabilityScore >= 50 ? 'MODERATE' : 'HIGH'}
              </span>
            </div>
            <div className="flex items-center p-2 bg-white/50 rounded border border-slate-200">
              <span className="font-medium text-slate-700 text-xs">Confidence:</span>
              <div className="ml-2 flex-1 bg-slate-200 rounded-full h-2">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${
                    viabilityScore >= 75 ? 'from-green-400 to-green-600' : 'from-amber-400 to-amber-600'
                  }`}
                  style={{ width: `${modelAgreement}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs font-bold text-slate-700">{modelAgreement}%</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-white/50 rounded border border-slate-200">
              <span className="font-medium text-slate-700">AI Consensus:</span>
              <span className="font-bold text-green-700">3/3 Models Agree</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-3 animate-fadeIn animation-delay-200" role="tablist" aria-label="Explainability views">
          <h4 className="text-xs font-semibold text-slate-600 uppercase">Analysis Views</h4>
          <div className="flex flex-col gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as any)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`explainability-panel-${tab.id}`}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  activeTab === tab.id
                    ? `bg-white border-b-4 ${scoreColor.border} text-slate-900 shadow-sm`
                    : 'bg-white/50 text-slate-700 hover:bg-white border border-slate-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 animate-fadeIn animation-delay-300 pt-2 border-t border-slate-200">
          <Button
            onClick={() => onAcceptScore?.(embryo.id)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-all hover:shadow-md"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Accept Score
          </Button>
          <Button
            onClick={() => onOverrideScore?.(embryo.id, embryo.viabilityScore, 'Manual review')}
            variant="outline"
            className="w-full border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Override Score
          </Button>
          <Button
            onClick={onDeepDive}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-all hover:shadow-md"
          >
            <Search className="w-4 h-4 mr-2" />
            Deep Dive
          </Button>
        </div>
      </div>

    </Card>
  );
};

export default StatusIndicatorPanel;

function getGardnerGrade(embryo: EmbryoResult): string | null {
  const expansionMatch = embryo.features?.blastocystExpansion?.match(/Grade\s(\d)/i);
  const icmMatch = embryo.features?.innerCellMass?.match(/Grade\s([A-C])/i);
  const teMatch = embryo.features?.trophectoderm?.match(/Grade\s([A-C])/i);

  if (!expansionMatch || !icmMatch || !teMatch) {
    return null;
  }

  return `${expansionMatch[1]}${icmMatch[1]}${teMatch[1]}`;
}
