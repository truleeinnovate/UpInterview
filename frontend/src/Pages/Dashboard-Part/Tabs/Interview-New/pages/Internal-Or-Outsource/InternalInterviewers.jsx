// v1.0.0  -  Ashraf  -  fixed internal interviews get based on tenantid,border-b removed for header
// v1.0.1  -  Ashok   -  Improved responsiveness added common popup
// v1.0.2  -  Ashok   -  fixed z-index and alignment issues
// v1.0.3  -  Ashok   -  fixed responsiveness style issues in form
// v1.0.4  -  Ashok   -  fixed alignment issues

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown, Clock, ChevronUp, Users } from "lucide-react";
// import useInterviewers from "../../../../../../hooks/useInterviewers";
// v1.0.1 <------------------------------------------------------------
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import {
  // useGroupsQuery,
  useTeamsQuery,
} from "../../../../../../apiHooks/useInterviewerGroups.js";
// v1.0.1 ------------------------------------------------------------>
import { capitalizeFirstLetter } from "../../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { useScrollLock } from "../../../../../../apiHooks/scrollHook/useScrollLock.js";
import {
  useAllInterviewers,
  useInterviewerTags,
} from "../../../../../../apiHooks/useInterviewers.js";
// import { InterviewerCard } from "../../../Interviewers/Interviewers.jsx";
import { useMasterData } from "../../../../../../apiHooks/useMasterData.js";
import DropdownWithSearchField from "../../../../../../Components/FormFields/DropdownWithSearchField.jsx";
// import { Button } from "../../../CommonCode-AllTabs/ui/button.jsx";
import InterviewerAvatar from "../../../CommonCode-AllTabs/InterviewerAvatar.jsx";
import { ReactComponent as LuFilterX } from "../../../../../../icons/LuFilterX.svg";
import { ReactComponent as LuFilter } from "../../../../../../icons/LuFilter.svg";
import { OutsourcedInterviewerCard } from "./OutsourceInterviewer.jsx";

