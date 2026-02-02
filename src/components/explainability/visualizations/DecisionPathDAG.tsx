import React, { useState } from 'react';
import { EmbryoResult } from '../../../types/embryo';
import { ChevronDown, Check, Image as ImageIcon, Microscope, Cpu, BarChart3, Scale, BadgeCheck, Info, CheckCircle2 } from 'lucide-react';

interface DecisionPathDAGProps {
  embryo: EmbryoResult;
}

interface DAGNode {
  id: string;
  label: string;
  description: string;
  details?: string[];
  expanded: boolean;
}

/**
 * Decision Path DAG Component
 * 
 * Visual representation of how the AI model processes embryo data
 * Flow: Image → Features → Models → Voting → Score → Recommendation
 * 
 * Nodes are clickable to expand and show detailed calculations
 */
const DecisionPathDAG: React.FC<DecisionPathDAGProps> = ({ embryo }) => {
  const [expandedNodes, setExpandedNodes] = useState<string[]>(['scoring']);

  const dagNodes: DAGNode[] = [
    {
      id: 'image',
      label: 'Embryo Image',
      description: 'Input embryo image for analysis',
      details: [
        'Format: JPEG/PNG/TIFF',
        'Resolution: 1024x1024px',
        'Quality: Artifact-free',
        'Status: Valid',
      ],
      expanded: false,
    },
    {
      id: 'extraction',
      label: 'Feature Extraction',
      description: 'Image analysis to compute morphological features',
      details: [
        '20 features extracted',
        'Circularity index: 92/100',
        'Fragmentation rate: 8%',
        'Boundary integrity: 78/100',
        'Nucleus symmetry: 85/100',
        'Status: Complete',
      ],
      expanded: false,
    },
    {
      id: 'ensemble',
      label: 'Ensemble Voting',
      description: '3 pre-trained RandomForest models evaluate features',
      details: [
        'Model A (TreeExplainer v2.1): 84 (94% confidence)',
        'Model B (TreeExplainer v2.1): 86 (92% confidence)',
        'Model C (TreeExplainer v2.1): 82 (96% confidence)',
        'Voting: 3/3 models agree (Viable)',
        'Status: Consensus reached',
      ],
      expanded: false,
    },
    {
      id: 'averaging',
      label: 'Score Averaging',
      description: 'Ensemble probabilities are averaged',
      details: [
        'Calculation: (84 + 86 + 82) ÷ 3 = 84',
        'Model Agreement: 94%',
        'Confidence Level: HIGH',
        'Status: Score computed',
      ],
      expanded: false,
    },
    {
      id: 'threshold',
      label: 'Threshold Matching',
      description: 'Score compared against clinical decision boundaries',
      details: [
        'Score: 84',
        'Viable Threshold: 70',
        'Classification: 84 > 70 = VIABLE',
        'Risk Assessment: Low',
        'Recommendation Confidence: 95%',
      ],
      expanded: false,
    },
    {
      id: 'recommendation',
      label: 'Clinical Recommendation',
      description: 'Final actionable decision for embryologist',
      details: [
        'Proceed to transfer',
        'Rationale: Excellent morphology + High viability',
        'Gardner Grade: 5BB (Good quality)',
        'Implantation Potential: High',
        'Risk Level: Low',
      ],
      expanded: false,
    },
  ];

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) =>
      prev.includes(nodeId)
        ? prev.filter((id) => id !== nodeId)
        : [...prev, nodeId]
    );
  };

  const getNodeColor = (id: string) => {
    const colorMap: { [key: string]: string } = {
      image: 'from-slate-100 to-slate-50 border-slate-200',
      extraction: 'from-blue-50 to-blue-50 border-blue-200',
      ensemble: 'from-purple-50 to-purple-50 border-purple-200',
      averaging: 'from-indigo-50 to-indigo-50 border-indigo-200',
      threshold: 'from-cyan-50 to-cyan-50 border-cyan-200',
      recommendation: 'from-green-50 to-green-50 border-green-200',
    };
    return colorMap[id] || 'from-slate-50 to-slate-50 border-slate-200';
  };

  const getNodeIcon = (id: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      image: <ImageIcon className="w-6 h-6 text-slate-700" />,
      extraction: <Microscope className="w-6 h-6 text-slate-700" />,
      ensemble: <Cpu className="w-6 h-6 text-slate-700" />,
      averaging: <BarChart3 className="w-6 h-6 text-slate-700" />,
      threshold: <Scale className="w-6 h-6 text-slate-700" />,
      recommendation: <BadgeCheck className="w-6 h-6 text-slate-700" />,
    };
    return iconMap[id] || <Info className="w-6 h-6 text-slate-700" />;
  };

  return (
    <div className="space-y-6">
      {/* Main Flow Diagram */}
      <div className="bg-white border border-slate-200 rounded-lg p-8 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 mb-8">AI Decision Pipeline</h3>

        {/* Vertical Flow */}
        <div className="space-y-6">
          {dagNodes.map((node, idx) => (
            <div key={node.id} className="relative">
              {/* Connection Arrow */}
              {idx < dagNodes.length - 1 && (
                <div className="absolute left-12 -bottom-6 w-0.5 h-6 bg-gradient-to-b from-slate-300 to-slate-200"></div>
              )}

              {/* Node Card */}
              <button
                onClick={() => toggleNode(node.id)}
                aria-expanded={expandedNodes.includes(node.id)}
                aria-controls={`decision-node-${node.id}`}
                className={`w-full text-left transition-all hover:shadow-md animate-fadeIn bg-gradient-to-br ${getNodeColor(node.id)} border-2 rounded-lg p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400`}
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="text-3xl flex-shrink-0 mt-1">{getNodeIcon(node.id)}</div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h4 className="text-lg font-bold text-slate-900">{node.label}</h4>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-600 flex-shrink-0 transition-transform ${
                          expandedNodes.includes(node.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                    <p className="text-sm text-slate-600">{node.description}</p>
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0 ml-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Check className="w-5 h-5 text-green-700" />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedNodes.includes(node.id) && node.details && (
                  <div id={`decision-node-${node.id}`} className="mt-6 pt-6 border-t-2 border-slate-200 space-y-3 animate-slideDown">
                    <h5 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Details:</h5>
                    <ul className="space-y-2">
                      {node.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start gap-3 text-sm text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 flex-shrink-0"></span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Boundary Visualization */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Scale className="w-5 h-5 text-slate-700" />
          Decision Boundary Analysis
        </h3>

        <div className="space-y-6">
          {/* Threshold Chart */}
          <div className="bg-white border border-amber-100 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-slate-900">Score Thresholds</h4>
            <div className="space-y-3">
              {[
                { label: 'Critical', range: '0–24', color: 'bg-red-600', recommendation: 'DISCARD' },
                { label: 'Risk', range: '25–49', color: 'bg-red-400', recommendation: 'FREEZE/DISCARD' },
                { label: 'Caution', range: '50–74', color: 'bg-amber-400', recommendation: 'FREEZE FOR LATER' },
                { label: 'Viable', range: '75–100', color: 'bg-green-600', recommendation: 'PROCEED' },
              ].map((tier) => (
                <div key={tier.label} className="flex items-center gap-4">
                  <div className="w-32 text-sm font-medium text-slate-700">{tier.label}</div>
                  <div className="relative flex-1 h-8 bg-slate-100 rounded-full overflow-hidden border border-slate-300">
                    <div
                      className={`h-full ${tier.color} flex items-center justify-center text-white text-xs font-bold`}
                      style={{
                        width:
                          tier.label === 'Critical'
                            ? '24%'
                            : tier.label === 'Risk'
                            ? '25%'
                            : tier.label === 'Caution'
                            ? '25%'
                            : '26%',
                      }}
                    >
                      {tier.range}
                    </div>
                  </div>
                  <div className="w-40 text-sm font-medium text-slate-900">{tier.recommendation}</div>
                </div>
              ))}
            </div>

            {/* Current Score Indicator */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="relative h-12 bg-gradient-to-r from-red-500 via-amber-500 to-green-500 rounded-full overflow-hidden border-2 border-slate-300">
                <div
                  className="absolute top-0 h-full w-1 bg-slate-900"
                  style={{ left: `${(embryo.viabilityScore || 84) + '%'}` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                    Score: {embryo.viabilityScore || 84}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-xs text-slate-600 mt-2">
                <span>0 (Critical)</span>
                <span>50 (Fair)</span>
                <span>100 (Excellent)</span>
              </div>
            </div>
          </div>

          {/* Decision Logic */}
          <div className="bg-white border border-amber-100 rounded-lg p-4 space-y-4">
            <h4 className="font-semibold text-slate-900">Decision Logic</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium text-slate-900">Calculate baseline ensemble score</p>
                  <p className="text-slate-600">Average predictions from 3 RandomForest models</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium text-slate-900">Compare with clinical thresholds</p>
                  <p className="text-slate-600">Match score against predefined decision boundaries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium text-slate-900">Generate recommendation</p>
                  <p className="text-slate-600">Output actionable decision with confidence metrics</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why This Score Explanation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-slate-700" />
          Why Was This Score Given?
        </h3>
        <div className="space-y-4 text-sm">
          <p className="text-slate-700">
            <span className="font-semibold text-slate-900">Score {embryo.viabilityScore || 84}/100</span> was assigned because:
          </p>
          <ul className="space-y-2 ml-4">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium text-slate-900">Excellent nucleus morphology:</span> Circularity index of 92/100 indicates a well-defined and optimally rounded nucleus
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium text-slate-900">Minimal fragmentation:</span> Only 8% fragmentation detected, indicating healthy cytoplasm with minimal cell damage
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium text-slate-900">Strong boundary integrity:</span> Regular cell membrane with score of 78/100, showing no signs of blebbing or damage
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium text-slate-900">Perfect ensemble agreement:</span> All 3 AI models unanimously classify as viable, with 94% average model confidence
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
              <span>
                <span className="font-medium text-slate-900">Gardner Grade 5BB:</span> Expansion, Inner Cell Mass, and Trophectoderm all rated as "Good" (B grade) for age
              </span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default DecisionPathDAG;
