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
} from "react";
import { ReactComponent as FaTrash } from "../../../../icons/FaTrash.svg";
// Removed FaEdit import - not needed for always-editable rows
import { ReactComponent as FaPlus } from "../../../../icons/FaPlus.svg";
// Removed FaTimes import - not needed for always-editable rows
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";

const SkillsField = forwardRef(
  (
    {
      entries,
      errors,
      onAddSkill,

      onDeleteSkill,
      onUpdateEntry, // New prop for updating entries
      onSkillsValidChange, // New prop to notify parent when skills validity changes

      skills,

      onOpenSkills,
      showValidation = false, // New prop to control when validation errors are shown
      showRequirementLevel = false, // New prop to show/hide Requirement Level dropdown (only for Position)
    },
    ref
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
          !otherSelectedSkills.includes(skill.SkillName) ||
          skill.SkillName === currentRowSkill
      );

      // Add "Other" option at the end for custom skills
      return [
        ...availableSkills.map((s) => ({ SkillName: s.SkillName })),
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
          entry.skill && entry.experience && entry.expertise;
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
              if (!entry.expertise) {
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
            if (!entry.expertise) {
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
    }, [entries, onSkillsValidChange, showValidation]);

    // Auto-add three empty rows on first mount (no click needed)
    useEffect(() => {
      if (!initializedRef.current && entries.length === 0 && onAddSkill) {
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
              (skill) => skill.SkillName === entry.skill
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

    return (
      <div ref={containerRef}>
        <div className="flex justify-between items-center">
          <div className="flex flex-col mb-2">
            <label
              htmlFor="Skills"
              className="text-sm font-medium text-gray-900"
            >
              Skills Details <span className="text-red-500">*</span>
            </label>
            <span className="text-xs text-gray-500 mt-0.5">
              First 3 skills are mandatory
            </span>
          </div>
          {entries.length < 10 && (
            <button
              type="button"
              onClick={handleAddSkillRow}
              className="flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded hover:bg-custom-blue/80"
            >
              <FaPlus className="mr-1 w-5 h-5" /> Add Rows
            </button>
          )}
        </div>

        {/* Skills entries below */}
        <div className="space-y-2 mb-4 mt-5">
          {entries.map((entry, index) => (
            <div key={index}>
              <div className={`border p-2 rounded-lg bg-gray-100 w-full flex`}>
                <>
                  <div className={`grid grid-cols-1 ${showRequirementLevel ? 'lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4' : 'lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3'} bg-white rounded w-full p-2 mr-3 gap-2`}>
                    <div className="px-1">
                      <DropdownWithSearchField
                        options={getAvailableSkillsForRow(index).map((s) => ({
                          value:
                            s.SkillName === "__other__"
                              ? "__other__"
                              : s.SkillName,
                          label:
                            s.SkillName === "__other__" ? "Other" : s.SkillName,
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
                        options={experienceOptionsRS}
                        isSearchable={false}
                        value={
                          experienceOptionsRS.find(
                            (o) => o.value === entry.experience
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
                    <div className="px-1">
                      <DropdownSelect
                        options={expertiseOptionsRS}
                        isSearchable={false}
                        value={
                          expertiseOptionsRS.find(
                            (o) => o.value === entry.expertise
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
                    {showRequirementLevel && (
                      <div className="px-1">
                        <DropdownSelect
                          options={requirementLevelOptions}
                          isSearchable={false}
                          value={
                            requirementLevelOptions.find(
                              (o) => o.value === entry.requirement_level
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
        {/* v1.0.2 -----------------------------------------------------------------> */}

        {deleteIndex !== null && (
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
  }
);
// v1.0.1 ----------------------------------------------------------------------------------->

export default SkillsField;
