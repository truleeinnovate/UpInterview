// v1.0.0 - Initial implementation for Resume Upload in SidebarPopup
// v1.0.1 - Converted to full page layout with back button navigation

import React, { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Upload, FileText, Check, AlertCircle,
    Loader2, Eye, UserPlus, Trash2, Search, Filter,
    ChevronRight, X, CheckCircle2, AlertTriangle, FileUp,
    Sparkles, Cpu, Clock, Zap, Files, RotateCw, ArrowLeft
} from 'lucide-react';
import { usePositionById } from '../../../../apiHooks/usePositions';
import Breadcrumb from '../../Tabs/CommonCode-AllTabs/Breadcrumb';
import DropdownSelect from '../../../../Components/Dropdowns/DropdownSelect';
import CandidateViewer from '../../../../Components/CandidateViewer';
import { config } from '../../../../config';
import { notify } from '../../../../services/toastService';

const MAX_FILES = 20;

const STEPS = [
    { id: 1, name: 'Upload Resumes', description: 'Select files and screening method' },
    { id: 2, name: 'Processing', description: 'AI screening in progress' },
    { id: 3, name: 'Review & Proceed', description: 'Select candidates to move forward' }
];

export default function ResumeUploadPage({ positionId: propPositionId, positionTitle: propPositionTitle, onClose: propOnClose }) {
    const { id: paramId } = useParams();
    const navigate = useNavigate();

    // Use props if provided (for backward compatibility), otherwise use URL params
    const positionId = propPositionId || paramId;
    const { position: fetchedPosition } = usePositionById(positionId);
    const positionTitle = propPositionTitle || fetchedPosition?.title || 'Position';

    // Handle close - either use prop callback or navigate back
    const handleClose = () => {
        if (propOnClose) {
            propOnClose();
        } else {
            navigate(`/position/view-details/${positionId}`);
        }
    };

    // Breadcrumb items for page navigation
    // const breadcrumbItems = [
    //     { label: 'Positions', path: '/position' },
    //     { label: positionTitle, path: `/position/view-details/${positionId}` },
    //     { label: 'Upload Resumes', path: `/position/view-details/${positionId}/upload-resumes` }
    // ];

    const [currentStep, setCurrentStep] = useState(1);
    const [screeningMethod, setScreeningMethod] = useState('system_internal');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [screeningResults, setScreeningResults] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [processingProgress, setProcessingProgress] = useState(0);
    const [processingFile, setProcessingFile] = useState('');
    const [viewingResult, setViewingResult] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isProcessing, setIsProcessing] = useState(false);
    const [isProceedLoading, setIsProceedLoading] = useState(false);

    // Simulate file upload
    const handleFileUpload = useCallback((e) => {
        const files = Array.from(e.target.files);
        const remainingSlots = MAX_FILES - uploadedFiles.length;
        const filesToAdd = files.slice(0, remainingSlots);

        const newFiles = filesToAdd.map(file => ({
            id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            file: file
        }));
        setUploadedFiles(prev => [...prev, ...newFiles]);
        // Auto-select new files
        setSelectedFileIds(prev => [...prev, ...newFiles.map(f => f.id)]);
    }, [uploadedFiles.length]);

    const removeFile = (fileId) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
        setSelectedFileIds(prev => prev.filter(id => id !== fileId));
    };

    const toggleFileSelect = (fileId) => {
        setSelectedFileIds(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const toggleSelectAllFiles = () => {
        if (selectedFileIds.length === uploadedFiles.length) {
            setSelectedFileIds([]);
        } else {
            setSelectedFileIds(uploadedFiles.map(f => f.id));
        }
    };

    const removeSelectedFiles = () => {
        setUploadedFiles(prev => prev.filter(f => !selectedFileIds.includes(f.id)));
        setSelectedFileIds([]);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Call real backend API for screening
    const startScreening = async () => {
        setIsProcessing(true);
        setCurrentStep(2);
        setProcessingProgress(10);
        setProcessingFile('Preparing files...');

        try {
            // Create FormData with files
            const formData = new FormData();
            formData.append('positionId', positionId);
            formData.append('screeningMethod', screeningMethod);

            uploadedFiles.forEach((fileObj) => {
                if (fileObj.file && selectedFileIds.includes(fileObj.id)) {
                    formData.append('resumes', fileObj.file);
                }
            });

            setProcessingProgress(20);
            setProcessingFile('Uploading resumes...');

            // Get auth token from cookies
            const token = document.cookie
                .split('; ')
                .find(row => row.startsWith('authToken='))
                ?.split('=')[1];

            // Call the backend API
            const response = await fetch(`${config.REACT_APP_API_URL}/api/resume-screening/screen`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
                credentials: 'include',
            });

            setProcessingProgress(70);
            setProcessingFile('Processing results...');

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }

            const data = await response.json();
            //console.log("response",response);


            if (!data.success) {
                throw new Error(data.message || 'Screening failed');
            }

            setProcessingProgress(90);
            setProcessingFile('Finalizing...');

            // Transform API response to match our state structure
            const transformedResults = data.results.map(result => ({
                id: result.id || `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                file_name: result.fileName,
                candidate_name: result.candidateName || 'Unknown',
                candidate_email: result.candidateEmail || '',
                candidate_phone: result.candidatePhone || '',
                candidate_country_code: result.candidateCountryCode || '',
                candidate_phone_number: result.candidatePhoneNumber || '',
                match_percentage: result.matchPercentage ?? null,
                match_status: result.matchStatus === 'existing_candidate'
                    ? 'existing'
                    : result.matchStatus,
                existing_candidate_id: result.existingCandidateId || null,
                skill_match: result.skillMatch ?? null,
                experience_match: result.experienceMatch ?? null,
                screening_status: result.screeningStatus || 'screened',

                // Parsed data from resume (all skills, not just matched)
                parsed_skills: result.parsedSkills || [],
                parsed_experience: result.parsedExperience || null,
                parsed_education: result.parsedEducation || null,

                // Screening result
                screening_result: result.screeningResult ? {
                    summary: result.screeningResult.summary || '',
                    strengths: result.screeningResult.strengths || [],
                    gaps: result.screeningResult.gaps || result.screeningResult.concerns || [],
                    extracted_skills: result.screeningResult.extractedSkills || result.screeningResult.matchedSkills || [],
                    experience_years: result.screeningResult.experienceYears || null,
                    education: result.screeningResult.education || 'Not specified',
                    recommendation: result.screeningResult.recommendation || 'Consider for review',
                    missingSkills: result.screeningResult.missingSkills || [],
                    method: result.screeningResult.method,
                    languages: result.metadata.languages || [],  // Pull from metadata if needed
                    certifications: result.metadata.certifications || [],
                    projects: result.metadata.projects || [],
                    workHistory: result.metadata.workHistory || []
                } : null,

                // Pass through the full metadata from backend
                metadata: result.metadata
            }));

            const seenCandidates = new Set();

            const finalResults = transformedResults.map(r => {
                if (r.existing_candidate_id) {
                    if (seenCandidates.has(r.existing_candidate_id)) {
                        return { ...r, match_status: 'duplicate' };
                    }
                    seenCandidates.add(r.existing_candidate_id);
                }

                return r;
            });
            console.log("finalResults", finalResults);


            setProcessingProgress(100);
            await new Promise(resolve => setTimeout(resolve, 300));

            setScreeningResults(finalResults);
            setSelectedIds(
                finalResults
                    .filter(r => r.match_status === 'new_candidate')
                    .map(r => r.id)
            );

            setIsProcessing(false);
            setCurrentStep(3);

        } catch (error) {
            console.error('Screening error:', error);
            setIsProcessing(false);
            setCurrentStep(1);
            notify.error(`Screening failed: ${error.message}`);
        }
    };


    //   const handleProceed = async () => {
    //   setIsProceedLoading(true);

    //   try {
    //     const selectedResults = screeningResults.filter((r) => selectedIds.includes(r.id));

    //     if (selectedResults.length === 0) {
    //       notify.warning("No candidates selected");
    //       setIsProceedLoading(false);
    //       return;
    //     }

    //     const token = document.cookie
    //       .split("; ")
    //       .find((row) => row.startsWith("authToken="))
    //       ?.split("=")[1];

    //     if (!token) {
    //       throw new Error("Authentication token not found");
    //     }

    //     // Prepare payload — include rich parsed data so backend can save it
    //     const payload = {
    //       positionId,
    //       selectedResults: selectedResults.map((r) => ({
    //         // Candidate identification
    //         candidateName: r.candidate_name?.trim() || "Unknown",
    //         candidateEmail: (r.candidate_email || "").toLowerCase().trim(),
    //         candidatePhone: r.candidate_phone || r.candidate_phone_number || "",
    //         candidateCountryCode: r.candidate_country_code || "+91",

    //         // File reference
    //         fileName: r.file_name,

    //         // Screening outcome
    //         matchPercentage: Number(r.match_percentage) || 0,
    //         skillMatch: Number(r.skill_match) || 0,
    //         experienceMatch: Number(r.experience_match) || 0,
    //         recommendation: r.screening_result?.recommendation || "HOLD",

    //         // Rich parsed data — crucial for saving full info
    //         parsedSkills: Array.isArray(r.parsed_skills) ? r.parsed_skills : [],
    //         parsedExperienceYears: Number(
    //           parseFloat(r.parsed_experience) ||
    //           r.metadata?.extractedProfile?.experienceYears ||
    //           r.screening_result?.experience_years ||
    //           0
    //         ),
    //         parsedEducation: r.parsed_education || r.screening_result?.education || "Not specified",

    //         // Additional screening context
    //         summary: r.screening_result?.summary || "",
    //         matchedSkills: r.screening_result?.extracted_skills ||
    //                        r.screening_result?.matchedSkills || [],
    //         missingSkills: r.screening_result?.missingSkills || [],
    //         strengths: r.screening_result?.strengths || [],
    //         concerns: r.screening_result?.gaps || r.screening_result?.concerns || [],

    //         // === Most important: send the full parsed / extracted data ===
    //         parsedData: {
    //           fullText: r.metadata?.candidate?.rawText || 
    //                     r.rawText || 
    //                     r.screening_result?.fullText || 
    //                     "",
    //           extractedProfile: r.metadata?.extractedProfile || 
    //                            r.screening_result?.extractedProfile || 
    //                            {},
    //           experienceYears: r.metadata?.extractedProfile?.experienceYears ||
    //                           r.screening_result?.experience_years || null,
    //           educationDetails: r.metadata?.extractedProfile?.education ||
    //                            r.screening_result?.education || null,
    //           languages: r.metadata?.languages || 
    //                      r.metadata?.extractedProfile?.languages || 
    //                      r.screening_result?.languages || [],
    //           certifications: r.metadata?.certifications || 
    //                          r.metadata?.extractedProfile?.certifications || 
    //                          r.screening_result?.certifications || [],
    //           projects: r.metadata?.projects || 
    //                     r.metadata?.extractedProfile?.projects || 
    //                     r.screening_result?.projects || [],
    //           // you can add more fields that exist in your preview response
    //         },

    //         // Minimal metadata
    //         metadata: {
    //           method: r.screening_result?.method || "SYSTEM",
    //           score: Number(r.match_percentage) || 0
    //         }
    //       }))
    //     };

    //     const response = await fetch(
    //       `${config.REACT_APP_API_URL}/api/resume-screening/create-candidates`,
    //       {
    //         method: "POST",
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //           "Content-Type": "application/json"
    //         },
    //         body: JSON.stringify(payload),
    //         credentials: "include"
    //       }
    //     );

    //     const data = await response.json();

    //     if (!response.ok || !data.success) {
    //       console.error("Save failed:", data);
    //       notify.error(data.error || data.message || "Failed to save candidates");
    //       return;
    //     }

    //     notify.success(
    //       `Saved ${data.screeningResults?.length || 0} screening results and ${
    //         data.applications?.length || 0
    //       } applications`
    //     );

    //     handleClose();
    //   } catch (error) {
    //     console.error("Error in handleProceed:", error);
    //     notify.error(error.message || "Something went wrong while saving");
    //   } finally {
    //     setIsProceedLoading(false);
    //   }
    // };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        const eligibleIds = screeningResults
            .filter(r => r.match_status !== 'duplicate')
            .map(r => r.id);

        if (selectedIds.length === eligibleIds.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(eligibleIds);
        }
    };

    const filteredResults = screeningResults.filter(r => {
        const matchesSearch = r.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.file_name?.toLowerCase().includes(search.toLowerCase());

        let matchesStatus = true;
        if (statusFilter === 'high_match') {
            matchesStatus = r.match_percentage >= 80;
        } else if (statusFilter === 'medium_match') {
            matchesStatus = r.match_percentage >= 60 && r.match_percentage < 80;
        } else if (statusFilter === 'low_match') {
            matchesStatus = r.match_percentage && r.match_percentage < 60;
        } else if (statusFilter !== 'all') {
            matchesStatus = r.match_status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    const newCandidates = screeningResults.filter(r => r.match_status === 'new_candidate');
    const existing = screeningResults.filter(r => r.match_status === 'existing');
    const duplicates = screeningResults.filter(r => r.match_status === 'duplicate');

    const discardResult = (id) => {
        setScreeningResults(prev => prev.filter(r => r.id !== id));
        setSelectedIds(prev => prev.filter(i => i !== id));
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleClose}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        <span className="text-sm sm:text-base">Back to Position</span>
                    </button>
                </div>

                {/* Breadcrumb */}
                {/* <Breadcrumb items={breadcrumbItems} /> */}

                {/* Page Title */}
                <div className="mt-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Upload Resumes</h1>
                    <p className="text-gray-500 mt-1">{positionTitle} • Bulk resume screening</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="space-y-6">
                        {/* Stepper */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                            {STEPS.map((step, idx) => (
                                <React.Fragment key={step.id}>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${currentStep > step.id
                                            ? 'bg-emerald-500 text-white'
                                            : currentStep === step.id
                                                ? 'bg-custom-blue text-white'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}>
                                            {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 text-sm truncate">{step.name}</p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {step.id === 2
                                                    ? (screeningMethod === 'ai_claude' ? 'AI screening in progress' : 'System screening in progress')
                                                    : step.description}
                                            </p>
                                        </div>
                                    </div>
                                    {idx < STEPS.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mx-1" />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Step 1: Upload */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                {/* Upload Area Card */}
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100">
                                        <h3 className="flex items-center gap-2 font-semibold text-gray-800">
                                            <FileUp className="w-5 h-5 text-custom-blue" />
                                            Upload Resume Files
                                        </h3>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-custom-blue hover:bg-custom-blue/5 transition-all cursor-pointer group"
                                            onClick={() => uploadedFiles.length < MAX_FILES && document.getElementById('file-upload-popup').click()}
                                        >
                                            <input
                                                id="file-upload-popup"
                                                type="file"
                                                multiple
                                                accept=".pdf,.doc,.docx"
                                                className="hidden"
                                                onChange={handleFileUpload}
                                            />
                                            <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 group-hover:bg-custom-blue/10 flex items-center justify-center mb-4 transition-colors">
                                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-custom-blue transition-colors" />
                                            </div>
                                            <p className="text-gray-700 font-semibold text-lg">Click to upload or drag and drop</p>
                                            <p className="text-sm text-gray-500 mt-1">PDF, DOC, DOCX • Max 10MB each</p>
                                            <div className="mt-4 flex items-center justify-center gap-2">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${uploadedFiles.length >= MAX_FILES ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                                                    <Files className="w-3 h-3 mr-1" />
                                                    {uploadedFiles.length} / {MAX_FILES} files
                                                </span>
                                            </div>
                                        </div>

                                        {uploadedFiles.length >= MAX_FILES && (
                                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                                <p className="text-sm text-amber-800">
                                                    Maximum {MAX_FILES} files allowed. Remove some files to add more.
                                                </p>
                                            </div>
                                        )}

                                        {uploadedFiles.length > 0 && (
                                            <div className="space-y-3">
                                                {/* <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedFileIds.length === uploadedFiles.length && uploadedFiles.length > 0}
                                                            onChange={toggleSelectAllFiles}
                                                            className="w-4 h-4 rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
                                                        />
                                                        <span className="font-medium text-gray-700">
                                                            {selectedFileIds.length > 0 ? `${selectedFileIds.length} selected` : `${uploadedFiles.length} files ready`}
                                                        </span>
                                                    </div>
                                                    {selectedFileIds.length > 0 && (
                                                        <button
                                                            onClick={removeSelectedFiles}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Remove Selected ({selectedFileIds.length})
                                                        </button>
                                                    )}
                                                </div> */}

                                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                                                    {uploadedFiles.map((file) => (
                                                        <div
                                                            key={file.id}
                                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${selectedFileIds.includes(file.id)
                                                                ? 'bg-custom-blue/5 border-custom-blue/30'
                                                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                                                                }`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedFileIds.includes(file.id)}
                                                                onChange={() => toggleFileSelect(file.id)}
                                                                className="w-4 h-4 rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
                                                            />
                                                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                                                                <FileText className="w-5 h-5 text-red-600" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{formatFileSize(file.size || 1024000)}</p>
                                                            </div>
                                                            <button
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                onClick={() => removeFile(file.id)}
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Screening Method Card */}
                                <div className="bg-white overflow-hidden">
                                    <div>
                                        <h3 className="font-semibold text-gray-800">
                                            Screening Method
                                        </h3>
                                    </div>
                                    <div className="pt-2">
                                        <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
                                            {/* System Screening Card */}
                                            <div
                                                className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${screeningMethod === 'system_internal'
                                                    ? 'border-custom-blue bg-white'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setScreeningMethod('system_internal')}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                        <Cpu className="w-4 h-4 text-custom-blue" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-custom-blue">System Screening</h4>
                                                        <p className="text-sm text-gray-500 mt-1">Fast rule-based screening with keyword matching and skill comparison</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Screening Card */}
                                            <div
                                                className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${screeningMethod === 'ai_claude'
                                                    ? 'border-custom-blue bg-white'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                onClick={() => setScreeningMethod('ai_claude')}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                        <Sparkles className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900">AI Screening</h4>
                                                        <p className="text-sm text-gray-500 mt-1">Advanced AI analysis with Claude Sonnet for deeper insights and scoring</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center gap-3 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-600">
                                        {uploadedFiles.length > 0 ? (
                                            <><strong>{uploadedFiles.length}</strong> resume{uploadedFiles.length > 1 ? 's' : ''} ready for screening</>
                                        ) : (
                                            'Upload resumes to continue'
                                        )}
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={uploadedFiles.length === 0 || selectedFileIds.length === 0}
                                            onClick={() => setCurrentStep(2)}
                                        >
                                            Continue to Screening ({selectedFileIds.length})
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Processing */}
                        {currentStep === 2 && (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                {isProcessing ? (
                                    <>
                                        <div className="p-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${screeningMethod === 'ai_claude' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                                    {screeningMethod === 'ai_claude' ? (
                                                        <Sparkles className="w-6 h-6 animate-pulse text-purple-600" />
                                                    ) : (
                                                        <Cpu className="w-6 h-6 animate-pulse text-blue-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">
                                                        {screeningMethod === 'ai_claude' ? 'AI Screening in Progress' : 'System Screening in Progress'}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">
                                                        {screeningMethod === 'ai_claude' ? 'Analyzing resumes with advanced AI' : 'Analyzing resumes with system matching'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <div className="max-w-lg mx-auto space-y-6">
                                                {/* Progress Ring */}
                                                <div className="relative w-32 h-32 mx-auto">
                                                    <svg className="w-32 h-32 transform -rotate-90">
                                                        <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                                                        <circle
                                                            cx="64" cy="64" r="56"
                                                            stroke="url(#gradient)"
                                                            strokeWidth="8"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            strokeDasharray={`${(processingProgress / 100) * 352} 352`}
                                                        />
                                                        <defs>
                                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                                <stop offset="0%" stopColor={screeningMethod === 'ai_claude' ? "#9333ea" : "#2563eb"} />
                                                                <stop offset="100%" stopColor={screeningMethod === 'ai_claude' ? "#6366f1" : "#3b82f6"} />
                                                            </linearGradient>
                                                        </defs>
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-3xl font-bold text-gray-900">{processingProgress}%</span>
                                                    </div>
                                                </div>

                                                {/* Current File */}
                                                <div className="bg-gray-50 rounded-xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${screeningMethod === 'ai_claude' ? 'bg-purple-100' : 'bg-blue-100'}`}>
                                                            <RotateCw className={`w-5 h-5 animate-spin ${screeningMethod === 'ai_claude' ? 'text-purple-600' : 'text-blue-600'}`} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-gray-500">Currently processing</p>
                                                            <p className="font-medium text-gray-900 truncate">{processingFile}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Stats */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="text-center p-3 bg-emerald-50 rounded-xl">
                                                        <p className="text-2xl font-bold text-emerald-600">{selectedFileIds.length}</p>
                                                        <p className="text-xs text-emerald-700">Total Files</p>
                                                    </div>
                                                    <div className={`text-center p-3 rounded-xl ${screeningMethod === 'ai_claude' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                                                        <p className={`text-2xl font-bold ${screeningMethod === 'ai_claude' ? 'text-purple-600' : 'text-blue-600'}`}>
                                                            {Math.round((processingProgress / 100) * selectedFileIds.length)}
                                                        </p>
                                                        <p className={`text-xs ${screeningMethod === 'ai_claude' ? 'text-purple-700' : 'text-blue-700'}`}>Processed</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-gray-50 rounded-xl">
                                                        <p className="text-2xl font-bold text-gray-600">
                                                            {selectedFileIds.length - Math.round((processingProgress / 100) * selectedFileIds.length)}
                                                        </p>
                                                        <p className="text-xs text-gray-700">Remaining</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                                    <Clock className="w-4 h-4" />
                                                    Estimated time: {Math.max(1, Math.ceil((100 - processingProgress) / 15))} seconds
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="p-6 text-black">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                                    <Zap className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold">Ready to Start Screening</h3>
                                                    <p className=" text-sm">Review your settings before processing</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-8">
                                            <div className=" space-y-6">
                                                {/* Summary */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                                                <Files className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-2xl font-bold text-gray-900">{selectedFileIds.length}</p>
                                                                <p className="text-sm text-gray-500">Resumes</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-gray-50 rounded-xl">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${screeningMethod === 'ai_claude' ? 'bg-purple-100' : 'bg-blue-100'
                                                                }`}>
                                                                {screeningMethod === 'ai_claude' ? (
                                                                    <Sparkles className="w-5 h-5 text-purple-600" />
                                                                ) : (
                                                                    <Cpu className="w-5 h-5 text-blue-600" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-gray-900">
                                                                    {screeningMethod === 'ai_claude' ? 'AI' : 'System'}
                                                                </p>
                                                                <p className="text-sm text-gray-500">Method</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* File Preview */}
                                                <div className="border border-gray-200 rounded-xl overflow-hidden">
                                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                                        <p className="text-sm font-medium text-gray-700">Files to process</p>
                                                    </div>
                                                    <div className="max-h-40 overflow-y-auto p-2 space-y-1">
                                                        {uploadedFiles.filter(f => selectedFileIds.includes(f.id)).slice(0, 5).map((file) => (
                                                            <div key={file.id} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                <span className="truncate text-gray-700">{file.name}</span>
                                                            </div>
                                                        ))}
                                                        {selectedFileIds.length > 5 && (
                                                            <p className="px-2 py-1 text-sm text-gray-500">
                                                                +{selectedFileIds.length - 5} more files
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4">
                                                    <button
                                                        onClick={() => setCurrentStep(1)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <ArrowLeft className="w-4 h-4" />
                                                        Back to Upload
                                                    </button>
                                                    <button
                                                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white ${screeningMethod === 'ai_claude' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors' : 'bg-custom-blue rounded-lg hover:bg-custom-blue/90 transition-colors'}`}
                                                        onClick={startScreening}
                                                    >
                                                        {screeningMethod === 'ai_claude' ? (
                                                            <>
                                                                <Sparkles className="w-4 h-4" />
                                                                Start AI Screening
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Cpu className="w-4 h-4" />
                                                                Start System Screening
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Step 3: Review */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                {/* Summary Cards */}
                                <div className="grid sm:grid-cols-1 grid-cols-3 gap-4">
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-emerald-700">{newCandidates.length}</p>
                                                <p className="text-sm text-emerald-600">New Candidates</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <AlertCircle className="w-8 h-8 text-blue-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-blue-700">{existing.length}</p>
                                                <p className="text-sm text-blue-600">Existing Candidates</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="w-8 h-8 text-amber-600" />
                                            <div>
                                                <p className="text-2xl font-bold text-amber-700">{duplicates.length}</p>
                                                <p className="text-sm text-amber-600">Duplicates</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* All Duplicates Warning */}
                                {newCandidates.length === 0 && existing.length === 0 && duplicates.length > 0 && (
                                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                        <p className="text-sm text-amber-800">
                                            <strong>No new candidates found.</strong> All resumes already exist for this position.
                                        </p>
                                    </div>
                                )}

                                {/* Filters */}
                                <div className="flex sm:flex-col flex-row gap-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search candidates..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-custom-blue focus:border-custom-blue"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-400" />
                                        <DropdownSelect
                                            value={{ value: statusFilter, label: statusFilter === 'all' ? 'All Status' : statusFilter === 'new_candidate' ? 'New Candidates' : statusFilter === 'existing' ? 'Existing' : statusFilter === 'duplicate' ? 'Duplicates' : statusFilter === 'high_match' ? 'High Match (80%+)' : statusFilter === 'medium_match' ? 'Medium Match (60-79%)' : 'Low Match (<60%)' }}
                                            onChange={(option) => setStatusFilter(option?.value || 'all')}
                                            options={[
                                                { value: 'all', label: 'All Status' },
                                                { value: 'new_candidate', label: 'New Candidates' },
                                                { value: 'existing', label: 'Existing' },
                                                { value: 'duplicate', label: 'Duplicates' },
                                                { value: 'high_match', label: 'High Match (80%+)' },
                                                { value: 'medium_match', label: 'Medium Match (60-79%)' },
                                                { value: 'low_match', label: 'Low Match (<60%)' },
                                            ]}
                                            placeholder="All Status"
                                            isClearable={false}
                                            isSearchable={false}
                                            className="min-w-[180px]"
                                        />
                                    </div>
                                </div>

                                {/* Results Table */}
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                    <div className="px-5 py-4 border-b border-gray-100 flex flex-row items-center justify-between flex-wrap gap-4">
                                        <h3 className="font-semibold text-gray-800">Screening Results</h3>
                                        {/* <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.length === screeningResults.filter(r => r.match_status !== 'duplicate').length && selectedIds.length > 0}
                                                onChange={toggleSelectAll}
                                                className="w-4 h-4 rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
                                            />
                                            <span className="text-sm text-gray-500">Select All</span>
                                        </div> */}
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50 text-left">
                                                    {/* <th className="p-3 w-10"></th> */}
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Resume</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Candidate Match</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Match %</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Skill Match</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600 text-center">Experience</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                                                    <th className="p-3 text-sm font-semibold text-gray-600">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredResults.map(result => (
                                                    <tr key={result.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                        {/* <td className="p-3">
                                                            {result.match_status !== 'duplicate' && (
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedIds.includes(result.id)}
                                                                    onChange={() => toggleSelect(result.id)}
                                                                    className="w-4 h-4 rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
                                                                />
                                                            )}
                                                        </td> */}
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-4 h-4 text-gray-400" />
                                                                <span className="text-sm font-medium text-gray-900">{result.file_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${result.match_status === 'new_candidate' ? 'bg-emerald-100 text-emerald-700' :
                                                                result.match_status === 'existing' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {result.match_status === 'new_candidate' ? 'New Candidate' :
                                                                    result.match_status === 'existing' ? `Existing` :
                                                                        'Duplicate'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-center">
                                                            {result.match_percentage !== undefined && result.match_percentage !== null ? (
                                                                <span className={`font-semibold ${result.match_percentage >= 80 ? 'text-emerald-600' :
                                                                    result.match_percentage >= 60 ? 'text-amber-600' :
                                                                        'text-red-600'
                                                                    }`}>
                                                                    {result.match_percentage}%
                                                                </span>
                                                            ) : '—'}
                                                        </td>
                                                        <td className="p-3 text-center text-sm text-gray-600">
                                                            {result.skill_match !== undefined && result.skill_match !== null ? `${result.skill_match}%` : '—'}
                                                        </td>
                                                        <td className="p-3 text-center text-sm text-gray-600">
                                                            {result.experience_match !== undefined && result.experience_match !== null ? `${result.experience_match}%` : '—'}
                                                        </td>
                                                        <td className="p-3">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                                                Screened
                                                            </span>
                                                        </td>
                                                        <td className="p-3">
                                                            <div className="flex items-center gap-1">
                                                                <button
                                                                    className="px-3 py-1.5 text-sm font-medium text-custom-blue hover:bg-custom-blue/5 border border-custom-blue/20 rounded-lg transition-colors whitespace-nowrap"
                                                                    onClick={() => setViewingResult(result)}
                                                                    title="View & Proceed"
                                                                >
                                                                    View & Proceed
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {filteredResults.length === 0 && (
                                        <div className="text-center py-8">
                                            <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                            <p className="text-gray-500">No results match your filters</p>
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                {/* <div className="flex sm:flex-col flex-row  justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>Selected:</strong> {selectedIds.length} resumes
                                    </p>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleClose}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Save & Exit
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={selectedIds.length === 0 || isProceedLoading}
                                            onClick={handleProceed}
                                        >
                                            {isProceedLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                            Proceed Selected ({selectedIds.length})
                                        </button>
                                    </div>
                                </div> */}
                            </div>
                        )}

                        {/* View Result Modal - Replaced with CandidateViewer Sidebar */}
                        {viewingResult && (
                            <CandidateViewer
                                candidate={viewingResult}
                                position={fetchedPosition}
                                onClose={() => setViewingResult(null)}
                                onAction={(action, id) => {
                                    // Handle actions from the sidebar
                                    if (action === 'proceed') {
                                        toggleSelect(id);
                                        // Ideally we want to scroll to proceed button or highlight it
                                    } else if (action === 'reject') {
                                        discardResult(id);
                                    }
                                    // 'hold' currently doesn't have a specific logic in this localized state other than maybe untoggling
                                    setViewingResult(null);
                                }}
                                source={screeningMethod}
                                showNavigation={true}
                                totalResults={screeningResults.length}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

