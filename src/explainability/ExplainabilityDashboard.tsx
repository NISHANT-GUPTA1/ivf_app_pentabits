import React, { useState } from 'react';
import { Card } from '../ui/card';
import { EmbryoResult } from '../../types/embryo';
import StatusIndicatorPanel from './StatusIndicatorPanel';
import VisualizationPanel from './VisualizationPanel';
import EmbryologistReportPanel from './EmbryologistReportPanel';

type DashboardTab = 'summary' | 'morphometry' | 'attribution' | 'decision' | 'report';

interface ExplainabilityDashboardProps {
  embryo: EmbryoResult;
  onAcceptScore?: (embryoId: string) => void;
  onOverrideScore?: (embryoId: string, newScore: number, reason: string) => void;
  onGenerateReport?: (embryoId: string) => void;
}

/**
 * AI Explainability Dashboard - Main Container
 * 
 * 3-column layout:
 * - Left (18%): Status indicator + tab navigation
 * - Center (64%): Dynamic visualizations (changes per tab)
 * - Right (18%): Embryologist report panel with action buttons
 * 
 * Non-breaking: Wraps existing ViabilityInsights without modification
 */
const ExplainabilityDashboard: React.FC<ExplainabilityDashboardProps> = ({
  embryo,
  onAcceptScore,
  onOverrideScore,
  onGenerateReport,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('summary');
  const [isLoadingVisualization, setIsLoadingVisualization] = useState(false);

  // Handle tab transitions with loading state for smooth animations
  const handleTabChange = (tab: string) => {
    setIsLoadingVisualization(true);
    setActiveTab(tab as DashboardTab);
    // Simulate chart rendering delay
    setTimeout(() => setIsLoadingVisualization(false), 300);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200 rounded-lg shadow-sm mb-6 p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-slate-900">Embryo Analysis</h1>
            <span className="text-sm text-slate-600">
              ID: <span className="font-mono font-semibold text-slate-900">{embryo.id}</span>
            </span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <span>Status: <span className="font-semibold text-green-700">Complete</span></span>
            <span>Time: {new Date(embryo.uploadedAt || Date.now()).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT PANEL: Status Indicator (18%) */}
        <div className="lg:col-span-1">
          <StatusIndicatorPanel
            embryo={embryo}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAcceptScore={onAcceptScore}
            onOverrideScore={onOverrideScore}
            onDeepDive={() => handleTabChange('attribution')}
          />
        </div>

        {/* CENTER PANEL: Dynamic Visualizations (64%) */}
        <div className="lg:col-span-2">
          <Card className="h-full shadow-md border-slate-200 overflow-hidden">
            <div className="p-6">
              {isLoadingVisualization ? (
                <div className="flex items-center justify-center h-96 text-slate-500">
                  <div className="animate-pulse">Loading visualization...</div>
                </div>
              ) : (
                <VisualizationPanel
                  embryo={embryo}
                  activeTab={activeTab}
                />
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT PANEL: Embryologist Report (18%) */}
        <div className="lg:col-span-1">
          <EmbryologistReportPanel
            embryo={embryo}
            onAcceptScore={onAcceptScore}
            onOverrideScore={onOverrideScore}
            onGenerateReport={onGenerateReport}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-center items-center gap-8 text-xs text-slate-500 border-t border-slate-200 pt-4">
        <button aria-label="Help" className="hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded">Help (?)</button>
        <button aria-label="Audit Log" className="hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded">Audit Log</button>
        <button aria-label="Settings" className="hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded">Settings</button>
        <button aria-label="Feedback" className="hover:text-slate-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 rounded">Feedback</button>
        <span className="ml-auto">Version: 2.1.0</span>
      </div>
    </div>
  );
};

export default ExplainabilityDashboard;
