import { Briefcase, Award, Mail, Phone, CircleUser } from 'lucide-react';
import SidebarPopup from '../../../../../Components/Shared/SidebarPopup/SidebarPopup';

export default function ProfileViewer({ candidate, onClose }) {
    if (!candidate) return null;

    // Static fallback data if main fields are missing
    const staticData = {
        summary: "Experienced software engineer with a strong background in developing scalable web applications. Proven ability to lead teams and deliver high-quality software on time.",
        experience: "5 years",
        skills: ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
        certifications: ["AWS Certified Solutions Architect", "Certified Scrum Master"],
        workHistory: [
            {
                role: "Senior Software Engineer",
                company: "Tech Solutions Inc.",
                duration: "2020 - Present",
                responsibilities: [
                    "Led development of core product features",
                    "Mentored junior developers",
                    "Optimized application performance by 40%"
                ]
            },
            {
                role: "Software Developer",
                company: "Digital Innovations",
                duration: "2018 - 2020",
                responsibilities: [
                    "Developed frontend components using React",
                    "Collaborated with UX designers",
                    "Participated in daily standups"
                ]
            }
        ],
        projects: [
            {
                name: "E-commerce Platform",
                description: "Built a fully functional e-commerce platform with payment gateway integration."
            },
            {
                name: "Task Management App",
                description: "Developed a real-time task management application for team collaboration."
            }
        ],
        highlights: [
            "Reduced server costs by 30%",
            "Implemented CI/CD pipeline",
            "Awarded Employee of the Month"
        ],
        additionalInfo: {
            location: "San Francisco, CA",
            languages: ["English", "Spanish"]
        }
    };

    const profile = candidate.profileJSON || {};

    // Merge static data if profile is empty or missing specific keys (optional logic, 
    // but user asked "if data not available means shown static data", so we provide defaults)
    const displayProfile = {
        summary: profile.summary || staticData.summary,
        education: profile.education || "Bachelor of Science in Computer Science",
        workHistory: (profile.workHistory && profile.workHistory.length > 0) ? profile.workHistory : staticData.workHistory,
        projects: (profile.projects && profile.projects.length > 0) ? profile.projects : staticData.projects,
        highlights: (profile.highlights && profile.highlights.length > 0) ? profile.highlights : staticData.highlights,
        additionalInfo: (profile.additionalInfo && Object.keys(profile.additionalInfo).length > 0) ? profile.additionalInfo : staticData.additionalInfo,
    };

    const displaySkills = (candidate.skills && candidate.skills.length > 0) ? candidate.skills : staticData.skills;
    const displayCertifications = (candidate.certifications && candidate.certifications.length > 0) ? candidate.certifications : staticData.certifications;


    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getSkillMatchColor = (match) => {
        switch (match) {
            case 'High': return 'bg-green-100 text-green-800';
            case 'Medium': return 'bg-yellow-100 text-yellow-800';
            case 'Low': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <SidebarPopup
            title="Candidate Profile"
            subTitle={candidate.name}
            onClose={onClose}
            icon={<CircleUser className="w-5 h-5" />}
        // You can pass other props like showEdit, showExternal if needed
        >
            <div className="space-y-6 pb-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h4 className="text-xl font-bold text-gray-900">{candidate.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                                {candidate.currentCompany && candidate.currentCompany !== 'Not specified'
                                    ? `${candidate.currentCompany} • ${candidate.experience}`
                                    : candidate.experience}
                            </p>
                        </div>
                        <div className="text-right">
                            {candidate.score !== null && (
                                <div className="mb-2">
                                    <span className={`text-3xl font-bold ${getScoreColor(candidate.score)}`}>
                                        {candidate.score}
                                    </span>
                                    <span className="text-sm text-gray-500">/100</span>
                                </div>
                            )}
                            {candidate.skillMatch && (
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSkillMatchColor(candidate.skillMatch)}`}>
                                    {candidate.skillMatch} Match
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {candidate.email && (
                            <div className="flex items-center gap-2">
                                <Mail size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-900">{candidate.email}</span>
                            </div>
                        )}
                        {candidate.phone && (
                            <div className="flex items-center gap-2">
                                <Phone size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-900">{candidate.phone}</span>
                            </div>
                        )}
                    </div>

                    {(displayProfile.education) && (
                        <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Education</h5>
                            <p className="text-sm text-gray-900">{displayProfile.education}</p>
                        </div>
                    )}

                    {displaySkills && displaySkills.length > 0 && (
                        <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Skills</h5>
                            <div className="flex flex-wrap gap-2">
                                {displaySkills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700"
                                    >
                                        {typeof skill === 'string' ? skill : skill.skill || JSON.stringify(skill)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {displayCertifications && displayCertifications.length > 0 && (
                        <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Certifications</h5>
                            <div className="flex flex-wrap gap-2">
                                {displayCertifications.map((cert, index) => (
                                    <div key={index} className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                                        <Award size={12} />
                                        {cert}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {displayProfile.summary && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                        <div className="bg-gray-50 rounded-lg p-5">
                            <p className="text-gray-700 leading-relaxed">{displayProfile.summary}</p>
                        </div>
                    </div>
                )}

                {displayProfile.workHistory && displayProfile.workHistory.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                        <div className="space-y-4">
                            {displayProfile.workHistory.map((job, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-base font-semibold text-gray-900">{job.role}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{job.company}</p>
                                        </div>
                                        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{job.duration}</span>
                                    </div>
                                    {job.responsibilities && job.responsibilities.length > 0 && (
                                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 mt-3">
                                            {job.responsibilities.map((resp, idx) => (
                                                <li key={idx}>{resp}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {displayProfile.projects && displayProfile.projects.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects</h3>
                        <div className="space-y-4">
                            {displayProfile.projects.map((project, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-5">
                                    <h4 className="text-base font-semibold text-gray-900 mb-2">{project.name}</h4>
                                    <p className="text-sm text-gray-700">{project.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {displayProfile.highlights && displayProfile.highlights.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Achievements</h3>
                        <div className="bg-gray-50 rounded-lg p-5">
                            <ul className="space-y-2">
                                {displayProfile.highlights.map((highlight, index) => (
                                    <li key={index} className="flex gap-2 text-sm text-gray-700">
                                        <span className="text-teal-600 mt-1">•</span>
                                        <span>{highlight}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {displayProfile.additionalInfo && Object.keys(displayProfile.additionalInfo).length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                        <div className="bg-gray-50 rounded-lg p-5">
                            <div className="space-y-2 text-sm text-gray-700">
                                {displayProfile.additionalInfo.location && (
                                    <p>
                                        <span className="font-medium">Location:</span> {displayProfile.additionalInfo.location}
                                    </p>
                                )}
                                {displayProfile.additionalInfo.languages && (
                                    <p>
                                        <span className="font-medium">Languages:</span>{' '}
                                        {displayProfile.additionalInfo.languages.join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SidebarPopup>
    );
}
