// v1.0.0  -  Ashraf  -  header border-b removed
// v1.0.1  -  Venkatesh  -  interviewer if  wallet balance is less than hourlyrate then show wallet modal
// v1.0.2  -  Ashok   -  Improved responsiveness and added common code to popups
// v1.0.3  -  Ashok   -  Fixed issues in responsiveness
// v1.0.4  -  Venkatesh  -  Updated to handle rates object (junior/mid/senior) and show current balance in header

import React, { useState, useRef, useEffect, useMemo } from "react"; //<----v1.0.1-----
import {
  // X,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  // Minimize,
  Info,
  Clock,
  Users,
  // Expand,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Button } from "../../../CommonCode-AllTabs/ui/button.jsx";
import InterviewerAvatar from "../../../CommonCode-AllTabs/InterviewerAvatar.jsx";
import InterviewerDetailsModal from "../Internal-Or-Outsource/OutsourceInterviewerDetail.jsx";
// import { useCustomContext } from "../../../../../../Context/Contextfetch.js";
// import Wallet from "../../../../Accountsettings/account/wallet/Wallet.jsx";
import { useWallet } from "../../../../../../apiHooks/useWallet"; //<----v1.0.1-----
import { Toaster } from "react-hot-toast"; //<----v1.0.1-----
import { WalletTopupPopup } from "../../../../Accountsettings/account/wallet/WalletTopupPopup.jsx";
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../../utils/AuthCookieManager/jwtDecode";
import { notify } from "../../../../../../services/toastService.js";
import useInterviewers from "../../../../../../hooks/useInterviewers.js";
import { useIndividualLogin } from "../../../../../../apiHooks/useIndividualLogin.js";
import { useTenantTaxConfig } from "../../../../../../apiHooks/useTenantTaxConfig";

const OutsourcedInterviewerCard = ({
  interviewer,
  isSelected,
  onSelect,
  onViewDetails,
  navigatedfrom,
  candidateExperience,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullName =
    interviewer?.contact?.firstName || interviewer?.contact?.Name || "Unnamed";
  const professionalTitle =
    interviewer?.contact?.professionalTitle ||
    interviewer?.contact?.CurrentRole ||
    "Interviewer";
  const company = interviewer?.contact?.industry || "Freelancer";

  // ✅ New logic: get rate based on candidate experience
  const getExperienceBasedRate = () => {
    const rates = interviewer?.contact?.rates;
    if (!rates) return interviewer?.contact?.hourlyRate || "Not provided";

    let selectedLevel = null;

    if (candidateExperience >= 1 && candidateExperience <= 3) {
      selectedLevel = "junior";
    } else if (candidateExperience > 3 && candidateExperience <= 6) {
      selectedLevel = "mid";
    } else if (candidateExperience > 6) {
      selectedLevel = "senior";
    }

    // ✅ Try to get the rate for selected level
    const selectedRate =
      selectedLevel && rates[selectedLevel]?.inr > 0
        ? rates[selectedLevel].inr
        : null;

    // ✅ If selected level rate is not available, fallback gracefully
    if (!selectedRate) {
      if (selectedLevel === "senior") {
        // fallback to mid → junior
        if (rates?.mid?.inr > 0) return `₹${rates.mid.inr}/hr`;
        if (rates?.junior?.inr > 0) return `₹${rates.junior.inr}/hr`;
      } else if (selectedLevel === "mid") {
        // fallback to junior
        if (rates?.junior?.inr > 0) return `₹${rates.junior.inr}/hr`;
      } else if (selectedLevel === "junior") {
        // no fallback below junior
        return "Not provided";
      }
    }

    // ✅ Found valid rate for level
    if (selectedRate) return `₹${selectedRate}/hr`;

    return "Not provided";
  };

  const hourlyRate = getExperienceBasedRate(); // ✅ use new logic

  const rating = interviewer?.contact?.rating || "4.6";
  const introduction = interviewer?.contact?.bio || "No introduction provided.";
  const skillsArray = interviewer?.contact?.skills ?? [];
  // const avgResponseTime =
  // interviewer?.contact?.avgResponseTime || "not provided";

  return (
    <div
      className={`bg-white rounded-lg border ${isSelected
          ? "border-orange-500 ring-2 ring-orange-200"
          : "border-gray-200"
        } p-4 shadow-sm hover:shadow-md transition-all`}
    >
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

      <div className="mt-3 w-40">
        <div
          className={`text-sm text-gray-600 transition-all duration-300 overflow-hidden ${isExpanded ? "line-clamp-none" : "line-clamp-2"
            }`}
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

      <div className="mt-4 flex justify-end items-center">
        {/* <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-1 text-gray-400" /> Avg. response:{" "}
                    {avgResponseTime}
                </div> */}
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
  onProceed,
  skills,
  currentRole,
  candidateExperience, //<-----v1.0.4-----Venkatesh---- Added to determine experience level for rate calculation
  navigatedfrom,
  previousSelectedInterviewers,
  // positionData,
  // candidateData,
}) {
  const type = "outsourced";
  const { interviewers } = useInterviewers();
  const { matchedContact, loading: contactLoading } = useIndividualLogin({
    type,
  });
  const { data: walletBalance, refetch } = useWallet();
  //   const { contacts } = useCustomContext(); //<----v1.0.1-----
  //   console.log("contacts===", contacts);
  const contacts = matchedContact;
  //<----v1.0.1-----
  // console.log("walletBalance===", walletBalance);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;

  // console.log("interviewers interviewers", interviewers);
  // console.log("contacts contacts", contacts);

  console.log("navigatedfrom", {
    onClose,
    dateTime,
    // positionData,
    // candidateData,
    onProceed,
    skills,
    currentRole,
    navigatedfrom,
    candidateExperience,
    previousSelectedInterviewers,
    // isMockInterview,
    // positionData?.skills,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [rateRange, setRateRange] = useState(["", ""]);
  const [appliedRateRange, setAppliedRateRange] = useState([0, Infinity]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [selectedInterviewersLocal, setSelectedInterviewersLocal] = useState(
    previousSelectedInterviewers || []
  );
  const requestSentRef = useRef(false);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [baseInterviewers, setBaseInterviewers] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false); //<----v1.0.1-----

  // Fetch tenant tax configuration (GST, service charge, etc.)
  const { data: tenantTaxConfig } = useTenantTaxConfig();
  const gstRate = typeof tenantTaxConfig?.gstRate === "number" ? tenantTaxConfig.gstRate : 0;

  //<----v1.0.1-----
  //<-----v1.0.4-----Venkatesh---- Updated to compute the highest rate from all contacts and all levels (junior/mid/senior)
  const maxHourlyRate = useMemo(() => {
    if (!Array.isArray(contacts) || contacts.length === 0) return 0;

    const allRates = [];
    contacts.forEach((contact) => {
      if (contact?.rates) {
        // Extract all INR rates from junior, mid, senior levels
        ["junior", "mid", "senior"].forEach((level) => {
          const rate = contact.rates[level]?.inr;
          if (typeof rate === "number" && rate > 0) {
            allRates.push(rate);
          }
        });
      }
    });

    return allRates.length > 0 ? Math.max(...allRates) : 0;
  }, [contacts]);
  //----v1.0.1----->

  // console.log("maxHourlyRate===", maxHourlyRate);
  //console.log("🔍 Filtering interviewers...", interviewers);
  // Fetch and filter interviewers based on skills and availability added by Ranjith
  useEffect(() => {
    // console.log("🔄 useEffect triggered - Starting interviewer filtering");
    // console.log("📋 Parameters:", {
    //   navigatedfrom,
    //   hasPositionData: !!positionData,
    //   requestSent: requestSentRef.current,
    //   skillsProvided: !!skills,
    //   skillsCount: skills?.length || 0,
    //   dateTimeProvided: !!dateTime,
    // });

    // if (
    //   navigatedfrom !== "dashboard" &&
    //   navigatedfrom !== "mock-interview" &&
    //   (!positionData || requestSentRef.current)
    // ) {
    //   console.log("⏩ Skipping - conditions not met for regular flow");
    //   return;
    // }

    const fetchInterviewers = async (
      skills,
      candidateExperience,
      currentRole
      // positionSkills,
      // positionMinExperience,
      // positionMaxExperience,
      // candidateTechnology
    ) => {
      // currentRole
      // console.log("🎯 fetchInterviewers called with:", {
      //   positionSkills,
      //   positionMinExperience,
      //   positionMaxExperience,
      //   candidateTechnology,
      // });

      try {
        // console.log("📥 Fetching interviewers from context...");
        const response = interviewers;
        // console.log("📊 Interviewers from context:", response);

        if (!response || !Array.isArray(response)) {
          // console.log("❌ No interviewers data found");
          setBaseInterviewers([]);
          setFilteredInterviewers([]);
          return;
        }

        const externalInterviewers = response?.filter(
          (interviewer) => interviewer.type === "external"
        );
        // console.log(
        //   "🌐 External Interviewers count:",
        //   externalInterviewers.length
        // );

        // Filter out interviewers where ownerId matches current user ID
        const filteredByOwnerId = externalInterviewers.filter((interviewer) => {
          const interviewerOwnerId =
            interviewer.contact?.ownerId || interviewer.ownerId;
          return interviewerOwnerId !== userId;
        });
        // console.log(
        //   `🔍 Filtered out ${
        //     externalInterviewers.length - filteredByOwnerId.length
        //   } interviewers with matching ownerId`
        // );

        // ========== MOCK INTERVIEW FLOW - FILTER BY TIME + SKILLS ==========
        // if (navigatedfrom === "mock-interview") {
        //   // console.log(
        //   //   `📍 Navigated from MOCK-INTERVIEW – filtering by time availability, technology, and skills`
        //   // );

        //   if (!dateTime) {
        //     // console.log(
        //     //   "❌ No dateTime provided for mock-interview, cannot filter by availability"
        //     // );
        //     setBaseInterviewers([]);
        //     setFilteredInterviewers([]);
        //     return;
        //   }

        //   // 🔹 Utility: Convert time string ("hh:mm AM/PM") → minutes
        //   const timeToMinutes = (timeStr) => {
        //     const [time, period] = timeStr.split(" ");
        //     const [hours, minutes] = time.split(":").map(Number);
        //     let totalMinutes = (hours % 12) * 60 + minutes;
        //     if (period === "PM") totalMinutes += 720;
        //     return totalMinutes;
        //   };

        //   // console.log("📅 Processing dateTime for mock-interview:", dateTime);

        //   const [datePart, ...timeParts] = dateTime.split(" ");
        //   const timeRange = timeParts.join(" ");
        //   const [startTimeStr, endTimeStr] = timeRange
        //     .split("-")
        //     .map((t) => t.trim());

        //   const startTimeMinutes = timeToMinutes(startTimeStr);
        //   const endTimeMinutes = timeToMinutes(endTimeStr);

        //   const [day, month, year] = datePart.split("-");
        //   const interviewDate = new Date(`${year}-${month}-${day}`);
        //   const interviewDayFull = interviewDate.toLocaleDateString("en-US", {
        //     weekday: "long",
        //   });
        //   const interviewDayShort = interviewDayFull.substring(0, 3);

        //   // ✅ Step 1: Filter by time availability
        //   const availableInterviewers = filteredByOwnerId.filter(
        //     (externalInterviewer) => {
        //       const isAvailable = externalInterviewer.days?.some((day) => {
        //         const dayMatches =
        //           day.day === interviewDayFull || day.day === interviewDayShort;
        //         if (!dayMatches) return false;

        //         return day.timeSlots?.some((timeSlot) => {
        //           const availabilityStartMinutes = timeToMinutes(
        //             timeSlot.startTime
        //           );
        //           const availabilityEndMinutes = timeToMinutes(
        //             timeSlot.endTime
        //           );
        //           return (
        //             startTimeMinutes >= availabilityStartMinutes &&
        //             endTimeMinutes <= availabilityEndMinutes
        //           );
        //         });
        //       });
        //       return isAvailable;
        //     }
        //   );

        //   // console.log(
        //   //   "✅ Available Interviewers:",
        //   //   availableInterviewers.length
        //   // );

        //   // ✅ Step 2: Filter by Technology (from props)
        //   const techMatchedInterviewers = availableInterviewers.filter(
        //     (interviewer) => {
        //       // console.log(
        //       //   "Interviewer Technology:",
        //       //   interviewer.contact?.currentRole
        //       // );
        //       // console.log("mock Technology:", technology);
        //       const interviewerTech =
        //         interviewer.contact?.currentRole?.toLowerCase()?.trim() || "";
        //       const candidateTech = technology?.toLowerCase()?.trim() || "";

        //       // If no technology is specified for either, consider it a match
        //       if (!interviewerTech || !candidateTech) return true;

        //       return interviewerTech === candidateTech;
        //     }
        //   );

        //   const nonTechMatchedInterviewers = availableInterviewers.filter(
        //     (interviewer) => {
        //       const interviewerTech = interviewer.contact?.currentRole
        //         ?.toLowerCase()
        //         ?.trim();
        //       const candidateTech = technology?.toLowerCase()?.trim();
        //       return interviewerTech !== candidateTech;
        //     }
        //   );

        //   // console.log(
        //   //   "✅ Technology Matched Interviewers:",
        //   //   techMatchedInterviewers.length
        //   // );
        //   // console.log(
        //   //   "⚪ Non-Technology Matched Interviewers:",
        //   //   nonTechMatchedInterviewers.length
        //   // );

        //   // ✅ Step 3: Skill matching function
        //   const calculateSkillMatches = (interviewersList, label) => {
        //     // console.log(`\n🔍 Checking Skill Matches for Group: ${label}`);
        //     return interviewersList.map((interviewer, index) => {
        //       // console.log(
        //       //   `🧑 Interviewer #${index + 1}:`,
        //       //   interviewer.contact?.firstName ||
        //       //     interviewer.contact?.UserName ||
        //       //     "Unknown"
        //       // );
        //       // console.log(
        //       //   "👉 Interviewer's Skills:",
        //       //   interviewer.contact?.skills || []
        //       // );

        //       if (!skills || !Array.isArray(skills)) {
        //         // console.log(
        //         //   "⚠️ skills prop is invalid or not an array:",
        //         //   skills
        //         // );
        //         return { ...interviewer, matchedSkills: 0 };
        //       }

        //       const interviewerSkills = interviewer.contact?.skills || [];
        //       const matchingSkills = interviewerSkills.filter(
        //         (interviewerSkill) => {
        //           const interviewerSkillLower =
        //             typeof interviewerSkill === "string"
        //               ? interviewerSkill.toLowerCase()
        //               : interviewerSkill?.skill?.toLowerCase();

        //           return skills.some((skillItem) => {
        //             const requiredSkill =
        //               typeof skillItem === "string"
        //                 ? skillItem.toLowerCase()
        //                 : skillItem?.skill?.toLowerCase();
        //             return (
        //               requiredSkill && interviewerSkillLower === requiredSkill
        //             );
        //           });
        //         }
        //       );

        //       // console.log("✅ Matching Skills Found:", matchingSkills);
        //       const matchCount = matchingSkills.length;

        //       return { ...interviewer, matchedSkills: matchCount };
        //     });
        //   };

        //   // ✅ Step 4: Apply skill matching for both groups
        //   const techMatchedWithSkills = calculateSkillMatches(
        //     techMatchedInterviewers,
        //     "Tech-Matched"
        //   );
        //   const nonTechMatchedWithSkills = calculateSkillMatches(
        //     nonTechMatchedInterviewers,
        //     "Non-Tech-Matched"
        //   );

        //   // ✅ Step 5: Filter only those with at least one skill match
        //   const techSkillFiltered = techMatchedWithSkills.filter(
        //     (i) => i.matchedSkills > 0
        //   );
        //   const nonTechSkillFiltered = nonTechMatchedWithSkills.filter(
        //     (i) => i.matchedSkills > 0
        //   );

        //   // console.log(
        //   //   "✅ Tech+Skill Matched Interviewers:",
        //   //   techSkillFiltered.length
        //   // );
        //   // console.log(
        //   //   "✅ Skill-Only Matched Interviewers:",
        //   //   nonTechSkillFiltered.length
        //   // );

        //   // ✅ Step 6: Sort both lists by matched skill count (descending)
        //   const sortedTechSkillMatched = techSkillFiltered.sort(
        //     (a, b) => b.matchedSkills - a.matchedSkills
        //   );
        //   const sortedSkillOnlyMatched = nonTechSkillFiltered.sort(
        //     (a, b) => b.matchedSkills - a.matchedSkills
        //   );

        //   // ✅ Step 7: Merge both (tech+skill first, then skill-only)
        //   const combinedInterviewers = [
        //     ...sortedTechSkillMatched,
        //     ...sortedSkillOnlyMatched,
        //   ];

        //   // ✅ Step 7.5: De-duplicate interviewers before final filtering
        //   const uniqueInterviewers = combinedInterviewers.filter(
        //     (interviewer, index, self) =>
        //       index ===
        //       self.findIndex((i) => i.contact?._id === interviewer.contact?._id)
        //   );

        //   // console.log(
        //   //   `✅ After de-duplication: ${uniqueInterviewers.length} unique interviewers`
        //   // );

        //   // ✅ Step 8: Filter only approved interviewers who offer mock interviews
        //   const approvedInterviewers = uniqueInterviewers.filter(
        //     (interviewer) => {
        //       const isApproved = interviewer.contact?.status === "approved";
        //       const offersMock =
        //         interviewer.contact?.InterviewFormatWeOffer?.includes("mock");
        //       return isApproved && offersMock;
        //     }
        //   );

        //   // console.log(
        //   //   `✅ Approved Interviewers: ${approvedInterviewers.length}`
        //   // );

        //   // ✅ Step 9: Experience filter
        //   const experienceFiltered = approvedInterviewers.filter(
        //     (interviewer) => {
        //       const interviewerExp = parseFloat(
        //         interviewer.contact?.yearsOfExperience || 0
        //       );
        //       const candidateExp = parseFloat(candidateExperience || 0);
        //       return interviewerExp >= candidateExp;
        //     }
        //   );

        //   // console.log(
        //   //   `✅ After experience filtering: ${experienceFiltered.length} interviewers`
        //   // );

        //   // ✅ Step 10: Final de-duplication (just in case)
        //   const finalInterviewers = experienceFiltered.filter(
        //     (interviewer, index, self) =>
        //       index ===
        //       self.findIndex((i) => i.contact?._id === interviewer.contact?._id)
        //   );

        //   // console.log(
        //   //   `✅ Final unique interviewers: ${finalInterviewers.length}`
        //   // );

        //   // ✅ Step 11: Update state with unique interviewers
        //   setBaseInterviewers(finalInterviewers);
        //   setFilteredInterviewers(finalInterviewers);
        //   return;
        // }

        // ========== DASHBOARD FLOW - FILTER BY SKILLS ONLY ==========
        if (navigatedfrom === "dashboard") {
          // console.log(
          //   `📍 Navigated from DASHBOARD – using skill-based filtering only`
          // );

          let skillFilteredInterviewers = filteredByOwnerId;

          // Apply skill filtering only if skills are provided
          if (skills && Array.isArray(skills) && skills.length > 0) {
            console.log("🔧 Applying skill filtering with skills:", skills);

            skillFilteredInterviewers = filteredByOwnerId.filter(
              (interviewer) => {
                const interviewerSkills = interviewer.contact?.skills || [];
                console.log(
                  `👤 Checking interviewer: ${interviewer.contact?.firstName ||
                  interviewer.contact?.UserName ||
                  "Unknown"
                  }`
                );
                console.log("📝 Interviewer's Skills:", interviewerSkills);

                if (interviewerSkills.length === 0) {
                  // console.log("❌ Interviewer has no skills, excluding");
                  return false;
                }

                // Convert all skills to lowercase for case-insensitive comparison
                const interviewerSkillsLower = interviewerSkills
                  .map((skill) =>
                    typeof skill === "string"
                      ? skill.toLowerCase()
                      : (skill?.skill || "").toLowerCase()
                  )
                  .filter((skill) => skill); // Remove empty strings

                console.log(
                  "🔠 Interviewer's normalized skills:",
                  interviewerSkillsLower
                );

                // Check if any of the required skills match the interviewer's skills
                const hasMatchingSkill = skills.some((requiredSkill) => {
                  // Get the skill name and convert to lowercase
                  const requiredSkillName = requiredSkill.skill?.toLowerCase();
                  if (!requiredSkillName) {
                    console.log(
                      "⚠️ Required skill has no name:",
                      requiredSkill
                    );
                    return false;
                  }

                  const matchFound =
                    interviewerSkillsLower.includes(requiredSkillName);
                  if (matchFound) {
                    console.log(
                      `✅ Found matching skill: ${requiredSkillName}`
                    );
                  }
                  return matchFound;
                });

                console.log(
                  `🎯 ${interviewer.contact?.firstName || "Unknown"
                  } Skill Match Status: ${hasMatchingSkill}`
                );
                return hasMatchingSkill;
              }
            );
          } else {
            console.log(
              "ℹ️ No skills provided, showing all external interviewers"
            );
          }

          // Filter for approved interviewers
          const approvedInterviewers = skillFilteredInterviewers.filter(
            (interviewer) => interviewer.contact?.status === "approved"
          );

          console.log(
            "✅ Approved interviewers count:",
            approvedInterviewers.length
          );
          console.log("✅ Approved interviewers:", approvedInterviewers);

          setBaseInterviewers(approvedInterviewers);
          setFilteredInterviewers(approvedInterviewers);
          return;
        }

        // {{ ========== REGULAR FLOW (with positionData) ========== }}
        // console.log("🕒 Regular flow - checking availability and skills");

        const timeToMinutes = (timeStr) => {
          const [time, period] = timeStr.split(" ");
          const [hours, minutes] = time.split(":").map(Number);
          let totalMinutes = (hours % 12) * 60 + minutes;
          if (period === "PM") totalMinutes += 720;
          return totalMinutes;
        };

        // console.log("📅 Processing dateTime:", dateTime);

        const [datePart, ...timeParts] = dateTime.split(" ");
        const timeRange = timeParts.join(" ");
        // console.log("📅 Date Part:", datePart);
        // console.log("🕒 Time Range:", timeRange);

        const [startTimeStr, endTimeStr] = timeRange
          .split("-")
          .map((t) => t.trim());
        // console.log("⏰ Start Time String:", startTimeStr);
        // console.log("⏰ End Time String:", endTimeStr);

        const startTimeMinutes = timeToMinutes(startTimeStr);
        const endTimeMinutes = timeToMinutes(endTimeStr);
        // console.log("⏱️ Interviewer Start Time in Minutes:", startTimeMinutes);
        // console.log("⏱️ Interviewer End Time in Minutes:", endTimeMinutes);

        const [day, month, year] = datePart.split("-");
        const interviewDate = new Date(`${year}-${month}-${day}`);
        const interviewDayFull = interviewDate.toLocaleDateString("en-US", {
          weekday: "long",
        });
        const interviewDayShort = interviewDayFull.substring(0, 3);
        // console.log("📅 Interviewer Day (Full):", interviewDayFull);
        // console.log("📅 Interviewer Day (Short):", interviewDayShort);

        // 1️⃣ Filter by availability first
        const availableInterviewers = filteredByOwnerId.filter(
          (externalInterviewer) => {
            // console.log(
            //   "👤 Checking availability for interviewer:",
            //   externalInterviewer.contact?.firstName +
            //     " " +
            //     externalInterviewer.contact?.lastName || "Unknown"
            // );

            // console.log("📅 Interviewer days:", externalInterviewer.days);
            return externalInterviewer.days?.some((day) => {
              const dayMatches =
                day.day === interviewDayFull || day.day === interviewDayShort;
              if (!dayMatches) return false;

              return day.timeSlots?.some((timeSlot) => {
                const availabilityStartMinutes = timeToMinutes(
                  timeSlot.startTime
                );
                const availabilityEndMinutes = timeToMinutes(timeSlot.endTime);

                return (
                  startTimeMinutes >= availabilityStartMinutes &&
                  endTimeMinutes <= availabilityEndMinutes
                );
              });
            });
          }
        );

        // console.log(
        //   "✅ Available External Interviewers after time check:",
        //   availableInterviewers
        // );

        // // 2️⃣ Filter by Technology (before skill matching)
        // console.log("🎯 Candidate Technology:", currentRole);

        // Split into two groups: tech-matched and non-tech-matched
        const techMatchedInterviewers = availableInterviewers.filter(
          (interviewer) => {
            const interviewerTech = interviewer?.contact?.currentRole
              ?.toLowerCase()
              ?.trim();
            const candidateTech = currentRole?.toLowerCase()?.trim();
            const isMatch = interviewerTech === candidateTech;
            // console.log(
            //   `💻 Interviewer: ${
            //     interviewer.contact?.firstName || "Unknown"
            //   } | Interviewer Tech: ${interviewerTech} | Candidate Tech: ${candidateTech} | Match: ${isMatch}`
            // );
            return isMatch;
          }
        );

        const nonTechMatchedInterviewers = availableInterviewers.filter(
          (interviewer) => {
            const interviewerTech = interviewer.contact?.currentRole
              ?.toLowerCase()
              ?.trim();
            const candidateTech = currentRole?.toLowerCase()?.trim();
            return interviewerTech !== candidateTech;
          }
        );

        // console.log(
        //   "✅ Technology Matched Interviewers:",
        //   techMatchedInterviewers
        // );
        // console.log(
        //   "⚪ Non-Technology Interviewers:",
        //   nonTechMatchedInterviewers
        // );

        // 🔍 Reusable function to calculate skill matches
        const calculateSkillMatches = (interviewersList, label) => {
          // console.log(`\n🔍 Checking Skill Matches for Group: ${label}`);
          return interviewersList.map((interviewer, index) => {
            // console.log(
            //   `\n🧑 Interviewer #${index + 1}:`,
            //   interviewer.contact?.firstName ||
            //     interviewer.contact?.UserName ||
            //     "Unknown"
            // );
            // console.log(
            //   "👉 Interviewer's Skills:",
            //   interviewer.contact?.skills || []
            // );

            if (!skills || !Array.isArray(skills)) {
              // console.log(
              //   "⚠️ positionSkills is invalid or not an array:",
              //   skills
              // );
              return { ...interviewer, matchedSkills: 0 };
            }

            const interviewerSkills = interviewer.contact?.skills || [];

            const matchingSkills = interviewerSkills.filter(
              (interviewerSkill) =>
                skills.some((positionSkill) => {
                  const posSkill =
                    typeof positionSkill === "string"
                      ? positionSkill
                      : positionSkill?.skill;

                  return (
                    posSkill?.toLowerCase() === interviewerSkill?.toLowerCase()
                  );
                })
            );
            // const matchingSkills = interviewerSkills.filter(
            //   (interviewerSkill) =>
            //     skills.some(
            //       (positionSkill) =>
            //         positionSkill?.skill ||
            //         positionSkill?.toLowerCase() ===
            //           interviewerSkill?.toLowerCase()
            //     )
            // );

            // console.log("✅ Matching Skills Found:", matchingSkills);
            const matchCount = matchingSkills.length;
            // console.log("asdas", ...interviewer, "or", matchCount);

            return { ...interviewer, matchedSkills: matchCount };
          });
        };

        // 3️⃣ Apply skill matching for both groups
        const techMatchedWithSkills = calculateSkillMatches(
          techMatchedInterviewers,
          "Tech-Matched"
        );
        const nonTechMatchedWithSkills = calculateSkillMatches(
          nonTechMatchedInterviewers,
          "Non-Tech-Matched"
        );

        // 4️⃣ Keep only those with ≥1 skill match
        const techSkillFiltered = techMatchedWithSkills.filter(
          (i) => i.matchedSkills > 0
        );
        const nonTechSkillFiltered = nonTechMatchedWithSkills.filter(
          (i) => i.matchedSkills > 0
        );

        // console.log("✅ Tech+Skill Matched Interviewers:", techSkillFiltered);
        // console.log(
        //   "✅ Skill-Only Matched Interviewers:",
        //   nonTechSkillFiltered
        // );

        // 5️⃣ Sort both lists by matched skill count (descending)
        const sortedTechSkillMatched = techSkillFiltered.sort(
          (a, b) => b.matchedSkills - a.matchedSkills
        );
        // console.log("asdas sortedTechSkillMatched", sortedTechSkillMatched);
        const sortedSkillOnlyMatched = nonTechSkillFiltered.sort(
          (a, b) => b.matchedSkills - a.matchedSkills
        );
        // console.log("asdas sortedSkillOnlyMatched", sortedSkillOnlyMatched);

        // 6️⃣ Merge both (tech+skill first, then skill-only)
        const combinedInterviewers = [
          ...sortedTechSkillMatched,
          ...sortedSkillOnlyMatched,
        ];
        // console.log("asdas", ...combinedInterviewers);

        // console.log(
        //   "✅ Combined Sorted Interviewers (Tech+Skill on top):",
        //   combinedInterviewers.map((i) => ({
        //     name: i.contact?.firstName || "Unknown",
        //     matchedSkills: i.matchedSkills,
        //     technology: i.contact?.currentRole,
        //   }))
        // );

        // 7️⃣ Filter only approved
        const approvedInterviewers = combinedInterviewers.filter(
          (i) => i.contact?.status === "approved"
        );

        // 8️⃣ Remove logged-in user
        const finalInterviewers = approvedInterviewers.filter(
          (i) => i.contact?._id?.toString() !== userId?.toString()
        );

        // 🧠 Step: Filter by experience match (interviewer's experience >= candidate's experience)
        const experienceFiltered = approvedInterviewers.filter(
          (interviewer) => {
            const interviewerExp = parseFloat(
              interviewer.contact?.yearsOfExperience
            );
            const candidateExp = parseFloat(candidateExperience);

            // Include interviewer only if their experience >= candidate experience
            const isEligible = interviewerExp >= candidateExp;

            // console.log(
            //   `🎓 Experience Check -> Interviewer: ${
            //     interviewer.contact?.firstName || "Unknown"
            //   } | ` +
            //     `InterviewerExp: ${interviewerExp} | CandidateExp: ${candidateExp} | Eligible: ${isEligible}`
            // );

            return isEligible;
          }
        );

        // console.log(
        //   `✅ After experience filtering: ${experienceFiltered.length} interviewers remaining`
        // );

        // console.log("✅ Final Filtered Interviewers:", experienceFiltered);

        // 9️⃣ Update state
        setBaseInterviewers(experienceFiltered);
        setFilteredInterviewers(experienceFiltered);

        // ========== REGULAR FLOW (with positionData) ========== }}
      } catch (error) {
        console.error("❌ Error processing interviewers:", error);
      }
    };

    // console.log(
    //   "🎬 Starting fetchInterviewers with positionData:",
    //   positionData
    // );
    fetchInterviewers(skills, candidateExperience, currentRole);
    requestSentRef.current = true;
  }, [skills, dateTime, currentRole, navigatedfrom, interviewers, candidateExperience, userId]);

  // Filter interviewers based on search term and applied rate range
  useEffect(() => {
    const getExperienceBasedRateValue = (contact, experience) => {
      const rates = contact?.rates;
      if (!rates) return 0;

      let selectedLevel = null;

      if (experience >= 1 && experience <= 3) selectedLevel = "junior";
      else if (experience > 3 && experience <= 6) selectedLevel = "mid";
      else if (experience > 6) selectedLevel = "senior";

      let rate = rates[selectedLevel]?.inr || 0;

      if (rate === 0) {
        if (selectedLevel === "senior")
          rate = rates.mid?.inr || rates.junior?.inr || 0;
        else if (selectedLevel === "mid") rate = rates.junior?.inr || 0;
      }

      return rate;
    };

    const filtered = baseInterviewers.filter((interviewer) => {
      const fullName =
        interviewer?.contact?.firstName || interviewer?.contact?.Name || "";
      const professionalTitle =
        interviewer?.contact?.professionalTitle ||
        interviewer?.contact?.CurrentRole ||
        "";
      const company = interviewer?.contact?.industry || "";
      const skills = interviewer?.contact?.skills || [];
      const hourlyRate = getExperienceBasedRateValue(
        interviewer.contact,
        candidateExperience
      );

      const searchMatch =
        searchTerm.trim() === "" ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professionalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skills.some((skill) =>
          skill?.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const rateMatch =
        hourlyRate >= appliedRateRange[0] &&
        (appliedRateRange[1] === Infinity || hourlyRate <= appliedRateRange[1]);

      return searchMatch && rateMatch;
    });

    setFilteredInterviewers(filtered);
  }, [
    searchTerm,
    appliedRateRange,
    navigatedfrom,
    baseInterviewers,
    skills,
    candidateExperience,
  ]);

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

  // const handleSelectClick = (interviewer) => {
  //   // console.log("Selected or removed interviewer:", interviewer);
  //   setSelectedInterviewersLocal((prev) => {
  //     const isAlreadySelected = prev.some(
  //       (selected) => selected._id === interviewer._id
  //     );
  //     return isAlreadySelected
  //       ? prev.filter((selected) => selected._id !== interviewer._id)
  //       : [...prev, interviewer];
  //   });
  // };

  const handleSelectClick = (interviewer) => {
    setSelectedInterviewersLocal((prev) => {
      // Check if interviewer is already selected
      const isAlreadySelected = prev.some((selected) => {
        // Handle both cases: selected could be an object or an array
        if (Array.isArray(selected)) {
          return selected[0]?._id === interviewer._id;
        } else {
          return selected?._id === interviewer._id;
        }
      });

      if (isAlreadySelected) {
        // Remove the interviewer
        return prev.filter((selected) => {
          if (Array.isArray(selected)) {
            return selected[0]?._id !== interviewer._id;
          } else {
            return selected?._id !== interviewer._id;
          }
        });
      } else {
        // Add the interviewer
        return [...prev, interviewer];
      }
    });
  };

  const handleTopup = async (topupData) => {
    // console.log("Processing top-up:", topupData);

    try {
      // console.log("Refreshing wallet data after topup");
      await refetch();
    } catch (error) {
      console.error("Error refreshing wallet data after topup:", error);
    }
  };

  console.log("Selected Interviewers:", selectedInterviewersLocal);

  // Compute available balance (balance - holdAmount) for gating outsourced selections
  const walletRawBalance = Number(walletBalance?.balance || 0);
  const walletHoldAmount = Number(walletBalance?.holdAmount || 0);
  const availableBalance = walletRawBalance

  const handleProceed = () => {
    //<----v1.0.1-----
    //<-----v1.0.4-----Venkatesh---- Updated to calculate required amount based on experience level

    // Calculate the required amount based on selected interviewers' rates and experience level
    let baseRequiredAmount = parseInt(maxHourlyRate); // Default to max rate (base, without GST)
    console.log("baseRequiredAmount", baseRequiredAmount);
    if (selectedInterviewersLocal.length > 0) {
      // If interviewers are selected, calculate based on their actual rates
      const selectedRates = selectedInterviewersLocal.map((interviewer) => {
        const contact = interviewer?.contact;
        console.log("Contact:", contact?.yearsOfExperience);
        if (!contact?.rates) return 0;

        let experienceLevel;
        // if (isMockInterview) {
        //   // For mock interviews, use the contact's expertise level
        //   experienceLevel = contact.expertiseLevel?.toLowerCase() || "mid";
        //   // const mockExpYears = Number(contact?.yearsOfExperience) || 0;
        //   // experienceLevel =
        //   //   mockExpYears <= 3 ? "junior" : mockExpYears <= 7 ? "mid" : "senior";
        // } else {
        // For regular interviews, map candidate experience to level
        const expYears = Number(candidateExperience) || 0;
        experienceLevel =
          expYears <= 3 ? "junior" : expYears <= 7 ? "mid" : "senior";
        // }

        if (contact.rates[experienceLevel]?.inr > 0) {
          return contact.rates[experienceLevel]?.inr;
        } else {
          return 0;
        }

        // Get the rate for the determined level
        // return contact.rates[experienceLevel]?.inr || 0;
      });

      // Use the highest rate among selected interviewers, but never below the
      // global maxHourlyRate. This keeps the frontend check aligned with the
      // backend, which uses maxHourlyRate for selection-time wallet holds.
      const maxSelectedRate = Math.max(...selectedRates, 0);
      baseRequiredAmount = Math.max(baseRequiredAmount, maxSelectedRate);
    }
    console.log("Base Required Amount (without GST):", baseRequiredAmount);

    // Apply GST using same formula as backend helper (computeBaseGstGross)
    const base = Number(baseRequiredAmount || 0);
    const rate = typeof gstRate === "number" ? gstRate : 0;

    let grossRequiredAmount = 0;
    if (!isFinite(base) || base <= 0) {
      grossRequiredAmount = 0;
    } else if (!isFinite(rate) || rate <= 0) {
      grossRequiredAmount = base;
    } else {
      const gstAmount = Math.round(((base * rate) / 100) * 100) / 100;
      grossRequiredAmount = Math.round((base + gstAmount) * 100) / 100;
    }

    console.log("Required Amount with GST:", grossRequiredAmount, "(GST rate:", gstRate, ")");

    // && grossRequiredAmount !== 0
    if (availableBalance >= grossRequiredAmount && grossRequiredAmount !== 0) {
      // console.log("Selected Interviewers:", selectedInterviewersLocal);
      // Pass maxHourlyRate up so backend can create a selection-time hold for external interviewers
      onProceed(selectedInterviewersLocal, parseInt(maxHourlyRate) || 0);
      onClose();
    } else {
      const required = Number(grossRequiredAmount || 0).toFixed(2);
      //const currentBalance = Number(availableBalance || 0).toFixed(2);
      notify.error(
        `Your available wallet balance is less than the highest interviewer hourly rate (including GST).\nRequired: ₹${required}\nPlease add funds to proceed.`
      );
      setTimeout(() => setShowWalletModal(true), 1000);
    }
    //----v1.0.1----->
    //-----v1.0.4-----Venkatesh---->
  };

  const [isOpen, setIsOpen] = useState(false);

  const [isRateApplied, setIsRateApplied] = useState(false);

  const handleApplyRateFilter = () => {
    const minVal = parseInt(rateRange[0]) || 0;
    const maxVal = parseInt(rateRange[1]) || Infinity;

    setAppliedRateRange([minVal, maxVal]);

    // If min is empty, visually show 0
    setRateRange([rateRange[0] === "" ? "0" : rateRange[0], rateRange[1]]);

    // ✅ Change button to "Clear"
    setIsRateApplied(true);
  };

  const handleClearRateFilter = () => {
    // ✅ Reset everything
    setRateRange(["", ""]);
    setAppliedRateRange([0, Infinity]);
    setIsRateApplied(false);
  };

  console.log("filteredInterviewers", filteredInterviewers);

  return (
    <>
      <Toaster />
      {/* v1.0.2 <-------------------------------------------------------------------------- */}
      <SidebarPopup
        title="Select Outsourced Interviewers"
        onClose={onClose}
        setIsFullscreen={setIsFullscreen}
      >
        <div className="w-full flex justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200 mr-6">
            <span className="text-sm font-medium text-gray-600">
              Available Balance:
            </span>
            <span
              className={`text-sm font-bold ${availableBalance >= maxHourlyRate
                  ? "text-green-600"
                  : "text-red-600"
                }`}
            >
              ₹{Number(availableBalance || 0).toFixed(2)}
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

                <div className="flex justify-between">
                  <div className="flex items-center space-x-1.5 w-2/3">
                    {/* MIN Input */}
                    <input
                      type="number"
                      value={rateRange[0]}
                      onChange={(e) =>
                        setRateRange([e.target.value, rateRange[1]])
                      }
                      className="px-2 py-2 border border-gray-300 rounded-md w-full"
                      placeholder="Min"
                      min="0"
                    />

                    <span className="text-gray-500">-</span>

                    {/* MAX Input */}
                    <input
                      type="number"
                      value={rateRange[1]}
                      onChange={(e) =>
                        setRateRange([rateRange[0], e.target.value])
                      }
                      className="px-2 py-2 border border-gray-300 rounded-md w-full"
                      placeholder="Max"
                      min="0"
                    />
                  </div>

                  {/* ✅ Dynamic Button */}
                  {isRateApplied ? (
                    <button
                      className="px-5 py-1 ml-3 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium"
                      onClick={handleClearRateFilter}
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      className="px-5 py-1 ml-3 bg-custom-blue text-white rounded-md hover:bg-custom-blue/90 text-sm font-medium"
                      onClick={handleApplyRateFilter}
                    >
                      Apply
                    </button>
                  )}
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
                  // isSelected={selectedInterviewersLocal.some(
                  //   (sel) => String(sel?._id) === String(interviewer?._id)
                  // )}
                  // isSelected={selectedInterviewersLocal.some((sel) => {
                  //   const selectedId = sel?._id ? sel?._id : sel?.[0]?._id;
                  //   return selectedId === interviewer?._id;
                  // })}
                  // isSelected={selectedInterviewersLocal.some(
                  //   (sel) => sel?._id || sel[0]?._id === interviewer?._id
                  // )}
                  isSelected={selectedInterviewersLocal.some((sel) => {
                    // Handle both cases: sel could be an object or an array
                    if (Array.isArray(sel)) {
                      return sel[0]?._id === interviewer._id;
                    } else {
                      return sel?._id === interviewer._id;
                    }
                  })}
                  onSelect={() => handleSelectClick(interviewer)}
                  onViewDetails={() => setSelectedInterviewer(interviewer)}
                  navigatedfrom={navigatedfrom}
                  candidateExperience={candidateExperience}
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