const InterviewerCard = ({
  interviewer,
  isSelected,
  onSelect,
  onViewDetails,
  navigatedfrom,
  candidateExperience,
}) => {
  // const [isExpanded, setIsExpanded] = useState(false);

  // console.log("isSelected in card props", isSelected);

  // console.log("interviewer available", interviewer);
  const firstName = interviewer?.contactDetails
    ? interviewer?.contactDetails?.firstName
    : interviewer?.contactId?.firstName;

  const lastName = interviewer?.contactDetails
    ? interviewer?.contactDetails?.lastName
    : interviewer?.contactId?.lastName || "";

  // Calculate available slots from contactDetails.availability
  // Calculate available slots from contactDetails.availability
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

  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed";

  const professionalTitle = interviewer?.contact?.professionalTitle;

  const CurrentRole =
    interviewer?.contactDetails?.roleLabel ||
    interviewer?.contactId?.roleLabel ||
    professionalTitle;
  // const company = interviewer?.contact?.industry || "Freelancer";

  // const rating = interviewer?.contact?.rating || "4.6";
  const introduction =
    interviewer?.contactDetails?.bio || "No introduction provided.";
  const skillsArray = interviewer?.contactDetails
    ? interviewer?.contactDetails?.skills
    : interviewer?.contactId?.skills || [];

  // console.log("interviewer in card", interviewer);

  // console.log("skillsArray in card", skillsArray);
  // const avgResponseTime =
  // interviewer?.contact?.avgResponseTime || "not provided";

  return (
    <div
      className={`relative
        bg-white rounded-lg  border-gray-200 border border-md transition-all duration-200 p-4
        ${isSelected ? "opacity-60" : "opacity-100"
        // isSelected
        //   ? "border-orange-500 ring-2 ring-orange-200"
        //   :
        // " hover:shadow-md"
        }
      `}
    // className={`w-full  ${
    //   isSelected
    //     ? "border-orange-500 ring-2 ring-orange-200"
    //     : "border-gray-200"
    // } `}
    >
      {/* <div className="w-full"> */}
      <div className="flex items-center gap-2">
        <div>
          <InterviewerAvatar interviewer={interviewer} size="lg" />
        </div>
        <div className="flex sm:flex-col items-start sm:justify-start justify-between w-full">
          <div className="sm:ml-0">
            <h3 className="text-base font-medium truncate sm:max-w-[200px] md:max-w-[220px] lg:max-w-[280px] xl:max-w-[340px] 2xl:max-w-[360px] text-gray-900">
              {capitalizeFirstLetter(fullName)}
            </h3>
            {CurrentRole && (
              <p className="text-xs text-gray-500">
                {capitalizeFirstLetter(CurrentRole)}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* </div> */}

      <div className="mt-3">
        {skillsArray.length > 0 ? (
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
        ) : (
          <p className="text-xs  text-gray-500 italic">No skills listed.</p>
        )}
      </div>

      {/* Premium Available Slots Display with Hover */}
      <div className="mt-3 group relative">
        {slotsInfo.hasSlots ? (
          <>
            <div className="rounded-lg bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 p-3 transition-all hover:shadow-md hover:border-green-300">
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

                  {/* Days Row */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {slotsInfo.days.map((day, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white text-green-700 border border-green-300 shadow-sm"
                      >
                        ✓ {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Hover Tooltip - Optional */}
            <div className="absolute left-0 right-0 top-full mt-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg">
                <p className="font-medium">Click to view full schedule</p>
              </div>
            </div>
          </>
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

      {isSelected && (
        <div
          className="
      absolute top-3 right-3
      sm:top-4 sm:right-4
      z-20
      h-6 w-6
      rounded-full
      flex items-center justify-center
      bg-custom-blue text-white
      shadow-lg
      ring-2 ring-custom-blue
      transition-all duration-200
    "
        >
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

const InternalInterviews = ({
  onClose,
  onSelectCandidates,
  navigatedfrom,
  selectedInterviewers: selectedInterviewersProp = [],
  defaultViewType = "individuals",
  // selectedGroupName = "",
  // selectedGroupId,
  // selectedTeamIds,
  // selectedTagIds,
  selectedTeamIds: propSelectedTeamIds = [],
  selectedTagIds: propSelectedTagIds = [],
}) => {
  // const { data: groups = [] } = useGroupsQuery();
  // const { interviewers } = useInterviewers();
  const { data: interviewers = [] } = useAllInterviewers({ active_only: true });

  const [searchQuery, setSearchQuery] = useState("");
  // const [filteredData, setFilteredData] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);

  const { data: tagsData = [] } = useInterviewerTags({ active_only: true });
  const { data: teamsData = [] } = useTeamsQuery();
  const pageType = "adminPortal";
  const { skills, loadSkills, isSkillsFetching } = useMasterData({}, pageType);

  // CHANGED: Use props as initial state
  // Add this state with other state declarations
  const [isFiltersApplied, setIsFiltersApplied] = useState(false);

  const [activeTagIds, setActiveTagIds] = useState(propSelectedTagIds || []);
  const [activeTeamIds, setActiveTeamIds] = useState(propSelectedTeamIds || []);
  const [skillInput, setSkillInput] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(true);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [filterType, setFilterType] = useState("tags"); // default = tags
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);

  const skillsPopupRef = useRef(null);
  const skillsInputRef = useRef(null);
  useScrollLock(true);

  console.log("skills", skills);

  // const [viewType, setViewType] = useState(defaultViewType);
  // const [viewType, setViewType] = useState(defaultViewType);
  // CHANGED: Auto-detect view type based on groupName or groupId
  const [viewType, setViewType] = useState(() => {
    // If groupName or groupId is provided, default to groups view
    // if (selectedGroupName || selectedGroupId) {
    //   return "groups";
    // }
    return defaultViewType;
  });
  // console.log("tagsData", tagsData);
  // console.log("teamsData", teamsData);
  // console.log("selectedInterviewersProp", selectedInterviewersProp);
  // console.log("interviewers", interviewers);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // CHANGED: Enhanced useEffect to sync props with local state
  useEffect(() => {
    if (propSelectedTagIds?.length > 0) {
      setActiveTagIds(propSelectedTagIds);
      setFilterType("tags"); // Switch to tags view when tags are provided
    }
  }, [propSelectedTagIds]);

  useEffect(() => {
    if (propSelectedTeamIds?.length > 0) {
      setActiveTeamIds(propSelectedTeamIds);
      setFilterType("teams"); // Switch to teams view when teams are provided
    }
  }, [propSelectedTeamIds]);

  // CHANGED: Toggle selection function
  const toggleSelection = (id, setter) => {
    setter((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // ────────────────────────────────────────────────
  //   Combined prioritized list: selected → remaining
  // ────────────────────────────────────────────────
  // New: prioritized interviewers
  // New prioritized interviewers with corrected logic
  // const prioritizedInterviewers = useMemo(() => {
  //   if (!interviewers?.length) return [];
  //   // if (!selectedTeamIds?.length && !selectedTagIds?.length) {
  //   //   return interviewers;
  //   // }

  //   const selectedTeamIdsSet = new Set(activeTeamIds || []);
  //   const selectedTagIdsSet = new Set(activeTagIds || []);
  //   const selectedSkillsSet = new Set(
  //     selectedSkills.map((s) => s.SkillName.toLowerCase()),
  //   );

  //   const isSelected = (interviewer) => {
  //     // Check for team match
  //     const interviewerTeamId = interviewer.team_id?._id || interviewer.team_id;
  //     if (interviewerTeamId && selectedTeamIdsSet.has(interviewerTeamId)) {
  //       return true;
  //     }

  //     // Check for tag matches
  //     const interviewerTags = interviewer.tag_ids || interviewer.tags || [];
  //     if (Array.isArray(interviewerTags)) {
  //       // Check if any tag matches
  //       const hasMatchingTag = interviewerTags.some((tag) => {
  //         const tagId = tag._id || tag;
  //         return tagId && selectedTagIdsSet.has(tagId);
  //       });
  //       if (hasMatchingTag) return true;
  //     }

  //     return false;
  //   };

  //   const selected = interviewers.filter(isSelected);
  //   const unselected = interviewers.filter((i) => !isSelected(i));

  //   // You can sort inside selected/unselected if you want (e.g. by name)
  //   // selected.sort((a,b) => (a.user_id?.firstName || '').localeCompare(b.user_id?.firstName || ''));

  //   return [...selected, ...unselected];
  // }, [interviewers, selectedTeamIds, selectedTagIds]);

  // CHANGED: Combined prioritized and filtered interviewers logic
  const filteredAndPrioritizedInterviewers = useMemo(() => {
    if (!interviewers?.length) return [];

    const propTagSet = new Set(propSelectedTagIds || []);
    const propTeamSet = new Set(propSelectedTeamIds || []);
    const activeTagSet = new Set(activeTagIds || []);
    const activeTeamSet = new Set(activeTeamIds || []);
    // const selectedSkillSet = new Set(
    //   selectedSkills.map((s) => s.toLowerCase()),
    // );
    const selectedSkillSet = new Set(
      selectedSkills.map((s) =>
        typeof s === "string"
          ? s.toLowerCase()
          : (s.SkillName || s.skill || s).toString().toLowerCase(),
      ),
    );
    const searchLower = searchQuery.toLowerCase().trim();

    const getPriority = (interviewer) => {
      let score = 0;

      if (isFiltersApplied) {
        // ── 1. Parent (prop) match ─ highest priority ──
        const teamId = interviewer.team_id?._id || interviewer.team_id;
        if (teamId && propTeamSet.has(teamId)) {
          score += 1000;
        }

        const tags = interviewer.tag_ids || interviewer.tags || [];
        const hasPropTag = tags.some((t) => {
          const tid = t?._id || t;
          return tid && propTagSet.has(tid);
        });
        if (hasPropTag) {
          score += 900;
        }

        // ── 2. Current UI filters match ──
        let matchesCurrent = false;

        // Teams
        if (activeTeamIds.length > 0) {
          if (teamId && activeTeamSet.has(teamId)) {
            matchesCurrent = true;
          }
        } else {
          matchesCurrent = true; // no team filter → neutral
        }

        // Tags (OR)
        if (activeTagIds.length > 0) {
          const hasActiveTag = tags.some((t) => {
            const tid = t?._id || t;
            return tid && activeTagSet.has(tid);
          });
          if (hasActiveTag) {
            matchesCurrent = true;
          } else if (activeTeamIds.length === 0) {
            matchesCurrent = false; // only tags filter active → must match
          }
        }

        if (matchesCurrent) {
          score += 500;
        }

        // ── 3. Skills match ──
        if (selectedSkills.length > 0) {
          const hasSkill = (interviewer.contactId?.skills || []).some((s) =>
            selectedSkillSet.has(s.toLowerCase()),
          );
          if (hasSkill) score += 200;
        }
      }

      // ── 4. Search match ──
      if (searchLower) {
        const name =
          `${interviewer.contactId?.firstName || ""} ${interviewer.contactId?.lastName || ""}`.toLowerCase();
        const email = interviewer.contactId?.email?.toLowerCase() || "";
        if (name.includes(searchLower) || email.includes(searchLower)) {
          score += 100;
        }
      }

      return score;
    };

    // Sort descending by priority score, then alphabetically
    return [...interviewers].sort((a, b) => {
      const scoreA = getPriority(a);
      const scoreB = getPriority(b);

      if (scoreA !== scoreB) {
        return scoreB - scoreA; // higher score first
      }

      // Alphabetical fallback
      const nameA =
        `${a.contactId?.firstName || ""} ${a.contactId?.lastName || ""}`
          .toLowerCase()
          .trim();
      const nameB =
        `${b.contactId?.firstName || ""} ${b.contactId?.lastName || ""}`
          .toLowerCase()
          .trim();
      return nameA.localeCompare(nameB);
    });
  }, [
    interviewers,
    propSelectedTagIds,
    propSelectedTeamIds,
    activeTagIds,
    activeTeamIds,
    selectedSkills,
    searchQuery,
    isFiltersApplied,
  ]);

  const [selectedInterviewers, setSelectedInterviewers] = useState(() => {
    // CHANGED: Enhanced group detection logic
    // if ((selectedGroupName || selectedGroupId) && groups) {
    //   const matchingGroup = groups.find(
    //     (group) =>
    //       group.name === selectedGroupName || group._id === selectedGroupId,
    //   );
    //   return matchingGroup ? [matchingGroup] : [];
    // }
    return selectedInterviewersProp;
  });

  // // CHANGED: Added useEffect to handle view type changes when group props change
  // useEffect(() => {
  //   if (selectedGroupName || selectedGroupId) {
  //     setViewType("groups");
  //   }
  // }, [selectedGroupName, selectedGroupId]);

  // CHANGED: Enhanced useEffect to auto-select group when groups data loads
  // useEffect(() => {
  //   if ((selectedGroupName || selectedGroupId) && groups && groups.length > 0) {
  //     const matchingGroup = groups.find(
  //       (group) =>
  //         group.name === selectedGroupName || group._id === selectedGroupId,
  //     );
  //     if (matchingGroup) {
  //       setSelectedInterviewers([matchingGroup]);
  //     }
  //   }
  // }, [groups, selectedGroupName, selectedGroupId]);

  //   useEffect(() => {
  //   setSelectedInterviewers([]);
  // }, [viewType]);

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const roleDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        roleDropdownRef.current &&
        !roleDropdownRef.current.contains(event.target)
      ) {
        setShowRoleDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // const FilteredData = useMemo(() => {
  //   if (viewType === "individuals") {
  //     const interviewersArray = Array.isArray(interviewers) ? interviewers : [];
  //     return interviewersArray
  //       ?.filter((interviewer) => {
  //         // <------------------------------- v1.0.0
  //         // Filter by internal type
  //         if (interviewer.type !== "internal") {
  //           return false;
  //         }

  //         // Filter by selected role
  //         if (
  //           selectedRole !== "all" &&
  //           interviewer?.roleName !== selectedRole
  //           // interviewer?.roleLabel !== selectedRole
  //         ) {
  //           return false;
  //         }

  //         // Filter by search query
  //         const contact = interviewer.contact || {};

  //         // Filter by fullname
  //         const fullName = `${contact?.firstName || ""} ${
  //           contact?.lastName || ""
  //         }`.trim();

  //         const matchesSearch = [
  //           contact?.firstName,
  //           contact?.lastName,
  //           fullName,
  //           contact?.email,
  //           contact?.phone,
  //         ].some(
  //           (field) =>
  //             field &&
  //             field
  //               .toString()
  //               .toLowerCase()
  //               .includes(searchQuery.toLowerCase()),
  //         );
  //         return matchesSearch;
  //       })
  //       .map((interviewer) => ({
  //         _id: interviewer?._id,
  //         ...interviewer?.contact,

  //         /* System role (permission role) */
  //         roleName: interviewer?.roleName,
  //         roleLabel: getRoleLabel(interviewer?.roleName),
  //         profilePic: interviewer?.contact?.imageData?.path,

  //         /* Current role (designation) */
  //         currentRole: interviewer?.contact?.currentRole || "Not specified",

  //         /* Skills */
  //         skills: interviewer?.skills || [],
  //       }));
  //   }
  //   // else {
  //   //   // Groups filtering remains unchanged
  //   //   return Array.isArray(groups)
  //   //     ? groups.filter((group) => {
  //   //         // Filter by search query
  //   //         const matchesSearch = [group?.name, group?.description]?.some(
  //   //           (field) =>
  //   //             field &&
  //   //             field?.toLowerCase()?.includes(searchQuery?.toLowerCase()),
  //   //         );

  //   //         // For editing - check if this group matches the selected group name
  //   //         // const isSelectedGroup = selectedGroupName
  //   //         //   ? group.name === selectedGroupName
  //   //         //   : selectedInterviewersProp?.some(
  //   //         //       (selected) => selected?._id === group?._id,
  //   //         //     );

  //   //         return matchesSearch;
  //   //       })
  //   //     : [];
  //   // }
  // }, [
  //   interviewers,
  //   // groups,
  //   searchQuery,
  //   viewType,
  //   selectedRole,
  //   // selectedGroupName,
  //   // selectedGroupId,
  // ]); // Added selectedRole to dependencies

  // useEffect(() => {
  //   setFilteredData(FilteredData);
  // }, [FilteredData]);

  // console.log("filteredData", filteredData);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Around line 290-310, replace handleSelectClick:
  const handleSelectClick = (item) => {
    setSelectedInterviewers((prev) => {
      const itemUserId = item?.contactId?._id || item?._id;

      const isAlreadySelected = prev.some((interviewer) => {
        const selectedUserId = interviewer?.contactId?._id || interviewer?._id;
        return selectedUserId === itemUserId;
      });

      if (isAlreadySelected) {
        return prev.filter((interviewer) => {
          const selectedUserId =
            interviewer?.contactId?._id || interviewer?._id;
          return selectedUserId !== itemUserId;
        });
      } else {
        return [...prev, item];
      }
    });
  };

  // const handleScheduleClick = () => {
  //   const groupName = selectedInterviewers[0]?.name || '';
  //   onSelectCandidates(selectedInterviewers,viewType,groupName);
  //   onClose();
  // };

  const handleScheduleClick = () => {
    // if (viewType === "groups" && selectedInterviewers.length > 0) {
    //   // For groups, pass the group name AND group ID
    //   const groupName = selectedInterviewers[0]?.name || "";
    //   const groupId = selectedInterviewers[0]?._id || "";

    //   onSelectCandidates(selectedInterviewers, viewType, groupName, groupId);
    // } else {
    // For individuals, just pass the selected interviewers and view type
    onSelectCandidates(selectedInterviewers, viewType);
    // }
    onClose();
  };

  // const isInterviewerSelected = (item) => selectedInterviewers?.some(interviewer => interviewer._id === item._id);

  // const isInterviewerSelected = (item) => {

  //   return selectedInterviewers.some(
  //     (interviewer) => interviewer?._id === item?._id || item?.user_id?._id,
  //   );
  // };

  // Around line 315-325, replace the isInterviewerSelected function:
  const isInterviewerSelected = (item) => {
    return selectedInterviewers.some((interviewer) => {
      // Compare using user_id._id from both sides
      const selectedUserId = interviewer?.contactId?._id || interviewer?._id;
      const itemUserId = item?.contactId?._id || item?._id;

      return selectedUserId === itemUserId;
    });
  };

  // Add these helper functions after your state declarations
  // const getSelectedTags = useMemo(() => {
  //   if (!selectedTagIds?.length || !tagsData?.length) return [];
  //   return tagsData.filter((tag) => selectedTagIds.includes(tag._id));
  // }, [tagsData, selectedTagIds]);

  // const getSelectedTeams = useMemo(() => {
  //   if (!selectedTeamIds?.length || !teamsData?.length) return [];
  //   return teamsData.filter((team) => selectedTeamIds.includes(team._id));
  // }, [teamsData, selectedTeamIds]);

  return (
    // v1.0.3 <----------------------------------------------------------------------------------
    <SidebarPopup
      // title={`Internal Interviewers`}
      title={
        <div>
          <h4 className="flex items-center text-xl gap-2 font-semibold text-custom-blue">
            <Users className="h-5 w-5" />
            Internal Interviewer
          </h4>
          <p className="text-sm text-gray-500">
            Select from internal interview experts
          </p>
        </div>
      }
      //   ${
      //   viewType === "individuals" ? "Individuals" : "Groups"
      // }
      onClose={onClose}
      // v1.0.2 <--------------------------------
      setIsFullscreen={setIsFullscreen}
    // v1.0.2 -------------------------------->
    >
      <div className="pb-10">
        {/* <------------------------------- v1.0.0  */}

        {/* <div className="w-full flex justify-end  items-center mt-4">
          <span className="cursor-pointer px-3 py-1 text-xl border rounded-md p-2">
            {isFilterPopupOpen ? (
              <LuFilterX
                // className="cursor-pointer"
                onClick={() => setIsFilterPopupOpen(false)}
              />
            ) : (
              <LuFilter
                // className="cursor-pointer"
                onClick={() => setIsFilterPopupOpen(true)}
              />
            )}
          </span>
        </div> */}
        {/* Filter Toggle Button with Arrow */}
        {navigatedfrom !== "dashboard" && (
          <>
            <div className="w-full flex justify-end items-center gap-2 mt-4">
              {/* RIGHT SECTION — SEARCH */}
              <div className="relative w-[60%] sm:max-w-sm lg:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search individuals..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
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
                {/* Header */}
                <div className="grid items-center gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-12 xl:grid-cols-12 2xl:grid-cols-12">
                  {/* Tags / Teams Dropdown */}
                  <div
                    className="md:col-span-4 lg:col-span-4 xl:col-span-5 2xl:col-span-5"
                    ref={filterDropdownRef}
                  >
                    <button
                      onClick={() => setShowFilterDropdown((prev) => !prev)}
                      className="flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 h-10 text-sm"
                    >
                      {filterType === "tags" ? "Tags" : "Teams"}
                      <ChevronDown className="h-4 w-4 shrink-0" />
                    </button>

                    {showFilterDropdown && (
                      <div className="absolute  z-30 mt-1 w-[280px] rounded-md border bg-white shadow">
                        {/* // <div className="absolute left-0 top-full z-30 mt-1 w-[120px] rounded-md border bg-white shadow"> */}

                        {["tags", "teams"].map((type) => (
                          <div
                            key={type}
                            onClick={() => {
                              setFilterType(type);
                              setShowFilterDropdown(false);
                            }}
                            className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${filterType === type
                                ? "font-medium text-custom-blue"
                                : ""
                              }`}
                          >
                            {capitalizeFirstLetter(type)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Skills dropdown */}
                  <div className="md:col-span-4 lg:col-span-4 xl:col-span-5 2xl:col-span-5">
                    {/* <input
                  type="text"
                  value={skillInput}
                  placeholder="Type skill & press Enter"
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                /> */}
                    <DropdownWithSearchField
                      ref={skillsInputRef}
                      value={null}
                      options={
                        skills
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
                          if (
                            prev.some(
                              (s) =>
                                (typeof s === "string"
                                  ? s
                                  : s.SkillName || s.skill || s) === value,
                            )
                          )
                            return prev;
                          return [...prev, value]; // Store as string, not object
                        });
                        // setSelectedSkills((prev) => {
                        //   // prevent duplicates
                        //   if (prev.some((s) => s.SkillName === value)) return prev;
                        //   return [...prev, { SkillName: value }];
                        // });
                      }}
                      onMenuOpen={loadSkills}
                      loading={isSkillsFetching}
                      placeholder="Filter by skills"
                    />
                  </div>

                  {/* Add this Apply/Clear Filter button */}
                  <div className="md:col-span-3 lg:col-span-3 xl:col-span-2 2xl:col-span-3 flex items-end h-full">
                    <button
                      className={`w-full text-sm px-3 h-10 rounded-md font-medium transition-colors flex items-center justify-center whitespace-nowrap ${isFiltersApplied
                          ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                          : "bg-custom-blue text-white hover:bg-custom-blue/90"
                        }`}
                      onClick={() => {
                        if (isFiltersApplied) {
                          // Clear all filters
                          setSearchQuery("");
                          setActiveTagIds(propSelectedTagIds || []);
                          setActiveTeamIds(propSelectedTeamIds || []);
                          setSelectedSkills([]);
                          setFilterType("tags");
                          setIsFiltersApplied(false);
                        } else {
                          // Mark filters as applied (existing states will be used)
                          setIsFiltersApplied(true);
                        }
                      }}
                    >
                      {isFiltersApplied ? "Clear Filter" : "Apply Filter"}
                    </button>
                  </div>
                </div>

                {/* Fixed Dropdown and Search Section */}

                {/* Right: Filters */}
                <div className="flex flex-col  gap-3 px-3 mt-3 ">
                  {filterType === "tags" && tagsData.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500 mr-1"> Select Tags:</span>

                      <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                        {tagsData.map((tag) => {
                          const isSelected = activeTagIds.includes(tag._id);
                          return (
                            <button
                              key={tag._id}
                              type="button"
                              onClick={() =>
                                toggleSelection(tag._id, setActiveTagIds)
                              }
                              className={`
            flex items-center gap-1.5 
            px-3.5 py-1.5 rounded-full text-sm font-medium
            border transition-all duration-150
            ${isSelected
                                  ? "bg-slate-300 text-white border-slate-700 border-2 ring-2 ring-offset-2 ring-slate-100 shadow-sm"
                                  : "bg-[var(--tag-color)]/10 text-[var(--tag-color)] border-[var(--tag-color)]/60 hover:bg-[var(--tag-color)]/20"
                                }
          `}
                              style={{ "--tag-color": tag.color }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                style={{
                                  backgroundColor: tag.color,
                                }}
                              />
                              <span className="text-black">{tag.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* {tagsData.map((tag) => (
                <span
                  key={tag._id}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border"
                  style={{
                    backgroundColor: `${tag.color}15`,
                    color: tag.color,
                    borderColor: `${tag.color}30`,
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </span>
              ))} */}
                    </div>
                  )}

                  {filterType === "teams" && teamsData.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500 mr-1">Select Teams:</span>

                      <div className="flex flex-wrap gap-x-3 gap-y-3">
                        {teamsData.map((team) => {
                          const isSelected = activeTeamIds.includes(team._id);
                          return (
                            <button
                              key={team._id}
                              type="button"
                              onClick={() =>
                                toggleSelection(team._id, setActiveTeamIds)
                              }
                              className={`
            flex items-center gap-2 
            px-3.5 py-1.5 rounded-full text-sm font-medium
            border transition-all duration-150
            ${isSelected
                                  ? "bg-purple-100 text-black border-2 border-purple-400 shadow-sm"
                                  : "bg-white text-purple-700 border-purple-300 hover:bg-purple-50 hover:border-purple-400"
                                }
          `}
                            >
                              <span className="text-base">👥</span>
                              <span className="text-black">{team.name}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* {teamsData.map((team) => (
                <span
                  key={team._id}
                  className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                >
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {team.name}
                </span>
              ))} */}
                    </div>
                  )}

                  {/* Selected Skills */}
                  {selectedSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs text-gray-500 mr-1">
                        Skills:
                      </span>

                      {selectedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="flex items-center gap-1 rounded-full bg-gray-100 border px-2.5 py-1 text-xs text-gray-800"
                        >
                          {skill}
                          <button
                            onClick={() =>
                              setSelectedSkills((prev) =>
                                prev.filter((s) => s !== skill),
                              )
                            }
                            className="ml-1 text-gray-500 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {/* RIGHT SIDE — SEARCH */}
        {/* <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search individuals..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        {/* Scrollable Data Section */}
        <div className="flex flex-col overflow-y-auto py-4 sm:px-2 min-h-full">
          <div
            // className={`
            //     grid gap-4 sm:gap-5 px-1 sm:px-2
            //     ${
            //       isFullscreen
            //         ? "grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-3"
            //         : "grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1"
            //     }
            //   `}

            className={`
              grid gap-4 sm:gap-5 px-1 sm:px-2
              ${isFullscreen
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
                : "grid-cols-1"
              }
            `}
          >
            {/* v1.0.2 --------------------------------------------------------------------------> */}
            {filteredAndPrioritizedInterviewers?.map((item) => (
              <div
                key={item._id}
                className={`
                  ${navigatedfrom === "dashboard" && "relative z-0 flex items-center justify-between p-3 rounded-md transition-all duration-200"}
                  ${
                  // navigatedfrom !== "dashboard"
                  //   ? "cursor-pointer"
                  //   :
                  navigatedfrom === "dashboard" && "cursor-default"
                  }
                
                  `}
                onClick={() =>
                  navigatedfrom !== "dashboard" && handleSelectClick(item)
                }
              >
                <div
                // transition-opacity
                // className={`  ${
                //   isInterviewerSelected(item) ? "opacity-60" : "opacity-100"
                // }`}
                >
                  {viewType === "individuals" ? (
                    <OutsourcedInterviewerCard
                      key={item._id}
                      interviewer={item}
                      navigatedfrom="internal-interview"
                      isSelected={isInterviewerSelected(item)}
                    />
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg
                          className="h-5 w-5 text-gray-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {item.name || "no name available"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Array.isArray(item.usersNames) &&
                            item.usersNames.length > 0
                            ? item.usersNames.join(", ")
                            : "No users available"}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* v1.0.2 <------------------------------------------------------------------ */}
          {filteredAndPrioritizedInterviewers?.length === 0 && (
            <div className="text-gray-500 flex items-center justify-center h-full mb-8">
              <p>
                No {viewType === "individuals" ? "interviewers" : "groups"}{" "}
                found for the selected criteria.
              </p>
            </div>
          )}
          {/* v1.0.2 ------------------------------------------------------------------> */}
        </div>

        {/* v1.0.2 <----------------------------------------------------------------------- */}
        {/* Fixed Footer (Hidden when navigatedfrom is 'dashboard') */}
        {navigatedfrom !== "dashboard" && (
          // <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
          <div className="bg-white p-4 flex justify-end">
            <button
              onClick={handleScheduleClick}
              disabled={selectedInterviewers.length === 0}
              // className="bg-custom-blue px-4 py-2 rounded-md text-white  disabled:bg-gray-400 disabled:cursor-not-allowed"
              className="bg-custom-blue sm:text-sm px-4 py-2 rounded-md text-white  disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Schedule ({selectedInterviewers.length})
            </button>
          </div>
        )}
        {/* v1.0.2 -----------------------------------------------------------------------> */}
      </div>
    </SidebarPopup>
    // v1.0.3 ---------------------------------------------------------------------------------->
  );
};

export default InternalInterviews;
