import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { CycleOverview } from "./components/CycleOverview";
import { EmbryoComparison } from "./components/EmbryoComparison";
import { AssessmentHub } from "./components/AssessmentHub";
import { DisclaimerFooter } from "./components/DisclaimerFooter";
import { DevelopmentJourney } from "./components/DevelopmentJourney";
import { MorphologyDeepDive } from "./components/MorphologyDeepDive";
import { ViabilityInsights } from "./components/ViabilityInsights";
import { generateMockEmbryos } from "./utils/mockAnalysis";
import type { EmbryoResult } from "./types/embryo";

type ViewMode = "overview" | "comparison";
type ActiveSection =
  | "overview"
  | "assessment"
  | "development"
  | "morphology"
  | "viability"
  | "comparison";

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [embryoData, setEmbryoData] = useState<EmbryoResult[]>(() => generateMockEmbryos());

  const handleUpdateEmbryo = (updated: EmbryoResult) => {
    setEmbryoData((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 flex flex-col">
        <DashboardHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <main className="flex-1 p-6 overflow-auto">
          {activeSection === "assessment" && (
            <AssessmentHub embryos={embryoData} setEmbryos={setEmbryoData} />
          )}

          {activeSection === "development" && (
            <DevelopmentJourney embryoData={embryoData} />
          )}

          {activeSection === "morphology" && (
            <MorphologyDeepDive embryoData={embryoData} />
          )}

          {activeSection === "viability" && (
            <ViabilityInsights embryoData={embryoData} />
          )}

          {activeSection === "overview" && viewMode === "overview" && (
            <CycleOverview
              embryoData={embryoData}
              activeSection={activeSection}
              onUpdateEmbryo={handleUpdateEmbryo}
            />
          )}

          {activeSection === "overview" && viewMode === "comparison" && (
            <EmbryoComparison embryoData={embryoData} />
          )}

          {activeSection === "comparison" && <EmbryoComparison embryoData={embryoData} />}
        </main>

        <DisclaimerFooter />
      </div>
    </div>
  );
}