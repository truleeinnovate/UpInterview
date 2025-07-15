import React, { useState, useEffect } from 'react';
import { Star, ChevronRight, Calendar, CheckCircle, Building, MapPin, Briefcase } from 'lucide-react';
import { useCustomContext } from '../../../../Context/Contextfetch.js';

const DashboardInternalInterviewers = ({ setInternalInterviews }) => {
    const { interviewers } = useCustomContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [slideDirection, setSlideDirection] = useState('right');

    // Extract the data array from interviewers, default to empty array
    const interviewersList = interviewers?.data || [];

    const formattedInterviewers = React.useMemo(() => {
        if (!interviewers?.data) return [];

        return interviewers.data
            .filter(interviewer => interviewer.type === 'internal')
            .map(interviewer => {
                const contact = interviewer.contact || {};
                const fullName = `${contact.firstName ? contact.firstName.charAt(0).toUpperCase()+contact.firstName.slice(1): ''} ${contact.lastName ? contact.lastName.charAt(0).toUpperCase()+contact.lastName.slice(1): ''}`.trim();
                return {
                    id: interviewer._id,
                    name: fullName || 'Unnamed Interviewer',
                    role: contact.currentRole || 'Interviewer',
                    image: contact.ImageData?.path
                        ? `${process.env.REACT_APP_API_URL}${contact.ImageData.path.replace(/\\/g, '/')}`
                        : null, // Changed to null to handle with nullish coalescing
                    rating: 4.5, // Consider making this dynamic if available
                    department: contact.department || contact.industry || 'Not specified',
                    company: contact.company || contact.organization || 'Internal',
                    location: contact.location || 'Location not specified',
                    completedInterviews: contact.completedInterviews || 0,
                    nextAvailable: 'Available now', // More user-friendly than 'N/A'
                    type: 'internal',
                    availability: 'Available',
                    email: contact.email || 'No email provided',
                    phone: contact.phoneNumber || contact.phone || 'Not provided'
                };
            });
    }, [interviewers]);

    // Get first 3 interviewers only
    const displayInterviewers = formattedInterviewers.slice(0, 3);

    // Auto-rotate slides
    useEffect(() => {
        if (displayInterviewers.length > 1) {
            const interval = setInterval(() => {
                setSlideDirection('right');
                setCurrentIndex((prev) => (prev + 1) % displayInterviewers.length);
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [displayInterviewers.length]);

    return (
        <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Internal Interviewers</h2>
                    <p className="text-sm text-gray-500">Internal Interviewers ready to help</p>
                </div>
                <button
                    onClick={() => setInternalInterviews(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
                >
                    <span className="text-sm font-medium">View All</span>
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="relative h-[160px] overflow-hidden">
                {displayInterviewers.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-gray-500">No Internal Interviewers Available.</p>
                    </div>
                ) : (
                    displayInterviewers.map((interviewer, index) => (
                        <div
                            key={interviewer.id}
                            className={`absolute top-0 left-0 w-full p-4 border border-gray-200 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/50 transition-all duration-500 ${index === currentIndex
                                ? 'opacity-100 translate-x-0'
                                : index < currentIndex
                                    ? '-translate-x-full opacity-0'
                                    : 'translate-x-full opacity-0'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    {interviewer.image && interviewer.image !== 'https://via.placeholder.com/50' ? (
                                        <img
                                            src={interviewer.image}
                                            alt={interviewer.name}
                                            className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center ring-2 ring-gray-200">
                                            <span className="text-white font-semibold text-2xl -mt-[4px]">
                                                {/* {interviewer.name.split(' ')[1]?.[0]?.toUpperCase() ||
                                                    interviewer.name.split(' ')[0]?.[0]?.toUpperCase()} */}
                                                {interviewer.name.substring(0, 1)}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 truncate">{interviewer.name}</h3>
                                            <p className="text-xs text-gray-600">{interviewer.role}</p>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                            <span className="text-sm text-gray-600">{interviewer.rating}</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 mb-3">
                                        <div className="flex items-center space-x-[2px] text-xs text-gray-500">
                                            <Building size={14} />
                                            <span>{interviewer.department || interviewer.company}</span>
                                        </div>
                                        <div className="flex items-center space-x-[2px] text-xs text-gray-500 -ml-6">
                                            <MapPin size={14} />
                                            <span>{interviewer.location}</span>
                                        </div>
                                        <div className="flex items-center space-x-[2px] text-xs text-gray-500">
                                            <Briefcase size={14} />
                                            <span>{interviewer.completedInterviews} Interviews</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${interviewer.availability === 'Available'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-yellow-100 text-yellow-600'
                                                }`}
                                        >
                                            <CheckCircle size={14} className="mr-1" />
                                            {interviewer.availability}
                                        </span>
                                        {/* <div className="flex items-center space-x-2">
                                            <button className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-300">
                                                Profile
                                            </button>
                                            <button className="px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                                                Schedule
                                            </button>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Navigation dots */}
            {displayInterviewers.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                    {displayInterviewers.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setSlideDirection(index > currentIndex ? 'right' : 'left');
                                setCurrentIndex(index);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-custom-blue w-4' : 'bg-gray-300'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default DashboardInternalInterviewers;