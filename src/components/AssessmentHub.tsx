import React, { useState, useRef } from 'react';
import { Upload, RefreshCw, FileUp, X, Check, Brain, ChevronDown, Download, ZoomIn, RotateCcw } from 'lucide-react';
import type { EmbryoResult } from '../types/embryo';

interface AssessmentHubProps {
    embryos: EmbryoResult[];
    setEmbryos: React.Dispatch<React.SetStateAction<EmbryoResult[]>>;
}

export function AssessmentHub({ embryos, setEmbryos }: AssessmentHubProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock patient cycle data
    const [selectedCycle, setSelectedCycle] = useState("PT-2026-0124 - Cycle 3");

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
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            // Validate file type
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setSelectedFile(file);
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);

        // Simulate AI processing time
        setTimeout(() => {
            const newEmbryo: EmbryoResult = {
                id: `emb-${Date.now()}`,
                name: `EMB-00${embryos.length + 1}`,
                imageUrl: URL.createObjectURL(selectedFile),
                viabilityScore: Math.floor(Math.random() * (95 - 70) + 70), // Random score 70-95
                rank: embryos.length + 1,
                features: {
                    developmentalStage: 'Day 5 Blastocyst',
                    symmetry: Math.random() > 0.5 ? 'Excellent' : 'Good',
                    fragmentation: '<5% (Minimal)',
                    blastocystExpansion: '4',
                    innerCellMass: Math.random() > 0.5 ? 'A' : 'B',
                    trophectoderm: Math.random() > 0.5 ? 'A' : 'B'
                },
                keyFindings: ['Normal progression'],
                recommendation: 'Suitable for transfer',
                uploadedAt: new Date(),
                processingStatus: 'completed'
            };

            setEmbryos(prev => [...prev, newEmbryo]);
            setIsProcessing(false);
            setSelectedFile(null);
        }, 2500);
    };

    return (
        <div className="space-y-6 w-full max-w-screen-2xl mx-auto px-2 sm:px-4">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Embryo Assessment Hub</h1>
                    <p className="text-gray-500">AI-powered morphological analysis and viability scoring workspace</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
                        <RefreshCw className="size-4 animate-spin-slow" />
                        Real-time AI Processing
                    </div>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        <FileUp className="size-4" />
                        Generate Report
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
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                Active Patient Cycle
                            </label>
                            <button className="text-blue-600 text-sm hover:underline">View History</button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <select
                                    value={selectedCycle}
                                    onChange={(e) => setSelectedCycle(e.target.value)}
                                    className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option>PT-2026-0124 - Cycle 3</option>
                                    <option>PT-2026-0124 - Cycle 2</option>
                                    <option>PT-2026-0098 - Cycle 1</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 size-5 text-gray-500 pointer-events-none" />
                            </div>
                            <button className="px-4 py-2 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-medium">
                                Cycle Details
                            </button>
                        </div>
                    </div>

                    {/* Image Analysis Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col min-h-[520px]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">Embryo Image Analysis</h3>
                                <p className="text-sm text-gray-500 pl-4 mt-1">High-Resolution Morphological Inspection</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors font-medium">Measurements</button>
                                <button className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg flex items-center gap-1 hover:bg-gray-50">
                                    <Download className="size-3" /> Export
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 mb-4">
                            <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200 flex-1">
                                <ZoomIn className="size-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Zoom Level</span>
                                <div className="h-4 w-[1px] bg-gray-300 mx-2"></div>
                                <span className="text-sm font-bold text-gray-900 ml-auto">100%</span>
                            </div>
                            <button className="w-12 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">
                                <RotateCcw className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center relative overflow-hidden group border border-gray-700 shadow-inner min-h-[360px]">
                            {selectedFile ? (
                                <img
                                    src={URL.createObjectURL(selectedFile)}
                                    alt="Analysis Target"
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                                        <Brain className="size-8 text-blue-400 opacity-50" />
                                    </div>
                                    <p className="text-gray-400 font-medium">No Active Image Selected</p>
                                    <p className="text-gray-500 text-sm mt-1">Select an image from the batch processor</p>
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
                                <h3 className="font-bold text-gray-900 text-lg">Batch Image Processing</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-[250px]">Upload multiple embryo images for simultaneous AI analysis</p>
                            </div>
                            <div className="bg-blue-50 p-2 rounded-lg">
                                <Upload className="size-5 text-blue-600" />
                            </div>
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
                                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB • Ready</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
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
                            disabled={!selectedFile || isProcessing}
                            onClick={handleProcess}
                            className={`w-full mt-6 py-4 rounded-xl flex items-center justify-center gap-3 font-semibold text-lg transition-all shadow-md hover:shadow-lg ${!selectedFile || isProcessing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 active:scale-[0.98]'
                                }`}
                        >
                            {isProcessing ? (
                                <>
                                    <RefreshCw className="size-5 animate-spin" />
                                    Processing Analysis...
                                </>
                            ) : (
                                <>
                                    <Brain className="size-6" />
                                    Process Batch {selectedFile ? '(1)' : ''}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Viability Score Card */}
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg">AI Viability Score</h3>
                                <p className="text-sm text-gray-500">Real-time morphological assessment</p>
                            </div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                LIVE
                            </span>
                        </div>

                        <div className="flex items-end gap-3 mb-4">
                            <span className="text-6xl font-black text-gray-900 tracking-tight">87</span>
                            <div className="mb-2">
                                <span className="text-green-600 font-bold text-lg block">Excellent</span>
                                <span className="text-gray-400 text-xs font-medium">Confidence 96%</span>
                            </div>
                        </div>

                        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-4">
                            <div className="h-full bg-gradient-to-r from-green-500 to-emerald-400 w-[87%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100">
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Processing Time</p>
                                <p className="text-gray-900 font-bold">1.2s</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Anomalies</p>
                                <p className="text-gray-900 font-bold">None Detected</p>
                            </div>
                        </div>
                    </div>

                    {/* Status Panel */}
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 rounded-xl text-white shadow-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                                <Check className="size-5 text-green-400" />
                            </div>
                            <div>
                                <p className="font-semibold">System Operational</p>
                                <p className="text-xs text-gray-400">All AI models loaded</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">47</p>
                            <p className="text-xs text-gray-400">Processed Today</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
