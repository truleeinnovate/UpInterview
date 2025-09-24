// v1.0.0 - Ashok - changed url of maleImage (man.png) from local to cloud storage
import { useEffect, useState, useCallback, useMemo } from "react";
import InterviewStatusIndicator from "./InterviewStatusIndicator";
import FeedbackStatusChangeModal from "./FeedbackStatusChangeModal";
// v1.0.0 <------------------------------------------------------------------
// import maleImage from "../../Pages/Dashboard-Part/Images/man.png";
// v1.0.0 ------------------------------------------------------------------>
import Availability from "../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/Availability";
import { useInterviewAvailability } from "../../apiHooks/useInterviewAvailability";
// import axios from "axios";
// import { config } from "../../config";
import { Minimize, Expand, X, Clock, Globe, MapPin } from "lucide-react";
import { useOutsourceInterviewers } from "../../apiHooks/superAdmin/useOutsourceInterviewers";

const InterviewerDetails = ({ selectedInterviewersData, onClose }) => {
    const interviewer = selectedInterviewersData.contactId;
    console.log('interviewer', interviewer)
    const { outsourceInterviewers, isLoading } = useOutsourceInterviewers();

    const [timeZone] = useState(interviewer?.timeZone || "Not Provided");
    const [selectedDuration, setSelectedDuration] = useState(
        interviewer?.preferredDuration ? parseInt(interviewer.preferredDuration, 10) : null
    );
    const [activeTab, setActiveTab] = useState("Details");
    const [readyToTakeMockInterview, setReadyToTakeMockInterview] = useState(
        interviewer?.isMockInterviewSelected === true
    );

    // const [feedbackData, setFeedbackData] = useState([]);

    const [isExpanded, setIsExpanded] = useState(true);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    // fetching feedback
    const interviewerId = interviewer?._id;
    const feedbackData = useMemo(() => {
        if (!interviewerId || !outsourceInterviewers?.length) return [];

        return outsourceInterviewers
            .filter((item) => item.contactId?._id === interviewerId)
            .reverse();
    }, [interviewerId, outsourceInterviewers]);

    // No-Show policy UI removed; mapping helper not needed

    // const [expertiseLevel, setExpertiseLevel] = useState('mid-level');
    // No-Show policy state removed

    const [showStatusModal, setShowStatusModal] = useState(false);

    const closeFeedbackPopUp = () => {
        setNewStatus({ status: "", rating: 4.5, comments: "" });
        setShowStatusModal(false);
    };

    // eslint-disable-next-line no-unused-vars
    const [statusLine, setStatusLine] = useState({
        new: true,
        contacted: false,
        inprogress: false,
        selected: false,
        closed: false,
    });

    const [newStatus, setNewStatus] = useState({
        status: "",
        rating: 4.5,
        comments: "",
    });

    const [times, setTimes] = useState({});

    // Timezone and preferred duration summary like AvailabilityUser
    const [selectedTimezone, setSelectedTimezone] = useState("");
    const [selectedOption, setSelectedOption] = useState(null);

    // Fetch availability from dedicated endpoint like MyProfile
    const { availability: fetchedAvailability } = useInterviewAvailability(interviewer?._id);

    // Map fetched availability to times structure
    useEffect(() => {
        if (!fetchedAvailability || !Array.isArray(fetchedAvailability?.availability)) return;

        const transformedTimes = {
            Sun: [{ startTime: null, endTime: null }],
            Mon: [{ startTime: null, endTime: null }],
            Tue: [{ startTime: null, endTime: null }],
            Wed: [{ startTime: null, endTime: null }],
            Thu: [{ startTime: null, endTime: null }],
            Fri: [{ startTime: null, endTime: null }],
            Sat: [{ startTime: null, endTime: null }],
        };

        fetchedAvailability.availability.forEach((dayData) => {
            if (dayData?.day && Array.isArray(dayData?.timeSlots) && transformedTimes[dayData.day]) {
                transformedTimes[dayData.day] = dayData.timeSlots.map((slot) => ({
                    startTime: slot.startTime || null,
                    endTime: slot.endTime || null,
                }));
            }
        });

        setTimes(transformedTimes);
    }, [fetchedAvailability]);

    useEffect(() => {
        if (Array.isArray(interviewer?.availability) && interviewer?.availability.length > 0) {
            const initialTimes = {};
            interviewer?.availability?.forEach((availabilityItem) => {
                availabilityItem.days.forEach((dayItem) => {
                    if (!initialTimes[dayItem.day]) {
                        initialTimes[dayItem.day] = [];
                    }
                    dayItem.timeSlots.forEach((slot) => {
                        initialTimes[dayItem.day].push({
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                        });
                    });
                });
            });
            setTimes(initialTimes);
        }
    }, [interviewer?.availability]);

    const [hasInterviewExperience, setHasInterviewExperience] = useState(
        interviewer?.PreviousExperienceConductingInterviews === "yes"
    );

    useEffect(() => {
        if (!interviewer) return;
        setSelectedTimezone(
            typeof interviewer?.timeZone === "object" ? interviewer?.timeZone?.label : interviewer?.timeZone || ""
        );
        setSelectedOption(interviewer?.preferredDuration || null);
    }, [interviewer]);

    // Helper: Convert strings to Title Case for better display
    const toTitleCase = useCallback((str) => {
        if (!str || typeof str !== "string") return "";
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }, []);

    // Weekly grid helpers (same pattern as AvailabilityUser)
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
    const weekDates = getDatesForWeek(7);
    const timeSlots = Array.from({ length: 24 }, (_, i) => i);
    const formatTime = (hour) => `${hour % 12 || 12}:00 ${hour >= 12 ? "PM" : "AM"}`;
    const isAvailable = (date, hour) => {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
        const dayAvailability = times[dayOfWeek];
        if (!dayAvailability || !dayAvailability[0] || !dayAvailability[0].startTime) return false;
        return dayAvailability.some((slot) => {
            if (!slot || !slot.startTime || !slot.endTime) return false;
            if (slot.startTime === "unavailable" || slot.endTime === "unavailable") return false;
            try {
                const [startHour, startMin] = slot.startTime.split(":").map(Number);
                const [endHour, endMin] = slot.endTime.split(":").map(Number);
                const slotStart = startHour * 60 + (startMin || 0);
                const slotEnd = endHour * 60 + (endMin || 0);
                const currentHourStart = hour * 60;
                const currentHourEnd = (hour + 1) * 60;
                return slotStart < currentHourEnd && slotEnd > currentHourStart;
            } catch {
                return false;
            }
        });
    };


    const statusOptions = [
        "Contacted",
        "In Progress",
        "Active",
        "InActive",
        "Blacklisted",
    ];

    const handleChangeStatus = () => {
        if (feedbackData?.length > 0) {
            setNewStatus({
                status: feedbackData[0].status || "",
                rating: feedbackData[0].feedback[0].rating || 0,
                comments: feedbackData[0].feedback[0].comments || "",
            });
        }
        setShowStatusModal(true);
    };

    // No-Show policy options removed

    const formatDate = (dateString) => {
        const options = { year: "numeric", month: "short", day: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex justify-end">
                <div
                    className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm"
                    onClick={onClose}
                />
                <div
                    className={`relative bg-white shadow-xl overflow-hidden transition-all duration-300 max-w-full h-screen flex flex-col ${isExpanded ? "w-full xl:w-1/2 2xl:w-1/2" : "w-full"
                        }`}
                >
                    {/* Header */}
                    {/* <div className="sticky top-0 border border-gray-300 bg-white px-4 sm:px-6 py-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="ml-8 text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue"> */}
                    {/* v1.0.0 <-------------------------------------------------------------------------------------------------------------------- */}
                    <div className="sticky top-0 bg-white px-4 sm:px-6 py-4 z-10">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl sm:text-2xl md:text-2xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-bold text-custom-blue">
                                    {/* v1.0.0 -------------------------------------------------------------------------------------------------------------------- */}
                                    Outsource Interviewer
                                </h2>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={toggleExpand}
                                    className="p-2 hidden md:flex lg:flex xl:flex 2xl:flex hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    title={isExpanded ? "Compress" : "Expand"}
                                >
                                    {isExpanded ? (
                                        <Expand size={20} className="text-gray-500" />
                                    ) : (
                                        <Minimize size={20} className="text-gray-500" />
                                    )}
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-gray-500 hover:text-gray-600 rounded-full hover:bg-gray-100"
                                    title="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`flex-1 grid p-3 gap-4 h-full ${isExpanded
                            ? "grid-cols-1 overflow-y-auto h-full"
                            : "md:grid-cols-1 lg:grid-cols-[250px_1fr] xl:grid-cols-[250px_1fr] 2xl:grid-cols-[250px_1fr]"
                            }`}
                    >
                        {/* Left Content section */}
                        <div
                            className={`flex p-6 border border-gray-200 rounded-lg ${isExpanded
                                ? "flex-row items-start gap-6"
                                : "mb-[72px] lg:flex-col xl:flex-col 2xl:flex-col lg:items-center xl:items-center 2xl:items-center"
                                }`}
                        >
                            <img
                                // v1.0.0 <----------------------------------------------------------------------
                                // src={interviewer?.imageData?.path || maleImage}
                                src={
                                    interviewer?.imageData?.path ||
                                    "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                                }
                                // v1.0.0 ---------------------------------------------------------------------->
                                alt={interviewer?.firstName || "Interviewer"}
                                className={`rounded-full object-cover mb-4 transition-all duration-300
                                    ${isExpanded ? "w-24 h-24" : "w-32 h-32"}
                                `}
                            />

                            <div
                                className={`${isExpanded
                                    ? "text-left"
                                    : "lg:text-center xl:text-center 2xl:text-center"
                                    }`}
                            >
                                <h2 className="text-xl font-medium text-custom-blue mb-1 font-serif">
                                    {interviewer?.firstName || "N/A"}
                                </h2>
                                <p className="text-gray-700 font-medium mb-1">
                                    {interviewer?.company || "N/A"}
                                </p>
                                <p className="text-gray-700 font-medium">
                                    {interviewer?.currentRole || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Right Content Section - Changes based on active tab */}
                        <div
                            className={`flex flex-col pr-2 ${isExpanded ? "" : "overflow-y-auto h-full pb-[72px]"
                                }`}
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <span
                                    className="text-custom-blue font-bold cursor-pointer"
                                    onClick={onClose}
                                >
                                    Outsource Interviewers
                                </span>

                                <span className="text-lg text-gray-400">/</span>
                                <span className="text-lg text-gray-400">
                                    {interviewer?.firstName || "Not Provided"}
                                </span>
                            </div>

                            {/* Status Timeline */}
                            <div
                                className={`flex items-center w-[80%] lg:w-full xl:w-full 2xl:w-full max-w-4xl mx-auto mb-8 relative ${isExpanded ? "justify-start w-[60%]" : "justify-center w-full"
                                    }`}
                            >
                                <InterviewStatusIndicator
                                    currentStatus={feedbackData[0]?.status}
                                    isExpanded={isExpanded}
                                />
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex gap-8 border-none border-gray-200">
                                    {[
                                        "Details",
                                        "Experience details",
                                        "Availability",
                                        "Feedback",
                                    ].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`pb-1 text-sm font-medium ${activeTab === tab
                                                ? "border-b-2 border-custom-blue text-custom-blue"
                                                : "text-custom-blue"
                                                }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    className="bg-custom-blue text-white text-sm px-3 py-1 lg:px-6 xl:px-6 2xl:px-6 lg:py-2 xl:py-2 2xl:py-2 rounded-md hover:bg-custom-blue"
                                    onClick={handleChangeStatus}
                                >
                                    Change Status
                                </button>
                            </div>
                            <div>
                                {activeTab === "Details" && (
                                    <>
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-6">
                                                Basic Details:
                                            </h3>
                                            <div
                                                className={`grid gap-y-6 ${isExpanded
                                                    ? "grid-cols-1 "
                                                    : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
                                                    }`}
                                            >
                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Name
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {interviewer?.firstName || "Not Provided"}
                                                    </span>
                                                </div>

                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Profile ID
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {interviewer?.profileId || "Not Provided"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Email Address
                                                    </span>
                                                    {interviewer?.email ? (
                                                        <a
                                                            href={`mailto:${interviewer.email}`}
                                                            className="text-blue-600 hover:underline flex-1 break-words"
                                                        >
                                                            {interviewer.email}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 flex-1">
                                                            Not Provided
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Phone Number
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {interviewer?.phone || "Not Provided"}
                                                    </span>
                                                </div>
                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        LinkedIn URL
                                                    </span>
                                                    {interviewer?.linkedinUrl ? (
                                                        <a
                                                            href={interviewer.linkedinUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex-1 break-words"
                                                        >
                                                            {interviewer.linkedinUrl}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 flex-1">
                                                            Not Provided
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <hr className="border-gray-200 my-8" />
                                            <h3 className="text-lg font-semibold mb-6">
                                                Additional Details:
                                            </h3>
                                            <div
                                                className={`grid gap-y-6 gap-x-6 ${isExpanded
                                                    ? "grid-cols-1"
                                                    : "grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
                                                    }`}
                                            >
                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Current Role
                                                    </span>
                                                    <span className="text-gray-600 flex-1 break-words min-w-0">
                                                        {interviewer?.currentRole || "Not Provided"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Industry
                                                    </span>
                                                    <span className="text-gray-600 flex-1 break-words min-w-0">
                                                        {interviewer?.industry || "Not Provided"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0 whitespace-nowrap">
                                                        Experience
                                                    </span>
                                                    <span className="text-gray-600 flex-1 break-words min-w-0">
                                                        {interviewer?.yearsOfExperience || "Not Provided"}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Location
                                                    </span>
                                                    <span className="text-gray-600 flex-1 break-words min-w-0">
                                                        {interviewer?.location || "Not Provided"}
                                                    </span>
                                                </div>

                                                {/* <div className="flex flex-wrap gap-8 col-span-1 lg:col-span-2">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Introduction
                                                    </span>
                                                    <span className="text-gray-600 flex-1 break-words min-w-0">
                                                        {interviewer?.Introduction || "Not Provided"}
                                                    </span>
                                                </div> */}

                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Resume
                                                    </span>
                                                    {interviewer?.resume?.path ? (
                                                        <a
                                                            href={interviewer.resume.path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex-1 break-words min-w-0"
                                                        >
                                                            {interviewer.resume.filename}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 flex-1 break-words min-w-0">
                                                            Not Provided
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex flex-wrap gap-8">
                                                    <span className="text-gray-700 font-medium w-32 shrink-0">
                                                        Cover Letter
                                                    </span>
                                                    {interviewer?.resume?.path ? (
                                                        <a
                                                            href={interviewer.coverLetter.path}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex-1 break-words min-w-0"
                                                        >
                                                            {interviewer.coverLetter.filename}
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-600 flex-1 break-words min-w-0">
                                                            Not Provided
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <hr className="border-gray-200 my-8" />
                                            <h3 className="text-lg font-semibold mb-6">
                                                System Details:
                                            </h3>
                                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-6">
                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Created By
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {formatDate(interviewer?.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex gap-8">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Modified By
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {formatDate(interviewer?.updatedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {activeTab === "Experience details" && (
                                    <>
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <div className="space-y-8">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-6">
                                                        Skills and Experience Details:
                                                    </h3>
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Technology</span>
                                                            <div className="flex flex-wrap gap-2 text-sm text-gray-700">
                                                                {interviewer?.technologies?.length ? (
                                                                    interviewer.technologies.map((technology, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="inline-flex items-center rounded-full bg-blue-50 text-blue-900 px-3 py-1 border border-blue-100"
                                                                        >
                                                                            {technology}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-gray-600">Not Provided</span>
                                                                )}
                                                            </div>
                                                        </div>


                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Skills</span>
                                                            <span className="text-gray-600 break-words">
                                                                {interviewer?.skills?.length ? interviewer.skills.join(", ") : "Not Provided"}
                                                            </span>
                                                        </div>

                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Previous Interview Experience</span>
                                                            <div className="flex gap-10 items-center">
                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="experience"
                                                                        disabled
                                                                        checked={hasInterviewExperience}
                                                                        onChange={() => setHasInterviewExperience(true)}
                                                                        className="text-teal-600 focus:ring-teal-500"
                                                                    />
                                                                    <span className="text-gray-600">Yes</span>
                                                                </label>
                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="experience"
                                                                        disabled
                                                                        checked={!hasInterviewExperience}
                                                                        onChange={() => setHasInterviewExperience(false)}
                                                                        className="text-teal-600 focus:ring-teal-500"
                                                                    />
                                                                    <span className="text-gray-600">No</span>
                                                                </label>
                                                            </div>
                                                        </div>

                                                        {/* Conditionally render expertise level section */}
                                                        {/* {hasInterviewExperience && ( */}
                                                        {/* <div className="space-y-2">
                                                                <p className="text-gray-700 font-medium">
                                                                    Choose your level of expertise (comfort) in
                                                                    conducting interviews
                                                                </p>
                                                                <div className="flex gap-16">
                                                                    {[
                                                                        {
                                                                            label: "Junior (0-1 years)",
                                                                            value: "junior",
                                                                        },
                                                                        {
                                                                            label: "Mid-level (2-5 years)",
                                                                            value: "mid-level",
                                                                        },
                                                                        {
                                                                            label: "Senior (6-8 years)",
                                                                            value: "senior",
                                                                        },
                                                                        { label: "Lead (8+ years)", value: "lead" },
                                                                    ].map((option) => (
                                                                        <label
                                                                            key={option.value}
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <input
                                                                                type="radio"
                                                                                name="expertise"
                                                                                disabled
                                                                                value={option.value}
                                                                                checked={
                                                                                    expertiseLevel === option.value
                                                                                }
                                                                                onChange={(e) =>
                                                                                    setExpertiseLevel(e.target.value)
                                                                                }
                                                                                className="text-teal-600 focus:ring-teal-500"
                                                                            />
                                                                            <span className="text-gray-600 whitespace-nowrap">
                                                                                {option.label}
                                                                            </span>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div> */}
                                                        {/* )} */}
                                                    </div>
                                                </div>

                                                {/* Professional Details */}
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-6">Professional Details:</h3>
                                                    <div className="space-y-5">
                                                        {/* Professional Title */}
                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Professional Title</span>
                                                            <div className="text-gray-600 break-words leading-relaxed truncate">
                                                                {interviewer?.professionalTitle || "Not Provided"}
                                                            </div>
                                                        </div>

                                                        {/* Professional Bio */}
                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Professional Bio</span>
                                                            <div className="text-gray-600 whitespace-pre-line break-words leading-relaxed truncate">
                                                                {interviewer?.bio || "Not Provided"}
                                                            </div>
                                                        </div>

                                                        {/* Interview Formats */}
                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Interview Formats</span>
                                                            <div className="flex flex-wrap gap-2 items-center">
                                                                {interviewer?.InterviewFormatWeOffer?.length ? (
                                                                    interviewer?.InterviewFormatWeOffer?.map((fmt, idx) => (
                                                                        <span
                                                                            key={`${fmt}-${idx}`}
                                                                            className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-900 px-3 py-1 text-sm border border-emerald-100"
                                                                        >
                                                                            {toTitleCase(fmt)}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-gray-600">Not Provided</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="border-t border-gray-200" />

                                                {/* Rates */}
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-6">Rates:</h3>
                                                    <div className="space-y-4">
                                                        {[
                                                            { key: "junior", label: "Junior" },
                                                            { key: "mid", label: "Mid" },
                                                            { key: "senior", label: "Senior" },
                                                        ].map(({ key, label }) => {
                                                            const rate = interviewer?.rates?.[key];
                                                            if (!rate) return null;
                                                            if (rate?.isVisible === false) return null;
                                                            return (
                                                                <div key={key} className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                                    <span className="text-gray-700 font-medium whitespace-nowrap">{label}</span>
                                                                    <span className="text-gray-600 break-words">
                                                                        {rate?.usd ? `$${rate.usd} USD` : ""}
                                                                        {rate?.usd && rate?.inr ? " • " : ""}
                                                                        {rate?.inr ? `₹${rate.inr} INR` : ""}
                                                                        {!rate?.usd && !rate?.inr ? "Not Provided" : ""}
                                                                    </span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                <hr className="border-t border-gray-200" />

                                                <div>
                                                    <h3 className="text-lg font-semibold mb-6">Compensation Details:</h3>
                                                    <div className="space-y-6">
                                                        {/* <div className="flex gap-20">
                                                            <span className="text-gray-700 whitespace-nowrap font-medium w-32">
                                                                Expected Rate per Hour
                                                            </span>
                                                            <span className="text-gray-600">
                                                                {interviewer?.ExpectedRateMin} $ to{" "}
                                                                {interviewer?.ExpectedRateMax} $
                                                            </span>
                                                        </div> */}

                                                        {/* Mock Interview Question */}
                                                        <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                            <span className="text-gray-700 font-medium whitespace-nowrap">Ready for Mock Interviews</span>
                                                            <div className="flex gap-10 items-center">
                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="mockInterviews"
                                                                        disabled
                                                                        checked={readyToTakeMockInterview}
                                                                        onChange={() => setReadyToTakeMockInterview(true)}
                                                                        className="text-teal-600 focus:ring-teal-500"
                                                                    />
                                                                    <span className="text-gray-600">Yes</span>
                                                                </label>
                                                                <label className="flex items-center gap-2">
                                                                    <input
                                                                        type="radio"
                                                                        name="mockInterviews"
                                                                        disabled
                                                                        checked={!readyToTakeMockInterview}
                                                                        onChange={() => setReadyToTakeMockInterview(false)}
                                                                        className="text-teal-600 focus:ring-teal-500"
                                                                    />
                                                                    <span className="text-gray-600">No</span>
                                                                </label>
                                                            </div>
                                                        </div>
                                                        {/* Mock Interview Discount */}
                                                        {readyToTakeMockInterview && (
                                                            <div className="grid grid-cols-[200px_1fr] items-start gap-6">
                                                                <span className="text-gray-700 font-medium whitespace-nowrap">Mock Interview Discount</span>
                                                                <span className="text-gray-600">
                                                                    {interviewer?.mock_interview_discount ? `${interviewer.mock_interview_discount}%` : "Not Provided"}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <hr className="border-t border-gray-200" />

                                                {/* No-Show Policy Details - Removed as per request */}
                                                {null}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {activeTab === "Availability" && (
                                    <>
                                        <div className="border border-gray-200 rounded-lg p-6">
                                            <h3 className="text-lg font-semibold mb-6">
                                                Availability:
                                            </h3>
                                            <div className="grid gap-y-6">
                                                {/* Time Zone */}
                                                {/* <div className="flex gap-4">
                                                    <span className="text-gray-700 font-medium w-32">
                                                        Time Zone
                                                    </span>
                                                    <span className="text-gray-600 flex-1">
                                                        {timeZone}
                                                    </span>
                                                </div> */}

                                                {/* Preferred Interview Duration */}
                                                {/* <div className="flex flex-col gap-4">
                                                    <span className="text-gray-700 font-medium">
                                                        Preferred Interview Duration
                                                    </span>
                                                    <div className="flex gap-4">
                                                        {[30, 45, 60, 90].map((duration) => (
                                                            <button
                                                                key={duration}
                                                                disabled
                                                                onClick={() => setSelectedDuration(duration)}
                                                                className={`px-4 py-2 rounded border ${selectedDuration === duration
                                                                    ? "bg-teal-600 text-white border-teal-600"
                                                                    : "border-gray-300 text-gray-600"
                                                                    }`}
                                                            >
                                                                {duration} mins
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div> */}
                                                {/* Availability weekly grid and summary (mirrors AvailabilityUser) */}
                                                <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                                                    <div className="flex flex-col justify-between items-center sm:mb-0 mb-6">
                                                        <div className="overflow-x-auto w-full">
                                                            <div className="w-full">
                                                                <div className="grid grid-cols-8 gap-1">
                                                                    <div className="h-12 flex items-center justify-center font-medium text-sm text-gray-500">
                                                                        Time
                                                                    </div>
                                                                    {weekDates.map((date, index) => (
                                                                        <div key={index} className="h-12 flex flex-col items-center justify-center text-center">
                                                                            <div className="text-sm font-medium text-gray-900">
                                                                                {new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                    {timeSlots.map((hour) => {
                                                                        const isHourAvailable = weekDates.some((date) => isAvailable(date, hour));
                                                                        if (!isHourAvailable) return null;
                                                                        return (
                                                                            <>
                                                                                <div className="h-12 flex items-center justify-end mr-1 text-sm text-gray-500">
                                                                                    {formatTime(hour)}
                                                                                </div>
                                                                                {weekDates.map((date, dateIndex) => {
                                                                                    const available = isAvailable(date, hour);
                                                                                    return (
                                                                                        <div
                                                                                            key={`${hour}-${dateIndex}`}
                                                                                            className={`h-12 border border-gray-100 rounded-md ${available ? "bg-green-50 hover:bg-green-100 cursor-pointer" : "bg-gray-50"}`}
                                                                                        >
                                                                                            {available && (
                                                                                                <div className="h-full flex items-center justify-center">
                                                                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </>
                                                                        );
                                                                    })}
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

                                                    <div className="flex flex-col gap-6 mb-6">
                                                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="p-3 bg-blue-100 rounded-xl">
                                                                    <Globe className="w-6 h-6 text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800">Timezone</h3>
                                                                    <p className="text-gray-500 text-[12px]">Interviewer local timezone</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4">
                                                                <div className="flex items-center space-x-2">
                                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                                    <p className="font-semibold text-gray-800">{selectedTimezone || "Not set"}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                                                            <div className="flex items-center space-x-3 mb-4">
                                                                <div className="p-3 bg-purple-100 rounded-xl">
                                                                    <Clock className="w-6 h-6 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-bold text-gray-800">Preferred Duration</h3>
                                                                    <p className="text-[12px] text-gray-500">Interview length</p>
                                                                </div>
                                                            </div>
                                                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center space-x-2">
                                                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                                                            <span className="text-white font-bold text-sm">{selectedOption || "?"}</span>
                                                                        </div>
                                                                        <span className="font-semibold text-gray-800 text-[12px]">{selectedOption || "Not set"} {selectedOption && "minutes"}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {activeTab === "Feedback" && (
                                    <>
                                        <div className="bg-white border min-h-screen border-gray-200 p-6 rounded-lg">
                                            <h2 className="text-lg font-medium mb-4">Feedback:</h2>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Status
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {feedbackData[0]?.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Rating
                                                    </span>
                                                    <span className="text-gray-600">
                                                        {feedbackData[0]?.feedback[0]?.rating}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-[min-content,1fr] gap-x-20">
                                                    <span className="text-gray-700 font-medium">
                                                        Notes
                                                    </span>
                                                    <span className="text-gray-600 break-words">
                                                        {feedbackData[0]?.feedback[0]?.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    {showStatusModal && (
                        <FeedbackStatusChangeModal
                            showStatusModal={showStatusModal}
                            statusOptions={statusOptions}
                            newStatus={newStatus}
                            setNewStatus={setNewStatus}
                            onClose={closeFeedbackPopUp}
                            interviewer={interviewer}
                        />
                    )}
                </div>
            </div>
        </>
    );
};

export default InterviewerDetails;
