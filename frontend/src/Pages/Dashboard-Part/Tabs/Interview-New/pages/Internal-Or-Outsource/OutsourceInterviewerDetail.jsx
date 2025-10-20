import React, { useState } from 'react';
import { X, Star, Mail, Phone, ChevronLeft, ChevronRight, Calendar, User, FileText, Globe } from 'lucide-react';
// import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../CommonCode-AllTabs/ui/button';
import InterviewerAvatar from '../../../CommonCode-AllTabs/InterviewerAvatar';

function AvailabilityCalendar({ availabilities }) {
    console.log("availabilities", availabilities);

    const [currentWeek, setCurrentWeek] = useState(new Date());

    // Get dates for the current week
    const getDatesForWeek = (date) => {
        const week = [];
        const start = new Date(date);
        start.setDate(start.getDate() - start.getDay()); // Start from Sunday

        for (let i = 0; i < 7; i++) {
            week.push(new Date(start));
            start.setDate(start.getDate() + 1);
        }
        return week;
    };

    const weekDates = getDatesForWeek(currentWeek);
    const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    // Navigate between weeks
    const previousWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        setCurrentWeek(newDate);
    };

    const nextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        setCurrentWeek(newDate);
    };

    // Format date for display
    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Format time for display
    const formatTime = (hour) => {
        return `${hour % 12 || 12}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
    };

    // Check if a time slot is available
    const isAvailable = (date, hour) => {
        const dayOfWeek = date.getDay();
        const availability = availabilities[dayOfWeek];
        return availability?.includes(hour) || false;
    };

    return (
        <div className="mt-4">
            <div className="flex justify-between items-center mb-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousWeek}
                >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous Week
                </Button>
                <h4 className="text-sm font-medium text-gray-900">
                    {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
                </h4>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextWeek}
                >
                    Next Week
                    <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
            </div>

            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-8 gap-1">
                        {/* Time column header */}
                        <div className="h-12 flex items-center justify-center font-medium text-sm text-gray-500">
                            Time
                        </div>

                        {/* Day column headers */}
                        {weekDates.map((date, index) => (
                            <div
                                key={index}
                                className="h-12 flex flex-col items-center justify-center text-center"
                            >
                                <div className="text-sm font-medium text-gray-900">
                                    {new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)}
                                </div>
                            </div>
                        ))}

                        {/* Time slots */}
                        {timeSlots.map(hour => (
                            <React.Fragment key={hour}>
                                {/* Time label */}
                                <div className="h-12 flex items-center justify-end pr-2 text-sm text-gray-500">
                                    {formatTime(hour)}
                                </div>

                                {/* Availability cells */}
                                {weekDates.map((date, dateIndex) => (
                                    <div
                                        key={`${hour}-${dateIndex}`}
                                        className={`h-12 border border-gray-100 rounded-md ${isAvailable(date, hour)
                                            ? 'bg-green-50 hover:bg-green-100 cursor-pointer'
                                            : 'bg-gray-50'
                                            }`}
                                    >
                                        {isAvailable(date, hour) && (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-end space-x-4 text-sm">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-gray-600">Available</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-gray-200 mr-2"></div>
                    <span className="text-gray-600">Unavailable</span>
                </div>
            </div>
        </div>
    );
}

function TabButton({ isActive, onClick, children }) {
    return (
        <button
            onClick={onClick}
            className={`relative px-4 py-3 text-sm font-medium transition-colors focus:outline-none ${isActive
                ? 'text-custom-blue border-b-2 border-custom-blue'
                : 'text-muted-foreground hover:text-foreground hover:border-b-2 hover:border-gray-300'
                }`}
        >
            {children}
        </button>
    );
}

function InterviewerDetailsModal({ interviewer, onClose }) {
    console.log("interviewer details modal", interviewer);
    const [activeTab, setActiveTab] = useState('about');

    if (!interviewer) return null;

    // // Process availability data from the interviewer object
    // const processAvailability = () => {
    //     const availabilityMap = {};
    //     interviewer.contact.availability?.forEach(availability => {
    //         availability.days?.forEach(day => {
    //             const dayIndex = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    //                 .indexOf(day.day);
    //             if (dayIndex === -1) return;

    //             availabilityMap[dayIndex] = day.timeSlots?.flatMap(slot => {
    //                 const startHour = new Date(slot.startTime).getHours();
    //                 const endHour = new Date(slot.endTime).getHours();
    //                 return Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
    //             }) || [];
    //         });
    //     });
    //     return availabilityMap;
    // };

    // Process availability data from interviewer.days
    const processAvailability = () => {
        if (!interviewer?.days || interviewer.days.length === 0) return {};

        const dayMap = {
            Sun: 0,
            Mon: 1,
            Tue: 2,
            Wed: 3,
            Thu: 4,
            Fri: 5,
            Sat: 6
        };

        const availabilityMap = {};

        interviewer.days.forEach((dayObj) => {
            const dayIndex = dayMap[dayObj.day];
            if (dayIndex === undefined) return;

            availabilityMap[dayIndex] = [];

            dayObj.timeSlots?.forEach((slot) => {
                // Parse start and end hours
                const parseTime = (timeStr) => {
                    const [time, meridian] = timeStr.split(" ");
                    let [hour, minute] = time.split(":").map(Number);
                    if (meridian === "PM" && hour !== 12) hour += 12;
                    if (meridian === "AM" && hour === 12) hour = 0;
                    return hour;
                };

                const startHour = parseTime(slot.startTime);
                const endHour = parseTime(slot.endTime);

                // Fill available hours between start and end
                for (let hour = startHour; hour < endHour; hour++) {
                    availabilityMap[dayIndex].push(hour);
                }
            });
        });

        console.log("Final availabilityMap:", availabilityMap);
        return availabilityMap;
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'about':
                return (
                    <div key="about" className="space-y-4 mb-5">
                        {/* ========== About Section ========== */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">About</h3>
                            <p className="text-gray-600 text-sm">
                                {interviewer.contact.bio || "No biography or introduction available."}
                            </p>
                        </div>

                        {/* ========== Professional Details ========== */}
                        <div className="bg-custom-blue/5 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-custom-blue mb-3">
                                Professional Details
                            </h3>

                            {/* --- Basic Info --- */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-custom-blue/80 mb-2">
                                        Basic Information
                                    </h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-custom-blue/70">Name</span>
                                            <span className="text-sm font-medium text-custom-blue">
                                                {interviewer.contact.firstName}{" "}
                                                {interviewer.contact.lastName}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-custom-blue/70">Industry</span>
                                            <span className="text-sm font-medium text-custom-blue">
                                                {interviewer.contact.industry || "Not specified"}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-custom-blue/70">Experience</span>
                                            <span className="text-sm font-medium text-custom-blue">
                                                {interviewer.contact.yearsOfExperience || "0"} years
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-custom-blue/70">
                                                Current Role
                                            </span>
                                            <span className="text-sm font-medium text-custom-blue">
                                                {interviewer.contact.currentRole || "Not specified"}
                                            </span>
                                        </div>

                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* ========== Technologies & Skills ========== */}
                        <div className="bg-custom-blue/5 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-custom-blue mb-3">Technologies & Skills</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h4 className="text-sm font-medium text-custom-blue/80 mb-2">
                                        Technologies
                                    </h4>
                                    {interviewer.contact.technologies?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {interviewer.contact.technologies.map((tech, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-custom-blue/10 text-custom-blue text-xs font-medium rounded-full"
                                                >
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No technologies listed.</p>
                                    )}
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-custom-blue/80 mb-2">Skills</h4>
                                    {interviewer.contact.skills?.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {interviewer.contact.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-custom-blue/10 text-custom-blue text-xs font-medium rounded-full"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500">No skills listed.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ========== Location Details ========== */}
                        <div className="bg-custom-blue/5 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-custom-blue mb-3">Location</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-custom-blue/70">Location</span>
                                    <span className="text-sm font-medium text-custom-blue">
                                        {interviewer.contact.location || "Remote"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                );

            case 'availability':
                return (
                    <div key="availability">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Availability Schedule</h3>
                                <p className="text-sm text-gray-500">
                                    Timezone: {interviewer.contact.timeZone || 'Not specified'}
                                </p>
                            </div>
                        </div>
                        <AvailabilityCalendar availabilities={processAvailability()} />
                        <div className="mt-6 bg-custom-blue/5 p-4 rounded-lg mb-5">
                            <h4 className="text-sm font-medium text-custom-blue mb-2">Scheduling Notes</h4>
                            <div className="space-y-2 text-sm text-custom-blue/80">
                                <p>• Preferred interview duration: {interviewer.contact.preferredDuration || 60} minutes</p>
                                <p>• Typically responds within 2-4 business hours</p>
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[50]">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                <div className=" border-b border-gray-200 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <InterviewerAvatar interviewer={interviewer} size="lg" />
                            <h2 className="text-xl font-semibold text-gray-900 mx-2">{interviewer.contact.firstName + ' ' + interviewer.contact.lastName}</h2>
                            <p className="text-sm text-gray-500">{interviewer.professionalTitle}</p>
                            <Star className="h-4 w-4 text-custom-blue fill-custom-blue/20" />
                            <span className="mx-1 text-sm font-medium text-custom-blue">
                                {interviewer?.contact?.rating || 4.6} Rating
                            </span>
                            <span className="mx-2">•</span>
                            <span className="text-sm font-medium text-gray-700">
                                {interviewer.interviewerType} Interviewer
                            </span>
                        </div>
                        <div className="flex items-center">
                            <button onClick={onClose}>
                                <X className="text-gray-500 hover:text-red-500" />
                            </button>
                        </div>
                    </div>
                </div>


                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-4" role="tablist">
                        <TabButton
                            isActive={activeTab === 'about'}
                            onClick={() => setActiveTab('about')}
                            role="tab"
                            aria-selected={activeTab === 'about'}
                        >
                            <div className="flex items-center">
                                <User className="h-4 w-4 mr-2 text-custom-blue" />
                                <span className={activeTab === 'about' ? 'text-custom-blue' : ''}>About</span>
                            </div>
                        </TabButton>
                        {/* <TabButton
                            isActive={activeTab === 'expertise'}
                            onClick={() => setActiveTab('expertise')}
                            role="tab"
                            aria-selected={activeTab === 'expertise'}
                        >
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-custom-blue" />
                                <span className={activeTab === 'expertise' ? 'text-custom-blue' : ''}>Expertise</span>
                            </div>
                        </TabButton> */}
                        <TabButton
                            isActive={activeTab === 'availability'}
                            onClick={() => setActiveTab('availability')}
                            role="tab"
                            aria-selected={activeTab === 'availability'}
                        >
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2 text-custom-blue" />
                                <span className={activeTab === 'availability' ? 'text-custom-blue' : ''}>Availability</span>
                            </div>
                        </TabButton>
                    </nav>
                </div>

                <div className="px-4 py-2 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
                    {renderTabContent()}
                </div>

                {/* <div className="flex justify-end space-x-3 px-4 py-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="px-4 py-1 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div> */}
            </div>
        </div>
    );
}

export default InterviewerDetailsModal;
