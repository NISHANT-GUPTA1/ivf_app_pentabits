import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardHeader } from "./components/DashboardHeader";
import { CycleOverview } from "./components/CycleOverview";
import { EmbryoComparison } from "./components/EmbryoComparison";
import { AssessmentHub } from "./components/AssessmentHub";
import { DisclaimerFooter } from "./components/DisclaimerFooter";
import { DevelopmentJourney } from "./components/DevelopmentJourney";
import { MorphologyDeepDive } from "./components/MorphologyDeepDive";
import { ViabilityInsights } from "./components/ViabilityInsights";
import { LoginForm } from "./components/LoginForm";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { apiService, convertEmbryoToEmbryoResult, type Patient, type Cycle, type Embryo } from "./services/api";
import type { EmbryoResult } from "./types/embryo";

type ViewMode = "overview" | "comparison";
type ActiveSection =
  | "overview"
  | "assessment"
  | "development"
  | "morphology"
  | "viability"
  | "comparison";

function AppContent() {
  const { user, isLoading } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [embryoData, setEmbryoData] = useState<EmbryoResult[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [embryos, setEmbryos] = useState<Embryo[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data from backend
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [patientsData, cyclesData, embryosData] = await Promise.all([
        apiService.getPatients(),
        apiService.getCycles(),
        apiService.getEmbryos(),
      ]);

      setPatients(patientsData);
      setCycles(cyclesData);
      setEmbryos(embryosData);

      // Convert embryos to EmbryoResult format for frontend
      const embryoResults: EmbryoResult[] = embryosData.map(embryo => {
        const cycle = cyclesData.find(c => c.id === embryo.cycle_id);
        const patient = cycle ? patientsData.find(p => p.id === cycle.patient_id) : undefined;
        return convertEmbryoToEmbryoResult(embryo, cycle!, patient!);
      });

      setEmbryoData(embryoResults);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEmbryo = (updated: EmbryoResult) => {
    setEmbryoData((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-blush flex">
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
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg">Loading data...</div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </main>

        <DisclaimerFooter />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}