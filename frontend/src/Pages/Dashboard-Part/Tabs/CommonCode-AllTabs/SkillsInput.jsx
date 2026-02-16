// ----- v1.0.0 ----- Venkatesh----improve dropdown styles and placeholder text in small devices shown in ellipsis and border border-gray-300 added
// v1.0.1 - Ashok - added useForward ref to implement scroll to first error functionality
// v1.0.2 - Ashok - added responsiveness
// v1.0.3 - Ashok - added function to reset custom skill after form submission

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import axios from "axios";
import { config } from "../../../../config";
import { ReactComponent as FaTrash } from "../../../../icons/FaTrash.svg";
// Removed FaEdit import - not needed for always-editable rows
import { ReactComponent as FaPlus } from "../../../../icons/FaPlus.svg";
// Removed FaTimes import - not needed for always-editable rows
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import { createPortal } from "react-dom";

// Helper to safely get skill name regardless of casing
const getSkillName = (skill) => {
  if (!skill) return "";
  if (typeof skill === "string") return skill;
  return skill.SkillName || skill.skillName || skill.name || "";
};

const SkillsField = forwardRef(
  (
    {
      entries,
      errors,
      onAddSkill,
      onAddMultipleSkills, // New prop for adding multiple skills at once from popup

      onDeleteSkill,
      onUpdateEntry, // New prop for updating entries
      onSkillsValidChange, // New prop to notify parent when skills validity changes

      skills,

      onOpenSkills,
      showValidation = false, // New prop to control when validation errors are shown
      showRequirementLevel = false, // New prop to show/hide Requirement Level dropdown (only for Position)
      simpleMode = false, // When true, only shows Add Skills button + popup (no three-row grid)
    },
    ref,
  ) => {
    const [deleteIndex, setDeleteIndex] = useState(null);
    const initializedRef = useRef(false);
    const [rowErrors, setRowErrors] = useState({});
    const [isCustomSkill, setIsCustomSkill] = useState({}); // Track custom skill state per row
    const containerRef = useRef(null);

    const expertiseOptions = ["Basic", "Medium", "Expert"];
    const experienceOptions = [
      "0-1 Years",
      "1-2 Years",
      "2-3 Years",
      "4-5 Years",
      "5-6 Years",
      "6-7 Years",
      "7-8 Years",
      "8-9 Years",
      "9-10 Years",
      "10+ Years",
    ];

    // Experience options for Position form - shows friendly labels, saves numeric values
    const positionExperienceOptions = [
      { value: "0-1", label: "Beginner (0–1 years)" },
      { value: "1-3", label: "Intermediate (1–3 years)" },
      { value: "3-5", label: "Advanced (3–5 years)" },
      { value: "5+", label: "Expert (5+ years)" },
    ];

    // Requirement Level options - backend stores value, frontend shows label
    const requirementLevelOptions = [
      { value: "REQUIRED", label: "Must-Have" },
      { value: "PREFERRED", label: "Preferred" },
      { value: "NICE_TO_HAVE", label: "Good to Have" },
      { value: "OPTIONAL", label: "Optional" },
    ];

    const confirmDelete = () => {
      if (deleteIndex !== null) {
        onDeleteSkill(deleteIndex);
        setDeleteIndex(null);
        // Clear custom skill state for deleted row
        const newIsCustomSkill = { ...isCustomSkill };
        delete newIsCustomSkill[deleteIndex];
        setIsCustomSkill(newIsCustomSkill);
      }
    };

    const cancelDelete = () => setDeleteIndex(null);

    // Removed handleEdit - all rows are always editable now

    // Using shared DropdownSelect; no local input handler needed

    // Helper function to get available skills for a specific row
    const getAvailableSkillsForRow = (rowIndex) => {
      // Get all selected skills from OTHER rows (not the current row)
      const otherSelectedSkills = entries
        .filter((_, idx) => idx !== rowIndex) // Exclude current row
        .map((e) => e.skill)
        .filter(Boolean); // Remove empty values

      // Return skills that are either:
      // 1. Not selected in any other row, OR
      // 2. Currently selected in this row (so it remains visible)
      const currentRowSkill = entries[rowIndex]?.skill;
      const availableSkills = skills.filter(
        (skill) =>
          !otherSelectedSkills.includes(getSkillName(skill)) ||
          getSkillName(skill) === currentRowSkill,
      );

      // Add "Other" option at the end for custom skills
      return [
        ...availableSkills.map((s) => ({ SkillName: getSkillName(s) })),
        { SkillName: "__other__" },
      ];
    };
    const experienceOptionsRS = experienceOptions.map((e) => ({
      value: e,
      label: e,
    }));
    const expertiseOptionsRS = expertiseOptions.map((e) => ({
      value: e,
      label: e,
    }));

    // Function to add a new skill row
    const handleAddSkillRow = () => {
      if (entries.length < 10) {
        // Max 10 rows
        onAddSkill(null); // Don't set editing index for new rows
      }
    };

    // Removed handleClearRow - not needed since we have delete functionality

    // Validate individual rows when entries change
    useEffect(() => {
      const newRowErrors = {};
      let firstThreeRowsComplete = true;

      entries.forEach((entry, index) => {
        const isCompleteRow =
          entry.skill &&
          entry.experience &&
          (showRequirementLevel || entry.expertise);
        const hasAnyValue = entry.skill || entry.experience || entry.expertise;

        // First 3 rows are mandatory
        if (index < 3) {
          // Check if row is complete for first three rows requirement
          if (!isCompleteRow) {
            firstThreeRowsComplete = false;

            // Only show errors if showValidation is true (after submit attempt)
            if (showValidation) {
              const errors = {};

              if (!entry.skill) {
                errors.skill = true;
              }
              if (!entry.experience) {
                errors.experience = true;
              }
              if (!showRequirementLevel && !entry.expertise) {
                errors.expertise = true;
              }

              if (Object.keys(errors).length > 0) {
                newRowErrors[index] = errors;
              }
            }
          }
        } else {
          // Additional rows (4+) - only validate if partially filled and showValidation is true
          if (hasAnyValue && !isCompleteRow && showValidation) {
            const errors = {};

            if (!entry.skill) {
              errors.skill = true;
            }
            if (!entry.experience) {
              errors.experience = true;
            }
            if (!showRequirementLevel && !entry.expertise) {
              errors.expertise = true;
            }

            if (Object.keys(errors).length > 0) {
              newRowErrors[index] = errors;
            }
          }
        }
      });

      setRowErrors(newRowErrors);

      // Notify parent component about skills validity
      // Skills are valid when first 3 rows are complete
      if (onSkillsValidChange) {
        onSkillsValidChange(firstThreeRowsComplete);
      }
    }, [entries, onSkillsValidChange, showValidation, showRequirementLevel]);

    // Auto-add three empty rows on first mount (no click needed) - skip in simpleMode
    useEffect(() => {
      if (!simpleMode && !initializedRef.current && entries.length === 0 && onAddSkill) {
        // Add three blank rows without setting editing index
        for (let i = 0; i < 3; i++) {
          onAddSkill(null); // Pass null to avoid setting editing index
        }
        initializedRef.current = true;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Detect custom skills when entries change (important for edit mode)
    useEffect(() => {
      if (entries.length > 0 && skills && skills.length > 0) {
        const customSkillStates = {};
        entries.forEach((entry, index) => {
          if (entry.skill) {
            // Check if the skill exists in the predefined skills list
            const isSkillInList = skills.some(
              (skill) => getSkillName(skill) === entry.skill,
            );
            // If not in list and not the special "__other__" value, it's custom
            if (!isSkillInList && entry.skill !== "__other__") {
              customSkillStates[index] = true;
            }
          }
        });
        // Only update if there are custom skills to set
        if (Object.keys(customSkillStates).length > 0) {
          setIsCustomSkill((prev) => ({ ...prev, ...customSkillStates }));
        }
      }
    }, [entries, skills]);

    // In SkillsField.js
    useImperativeHandle(ref, () => {
      const node = containerRef.current;
      if (node) {
        node.resetCustomSkills = () => {
          setIsCustomSkill({});
        };
      }
      return node;
    });

    // State for skills selection popup
    const [showSkillsPopup, setShowSkillsPopup] = useState(false);
    const [popupSearchTerm, setPopupSearchTerm] = useState("");
    const [popupSelectedSkills, setPopupSelectedSkills] = useState([]);

    // Max skills to display in popup grid to prevent DOM overload
    const MAX_POPUP_SKILLS = 100;

    // Server-side search state
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimerRef = useRef(null);

    // ALL filtering is done server-side via API — no client-side filtering
    useEffect(() => {
      if (!showSkillsPopup) return;

      // Clear any pending timer
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }

      const term = (popupSearchTerm || "").trim();

      // Always call the API (even for empty search to get initial skills)
      setIsSearching(true);
      searchTimerRef.current = setTimeout(async () => {
        try {
          const res = await axios.get(
            `${config.REACT_APP_API_URL}/master-data/skills/search`,
            { params: { search: term } }
          );
          const results = (res.data || [])
            .map((s) => s.SkillName || "")
            .filter(Boolean);
          setSearchResults(results);
        } catch (err) {
          console.error("Skills search error:", err);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, term ? 300 : 0); // No delay for initial load, 300ms debounce for typing

      return () => {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }
      };
    }, [popupSearchTerm, showSkillsPopup]);

    // Get already selected skills from entries
    const getAlreadySelectedSkills = () => {
      return entries.map((e) => e.skill).filter(Boolean);
    };

    // Handle opening the popup - initialize with already selected skills
    const handleOpenSkillsPopup = () => {
      setPopupSelectedSkills(getAlreadySelectedSkills());
      setPopupSearchTerm("");
      setShowSkillsPopup(true);
      // Ensure skills data is loaded when popup opens
      if (onOpenSkills) onOpenSkills();
    };

    // Handle closing the popup
    const handleCloseSkillsPopup = () => {
      setShowSkillsPopup(false);
      setPopupSearchTerm("");
      setPopupSelectedSkills([]);
    };

    // Toggle skill selection in popup
    const toggleSkillInPopup = (skillName) => {
      setPopupSelectedSkills((prev) => {
        if (prev.includes(skillName)) {
          return prev.filter((s) => s !== skillName);
        } else {
          return [...prev, skillName];
        }
      });
    };

    // Apply skill changes from popup
    const handleApplySkillChanges = () => {
      const currentSkills = getAlreadySelectedSkills();
      const newSelectedSkills = popupSelectedSkills;

      // Find skills to add (in popup but not in current entries)
      const skillsToAdd = newSelectedSkills.filter(
        (s) => !currentSkills.includes(s),
      );

      // Find skills to remove (in current entries but not in popup)
      const skillsToRemove = currentSkills.filter(
        (s) => !newSelectedSkills.includes(s),
      );

      // Apply changes through parent handlers
      if (
        onAddMultipleSkills &&
        (skillsToAdd.length > 0 || skillsToRemove.length > 0)
      ) {
        // Build the new skill entries list
        const newEntries = skillsToAdd.map((skillName) => ({
          skill: skillName,
          experience: "",
          expertise: "",
          requirement_level: "REQUIRED",
        }));

        // Call parent with skills to add and remove
        onAddMultipleSkills(newEntries, skillsToRemove);
      }

      handleCloseSkillsPopup();
    };

    // Search input handler
    const handlePopupSearchChange = useCallback((e) => {
      setPopupSearchTerm(e.target.value);
    }, []);

    return (
      <div ref={containerRef}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col mb-2">
            <label
              htmlFor="Skills"
              className="text-sm font-medium text-gray-900"
            >
              {simpleMode ? "Skills" : "Skills Details"} <span className="text-red-500">*</span>
            </label>
            {!simpleMode && (
              <span className="text-xs text-gray-500 mt-0.5">
                First 3 skills are mandatory
              </span>
            )}
            {simpleMode && (
              <span className="text-xs text-gray-500 mt-0.5">
                Add your Skills
              </span>
            )}
          </div>
          {(simpleMode || entries.length < 10) && (
            <button
              type="button"
              onClick={handleOpenSkillsPopup}
              className="flex items-center justify-center text-sm bg-custom-blue text-white px-3 py-1.5 rounded-md hover:bg-custom-blue/80 transition-colors shadow-sm"
            >
              <FaPlus className="mr-1.5 w-4 h-4" /> Add Skills
            </button>
          )}
        </div>

        {/* Skills Selection Popup */}
        {showSkillsPopup &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleCloseSkillsPopup}
              />
              {/* Modal */}
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Select Skills
                  </h3>
                  <button
                    type="button"
                    onClick={handleCloseSkillsPopup}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={popupSearchTerm}
                      onChange={handlePopupSearchChange}
                      autoComplete="off"
                      spellCheck="false"
                      className="w-full px-4 py-3 pl-10 border-2 border-custom-blue/30 rounded-lg focus:border-custom-blue focus:ring-2 focus:ring-custom-blue/20 outline-none transition-all text-gray-700 placeholder-gray-400"
                      autoFocus
                    />
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {popupSelectedSkills.length} skill
                    {popupSelectedSkills.length !== 1 ? "s" : ""} selected
                  </p>
                </div>

                {/* Skills Grid */}
                {/* <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getFilteredSkillsForPopup().map((skillName) => {
                      const isSelected =
                        popupSelectedSkills.includes(skillName);
                      return (
                        <button
                          key={skillName}
                          type="button"
                          onClick={() => toggleSkillInPopup(skillName)}
                          className={`
                          px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-all duration-150
                          ${
                            isSelected
                              ? "border-custom-blue bg-custom-blue/10 text-custom-blue ring-2 ring-custom-blue/20"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                          }
                        `}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">{skillName}</span>
                            {isSelected && (
                              <svg
                                className="w-5 h-5 text-custom-blue flex-shrink-0 ml-2"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {getFilteredSkillsForPopup().length === 0 && (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        {popupSearchTerm
                          ? `No skills found for "${popupSearchTerm}"`
                          : "All available skills have been added"}
                      </div>
                    )}
                  </div>
                </div> */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {isSearching ? (
                      <div className="col-span-full flex items-center justify-center py-12 text-gray-500">
                        <svg className="animate-spin h-5 w-5 mr-2 text-custom-blue" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Searching skills...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                        <p className="text-lg font-medium text-gray-600">
                          No Skills Found
                        </p>
                        <p className="text-sm">
                          {popupSearchTerm
                            ? `We couldn't find any matches for "${popupSearchTerm}"`
                            : "All available skills have been added."}
                        </p>
                      </div>
                    ) : (
                      <>
                        {searchResults.map((skillName) => {
                          const isSelected =
                            popupSelectedSkills.includes(skillName);
                          return (
                            <button
                              key={skillName}
                              type="button"
                              onClick={() => toggleSkillInPopup(skillName)}
                              title={skillName}
                              className={`
                                px-4 py-3 rounded-lg border-2 text-left text-sm font-medium transition-all duration-150
                                ${isSelected
                                  ? "border-custom-blue bg-custom-blue/10 text-custom-blue ring-2 ring-custom-blue/20"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                                }
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span className="truncate">{skillName}</span>
                                {isSelected && (
                                  <svg
                                    className="w-5 h-5 text-custom-blue flex-shrink-0 ml-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </button>
                          );
                        })}
                        {searchResults.length >= MAX_POPUP_SKILLS && (
                          <div className="col-span-full text-center py-3 text-sm text-gray-500">
                            Showing first {MAX_POPUP_SKILLS} results. Type to refine your search.
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                  <button
                    type="button"
                    onClick={handleCloseSkillsPopup}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleApplySkillChanges}
                    className="px-5 py-2.5 rounded-lg font-medium transition-colors bg-custom-blue text-white hover:bg-custom-blue/90 shadow-sm"
                  >
                    Apply Changes
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}

        {/* Skills entries below - hidden in simpleMode */}
        {!simpleMode && (
          <div className="space-y-2 mb-4 mt-5">
            {entries.map((entry, index) => (
              <div key={index}>
                <div className={`border p-2 rounded-lg bg-gray-100 w-full flex`}>
                  <>
                    <div
                      className={`grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 bg-white rounded w-full p-2 mr-3 gap-2`}
                    >
                      <div className="px-1">
                        <DropdownWithSearchField
                          // options={getAvailableSkillsForRow(index).map((s) => ({
                          //   value:
                          //     s.SkillName === "__other__"
                          //       ? "__other__"
                          //       : s.SkillName,
                          //   label:
                          //     s.SkillName === "__other__" ? "Other" : s.SkillName,
                          //   }))}
                          options={getAvailableSkillsForRow(index)
                            .filter((s) => s.SkillName !== "__other__")
                            .map((s) => ({
                              value: s.SkillName,
                              label: s.SkillName,
                            }))}
                          isSearchable
                          value={entry.skill}
                          onChange={(e) => {
                            if (onUpdateEntry && e?.target?.value !== undefined) {
                              onUpdateEntry(index, {
                                ...entry,
                                skill: e.target.value,
                              });
                            }
                          }}
                          placeholder="Select Skill"
                          name={`skill-${index}`}
                          onMenuOpen={onOpenSkills}
                          error={rowErrors[index]?.skill ? "Skill required" : ""}
                          isCustomName={isCustomSkill[index] || false}
                          setIsCustomName={(value) => {
                            setIsCustomSkill({
                              ...isCustomSkill,
                              [index]: value,
                            });
                          }}
                        />
                        {/* {rowErrors[index]?.skill && (
                          <span className="text-red-500 text-xs mt-1">Skill required</span>
                        )} */}
                      </div>
                      <div className="px-1">
                        <DropdownSelect
                          options={
                            showRequirementLevel
                              ? positionExperienceOptions
                              : experienceOptionsRS
                          }
                          isSearchable={false}
                          value={
                            showRequirementLevel
                              ? positionExperienceOptions.find(
                                (o) => o.value === entry.experience,
                              ) || null
                              : experienceOptionsRS.find(
                                (o) => o.value === entry.experience,
                              ) || null
                          }
                          onChange={(opt) => {
                            if (onUpdateEntry) {
                              onUpdateEntry(index, {
                                ...entry,
                                experience: opt?.value || "",
                              });
                            }
                          }}
                          placeholder="Select Experience"
                          classNamePrefix="rs"
                          hasError={rowErrors[index]?.experience}
                        />
                        {rowErrors[index]?.experience && (
                          <span className="text-red-500 text-xs mt-1">
                            Experience required
                          </span>
                        )}
                      </div>
                      {!showRequirementLevel && (
                        <div className="px-1">
                          <DropdownSelect
                            options={expertiseOptionsRS}
                            isSearchable={false}
                            value={
                              expertiseOptionsRS.find(
                                (o) => o.value === entry.expertise,
                              ) || null
                            }
                            onChange={(opt) => {
                              if (onUpdateEntry) {
                                onUpdateEntry(index, {
                                  ...entry,
                                  expertise: opt?.value || "",
                                });
                              }
                            }}
                            placeholder="Select Expertise"
                            classNamePrefix="rs"
                            hasError={rowErrors[index]?.expertise}
                          />
                          {rowErrors[index]?.expertise && (
                            <span className="text-red-500 text-xs mt-1">
                              Expertise required
                            </span>
                          )}
                        </div>
                      )}
                      {showRequirementLevel && (
                        <div className="px-1">
                          <DropdownSelect
                            options={requirementLevelOptions}
                            isSearchable={false}
                            value={
                              requirementLevelOptions.find(
                                (o) => o.value === entry.requirement_level,
                              ) || requirementLevelOptions[0]
                            }
                            onChange={(opt) => {
                              if (onUpdateEntry) {
                                onUpdateEntry(index, {
                                  ...entry,
                                  requirement_level: opt?.value || "REQUIRED",
                                });
                              }
                            }}
                            placeholder="Requirement Level"
                            classNamePrefix="rs"
                          />
                        </div>
                      )}
                    </div>
                    {/* Only show delete button for rows beyond the 3rd row */}
                    {entries.length > 3 && (
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeleteSkill) {
                              onDeleteSkill(index); // Delete only this specific row
                            }
                          }}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete Row"
                        >
                          <FaTrash className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </>
                </div>
                {/* Show individual row error summary if there are errors */}
                {/* {errors.skills && (
                <p className="text-red-500 text-sm">{errors.skills}</p>
                )} */}
                {rowErrors[index] && (
                  <p className="text-red-500 text-xs mt-1 ml-2">
                    Row {index + 1}: Please fill in all required fields
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
        {/* v1.0.2 ------------------------------------------------------------------> */}

        {!simpleMode && deleteIndex !== null && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-5 rounded shadow-lg">
              <p>Are you sure you want to delete this Skill?</p>
              <div className="flex justify-center space-x-2 mt-4">
                <button
                  onClick={confirmDelete}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={cancelDelete}
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  },
);
// v1.0.1 ----------------------------------------------------------------------------------->

export default SkillsField;
