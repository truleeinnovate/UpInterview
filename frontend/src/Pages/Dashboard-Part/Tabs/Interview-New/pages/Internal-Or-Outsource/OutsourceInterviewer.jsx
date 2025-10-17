// v1.0.0  -  Ashraf  -  header border-b removed
// v1.0.1  -  Venkatesh  -  interviewer if  wallet balance is less than hourlyrate then show wallet modal
// v1.0.2  -  Ashok   -  Improved responsiveness and added common code to popups
// v1.0.3  -  Ashok   -  Fixed issues in responsiveness
// v1.0.4  -  Venkatesh  -  Updated to handle rates object (junior/mid/senior) and show current balance in header

import React, { useState, useRef, useEffect, useMemo } from "react"; //<----v1.0.1-----
import {
    X,
    Star,
    ExternalLink,
    ChevronDown,
    ChevronUp,
    Search,
    Minimize,
    Info,
    Clock,
    Users,
    Expand,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../../CommonCode-AllTabs/ui/button.jsx";
import InterviewerAvatar from "../../../CommonCode-AllTabs/InterviewerAvatar.jsx";
import InterviewerDetailsModal from "../Internal-Or-Outsource/OutsourceInterviewerDetail.jsx";
import { useCustomContext } from "../../../../../../Context/Contextfetch.js";
import Wallet from "../../../../Accountsettings/account/wallet/Wallet.jsx";
import { useWallet } from "../../../../../../apiHooks/useWallet"; //<----v1.0.1-----
import toast, { Toaster } from "react-hot-toast"; //<----v1.0.1-----
import { WalletTopupPopup } from "../../../../Accountsettings/account/wallet/WalletTopupPopup.jsx";
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import Cookies from 'js-cookie';
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";

const OutsourcedInterviewerCard = ({
    interviewer,
    isSelected,
    onSelect,
    onViewDetails,
    navigatedfrom,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const fullName =
        interviewer?.contact?.firstName || interviewer?.contact?.Name || "Unnamed";
    const professionalTitle =
        interviewer?.contact?.professionalTitle ||
        interviewer?.contact?.CurrentRole ||
        "Interviewer";
    const company = interviewer?.contact?.industry || "Freelancer";

    //<-----v1.0.4-----Venkatesh---- Display rate range from rates object (junior/mid/senior)
    const getRateDisplay = () => {
        const rates = interviewer?.contact?.rates;
        if (!rates) return interviewer?.contact?.hourlyRate || "not provided";

        const visibleRates = [];
        if (rates.junior?.isVisible && rates.junior?.inr > 0) {
            visibleRates.push(rates.junior.inr);
        }
        if (rates.mid?.isVisible && rates.mid?.inr > 0) {
            visibleRates.push(rates.mid.inr);
        }
        if (rates.senior?.isVisible && rates.senior?.inr > 0) {
            visibleRates.push(rates.senior.inr);
        }

        if (visibleRates.length === 0) {
            // If no visible rates, show all non-zero rates
            ['junior', 'mid', 'senior'].forEach(level => {
                if (rates[level]?.inr > 0) {
                    visibleRates.push(rates[level].inr);
                }
            });
        }

        if (visibleRates.length === 0) return "not provided";
        if (visibleRates.length === 1) return `₹${visibleRates[0]}/hr`;

        const minRate = Math.min(...visibleRates);
        const maxRate = Math.max(...visibleRates);
        return `₹${minRate}-${maxRate}/hr`;
    };

    const hourlyRate = getRateDisplay();
    //-----v1.0.4-----Venkatesh---->
    const rating = interviewer?.contact?.rating || "4.5";
    const introduction =
        interviewer?.contact?.introduction || "No introduction provided.";
    const skillsArray = interviewer?.contact?.skills ?? [];
    const avgResponseTime =
        interviewer?.contact?.avgResponseTime || "not provided";

    return (
        <div
            className={`bg-white rounded-lg border ${isSelected
                ? "border-orange-500 ring-2 ring-orange-200"
                : "border-gray-200"
                } p-4 shadow-sm hover:shadow-md transition-all`}
        >
            {/* v1.0.3 <----------------------------------------------------------------------- */}
            <div className="w-full">
                <div className="flex items-center gap-3 w-full">
                    <div>
                        <InterviewerAvatar interviewer={interviewer} size="lg" />
                    </div>
                    <div className="flex sm:flex-col items-start sm:justify-start justify-between w-full">
                        <div className="sm:ml-0 ml-3">
                            <h3 className="text-base font-medium text-gray-900">
                                {fullName}
                            </h3>
                            <p
                                className="text-sm text-gray-500 truncate max-w-[200px]"
                                title={professionalTitle}
                            >
                                {professionalTitle.length > 15
                                    ? `${professionalTitle.substring(0, 15)}...`
                                    : professionalTitle}
                            </p>
                            <p className="text-xs text-orange-600">{company}</p>
                        </div>
                        <div className="flex items-center space-x-2 gap-2">
                            <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="ml-1 text-sm font-medium text-gray-700">
                                    {rating}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {hourlyRate}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {/* v1.0.3 -----------------------------------------------------------------------> */}

            <div className="mt-3">
                <div
                    className={`text-sm text-gray-600 ${!isExpanded && "line-clamp-2"}`}
                >
                    {introduction}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-custom-blue hover:text-custom-blue/80 mt-1 flex items-center"
                >
                    {isExpanded ? (
                        <>
                            Show less <ChevronUp className="h-3 w-3 ml-1" />
                        </>
                    ) : (
                        <>
                            Show more <ChevronDown className="h-3 w-3 ml-1" />
                        </>
                    )}
                </button>
            </div>

            <div className="mt-3">
                <div className="flex flex-wrap gap-1">
                    {skillsArray.slice(0, 3).map((skill, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                            {typeof skill === "string" ? skill : skill?.skill || "Skill"}
                        </span>
                    ))}
                    {skillsArray.length > 3 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            +{skillsArray.length - 3} more
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" /> Avg. response:{" "}
                    {avgResponseTime}
                </div>
                {navigatedfrom !== "dashboard" && (
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onViewDetails}
                            className="text-custom-blue hover:text-custom-blue/80"
                        >
                            <ExternalLink className="h-3 w-3 mr-1" /> View Details
                        </Button>
                        <Button
                            variant={isSelected ? "destructive" : "customblue"}
                            size="sm"
                            onClick={onSelect}
                        >
                            {isSelected ? "Remove" : "Select"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

function OutsourcedInterviewerModal({
    onClose,
    dateTime,
    positionData,
    candidateData,
    onProceed,
    skills,
    technology,
    navigatedfrom,
    candidateExperience, //<-----v1.0.4-----Venkatesh---- Added to determine experience level for rate calculation
    isMockInterview = false, //<-----v1.0.4-----Venkatesh---- Added to determine interview type (mock vs regular)
     previouslySelectedInterviewers = [],
    isEditing = false
}) {
    const { interviewers, contacts } = useCustomContext(); //<----v1.0.1-----
    // console.log("contacts===", contacts);
    const { data: walletBalance, refetch } = useWallet(); //<----v1.0.1-----

    const authToken = Cookies.get('authToken');
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload?.userId;

    // console.log("navigatedfrom", {
    //     onClose,
    //     dateTime,
    //     positionData,
    //     candidateData,
    //     onProceed,
    //     skills,
    //     technology,
    //     navigatedfrom,
    // })

    const [searchTerm, setSearchTerm] = useState("");
    const [rateRange, setRateRange] = useState([0, ]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedInterviewer, setSelectedInterviewer] = useState(null);
    const [selectedInterviewersLocal, setSelectedInterviewersLocal] = useState(
       previouslySelectedInterviewers || []
    );
    const requestSentRef = useRef(false);
    const [filteredInterviewers, setFilteredInterviewers] = useState([]);
    const [baseInterviewers, setBaseInterviewers] = useState([]);
    const [showWalletModal, setShowWalletModal] = useState(false); //<----v1.0.1-----

       // Update local state when previouslySelectedInterviewers changes
    useEffect(() => {
        if (previouslySelectedInterviewers && previouslySelectedInterviewers.length > 0) {
            setSelectedInterviewersLocal(previouslySelectedInterviewers);
        }
    }, [previouslySelectedInterviewers]);

    //<----v1.0.1-----
    //<-----v1.0.4-----Venkatesh---- Updated to compute the highest rate from all contacts and all levels (junior/mid/senior)
    const maxHourlyRate = useMemo(() => {
        if (!Array.isArray(contacts) || contacts.length === 0) return 0;

        const allRates = [];
        contacts.forEach(contact => {
            if (contact?.rates) {
                // Extract all INR rates from junior, mid, senior levels
                ['junior', 'mid', 'senior'].forEach(level => {
                    const rate = contact.rates[level]?.inr;
                    if (typeof rate === 'number' && rate > 0) {
                        allRates.push(rate);
                    }
                });
            }
        });

        return allRates.length > 0 ? Math.max(...allRates) : 0;
    }, [contacts]);
    //----v1.0.1----->

    // Fetch and filter interviewers based on skills and availability added by Ranjith
    useEffect(() => {
        console.log("🔄 useEffect triggered - Starting interviewer filtering");
        console.log("📋 Parameters:", {
            navigatedfrom,
            hasPositionData: !!positionData,
            requestSent: requestSentRef.current,
            skillsProvided: !!skills,
            skillsCount: skills?.length || 0,
            dateTimeProvided: !!dateTime
        });

        if (
            navigatedfrom !== "dashboard" &&
            navigatedfrom !== "mock-interview" &&
            (!positionData || requestSentRef.current)
        ) {
            console.log("⏩ Skipping - conditions not met for regular flow");
            return;
        }

        const fetchInterviewers = async (
            positionSkills,
            positionMinExperience,
            positionMaxExperience,
            candidateTechnology
        ) => {
            console.log("🎯 fetchInterviewers called with:", {
                positionSkills,
                positionMinExperience,
                positionMaxExperience,
                candidateTechnology
            });

            try {
                console.log("📥 Fetching interviewers from context...");
                const response = interviewers;
                console.log("📊 Interviewers from context:", response);

                if (!response || !response.data) {
                    console.log("❌ No interviewers data found");
                    setBaseInterviewers([]);
                    setFilteredInterviewers([]);
                    return;
                }

                const externalInterviewers = response.data.filter(
                    (interviewer) => interviewer.type === "external"
                );
                console.log("🌐 External Interviewers count:", externalInterviewers.length);

                // Filter out interviewers where ownerId matches current user ID
                const filteredByOwnerId = externalInterviewers.filter(interviewer => {
                    const interviewerOwnerId = interviewer.contact?.ownerId || interviewer.ownerId;
                    return interviewerOwnerId !== userId;
                });
                console.log(`🔍 Filtered out ${externalInterviewers.length - filteredByOwnerId.length} interviewers with matching ownerId`);



                // ========== MOCK INTERVIEW FLOW - FILTER BY TIME + SKILLS ==========
                if (navigatedfrom === "mock-interview") {
                    console.log(`📍 Navigated from MOCK-INTERVIEW – filtering by time availability, technology, and skills`);

                    if (!dateTime) {
                        console.log("❌ No dateTime provided for mock-interview, cannot filter by availability");
                        setBaseInterviewers([]);
                        setFilteredInterviewers([]);
                        return;
                    }

                    // 🔹 Utility: Convert time string ("hh:mm AM/PM") → minutes
                    const timeToMinutes = (timeStr) => {
                        const [time, period] = timeStr.split(" ");
                        const [hours, minutes] = time.split(":").map(Number);
                        let totalMinutes = (hours % 12) * 60 + minutes;
                        if (period === "PM") totalMinutes += 720;
                        return totalMinutes;
                    };

                    console.log("📅 Processing dateTime for mock-interview:", dateTime);

                    const [datePart, ...timeParts] = dateTime.split(" ");
                    const timeRange = timeParts.join(" ");
                    const [startTimeStr, endTimeStr] = timeRange.split("-").map((t) => t.trim());

                    const startTimeMinutes = timeToMinutes(startTimeStr);
                    const endTimeMinutes = timeToMinutes(endTimeStr);

                    const [day, month, year] = datePart.split("-");
                    const interviewDate = new Date(`${year}-${month}-${day}`);
                    const interviewDayFull = interviewDate.toLocaleDateString("en-US", { weekday: "long" });
                    const interviewDayShort = interviewDayFull.substring(0, 3);

                    // ✅ Step 1: Filter by time availability
                    const availableInterviewers = filteredByOwnerId.filter((externalInterviewer) => {
                        const isAvailable = externalInterviewer.days?.some((day) => {
                            const dayMatches = day.day === interviewDayFull || day.day === interviewDayShort;
                            if (!dayMatches) return false;

                            return day.timeSlots?.some((timeSlot) => {
                                const availabilityStartMinutes = timeToMinutes(timeSlot.startTime);
                                const availabilityEndMinutes = timeToMinutes(timeSlot.endTime);
                                return (
                                    startTimeMinutes >= availabilityStartMinutes &&
                                    endTimeMinutes <= availabilityEndMinutes
                                );
                            });
                        });
                        return isAvailable;
                    });

                    console.log("✅ Available Interviewers:", availableInterviewers.length);

                    // ✅ Step 2: Split into tech-matched and non-tech-matched interviewers
                    let techMatchedInterviewers = [];
                    let nonTechMatchedInterviewers = [];

                    if (technology && Array.isArray(technology) && technology.length > 0) {
                        console.log("🧩 Filtering interviewers by technology:", technology);
                        const techLower = technology.map((t) => t.toLowerCase());

                        techMatchedInterviewers = availableInterviewers.filter((interviewer) => {
                            const interviewerTech = interviewer.contact?.technology || [];
                            const interviewerTechLower = interviewerTech.map((t) => t.toLowerCase());
                            const hasTechMatch = techLower.some((t) => interviewerTechLower.includes(t));

                            console.log(
                                `💻 ${interviewer.contact?.firstName || "Unknown"} - Tech Match: ${hasTechMatch}`
                            );
                            return hasTechMatch;
                        });

                        nonTechMatchedInterviewers = availableInterviewers.filter((interviewer) => {
                            const interviewerTech = interviewer.contact?.technology || [];
                            const interviewerTechLower = interviewerTech.map((t) => t.toLowerCase());
                            const hasTechMatch = techLower.some((t) => interviewerTechLower.includes(t));
                            return !hasTechMatch;
                        });
                    } else {
                        console.log("ℹ️ No technology provided, skipping tech split");
                        nonTechMatchedInterviewers = availableInterviewers;
                    }

                    // ✅ Step 3: Skill matching function
                    const calculateSkillMatches = (interviewersList, label) => {
                        console.log(`\n🎯 Checking skill matches for group: ${label}`);
                        return interviewersList.map((interviewer, index) => {
                            console.log(
                                `🧑 #${index + 1}: ${interviewer.contact?.firstName || "Unknown"}`
                            );

                            const interviewerSkills = interviewer.contact?.skills || [];
                            const interviewerSkillsLower = interviewerSkills
                                .map((s) => (typeof s === "string" ? s.toLowerCase() : s?.skill?.toLowerCase()))
                                .filter(Boolean);

                            const matchingSkills =
                                skills?.filter((requiredSkill) => {
                                    const required = requiredSkill.skill?.toLowerCase();
                                    return required && interviewerSkillsLower.includes(required);
                                }) || [];

                            const matchCount = matchingSkills.length;
                            console.log(`✅ Matched Skills (${matchCount}):`, matchingSkills);

                            return { ...interviewer, matchedSkills: matchCount };
                        });
                    };

                    // ✅ Step 4: Apply skill matching for both tech and non-tech groups
                    const techMatchedWithSkills = calculateSkillMatches(techMatchedInterviewers, "Tech-Matched");
                    const nonTechMatchedWithSkills = calculateSkillMatches(nonTechMatchedInterviewers, "Non-Tech-Matched");

                    // ✅ Step 5: Filter out those with zero skill matches
                    const techSkillFiltered = techMatchedWithSkills.filter((i) => i.matchedSkills > 0);
                    const nonTechSkillFiltered = nonTechMatchedWithSkills.filter((i) => i.matchedSkills > 0);

                    // ✅ Step 6: Sort both by skill count descending
                    const sortedTechSkillMatched = techSkillFiltered.sort((a, b) => b.matchedSkills - a.matchedSkills);
                    const sortedSkillOnlyMatched = nonTechSkillFiltered.sort((a, b) => b.matchedSkills - a.matchedSkills);

                    // ✅ Step 7: Merge both lists (tech+skill first, skill-only next)
                    const combinedInterviewers = [...sortedTechSkillMatched, ...sortedSkillOnlyMatched];

                    console.log("✅ Combined Sorted (Tech+Skill first):",
                        combinedInterviewers.map((i) => ({
                            name: i.contact?.firstName || "Unknown",
                            matchedSkills: i.matchedSkills,
                            technology: i.contact?.technology,
                        }))
                    );

                    // ✅ Step 8: Filter approved + offering mock
                    const finalInterviewers = combinedInterviewers.filter((interviewer) => {
                        const isApproved = interviewer.contact?.status === "approved";
                        const offersMock = interviewer.contact?.InterviewFormatWeOffer?.includes("mock");
                        return isApproved && offersMock;
                    });

                    // // ✅ Step 9: Remove logged-in user
                    // const cleanedInterviewers = finalInterviewers.filter(
                    //     (i) => i.contact?._id?.toString() !== userId?.toString()
                    // );

                    console.log("✅ Final mock-interview filtered interviewers:", finalInterviewers);

                    // ✅ Step 10: Update state
                    setBaseInterviewers(finalInterviewers);
                    setFilteredInterviewers(finalInterviewers);
                    return;
                }

                // ========== DASHBOARD FLOW - FILTER BY SKILLS ONLY ==========
                if (navigatedfrom === "dashboard") {
                    console.log(`📍 Navigated from DASHBOARD – using skill-based filtering only`);

                    let skillFilteredInterviewers = filteredByOwnerId;

                    // Apply skill filtering only if skills are provided
                    if (skills && Array.isArray(skills) && skills.length > 0) {
                        console.log("🔧 Applying skill filtering with skills:", skills);

                        skillFilteredInterviewers = filteredByOwnerId.filter(
                            (interviewer) => {
                                const interviewerSkills = interviewer.contact?.skills || [];
                                console.log(`👤 Checking interviewer: ${interviewer.contact?.firstName || interviewer.contact?.UserName || 'Unknown'}`);
                                console.log("📝 Interviewer's Skills:", interviewerSkills);

                                if (interviewerSkills.length === 0) {
                                    console.log("❌ Interviewer has no skills, excluding");
                                    return false;
                                }

                                // Convert all skills to lowercase for case-insensitive comparison
                                const interviewerSkillsLower = interviewerSkills.map((skill) =>
                                    typeof skill === 'string' ? skill.toLowerCase() : (skill?.skill || '').toLowerCase()
                                ).filter(skill => skill); // Remove empty strings

                                console.log("🔠 Interviewer's normalized skills:", interviewerSkillsLower);

                                // Check if any of the required skills match the interviewer's skills
                                const hasMatchingSkill = skills.some((requiredSkill) => {
                                    // Get the skill name and convert to lowercase
                                    const requiredSkillName = requiredSkill.skill?.toLowerCase();
                                    if (!requiredSkillName) {
                                        console.log("⚠️ Required skill has no name:", requiredSkill);
                                        return false;
                                    }

                                    const matchFound = interviewerSkillsLower.includes(requiredSkillName);
                                    if (matchFound) {
                                        console.log(`✅ Found matching skill: ${requiredSkillName}`);
                                    }
                                    return matchFound;
                                });

                                console.log(`🎯 ${interviewer.contact?.firstName || 'Unknown'} Skill Match Status: ${hasMatchingSkill}`);
                                return hasMatchingSkill;
                            }
                        );
                    } else {
                        console.log("ℹ️ No skills provided, showing all external interviewers");
                    }

                    // Filter for approved interviewers
                    const approvedInterviewers = skillFilteredInterviewers.filter(
                        interviewer => interviewer.contact?.status === 'approved'
                    );

                    console.log("✅ Approved interviewers count:", approvedInterviewers.length);
                    console.log("✅ Approved interviewers:", approvedInterviewers);

                    setBaseInterviewers(approvedInterviewers);
                    setFilteredInterviewers(approvedInterviewers);
                    return;
                }

                // {{ ========== REGULAR FLOW (with positionData) ========== }}
                console.log("🕒 Regular flow - checking availability and skills");

                const timeToMinutes = (timeStr) => {
                    const [time, period] = timeStr.split(" ");
                    const [hours, minutes] = time.split(":").map(Number);
                    let totalMinutes = (hours % 12) * 60 + minutes;
                    if (period === "PM") totalMinutes += 720;
                    return totalMinutes;
                };

                console.log("📅 Processing dateTime:", dateTime);

                const [datePart, ...timeParts] = dateTime.split(" ");
                const timeRange = timeParts.join(" ");
                console.log("📅 Date Part:", datePart);
                console.log("🕒 Time Range:", timeRange);

                const [startTimeStr, endTimeStr] = timeRange.split("-").map((t) => t.trim());
                console.log("⏰ Start Time String:", startTimeStr);
                console.log("⏰ End Time String:", endTimeStr);

                const startTimeMinutes = timeToMinutes(startTimeStr);
                const endTimeMinutes = timeToMinutes(endTimeStr);
                console.log("⏱️ Interviewer Start Time in Minutes:", startTimeMinutes);
                console.log("⏱️ Interviewer End Time in Minutes:", endTimeMinutes);

                const [day, month, year] = datePart.split("-");
                const interviewDate = new Date(`${year}-${month}-${day}`);
                const interviewDayFull = interviewDate.toLocaleDateString("en-US", {
                    weekday: "long",
                });
                const interviewDayShort = interviewDayFull.substring(0, 3);
                console.log("📅 Interviewer Day (Full):", interviewDayFull);
                console.log("📅 Interviewer Day (Short):", interviewDayShort);

                // 1️⃣ Filter by availability first
                const availableInterviewers = filteredByOwnerId.filter((externalInterviewer) => {
                    console.log(
                        "👤 Checking availability for interviewer:",
                        externalInterviewer.contact?.firstName +
                        " " +
                        externalInterviewer.contact?.lastName ||
                        "Unknown"
                    );

                    console.log("📅 Interviewer days:", externalInterviewer.days);
                    return externalInterviewer.days?.some((day) => {
                        const dayMatches =
                            day.day === interviewDayFull || day.day === interviewDayShort;
                        if (!dayMatches) return false;

                        return day.timeSlots?.some((timeSlot) => {
                            const availabilityStartMinutes = timeToMinutes(timeSlot.startTime);
                            const availabilityEndMinutes = timeToMinutes(timeSlot.endTime);

                            return (
                                startTimeMinutes >= availabilityStartMinutes &&
                                endTimeMinutes <= availabilityEndMinutes
                            );
                        });
                    });
                });

                console.log(
                    "✅ Available External Interviewers after time check:",
                    availableInterviewers
                );

                // 2️⃣ Filter by Technology (before skill matching)
                console.log("🎯 Candidate Technology:", candidateTechnology);

                // Split into two groups: tech-matched and non-tech-matched
                const techMatchedInterviewers = availableInterviewers.filter((interviewer) => {
                    const interviewerTech = interviewer.contact?.technology?.toLowerCase()?.trim();
                    const candidateTech = candidateTechnology?.toLowerCase()?.trim();
                    const isMatch = interviewerTech === candidateTech;
                    console.log(
                        `💻 Interviewer: ${interviewer.contact?.firstName || "Unknown"} | Interviewer Tech: ${interviewerTech} | Candidate Tech: ${candidateTech} | Match: ${isMatch}`
                    );
                    return isMatch;
                });

                const nonTechMatchedInterviewers = availableInterviewers.filter((interviewer) => {
                    const interviewerTech = interviewer.contact?.technology?.toLowerCase()?.trim();
                    const candidateTech = candidateTechnology?.toLowerCase()?.trim();
                    return interviewerTech !== candidateTech;
                });

                console.log("✅ Technology Matched Interviewers:", techMatchedInterviewers);
                console.log("⚪ Non-Technology Interviewers:", nonTechMatchedInterviewers);

                // 🔍 Reusable function to calculate skill matches
                const calculateSkillMatches = (interviewersList, label) => {
                    console.log(`\n🔍 Checking Skill Matches for Group: ${label}`);
                    return interviewersList.map((interviewer, index) => {
                        console.log(
                            `\n🧑 Interviewer #${index + 1}:`,
                            interviewer.contact?.firstName || interviewer.contact?.UserName || "Unknown"
                        );
                        console.log("👉 Interviewer's Skills:", interviewer.contact?.skills || []);

                        if (!positionSkills || !Array.isArray(positionSkills)) {
                            console.log("⚠️ positionSkills is invalid or not an array:", positionSkills);
                            return { ...interviewer, matchedSkills: 0 };
                        }

                        const interviewerSkills = interviewer.contact?.skills || [];
                        const matchingSkills = interviewerSkills.filter((interviewerSkill) =>
                            positionSkills.some(
                                (positionSkill) =>
                                    positionSkill.skill?.toLowerCase() === interviewerSkill?.toLowerCase()
                            )
                        );

                        console.log("✅ Matching Skills Found:", matchingSkills);
                        const matchCount = matchingSkills.length;

                        return { ...interviewer, matchedSkills: matchCount };
                    });
                };

                // 3️⃣ Apply skill matching for both groups
                const techMatchedWithSkills = calculateSkillMatches(techMatchedInterviewers, "Tech-Matched");
                const nonTechMatchedWithSkills = calculateSkillMatches(nonTechMatchedInterviewers, "Non-Tech-Matched");

                // 4️⃣ Keep only those with ≥1 skill match
                const techSkillFiltered = techMatchedWithSkills.filter((i) => i.matchedSkills > 0);
                const nonTechSkillFiltered = nonTechMatchedWithSkills.filter((i) => i.matchedSkills > 0);

                console.log("✅ Tech+Skill Matched Interviewers:", techSkillFiltered);
                console.log("✅ Skill-Only Matched Interviewers:", nonTechSkillFiltered);

                // 5️⃣ Sort both lists by matched skill count (descending)
                const sortedTechSkillMatched = techSkillFiltered.sort(
                    (a, b) => b.matchedSkills - a.matchedSkills
                );
                const sortedSkillOnlyMatched = nonTechSkillFiltered.sort(
                    (a, b) => b.matchedSkills - a.matchedSkills
                );

                // 6️⃣ Merge both (tech+skill first, then skill-only)
                const combinedInterviewers = [...sortedTechSkillMatched, ...sortedSkillOnlyMatched];

                console.log("✅ Combined Sorted Interviewers (Tech+Skill on top):",
                    combinedInterviewers.map((i) => ({
                        name: i.contact?.firstName || "Unknown",
                        matchedSkills: i.matchedSkills,
                        technology: i.contact?.technology,
                    }))
                );

                // 7️⃣ Filter only approved
                const approvedInterviewers = combinedInterviewers.filter(
                    (i) => i.contact?.status === "approved"
                );

                // // 8️⃣ Remove logged-in user
                // const finalInterviewers = approvedInterviewers.filter(
                //     (i) => i.contact?._id?.toString() !== userId?.toString()
                // );

                console.log("✅ Final Filtered Interviewers:", approvedInterviewers);

                // 9️⃣ Update state
                setBaseInterviewers(approvedInterviewers);
                setFilteredInterviewers(approvedInterviewers);


                // ========== REGULAR FLOW (with positionData) ========== }}
            } catch (error) {
                console.error("❌ Error processing interviewers:", error);
            }
        };

        console.log('🎬 Starting fetchInterviewers with positionData:', positionData);
        fetchInterviewers(
            positionData?.skills,
            positionData?.minexperience,
            positionData?.maxexperience,
            candidateData?.Technology
        );
        requestSentRef.current = true;
    }, [positionData, dateTime, navigatedfrom, interviewers, skills]);

    // Filter interviewers based on search term and rate range
    useEffect(() => {
        const filtered = baseInterviewers.filter((interviewer) => {
            const fullName =
                interviewer?.contact?.firstName || interviewer?.contact?.Name || "";
            const professionalTitle =
                interviewer?.contact?.professionalTitle ||
                interviewer?.contact?.CurrentRole ||
                "";
            const company = interviewer?.contact?.industry || "";
            const skills = interviewer?.contact?.skills || [];
            const hourlyRate = parseFloat(interviewer?.contact?.hourlyRate) || 0;

            const searchMatch =
                searchTerm.trim() === "" ||
                fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                professionalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                skills.some((skill) =>
                    skill?.toLowerCase().includes(searchTerm.toLowerCase())
                );

            const rateMatch =
                hourlyRate >= rateRange[0] && hourlyRate <= rateRange[1];

            return searchMatch && rateMatch;
        });

        setFilteredInterviewers(filtered);
    }, [searchTerm, rateRange, navigatedfrom, baseInterviewers, skills]);

    // const handleSelectClick = (interviewer) => {
    //   console.log("Selected or removed interviewer:", interviewer);

    //   setSelectedInterviewersLocal((prev) => {
    //     const isAlreadySelected = prev.some((selected) => selected._id === interviewer._id);

    //     if (isAlreadySelected) {
    //       return prev.filter((selected) => selected._id !== interviewer._id);
    //     } else {
    //       return [...prev, interviewer];
    //     }
    //   });
    // };

    const handleSelectClick = (interviewer) => {
        setSelectedInterviewersLocal((prev) => {
            const isAlreadySelected = prev.some(
                (selected) => selected._id === interviewer._id
            );
            return isAlreadySelected
                ? prev.filter((selected) => selected._id !== interviewer._id)
                : [...prev, interviewer];
        });
    };

    const handleTopup = async (topupData) => {
        console.log("Processing top-up:", topupData);

        try {
            console.log("Refreshing wallet data after topup");
            await refetch();
        } catch (error) {
            console.error("Error refreshing wallet data after topup:", error);
        }
    };

    const handleProceed = () => {
        //<----v1.0.1-----
        //<-----v1.0.4-----Venkatesh---- Updated to calculate required amount based on experience level
        const balance = walletBalance?.balance || 0;

        // Calculate the required amount based on selected interviewers' rates and experience level
        let requiredAmount = maxHourlyRate; // Default to max rate

        if (selectedInterviewersLocal.length > 0) {
            // If interviewers are selected, calculate based on their actual rates
            const selectedRates = selectedInterviewersLocal.map(interviewer => {
                const contact = interviewer?.contact;
                if (!contact?.rates) return 0;

                let experienceLevel;
                if (isMockInterview) {
                    // For mock interviews, use the contact's expertise level
                    experienceLevel = contact.expertiseLevel?.toLowerCase() || 'mid';
                } else {
                    // For regular interviews, map candidate experience to level
                    const expYears = Number(candidateExperience) || 0;
                    experienceLevel = expYears <= 3 ? 'junior' :
                        expYears <= 7 ? 'mid' : 'senior';
                }

                // Get the rate for the determined level
                return contact.rates[experienceLevel]?.inr || 0;
            });

            // Use the highest rate among selected interviewers
            requiredAmount = Math.max(...selectedRates, 0);
        }

        if (balance >= requiredAmount) {
            console.log("Selected Interviewers:", selectedInterviewersLocal);
            onProceed(selectedInterviewersLocal);
            onClose();
        } else {
            const required = Number(requiredAmount || 0).toFixed(2);
            const currentBalance = Number(balance || 0).toFixed(2);
            toast.error(
                `Your wallet balance is less than the highest interviewer hourly rate.\nRequired: $${required}\nPlease add funds to proceed.`,
                {
                    position: "top-center",
                    style: {
                        whiteSpace: "pre-line",
                        textAlign: "center",
                        maxWidth: "520px",
                    },
                }
            );
            setTimeout(() => setShowWalletModal(true), 1000);
        }
        //----v1.0.1----->
        //-----v1.0.4-----Venkatesh---->
    };

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Toaster />
            {/* v1.0.2 <-------------------------------------------------------------------------- */}
            <SidebarPopup
                title="Select Outsourced Interviewers"
                // subTitle={
                //     //<-----v1.0.4-----Venkatesh---- Added wallet balance display in header
                //     <div className="flex items-center gap-4">
                //         {/* <span>
                //             {selectedInterviewersLocal?.length} interviewer
                //             {selectedInterviewersLocal?.length !== 1 ? "s" : ""} selected
                //         </span> */}
                //         <span className="text-sm font-medium">
                //             Current Balance:
                //             <span className={`ml-1 font-bold ${
                //                 (walletBalance?.balance || 0) >= maxHourlyRate
                //                     ? 'text-green-600'
                //                     : 'text-red-600'
                //             }`}>
                //                 ₹{Number(walletBalance?.balance || 0).toFixed(2)}
                //             </span>
                //         </span>
                //     </div>
                //     //-----v1.0.4-----Venkatesh---->
                // }
                // Replace the subTitle section in SidebarPopup with:

                //               subTitle={
                //     <div className="w-full flex justify-end">
                //         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                //             <span className="text-sm font-medium text-gray-600">Current Balance:</span>
                //             <span className={`text-sm font-bold ${(walletBalance?.balance || 0) >= maxHourlyRate
                //                 ? 'text-green-600'
                //                 : 'text-red-600'
                //                 }`}>
                //                 ₹{Number(walletBalance?.balance || 0).toFixed(2)}
                //             </span>
                //         </div>
                //     </div>
                // }
                onClose={onClose}
                setIsFullscreen={setIsFullscreen}
            >

                <div className="w-full flex justify-end">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Current Balance:</span>
                        <span className={`text-sm font-bold ${(walletBalance?.balance || 0) >= maxHourlyRate
                            ? 'text-green-600'
                            : 'text-red-600'
                            }`}>
                            ₹{Number(walletBalance?.balance || 0).toFixed(2)}
                        </span>
                    </div>
                </div>
                {/* v1.0.3 <------------------------- */}
                <div className="pb-10">
                    {/* v1.0.3 -------------------------> */}
                    {/* Fixed Search and Info Section */}
                    {/* <------------------------------- v1.0.0  */}
                    <div className="sm:px-2 px-6 py-4 bg-white z-10">
                        {/* ------------------------------ v1.0.0 > */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div
                                className="flex items-start space-x-3 cursor-pointer"
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <Info className="h-5 w-5 text-custom-blue flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-custom-blue">
                                            Interview Scheduling Policy
                                        </h3>
                                        {isOpen ? (
                                            <ChevronUp className="h-5 w-5 text-custom-blue" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-custom-blue" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            {isOpen && (
                                <div className="mt-3 ml-8 space-y-2">
                                    <div className="flex items-center text-sm text-custom-blue">
                                        <Clock className="h-4 w-4 mr-1" />
                                        <span>Response: 2-4 hours</span>
                                    </div>
                                    <div className="text-sm text-custom-blue space-y-1">
                                        <div className="flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span>
                                                Interviews are scheduled based on first acceptance
                                            </span>
                                        </div>
                                        <ul className="list-disc list-inside pl-6 text-sm space-y-0.5">
                                            <li>
                                                Interview requests sent to all selected interviewers
                                            </li>
                                            <li>
                                                First interviewer to accept will conduct the interview
                                            </li>
                                            <li>
                                                Select multiple interviewers to increase availability
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-row items-center  justify-between mt-4 gap-4">
                           
                            <div className="w-full mt-5">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, role, company, or skills..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                           
                            <div className="flex flex-col w-full">
                                <label className="flex text-sm font-medium text-gray-700 mb-1 md:mb-2">
                                    Hourly Rate Range
                                </label>
                                <div className="flex items-center space-x-1.5 w-full">
                                    <input
                                        type="number"
                                        value={rateRange[0]}
                                        onChange={(e) =>
                                            setRateRange([
                                                parseInt(e.target.value) || 0,
                                                rateRange[1],
                                            ])
                                        }
                                        className="px-2 py-2 border border-gray-300 rounded-md w-full"
                                        min="0"
                                        max={rateRange[1]}
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        value={rateRange[1]}
                                        onChange={(e) =>
                                            setRateRange([
                                                rateRange[0],
                                                parseInt(e.target.value) ,
                                            ])
                                        }
                                        className="px-2 py-2 border border-gray-300 rounded-md w-full"
                                        min={rateRange[0]}
                                        max="250"
                                    />
                                </div>
                            </div>

                           


                        </div>
                    </div>

                    {/* Scrollable Data Section */}
                    {/* v1.0.3 <--------------------------------------------------------------------- */}
                    <div className="flex flex-col overflow-y-auto py-4 sm:px-2 px-6 min-h-full">
                        <div
                            className={`grid gap-4 ${isFullscreen
                                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3"
                                : "grid-cols-1"
                                }`}
                        >
                            {filteredInterviewers.map((interviewer) => (
                                // <OutsourcedInterviewerCard
                                //   key={interviewer._id}
                                //   interviewer={interviewer}
                                //   // isSelected={selectedInterviewersLocal.some(sel => sel._id === interviewer._id)}
                                //   isSelected={selectedInterviewer?._id === interviewer._id}
                                //   onSelect={() => handleSelectClick(interviewer)}
                                //   onViewDetails={() => setSelectedInterviewer(interviewer)}
                                //   navigatedfrom={navigatedfrom}
                                // />
                                <OutsourcedInterviewerCard
                                    key={interviewer._id}
                                    interviewer={interviewer}
                                    isSelected={selectedInterviewersLocal.some(
                                        (sel) => sel._id === interviewer._id
                                    )}
                                    onSelect={() => handleSelectClick(interviewer)}
                                    onViewDetails={() => setSelectedInterviewer(interviewer)}
                                    navigatedfrom={navigatedfrom}
                                />
                            ))}
                        </div>
                        {/* v1.0.3 ---------------------------------------------------------------------> */}
                        {filteredInterviewers.length === 0 && (
                            <div className="flex justify-center items-center pt-6 sm:px-0 px-6 w-full min-h-[200px]">
                                <p className="text-center text-gray-500 text-lg font-medium">
                                    No available interviewers found for the selected criteria.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Fixed Footer (Hidden when navigatedfrom is 'dashboard') */}
                    {navigatedfrom !== "dashboard" && (
                        // <div className="flex justify-end mt-5 mr-6">
                        <div className="fixed bottom-0 left-0 right-0   py-4 px-6 ">
                            <div className="flex justify-end">

                                <button
                                    onClick={handleProceed}
                                    disabled={selectedInterviewersLocal.length === 0}
                                    className="bg-custom-blue px-4 py-2 rounded-md text-white hover:bg-custom-blue/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    Schedule ({selectedInterviewersLocal.length})
                                </button>
                            </div>
                        </div>
                    )}

                </div>
            </SidebarPopup>
            {/* v1.0.2 --------------------------------------------------------------------------> */}
            <AnimatePresence>
                {selectedInterviewer && navigatedfrom !== "dashboard" && (
                    <div className="relative z-[60]">
                        <InterviewerDetailsModal
                            interviewer={selectedInterviewer}
                            onClose={() => setSelectedInterviewer(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {showWalletModal && (
                <WalletTopupPopup
                    onClose={() => setShowWalletModal(false)}
                    onTopup={handleTopup}
                />
            )}
        </>
    );
}

export default OutsourcedInterviewerModal;
