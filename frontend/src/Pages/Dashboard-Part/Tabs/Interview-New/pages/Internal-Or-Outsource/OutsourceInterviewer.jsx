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
  Info,
  Clock,
  Users,
  Wallet,
  Plus,
  Building,
  RefreshCw,
  Mail,
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
import { capitalizeFirstLetter } from "../../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import DropdownWithSearchField from "../../../../../../Components/FormFields/DropdownWithSearchField.jsx";
import { useMasterData } from "../../../../../../apiHooks/useMasterData.js";
import { ReactComponent as LuFilterX } from "../../../../../../icons/LuFilterX.svg";
import { ReactComponent as LuFilter } from "../../../../../../icons/LuFilter.svg";
import { useNavigate } from "react-router-dom";

export const OutsourcedInterviewerCard = ({
  interviewer,
  isSelected,
  onSelect,
  onViewDetails,
  source,
  navigatedfrom,
  candidateExperience,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  console.log("interviewer dashboard", source, interviewer);

  const firstName =
    source === "internal-interview"
      ? interviewer?.contactDetails
        ? interviewer?.contactDetails?.firstName
        : interviewer?.contactId?.firstName
      : (interviewer?.contact?.firstName ?? "");

  const lastName =
    source === "internal-interview"
      ? interviewer?.contactDetails
        ? interviewer?.contactDetails?.lastName
        : interviewer?.contactId?.lastName || ""
      : (interviewer?.contact?.lastName ?? "");
  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed";

  const interviewerEmail =
    source === "internal-interview"
      ? interviewer?.contactDetails
        ? interviewer?.contactDetails?.email
        : interviewer?.contactId?.email || "No email"
      : interviewer?.contact?.email || "No email";

  const currentRole =
    source === "internal-interview"
      ? interviewer?.contactDetails?.roleLabel ||
      interviewer?.contactId?.roleLabel ||
      interviewer?.contactId?.currentRole
      : interviewer?.contact?.roleLabel || "Interviewer";

  const companyName =
    source === "internal-interview"
      ? interviewer?.contactDetails?.company ||
      interviewer?.contactId?.company ||
      interviewer?.contactId?.company
      : interviewer?.contact?.company || "N/A";
  const rating = interviewer?.contact?.rating || "4.6";
  const introduction = interviewer?.contact?.bio || "No introduction provided.";

  const skillsArray =
    source === "internal-interview"
      ? interviewer?.contactDetails
        ? interviewer?.contactDetails?.skills
        : interviewer?.contactId?.skills || []
      : (interviewer?.contact?.skills ?? []);

  // Your original rate logic
  const getExperienceBasedRate = () => {
    const rates = interviewer?.contact?.rates;
    if (!rates) return interviewer?.contact?.hourlyRate || "Not provided";

    let selectedLevel = null;
    if (candidateExperience >= 1 && candidateExperience <= 3)
      selectedLevel = "junior";
    else if (candidateExperience > 3 && candidateExperience <= 6)
      selectedLevel = "mid";
    else if (candidateExperience > 6) selectedLevel = "senior";

    let selectedRate =
      selectedLevel && rates[selectedLevel]?.inr > 0
        ? rates[selectedLevel].inr
        : null;

    if (!selectedRate) {
      if (selectedLevel === "senior") {
        if (rates?.mid?.inr > 0) return `₹${rates.mid.inr}/hr`;
        if (rates?.junior?.inr > 0) return `₹${rates.junior.inr}/hr`;
      } else if (selectedLevel === "mid") {
        if (rates?.junior?.inr > 0) return `₹${rates.junior.inr}/hr`;
      }
    }

    return selectedRate ? `₹${selectedRate}/hr` : "Not provided";
  };

  const hourlyRate = getExperienceBasedRate();

  const getAvailableSlotsInfo = () => {
    const availability =
      interviewer?.contactId?.availability[0]?.availability ||
      interviewer?.contactDetails?.availability[0]?.availability ||
      [];

    if (availability.length === 0) {
      return {
        text: "No available slots",
        count: 0,
        hasSlots: false,
        days: [],
        totalSlots: 0,
      };
    }

    // Count total slots across all days
    const totalSlots = availability.reduce((sum, dayAvail) => {
      return sum + (dayAvail.timeSlots?.length || 0);
    }, 0);

    // Get day names that have slots
    const daysWithSlots = availability
      .filter((dayAvail) => dayAvail.timeSlots?.length > 0)
      .map((dayAvail) => dayAvail.day);

    return {
      text:
        totalSlots === 1 ? "1 slot available" : `${totalSlots} slots available`,
      count: availability.length,
      hasSlots: totalSlots > 0,
      days: daysWithSlots,
      totalSlots: totalSlots,
    };
  };

  const slotsInfo = getAvailableSlotsInfo();

  // ------------ Introduction text ---------------------------------
  const textRef = useRef(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    }
  }, [introduction]);
  // ------------ Introduction text ---------------------------------

  // ------------------ Skills -----------------------------------------
  const [visibleCount, setVisibleCount] = useState(skillsArray.length);
  const skillsRef = useRef(null);

  useEffect(() => {
    const calculateVisible = () => {
      const container = skillsRef.current;
      if (!container || container.children.length === 0) return;

      const children = Array.from(container.children);

      const startTop = children[0].offsetTop;

      const rowHeightThreshold = 35;

      let count = 0;
      for (let i = 0; i < children.length; i++) {
        if (children[i].offsetTop - startTop > rowHeightThreshold) {
          break;
        }
        count++;
      }

      if (count < skillsArray.length) {
        setVisibleCount(count - 1);
      } else {
        setVisibleCount(skillsArray.length);
      }
    };

    const timeoutId = setTimeout(calculateVisible, 150);
    window.addEventListener("resize", calculateVisible);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", calculateVisible);
    };
  }, [skillsArray.length]);
  // ------------------ Skills -----------------------------------------

  return (
    <div
      className={`
        bg-white rounded-lg border shadow-sm transition-all duration-200
        ${isSelected
          ? "border-orange-500 ring-2 ring-orange-200"
          : "border-gray-200 hover:shadow-md"
        }
      `}
    >
      <div className="p-4">
        {/* Top row: Avatar + Name/Role + Rating + Hourly */}
        <div className="flex items-start gap-3.5">
          <div className="flex-shrink-0">
            <InterviewerAvatar interviewer={interviewer} size="xl" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-lg font-medium text-gray-900 truncate max-w-[220px] md:max-w-[280px] lg:max-w-[340px]">
                  {capitalizeFirstLetter(fullName)}
                </h3>

                {/* {currentRole && ( */}
                <p className="text-sm text-gray-500 mt-0.2">
                  {capitalizeFirstLetter(currentRole) || "Role not specified"}
                </p>
                {/* )} */}


              </div>

              {source === "internal-interview" ? null : (
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-yellow-100 p-1 rounded">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full">
                      <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {rating}
                    </span>
                  </div>

                  {/* Hourly Rate - right below rating */}
                  <span className="text-sm font-medium text-custom-blue">
                    {hourlyRate}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Introduction */}
        {/* {navigatedfrom === "internal-interview" ? null : (
          <div className="mt-3 ml-14">
            <div
              className={`text-sm text-gray-600 leading-relaxed ${
                isExpanded ? "" : "line-clamp-4"
              }`}
            >
              {capitalizeFirstLetter(introduction)}
            </div>
            {introduction.length > 140 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 text-xs text-custom-blue hover:text-custom-blue/80 flex items-center gap-1"
              >
                {isExpanded ? "Show less" : "Show more"}
                {isExpanded ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        )} */}

        <div className="mt-3">
          {source !== "internal-interview" ? null : (
            <div className="flex mt-1 items-center space-x-[2px] text-xs text-gray-500">
              <Mail size={14} className="text-black" />
              <span className="truncate">
                {interviewerEmail
                  ? interviewerEmail
                  : "Not specified"}
              </span>
            </div>
            // <p className="text-sm text-gray-500 mt-0.1">
            //   {interviewerEmail}
            // </p>
          )}
          <div className="flex mt-1 items-center space-x-[2px] text-xs text-gray-500">
            <Building size={14} className="text-black" />
            <span className="truncate">
              {companyName
                ? capitalizeFirstLetter(companyName)
                : "Not specified"}
            </span>
          </div>



          {source === "internal-interview" ? null : (
            <>

              <div
                ref={textRef}
                className={`text-sm text-gray-600 leading-relaxed ${isExpanded ? "" : "line-clamp-5"
                  }`}
              >
                {capitalizeFirstLetter(introduction)}
              </div>

              {/* Only show the button if the text is expanded OR if it was truncated/overflowing */}
              {(isOverflowing || isExpanded) && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="mt-1 text-sm text-custom-blue hover:text-custom-blue/80 flex items-center gap-1"
                >
                  {isExpanded ? "Show less" : "Show more"}
                  {isExpanded ? (
                    <ChevronUp className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
            </>
          )}
        </div>

        {/* Skills */}
        {/* <div className="mt-3 ml-14">
          {skillsArray.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skillsArray.slice(0, 3).map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                >
                  {typeof skill === "string"
                    ? skill
                    : skill?.skill || skill?.SkillName || "Skill"}
                </span>
              ))}
              {skillsArray.length > 3 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  +{skillsArray.length - 3} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No skills listed.</p>
          )}
        </div> */}
        <div className="mt-3">
          {skillsArray.length > 0 ? (
            <div
              ref={skillsRef}
              className="flex flex-wrap gap-1.5 max-h-[52px] overflow-hidden items-start"
            >
              {skillsArray.map((skill, i) => (
                <span
                  key={i}
                  className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 h-[22px] ${i >= visibleCount ? "hidden" : ""
                    }`}
                >
                  {typeof skill === "string"
                    ? skill
                    : skill?.skill || skill?.SkillName || "Skill"}
                </span>
              ))}

              {visibleCount < skillsArray.length && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 h-[22px]">
                  +{skillsArray.length - visibleCount} more
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-500 italic">No skills listed.</p>
          )}
        </div>

        {/* Availability Slots */}
        {source === "internal-interview" && (
          <div className="mt-4 group relative">
            {slotsInfo.hasSlots ? (
              <div className="rounded-lg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 p-3 hover:shadow-md hover:border-green-300 transition-all">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-sm">
                    <Clock size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-green-900">
                        {slotsInfo.totalSlots}{" "}
                        {slotsInfo.totalSlots === 1 ? "Slot" : "Slots"}
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500 text-white shadow-sm">
                        ● READY
                      </span>
                    </div>
                    <p className="text-xs text-green-700 mt-0.5 font-medium">
                      Available on {slotsInfo.count}{" "}
                      {slotsInfo.count === 1 ? "day" : "days"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {slotsInfo.days.map((day, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-green-700 border border-green-300 shadow-sm"
                        >
                          ✓ {day}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-gradient-to-br from-gray-50 to-slate-100 border-2 border-gray-200 p-3">
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 rounded-lg bg-gray-400 p-1.5">
                    <Clock size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-700">
                      No Availability Set
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Contact interviewer for scheduling
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Buttons - no full gray bar, just border-t like simple separator */}
      {/* Buttons section - with side gaps like internal UI */}
      {navigatedfrom !== "dashboard" && (
        <div className="border-t border-gray-100 mt-4 mx-4">
          <div className="py-3 flex justify-end items-center gap-2">
            {/* {source === "internal-interview" ? null : (
              <Button
                variant="outline"
                size="sm"
                onClick={onViewDetails}
                className="text-custom-blue hover:text-custom-blue/80"
              >
                <ExternalLink className="h-3 w-3 mr-1" /> View Details
              </Button>
            )} */}

            <Button
              variant={isSelected ? "destructive" : "customblue"}
              size="sm"
              onClick={onSelect}
            >
              {isSelected ? "Remove" : "Select"}
            </Button>
          </div>
        </div>
      )}
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
  source,
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
  const { data: walletBalance, refetch, isFetching: isWalletFetching } = useWallet();
  const navigate = useNavigate();
  //   const { contacts } = useCustomContext(); //<----v1.0.1-----
  //   console.log("contacts===", contacts);
  const contacts = matchedContact;
  //<----v1.0.1-----
  // console.log("interviewers===", interviewers);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  // const { data: walletBalance, refetch } = useWallet();



  // const pageType = "adminPortal";
  // const {
  //   // skills: skillsData,
  //   currentRoles,
  //   loadCurrentRoles,
  //   loadSkills,
  //   isCurrentRolesFetching,
  //   isSkillsFetching,
  // } = useMasterData({}, pageType);
  const [skillInput, setSkillInput] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const skillsPopupRef = useRef(null);
  const skillsInputRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [rateRange, setRateRange] = useState(["", ""]);
  const [appliedRateRange, setAppliedRateRange] = useState([0, Infinity]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [selectedInterviewersLocal, setSelectedInterviewersLocal] = useState(
    previousSelectedInterviewers || [],
  );
  const requestSentRef = useRef(false);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [baseInterviewers, setBaseInterviewers] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false); //<----v1.0.1-----
  // Compute available balance (balance - holdAmount) for gating outsourced selections
  const walletRawBalance = Number(walletBalance?.balance || 0);
  const walletHoldAmount = Number(walletBalance?.holdAmount || 0);
  const availableBalance = walletRawBalance;
  const [isOpen, setIsOpen] = useState(false);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(true);
  const [isRateApplied, setIsRateApplied] = useState(false);
  // const hasInitializedSkillsRef = useRef(false);
  // Initialize with parent skills - ONLY ONCE on mount
  const hasInitializedSkillsRef = useRef(false);
  const isResettingToParentState = useRef(false); // Add this line

  // Add this state to track if all filters should be applied
  // Auto-apply filter if parent passes skills or currentRole
  const [isFiltersApplied, setIsFiltersApplied] = useState(
    () => (skills?.length > 0)
  );
  //  || (currentRole && currentRole.trim() !== "")
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempSelectedSkills, setTempSelectedSkills] = useState([]);
  const [tempRateRange, setTempRateRange] = useState(["", ""]);
  // Add to existing state declarations
  // Initialize selectedRole and tempSelectedRole from parent currentRole
  // const [selectedRole, setSelectedRole] = useState(currentRole || "");
  // const [tempSelectedRole, setTempSelectedRole] = useState(currentRole || "");

  // console.log("selectedRole", selectedRole);

  // console.log("currentRole", currentRole);

  // console.log("currentRoles", currentRoles);
  // console.log("tempSelectedSkills", tempSelectedSkills);



  // Auto-refresh wallet balance on window focus
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch]);

  useEffect(() => {
    setSelectedInterviewersLocal(previousSelectedInterviewers || []);
  }, [previousSelectedInterviewers]);

  // Fetch tenant tax configuration (GST, service charge, etc.)
  const { data: tenantTaxConfig } = useTenantTaxConfig();
  const gstRate =
    typeof tenantTaxConfig?.gstRate === "number" ? tenantTaxConfig.gstRate : 0;

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
  // REPLACE WITH:
  // useEffect(() => {
  //   setSelectedRole("");
  //   setTempSelectedSkills([]);
  //   setTempRateRange(["", ""]);
  // }, []);

  // Add refs to track if initialization has happened
  // const hasInitializedRole = useRef(false);
  // const hasInitializedSkills = useRef(false);

  // Initialize with parent role - ONLY ONCE
  // useEffect(() => {
  //   if (currentRole && !hasInitializedRole.current) {
  //     setSelectedRole(currentRole);
  //     hasInitializedRole.current = true;
  //   }
  // }, [currentRole]);
  // Initialize with parent role
  // useEffect(() => {
  //   if (currentRole && currentRole.trim() !== "") {
  //     // setSelectedRole(currentRole);
  //     // setTempSelectedRole(currentRole);
  //   }
  // }, [currentRole]);



  // useEffect(() => {
  //   if (skills && Array.isArray(skills) && skills.length > 0 && !hasInitializedSkillsRef.current) {
  //     hasInitializedSkillsRef.current = true;
  //     const formattedSkills = skills.map((skill) => {
  //       const skillName = skill?.skill || skill?.SkillName || skill;
  //       return {
  //         SkillName: typeof skillName === 'string' ? skillName : String(skillName),
  //         fromParent: true,
  //       };
  //     });
  //     setTempSelectedSkills(formattedSkills);
  //   }
  // }, [skills]);


  useEffect(() => {
    if (isResettingToParentState.current) return;

    if (skills && Array.isArray(skills) && skills.length > 0 && !hasInitializedSkillsRef.current) {
      hasInitializedSkillsRef.current = true;
      const formattedSkills = skills.map((skill) => {
        const skillName = skill?.skill || skill?.SkillName || skill;
        return {
          SkillName: typeof skillName === 'string' ? skillName : String(skillName),
          fromParent: true,
        };
      });
      setTempSelectedSkills(formattedSkills);
      setIsFiltersApplied(true);
    }
  }, [skills]);

  // Fetch and filter interviewers based on skills and availability added by Ranjith
  useEffect(() => {
    const fetchInterviewers = async (
      skills,
      candidateExperience,
      currentRole,
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

        // console.log("skills in fetchInterviewers", response);

        if (!response || !Array.isArray(response)) {
          // console.log("❌ No interviewers data found");
          setBaseInterviewers([]);
          setFilteredInterviewers([]);
          return;
        }

        const externalInterviewers = response?.filter(
          (interviewer) => interviewer.type === "external",
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

        // ========== DASHBOARD FLOW - FILTER BY SKILLS ONLY ==========
        if (navigatedfrom === "dashboard") {
          // console.log(
          //   `📍 Navigated from DASHBOARD – using skill-based filtering only`
          // );

          let skillFilteredInterviewers = filteredByOwnerId;

          // Apply skill filtering only if skills are provided
          if (skills && Array.isArray(skills) && skills.length > 0) {
            // console.log("🔧 Applying skill filtering with skills:", skills);

            skillFilteredInterviewers = filteredByOwnerId.filter(
              (interviewer) => {
                const interviewerSkills = interviewer.contact?.skills || [];
                // console.log(
                //   `👤 Checking interviewer: ${
                //     interviewer.contact?.firstName ||
                //     interviewer.contact?.UserName ||
                //     "Unknown"
                //   }`,
                // );
                // console.log("📝 Interviewer's Skills:", interviewerSkills);

                if (interviewerSkills.length === 0) {
                  // console.log("❌ Interviewer has no skills, excluding");
                  return false;
                }

                // Convert all skills to lowercase for case-insensitive comparison
                const interviewerSkillsLower = interviewerSkills
                  .map((skill) =>
                    typeof skill === "string"
                      ? skill.toLowerCase()
                      : (skill?.skill || "").toLowerCase(),
                  )
                  .filter((skill) => skill); // Remove empty strings

                // console.log(
                //   "🔠 Interviewer's normalized skills:",
                //   interviewerSkillsLower,
                // );

                // Check if any of the required skills match the interviewer's skills
                const hasMatchingSkill = skills.some((requiredSkill) => {
                  // Get the skill name and convert to lowercase
                  const requiredSkillName = requiredSkill.skill?.toLowerCase();
                  if (!requiredSkillName) {
                    console.log(
                      "⚠️ Required skill has no name:",
                      requiredSkill,
                    );
                    return false;
                  }

                  const matchFound =
                    interviewerSkillsLower.includes(requiredSkillName);
                  if (matchFound) {
                    console.log(
                      `✅ Found matching skill: ${requiredSkillName}`,
                    );
                  }
                  return matchFound;
                });

                console.log(
                  `🎯 ${interviewer.contact?.firstName || "Unknown"
                  } Skill Match Status: ${hasMatchingSkill}`,
                );
                return hasMatchingSkill;
              },
            );
          } else {
            console.log(
              "ℹ️ No skills provided, showing all external interviewers",
            );
          }

          console.log("skillFilteredInterviewers", skillFilteredInterviewers)

          // Filter for approved interviewers
          const approvedInterviewers = skillFilteredInterviewers.filter(
            (interviewer) => interviewer.contact?.status === "approved",
          );

          console.log(
            "✅ Approved interviewers count:",
            approvedInterviewers.length,
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
                  timeSlot.startTime,
                );
                const availabilityEndMinutes = timeToMinutes(timeSlot.endTime);

                return (
                  startTimeMinutes >= availabilityStartMinutes &&
                  endTimeMinutes <= availabilityEndMinutes
                );
              });
            });
          },
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
          },
        );

        const nonTechMatchedInterviewers = availableInterviewers.filter(
          (interviewer) => {
            const interviewerTech = interviewer.contact?.currentRole
              ?.toLowerCase()
              ?.trim();
            const candidateTech = currentRole?.toLowerCase()?.trim();
            return interviewerTech !== candidateTech;
          },
        );

        console.log(
          "✅ Technology Matched Interviewers:",
          techMatchedInterviewers
        );
        console.log(
          "⚪ Non-Technology Interviewers:",
          nonTechMatchedInterviewers
        );

        // 🔍 Reusable function to calculate skill matches
        const calculateSkillMatches = (interviewersList, label) => {
          return interviewersList.map((interviewer, index) => {
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
                }),
            );

            // console.log("✅ Matching Skills Found:", matchingSkills);
            const matchCount = matchingSkills.length;
            // console.log("asdas", ...interviewer, "or", matchCount);

            return { ...interviewer, matchedSkills: matchCount };
          });
        };

        // 3️⃣ Apply skill matching for both groups
        const techMatchedWithSkills = calculateSkillMatches(
          techMatchedInterviewers,
          "Tech-Matched",
        );
        const nonTechMatchedWithSkills = calculateSkillMatches(
          nonTechMatchedInterviewers,
          "Non-Tech-Matched",
        );

        // 4️⃣ Keep only those with ≥1 skill match
        const techSkillFiltered = techMatchedWithSkills.filter(
          (i) => i.matchedSkills > 0,
        );
        const nonTechSkillFiltered = nonTechMatchedWithSkills.filter(
          (i) => i.matchedSkills > 0,
        );

        console.log("✅ Tech+Skill Matched Interviewers:", techSkillFiltered);
        console.log(
          "✅ Skill-Only Matched Interviewers:",
          nonTechSkillFiltered
        );

        // 5️⃣ Sort both lists by matched skill count (descending)
        const sortedTechSkillMatched = techSkillFiltered.sort(
          (a, b) => b.matchedSkills - a.matchedSkills,
        );
        // console.log("asdas sortedTechSkillMatched", sortedTechSkillMatched);
        const sortedSkillOnlyMatched = nonTechSkillFiltered.sort(
          (a, b) => b.matchedSkills - a.matchedSkills,
        );
        // console.log("asdas sortedSkillOnlyMatched", sortedSkillOnlyMatched);

        // 6️⃣ Merge both (tech+skill first, then skill-only)
        const combinedInterviewers = [

          ...sortedTechSkillMatched, // with skill match and current role
          ...techMatchedInterviewers, // without skill match only current role
          ...sortedSkillOnlyMatched, // with skill match only not current role
          ...nonTechMatchedInterviewers, // without skill match and not current role
        ];

        let approvedInterviewers;

        console.log("combinedInterviewers", combinedInterviewers)

        if (navigatedfrom === "mock-interview") {
          approvedInterviewers = combinedInterviewers.filter(
            (i) => i.contact?.status === "approved" && i?.contact?.isMockInterviewSelected === true,
          );

        } else {

          // 7️⃣ Filter only approved
          approvedInterviewers = combinedInterviewers.filter(
            (i) => i.contact?.status === "approved",
          );
        }
        // 8️⃣ Remove logged-in user
        const finalInterviewers = approvedInterviewers.filter(
          (i) => i.contact?._id?.toString() !== userId?.toString(),
        );

        // 🧠 Step: Filter by experience match (interviewer's experience >= candidate's experience)
        const experienceFiltered = approvedInterviewers.filter(
          (interviewer) => {
            const interviewerExp = parseFloat(
              interviewer.contact?.yearsOfExperience,
            );
            const candidateExp = parseFloat(candidateExperience);

            // Include interviewer only if their experience >= candidate experience
            const isEligible = interviewerExp >= candidateExp;

            return isEligible;
          },
        );
        // 9️⃣ Update state
        // setBaseInterviewers(experienceFiltered);
        // setFilteredInterviewers(experienceFiltered);

        // Replace with:
        const uniqueExperienceFiltered = [];
        const seenIds = new Set();

        experienceFiltered.forEach(interviewer => {
          if (!seenIds.has(interviewer._id)) {
            seenIds.add(interviewer._id);
            uniqueExperienceFiltered.push(interviewer);
          }
        });

        setBaseInterviewers(uniqueExperienceFiltered);
        setFilteredInterviewers(uniqueExperienceFiltered);

        // ========== REGULAR FLOW (with positionData) ========== }}
      } catch (error) {
        console.error("❌ Error processing interviewers:", error);
      }
    };

    fetchInterviewers(skills, candidateExperience, currentRole);
    requestSentRef.current = true;
  }, [
    skills,
    dateTime,
    currentRole,
    navigatedfrom,
    interviewers,
    candidateExperience,
    userId,
  ]);

  // Filter interviewers based on search term and applied rate range
  useEffect(() => {
    // No early return — always run when dependencies change

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
          rate = rates?.mid?.inr || rates?.junior?.inr || 0;
        else if (selectedLevel === "mid") rate = rates?.junior?.inr || 0;
      }
      return rate;
    };

    let filtered = [...baseInterviewers]; // always start fresh from base
    console.log("Applying filters with selectedRole:", filtered);
    // 1. Role filter — live
    // if (selectedRole) {
    //   filtered = filtered.filter((interviewer) => {
    //     const role =
    //       interviewer.contact?.currentRole ||
    //       interviewer.contact?.roleLabel ||
    //       interviewer.contact?.roleName ||
    //       interviewer.roleLabel ||
    //       interviewer.roleName ||
    //       "";

    //     console.log("selectedRole role", role);
    //     return role.toLowerCase() === selectedRole.toLowerCase();
    //   });
    // }

    // 2. Skills filter — live
    if (tempSelectedSkills.length > 0) {
      const selectedSkillsLower = tempSelectedSkills
        .map((s) => (s?.SkillName || s?.skill || s || "").toLowerCase().trim())
        .filter(Boolean);

      filtered = filtered
        .map((interviewer) => {
          const interviewerSkills = (interviewer.contact?.skills || [])
            .map((skill) =>
              typeof skill === "string"
                ? skill.toLowerCase().trim()
                : (skill?.skill || skill?.SkillName || "").toLowerCase().trim(),
            )
            .filter(Boolean);

          const matchCount = interviewerSkills.filter((s) =>
            selectedSkillsLower.includes(s),
          ).length;
          return { ...interviewer, matchCount };
        })
        .sort((a, b) => b.matchCount - a.matchCount); // best matches first
    }

    // 3. Rate range — only when explicitly applied
    if (isRateApplied) {
      filtered = filtered.filter((interviewer) => {
        const hourlyRate = getExperienceBasedRateValue(
          interviewer.contact,
          candidateExperience,
        );
        return (
          hourlyRate >= appliedRateRange[0] &&
          (appliedRateRange[1] === Infinity ||
            hourlyRate <= appliedRateRange[1])
        );
      });
    }

    setFilteredInterviewers(filtered);
  }, [
    baseInterviewers,
    // selectedRole,
    tempSelectedSkills,
    appliedRateRange,
    isRateApplied,
    candidateExperience,
  ]);

  // Modify the existing useEffect to only run when filters are applied
  // useEffect(() => {
  //   // if (!isFiltersApplied) return;
  //   // Don't filter on initial load - show all base interviewers
  //   if (
  //     !isFiltersApplied &&
  //     !selectedRole &&
  //     tempSelectedSkills.length === 0 &&
  //     !isRateApplied
  //   ) {
  //     setFilteredInterviewers(baseInterviewers);
  //     return;
  //   }

  //   const getExperienceBasedRateValue = (contact, experience) => {
  //     const rates = contact?.rates;
  //     if (!rates) return 0;
  //     let selectedLevel = null;
  //     if (experience >= 1 && experience <= 3) selectedLevel = "junior";
  //     else if (experience > 3 && experience <= 6) selectedLevel = "mid";
  //     else if (experience > 6) selectedLevel = "senior";
  //     let rate = rates[selectedLevel]?.inr || 0;
  //     if (rate === 0) {
  //       if (selectedLevel === "senior")
  //         rate = rates.mid?.inr || rates.junior?.inr || 0;
  //       else if (selectedLevel === "mid") rate = rates.junior?.inr || 0;
  //     }
  //     return rate;
  //   };

  //   let filtered = baseInterviewers;

  //   // ✅ ROLE FILTER (OUTSIDE of filter callback)
  //   if (selectedRole) {
  //     // Changed from tempSelectedRole
  //     filtered = filtered.filter((interviewer) => {
  //       const interviewerRole =
  //         interviewer.contact?.roleLabel ||
  //         interviewer.contact?.roleName ||
  //         interviewer.roleLabel ||
  //         interviewer.roleName ||
  //         "";

  //       return interviewerRole.toLowerCase() === selectedRole.toLowerCase(); // Changed from tempSelectedRole
  //     });
  //   }

  //   // Apply skill filtering if skills are selected
  //   if (tempSelectedSkills.length > 0) {
  //     const selectedSkillsLower = tempSelectedSkills
  //       .map((s) => {
  //         const skillName = s?.SkillName || s?.skill || s;
  //         return typeof skillName === "string"
  //           ? skillName.toLowerCase().trim()
  //           : "";
  //       })
  //       .filter(Boolean);

  //     filtered = baseInterviewers
  //       .map((interviewer) => {
  //         const interviewerSkills = (interviewer.contact?.skills || [])
  //           .map((skill) =>
  //             typeof skill === "string"
  //               ? skill
  //               : skill?.skill || skill?.SkillName || "",
  //           )
  //           .map((s) => s.toLowerCase().trim());

  //         const matchedCount = interviewerSkills.filter((skill) =>
  //           selectedSkillsLower.includes(skill),
  //         ).length;

  //         return { ...interviewer, matchedSkillsCount: matchedCount };
  //       })
  //       .sort((a, b) => b.matchedSkillsCount - a.matchedSkillsCount);
  //   }

  //   // Apply search and rate filtering
  //   filtered = filtered.filter((interviewer) => {
  //     const firstName = interviewer?.contact?.firstName ?? "";
  //     const lastName = interviewer?.contact?.lastName ?? "";
  //     const fullName = `${firstName} ${lastName}`.trim() || "Unnamed";
  //     const professionalTitle =
  //       interviewer?.contact?.professionalTitle ||
  //       interviewer?.contact?.CurrentRole ||
  //       "";
  //     const company = interviewer?.contact?.industry || "";
  //     const skills = interviewer?.contact?.skills || [];
  //     const hourlyRate = getExperienceBasedRateValue(
  //       interviewer.contact,
  //       candidateExperience,
  //     );

  //     const rateMatch =
  //       hourlyRate >= appliedRateRange[0] &&
  //       (appliedRateRange[1] === Infinity || hourlyRate <= appliedRateRange[1]);

  //     return rateMatch;
  //   });

  //   setFilteredInterviewers(filtered);
  // }, [
  //   baseInterviewers,
  //   selectedRole,
  //   tempSelectedSkills,
  //   appliedRateRange,
  //   isRateApplied,
  //   candidateExperience,
  //   isFiltersApplied,
  // ]);
  // useEffect(() => {
  //   if (!baseInterviewers.length) return;

  //   const getExperienceBasedRateValue = (contact, experience) => {
  //     const rates = contact?.rates;
  //     if (!rates) return 0;

  //     let selectedLevel = null;
  //     if (experience >= 1 && experience <= 3) selectedLevel = "junior";
  //     else if (experience > 3 && experience <= 6) selectedLevel = "mid";
  //     else if (experience > 6) selectedLevel = "senior";

  //     let rate = rates[selectedLevel]?.inr || 0;
  //     if (rate === 0) {
  //       if (selectedLevel === "senior") {
  //         rate = rates?.mid?.inr || rates?.junior?.inr || 0;
  //       } else if (selectedLevel === "mid") {
  //         rate = rates?.junior?.inr || 0;
  //       }
  //     }
  //     return rate;
  //   };

  //   let filtered = [...baseInterviewers];

  //   // 1. Apply search filter FIRST (this works independently)
  //   if (searchTerm.trim()) {
  //     const searchLower = searchTerm.toLowerCase().trim();
  //     filtered = filtered.filter((interviewer) => {
  //       const firstName = interviewer?.contact?.firstName || "";
  //       const lastName = interviewer?.contact?.lastName || "";
  //       const fullName = `${firstName} ${lastName}`.toLowerCase();

  //       // Check name match
  //       const nameMatch = fullName.includes(searchLower);
  //       if (nameMatch) return true;

  //       // Check role match
  //       // const role =
  //       //   // interviewer?.contact?.currentRole ||
  //       //   interviewer?.contact?.roleLabel ||
  //       //   interviewer?.contact?.roleName ||
  //       //   "";
  //       // if (role.toLowerCase().includes(searchLower)) return true;

  //       // Check company match
  //       const company = interviewer?.contact?.company || "N/A";
  //       if (company.toLowerCase().includes(searchLower)) return true;

  //       // Check skills match
  //       const skills = interviewer?.contact?.skills || [];
  //       const hasSkillMatch = skills.some((skill) => {
  //         const skillName =
  //           typeof skill === "string"
  //             ? skill.toLowerCase()
  //             : (skill?.skill || skill?.SkillName || "").toLowerCase();
  //         return skillName.includes(searchLower);
  //       });

  //       return hasSkillMatch;
  //     });
  //   }

  //   // 2. Apply rate filter (if rate filter is applied via Apply Filter button)
  //   if (isRateApplied) {
  //     filtered = filtered.filter((interviewer) => {
  //       const hourlyRate = getExperienceBasedRateValue(
  //         interviewer.contact,
  //         candidateExperience,
  //       );

  //       return (
  //         hourlyRate >= appliedRateRange[0] &&
  //         (appliedRateRange[1] === Infinity ||
  //           hourlyRate <= appliedRateRange[1])
  //       );
  //     });
  //   }

  //   // 3. Calculate match scores for sorting (role + skills)
  //   const scoredInterviewers = filtered.map((interviewer) => {
  //     let matchScore = 0;
  //     let isRoleMatch = false;
  //     let skillsMatchCount = 0;

  //     // Check role match
  //     // if (selectedRole) {
  //     //   const interviewerRole =
  //     //     interviewer?.contact?.currentRole ||
  //     //     interviewer?.contact?.roleLabel ||
  //     //     interviewer?.contact?.roleName ||
  //     //     "";

  //     //   isRoleMatch =
  //     //     interviewerRole.toLowerCase() === selectedRole.toLowerCase();
  //     //   if (isRoleMatch) matchScore += 100; // Higher weight for role match
  //     // }

  //     // Check skills match
  //     if (tempSelectedSkills.length > 0) {
  //       const selectedSkillsLower = tempSelectedSkills
  //         .map((s) => {
  //           const skillName = s?.SkillName || s?.skill || s;
  //           return typeof skillName === "string"
  //             ? skillName.toLowerCase().trim()
  //             : "";
  //         })
  //         .filter(Boolean);

  //       const interviewerSkills = (interviewer.contact?.skills || [])
  //         .map((skill) => {
  //           if (typeof skill === "string") return skill.toLowerCase().trim();
  //           return (skill?.skill || skill?.SkillName || "")
  //             .toLowerCase()
  //             .trim();
  //         })
  //         .filter(Boolean);

  //       skillsMatchCount = interviewerSkills.filter((skill) =>
  //         selectedSkillsLower.includes(skill),
  //       ).length;

  //       matchScore += skillsMatchCount * 10; // Weight for skill matches
  //     }

  //     return {
  //       ...interviewer,
  //       matchScore,
  //       // isRoleMatch,
  //       skillsMatchCount,
  //       hasAnyFilterMatch:
  //         skillsMatchCount > 0,
  //       // (selectedRole && isRoleMatch) || 
  //     };
  //   });

  //   // 4. Sort by: 1) Has any filter match, 2) Match score, 3) Original order
  //   scoredInterviewers.sort((a, b) => {
  //     // First, prioritize those that match ANY filter
  //     if (a.hasAnyFilterMatch && !b.hasAnyFilterMatch) return -1;
  //     if (!a.hasAnyFilterMatch && b.hasAnyFilterMatch) return 1;

  //     // If both match or both don't match, sort by match score
  //     if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;

  //     // If same score, maintain original order
  //     return 0;
  //   });
  //   // selectedRole ||
  //   // 5. When filters are applied, filter interviewers that match AT LEAST ONE criterion
  //   if (isFiltersApplied && (tempSelectedSkills.length > 0)) {
  //     // Filter to show interviewers matching AT LEAST ONE filter (OR logic)
  //     const matchingInterviewers = scoredInterviewers.filter((interviewer) => {
  //       let matchesRole = false;
  //       let matchesSkill = false;

  //       // Check role match
  //       // if (selectedRole) {
  //       //   const interviewerRole =
  //       //     interviewer?.contact?.currentRole ||
  //       //     interviewer?.contact?.roleLabel ||
  //       //     interviewer?.contact?.roleName ||
  //       //     "";
  //       //   matchesRole = interviewerRole.toLowerCase() === selectedRole.toLowerCase();
  //       // }

  //       // Check skill match
  //       if (tempSelectedSkills.length > 0) {
  //         matchesSkill = interviewer.skillsMatchCount > 0;
  //       }

  //       // Return true if matches role OR has matching skills (OR logic)
  //       // If only role is selected, must match role
  //       // If only skills selected, must have at least one skill match
  //       // If both selected, must match at least one
  //       // selectedRole && matchesRole ||
  //       if (tempSelectedSkills.length > 0) {
  //         return matchesSkill; // OR logic when both filters
  //       }
  //       // else if (selectedRole) {
  //       //   return matchesRole;
  //       // } 
  //       else if (tempSelectedSkills.length > 0) {
  //         return matchesSkill;
  //       }

  //       return true;
  //     });

  //     // Sort matching interviewers by best match first:
  //     // 1. Role + skills match (highest priority)
  //     // 2. More skills matched
  //     // 3. Role only match
  //     // 4. Fewer skills matched
  //     matchingInterviewers.sort((a, b) => {
  //       // const aMatchesRole = a.isRoleMatch ? 1 : 0;
  //       // const bMatchesRole = b.isRoleMatch ? 1 : 0;

  //       // Calculate total score: role match worth 100, each skill worth 10
  //       const aScore = (a.skillsMatchCount * 10); // (aMatchesRole * 100) + 
  //       const bScore = (b.skillsMatchCount * 10); // (bMatchesRole * 100) +

  //       return bScore - aScore; // Higher score first
  //     });

  //     setFilteredInterviewers(matchingInterviewers);
  //   } else {
  //     // No filters applied, show all (still sorted by search if applicable)
  //     setFilteredInterviewers(scoredInterviewers);
  //   }
  // }, [
  //   baseInterviewers,
  //   searchTerm,
  //   // selectedRole,
  //   tempSelectedSkills,
  //   appliedRateRange,
  //   isRateApplied,
  //   isFiltersApplied,
  //   candidateExperience,
  // ]);

  // Update the useEffect that handles filtering to work immediately with skill selections
  useEffect(() => {
    if (!baseInterviewers.length) return;

    const getExperienceBasedRateValue = (contact, experience) => {
      const rates = contact?.rates;
      if (!rates) return 0;

      let selectedLevel = null;
      if (experience >= 1 && experience <= 3) selectedLevel = "junior";
      else if (experience > 3 && experience <= 6) selectedLevel = "mid";
      else if (experience > 6) selectedLevel = "senior";

      let rate = rates[selectedLevel]?.inr || 0;
      if (rate === 0) {
        if (selectedLevel === "senior") {
          rate = rates?.mid?.inr || rates?.junior?.inr || 0;
        } else if (selectedLevel === "mid") {
          rate = rates?.junior?.inr || 0;
        }
      }
      return rate;
    };

    let filtered = [...baseInterviewers];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((interviewer) => {
        const firstName = interviewer?.contact?.firstName || "";
        const lastName = interviewer?.contact?.lastName || "";
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        const nameMatch = fullName.includes(searchLower);
        if (nameMatch) return true;

        const company = interviewer?.contact?.company || "N/A";
        if (company.toLowerCase().includes(searchLower)) return true;

        const skills = interviewer?.contact?.skills || [];
        const hasSkillMatch = skills.some((skill) => {
          const skillName =
            typeof skill === "string"
              ? skill.toLowerCase()
              : (skill?.skill || skill?.SkillName || "").toLowerCase();
          return skillName.includes(searchLower);
        });

        return hasSkillMatch;
      });
    }

    // Apply rate filter
    if (isRateApplied) {
      filtered = filtered.filter((interviewer) => {
        const hourlyRate = getExperienceBasedRateValue(
          interviewer.contact,
          candidateExperience,
        );
        return (
          hourlyRate >= appliedRateRange[0] &&
          (appliedRateRange[1] === Infinity ||
            hourlyRate <= appliedRateRange[1])
        );
      });
    }

    // Calculate match scores for sorting
    const scoredInterviewers = filtered.map((interviewer) => {
      let matchScore = 0;
      let skillsMatchCount = 0;

      // Check skills match
      if (tempSelectedSkills.length > 0) {
        const selectedSkillsLower = tempSelectedSkills
          .map((s) => {
            const skillName = s?.SkillName || s?.skill || s;
            return typeof skillName === "string"
              ? skillName.toLowerCase().trim()
              : "";
          })
          .filter(Boolean);

        const interviewerSkills = (interviewer.contact?.skills || [])
          .map((skill) => {
            if (typeof skill === "string") return skill.toLowerCase().trim();
            return (skill?.skill || skill?.SkillName || "")
              .toLowerCase()
              .trim();
          })
          .filter(Boolean);

        skillsMatchCount = interviewerSkills.filter((skill) =>
          selectedSkillsLower.includes(skill),
        ).length;

        matchScore += skillsMatchCount * 10;
      }

      return {
        ...interviewer,
        matchScore,
        skillsMatchCount,
        hasAnyFilterMatch: skillsMatchCount > 0,
      };
    });

    // Sort by match score
    scoredInterviewers.sort((a, b) => {
      if (a.hasAnyFilterMatch && !b.hasAnyFilterMatch) return -1;
      if (!a.hasAnyFilterMatch && b.hasAnyFilterMatch) return 1;
      if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
      return 0;
    });

    // Apply skill filter when skills are selected
    if (isFiltersApplied && tempSelectedSkills.length > 0) {
      const matchingInterviewers = scoredInterviewers.filter((interviewer) => {
        return interviewer.skillsMatchCount > 0;
      });

      matchingInterviewers.sort((a, b) => {
        const aScore = (a.skillsMatchCount * 10);
        const bScore = (b.skillsMatchCount * 10);
        return bScore - aScore;
      });

      setFilteredInterviewers(matchingInterviewers);
    } else {
      setFilteredInterviewers(scoredInterviewers);
    }
  }, [
    baseInterviewers,
    searchTerm,
    tempSelectedSkills,
    appliedRateRange,
    isRateApplied,
    isFiltersApplied,
    candidateExperience,
  ]);

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

  // console.log("Selected Interviewers:", selectedInterviewersLocal);

  const handleProceed = () => {
    //<----v1.0.1-----
    //<-----v1.0.4-----Venkatesh---- Updated to calculate required amount based on experience level
    //<-----v1.0.5-----Fix: Calculate maxHourlyRate from selected interviewers only, not all contacts

    // Calculate the required amount based on selected interviewers' rates and experience level
    let baseRequiredAmount = 0;

    if (selectedInterviewersLocal.length > 0) {
      // Calculate rates from ONLY the selected interviewers
      const selectedRates = selectedInterviewersLocal.map((interviewer) => {
        const contact = interviewer?.contact;
        console.log("Contact:", contact?.yearsOfExperience);
        if (!contact?.rates) return 0;

        let experienceLevel;
        // For regular interviews, map candidate experience to level
        const expYears = Number(candidateExperience) || 0;
        experienceLevel =
          expYears <= 3 ? "junior" : expYears <= 7 ? "mid" : "senior";

        if (contact.rates[experienceLevel]?.inr > 0) {
          return contact.rates[experienceLevel]?.inr;
        } else {
          return 0;
        }
      });

      // Use the highest rate among selected interviewers ONLY
      baseRequiredAmount = Math.max(...selectedRates, 0);
      console.log("Selected Rates:", selectedRates);
      console.log("Max Rate from Selected Interviewers:", baseRequiredAmount);
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

    console.log(
      "Required Amount with GST:",
      grossRequiredAmount,
      "(GST rate:",
      gstRate,
      ")",
    );

    // && grossRequiredAmount !== 0
    if (availableBalance >= grossRequiredAmount && grossRequiredAmount !== 0) {
      // console.log("Selected Interviewers:", selectedInterviewersLocal);
      // Pass maxHourlyRate (from selected interviewers) up so backend can create a selection-time hold
      onProceed(selectedInterviewersLocal, baseRequiredAmount || 0);
      onClose();
    } else {
      const required = Number(grossRequiredAmount || 0).toFixed(2);
      //const currentBalance = Number(availableBalance || 0).toFixed(2);
      notify.error(
        `Your available wallet balance is less than the highest interviewer hourly rate (including GST).\nRequired: ₹${required}\nPlease add funds to proceed.`,
        { autoClose: 60000 },
      );
      // setTimeout(() => setShowWalletModal(true), 1000); // Removed auto-open in favor of manual Top Up button
    }
    //----v1.0.1----->
    //-----v1.0.4-----Venkatesh---->
  };

  const handleClearRateFilter = () => {
    // Clear all temporary states
    setTempSearchTerm("");
    setSearchTerm("");
    setTempRateRange(["", ""]);
    setRateRange(["", ""]);
    setAppliedRateRange([0, Infinity]);

    // Reset filter states
    setIsFiltersApplied(false);
    setIsRateApplied(false);

    // Set flag that we're resetting to parent state
    isResettingToParentState.current = true;

    // Clear current selections
    setTempSelectedSkills([]);

    // After state updates, re-apply parent skills
    setTimeout(() => {
      if (skills && Array.isArray(skills) && skills.length > 0) {
        const formattedSkills = skills.map((skill) => {
          const skillName = skill?.skill || skill?.SkillName || skill;
          return {
            SkillName: typeof skillName === 'string' ? skillName : String(skillName),
            fromParent: true,
          };
        });
        setTempSelectedSkills(formattedSkills);
        setIsFiltersApplied(true);

        setTimeout(() => {
          isResettingToParentState.current = false;
        }, 100);
      } else {
        isResettingToParentState.current = false;
      }
    }, 0);
  };

  // const handleApplyRateFilter = () => {
  //   const minVal = parseInt(rateRange[0]) || 0;
  //   const maxVal = parseInt(rateRange[1]) || Infinity;

  //   setAppliedRateRange([minVal, maxVal]);

  //   // If min is empty, visually show 0
  //   setRateRange([rateRange[0] === "" ? "0" : rateRange[0], rateRange[1]]);

  //   // ✅ Change button to "Clear"
  //   setIsRateApplied(true);
  // };

  // const handleClearRateFilter = () => {
  //   // ✅ Reset everything
  //   setRateRange(["", ""]);
  //   setAppliedRateRange([0, Infinity]);
  //   setIsRateApplied(false);
  // };

  // Function to handle applying all filters
  const handleApplyRateFilter = () => {
    // Apply role filter - store it in selectedRole for actual filtering
    // setSelectedRole(tempSelectedRole);

    // DO NOT merge parent skills - only use what user has selected in tempSelectedSkills
    // Parent skills are already cleared when user clicks "Clear Filter"
    // tempSelectedSkills now only contains user-selected skills

    // Apply rate range
    const minVal = parseInt(tempRateRange[0]) || 0;
    const maxVal = parseInt(tempRateRange[1]) || Infinity;
    setRateRange([
      tempRateRange[0] === "" ? "0" : tempRateRange[0],
      tempRateRange[1],
    ]);
    setAppliedRateRange([minVal, maxVal]);

    // Mark filters as applied
    setIsFiltersApplied(true);
    setIsRateApplied(true);
  };

  // Function to clear all filters
  // const handleClearRateFilter = () => {
  //   // Clear role - completely reset (not restoring parent values)
  //   // setSelectedRole("");
  //   // setTempSelectedRole("");

  //   // Clear search
  //   setTempSearchTerm("");
  //   setSearchTerm("");

  //   // Clear skills - completely reset
  //   setTempSelectedSkills([]);

  //   // Reset the initialization ref so skills won't be re-initialized from parent
  //   hasInitializedSkillsRef.current = true; // Keep true to prevent re-init from parent

  //   // Clear rate range
  //   setTempRateRange(["", ""]);
  //   setRateRange(["", ""]);
  //   setAppliedRateRange([0, Infinity]);

  //   // Reset filter states
  //   setIsFiltersApplied(false);
  //   setIsRateApplied(false);

  //   // Reset filtered interviewers to base interviewers (show all)
  //   setFilteredInterviewers(baseInterviewers);
  // };

  // const handleAddSkill = () => {
  //   const value = skillInput.trim();

  //   if (!value) return;

  //   setTempSelectedSkills((prev) => {
  //     // prevent duplicates (case-insensitive)
  //     if (prev.some((s) => s.toLowerCase() === value.toLowerCase())) {
  //       return prev;
  //     }

  //     return [...prev, value];
  //   });

  //   setSkillInput("");
  // };

  // console.log("currentRoles===", currentRoles);

  console.log("skills...", skills);
  // console.log("skillsData...", skillsData);

  console.log("filteredInterviewers", filteredInterviewers);

  return (
    <>
      <Toaster />
      {/* v1.0.2 <-------------------------------------------------------------------------- */}
      <SidebarPopup
        // title="Outsourced Interviewers"
        title={
          <div>
            <h4 className="flex items-center sm:text-sm text-xl gap-2 font-semibold text-custom-blue">
              <Users className="h-5 w-5" />
              Outsourced Interviewer
            </h4>
            <p className="text-sm text-gray-500">
              Select from external interview experts
            </p>
          </div>
        }
        onClose={onClose}
        setIsFullscreen={setIsFullscreen}
        titleRightEnd={
          navigatedfrom !== "dashboard" ? (
            <div className="flex items-center gap-3 bg-muted/50 rounded-lg px-2 py-1 sm:ml-0 ml-9">
              <div className="flex items-center gap-2">
                <Wallet className="h-3 w-4 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">
                    Wallet Balance
                  </p>
                  <p className="text-sm font-bold text-custom-blue">
                    ₹{Number(availableBalance || 0).toFixed(2)}
                  </p>
                </div>

              </div>


              {/* Reload Wallet Balance Button */}
              <button
                onClick={() => refetch()}
                className={`p-1 rounded-full hover:bg-gray-200 transition-colors ${isWalletFetching ? "animate-spin" : ""}`}
                title="Refresh Balance"
              >
                <RefreshCw className="h-4 w-4 text-custom-blue" />
              </button>

              <Button
                // onClick={() => setShowWalletModal(true)}
                // onClick={() => window.open("/wallet-topup", "_blank")}
                // onClick={() => navigate("/wallet-topup", { state: { mode: "outsource" } })}
                onClick={() => window.open("/wallet-topup", "_blank")}
                size="sm"
                variant="outline"
                className="gap-1 text-sm"
              >
                <ExternalLink className="h-3 w-3 ml-1 opacity-70" />

                Top Up
              </Button>
            </div>
          ) : null
        }
        width={60}
      >
        {/* v1.0.3 <------------------------- */}
        <div className="pb-16">
          {/* v1.0.3 -------------------------> */}
          {/* Fixed Search and Info Section */}
          {/* <------------------------------- v1.0.0  */}
          <div className="sm:px-2 py-4 bg-white z-10">
            {navigatedfrom !== "dashboard" && (
              <>
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
                            First interviewer to accept will conduct the
                            interview
                          </li>
                          <li>
                            Select multiple interviewers to increase
                            availability
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full flex  justify-between items-center mt-4">
                  <div className="flex items-center gap-6 w-full">
                    {/* <div className="flex w-full items-center gap-2 bg-gray-50 px-3 py-1 rounded-md border border-gray-200">
                      <span className="text-sm font-medium text-gray-600">
                        Available Balance:
                      </span>
                      <span
                        className={`text-sm font-bold ${
                          availableBalance >= maxHourlyRate
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{Number(availableBalance || 0).toFixed(2)}
                      </span>
                      <button
                        onClick={() => setShowWalletModal(true)}
                        className="text-xs bg-custom-blue text-white px-2.5 py-1 rounded hover:bg-custom-blue/90 transition-colors font-medium"
                      >
                        Top Up
                      </button>
                    </div> */}

                    <div className="w-full mr-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search by name, company..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    className="cursor-pointer px-3 py-2 text-xl border rounded-md relative flex items-center justify-center w-10 h-10"
                    onClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
                  >
                    {isFilterPopupOpen ? (
                      <div className="relative">
                        <LuFilterX className="cursor-pointer" />
                        <ChevronUp className="absolute -bottom-8  right-0.5 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50 " />
                      </div>
                    ) : (
                      <LuFilter className="cursor-pointer" />
                    )}
                  </button>
                </div>

                {isFilterPopupOpen && (
                  <div className="border mt-3 border-gray-200 rounded-sm p-3 bg-white shadow-sm">
                    <div className="grid items-center gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12">
                      {/* <div className="md:col-span-4 lg:col-span-4 xl:col-span-5 2xl:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Filter by Role
                        </label>
                        <DropdownWithSearchField
                          value={
                            (tempSelectedRole || selectedRole)
                              ? { value: tempSelectedRole || selectedRole, label: tempSelectedRole || selectedRole }
                              : null
                          }
                          menuIsOpen={isFiltersApplied ? false : undefined}
                          options={(() => {
                            // Build options from currentRoles
                            const baseOptions = currentRoles?.map((role) => ({
                              value: role.roleName,
                              label: role.roleLabel || role.roleName,
                            })) || [];

                            // Add parent role to options if not already present
                            const currentVal = tempSelectedRole || selectedRole;
                            if (currentVal && !baseOptions.some(opt => opt.value === currentVal)) {
                              baseOptions.unshift({ value: currentVal, label: currentVal });
                            }

                            return baseOptions;
                          })()}
                          onChange={(selected) => {
                            if (isFiltersApplied) return; // Prevent changes when filters applied
                            let newValue = "";

                            if (selected === null || selected === undefined) {
                              newValue = "";
                            } else if (selected?.target?.value !== undefined) {
                              newValue = selected.target.value;
                            } else if (typeof selected === "string") {
                              newValue = selected;
                            } else if (selected && "value" in selected) {
                              newValue = selected.value;
                            } else if (selected?.value) {
                              newValue = selected.value;
                            }
                            console.log("selected in newValue===", newValue);
                            setTempSelectedRole(newValue);
                            setSelectedRole(newValue); // Also update selectedRole for immediate filtering
                          }}
                          onMenuOpen={() => {
                            if (isFiltersApplied) return; // Don't open menu when filters applied
                            loadCurrentRoles();
                          }}
                          loading={isCurrentRolesFetching}
                          placeholder="Select role"
                          isClearable={!isFiltersApplied}
                        />
                      </div> */}
                      <div className="md:col-span-4 lg:col-span-4 xl:col-span-5 2xl:col-span-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Filter by Skills
                        </label>

                        <DropdownWithSearchField
                          ref={skillsInputRef}
                          value={null}
                          options={
                            skills
                              ?.map((skill) => {
                                if (typeof skill === "string") {
                                  return { SkillName: skill };
                                }
                                if (skill?.skill) {
                                  return { SkillName: skill.skill };
                                }
                                if (skill?.SkillName) {
                                  return { SkillName: skill.SkillName };
                                }
                                return null;
                              })
                              ?.filter(Boolean)
                              ?.filter(
                                (skill) =>
                                  !tempSelectedSkills.some(
                                    (s) =>
                                      (s.SkillName || s.skill || s)
                                        ?.toLowerCase()
                                      === skill.SkillName?.toLowerCase(),
                                  ),
                              )
                              ?.map((skill) => ({
                                value: skill.SkillName,
                                label: skill.SkillName,
                              })) || []
                          }
                          onChange={(option) => {
                            if (!option) return;

                            const value = option?.value || option?.target?.value;
                            if (!value) return;

                            setTempSelectedSkills((prev) => {
                              const existingSkill = prev.find((s) => {
                                const sName = (
                                  s?.SkillName ||
                                  s?.skill ||
                                  s
                                ).toLowerCase();
                                return sName === value.toLowerCase();
                              });

                              if (existingSkill) return prev;

                              const newSkills = [
                                ...prev,
                                { SkillName: value, fromParent: false },
                              ];

                              // Auto-apply filter when skill is added
                              setIsFiltersApplied(true);
                              return newSkills;
                            });
                          }}
                          onMenuOpen={() => {
                            if (isFiltersApplied) return;
                          }}
                          placeholder="Filter by skills"
                        />




                        {/* <DropdownWithSearchField
                          ref={skillsInputRef}
                          value={null}
                          menuIsOpen={isFiltersApplied ? false : undefined}
                          options={
                            skills
                              ?.map((skill) => {
                                // Handle string format
                                if (typeof skill === "string") {
                                  return { SkillName: skill };
                                }

                                // Handle object format (skill.skill)
                                if (skill?.skill) {
                                  return { SkillName: skill.skill };
                                }

                                // Handle object format (SkillName already present)
                                if (skill?.SkillName) {
                                  return { SkillName: skill.SkillName };
                                }

                                return null;
                              })
                              ?.filter(Boolean)
                              ?.filter(
                                (skill) =>
                                  !tempSelectedSkills.some(
                                    (s) =>
                                      (s.SkillName || s.skill || s)
                                        ?.toLowerCase()
                                      === skill.SkillName?.toLowerCase(),
                                  ),
                              )
                              ?.map((skill) => ({
                                value: skill.SkillName,
                                label: skill.SkillName,
                              })) || []
                          }

                          onChange={(option) => {
                            if (isFiltersApplied) return; // Prevent changes when filters applied
                            if (!option) return;

                            const value =
                              option?.value || option?.target?.value;
                            if (!value) return;

                            setTempSelectedSkills((prev) => {
                              // Prevent duplicates (case-insensitive)
                              const existingSkill = prev.find((s) => {
                                const sName = (
                                  s?.SkillName ||
                                  s?.skill ||
                                  s
                                ).toLowerCase();
                                return sName === value.toLowerCase();
                              });

                              if (existingSkill) return prev;

                              // Add new user-selected skill
                              return [
                                ...prev,
                                { SkillName: value, fromParent: false },
                              ];
                            });
                          }}
                          onMenuOpen={() => {
                            if (isFiltersApplied) return; // Don't open menu when filters applied
                            // loadSkills();
                          }}
                          // loading={isSkillsFetching}
                          placeholder="Filter by skills"
                        /> */}
                      </div>

                      {/* Parent Skills Reset Button */}
                      {skills && skills.length > 0 && (
                        <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-2 flex items-end mt-6">
                          <button
                            onClick={() => {
                              // Clear current selections
                              setTempSelectedSkills([]);

                              // Apply parent skills
                              const formattedSkills = skills.map((skill) => {
                                const skillName = skill?.skill || skill?.SkillName || skill;
                                return {
                                  SkillName: typeof skillName === 'string' ? skillName : String(skillName),
                                  fromParent: true,
                                };
                              });

                              setTempSelectedSkills(formattedSkills);
                              setIsFiltersApplied(true);

                              // Reset initialization ref to prevent duplicate
                              hasInitializedSkillsRef.current = true;
                            }}
                            className="w-full h-10 px-4 text-sm rounded-md bg-custom-blue px-4 py-2 hover:bg-custom-blue/90 rounded-md text-white  text-white  duration-200 flex items-center justify-center whitespace-nowrap gap-2"
                          >
                            <RefreshCw className="h-4 w-4" />
                            Reset  Skills
                          </button>
                        </div>
                      )}

                      {/* <div className="md:col-span-2 lg:col-span-2 xl:col-span-2 2xl:col-span-3 flex items-end mt-6"> */}
                      {/* <button
                        className={`w-full md:col-span-2 items-center mt-6 lg:col-span-2 xl:col-span-2 2xl:col-span-2 h-10 px-4 text-sm rounded-md  duration-200 flex items-center justify-center whitespace-nowrap
                            ${isFiltersApplied
                            ? "bg-red-100 text-red-700 border border-red-200 hover:bg-red-200"
                            : "bg-custom-blue text-white hover:bg-custom-blue/90"
                          }`}
                        onClick={
                          isFiltersApplied
                            ? handleClearRateFilter
                            : handleApplyRateFilter
                        }
                      >
                        {isFiltersApplied ? "Clear Filter" : "Apply Filter"}
                      </button> */}
                      {/* </div> */}
                      {/* Hourly Rate Range */}
                      {/* <div className="md:col-span-1 lg:col-span-1">
                        <div className="flex flex-col h-full"> */}
                      {/* <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Hourly Rate Range ($)
                          </label> */}
                      {/* <div className="flex flex-col sm:flex-row items-stretch gap-3 flex-1">
                            <div className="flex items-center gap-2 flex-1"> */}
                      {/* Min Input */}
                      {/* <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={tempRateRange[0]}
                                  onChange={(e) =>
                                    setTempRateRange([
                                      e.target.value,
                                      tempRateRange[1],
                                    ])
                                  }
                                  // value={rateRange[0]}
                                  // onChange={(e) =>
                                  //   setRateRange([e.target.value, rateRange[1]])
                                  // }
                                  className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
                                  placeholder="Min"
                                  min="0"
                                  step="1"
                                />
                              </div> */}
                      {/* <span className="text-gray-400 font-medium shrink-0">
                                —
                              </span> */}
                      {/* Max Input */}
                      {/* <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  $
                                </span>
                                <input
                                  type="number"
                                  value={tempRateRange[1]}
                                  onChange={(e) =>
                                    setTempRateRange([
                                      tempRateRange[0],
                                      e.target.value,
                                    ])
                                  }
                                  // value={rateRange[1]}
                                  // onChange={(e) =>
                                  //   setRateRange([rateRange[0], e.target.value])
                                  // }
                                  className="w-full pl-8 pr-3 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-400"
                                  placeholder="Max"
                                  min="0"
                                  step="1"
                                />
                              </div> */}
                      {/* Dynamic Button */}
                      {/* </div>
                          </div> */}
                      {/* </div>
                      </div> */}






                    </div>


                    {/* Selected Skills */}
                    {tempSelectedSkills.length > 0 && (
                      <div className="flex mt-4 flex-wrap items-center gap-1.5">
                        <span className="text-xs text-gray-500 mr-1">
                          Skills:
                        </span>

                        {tempSelectedSkills.map((skill) => {
                          const skillName =
                            skill?.SkillName || skill?.skill || skill;

                          return (
                            <span
                              key={skillName}
                              className="flex items-center gap-1 rounded-full bg-gray-100 border px-2.5 py-1 text-xs text-gray-800"
                            >
                              {skillName}
                              <button
                                onClick={() => {
                                  setTempSelectedSkills((prev) =>
                                    prev.filter((s) => {
                                      const sName =
                                        s?.SkillName || s?.skill || s;
                                      const currentSkillName =
                                        skill?.SkillName ||
                                        skill?.skill ||
                                        skill;
                                      return sName !== currentSkillName;
                                    }),
                                  );

                                  // Clear filters if no skills remain
                                  if (tempSelectedSkills.length === 1) {
                                    setIsFiltersApplied(false);
                                    setFilteredInterviewers(baseInterviewers);
                                  }
                                }}
                                className="ml-1 text-gray-500 hover:text-red-500"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}



                    {/* Selected Skills */}
                    {/* {tempSelectedSkills.length > 0 && (
                      <div className="flex mt-4 flex-wrap items-center gap-1.5">
                        <span className="text-xs text-gray-500 mr-1">
                          Skills:
                        </span>

                        {tempSelectedSkills.map((skill) => {
                          // Extract skill name from either object or string
                          const skillName =
                            skill?.SkillName || skill?.skill || skill;

                          return (
                            <span
                              key={skillName}
                              className="flex items-center gap-1 rounded-full bg-gray-100 border px-2.5 py-1 text-xs text-gray-800"
                            >
                              {skillName}

                              <button
                                disabled={isFiltersApplied}
                                onClick={() => {
                                  if (isFiltersApplied) return;
                                  // Remove this specific skill
                                  setTempSelectedSkills((prev) =>
                                    prev.filter((s) => {
                                      const sName =
                                        s?.SkillName || s?.skill || s;
                                      const currentSkillName =
                                        skill?.SkillName ||
                                        skill?.skill ||
                                        skill;
                                      return sName !== currentSkillName;
                                    }),
                                  );
                                }}
                                className={`ml-1 ${isFiltersApplied ? "opacity-50 cursor-not-allowed text-gray-400" : "text-gray-500 hover:text-red-500"}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                             
                            </span>
                          );
                        })}
                      </div>
                    )} */}

                    {/* Show selected role */}
                    {/* {tempSelectedRole && (
                      <div className="flex mt-4 flex-wrap items-center gap-1.5">
                        <span className="text-xs text-gray-500 mr-1">
                          Role:
                        </span>
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 border px-2.5 py-1 text-xs text-blue-800">
                          {currentRoles?.find(
                            (r) => r.roleName === tempSelectedRole,
                          )?.roleLabel || tempSelectedRole}
                          <button
                            onClick={() => {
                              // Allow removal of ANY role (parent or user-selected)
                              setSelectedRole("");
                              setTempSelectedRole("");
                            }}
                            className="ml-1 text-blue-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>

                        </span>
                      </div>
                    )} */}
                  </div>
                )}
              </>
            )}

            {/* <div className="flex flex-row items-center  justify-between mt-4 gap-4">
              <div className="w-[30%] mt-5">
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

           
              <div className=" w-[40px]  sm:w-auto" ref={skillsPopupRef}>
                <DropdownWithSearchField
                  ref={skillsInputRef}
                  value={null}
                  options={
                    skillsData
                      ?.filter(
                        (skill) =>
                          !selectedSkills.some(
                            (s) => s.SkillName === skill.SkillName,
                          ),
                      )
                      .map((skill) => ({
                        value: skill.SkillName,
                        label: skill.SkillName,
                      })) || []
                  }
                  onChange={(option) => {
                    if (!option) return;

                    const value = option?.value || option?.target?.value;
                    if (!value) return;

                    setSelectedSkills((prev) => {
                      // prevent duplicates
                      if (prev.some((s) => s.SkillName === value)) return prev;
                      return [...prev, { SkillName: value }];
                    });
                  }}
                  onMenuOpen={loadSkills}
                  loading={isSkillsFetching}
                  placeholder="Add skill"
                />
              </div>

              <div className="flex flex-col w-full">
                <label className="flex text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Hourly Rate Range
                </label>

                <div className="flex justify-between">
                  <div className="flex items-center space-x-1.5 w-2/3">
              
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
            </div> */}
          </div>

          {/* v1.0.3 <--------------------------------------------------------------------- */}
          <div className="flex flex-col overflow-y-auto py-4 sm:px-2 min-h-full">
            <div
              className={`
                grid gap-4 sm:gap-5 px-1 sm:px-2
                ${isFullscreen
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                  : "grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1"
                }
              `}
            >
              {filteredInterviewers.map((interviewer) => (
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

          {navigatedfrom !== "dashboard" && (
            // <div className="flex justify-end mt-5 mr-6">
            <div className="fixed bottom-0 left-0 right-4   py-4 px-6">
              <div className="flex justify-end">
                <button
                  onClick={handleProceed}
                  disabled={selectedInterviewersLocal.length === 0}
                  className="bg-custom-blue px-4 py-2 rounded-md text-white hover:bg-custom-blue/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Proceed ({selectedInterviewersLocal.length})
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

      {/* {showWalletModal && (
        <WalletTopupPopup
        // /wallet-topup
        onClose={() => setShowWalletModal(false)}
          onTopup={handleTopup}
        />
      )} */}
    </>
  );
}

export default OutsourcedInterviewerModal;
