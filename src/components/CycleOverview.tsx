import { useState, useEffect } from 'react';
import { SummaryCards } from './overview/SummaryCards';
import { StageDistribution } from './overview/StageDistribution';
import { QualityTrends } from './overview/QualityTrends';
import { EmbryoViewer } from './overview/EmbryoViewer';
import { ViabilityChart } from './overview/ViabilityChart';
import { QualityMetricsChart } from './overview/QualityMetricsChart';
import { RankingList } from './overview/RankingList';
import { OverrideControls } from './overview/OverrideControls';
import type { EmbryoResult } from '../types/embryo';

interface CycleOverviewProps {
  embryoData: EmbryoResult[];
  activeSection: string;
  onUpdateEmbryo: (updated: EmbryoResult) => void;
}

export function CycleOverview({ embryoData, onUpdateEmbryo }: CycleOverviewProps) {
  // Don't filter placeholder - show all embryos passed from parent
  // Parent (App.tsx) already handles the filtering logic
  const [selectedEmbryo, setSelectedEmbryo] = useState<EmbryoResult | null>(
    embryoData.length > 0 ? embryoData[0] : null
  );

  // Ensure selectedEmbryo stays in sync if embryoData changes (e.g. after upload)
  useEffect(() => {
    if (embryoData.length === 0) {
      setSelectedEmbryo(null);
      return;
    }
    
    if (!selectedEmbryo) {
      setSelectedEmbryo(embryoData[0]);
      return;
    }
    
    const found = embryoData.find(e => e.id === selectedEmbryo.id);
    if (found) {
      setSelectedEmbryo(found);
    } else {
      setSelectedEmbryo(embryoData[0]);
    }
  }, [embryoData, selectedEmbryo]);

  const handleEmbryoUpdate = (updated: EmbryoResult) => {
    setSelectedEmbryo(updated);
    onUpdateEmbryo(updated);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
      {/* Left Column - 3/12 (25%) - Row 1 */}
      <div className="col-span-1 lg:col-span-3 lg:row-start-1 space-y-6 min-w-0">
        <SummaryCards embryoData={embryoData} />
        <StageDistribution embryoData={embryoData} />
        <QualityTrends embryoData={embryoData} />
      </div>

      {/* Center Column - 5/12 (40%) - Row 1 */}
      <div className="col-span-1 lg:col-span-5 lg:row-start-1 space-y-6 min-w-0">
        <EmbryoViewer
          embryo={selectedEmbryo}
          onSelectEmbryo={setSelectedEmbryo}
          allEmbryos={embryoData}
        />
      </div>

      {/* Right Column Top - 4/12 (33%) - Row 1 */}
      <div className="col-span-1 lg:col-span-4 lg:row-start-1 space-y-6 min-w-0">
        <ViabilityChart embryoData={embryoData} selectedEmbryo={selectedEmbryo} />
        <QualityMetricsChart embryoData={embryoData} />
      </div>

      {/* Wide Override Controls - Row 2, Left side (8 columns) */}
      <div className="col-span-1 lg:col-start-1 lg:col-span-8 lg:row-start-2 min-w-0">
        <OverrideControls
          embryo={selectedEmbryo}
          onUpdateEmbryo={handleEmbryoUpdate}
        />
      </div>

      {/* Embryo Rankings - Row 2, Right side (4 columns) */}
      <div className="col-span-1 lg:col-start-9 lg:col-span-4 lg:row-start-2 min-w-0">
        <RankingList
          embryoData={embryoData}
          selectedEmbryo={selectedEmbryo}
          onSelectEmbryo={setSelectedEmbryo}
        />
      </div>
    </div>
  );
}
