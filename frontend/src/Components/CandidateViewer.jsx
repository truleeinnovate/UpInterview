import React from 'react';
import { CheckCircle, XCircle, Pause, Mail, Phone, Briefcase, GraduationCap, Award, FileText, AlertTriangle } from 'lucide-react';
import SidebarPopup from './Shared/SidebarPopup/SidebarPopup';

// Utility functions moved inside since the original file utils/resumeScoring didn't exist
const getScoreColor = (score) => {
    if (score === null || score === undefined) return 'text-gray-400';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-600';
};

const getScoreBadgeColor = (score) => {
    if (score === null || score === undefined) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-800';
};

export default function CandidateViewer({ candidate, onClose, onAction, position }) {
    // candidate prop is the viewingResult object from ResumeUploadPopup

    const displayScore = candidate.match_percentage;
    const displaySkillMatch = candidate.skill_match;

    const getRecommendation = (score) => {
        if (candidate.screening_result?.recommendation) {
            return candidate.screening_result.recommendation;
        }
        if (score === null || score === undefined) return 'Review manually - no automated score available';
        if (score >= 80) return 'Strong match - Highly recommended for interview';
        if (score >= 60) return 'Moderate match - Consider for interview';
        return 'Weak match - May not meet requirements';
    };

    const handleAction = (action) => {
        if (window.confirm(`Are you sure you want to ${action} this candidate?`)) {
            onAction(action, candidate.id);
        }
    };

    return (
        <SidebarPopup
            title="Candidate Screening"
            subTitle={`${position?.title || 'Position'} Application`}
            onClose={onClose}
        >
            <div className="flex flex-col h-full">
                <div className="flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x h-full">
                        {/* Left Column: Candidate Profile */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Candidate Profile</h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="text-2xl font-bold text-gray-900">{candidate.candidate_name || 'Unknown'}</h4>
                                        <div className="mt-2 space-y-2">
                                            {candidate.candidate_email && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail size={16} />
                                                    <span className="text-sm">{candidate.candidate_email}</span>
                                                </div>
                                            )}
                                            {candidate.candidate_phone && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Phone size={16} />
                                                    <span className="text-sm">{candidate.candidate_phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {candidate.parsed_experience && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Briefcase size={18} style={{ color: 'rgb(33, 121, 137)' }} />
                                                <span className="font-medium text-gray-900">Experience</span>
                                            </div>
                                            <p className="text-sm text-gray-700 whitespace-pre-line">{candidate.parsed_experience}</p>
                                        </div>
                                    )}

                                    {(candidate.parsed_education || candidate.screening_result?.education) && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <GraduationCap size={18} style={{ color: 'rgb(33, 121, 137)' }} />
                                                <span className="font-medium text-gray-900">Education</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{candidate.parsed_education || candidate.screening_result?.education || 'Not specified'}</p>
                                        </div>
                                    )}

                                    {candidate.parsed_skills && candidate.parsed_skills.length > 0 && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Award size={18} style={{ color: 'rgb(33, 121, 137)' }} />
                                                <span className="font-medium text-gray-900">Skills</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.parsed_skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {candidate.screening_result?.summary && (
                                        <div className="border-t pt-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={18} style={{ color: 'rgb(33, 121, 137)' }} />
                                                <span className="font-medium text-gray-900">Resume Highlights</span>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-3">{candidate.screening_result.summary}</p>
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">Resume File</span>
                                            <span className="text-sm text-gray-600 truncate max-w-[150px]" title={candidate.file_name}>{candidate.file_name}</span>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Right Column: AI Screening Analysis */}
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Screening Analysis</h3>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-2">Match Score</p>
                                            <p className={`text-4xl font-bold ${getScoreColor(displayScore)}`}>
                                                {displayScore !== null && displayScore !== undefined ? `${displayScore}%` : 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                AI Screening
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-1">Skill Match</p>
                                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getScoreBadgeColor(displaySkillMatch)}`}>
                                                {displaySkillMatch !== null ? `${displaySkillMatch}%` : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-600 mb-1">Status</p>
                                            <p className="text-lg font-semibold text-gray-900 capitalize">
                                                {candidate.match_status?.replace('_', ' ') || 'New'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Matched Skills from Screening */}
                                    {candidate.screening_result?.extracted_skills && candidate.screening_result?.extracted_skills.length > 0 && (
                                        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                                            <p className="text-sm font-medium text-green-900 mb-2">
                                                Matched Skills ({candidate.screening_result.extracted_skills.length})
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {candidate.screening_result.extracted_skills.map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Missing Skills */}
                                    {candidate.screening_result?.missingSkills && candidate.screening_result?.missingSkills.length > 0 && (
                                        <div className="border rounded-lg p-4 bg-red-50 border-red-200">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle size={18} className="text-red-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-red-900 mb-2">
                                                        Missing Required Skills ({candidate.screening_result.missingSkills.length})
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {candidate.screening_result.missingSkills.map((skill, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {candidate.screening_result && (
                                        <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                                            <p className="text-sm font-semibold mb-2 text-purple-900 flex items-center gap-2">
                                                <span className="text-purple-600">✨</span> AI Insights
                                            </p>

                                            {candidate.screening_result.strengths && candidate.screening_result.strengths.length > 0 && (
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

                                            {(candidate.screening_result.gaps || candidate.screening_result.concerns) && (candidate.screening_result.gaps || candidate.screening_result.concerns).length > 0 && (
                                                <div className="mt-3">
                                                    <p className="text-xs font-semibold text-orange-800 mb-1">Potential Concerns:</p>
                                                    <ul className="space-y-1">
                                                        {/* Handling both 'gaps' and 'concerns' fields just in case */}
                                                        {(candidate.screening_result.gaps || candidate.screening_result.concerns).map((concern, index) => (
                                                            <li key={index} className="flex items-start gap-2">
                                                                <span className="text-orange-600 text-xs mt-0.5">⚠</span>
                                                                <span className="text-xs text-gray-700">{concern}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="border rounded-lg p-4" style={{ borderColor: 'rgb(33, 121, 137, 0.2)', backgroundColor: 'rgb(33, 121, 137, 0.05)' }}>
                                        <p className="text-sm font-medium mb-2" style={{ color: 'rgb(33, 121, 137)' }}>
                                            Recommendation
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            {getRecommendation(displayScore)}
                                        </p>
                                    </div>

                                    {displayScore !== null && displayScore !== undefined && (
                                        <div className="space-y-3">
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

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Decision</h3>
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleAction('proceed')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        <CheckCircle size={20} />
                                        Proceed to Interview
                                    </button>
                                    <button
                                        onClick={() => handleAction('hold')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                                    >
                                        <Pause size={20} />
                                        Put On Hold
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <XCircle size={20} />
                                        Reject Candidate
                                    </button>
                                </div>

                                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-800">
                                        Proceeding to interview will create an Application and move this candidate to the Applications tab.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarPopup>
    );
}
