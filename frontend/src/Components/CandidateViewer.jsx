// CandidateViewer.jsx
import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    CheckCircle, X, Mail, Phone, Briefcase,
    GraduationCap, Award, FileText, AlertTriangle
} from 'lucide-react';

import Breadcrumb from '../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import AddCandidateForm from '../Pages/Dashboard-Part/Tabs/Candidate-Tab/AddCandidateForm';
import LoadingButton from "./LoadingButton";
import { Button } from "./Buttons/Button";
import {
    useApplicationFilter,
} from "../apiHooks/useApplications";
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
    totalResults = 1 // Default to 1 (force navigation) if not provided
}) {
    console.log("position", position);

    const [showCandidateForm, setShowCandidateForm] = useState(false);
    const isExistingCandidate = candidate.match_status === 'existing';

    const displayScore = candidate.match_percentage;
    const displaySkillMatch = candidate.skill_match;

    const getRecommendation = (score) => {
        if (candidate.screening_result?.recommendation) {
            return candidate.screening_result.recommendation;
        }
        if (score == null) return 'Review manually - no automated score available';
        if (score >= 80) return 'Strong match - Highly recommended for interview';
        if (score >= 60) return 'Moderate match - Consider for interview';
        return 'Weak match - May not meet requirements';
    };
    // Fetch existing applications for this candidate
    const { applications: filteredApplications } =
        useApplicationFilter(
            candidate?.existing_candidate_id,
            position?._id                     // ← add ? here too
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




    const [showExistingAppPrompt, setShowExistingAppPrompt] = useState(false);

    const [isProceeding, setIsProceeding] = useState(false);

    const handleProceed = () => {
        if (isProceeding) return;
        setIsProceeding(true);

        if (hasActiveApplication) {
            setShowExistingAppPrompt(true);
            setIsProceeding(false);
            return;
        }
        setShowCandidateForm(true);
    };


    const navigate = useNavigate();

    const handleFormClose = (savedData) => {
        setShowCandidateForm(false);
        // Close the entire CandidateViewer popup after form is closed
        onClose();

        // If we saved successfully (savedData present) and have a position, go to Candidates tab
        // ONLY if totalResults is 1. If > 1, we want to stay on the screening list.
        if (savedData && position?._id && totalResults === 1) {
            navigate(`/position/view-details/${position._id}`, {
                state: { activeTab: 'Candidates' }
            });
        }
    };

    // Dynamic heading based on source
    const analysisHeading = source === 'ai_claude'
        ? "AI Screening Analysis"
        : "System Screening Analysis";
    // Breadcrumb items (single instance at top)
    const breadcrumbItems = showCandidateForm
        ? [
            { label: "Positions", path: "/positions" },
            {
                label: position?.title || "Position",
                path: position?.id ? `/positions/${position.id}` : "#",
                status: position?.status || "Opened"
            },
            { label: "Candidates", path: "#" },
            { label: "Screening", path: "#" },
            { label: "Create Application", path: "#" }
        ]
        : [
            { label: "Positions", path: "/positions" },
            {
                label: position?.title || "Position",
                path: position?.id ? `/positions/${position.id}` : "#",
                status: position?.status || "Opened"
            },
            { label: "Candidates", path: "#" },
            { label: "Screening", path: "#" }
        ];

    // Prepare initialData for AddCandidateForm
    // In CandidateViewer.jsx — inside the component
    const initialFormData = {
        FirstName: candidate.candidate_name?.split(' ')[0]?.trim() || '',
        LastName: candidate.candidate_name?.split(' ').slice(1).join(' ').trim() || '',
        Email: candidate.candidate_email?.trim() || '',
        // ─── Phone & Country Code ────────────────────────────────────────
        CountryCode: candidate.candidate_country_code || '+91',  // prefer explicit country code if available

        // Clean phone number — remove country code prefix if present
        Phone: candidate.candidate_phone
            ? candidate.candidate_phone
                .replace(/^\+91/, '')     // remove +91 if present
                .replace(/^91/, '')       // remove 91 if present
                .trim()
            : '',

        // ─── Parsed / Screening-based fields ────────────────────────────────

        // Higher Qualification — prioritize screening_result → parsed_education → fallback empty
        HigherQualification:
            candidate.screening_result?.education ||
            candidate.screening_result?.parsedEducation ||
            candidate.parsed_education ||
            '',

        // University / College — try to extract intelligently from education string
        UniversityCollege:
            candidate.screening_result?.university ||
            (candidate.parsed_education?.match(/University\s+of\s+([\w\s]+)/i)?.[1]?.trim() ||
                candidate.parsed_education?.match(/([\w\s]+)\s+University/i)?.[1]?.trim() ||
                candidate.parsed_education?.split(',').pop()?.trim() || ''),

        // Experience — parse number safely from string or use screening years
        CurrentExperience:
            parseFloat(candidate.parsed_experience?.match(/(\d+(\.\d+)?)/)?.[0]) || // extract first number
            parseFloat(candidate.screening_result?.experience_years) ||
            candidate.screening_result?.experienceYears ||
            0,

        // Relevant Experience — same fallback (you can make different logic later if needed)
        RelevantExperience:
            parseFloat(candidate.parsed_experience?.match(/(\d+(\.\d+)?)/)?.[0]) ||
            parseFloat(candidate.screening_result?.experience_years) ||
            0,

        // Skills — pre-fill correctly as array of objects
        // Only pre-fill if parsed_skills exists and is array
        skills: Array.isArray(candidate.parsed_skills) && candidate.parsed_skills.length > 0
            ? candidate.parsed_skills.map(skillName => ({
                skill: skillName.trim(),
                experience: '',            // leave blank — user fills
                expertise: 'Beginner'      // default value (change if you have better mapping)
            }))
            : [],

        // LinkedIn (if available)
        linkedInUrl: candidate.linkedInUrl || '',

        // Optional — if form supports these
        // Gender: candidate.screening_result?.gender || candidate.gender || '',
        // Date_Of_Birth: candidate.screening_result?.dob || candidate.Date_Of_Birth || '',
    };

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
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0 mt-1"
                                aria-label="Close"
                            >
                                <X size={24} className="text-gray-600" />
                            </button>

                        </div>
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                {/* ─── Main content area ────────────────────────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden">

                    {!showCandidateForm ? (

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

                                            {candidate.screening_result?.summary && (
                                                <div className="pt-5 border-t border-gray-200">
                                                    <div className="flex items-center gap-2.5 mb-2">
                                                        <FileText size={18} className="text-cyan-700" />
                                                        <span className="font-semibold">Resume Summary</span>
                                                    </div>
                                                    <p className="text-sm leading-relaxed text-gray-700">
                                                        {candidate.screening_result.summary}
                                                    </p>
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
                                            <p className={`text-6xl font-extrabold ${getScoreColor(displayScore)}`}>
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

                                        {candidate.screening_result?.extracted_skills?.length > 0 && (
                                            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
                                                <p className="font-medium text-green-900 mb-2.5">
                                                    Matched Skills ({candidate.screening_result.extracted_skills.length})
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {candidate.screening_result.extracted_skills.map((s, i) => (
                                                        <span key={i} className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {candidate.screening_result?.missingSkills?.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                                                <div className="flex items-start gap-3">
                                                    <AlertTriangle size={20} className="text-red-600 mt-1 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium text-red-900 mb-2.5">
                                                            Missing Skills ({candidate.screening_result.missingSkills.length})
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {candidate.screening_result.missingSkills.map((s, i) => (
                                                                <span key={i} className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                                                                    {s}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="bg-white border border-cyan-100 rounded-xl p-5">
                                            <p className="font-medium text-cyan-800 mb-2">Recommendation</p>
                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                {getRecommendation(displayScore)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* No footer here anymore – moved to global bottom */}
                                </div>
                            </div>
                        </div>

                    ) : (

                        <div className="flex-1 overflow-y-auto bg-gray-50">
                            <AddCandidateForm
                                mode={isExistingCandidate ? "Edit" : "Add"}
                                isModal={true}
                                onClose={handleFormClose}
                                initialData={initialFormData}
                                screeningData={candidate}
                                source="candidate-screening"
                                positionId={position?._id}
                                candidateId={isExistingCandidate ? candidate.existing_candidate_id : undefined}

                            />
                        </div>

                    )}

                    {/* ─── Global shared footer (visible in screening mode only) ──────── */}
                    {!showCandidateForm && (
                        <div className="bg-white px-7 py-3 border-t border-gray-200">
                            {/* Info text above buttons */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-5 text-sm text-blue-800">
                                Proceeding to interview will create an Application and move this candidate to the Applications tab.
                            </div>

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
                                                navigate(`/position/view-details/${position._id}`, {
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
            </div>
        </div>,
        document.body
    );
}