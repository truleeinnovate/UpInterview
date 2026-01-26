import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Mail, Phone, Linkedin, Upload, FileText, X, CheckCircle, Clock,
    XCircle, AlertCircle, Calendar, User, Award, Briefcase, GraduationCap,
    Star, TrendingUp, MessageSquare, ExternalLink, Download, MapPin, Globe,
    Languages, DollarSign
} from 'lucide-react';
import { useCandidateById } from "../../../../apiHooks/useCandidates";
import { useApplicationMutations } from "../../../../apiHooks/useApplications";

export default function ApplicationView({ application, onBack }) {
    const [applicationStatus, setApplicationStatus] = useState(application.status || 'APPLIED');
    const [activeTab, setActiveTab] = useState('resume');
    const [candidate, setCandidate] = useState({});

    const { updateApplicationStatus } = useApplicationMutations();

    const [showAllResumes, setShowAllResumes] = useState(false);
    const [showUploadResume, setShowUploadResume] = useState(false);
    const candidateId = application.candidateId?._id || application.candidateId;
    console.log(candidateId);
    const { candidate: fetchedCandidate, isLoading } = useCandidateById(candidateId);
    // Use candidate data from the populated application object
    useEffect(() => {
        if (candidateId && fetchedCandidate) {
            setCandidate(fetchedCandidate);
        }
    }, [candidateId, fetchedCandidate]);
    // Mock interviews for now - typically would fetch using useInterviewsByApplication hook
    const applicationInterviews = application.interviews || [];

    if (!candidate || !candidate._id) {
        return (
            <div className="p-8">
                <button onClick={onBack} className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} />
                    Back
                </button>
                <p className="text-gray-500">Candidate data not available</p>
            </div>
        );
    }

    // Helper to map backend fields to UI Expected fields
    const candidateName = `${candidate.FirstName || ''} ${candidate.LastName || ''}`.trim() || 'Unknown Candidate';
    const candidateEmail = candidate.Email || '';
    const candidatePhone = candidate.Phone || 'N/A';
    const candidateLinkedin = candidate.LinkedinUrl || '';

    const profile = candidate.profile || {}; // Assuming profile data might be here or flattened
    const workHistory = Array.isArray(candidate.workHistory) ? candidate.workHistory : [];
    const projects = Array.isArray(candidate.projects) ? candidate.projects : [];
    const skills = candidate.skills || [];

    const getStatusColor = (status) => {
        switch (status) {
            case 'New':
            case 'APPLIED':
                return 'bg-blue-100 text-blue-800';
            case 'SCREENED':
                return 'bg-purple-100 text-purple-800';
            case 'INTERVIEW':
            case 'INTERVIEWING':
                return 'bg-yellow-100 text-yellow-800';
            case 'DECISION':
                return 'bg-orange-100 text-orange-800';
            case 'REJECTED':
                return 'bg-red-100 text-red-800';
            case 'ACCEPTED':
            case 'HIRED':
            case 'OFFERED':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score) => {
        if (score >= 80) return 'bg-green-50 border-green-200';
        if (score >= 60) return 'bg-yellow-50 border-yellow-200';
        return 'bg-red-50 border-red-200';
    };

    const getInterviewStatusIcon = (status) => {
        switch (status) {
            case 'Completed':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'Scheduled':
                return <Clock size={16} className="text-blue-600" />;
            case 'Cancelled':
                return <XCircle size={16} className="text-red-600" />;
            default:
                return <Clock size={16} className="text-gray-600" />;
        }
    };

    const handleStatusChange = async (newStatus, actionLabel) => {
        // Optimistic update
        const oldStatus = applicationStatus;
        setApplicationStatus(newStatus);

        try {
            await updateApplicationStatus({
                id: application._id,
                action: actionLabel || newStatus, // pass action if available, else status
                status: newStatus
            });
        } catch (error) {
            console.error("Failed to update status:", error);
            // Revert on failure
            setApplicationStatus(oldStatus);
        }
    };

    const getAvailableActions = () => {
        const currentStatus = applicationStatus.toUpperCase();
        switch (currentStatus) {
            case 'NEW':
            case 'APPLIED':
                return [
                    { label: 'Run AI Screening', action: () => handleStatusChange('SCREENED', 'Run AI Screening'), color: 'primary', icon: TrendingUp },
                    { label: 'Reject', action: () => handleStatusChange('REJECTED', 'Reject'), color: 'red', icon: X },
                    { label: 'Withdraw Application', action: () => handleStatusChange('WITHDRAWN', 'Withdraw Application'), color: 'yellow', icon: X }
                ];
            case 'SCREENED':
                return [
                    { label: 'Schedule Interview', action: () => handleStatusChange('INTERVIEWING', 'Schedule Interview'), color: 'primary', icon: Calendar },
                    { label: 'Reject', action: () => handleStatusChange('REJECTED', 'Reject'), color: 'red', icon: X }
                ];
            case 'INTERVIEW':
            case 'INTERVIEWING':
                return [
                    { label: 'Move to Decision', action: () => handleStatusChange('DECISION', 'Move to Decision'), color: 'primary', icon: CheckCircle },
                    { label: 'Reject', action: () => handleStatusChange('REJECTED', 'Reject'), color: 'red', icon: X }
                ];
            case 'DECISION':
                return [
                    { label: 'Make Offer', action: () => handleStatusChange('OFFERED', 'Offer'), color: 'green', icon: CheckCircle },
                    { label: 'Reject', action: () => handleStatusChange('REJECTED', 'Reject'), color: 'red', icon: X }
                ];
            case 'REJECTED':
            case 'HIRED':
            case 'OFFERED':
            case 'ACCEPTED':
                return [];
            default:
                return [];
        }
    };

    const getActionButtonStyle = (color) => {
        const styles = {
            primary: 'bg-[rgb(33,121,137)] hover:bg-[rgb(28,102,116)] text-white',
            red: 'bg-red-600 hover:bg-red-700 text-white',
            green: 'bg-green-600 hover:bg-green-700 text-white'
        };
        return styles[color] || styles.primary;
    };

    // Safe access score
    const score = application.screeningScore || candidate.score || 0;

    const candidateResumes = [
        { id: 1, name: application.resumeVersion || 'Resume v1', uploadDate: '2024-01-15', active: true, size: '245 KB' },
        // Mock additional resumes for UI demo
    ];

    return (
        <div>
            <div className="max-w-[1800px] mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={20} />
                            <span className="font-medium">Back to Position</span>
                        </button>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Application Review</h1>
                            <p className="text-sm text-gray-500">Application ID: {application.applicationNumber || application._id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-xs text-gray-500 uppercase tracking-wide">Position</div>
                            <div className="text-sm font-semibold text-gray-900">{application.positionId?.title || application.positionTitle || 'Position Title'}</div>
                        </div>
                        <span className={`px-4 py-2 text-sm font-bold rounded-lg ${getStatusColor(applicationStatus)}`}>
                            {applicationStatus}
                        </span>
                    </div>
                </div>

                <div className="grid sm:grid-cols-1 grid-cols-12 gap-6">
                    <div className="col-span-3 space-y-6">
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-[rgb(33,121,137)] px-6 py-4">
                                <h2 className="text-lg font-bold text-white">Candidate Profile</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-6 flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xl font-bold border-4 border-gray-100 flex-shrink-0">
                                        {candidateName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-lg font-bold text-gray-900 truncate">{candidateName}</h3>
                                        <p className="text-sm text-gray-600 truncate">{candidate.CurrentRole || 'Candidate'}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                            <Briefcase size={12} />
                                            <span>{candidate.CurrentExperience || '0'} Years</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Mail size={14} className="text-gray-600" />
                                        </div>
                                        <span className="text-gray-900 truncate">{candidateEmail}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Phone size={14} className="text-gray-600" />
                                        </div>
                                        <span className="text-gray-900">{candidatePhone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <MapPin size={14} className="text-gray-600" />
                                        </div>
                                        <span className="text-gray-900">{candidate.CurrentLocation || 'San Francisco, CA'}</span>
                                    </div>
                                    {candidateLinkedin && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <Globe size={14} className="text-gray-600" />
                                            </div>
                                            <a href={candidateLinkedin} target="_blank" rel="noopener noreferrer" className="text-[rgb(33,121,137)] hover:underline">
                                                Portfolio / LinkedIn
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {(() => {
                                    const displaySkills = (skills && skills.length > 0) ? skills : [
                                        "Salesforce", "Apex", "Lightning Web Components", "LWC",
                                        "Visualforce", "SOQL", "Salesforce Integration", "REST API",
                                        "JavaScript", "Git", "Agile"
                                    ];

                                    return (
                                        <div className="mb-6 pt-6 border-t">
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Star size={16} className="text-yellow-500" />
                                                Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {displaySkills.slice(0, 8).map((skill, index) => (
                                                    <span
                                                        key={index}
                                                        className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-700 border border-gray-200 shadow-sm"
                                                    >
                                                        {typeof skill === 'object' ? skill.skill : skill}
                                                    </span>
                                                ))}
                                                {displaySkills.length > 8 && (
                                                    <span className="px-2.5 py-1 text-xs font-medium rounded-md bg-gray-50 text-gray-500 border border-gray-200 shadow-sm">
                                                        +{displaySkills.length - 8} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="mb-6 pt-6 border-t">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Additional Details</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-3 text-sm">
                                            <GraduationCap size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Education</div>
                                                <div className="text-gray-900 font-medium">{candidate.education || 'BS Computer Science'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Languages size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Languages</div>
                                                <div className="text-gray-900 font-medium">{candidate.languages || 'English, Spanish'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <DollarSign size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Expected Salary</div>
                                                <div className="text-gray-900 font-medium">{candidate.expectedSalary || '$120K - $150K'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Clock size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Notice Period</div>
                                                <div className="text-gray-900 font-medium">{candidate.noticePeriod || '2 weeks'}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 text-sm">
                                            <Award size={16} className="text-gray-500 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Work Authorization</div>
                                                <div className="text-gray-900 font-medium">{candidate.workAuth || 'US Citizen'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-6 pt-6 border-t">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Resume</h4>
                                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <FileText size={18} className="text-[rgb(33,121,137)]" />
                                            <div>
                                                <div className="text-sm font-bold text-gray-900">{application.resumeVersion || 'Resume v2'}</div>
                                                <div className="text-xs text-gray-500">Uploaded {new Date(application.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <button className="text-[rgb(33,121,137)] hover:text-[rgb(28,102,116)]">
                                            <Download size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-6 pt-6 border-t">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Application History</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Applications</span>
                                            <span className="font-bold text-gray-900">1</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Resumes Uploaded</span>
                                            <span className="font-bold text-gray-900">3</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Interviews Attended</span>
                                            <span className="font-bold text-gray-900">2</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t space-y-3">
                                    {/* <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[rgb(33,121,137)] hover:bg-[rgb(28,102,116)] text-white rounded-lg text-sm font-bold transition-colors">
                                        <Upload size={16} />
                                        Upload New Resume
                                    </button> */}
                                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">
                                        <FileText size={16} />
                                        View All Resumes
                                    </button>

                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="col-span-6 space-y-6">
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="border-b bg-gray-50">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('resume')}
                                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'resume'
                                            ? 'bg-white text-[rgb(33,121,137)] border-b-2 border-[rgb(33,121,137)]'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Resume View
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('profile')}
                                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'profile'
                                            ? 'bg-white text-[rgb(33,121,137)] border-b-2 border-[rgb(33,121,137)]'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Parsed Profile
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('workHistory')}
                                        className={`flex-1 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === 'workHistory'
                                            ? 'bg-white text-[rgb(33,121,137)] border-b-2 border-[rgb(33,121,137)]'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        Work History
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {activeTab === 'resume' && (
                                    <div className="bg-gray-50 rounded-lg p-8 border border-gray-200" style={{ minHeight: '400px' }}>
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                            <FileText size={64} className="mb-4 text-gray-400" />
                                            <p className="text-lg font-medium mb-2">Resume PDF Viewer</p>
                                            <p className="text-sm">{application.resumeVersion || 'Resume v1'}</p>
                                            <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-[rgb(33,121,137)] hover:bg-[rgb(28,102,116)] text-white rounded-lg transition-colors">
                                                <Download size={16} />
                                                Download PDF
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Briefcase size={18} className="text-blue-600" />
                                                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Experience</span>
                                                </div>
                                                <p className="text-3xl font-bold text-blue-900">{candidate.CurrentExperience || '6'} <span className="text-lg font-medium text-blue-700">years</span></p>
                                            </div>
                                            <div className="bg-green-50 rounded-lg p-5 border border-green-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <GraduationCap size={18} className="text-green-600" />
                                                    <span className="text-xs font-bold text-green-900 uppercase tracking-wider">Education</span>
                                                </div>
                                                <p className="text-base font-medium text-green-900 leading-relaxed">
                                                    {candidate.education || 'BS Computer Science - University of Texas'}
                                                </p>
                                            </div>
                                        </div>

                                        {skills && skills.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Star size={16} className="text-yellow-500" />
                                                    Technical Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map((skill, index) => (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 border border-gray-200"
                                                        >
                                                            {typeof skill === 'object' ? skill.skill : skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <Award size={16} className="text-yellow-600" />
                                                Certifications
                                            </h4>
                                            <div className="space-y-2">
                                                {(candidate.certifications && candidate.certifications.length > 0 ? candidate.certifications : [
                                                    "Platform Developer I",
                                                    "Platform Developer II",
                                                    "JavaScript Developer I"
                                                ]).map((cert, i) => (
                                                    <div key={i} className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-900 text-sm font-medium">
                                                        <Award size={14} className="text-yellow-600" />
                                                        {cert}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Projects</h4>
                                            <div className="space-y-4">
                                                {(candidate.projects && candidate.projects.length > 0 ? candidate.projects : [
                                                    {
                                                        title: "Enterprise Lightning Migration",
                                                        desc: "Led the complete migration of legacy Salesforce Classic application to Lightning Experience, including redesigning 40+ custom components and training 500+ users"
                                                    },
                                                    {
                                                        title: "Real-time Integration Platform",
                                                        desc: "Architected and implemented a real-time integration layer connecting Salesforce with ERP, marketing automation, and customer support systems using REST APIs and Platform Events"
                                                    }
                                                ]).map((project, i) => (
                                                    <div key={i} className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                                                        <h5 className="text-base font-bold text-gray-900 mb-2">{project.title}</h5>
                                                        <p className="text-sm text-gray-600 leading-relaxed">{project.desc || project.description}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'workHistory' && (
                                    <div className="space-y-6 relative pl-4 border-l-2 border-gray-200 ml-4">
                                        {(() => {
                                            const historyToDisplay = (workHistory && workHistory.length > 0) ? workHistory : [
                                                {
                                                    role: "Senior Salesforce Developer",
                                                    company: "Salesforce",
                                                    duration: "2022 - Present",
                                                    responsibilities: [
                                                        "Led migration from Classic to Lightning Experience for 500+ users",
                                                        "Built complex LWC components with 50+ custom features",
                                                        "Integrated Salesforce with 10+ external systems using REST/SOAP APIs"
                                                    ]
                                                },
                                                {
                                                    role: "Salesforce Developer",
                                                    company: "Accenture",
                                                    duration: "2019 - 2022",
                                                    responsibilities: [
                                                        "Developed custom Apex triggers and classes for business automation",
                                                        "Created reusable Lightning Web Components for client projects",
                                                        "Implemented CI/CD pipelines using Salesforce DX"
                                                    ]
                                                },
                                                {
                                                    role: "Junior Salesforce Developer",
                                                    company: "Tech Solutions Inc",
                                                    duration: "2018 - 2019",
                                                    responsibilities: [
                                                        "Built Visualforce pages and custom controllers",
                                                        "Wrote SOQL queries and optimized data retrieval",
                                                        "Assisted in Salesforce configuration and deployment"
                                                    ]
                                                }
                                            ];

                                            return historyToDisplay.map((job, index) => (
                                                <div key={index} className="relative pl-6 pb-2">
                                                    {/* Timeline Dot */}
                                                    <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full bg-[rgb(33,121,137)] border-4 border-white shadow-sm ring-1 ring-gray-200"></div>

                                                    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{job.role || job.title}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                                                            <Briefcase size={14} />
                                                            <span className="font-medium">{job.company}</span>
                                                            <span>•</span>
                                                            <span>{job.duration || `${job.startDate || ''} - ${job.endDate || 'Present'}`}</span>
                                                        </div>

                                                        {(job.responsibilities || job.description) && (
                                                            <div className="space-y-2">
                                                                {(Array.isArray(job.responsibilities) ? job.responsibilities : [job.description]).map((resp, i) => (
                                                                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                                        <CheckCircle size={14} className="text-green-500 mt-1 flex-shrink-0" />
                                                                        <span>{resp}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    AI Screening & Match Analysis
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className={`${getScoreBgColor(score)} rounded-lg p-6 border-2 mb-6`}>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-sm font-medium text-gray-600 mb-2">Overall Match Score</div>
                                            <div className="flex items-baseline gap-3">
                                                <span className={`text-6xl font-bold ${getScoreColor(score)}`}>
                                                    {score}
                                                </span>
                                                <span className="text-2xl text-gray-500">/100</span>
                                            </div>
                                            <div className="mt-3 w-48 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${score >= 80 ? 'bg-green-600' : score >= 60 ? 'bg-yellow-500' : 'bg-red-600'}`}
                                                    style={{ width: `${score}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-600 mb-1">Job Fit Rating</div>
                                            <div className={`text-2xl font-bold mb-1 ${score >= 80 ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>
                                                {score >= 80 ? 'Strong Yes' : score >= 60 ? 'Yes' : 'No'}
                                            </div>
                                            <div className="flex gap-1 justify-end">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={18}
                                                        className={`${star <= (score >= 80 ? 5 : score >= 60 ? 3 : 1)
                                                            ? (score >= 80 ? 'text-green-500 fill-current' : score >= 60 ? 'text-yellow-500 fill-current' : 'text-red-500 fill-current')
                                                            : 'text-gray-300'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {(application.screeningResult?.metadata?.strengths?.length > 0
                                            ? application.screeningResult.metadata.strengths
                                            : [
                                                "Strong technical background with relevant experience",
                                                "Skills align well with position requirements"
                                            ]
                                        ).slice(0, 2).map((point, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                                <span className="text-sm font-medium text-gray-700">{point}</span>
                                            </div>
                                        ))}

                                        {(application.screeningResult?.metadata?.concerns?.length > 0
                                            ? application.screeningResult.metadata.concerns
                                            : [
                                                "Could benefit from additional training in emerging technologies"
                                            ]
                                        ).slice(0, 1).map((point, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                                                <AlertCircle size={18} className="text-yellow-500 flex-shrink-0" />
                                                <span className="text-sm font-medium text-gray-700">{point}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs font-bold text-blue-900 uppercase mb-2">AI Recommendation</div>
                                                <p className="text-sm text-gray-700 leading-relaxed italic">
                                                    "{application.screeningNotes || "Excellent candidate with strong technical expertise and relevant industry experience. Highly recommend proceeding to technical interview round. Skills match closely with position requirements."}"
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                            <div className="px-6 py-4 border-b bg-gray-50">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar size={20} className="text-gray-600" />
                                    Interview Timeline
                                </h3>
                            </div>
                            <div className="p-6">
                                {(() => {
                                    // Use dynamic interviews if available, otherwise use static fallback for demo
                                    const timelineEvents = (application.interviews && application.interviews.length > 0)
                                        ? application.interviews
                                        : [
                                            {
                                                title: "Round 1: Technical",
                                                date: "2026-01-12",
                                                interviewer: "Michael Roberts",
                                                status: "Completed",
                                                feedback: "Outstanding Salesforce expertise, especially LWC"
                                            },
                                            {
                                                title: "Round 2: Architecture Review",
                                                date: "2026-01-13",
                                                interviewer: "Jennifer Lee",
                                                status: "Completed",
                                                feedback: "Great architectural thinking and scalability mindset"
                                            }
                                        ];

                                    if (timelineEvents.length === 0) {
                                        return (
                                            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                                <Clock size={48} className="mx-auto mb-3 text-gray-400" />
                                                <p className="text-gray-600 font-medium mb-1">No interviews scheduled</p>
                                                <p className="text-sm text-gray-500">Interview rounds will appear here once scheduled</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div className="relative pl-4 ml-2 border-l-2 border-gray-100 space-y-8">
                                            {timelineEvents.map((event, index) => (
                                                <div key={index} className="relative pl-6">
                                                    {/* Timeline Dot */}
                                                    <div className={`absolute -left-[23px] top-6 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-2 ring-gray-100 ${event.status === 'Completed' ? 'bg-green-500 ring-green-50' :
                                                        event.status === 'Scheduled' ? 'bg-blue-500 ring-blue-50' : 'bg-gray-300'
                                                        }`}></div>

                                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-5">
                                                        <div className="flex items-start justify-between mb-5">
                                                            <div className="flex items-start gap-4">
                                                                <div className={`mt-1 p-1.5 rounded-full ${event.status === 'Completed' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                                                                    <CheckCircle size={18} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-gray-900 text-base mb-1.5">{event.title || event.roundTitle || `Round ${index + 1}`}</h4>
                                                                    <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar size={14} className="text-gray-400" />
                                                                            <span>{event.date || event.scheduledAt || "Date not set"}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <User size={14} className="text-gray-400" />
                                                                            <span>{event.interviewer || "Interviewer assigned"}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${event.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                                event.status === 'Scheduled' ? 'bg-blue-100 text-blue-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                {event.status || 'Pending'}
                                                            </div>
                                                        </div>

                                                        {event.feedback && (
                                                            <div className="p-4 rounded-lg border border-gray-100 bg-white">
                                                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Feedback</div>
                                                                <p className="text-sm text-gray-700 leading-relaxed">
                                                                    {event.feedback}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden sticky top-6">
                            <div className="bg-[rgb(33,121,137)] px-6 py-4">
                                <h2 className="text-lg font-bold text-white">Hiring Actions</h2>
                            </div>
                            <div className="p-6">
                                <div className="mb-6">
                                    <div className="text-sm font-semibold text-gray-700 mb-3">Current Status</div>
                                    <div className="flex items-center justify-center">
                                        <span className={`px-4 py-2.5 text-base font-bold rounded-lg ${getStatusColor(applicationStatus)}`}>
                                            {applicationStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-6 pb-6 border-b">
                                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Application Progress</div>
                                    <div className="space-y-3">
                                        {['APPLIED', 'SCREENED', 'INTERVIEWING', 'DECISION'].map((status, index) => {
                                            const stages = ['APPLIED', 'SCREENED', 'INTERVIEWING', 'DECISION'];
                                            // Naive progress check
                                            const currentIndex = stages.indexOf(applicationStatus);
                                            const statusIndex = stages.indexOf(status);

                                            const isCompleted = currentIndex > statusIndex;
                                            const isActive = currentIndex === statusIndex;

                                            return (
                                                <div key={status} className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isActive ? 'bg-[rgb(33,121,137)] text-white ring-4 ring-blue-100' :
                                                        isCompleted ? 'bg-green-500 text-white' :
                                                            'bg-gray-200 text-gray-500'
                                                        }`}>
                                                        {isCompleted ? <CheckCircle size={16} /> : index + 1}
                                                    </div>
                                                    <span className={`text-sm font-medium ${isActive ? 'text-gray-900 font-bold' :
                                                        isCompleted ? 'text-gray-700' : 'text-gray-500'
                                                        }`}>
                                                        {status}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <div className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</div>
                                    {getAvailableActions().length === 0 ? (
                                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            <CheckCircle size={32} className={`mx-auto mb-2 ${applicationStatus === 'HIRED' ? 'text-green-500' : 'text-gray-400'}`} />
                                            <p className="text-sm font-medium text-gray-600">
                                                {applicationStatus === 'HIRED' ? 'Candidate Hired' : 'Action Unavailable'}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {getAvailableActions().map((action, index) => {
                                                const Icon = action.icon;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={action.action}
                                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold shadow-sm transition-all ${getActionButtonStyle(action.color)}`}
                                                    >
                                                        <Icon size={16} />
                                                        {action.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 border-t">
                                    <div className="text-sm font-semibold text-gray-700 mb-3">Timeline</div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Calendar size={16} className="text-gray-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Applied</div>
                                                <div className="text-sm font-medium text-gray-900">{new Date(application.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                            <Clock size={16} className="text-gray-600 flex-shrink-0" />
                                            <div>
                                                <div className="text-xs text-gray-500">Last Updated</div>
                                                <div className="text-sm font-medium text-gray-900">{new Date(application.updatedAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
