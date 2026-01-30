// CandidateViewer.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, X, Mail, Phone, Briefcase,
    GraduationCap, Award, FileText, AlertTriangle,
    Check, ChevronRight
} from 'lucide-react';

import Breadcrumb from '../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import AddCandidateForm from '../Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm';
import LoadingButton from "./LoadingButton";
import { Button } from "./Buttons/Button";
import {
    useApplicationFilter,
} from "../apiHooks/useApplications";
import { calculateCandidateScore } from '../utils/resumeScoring';

// Utility functions
const getScoreColor = (score) => {
    if (score == null) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-600';
};

const getScoreBadgeColor = (score) => {
    if (score == null) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
};





export default function CandidateViewer({
    candidate,
    onClose,
    onAction,
    position,
    source = 'system_internal',

    totalResults = 1, // Default to 1 (force navigation) if not provided
    showNavigation = false // Control visibility of Breadcrumb and Info Box
}) {
    console.log("position", position);

    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const isExistingCandidate = candidate.match_status === 'existing';

    const getRecommendation = (score) => {
        let rec = candidate.screening_result?.recommendation;

        // Fallback for nested parsedJson structure
        if (!rec && candidate.parsedJson?.screening_result?.recommendation) {
            rec = candidate.parsedJson.screening_result.recommendation;
        }

        if (rec) {
            if (typeof rec === 'object') {
                return rec.recommendation || rec.summary || 'Review manually';
            }
            return String(rec); // Ensure string
        }
        if (score == null) return 'Review manually - no automated score available';
        if (score >= 80) return 'Strong match - Highly recommended for interview';
        if (score >= 60) return 'Moderate match - Consider for interview';
        return 'Weak match - May not meet requirements';
    };

    const scoringData = useMemo(() => {
        return position ? calculateCandidateScore(candidate, position) : null;
    }, [candidate, position]);

    const displayScore = scoringData?.score ?? candidate.match_percentage;
    const displaySkillMatch = scoringData?.skillMatch ?? candidate.skill_match;
    // Fetch existing applications for this candidate
    const { applications: filteredApplications, refetch: refetchApplications } =
        useApplicationFilter(
            candidate?.existing_candidate_id,
            position?._id
        );

    console.log("useApplicationFilter called with:", {
        candidateId: candidate?.existing_candidate_id,
        positionId: position?._id,
        candidateIdType: typeof candidate?.existing_candidate_id,
        positionIdType: typeof position?._id,
    });
    // Filter applications based on selected position (only when position is selected)
    const hasActiveApplication = useMemo(() => {
        if (!position._id || filteredApplications.length === 0) return false;

        // Check if any application is NOT rejected or withdrawn
        return filteredApplications.some(app =>
            !["REJECTED", "WITHDRAWN"].includes(app.status)
        );
    }, [position._id, filteredApplications]);





    const [creationSuccessData, setCreationSuccessData] = useState(null);
    const [showExistingAppPrompt, setShowExistingAppPrompt] = useState(false);

    const [isProceeding, setIsProceeding] = useState(false);
    const [isSavingApplication, setIsSavingApplication] = useState(false); // New state for loading

    const handleProceed = async () => {
        if (isProceeding) return;
        setIsProceeding(true);

        try {
            // Failsafe: Re-check applications from server before proceeding
            const { data: freshData } = await refetchApplications();
            // detailed check logic matching hasActiveApplication useMemo
            const freshApps = freshData?.data || [];
            const freshHasActive = freshApps.some(app =>
                !["REJECTED", "WITHDRAWN"].includes(app.status)
            );

            if (freshHasActive || hasActiveApplication) {
                setShowExistingAppPrompt(true);
                setIsProceeding(false);
                return;
            }

            setShowCandidateForm(true);
        } catch (err) {
            console.error("Error refreshing applications checking proceed:", err);
            // Fallback to existing state check
            if (hasActiveApplication) {
                setShowExistingAppPrompt(true);
                setIsProceeding(false);
                return;
            }
            setShowCandidateForm(true);
        }
    };


    const navigate = useNavigate();

    const handleFormClose = (savedData) => {
        setIsSavingApplication(false); // Reset loading state
        // vvv Detect success from AddCandidateForm vvv
        if (savedData?.createdApplication) {
            console.log("Creation Success Data:", savedData); // Add debugging
            setCreationSuccessData(savedData);
            setShowCandidateForm(false);
            return; // Stay in the popup
        }

        setShowCandidateForm(false);
        // Close the entire CandidateViewer popup after form is closed
        onClose();

        // If we saved successfully (savedData present) and have a position, go to Candidates tab
        // ONLY if totalResults is 1. If > 1, we want to stay on the screening list.
        if (savedData && position?._id && totalResults === 1) {
            navigate(`/positions/view-details/${position._id}`, {
                state: { activeTab: 'Candidates' }
            });
        }
    };

    // Reset state when candidate changes (fixes re-open issue)
    React.useEffect(() => {
        setCreationSuccessData(null);
        setShowCandidateForm(false);
        setIsSavingApplication(false);
    }, [candidate]);

    // Dynamic heading based on source
    const analysisHeading = (source === 'ai_claude' || candidate.screening_result?.method === 'AI')
        ? "AI Screening Analysis"
        : "System Screening Analysis";
    // Breadcrumb items (single instance at top)
    const breadcrumbItems = showCandidateForm
        ? [
            // { label: "Positions", path: "/positions" },
            // {
            //     label: position?.title || "Position",
            //     path: position?.id ? `/positions/${position.id}` : "#",
            //     status: position?.status || "Opened"
            // },
            // { label: "Candidates", path: "#" },
            { label: "Candidate Screening", path: "#" },
            { label: "Create Application", path: "#" }
        ]
        : [
            // { label: "Positions", path: "/positions" },
            // {
            //     label: position?.title || "Position",
            //     path: position?.id ? `/positions/${position.id}` : "#",
            //     status: position?.status || "Opened"
            // },
            // { label: "Candidates", path: "#" },
            { label: "Candidate Screening", path: "#" },
            { label: "Create Application", path: "#" }
        ];

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-7xl h-[90vh] flex flex-col overflow-hidden">
                {/* ... existing modal content ... */}
                {/* ─── Global Header with single Breadcrumb ─────────────────────────────── */}
                <div className=" bg-white">
                    <div className="px-6 pt-4 pb-3">
                        <div className="flex items-start justify-between gap-6 mb-2">
                            <div className="flex-1 min-w-0">

                                <h2 className="mt-2 text-xl font-bold text-gray-900">
                                    {showCandidateForm ? "Create Application" : "Candidate Screening"}
                                </h2>
                                <p className="text-sm text-gray-600 mt-0.5">
                                    {position?.title || 'Position'} Application
                                </p>
                            </div>

                            <button
                                onClick={() => onClose(creationSuccessData)}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 mt-1"
                                aria-label="Close"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>

                        </div>
                        {showNavigation && !creationSuccessData && (
                            <div className="flex items-center justify-start gap-2 bg-gray-50 rounded-lg p-3 mb-2 w-full overflow-x-auto">
                                {breadcrumbItems.map((item, idx) => {
                                    const isLast = idx === breadcrumbItems.length - 1;
                                    const isCompleted = !isLast;

                                    return (
                                        <React.Fragment key={idx}>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs flex-shrink-0 ${isCompleted
                                                    ? 'bg-emerald-500 text-white'
                                                    : 'bg-custom-blue text-white'
                                                    }`}>
                                                    {isCompleted ? <Check className="w-3 h-3" /> : (idx + 1)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                                        {item.label}
                                                    </p>
                                                    {isLast && item.status && (
                                                        <p className="text-[10px] text-gray-500 truncate">
                                                            {item.status}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {!isLast && (
                                                <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0 mx-1" />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Main content area ────────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {!showCandidateForm ? (
                        isSavingApplication ? (
                            // Loading View
                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                                <div className="bg-white rounded-2xl p-10 shadow-lg max-w-sm w-full border border-gray-100 flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-custom-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                                        Creating Application...
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        Please wait while we process the application.
                                    </p>
                                </div>
                            </div>
                        ) : creationSuccessData ? (
                            // Success View
                            <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
                                <div className="bg-white rounded-2xl p-10 shadow-lg max-w-lg w-full border border-gray-100">
                                    <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Application Created Successfully
                                    </h3>
                                    <p className="text-gray-500 mb-8">
                                        Candidate has been successfully screened and an application has been created.
                                    </p>

                                    <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-200">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-500">Application ID</span>
                                            <span className="font-mono font-medium text-gray-900 bg-white px-2 py-1 rounded border border-gray-200 text-xs">
                                                {creationSuccessData.createdApplication?.data?.application?.applicationNumber || creationSuccessData.createdApplication?.application?.applicationNumber || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Candidate</span>
                                            <span className="font-medium text-gray-900 text-sm">
                                                <span className="font-medium text-gray-900 text-sm">
                                                    {creationSuccessData.data?.FirstName || creationSuccessData.candidate?.FirstName || creationSuccessData.FirstName} {creationSuccessData.data?.LastName || creationSuccessData.candidate?.LastName || creationSuccessData.LastName}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
                                <div className="flex min-h-full">
                                    {/* Left - Candidate Profile */}
                                    <div className="w-1/2 border-r border-gray-200 bg-white">
                                        <div className="p-7 space-y-7">
                                            <h3 className="text-xl font-bold text-gray-900">Candidate Profile</h3>

                                            <div className="space-y-6">
                                                <div>
                                                    <h4 className="text-2xl font-bold text-gray-900 mb-3">
                                                        {candidate.candidate_name || 'Unknown'}
                                                    </h4>
                                                    <div className="space-y-2.5 text-gray-700">
                                                        {candidate.candidate_email && (
                                                            <div className="flex items-center gap-3">
                                                                <Mail size={18} />
                                                                <span>{candidate.candidate_email}</span>
                                                            </div>
                                                        )}
                                                        {candidate.candidate_phone && (
                                                            <div className="flex items-center gap-3">
                                                                <Phone size={18} />
                                                                <span>{candidate.candidate_phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {candidate.parsed_experience && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <Briefcase size={18} className="text-cyan-700" />
                                                            <span className="font-semibold">Experience</span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed whitespace-pre-line">
                                                            {candidate.parsed_experience}
                                                        </p>
                                                    </div>
                                                )}

                                                {(candidate.current_company || candidate.metadata?.extractedProfile?.currentCompany) && (
                                                    <div className="mt-1">
                                                        <p className="text-sm text-gray-600">
                                                            <span className="font-semibold text-gray-700">Current: </span>
                                                            {candidate.current_company || candidate.metadata?.extractedProfile?.currentCompany}
                                                        </p>
                                                    </div>
                                                )}

                                                {(candidate.parsed_education || candidate.screening_result?.education) && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <GraduationCap size={18} className="text-cyan-700" />
                                                            <span className="font-semibold">Education</span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed">
                                                            {candidate.parsed_education || candidate.screening_result?.education || 'Not specified'}
                                                        </p>
                                                    </div>
                                                )}

                                                {candidate.parsed_skills?.length > 0 && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <Award size={18} className="text-cyan-700" />
                                                            <span className="font-semibold">Skills</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {candidate.parsed_skills.map((skill, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full border border-gray-200"
                                                                >
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(candidate.certifications || candidate.screening_result?.certifications)?.length > 0 && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <Award size={18} className="text-cyan-700" />
                                                            <span className="font-semibold">Certifications</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {(candidate.certifications || candidate.screening_result?.certifications).map((cert, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-3 py-1 text-sm bg-[rgb(18,93,115)] text-white rounded-full font-medium"
                                                                >
                                                                    {cert}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {candidate.screening_result?.summary && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="flex items-center gap-2.5 mb-2">
                                                            <FileText size={18} className="text-cyan-700" />
                                                            <span className="font-semibold">Resume Highlights</span>
                                                        </div>
                                                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                                                            {candidate.screening_result.summary}
                                                        </p>
                                                    </div>
                                                )}

                                                {/* Resume File Section */}
                                                {(candidate.resume_file || candidate.file_name) && (
                                                    <div className="pt-5 border-t border-gray-200">
                                                        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">Resume File</span>
                                                            <span className="text-sm text-gray-600 truncate max-w-[200px]">
                                                                {candidate.resume_file || candidate.file_name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right - Analysis */}
                                    <div className="w-1/2 flex flex-col bg-gray-50">
                                        <div className="flex-1 p-7 space-y-6">
                                            {/* Dynamic heading based on source */}
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {analysisHeading}
                                            </h3>

                                            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm">
                                                <p className="text-gray-600 mb-1">Match Score</p>
                                                <p className={`text-4xl font-extrabold ${getScoreColor(displayScore)}`}>
                                                    {displayScore != null ? `${displayScore}%` : '—'}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-white rounded-xl border p-5 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1.5">Skill Match</p>
                                                    <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getScoreBadgeColor(displaySkillMatch)}`}>
                                                        {displaySkillMatch != null ? `${displaySkillMatch}%` : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="bg-white rounded-xl border p-5 shadow-sm">
                                                    <p className="text-sm text-gray-600 mb-1.5">Status</p>
                                                    <p className="text-lg font-semibold capitalize">
                                                        {candidate.match_status?.replaceAll('_', ' ') || 'New'}
                                                    </p>
                                                </div>
                                            </div>

                                            {scoringData?.matchedSkills?.length > 0 && (
                                                <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                                    <p className="font-semibold text-green-900 mb-2.5 flex items-center gap-2">
                                                        Matched Skills ({scoringData.matchedSkills.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {scoringData.matchedSkills.map((s, i) => (
                                                            <span key={i} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full font-medium">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {scoringData?.missingRequiredSkills?.length > 0 && (
                                                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                                    <div className="flex items-start gap-3">
                                                        <AlertTriangle size={20} className="text-red-600 mt-1 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-semibold text-red-900 mb-2.5">
                                                                Missing Required Skills ({scoringData.missingRequiredSkills.length})
                                                            </p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {scoringData.missingRequiredSkills.map((s, i) => (
                                                                    <span key={i} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                                                                        {s}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Insights Section - Dynamic (AI vs System) */}
                                            {(candidate.screening_result?.strengths?.length > 0 || candidate.screening_result?.concerns?.length > 0 || candidate.screening_result?.analysis) && (
                                                (() => {
                                                    const isAi = source === 'ai_claude' || candidate.screening_result?.method === 'AI';
                                                    const containerClass = isAi
                                                        ? "bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200"
                                                        : "bg-blue-50 border border-blue-200";

                                                    const titleColor = isAi ? "text-purple-900" : "text-blue-900";
                                                    const icon = isAi ? "✨" : "📊";
                                                    const title = isAi ? "AI Insights" : "System Analysis";

                                                    return (
                                                        <div className={`rounded-lg p-4 ${containerClass}`}>
                                                            <p className={`text-sm font-semibold mb-2 ${titleColor} flex items-center gap-2`}>
                                                                <span>{icon}</span> {title}
                                                            </p>
                                                            {candidate.screening_result?.analysis && (
                                                                <p className="text-sm text-gray-700 mb-3">{candidate.screening_result.analysis}</p>
                                                            )}

                                                            {candidate.screening_result?.strengths?.length > 0 && (
                                                                <div className="mt-3">
                                                                    <p className="text-xs font-semibold text-green-800 mb-1">Key Strengths:</p>
                                                                    <ul className="space-y-1">
                                                                        {candidate.screening_result.strengths.map((strength, index) => (
                                                                            <li key={index} className="flex items-start gap-2">
                                                                                <span className="text-green-600 text-xs mt-0.5">✓</span>
                                                                                <span className="text-xs text-gray-700">{strength}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}

                                                            {(candidate.screening_result?.concerns?.length > 0 || candidate.screening_result?.gaps?.length > 0) && (
                                                                <div className="mt-3">
                                                                    <p className="text-xs font-semibold text-orange-800 mb-1">Potential Concerns:</p>
                                                                    <ul className="space-y-1">
                                                                        {(candidate.screening_result.concerns || candidate.screening_result.gaps).map((concern, index) => (
                                                                            <li key={index} className="flex items-start gap-2">
                                                                                <span className="text-orange-600 text-xs mt-0.5">⚠</span>
                                                                                <span className="text-xs text-gray-700">{concern}</span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()
                                            )}

                                            <div className="bg-white border border-cyan-100 rounded-xl p-5">
                                                <p className="font-medium text-cyan-800 mb-2">Recommendation</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                    {getRecommendation(displayScore)}
                                                </p>
                                            </div>

                                            {/* Detailed Match Scores */}
                                            {displayScore !== null && scoringData && (
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Overall Match Rate</span>
                                                            <span className="font-medium text-gray-900">
                                                                {Math.round((scoringData.matchRate?.overall || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.round((scoringData.matchRate?.overall || 0) * 100)}%`,
                                                                    backgroundColor: 'rgb(33, 121, 137)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Required Skills Match</span>
                                                            <span className="font-medium text-gray-900">
                                                                {Math.round((scoringData.matchRate?.required || 0) * 100)}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${Math.round((scoringData.matchRate?.required || 0) * 100)}%`,
                                                                    backgroundColor: 'rgb(33, 121, 137)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-sm mb-1">
                                                            <span className="text-gray-600">Overall Score</span>
                                                            <span className="font-medium text-gray-900">
                                                                {displayScore}%
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="h-2 rounded-full"
                                                                style={{
                                                                    width: `${displayScore}%`,
                                                                    backgroundColor: 'rgb(33, 121, 137)'
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                                {/* ─── Global shared footer (visible in screening mode only) ──────── */}
                                {!showCandidateForm && !creationSuccessData && !isSavingApplication && (
                                    showNavigation && (
                                        <div className="bg-white px-7 py-3">
                                            {/* Info text above buttons */}
                                            {/* <div className="bg-blue-50 rounded-lg p-4 mb-5 text-sm text-blue-800">
                                    Proceeding to interview will create an Application and move this candidate to the Applications tab.
                                </div> */}

                                            {/* Buttons */}
                                            <div className="flex justify-end gap-3">

                                                <Button
                                                    variant="outline"
                                                    type="button"
                                                    onClick={onClose}
                                                    className={`text-custom-blue border border-custom-blue transition-colors`}
                                                >
                                                    Cancel
                                                </Button>

                                                <LoadingButton
                                                    onClick={handleProceed}
                                                //   isLoading={isMutationLoading && activeButton === "save"}
                                                //   loadingText={id ? "Updating..." : "Saving..."}
                                                >
                                                    {/* {id ? "Update" : "Save"} */}
                                                    Proceed
                                                </LoadingButton>
                                            </div>
                                        </div>
                                    )
                                )}
                            </div>

                        )
                    ) : (

                        <div className="flex-1 overflow-y-auto bg-gray-50 px-12">
                            <AddCandidateForm
                                mode={isExistingCandidate ? "Edit" : "Add"}
                                isModal={true}
                                onClose={handleFormClose}
                                // initialData={initialFormData}
                                screeningData={candidate}
                                source="candidate-screening"
                                positionId={position?._id}
                                candidateId={isExistingCandidate ? candidate.existing_candidate_id : undefined}
                                shouldCreateApplication={!hasActiveApplication}
                                // Add handler for start saving
                                onSaveStart={() => setIsSavingApplication(true)}
                            />


                        </div>

                    )}



                    {showExistingAppPrompt && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Application Already Exists
                                </h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    An active application already exists for this candidate in this position.
                                    Do you want to navigate to the application view?
                                </p>

                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowExistingAppPrompt(false)}
                                    >
                                        Cancel
                                    </Button>

                                    <Button
                                        onClick={() => {
                                            setShowExistingAppPrompt(false);
                                            onClose();

                                            const activeApp = filteredApplications.find(app =>
                                                !["REJECTED", "WITHDRAWN"].includes(app.status)
                                            ) || filteredApplications[0];

                                            if (activeApp && position?._id) {
                                                navigate(`/positions/view-details/${position._id}`, {
                                                    state: {
                                                        activeTab: 'Applications', // Ensure Applications tab is active
                                                        application: activeApp     // Pass application to open it directly
                                                    }
                                                });
                                            }
                                        }}
                                    >
                                        Go to Application
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div >
        </div >,
        document.body
    );
}