// ----- v1.0.0 ----- Venkatesh----improve dropdown styles and placeholder text in small devices shown in ellipsis and border border-gray-300 added
// v1.0.1 - Ashok - added useForward ref to implement scroll to first error functionality
// v1.0.2 - Ashok - added responsiveness
import { useState, useEffect, useRef, forwardRef } from "react";
import { ReactComponent as FaTrash } from "../../../../icons/FaTrash.svg";
// Removed FaEdit import - not needed for always-editable rows
import { ReactComponent as FaPlus } from "../../../../icons/FaPlus.svg";
// Removed FaTimes import - not needed for always-editable rows
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";

const SkillsField = forwardRef(
  (
    {
      entries,
      errors,
      onAddSkill,

      onDeleteSkill,
      onUpdateEntry,  // New prop for updating entries
      onSkillsValidChange,  // New prop to notify parent when skills validity changes
      
      skills,
      expertiseOptions,
      experienceOptions,
      
      onOpenSkills,
    },
    ref
  ) => {
    const [deleteIndex, setDeleteIndex] = useState(null);
    const initializedRef = useRef(false);
    const [rowErrors, setRowErrors] = useState({});

    

    const confirmDelete = () => {
      if (deleteIndex !== null) {
        onDeleteSkill(deleteIndex);
        setDeleteIndex(null);
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
        .map(e => e.skill)
        .filter(Boolean); // Remove empty values
      
      // Return skills that are either:
      // 1. Not selected in any other row, OR
      // 2. Currently selected in this row (so it remains visible)
      const currentRowSkill = entries[rowIndex]?.skill;
      return skills.filter(
        (skill) =>
          !otherSelectedSkills.includes(skill.SkillName) ||
          skill.SkillName === currentRowSkill
      );
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
      if (entries.length < 10) { // Max 10 rows
        onAddSkill(null); // Don't set editing index for new rows
      }
    };

    // Removed handleClearRow - not needed since we have delete functionality

    // Validate individual rows when entries change
    useEffect(() => {
      const newRowErrors = {};
      let hasAtLeastOneCompleteRow = false;
      
      entries.forEach((entry, index) => {
        // Only validate rows that have at least one field filled
        const hasAnyValue = entry.skill || entry.experience || entry.expertise;
        const isCompleteRow = entry.skill && entry.experience && entry.expertise;
        
        if (isCompleteRow) {
          hasAtLeastOneCompleteRow = true;
        }
        
        if (hasAnyValue) {
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
      });
      
      setRowErrors(newRowErrors);
      
      // Notify parent component about skills validity
      if (onSkillsValidChange) {
        onSkillsValidChange(hasAtLeastOneCompleteRow);
      }
    }, [entries, onSkillsValidChange]);

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

    return (
      <div ref={ref}>
        <div className="flex justify-between items-center">
          <div className="flex items-center mb-2">
            <label
              htmlFor="Skills"
              className="text-sm font-medium text-gray-900"
            >
              Skills Details <span className="text-red-500">*</span>
            </label>
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

        {errors.skills && (
          <p className="text-red-500 text-sm">{errors.skills}</p>
        )}
        {/* Skills entries below */}
        <div className="space-y-2 mb-4 mt-5">
          {entries.map((entry, index) => (
            <div key={index}>
              <div
                className={`border p-2 rounded-lg bg-gray-100 w-full flex`}
              >
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 bg-white rounded w-full p-2 mr-3 gap-2">
                    <div className="px-1">
                      <DropdownSelect
                        options={getAvailableSkillsForRow(index).map((s) => ({
                          value: s.SkillName,
                          label: s.SkillName,
                        }))}
                        isSearchable
                        value={
                          entry.skill ? { value: entry.skill, label: entry.skill } : null
                        }
                        onChange={(opt) => {
                          if (onUpdateEntry) {
                            onUpdateEntry(index, { ...entry, skill: opt?.value || "" });
                          }
                        }}
                        placeholder="Skill"
                        classNamePrefix="rs"
                        onMenuOpen={onOpenSkills}
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: rowErrors[index]?.skill ? '#ef4444' : base.borderColor,
                            '&:hover': {
                              borderColor: rowErrors[index]?.skill ? '#ef4444' : base['&:hover']?.borderColor
                            }
                          })
                        }}
                      />
                      {rowErrors[index]?.skill && (
                        <span className="text-red-500 text-xs mt-1">Skill required</span>
                      )}
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
                            onUpdateEntry(index, { ...entry, experience: opt?.value || "" });
                          }
                        }}
                        placeholder="Experience"
                        classNamePrefix="rs"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: rowErrors[index]?.experience ? '#ef4444' : base.borderColor,
                            '&:hover': {
                              borderColor: rowErrors[index]?.experience ? '#ef4444' : base['&:hover']?.borderColor
                            }
                          })
                        }}
                      />
                      {rowErrors[index]?.experience && (
                        <span className="text-red-500 text-xs mt-1">Experience required</span>
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
                            onUpdateEntry(index, { ...entry, expertise: opt?.value || "" });
                          }
                        }}
                        placeholder="Expertise"
                        classNamePrefix="rs"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderColor: rowErrors[index]?.expertise ? '#ef4444' : base.borderColor,
                            '&:hover': {
                              borderColor: rowErrors[index]?.expertise ? '#ef4444' : base['&:hover']?.borderColor
                            }
                          })
                        }}
                      />
                      {rowErrors[index]?.expertise && (
                        <span className="text-red-500 text-xs mt-1">Expertise required</span>
                      )}
                    </div>
                  </div>
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
                </>
              </div>
              {/* Show individual row error summary if there are errors */}
              {/* {rowErrors[index] && (
                <p className="text-red-500 text-xs mt-1 ml-2">
                  Row {index + 1}: Please fill in all required fields
                </p>
              )} */}
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
