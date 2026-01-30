// v1.0.0  -  Ashraf  -  fixed internal interviews get based on tenantid,border-b removed for header
// v1.0.1  -  Ashok   -  Improved responsiveness added common popup
// v1.0.2  -  Ashok   -  fixed z-index and alignment issues
// v1.0.3  -  Ashok   -  fixed responsiveness style issues in form
// v1.0.4  -  Ashok   -  fixed alignment issues

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X, ChevronDown, ChevronUp } from "lucide-react";
import useInterviewers from "../../../../../../hooks/useInterviewers";
// v1.0.1 <------------------------------------------------------------
import SidebarPopup from "../../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import {
  useGroupsQuery,
  useTeamsQuery,
} from "../../../../../../apiHooks/useInterviewerGroups.js";
// v1.0.1 ------------------------------------------------------------>
import { capitalizeFirstLetter } from "../../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { useScrollLock } from "../../../../../../apiHooks/scrollHook/useScrollLock.js";
import {
  useAllInterviewers,
  useInterviewerTags,
} from "../../../../../../apiHooks/useInterviewers.js";
import { InterviewerCard } from "../../../Interviewers/Interviewers.jsx";
import { useMasterData } from "../../../../../../apiHooks/useMasterData.js";
import DropdownWithSearchField from "../../../../../../Components/FormFields/DropdownWithSearchField.jsx";

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
  // const { skills, loadSkills, isSkillsFetching } = useMasterData({}, pageType);

  const [filterType, setFilterType] = useState("tags"); // default = tags
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterDropdownRef = useRef(null);
  // CHANGED: Use props as initial state
  const [activeTagIds, setActiveTagIds] = useState(propSelectedTagIds || []);
  const [activeTeamIds, setActiveTeamIds] = useState(propSelectedTeamIds || []);
  const [skillInput, setSkillInput] = useState("");

  const [selectedSkills, setSelectedSkills] = useState([]);
  const skillsPopupRef = useRef(null);
  const skillsInputRef = useRef(null);
  useScrollLock(true);

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
    const selectedSkillSet = new Set(
      selectedSkills.map((s) => s.toLowerCase()),
    );
    const searchLower = searchQuery.toLowerCase().trim();

    console.log("activeTagIds", activeTagIds);
    console.log("activeTeamIds", activeTeamIds);

    const getPriority = (interviewer) => {
      let score = 0;

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

  const handleAddSkill = () => {
    const value = skillInput.trim();

    if (!value) return;

    setSelectedSkills((prev) => {
      // prevent duplicates (case-insensitive)
      if (prev.some((s) => s.toLowerCase() === value.toLowerCase())) {
        return prev;
      }

      return [...prev, value];
    });

    setSkillInput("");
  };

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
      title={`Internal Interviewers`}
      //   ${
      //   viewType === "individuals" ? "Individuals" : "Groups"
      // }
      onClose={onClose}
      // v1.0.2 <--------------------------------
      setIsFullscreen={setIsFullscreen}
      // v1.0.2 -------------------------------->
    >
      <div className="flex flex-col h-full">
        {/* <------------------------------- v1.0.0  */}
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mt-4">
          {/* <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"> */}
          {/* LEFT SECTION */}
          {/* <div className="flex flex-wrap items-center gap-3"> */}
          {/* Selected count */}
          {/* <p className="text-sm text-gray-600 whitespace-nowrap">
                <span className="font-medium text-gray-900">
                  {selectedInterviewers?.length}
                </span>{" "}
                {viewType === "individuals" ? "Individual" : "Group"}
                {selectedInterviewers?.length !== 1 ? "s" : ""} selected
              </p> */}

          {/* RIGHT SECTION — SEARCH */}
          <div className="relative w-full sm:max-w-sm lg:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search individuals..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags / Teams Dropdown */}
          <div className="relative min-w-[120px]" ref={filterDropdownRef}>
            <button
              onClick={() => setShowFilterDropdown((prev) => !prev)}
              className="flex w-full items-center justify-between gap-2 rounded-md border bg-white px-3 py-2 text-sm"
            >
              {filterType === "tags" ? "Tags" : "Teams"}
              <ChevronDown className="h-4 w-4 shrink-0" />
            </button>

            {showFilterDropdown && (
              <div className="absolute z-30 mt-1 w-full rounded-md border bg-white shadow">
                {["tags", "teams"].map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setFilterType(type);
                      setShowFilterDropdown(false);
                    }}
                    className={`cursor-pointer px-3 py-2 text-sm hover:bg-gray-100 ${
                      filterType === type ? "font-medium text-blue-600" : ""
                    }`}
                  >
                    {capitalizeFirstLetter(type)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills dropdown */}
          <div className="min-w-[220px] max-w-xs w-full sm:w-auto">
            <input
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
            />
          </div>

          {/* </div> */}
          {/* </div> */}
        </div>

        {/* Fixed Dropdown and Search Section */}

        {/* Right: Filters */}
        <div className="flex flex-col  gap-3 px-3 mt-3 ">
          {filterType === "tags" && tagsData.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-gray-500 mr-1">Tags:</span>

              <div className="flex flex-wrap gap-x-2 gap-y-2.5">
                {tagsData.map((tag) => {
                  const isSelected = activeTagIds.includes(tag._id);
                  return (
                    <button
                      key={tag._id}
                      type="button"
                      onClick={() => toggleSelection(tag._id, setActiveTagIds)}
                      className={`
            flex items-center gap-1.5 
            px-3.5 py-1.5 rounded-full text-sm font-medium
            border transition-all duration-150
            ${
              isSelected
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
              <span className="text-xs text-gray-500 mr-1">Teams:</span>

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
            px-4 py-2 rounded-full text-sm font-medium
            border transition-all duration-150
            ${
              isSelected
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
              <span className="text-xs text-gray-500 mr-1">Skills:</span>

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
        <div className="flex-1 sm:px-2 px-6 py-4">
          <div className="bg-white">
            {/* ------------------------------ v1.0.0 > */}
            {/* <div className="flex gap-x-4 md:flex-row md:items-end md:space-x-4 md:space-y-0 justify-between my-5"> */}
            {/* <div className="w-full grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-3 my-5"> */}
            <div
              className={`w-full grid gap-3 my-5 sm:grid-cols-1 md:grid-cols-1 
              
              
              `}
            >
              {/* Right side (search) */}
              {/* <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search individuals..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                />
              </div> */}
              {/* Search Bar */}
              {/* <div className="flex-1"> */}
              {/* <div className=" w-full ">
                <div className="relative w-[40%] flex items-end">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search individuals...`}
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div> */}
            </div>
          </div>
          {/* v1.0.2 <-------------------------------------------------------------------------- */}

          <div
            className={`grid gap-3 sm:grid-cols-1 md:grid-cols-1
            ${
              isFullscreen
                ? "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                : "lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2"
            }
          `}
          >
            {/* v1.0.2 --------------------------------------------------------------------------> */}
            {filteredAndPrioritizedInterviewers?.map((item) => (
              <div
                key={item._id}
                className={`relative z-0 flex items-center justify-between p-3 rounded-md transition-all duration-200
                  ${
                    navigatedfrom !== "dashboard"
                      ? "cursor-pointer"
                      : "cursor-default"
                  }
                  ${
                    navigatedfrom !== "dashboard" && isInterviewerSelected(item)
                      ? "bg-custom-bg border border-custom-blue"
                      : "hover:bg-gray-50 border border-gray-200"
                  }`}
                onClick={() =>
                  navigatedfrom !== "dashboard" && handleSelectClick(item)
                }
              >
                <div
                  className={`flex items-center w-full ${
                    isInterviewerSelected(item) ? "opacity-60" : "opacity-100"
                  }`}
                >
                  {viewType === "individuals" ? (
                    <InterviewerCard
                      key={item._id}
                      interviewer={item}
                      from="outsource-interview"
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

                {isInterviewerSelected(item) && (
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                      h-6 w-6 rounded-full flex items-center justify-center 
                      bg-custom-blue text-white shadow-lg ring-2 ring-custom-blue
                      scale-90 transition-all duration-200"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
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
