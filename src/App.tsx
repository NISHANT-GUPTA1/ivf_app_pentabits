import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/LoginForm';
import { DashboardHeader } from "./components/DashboardHeader";
import { CycleOverview } from "./components/CycleOverview";
import { EmbryoComparison } from "./components/EmbryoComparison";
import { AssessmentHub } from "./components/AssessmentHub";
import { DisclaimerFooter } from "./components/DisclaimerFooter";
import { DevelopmentJourney } from "./components/DevelopmentJourney";
import { MorphologyDeepDive } from "./components/MorphologyDeepDive";
import { ViabilityInsights } from "./components/ViabilityInsights";
import { ExplainabilityDashboard } from "./components/ExplainabilityDashboard";
import { ConfusionMatrix } from "./components/ConfusionMatrix";
import { generateMockEmbryos } from "./utils/mockAnalysis";
import { storage } from "./utils/storage";
import type { EmbryoResult, Patient } from "./types/embryo";

type ViewMode = "overview" | "comparison";
type ActiveSection =
  | "overview"
  | "assessment"
  | "development"
  | "morphology"
  | "viability"
  | "comparison"
  | "explainability";

export default function App() {
  // Check auth and show LoginForm when not authenticated
  const auth = useAuth();
  if (auth.isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-blush to-lavender flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-medical mb-4"></div>
        <p className="text-charcoal font-semibold">Loading EMBRYA...</p>
      </div>
    </div>
  );
  if (!auth.user) return <LoginForm />;
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeSection, setActiveSection] = useState<ActiveSection>("overview");
  const [allEmbryos, setAllEmbryos] = useState<EmbryoResult[]>(() => {
    const stored = storage.loadEmbryos();
    return stored.length > 0 ? stored : generateMockEmbryos();
  });
  
  // Patient management - load from localStorage
  const [patients, setPatients] = useState<Patient[]>(() => storage.loadPatients());
  const [activePatientId, setActivePatientId] = useState<string | null>(() => storage.loadActivePatientId());
  
  // Selected embryo state - persisted across navigation
  const [selectedEmbryo, setSelectedEmbryo] = useState<EmbryoResult | null>(null);
  
  // Uploaded embryos for current session - persisted across navigation
  const [uploadedEmbryos, setUploadedEmbryos] = useState<EmbryoResult[]>([]);
  
  // Image file - persisted across navigation
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    storage.savePatients(patients);
  }, [patients]);
  
  useEffect(() => {
    storage.saveEmbryos(allEmbryos);
  }, [allEmbryos]);
  
  useEffect(() => {
    storage.saveActivePatientId(activePatientId);
  }, [activePatientId]);
  
  // Filter embryos by active patient
  const embryoData = activePatientId 
    ? allEmbryos.filter(e => e.patientId === activePatientId)
    : allEmbryos.filter(e => e.id === 'placeholder-embryo'); // Show only placeholder if no patient selected
  
  const handleUpdateEmbryo = (updated: EmbryoResult) => {
    setAllEmbryos((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
  };
  
  const handleAddPatient = (patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
    setActivePatientId(patient.id);
  };
  
  const handleSelectPatient = (patientId: string | null) => {
    setActivePatientId(patientId);
  };

  return (
    <div className="min-h-screen bg-blush flex">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="flex-1 flex flex-col ml-20">
        <DashboardHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        <main className="flex-1 p-6 overflow-auto">
          {activeSection === "assessment" && (
            <AssessmentHub 
              embryos={allEmbryos} 
              setEmbryos={setAllEmbryos}
              patients={patients}
              activePatientId={activePatientId}
              onAddPatient={handleAddPatient}
              onSelectPatient={handleSelectPatient}
              onNavigate={setActiveSection}
              selectedEmbryo={selectedEmbryo}
              setSelectedEmbryo={setSelectedEmbryo}
              uploadedEmbryos={uploadedEmbryos}
              setUploadedEmbryos={setUploadedEmbryos}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
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

          {activeSection === "explainability" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Explainability Dashboard</h1>
                <p className="text-gray-600 mb-6">
                  Comprehensive analysis showing why each embryo received its viability score.
                  Upload embryo images in the Assessment Hub to see detailed morphological analysis, Gardner grading, genetic risk assessment, and clinical recommendations.
                </p>
                
                {embryoData.filter(e => e.comprehensiveAnalysis).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyzed Embryos Yet</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Upload and analyze embryo images in the Assessment Hub to see detailed explainability reports.
                    </p>
                    <button
                      onClick={() => setActiveSection('assessment')}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Go to Assessment Hub
                    </button>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {embryoData.filter(e => e.comprehensiveAnalysis).map((embryo) => (
                      <button
                        key={embryo.id}
                        onClick={() => {
                          const elem = document.getElementById(`explainability-${embryo.id}`);
                          elem?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-left p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-transparent hover:border-blue-300 transition-all"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <img src={embryo.imageUrl} alt={embryo.name} className="w-16 h-16 rounded-lg object-cover" />
                          <div>
                            <h4 className="font-semibold text-gray-900">{embryo.name}</h4>
                            <p className="text-sm text-gray-600">Score: {embryo.viabilityScore}</p>
                          </div>
                        </div>
                        <p className="text-xs text-blue-600 font-medium">Click to view details ↓</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Show explainability dashboards for each analyzed embryo */}
              {embryoData.filter(e => e.comprehensiveAnalysis).map((embryo) => (
                <div key={embryo.id} id={`explainability-${embryo.id}`}>
                  <ExplainabilityDashboard
                    prediction={embryo.comprehensiveAnalysis!}
                    embryoName={embryo.name}
                    imageUrl={embryo.imageUrl}
                  />
                </div>
              ))}

              {/* Model Performance Section */}
              {embryoData.filter(e => e.comprehensiveAnalysis).length > 0 && (
                <div className="mt-8">
                  <ConfusionMatrix />
                </div>
              )}
            </div>
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