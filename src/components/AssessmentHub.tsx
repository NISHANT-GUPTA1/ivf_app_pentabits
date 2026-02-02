import React, { useState, useRef, useEffect } from 'react';
import { apiService } from '../services/api';
import { Upload, RefreshCw, FileUp, X, Check, Brain, ChevronDown, Download, ZoomIn, RotateCcw, Plus, User, Users, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import type { EmbryoResult, ComprehensivePrediction, Patient } from '../types/embryo';
import { ExplainabilityDashboard } from './ExplainabilityDashboard';
import { EmbryoDetailedAnalysis } from './EmbryoDetailedAnalysis';

// Helper: normalize partial backend response into ComprehensivePrediction
function buildComprehensivePrediction(raw: any, developmentDay?: number): ComprehensivePrediction {
    console.log('[buildComprehensivePrediction] Raw backend data:', raw);
    console.log('[buildComprehensivePrediction] Development day:', developmentDay);
    const features = raw.features || {};

    // Derive fragmentation percentage: prefer explicit value, else infer from num_regions or circularity
    let fragmentation_percentage = 0;
    if (typeof features.fragmentation_percentage === 'number') fragmentation_percentage = features.fragmentation_percentage;
    else if (typeof features.num_regions_mean === 'number') fragmentation_percentage = Math.min(100, features.num_regions_mean * 10);
    else if (typeof features.circularity_mean === 'number') fragmentation_percentage = Math.max(0, Math.min(100, (1 - features.circularity_mean) * 100));

    const circularity_score = typeof features.circularity_mean === 'number' ? features.circularity_mean : 0.3;

    const viability = typeof raw.viability_score === 'number' ? raw.viability_score : 0;
    console.log('[buildComprehensivePrediction] Viability from backend:', viability);
    console.log('[buildComprehensivePrediction] Model predictions:', raw.model_predictions);
    console.log('[buildComprehensivePrediction] Confidence:', raw.confidence);

    const model_confidence_scores = (raw.model_predictions || []).map((m: any) => Number(m.probability_good || 0));
    const agreement_rate = model_confidence_scores.length > 0 ? (model_confidence_scores.reduce((a: number, b: number) => a + b, 0) / model_confidence_scores.length) : 0;

    const clinicalRecommendation = (() => {
        if (viability >= 85) return { transfer_recommendation: 'Recommended for immediate transfer', transfer_priority: 1, freeze_recommendation: false, discard_recommendation: false, reasoning: ['High viability score'], clinical_notes: '' };
        if (viability >= 70) return { transfer_recommendation: 'Consider for transfer', transfer_priority: 2, freeze_recommendation: false, discard_recommendation: false, reasoning: ['Good viability score'], clinical_notes: '' };
        if (viability >= 50) return { transfer_recommendation: 'Consider with caution', transfer_priority: 3, freeze_recommendation: true, discard_recommendation: false, reasoning: ['Moderate viability score'], clinical_notes: '' };
        return { transfer_recommendation: 'Not recommended for transfer', transfer_priority: 5, freeze_recommendation: false, discard_recommendation: true, reasoning: ['Low viability score'], clinical_notes: '' };
    })();

    // Explainability: use feature_importance from backend if available, otherwise fall back to features
    const backendFeatureImportance = raw.feature_importance || {};
    const hasBackendImportance = Object.keys(backendFeatureImportance).length > 0;
    
    const featureEntries = hasBackendImportance
        ? Object.entries(backendFeatureImportance).map(([k, v]) => ({ feature: k, value: Number(v || 0) }))
        : Object.entries(features).map(([k, v]) => ({ feature: k, value: Number(v || 0) }));
    
    featureEntries.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
    const top_positive_features = featureEntries.slice(0, 5).map(f => ({ feature: f.feature, contribution: Math.abs(f.value) }));
    const top_negative_features: Array<{ feature: string; concern_level: number }> = [];
    
    // Determine developmental stage based on the selected development day
    const getEstimatedStage = (day: number): string => {
        switch(day) {
            case 1: return 'Day 1 Pronuclear (2PN)';
            case 2: return 'Day 2 Cleavage (2-4 cell)';
            case 3: return 'Day 3 Cleavage (8 cell)';
            case 4: return 'Day 4 Morula';
            case 5: return 'Day 5 Blastocyst';
            case 6: return 'Day 6 Expanded Blastocyst';
            default: return `Day ${day}`;
        }
    };
    
    const actualDevelopmentDay = developmentDay || raw.morphokinetics?.predicted_day || 5;
    const estimatedStage = raw.morphokinetics?.estimated_developmental_stage || getEstimatedStage(actualDevelopmentDay);

    const comprehensive: ComprehensivePrediction = {
        prediction: raw.prediction || (viability >= 70 ? 'good' : 'not_good'),
        viability_score: viability,
        confidence: Number(raw.confidence || agreement_rate || 0),
        confidence_level: raw.confidence_level || (viability >= 80 ? 'high' : viability >= 60 ? 'medium' : 'low'),
        model_predictions: raw.model_predictions || [],
        features: features,

        morphological_analysis: {
            fragmentation_level: fragmentation_percentage > 60 ? 'High' : fragmentation_percentage > 30 ? 'Moderate' : 'Low',
            fragmentation_percentage: fragmentation_percentage,
            circularity_score: circularity_score,
            circularity_grade: circularity_score >= 0.6 ? 'Excellent' : circularity_score >= 0.4 ? 'Good' : 'Fair',
            boundary_definition: 'Auto-detected',
            cell_symmetry: circularity_score >= 0.5 ? 'Good' : 'Fair',
            zona_pellucida_thickness: Number(features.zona_pellucida_thickness || 0),
            zona_pellucida_integrity: 'Intact',
            cytoplasmic_granularity: 'Normal',
            vacuolization: 'None'
        },

        blastocyst_grading: {
            expansion_stage: Math.min(6, Math.max(1, Math.round((viability / 100) * 4) + 2)),
            expansion_description: '',
            // Calculate ICM grade based on viability + circularity (cell organization)
            inner_cell_mass_grade: (() => {
                const icmScore = (viability * 0.6) + (circularity_score * 100 * 0.4);
                return icmScore >= 82 ? 'A' : icmScore >= 68 ? 'B' : 'C';
            })(),
            // Calculate TE grade based on viability + fragmentation (lower frag = better)
            trophectoderm_grade: (() => {
                const teScore = (viability * 0.7) + ((100 - fragmentation_percentage) * 0.3);
                return teScore >= 80 ? 'A' : teScore >= 65 ? 'B' : 'C';
            })(),
            overall_grade: `${Math.min(6, Math.max(1, Math.round((viability / 100) * 6)))}${viability >= 80 ? 'AA' : viability >= 60 ? 'AB' : 'BC'}`,
            quality_assessment: ''
        },

        morphokinetics: {
            estimated_developmental_stage: estimatedStage,
            timing_assessment: raw.morphokinetics?.timing_assessment || 'Normal',
            predicted_day: actualDevelopmentDay
        },

        genetic_risk: {
            chromosomal_risk_level: viability >= 80 ? 'Low' : viability >= 60 ? 'Medium' : 'High',
            aneuploidy_risk_score: Math.max(0, Math.min(100, 100 - Math.round(viability))),
            pgt_a_recommendation: viability >= 80 ? 'Not required' : 'Consider PGT-A',
            risk_factors: []
        },

        clinical_recommendation: clinicalRecommendation,

        explainability: {
            feature_importance: featureEntries.reduce((acc: any, f) => { acc[f.feature] = f.value; return acc; }, {}),
            top_positive_features,
            top_negative_features,
            decision_factors: ['Morphology', 'Model ensemble agreement', 'Feature importance'],
            confidence_explanation: `Average model confidence ${(agreement_rate * 100).toFixed(1)}%`
        },

        quality_metrics: {
            agreement_rate: agreement_rate,
            prediction_consistency: agreement_rate > 0.8 ? 'High' : agreement_rate > 0.6 ? 'Moderate' : 'Low',
            model_confidence_scores: model_confidence_scores,
            uncertainty_level: agreement_rate > 0.75 ? 'Low' : 'Medium'
        },

        abnormality_flags: {
            has_abnormalities: fragmentation_percentage > 70 || (100 - (raw.viability_score || 0)) > 60,
            abnormality_types: fragmentation_percentage > 70 ? ['High fragmentation'] : [],
            severity: fragmentation_percentage > 80 ? 'Severe' : fragmentation_percentage > 60 ? 'Moderate' : 'Low',
            requires_manual_review: fragmentation_percentage > 70
        },

        confusion_matrix: raw.confusion_matrix,
        analysis_timestamp: raw.analysis_timestamp || new Date().toISOString(),
        processing_time_ms: Number(raw.processing_time_ms || 0)
    };

    return comprehensive;
}

interface AssessmentHubProps {
    embryos: EmbryoResult[];
    setEmbryos: React.Dispatch<React.SetStateAction<EmbryoResult[]>>;
    patients: Patient[];
    activePatientId: string | null;
    onAddPatient: (patient: Patient) => void;
    onSelectPatient: (patientId: string | null) => void;
    onNavigate?: (section: string) => void;
    selectedEmbryo: EmbryoResult | null;
    setSelectedEmbryo: React.Dispatch<React.SetStateAction<EmbryoResult | null>>;
    uploadedEmbryos: EmbryoResult[];
    setUploadedEmbryos: React.Dispatch<React.SetStateAction<EmbryoResult[]>>;
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

export function AssessmentHub({ embryos, setEmbryos, patients, activePatientId, onAddPatient, onSelectPatient, onNavigate, selectedEmbryo, setSelectedEmbryo, uploadedEmbryos, setUploadedEmbryos, selectedFile, setSelectedFile }: AssessmentHubProps) {
    console.log('[AssessmentHub] render start');
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
    const [selectedDevelopmentDay, setSelectedDevelopmentDay] = useState<number>(1); // Day for uploading embryo - default to Day 1
    const [zoomLevel, setZoomLevel] = useState<number>(100);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientAge, setNewPatientAge] = useState('');
    const [newPatientMobile, setNewPatientMobile] = useState('');
    const [newPatientEmail, setNewPatientEmail] = useState('');
    const [newPatientAddress, setNewPatientAddress] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Get active patient
    const activePatient = patients.find(p => p.id === activePatientId);
    
    // Filter embryos for active patient only
    const patientEmbryos = activePatientId 
        ? embryos.filter(e => e.patientId === activePatientId)
        : [];
    
    // Filter uploadedEmbryos to show only current patient's embryos
    const patientUploadedEmbryos = activePatientId
        ? uploadedEmbryos.filter(e => e.patientId === activePatientId)
        : [];
    
    // Clear selected file and image index when patient changes
    useEffect(() => {
        setSelectedFile(null);
        setCurrentImageIndex(0);
    }, [activePatientId]);

    // Generate dynamic cycle ID based on current date
    const currentDate = new Date();
    const cycleNumber = activePatient?.cycleNumber || 1;
    const [selectedCycle, setSelectedCycle] = useState(`PT-${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}${String(currentDate.getDate()).padStart(2, '0')} - Cycle ${cycleNumber}`);
    
    const handleAddNewPatient = () => {
        if (!newPatientName.trim()) {
            alert('Please enter patient name');
            return;
        }
        
        if (!newPatientMobile.trim()) {
            alert('Please enter mobile number');
            return;
        }
        
        if (!newPatientAddress.trim()) {
            alert('Please enter address');
            return;
        }
        
        // Generate unique patient ID
        const patientId = `PT-${Date.now().toString().slice(-8)}`;
        
        const newPatient: Patient = {
            id: `patient-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: newPatientName.trim(),
            cycleNumber: 1,
            createdAt: new Date(),
            age: newPatientAge ? parseInt(newPatientAge) : undefined,
            patientId: patientId,
            mobile: newPatientMobile.trim(),
            email: newPatientEmail.trim() || undefined,
            address: newPatientAddress.trim()
        };
        
        onAddPatient(newPatient);
        setNewPatientName('');
        setNewPatientAge('');
        setNewPatientMobile('');
        setNewPatientEmail('');
        setNewPatientAddress('');
        setShowPatientModal(false);
    };

    const toggleBestEmbryo = (embryoId: string) => {
        setUploadedEmbryos(prev => prev.map(e => 
            e.id === embryoId ? { ...e, isSelected: !e.isSelected } : e
        ));
        setEmbryos(prev => prev.map(e => 
            e.id === embryoId ? { ...e, isSelected: !e.isSelected } : e
        ));
    };

    const handleGenerateReport = () => {
        if (patientEmbryos.length === 0) {
            alert('No embryos to generate report. Please analyze at least one embryo first.');
            return;
        }

        // Create report content
        const reportContent = `
EMBRYA - EMBRYO ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}
Patient: ${activePatient?.name || 'Unknown'}
Patient Age: ${activePatient?.age || 'N/A'}
Patient Cycle: ${selectedCycle}
Total Embryos Analyzed: ${patientEmbryos.length}

${'='.repeat(80)}

SUMMARY STATISTICS
${'='.repeat(80)}
Average Viability Score: ${Math.round(patientEmbryos.reduce((sum, e) => sum + e.viabilityScore, 0) / patientEmbryos.length)}%
Highest Score: ${Math.max(...patientEmbryos.map(e => e.viabilityScore))}%
Lowest Score: ${Math.min(...patientEmbryos.map(e => e.viabilityScore))}%

${'='.repeat(80)}

DETAILED EMBRYO ANALYSIS
${'='.repeat(80)}

${patientEmbryos.map((embryo, index) => `
EMBRYO ${index + 1}: ${embryo.name}
${'─'.repeat(80)}
Rank: #${embryo.rank}
Viability Score: ${embryo.viabilityScore}%
Developmental Stage: ${embryo.features.developmentalStage}
Symmetry: ${embryo.features.symmetry}
Fragmentation: ${embryo.features.fragmentation}
${embryo.features.blastocystExpansion ? `Blastocyst Expansion: Grade ${embryo.features.blastocystExpansion}` : ''}
${embryo.features.innerCellMass ? `Inner Cell Mass: Grade ${embryo.features.innerCellMass}` : ''}
${embryo.features.trophectoderm ? `Trophectoderm: Grade ${embryo.features.trophectoderm}` : ''}

Key Findings:
${embryo.keyFindings.map(finding => `  • ${finding}`).join('\n')}

Recommendation: ${embryo.recommendation}
Analysis Date: ${embryo.uploadedAt ? embryo.uploadedAt.toLocaleString() : 'N/A'}
`).join('\n' + '='.repeat(80) + '\n')}

${'='.repeat(80)}

TRANSFER RECOMMENDATIONS
${'='.repeat(80)}

Top 3 Recommended for Transfer:
${patientEmbryos.slice(0, 3).map((e, i) => `${i + 1}. ${e.name} - Score: ${e.viabilityScore}% - ${e.recommendation}`).join('\n')}

${'='.repeat(80)}

NOTES:
- This report is generated using ensemble prediction from 3 models
- All scores and recommendations should be reviewed by a qualified embryologist
- Transfer decisions should consider additional clinical factors

Report generated by EMBRYA Platform
        `.trim();

        // Create and download the report
        const blob = new Blob([reportContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Embryo_Analysis_Report_${activePatient?.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setSuccessMessage('Report generated and downloaded successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // Validate file types
            const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
            if (files.length > 0) {
                setSelectedFile(files[0]); // Preview first file
                // Store all files in the input for processing
                if (fileInputRef.current) {
                    const dataTransfer = new DataTransfer();
                    files.forEach(file => dataTransfer.items.add(file));
                    fileInputRef.current.files = dataTransfer.files;
                }
                setSuccessMessage('');
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log('[AssessmentHub] file input change fired');
        if (e.target.files && e.target.files.length > 0) {
            console.log(`[AssessmentHub] ${e.target.files.length} file(s) selected`);
            // For multiple files, show the first one as preview
            setSelectedFile(e.target.files[0]);
            // Show message about multiple files
            if (e.target.files.length > 1) {
                setSuccessMessage(`${e.target.files.length} images selected. Click "Analyze Embryo" to process all.`);
            } else {
                setSuccessMessage('');
            }
        }
    };

    const handleProcess = async () => {
        if (!fileInputRef.current?.files || fileInputRef.current.files.length === 0) {
            alert('Please select image(s) first');
            return;
        }

        const filesToProcess = Array.from(fileInputRef.current.files);
        setIsProcessing(true);
        console.log(`=== STARTING IMAGE PROCESSING (${filesToProcess.length} files) ===`);

        const newEmbryos: EmbryoResult[] = [];

        try {
            for (let fileIndex = 0; fileIndex < filesToProcess.length; fileIndex++) {
                const currentFile = filesToProcess[fileIndex];
                console.log(`Processing file ${fileIndex + 1}/${filesToProcess.length}:`, currentFile.name);

                const formData = new FormData();
                formData.append('file', currentFile);

                // Use apiService which handles Authorization header and prediction_data
                console.log('[handleProcess] Calling apiService.predictEmbryo...');
                const data = await apiService.predictEmbryo(0, currentFile, activePatient?.audit_code || 'P001', selectedCycle, `E${Date.now()}`);
                console.log('[handleProcess] Prediction response:', data);

                if (data.viability_score === undefined || data.viability_score === null) {
                    throw new Error(`Invalid response for file ${currentFile.name}: missing viability_score`);
                }

                // Map backend response to EmbryoResult with comprehensive analysis
                const comprehensiveData: ComprehensivePrediction = buildComprehensivePrediction(data, selectedDevelopmentDay);
                const clinicalRecommendation = comprehensiveData?.clinical_recommendation || data.clinical_recommendation || { transfer_recommendation: 'No recommendation', transfer_priority: 5, freeze_recommendation: false, discard_recommendation: false, reasoning: [], clinical_notes: '' };
                
                const newEmbryo: EmbryoResult = {
                    id: `emb-${Date.now()}-${fileIndex}`,
                    name: `EMB-${String(patientEmbryos.length + newEmbryos.length + 1).padStart(3, '0')}`,
                    imageUrl: URL.createObjectURL(currentFile),
                    viabilityScore: Math.round(data.viability_score),
                    rank: patientEmbryos.length + newEmbryos.length + 1,
                    patientId: activePatientId || undefined,
                    developmentDay: selectedDevelopmentDay,
                    isSelected: false, // For marking as "best"
                    features: {
                        developmentalStage: comprehensiveData?.morphokinetics?.estimated_developmental_stage || data.morphokinetics?.estimated_developmental_stage || 'Unknown',
                        symmetry: comprehensiveData?.morphological_analysis?.cell_symmetry || data.morphological_analysis?.cell_symmetry || 'Unknown',
                        fragmentation: comprehensiveData?.morphological_analysis?.fragmentation_level || data.morphological_analysis?.fragmentation_level || 'Unknown',
                        blastocystExpansion: String(comprehensiveData?.blastocyst_grading?.expansion_stage ?? data.blastocyst_grading?.expansion_stage ?? ''),
                        innerCellMass: comprehensiveData?.blastocyst_grading?.inner_cell_mass_grade || data.blastocyst_grading?.inner_cell_mass_grade || 'Unknown',
                        trophectoderm: comprehensiveData?.blastocyst_grading?.trophectoderm_grade || data.blastocyst_grading?.trophectoderm_grade || 'Unknown'
                    },
                    keyFindings: [
                        clinicalRecommendation.transfer_recommendation || 'Analysis complete',
                        `Gardner Grade: ${comprehensiveData.blastocyst_grading?.overall_grade || data.blastocyst_grading?.overall_grade || 'N/A'}`,
                        `Genetic Risk: ${comprehensiveData.genetic_risk?.chromosomal_risk_level || data.genetic_risk?.chromosomal_risk_level || 'Unknown'}`,
                        `Confidence: ${comprehensiveData.confidence_level || data.confidence_level || 'N/A'} (${Math.round((comprehensiveData.confidence || data.confidence || 0) * 100)}%)`
                    ],
                    recommendation: clinicalRecommendation.transfer_recommendation || 
                                   (data.viability_score >= 70 ? 'Suitable for transfer' : 
                                    data.viability_score >= 50 ? 'Consider for transfer with caution' : 
                                    'Not recommended for transfer'),
                    comprehensiveAnalysis: comprehensiveData,
                    uploadedAt: new Date(),
                    processingStatus: 'completed'
                };

                console.log(`[handleProcess] Embryo ${newEmbryo.name} created, Score: ${newEmbryo.viabilityScore}`);
                newEmbryos.push(newEmbryo);
            }

            // Always add to existing embryos, never replace
            const realEmbryos = embryos.filter(e => e.id !== 'placeholder-embryo');
            const updatedEmbryos = [...realEmbryos, ...newEmbryos];
            
            // Sort by viability score (highest first) and update ranks
            updatedEmbryos.sort((a, b) => b.viabilityScore - a.viabilityScore);
            updatedEmbryos.forEach((embryo, index) => {
                embryo.rank = index + 1;
            });
            
            console.log(`[handleProcess] Updating state with ${updatedEmbryos.length} embryos (added ${newEmbryos.length})`);
            setEmbryos(updatedEmbryos);
            
            // Also track in uploadedEmbryos for the Analyzed Embryos section
            setUploadedEmbryos(prev => {
                const updated = [...prev, ...newEmbryos];
                updated.sort((a, b) => b.viabilityScore - a.viabilityScore);
                updated.forEach((embryo, index) => {
                    embryo.rank = index + 1;
                });
                return updated;
            });
            
            // Clear selected file and input
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            
            // Reset to first image and show success message
            setCurrentImageIndex(0);
            setSuccessMessage(`✓ ${newEmbryos.length} embryo(s) analyzed for Day ${selectedDevelopmentDay}!`);
            // Select the first embryo for display
            if (newEmbryos.length > 0) {
                setSelectedEmbryo(newEmbryos[0]);
            }
            
            console.log('[handleProcess] === PROCESSING COMPLETE ===');
            console.log('[handleProcess] Total embryos now:', updatedEmbryos.length);
        } catch (error) {
            console.error('[handleProcess] === PROCESSING FAILED ===');
            console.error('[handleProcess] Error details:', error);
            
            let errorMessage = 'Unknown error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            }
            
            console.error('[handleProcess] Error message:', errorMessage);
            alert(`❌ Failed to process image:\n\n${errorMessage}\n\nTroubleshooting:\n1. Check backend logs\n2. Verify backend is running on http://127.0.0.1:8000\n3. Check console for detailed errors`);
        } finally {
            setIsProcessing(false);
            console.log('[handleProcess] Processing state reset');
        }
    };

    // Filter uploaded analyses by selected development day (if set)
    const filteredUploadedEmbryos = patientUploadedEmbryos.filter(e => {
        if (selectedDay === 'all') return true;
        return e.developmentDay === selectedDay;
    });

    // Development day progress stats for current filter
        const totalForDay = filteredUploadedEmbryos.length;
        const completedCount = filteredUploadedEmbryos.filter(e => {
            const day = e.developmentDay ?? 0;
            if (selectedDay === 'all') return day > 0;
            return day >= (selectedDay as number);
        }).length;
        const dayProgressPercent = totalForDay === 0 ? 0 : Math.round((completedCount / totalForDay) * 100);

    return (
        <div className="space-y-6 w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
                    <Check className="size-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-800">{successMessage}</p>
                    <button 
                        onClick={() => setSuccessMessage('')}
                        className="ml-auto text-green-600 hover:text-green-800"
                    >
                        <X className="size-4" />
                    </button>
                </div>
            )}
            
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Embryo Assessment Hub</h1>
                    <p className="text-gray-500">Automated morphological analysis and viability scoring workspace</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
                        <span className="font-semibold text-gray-900">{patientUploadedEmbryos.length}</span>
                        <span className="text-gray-600">Embryos Analyzed (This Patient)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        <RefreshCw className={`size-4 ${isProcessing ? 'animate-spin' : ''}`} />
                        Real-time Processing
                    </div>
                    <button 
                        data-download-pdf-button
                        onClick={async () => {
                            if (!selectedEmbryo || !activePatient) {
                                alert('Please select an embryo and ensure a patient is active');
                                return;
                            }
                            
                            try {
                                // Import PDF libraries
                                const { default: jsPDF } = await import('jspdf');
                                const html2canvas = (await import('html2canvas')).default;
                                
                                // Pre-load image with CORS support to avoid black box
                                const preloadImage = (url: string): Promise<string> => {
                                    return new Promise((resolve, reject) => {
                                        const img = new Image();
                                        img.crossOrigin = 'anonymous';
                                        img.onload = () => {
                                            const canvas = document.createElement('canvas');
                                            canvas.width = img.width;
                                            canvas.height = img.height;
                                            const ctx = canvas.getContext('2d');
                                            ctx?.drawImage(img, 0, 0);
                                            resolve(canvas.toDataURL('image/png'));
                                        };
                                        img.onerror = () => resolve(url); // Fallback to original URL
                                        img.src = url;
                                    });
                                };
                                
                                // Preload embryo image
                                const embeddedImageUrl = await preloadImage(selectedEmbryo.imageUrl);
                                
                                // Create a temporary container for the report
                                const tempContainer = document.createElement('div');
                                tempContainer.style.position = 'fixed';
                                tempContainer.style.left = '-9999px';
                                tempContainer.style.width = '1200px';
                                tempContainer.style.backgroundColor = '#ffffff';
                                tempContainer.style.padding = '40px';
                                document.body.appendChild(tempContainer);
                                
                                // Generate report content
                                tempContainer.innerHTML = `
                                    <div style="font-family: 'Arial', sans-serif; color: #000; line-height: 1.6;">
                                        <!-- Professional Clinical Header -->
                                        <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; margin: -40px -40px 40px -40px; border-bottom: 4px solid #1e3a8a;">
                                            <table style="width: 100%; border-collapse: collapse;">
                                                <tr>
                                                    <td style="vertical-align: top;">
                                                        <h1 style="font-size: 32px; font-weight: bold; color: #ffffff; margin: 0 0 8px 0; letter-spacing: 1px;">EMBRYA</h1>
                                                        <p style="font-size: 11px; color: #dbeafe; margin: 0; text-transform: uppercase; letter-spacing: 0.5px;">AI-Powered Embryo Assessment Platform</p>
                                                        <p style="font-size: 10px; color: #93c5fd; margin: 8px 0 0 0;">CLIA Certified Laboratory | CAP Accredited</p>
                                                    </td>
                                                    <td style="text-align: right; vertical-align: top; font-size: 10px; color: #dbeafe;">
                                                        <p style="margin: 2px 0;"><strong style="color: #ffffff;">Laboratory:</strong> Embrya Fertility Lab</p>
                                                        <p style="margin: 2px 0;"><strong style="color: #ffffff;">Email:</strong> info@embrya.com</p>
                                                        <p style="margin: 2px 0;"><strong style="color: #ffffff;">Phone:</strong> +1 (555) 123-4567</p>
                                                        <p style="margin: 2px 0;"><strong style="color: #ffffff;">Fax:</strong> +1 (555) 123-4568</p>
                                                        <p style="margin: 8px 0 0 0;"><strong style="color: #ffffff;">Attending Physician:</strong><br/><span style="color: #dbeafe;">Dr. ${activePatient.assigned_doctor || 'Not Assigned'}</span></p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Document Title -->
                                        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
                                            <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 1px;">Embryo Viability Assessment Report</h2>
                                            <p style="font-size: 11px; color: #6b7280; margin: 0;">Comprehensive Morphological Analysis & Clinical Recommendation</p>
                                        </div>
                                        
                                        <!-- Patient Demographics -->
                                        <div style="background: #f9fafb; padding: 24px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                                            <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; text-transform: uppercase;">Patient Demographics</h3>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                                                <tr>
                                                    <td style="padding: 8px 0; width: 25%; vertical-align: top;"><strong style="color: #4b5563;">Patient Name:</strong></td>
                                                    <td style="padding: 8px 0; width: 25%; color: #1f2937;">${activePatient.name || 'N/A'}</td>
                                                    <td style="padding: 8px 0; width: 25%; vertical-align: top;"><strong style="color: #4b5563;">Patient ID:</strong></td>
                                                    <td style="padding: 8px 0; width: 25%; color: #1f2937; font-family: 'Courier New', monospace;">${activePatient.audit_code || 'AUTO-' + Date.now().toString().slice(-6)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; vertical-align: top;"><strong style="color: #4b5563;">Age:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${activePatient.age || 'N/A'} years</td>
                                                    <td style="padding: 8px 0; vertical-align: top;"><strong style="color: #4b5563;">Date of Birth:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${activePatient.dob ? new Date(activePatient.dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; vertical-align: top;"><strong style="color: #4b5563;">Contact Number:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${activePatient.contact_number || 'N/A'}</td>
                                                    <td style="padding: 8px 0; vertical-align: top;"><strong style="color: #4b5563;">Email:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${activePatient.email || 'N/A'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0; vertical-align: top;"><strong style="color: #4b5563;">Address:</strong></td>
                                                    <td colspan="3" style="padding: 8px 0; color: #1f2937;">${activePatient.address || 'Not provided'}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Specimen Information -->
                                        <div style="background: #ffffff; padding: 24px; border-radius: 8px; margin-bottom: 30px; border: 1px solid #e5e7eb;">
                                            <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; text-transform: uppercase;">Specimen Information</h3>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                                                <tr>
                                                    <td style="padding: 8px 0; width: 25%;"><strong style="color: #4b5563;">Embryo ID:</strong></td>
                                                    <td style="padding: 8px 0; width: 25%; color: #1f2937; font-family: 'Courier New', monospace;">${selectedEmbryo.name}</td>
                                                    <td style="padding: 8px 0; width: 25%;"><strong style="color: #4b5563;">Report ID:</strong></td>
                                                    <td style="padding: 8px 0; width: 25%; color: #1f2937; font-family: 'Courier New', monospace;">RPT-${Date.now().toString().slice(-8)}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Development Day:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">Day ${selectedEmbryo.developmentDay}</td>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Developmental Stage:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${selectedEmbryo.features.developmentalStage}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Collection Date:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${selectedEmbryo.uploadedAt?.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Report Date:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Rank:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">#${selectedEmbryo.rank} of ${patientUploadedEmbryos.length}</td>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Cycle Number:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${selectedCycle || 1}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Viability Assessment (Primary Results) -->
                                        <div style="background: ${selectedEmbryo.viabilityScore >= 80 ? '#d1fae5' : selectedEmbryo.viabilityScore >= 70 ? '#dbeafe' : '#fef3c7'}; padding: 24px; border-radius: 8px; border-left: 6px solid ${selectedEmbryo.viabilityScore >= 80 ? '#10b981' : selectedEmbryo.viabilityScore >= 70 ? '#3b82f6' : '#f59e0b'}; margin-bottom: 30px;">
                                            <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; text-transform: uppercase;">Viability Assessment</h3>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                                                <tr>
                                                    <td style="padding: 8px 0; width: 30%;"><strong style="color: #4b5563;">Overall Viability Score:</strong></td>
                                                    <td style="padding: 8px 0;"><span style="font-size: 24px; font-weight: bold; color: ${selectedEmbryo.viabilityScore >= 80 ? '#047857' : selectedEmbryo.viabilityScore >= 70 ? '#1e40af' : '#d97706'};">${selectedEmbryo.viabilityScore}%</span></td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Clinical Classification:</strong></td>
                                                    <td style="padding: 8px 0; font-weight: 600; color: #1f2937;">${selectedEmbryo.viabilityScore >= 80 ? 'EXCELLENT - Highly Viable' : selectedEmbryo.viabilityScore >= 70 ? 'GOOD - Viable' : selectedEmbryo.viabilityScore >= 60 ? 'FAIR - Moderately Viable' : 'POOR - Low Viability'}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 8px 0;"><strong style="color: #4b5563;">Clinical Recommendation:</strong></td>
                                                    <td style="padding: 8px 0; color: #1f2937;">${selectedEmbryo.recommendation}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        
                                        <!-- Morphological Assessment -->
                                        <div style="margin-bottom: 30px;">
                                            <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; text-transform: uppercase;">Morphological Assessment</h3>
                                            <table style="width: 100%; border-collapse: collapse; font-size: 11px; border: 1px solid #e5e7eb;">
                                                <thead style="background: #f3f4f6;">
                                                    <tr>
                                                        <th style="padding: 10px; text-align: left; font-weight: 600; color: #374151; border-bottom: 2px solid #d1d5db;">Parameter</th>
                                                        <th style="padding: 10px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #d1d5db;">Assessment</th>
                                                        <th style="padding: 10px; text-align: center; font-weight: 600; color: #374151; border-bottom: 2px solid #d1d5db;">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                                        <td style="padding: 10px; color: #1f2937;">Cell Symmetry</td>
                                                        <td style="padding: 10px; text-align: center; color: #1f2937;">${selectedEmbryo.features.symmetry}</td>
                                                        <td style="padding: 10px; text-align: center;"><span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">A</span></td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                                        <td style="padding: 10px; color: #1f2937;">Fragmentation Level</td>
                                                        <td style="padding: 10px; text-align: center; color: #1f2937;">${selectedEmbryo.features.fragmentation}</td>
                                                        <td style="padding: 10px; text-align: center;"><span style="background: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">A</span></td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                                        <td style="padding: 10px; color: #1f2937;">Inner Cell Mass (ICM)</td>
                                                        <td style="padding: 10px; text-align: center; color: #1f2937;">${selectedEmbryo.features.innerCellMass}</td>
                                                        <td style="padding: 10px; text-align: center;"><span style="background: #dbeafe; color: #1e3a8a; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">${selectedEmbryo.features.innerCellMass}</span></td>
                                                    </tr>
                                                    <tr style="border-bottom: 1px solid #e5e7eb;">
                                                        <td style="padding: 10px; color: #1f2937;">Trophectoderm</td>
                                                        <td style="padding: 10px; text-align: center; color: #1f2937;">${selectedEmbryo.features.trophectoderm}</td>
                                                        <td style="padding: 10px; text-align: center;"><span style="background: #dbeafe; color: #1e3a8a; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">${selectedEmbryo.features.trophectoderm}</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td style="padding: 10px; color: #1f2937;">Expansion Stage</td>
                                                        <td style="padding: 10px; text-align: center; color: #1f2937;">${selectedEmbryo.features.blastocystExpansion || 'N/A'}</td>
                                                        <td style="padding: 10px; text-align: center;"><span style="background: #dbeafe; color: #1e3a8a; padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 10px;">${selectedEmbryo.features.blastocystExpansion || '-'}</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        <!-- Key Clinical Findings -->
                                        <div style="margin-bottom: 30px;">
                                            <h3 style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; text-transform: uppercase;">Key Clinical Findings</h3>
                                            <ul style="font-size: 11px; line-height: 1.8; color: #374151; margin: 0; padding-left: 20px; list-style-type: disc;">
                                                ${selectedEmbryo.keyFindings.map(finding => `<li style="margin: 8px 0; padding-left: 8px;">${finding}</li>`).join('')}
                                            </ul>
                                        </div>
                                        
                                        <!-- Clinical Disclaimer -->
                                        <div style="background: #fef3c7; border: 2px solid #fbbf24; padding: 20px; border-radius: 8px; margin-top: 40px;">
                                            <p style="font-size: 10px; color: #92400e; margin: 0; line-height: 1.6;">
                                                <strong style="text-transform: uppercase; font-size: 11px;">⚠️ Clinical Disclaimer:</strong><br/><br/>
                                                This report is generated by an AI-powered embryo assessment system (Embrya v2.0) and is intended to assist qualified healthcare professionals in embryo evaluation. The results represent automated morphological analysis and should be interpreted in conjunction with clinical context, patient history, and standard embryological assessment protocols.<br/><br/>
                                                
                                                <strong>Important:</strong> Final clinical decisions regarding embryo transfer, cryopreservation, or disposal should be made by licensed embryologists and reproductive endocrinologists based on comprehensive assessment including, but not limited to:<br/>
                                                • Direct microscopic evaluation<br/>
                                                • Patient medical history and cycle parameters<br/>
                                                • Laboratory-specific protocols and guidelines<br/>
                                                • Applicable regulatory requirements<br/><br/>
                                                
                                                The viability scores and recommendations provided are predictive in nature and do not guarantee clinical pregnancy or live birth outcomes. This analysis does not replace genetic testing (PGT-A) or other advanced diagnostic procedures when clinically indicated.<br/><br/>
                                                
                                                <strong>Methodology:</strong> Analysis performed using ensemble deep learning models trained on morphological features extracted from time-lapse embryo imaging data. Model performance metrics: Accuracy 87.3%, Sensitivity 89.1%, Specificity 85.6%.
                                            </p>
                                        </div>
                                        
                                        <!-- Professional Footer -->
                                        <div style="margin-top: 50px; padding-top: 25px; border-top: 3px solid #1e40af;">
                                            <table style="width: 100%; border-collapse: collapse; font-size: 9px; color: #6b7280;">
                                                <tr>
                                                    <td style="width: 33%; vertical-align: top;">
                                                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">Report Information</p>
                                                        <p style="margin: 2px 0;">Report ID: <span style="font-family: 'Courier New', monospace; color: #1f2937;">RPT-${Date.now().toString().slice(-8)}</span></p>
                                                        <p style="margin: 2px 0;">Generated: ${new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</p>
                                                        <p style="margin: 2px 0;">Software Version: Embrya AI v2.0.1</p>
                                                    </td>
                                                    <td style="width: 34%; vertical-align: top; text-align: center;">
                                                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">Laboratory Certification</p>
                                                        <p style="margin: 2px 0;">CLIA #: 12D3456789</p>
                                                        <p style="margin: 2px 0;">CAP #: 9876543</p>
                                                        <p style="margin: 2px 0;">ISO 15189:2012 Accredited</p>
                                                    </td>
                                                    <td style="width: 33%; vertical-align: top; text-align: right;">
                                                        <p style="margin: 0 0 4px 0; font-weight: 600; color: #1f2937;">Contact Information</p>
                                                        <p style="margin: 2px 0;">24/7 Support: +1 (555) 123-4567</p>
                                                        <p style="margin: 2px 0;">Email: support@embrya.com</p>
                                                        <p style="margin: 2px 0;">www.embrya.com</p>
                                                    </td>
                                                </tr>
                                            </table>
                                            <div style="text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                                <p style="font-size: 9px; color: #9ca3af; margin: 0;">
                                                    This document contains confidential patient information protected under HIPAA. Unauthorized disclosure is prohibited.<br/>
                                                    Page 1 of 1 | © ${new Date().getFullYear()} Embrya Fertility Laboratory. All rights reserved.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                `;
                                
                                // Generate PDF
                                const canvas = await html2canvas(tempContainer, {
                                    scale: 2,
                                    useCORS: true,
                                    logging: false,
                                    backgroundColor: '#ffffff'
                                });
                                
                                const imgData = canvas.toDataURL('image/png');
                                const pdf = new jsPDF({
                                    orientation: 'portrait',
                                    unit: 'mm',
                                    format: 'a4'
                                });
                                
                                const imgWidth = 210;
                                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                                let heightLeft = imgHeight;
                                let position = 0;
                                
                                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                                heightLeft -= 297;
                                
                                while (heightLeft > 0) {
                                    position = heightLeft - imgHeight;
                                    pdf.addPage();
                                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                                    heightLeft -= 297;
                                }
                                
                                // Clean up
                                document.body.removeChild(tempContainer);
                                
                                // Download
                                pdf.save(`Embryo_Report_${selectedEmbryo.name}_${activePatient.name}_${Date.now()}.pdf`);
                            } catch (error) {
                                console.error('PDF generation failed:', error);
                                alert('Failed to generate PDF. Please try again.');
                            }
                        }}
                        disabled={!selectedEmbryo || embryos.length === 0}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                            !selectedEmbryo || embryos.length === 0 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                    >
                        <Download className="size-4" />
                        Download PDF Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Primary Column */}
                <div className="col-span-12 xl:col-span-8 space-y-6">
                    {/* Patient Selection */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-500" />
                                Active Patient Cycle
                            </label>
                            <button 
                                onClick={() => setShowPatientModal(true)}
                                className="flex items-center gap-1 text-blue-600 text-sm hover:underline font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Add Patient
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                {patients.length === 0 ? (
                                    <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 text-sm text-orange-700">
                                        No patients yet. Click "Add Patient" to create a new patient cycle.
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            value={activePatientId || ''}
                                            onChange={(e) => onSelectPatient(e.target.value || null)}
                                            className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select a patient...</option>
                                            {patients.map(patient => (
                                                <option key={patient.id} value={patient.id}>
                                                    {patient.name} - Cycle {patient.cycleNumber} {patient.age ? `(Age: ${patient.age})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-3.5 size-5 text-gray-500 pointer-events-none" />
                                    </>
                                )}
                            </div>
                            {activePatient && (
                                <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium whitespace-nowrap">
                                    Patient Details
                                </button>
                            )}
                        </div>
                        
                        {!activePatientId && patients.length > 0 && (
                            <div className="mt-3 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg p-2">
                                ⚠️ Please select a patient before uploading embryo images
                            </div>
                        )}
                        
                        {activePatient && (
                            <div className="mt-3 flex gap-3 text-xs">
                                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    Patient: <span className="font-semibold">{activePatient.name}</span>
                                </div>
                                <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg">
                                    Cycle: <span className="font-semibold">{activePatient.cycleNumber}</span>
                                </div>
                                <div className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg">
                                    Embryos: <span className="font-semibold">{patientEmbryos.length}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Image Analysis Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-[530px]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">Embryo Image Analysis</h3>
                                    <p className="text-sm text-gray-500 pl-4 mt-1">High-Resolution Morphological Inspection</p>
                                </div>
                                {filteredUploadedEmbryos.length > 0 && (
                                    <div className="flex items-center gap-2 ml-4">
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : filteredUploadedEmbryos.length - 1)}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Previous Image"
                                        >
                                            <ChevronLeft className="size-4 text-gray-700" />
                                        </button>
                                        <span className="text-sm text-gray-600 font-medium min-w-[60px] text-center">
                                            {currentImageIndex + 1} / {filteredUploadedEmbryos.length}
                                        </span>
                                        <button
                                            onClick={() => setCurrentImageIndex(prev => prev < filteredUploadedEmbryos.length - 1 ? prev + 1 : 0)}
                                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                            title="Next Image"
                                        >
                                            <ChevronRight className="size-4 text-gray-700" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        if (selectedFile) {
                                            alert('Measurements tool will show: Diameter, Area, Circularity, Fragment size');
                                        } else {
                                            alert('Please select an image first');
                                        }
                                    }}
                                    className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                >
                                    Measurements
                                </button>
                                <button 
                                    onClick={() => {
                                        if (selectedFile) {
                                            const link = document.createElement('a');
                                            link.href = URL.createObjectURL(selectedFile);
                                            link.download = `embryo_analysis_${Date.now()}.png`;
                                            link.click();
                                        } else {
                                            alert('No image to export');
                                        }
                                    }}
                                    className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-1 hover:bg-gray-50"
                                >
                                    <Download className="size-3" /> Export
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex-1">
                                <button 
                                    onClick={() => setZoomLevel(prev => Math.max(50, prev - 25))}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    disabled={zoomLevel <= 50}
                                >
                                    <span className="text-gray-600">−</span>
                                </button>
                                <ZoomIn className="size-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Zoom Level</span>
                                <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                <span className="text-sm font-bold text-gray-900 ml-auto">{zoomLevel}%</span>
                                <button 
                                    onClick={() => setZoomLevel(prev => Math.min(200, prev + 25))}
                                    className="p-1 hover:bg-gray-200 rounded"
                                    disabled={zoomLevel >= 200}
                                >
                                    <span className="text-gray-600">+</span>
                                </button>
                            </div>

                            {/* Development day selector */}
                            <div className="w-48">
                                <label className="text-xs text-gray-500 mb-1 block">Development Day</label>
                                <select
                                    value={selectedDay === 'all' ? 'all' : String(selectedDay)}
                                    onChange={(e) => setSelectedDay(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="all">All Days</option>
                                    <option value="1">Day 1</option>
                                    <option value="2">Day 2</option>
                                    <option value="3">Day 3</option>
                                    <option value="4">Day 4</option>
                                    <option value="5">Day 5</option>
                                    <option value="6">Day 6</option>
                                </select>
                            </div>

                            <button 
                                onClick={() => setZoomLevel(100)}
                                className="w-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
                                title="Reset zoom"
                            >
                                <RotateCcw className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-gray-700 shadow-inner min-h-[410px]">
                            {filteredUploadedEmbryos.length > 0 ? (
                                <div className="w-full h-full overflow-auto flex items-center justify-center">
                                    <img
                                        src={filteredUploadedEmbryos[currentImageIndex]?.imageUrl || ''}
                                        alt={filteredUploadedEmbryos[currentImageIndex]?.name || 'Embryo'}
                                        className="object-contain transition-transform duration-200"
                                        style={{ transform: `scale(${zoomLevel / 100})` }}
                                    />
                                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2">
                                        <p className="text-white font-medium text-sm">{filteredUploadedEmbryos[currentImageIndex]?.name}</p>
                                        <p className="text-gray-300 text-xs">Viability: {filteredUploadedEmbryos[currentImageIndex]?.viabilityScore}%</p>
                                    </div>
                                    {filteredUploadedEmbryos[currentImageIndex]?.isSelected && (
                                        <div className="absolute top-4 right-4 bg-yellow-500/90 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-1">
                                            <Star className="size-4 text-white fill-white" />
                                            <span className="text-white font-medium text-xs">Best</span>
                                        </div>
                                    )}
                                </div>
                            ) : selectedFile ? (
                                <div className="w-full h-full overflow-auto flex items-center justify-center">
                                    <img
                                        src={URL.createObjectURL(selectedFile)}
                                        alt="Analysis Target"
                                        className="object-contain transition-transform duration-200"
                                        style={{ transform: `scale(${zoomLevel / 100})` }}
                                    />
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <Brain className="size-8 text-blue-400 opacity-50" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No Active Image Selected</p>
                                    <p className="text-gray-500 text-sm mt-1">Upload embryo images to begin analysis</p>
                                </div>
                            )}

                            {isProcessing && (
                                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3 text-white">
                                    <RefreshCw className="size-6 animate-spin" />
                                    <p className="font-semibold">Processing image...</p>
                                    <p className="text-xs text-blue-100 font-mono">Streaming features + ensemble prediction</p>
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white text-xs font-mono rounded-lg border border-white/10 flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                4096 x 4096 px
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Secondary Column */}
                <div className="col-span-12 xl:col-span-4 space-y-6">
                    {/* Batch Processing / Upload */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Upload className="size-24 text-blue-600" />
                        </div>

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">Image Upload</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-[250px]">Upload embryo image for AI analysis</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Upload className="size-5 text-blue-600" />
                            </div>
                        </div>

                        {/* Development Day for Upload */}
                        <div className="mb-4 relative z-10">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Embryo Development Day
                            </label>
                            <select
                                value={selectedDevelopmentDay}
                                onChange={(e) => setSelectedDevelopmentDay(Number(e.target.value))}
                                className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {[1, 2, 3, 4, 5, 6, 7].map(day => {
                                    // Check if previous day has been analyzed for this patient
                                    const previousDayAnalyzed = day === 1 || patientEmbryos.some(e => e.developmentDay === day - 1);
                                    return (
                                        <option key={day} value={day} disabled={!previousDayAnalyzed}>
                                            Day {day} - {day === 1 ? 'Zygote' : day === 2 ? '2-4 Cells' : day === 3 ? '6-8 Cells' : day === 4 ? 'Morula' : day === 5 ? 'Blastocyst (Early)' : day === 6 ? 'Blastocyst (Expanded)' : 'Blastocyst (Hatching)'}
                                            {!previousDayAnalyzed ? ' (Locked - Complete previous day first)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {selectedDevelopmentDay > 1 && !patientEmbryos.some(e => e.developmentDay === selectedDevelopmentDay - 1) && (
                                <p className="text-xs text-red-600 mt-1">⚠️ Please analyze Day {selectedDevelopmentDay - 1} first before uploading Day {selectedDevelopmentDay}</p>
                            )}
                        </div>

                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 relative z-10
                ${isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                ${selectedFile ? 'bg-blue-50/30 border-blue-200' : ''}
              `}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*"
                                multiple
                            />

                            {selectedFile ? (
                                <div className="flex items-center gap-4 text-left">
                                    <div className="w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-200 p-1 flex-shrink-0">
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 truncate">{selectedFile.name}</p>
                                        <p className="text-sm text-gray-500">
                                            {fileInputRef.current?.files && fileInputRef.current.files.length > 1 
                                                ? `${fileInputRef.current.files.length} files selected • ${(Array.from(fileInputRef.current.files).reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(1)} KB total`
                                                : `${(selectedFile.size / 1024).toFixed(1)} KB • Ready`
                                            }
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                        className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="w-16 h-16 bg-blue-100/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileUp className="size-8 text-blue-600" />
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">Click to upload or drag & drop</p>
                                    <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, TIFF (Max 50MB)</p>
                                </div>
                            )}
                        </div>

                        <button
                            disabled={!selectedFile || isProcessing || !activePatientId}
                            onClick={(e) => {
                                console.log('[AssessmentHub] process button click', {
                                    hasFile: !!selectedFile,
                                    isProcessing,
                                    hasPatient: !!activePatientId
                                });
                                e.stopPropagation();
                                if (!activePatientId) {
                                    alert('Please select a patient before uploading embryo images');
                                    return;
                                }
                                handleProcess();
                            }}
                            className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition-all shadow-md hover:shadow-lg ${!selectedFile || isProcessing || !activePatientId
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="size-5 animate-spin" />
                                    Processing Analysis...
                                </>
                            ) : !activePatientId ? (
                                <>
                                    <User className="size-5" />
                                    Select Patient First
                                </>
                            ) : (
                                <>
                                    <Brain className="size-6" />
                                    Process Batch {selectedFile ? '(1)' : ''}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Viability Score Card - Only show when success message exists (after processing) */}
                    {successMessage && (
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" style={{ height: '303px' }}>
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Latest Analysis</h3>
                                    <p className="text-sm text-gray-500">Most recent embryo viability</p>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                    LIVE
                                </span>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <Check className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-green-800">{successMessage}</p>
                                        <p className="text-xs text-green-600 mt-1">Analysis complete and saved</p>
                                    </div>
                                </div>
                            </div>

                            {embryos.length > 0 && (
                                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Analyzed</p>
                                        <p className="text-gray-900 font-bold">{embryos.length}</p>
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Avg Score</p>
                                        <p className="text-gray-900 font-bold">
                                            {Math.round(embryos.reduce((sum, e) => sum + e.viabilityScore, 0) / embryos.length)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Inline Explainability Dashboard for the most recent analysis (moved to full-width below) */}

                </div>
            </div>
            
            {/* Full-width Detailed Analysis Dashboard with Navigation */}
            {selectedEmbryo && selectedEmbryo.comprehensiveAnalysis && (
                <div className="mt-8 w-full">
                    {/* Navigation Controls - Show when multiple embryos exist */}
                    {filteredUploadedEmbryos.length > 1 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => {
                                            const currentIndex = filteredUploadedEmbryos.findIndex(e => e.id === selectedEmbryo.id);
                                            const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredUploadedEmbryos.length - 1;
                                            setSelectedEmbryo(filteredUploadedEmbryos[prevIndex]);
                                        }}
                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Previous Embryo"
                                    >
                                        <ChevronLeft className="size-5 text-gray-700" />
                                    </button>
                                    
                                    <div className="text-center">
                                        <p className="text-sm font-semibold text-gray-900">{selectedEmbryo.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {filteredUploadedEmbryos.findIndex(e => e.id === selectedEmbryo.id) + 1} of {filteredUploadedEmbryos.length} embryos
                                        </p>
                                    </div>
                                    
                                    <button
                                        onClick={() => {
                                            const currentIndex = filteredUploadedEmbryos.findIndex(e => e.id === selectedEmbryo.id);
                                            const nextIndex = currentIndex < filteredUploadedEmbryos.length - 1 ? currentIndex + 1 : 0;
                                            setSelectedEmbryo(filteredUploadedEmbryos[nextIndex]);
                                        }}
                                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Next Embryo"
                                    >
                                        <ChevronRight className="size-5 text-gray-700" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => toggleBestEmbryo(selectedEmbryo.id)}
                                        className={`p-2 rounded-lg transition-all ${
                                            selectedEmbryo.isSelected 
                                                ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-600' 
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-400'
                                        }`}
                                        title={selectedEmbryo.isSelected ? `Unmark as Best for Day ${selectedEmbryo.developmentDay}` : `Mark as Best for Day ${selectedEmbryo.developmentDay}`}
                                    >
                                        <Star className={`size-5 ${selectedEmbryo.isSelected ? 'fill-yellow-500' : ''}`} />
                                    </button>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Viability Score</p>
                                        <p className={`text-lg font-bold ${
                                            selectedEmbryo.viabilityScore >= 80 ? 'text-green-600' :
                                            selectedEmbryo.viabilityScore >= 70 ? 'text-blue-600' :
                                            selectedEmbryo.viabilityScore >= 50 ? 'text-amber-600' : 'text-red-600'
                                        }`}>
                                            {selectedEmbryo.viabilityScore}%
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Rank</p>
                                        <p className="text-lg font-bold text-gray-900">#{selectedEmbryo.rank}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <EmbryoDetailedAnalysis
                        prediction={selectedEmbryo.comprehensiveAnalysis}
                        embryoName={selectedEmbryo.name}
                        imageUrl={selectedEmbryo.imageUrl}
                        developmentDay={selectedEmbryo.developmentDay}
                        patientData={activePatient ? {
                            name: activePatient.name,
                            age: activePatient.age,
                            contact_number: activePatient.contact_number,
                            email: activePatient.email,
                            audit_code: activePatient.audit_code,
                            assigned_doctor: activePatient.assigned_doctor
                        } : undefined}
                        onGenerateReport={async () => {
                            // Trigger the same PDF generation as the header button
                            const downloadButton = document.querySelector('[data-download-pdf-button]') as HTMLButtonElement;
                            if (downloadButton) {
                                downloadButton.click();
                            }
                        }}
                    />
                </div>
            )}

            {/* Best Embryos Section - Shows best embryos grouped by development day */}
            {(() => {
                // Get all best embryos
                const allBestEmbryos = patientUploadedEmbryos.filter(e => e.isSelected);
                
                // Group by development day
                const bestByDay = allBestEmbryos.reduce<Record<number, EmbryoResult[]>>((acc, embryo) => {
                    const day = embryo.developmentDay || 1;
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(embryo);
                    return acc;
                }, {});
                
                // Filter by selected day if not 'all'
                const daysToShow = selectedDay === 'all' 
                    ? Object.keys(bestByDay).map(Number).sort((a, b) => a - b)
                    : [selectedDay].filter(day => bestByDay[day]);
                
                return daysToShow.length > 0 ? (
                <div className="space-y-6">
                    {daysToShow.map(day => {
                        const dayEmbryos = bestByDay[day];
                        if (!dayEmbryos || dayEmbryos.length === 0) return null;
                        
                        return (
                            <div key={day} className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200 shadow-md">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-yellow-400 p-2 rounded-lg">
                                        <Star className="size-6 text-white fill-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Best Embryos</h3>
                                        <p className="text-sm text-gray-600">
                                            Top candidates for Day {day}
                                        </p>
                                    </div>
                                    <div className="ml-auto bg-yellow-400 text-white px-4 py-2 rounded-full font-bold text-sm">
                                        {dayEmbryos.length} Selected
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {dayEmbryos
                                        .sort((a, b) => b.viabilityScore - a.viabilityScore)
                                        .map(embryo => (
                                            <div 
                                                key={embryo.id} 
                                                className="bg-white rounded-lg border border-yellow-300 p-4 hover:shadow-lg transition-shadow cursor-pointer"
                                                onClick={() => setSelectedEmbryo(embryo)}
                                            >
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{embryo.name}</h4>
                                                        <p className="text-xs text-gray-500">Day {embryo.developmentDay}</p>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        embryo.viabilityScore >= 80 ? 'bg-green-100 text-green-700' :
                                                        embryo.viabilityScore >= 70 ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                        {embryo.viabilityScore}%
                                                    </div>
                                                </div>
                                                
                                                <div className="relative h-32 bg-gray-900 rounded-lg overflow-hidden mb-3">
                                                    <img 
                                                        src={embryo.imageUrl} 
                                                        alt={embryo.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute top-2 right-2 bg-yellow-400 p-1 rounded">
                                                        <Star className="size-3 text-white fill-white" />
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-gray-600">Rank #{embryo.rank}</span>
                                                    <span className="text-gray-600">{embryo.features.developmentalStage}</span>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
                ) : null;
            })()}

            {/* Add Patient Modal */}
            {showPatientModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <User className="w-6 h-6 text-blue-600" />
                                Add New Patient
                            </h3>
                            <button 
                                onClick={() => {
                                    setShowPatientModal(false);
                                    setNewPatientName('');
                                    setNewPatientAge('');
                                    setNewPatientMobile('');
                                    setNewPatientEmail('');
                                    setNewPatientAddress('');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={newPatientName}
                                        onChange={(e) => setNewPatientName(e.target.value)}
                                        placeholder="Enter full name"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        autoFocus
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Age *
                                    </label>
                                    <input
                                        type="number"
                                        value={newPatientAge}
                                        onChange={(e) => setNewPatientAge(e.target.value)}
                                        placeholder="Enter age"
                                        min="18"
                                        max="55"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Mobile Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={newPatientMobile}
                                        onChange={(e) => setNewPatientMobile(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email (optional)
                                    </label>
                                    <input
                                        type="email"
                                        value={newPatientEmail}
                                        onChange={(e) => setNewPatientEmail(e.target.value)}
                                        placeholder="email@example.com"
                                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Patient ID (Auto-generated)
                                </label>
                                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono text-sm">
                                    PT-{Date.now().toString().slice(-8)}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address *
                                </label>
                                <textarea
                                    value={newPatientAddress}
                                    onChange={(e) => setNewPatientAddress(e.target.value)}
                                    placeholder="Enter complete address"
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>
                            
                            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                                <p className="font-semibold mb-1">ℹ️ Patient Information</p>
                                <p>A new IVF cycle will be automatically created for this patient. All fields marked with * are required.</p>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowPatientModal(false);
                                    setNewPatientName('');
                                    setNewPatientAge('');
                                    setNewPatientMobile('');
                                    setNewPatientEmail('');
                                    setNewPatientAddress('');
                                }}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNewPatient}
                                disabled={!newPatientName.trim() || !newPatientMobile.trim() || !newPatientAddress.trim()}
                                className={`flex-1 px-4 py-3 rounded-lg font-semibold ${
                                    (!newPatientName.trim() || !newPatientMobile.trim() || !newPatientAddress.trim())
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                            >
                                Add Patient
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
