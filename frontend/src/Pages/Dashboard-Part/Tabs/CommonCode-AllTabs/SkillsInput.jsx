// ----- v1.0.0 ----- Venkatesh----improve dropdown styles and placeholder text in small devices shown in ellipsis and border border-gray-300 added
// v1.0.1 - Ashok - added useForward ref to implement scroll to first error functionality
// v1.0.2 - Ashok - added responsiveness
import { useState, forwardRef } from "react";
import { ReactComponent as FaTrash } from "../../../../icons/FaTrash.svg";
import { ReactComponent as FaEdit } from "../../../../icons/FaEdit.svg";
import { ReactComponent as FaPlus } from "../../../../icons/FaPlus.svg";
import { ReactComponent as FaTimes } from "../../../../icons/FaTimes.svg";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";

const SkillsField = forwardRef(
  (
    {
      entries,
      errors,
      onAddSkill,
      onEditSkill,
      onDeleteSkill,
      setEditingIndex,
      editingIndex,
      selectedSkill,
      setSelectedSkill,
      allSelectedSkills,
      selectedExp,
      setSelectedExp,
      selectedLevel,
      setSelectedLevel,
      skills,
      expertiseOptions,
      experienceOptions,
      isNextEnabled,
      handleAddEntry,
    },
    ref
  ) => {
    const [deleteIndex, setDeleteIndex] = useState(null);

    const handleDelete = (index) => setDeleteIndex(index);

    const confirmDelete = () => {
      if (deleteIndex !== null) {
        onDeleteSkill(deleteIndex);
        setDeleteIndex(null);
      }
    };

    const cancelDelete = () => setDeleteIndex(null);

    const handleEdit = (index) => {
      const entry = entries[index];
      setSelectedSkill(entry.skill || "");
      setSelectedExp(entry.experience || "");
      setSelectedLevel(entry.expertise || "");
      setEditingIndex(index);
      onEditSkill(index);
    };

    // Using shared DropdownSelect; no local input handler needed

    const availableSkills = skills.filter(
      (skill) =>
        !allSelectedSkills.includes(skill.SkillName) ||
        selectedSkill === skill.SkillName
    );

    // Map options for DropdownSelect (react-select format)
    const availableSkillsOptions = availableSkills.map((s) => ({
      value: s.SkillName,
      label: s.SkillName,
    }));
    const experienceOptionsRS = experienceOptions.map((e) => ({
      value: e,
      label: e,
    }));
    const expertiseOptionsRS = expertiseOptions.map((e) => ({
      value: e,
      label: e,
    }));

    const handleAddClick = () => {
      onAddSkill(setEditingIndex);
      setSelectedSkill("");
      setSelectedExp("");
      setSelectedLevel("");
    };

    const handleCancelSelection = () => {
      if (
        editingIndex !== null &&
        entries[editingIndex] &&
        !entries[editingIndex].skill &&
        !entries[editingIndex].experience &&
        !entries[editingIndex].expertise
      ) {
        onDeleteSkill(editingIndex);
      }
      setSelectedSkill("");
      setSelectedExp("");
      setSelectedLevel("");
      setEditingIndex(null);
    };

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
          <button
            type="button"
            onClick={handleAddClick}
            disabled={editingIndex !== null && entries.length > 0}
            className={`flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded ${
              editingIndex !== null && entries.length > 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            <FaPlus className="mr-1 w-5 h-5" /> Add Rows
          </button>
        </div>

        {errors.skills && (
          <p className="text-red-500 text-sm">{errors.skills}</p>
        )}
        {/* Skills entries below */}
        <div className="space-y-2 mb-4 mt-5">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="border p-2 rounded-lg bg-gray-100 w-full flex"
            >
              {editingIndex === index || editingIndex === "all" ? (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 border border-gray-400 bg-white rounded w-full p-2 mr-3 gap-2">
                    <div className="px-1">
                      <DropdownSelect
                        options={availableSkillsOptions}
                        isSearchable
                        value={
                          availableSkillsOptions.find(
                            (o) => o.value === selectedSkill
                          ) || null
                        }
                        onChange={(opt) => setSelectedSkill(opt?.value || "")}
                        placeholder="Select Skill"
                        classNamePrefix="rs"
                      />
                    </div>
                    <div className="px-1">
                      <DropdownSelect
                        options={experienceOptionsRS}
                        isSearchable={false}
                        value={
                          experienceOptionsRS.find(
                            (o) => o.value === selectedExp
                          ) || null
                        }
                        onChange={(opt) => setSelectedExp(opt?.value || "")}
                        placeholder="Select Experience"
                        classNamePrefix="rs"
                      />
                    </div>
                    <div className="px-1">
                      <DropdownSelect
                        options={expertiseOptionsRS}
                        isSearchable={false}
                        value={
                          expertiseOptionsRS.find(
                            (o) => o.value === selectedLevel
                          ) || null
                        }
                        onChange={(opt) => setSelectedLevel(opt?.value || "")}
                        placeholder="Select Expertise"
                        classNamePrefix="rs"
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddEntry}
                      className={`text-green-600 hover:text-green-800 p-1 ${
                        !isNextEnabled() ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!isNextEnabled()}
                      title="Add"
                    >
                      <FaPlus className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelSelection}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Cancel"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 border border-gray-400 bg-white rounded w-full mr-3">
                    <div className="border-b lg:border-none xl:border-none 2xl:border-none border-gray-300 px-2 py-1 sm:text-start lg:text-center xl:text-center 2xl:text-center truncate">
                      {entry.skill}
                    </div>
                    <div className="border-b lg:border-none xl:border-none 2xl:border-none border-gray-300 px-2 py-1 sm:text-start lg:text-center xl:text-center 2xl:text-center truncate">
                      {entry.experience}
                    </div>
                    <div className="px-2 py-1 sm:text-start lg:text-center xl:text-center 2xl:text-center truncate">
                      {entry.expertise}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(index)}
                      className="text-custom-blue text-md"
                      title="Edit"
                    >
                      <FaEdit className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="text-md"
                      title="Delete"
                    >
                      <FaTrash className="w-5 h-5" fill="red" />
                    </button>
                  </div>
                </>
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
