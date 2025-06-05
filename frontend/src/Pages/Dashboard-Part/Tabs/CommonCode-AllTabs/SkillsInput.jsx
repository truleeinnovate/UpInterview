import { useState } from 'react';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';

const SkillsField = ({
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
}) => {
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [showSkillSelection, setShowSkillSelection] = useState(false);

  const handleDelete = (index) => {
    setDeleteIndex(index);
  };

  const confirmDelete = () => {
    if (deleteIndex !== null) {
      onDeleteSkill(deleteIndex);
      setDeleteIndex(null);
    }
  };

  const cancelDelete = () => {
    setDeleteIndex(null);
  };

  const handleEdit = (index) => {
    const entry = entries[index];
    onEditSkill(index);
    setEditingIndex(index);
    setSelectedSkill(entry.skill);
    setSelectedExp(entry.experience);
    setSelectedLevel(entry.expertise);
    setShowSkillSelection(true);
  };

  const handleAddClick = () => {
    onAddSkill();
    setEditingIndex(null);
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setShowSkillSelection(true);
  };

  const handleCancelSelection = () => {
    setShowSkillSelection(false);
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
    setEditingIndex(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center mb-2">
          <label htmlFor="Skills" className="text-sm font-medium text-gray-900">
            Skills <span className="text-red-500">*</span>
          </label>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded"
        >
          <FaPlus className="mr-1 w-5 h-5" /> Add Skills
        </button>
      </div>
      {errors.skills && (
        <p className="text-red-500 text-sm">{errors.skills}</p>
      )}
      <div className="space-y-2 mb-4 mt-5">
        {showSkillSelection && (
          <div className="border p-2 rounded-lg bg-gray-100 w-[100%] sm:w-full md:w-full">
            <div className="flex justify-between border bg-white rounded w-full p-2">
              <div className="w-1/3 px-2">
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none"
                >
                  <option value="">Select Skill</option>
                  {skills.map(skill => (
                    <option 
                      key={skill._id} 
                      value={skill.SkillName}
                      disabled={allSelectedSkills.includes(skill.SkillName) && selectedSkill !== skill.SkillName}
                    >
                      {skill.SkillName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-1/3 px-2">
                <select
                  value={selectedExp}
                  onChange={(e) => setSelectedExp(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none"
                >
                  <option value="">Select Experience</option>
                  {experienceOptions.map(exp => (
                    <option key={exp} value={exp}>{exp}</option>
                  ))}
                </select>
              </div>
              <div className="w-1/3 px-2">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full border p-2 rounded focus:outline-none"
                >
                  <option value="">Select Expertise</option>
                  {expertiseOptions.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={handleCancelSelection}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleAddEntry();
                  setShowSkillSelection(false);
                }}
                className={`bg-custom-blue text-white px-4 py-2 rounded ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!isNextEnabled()}
              >
                {editingIndex !== null ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        )}

        {entries.map((entry, index) => (
          <div key={index} className="border p-2 rounded-lg bg-gray-100 w-[100%] sm:w-full md:w-full flex">
            <div className="flex justify-between border bg-white rounded w-full mr-3">
              <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {entry.skill}
              </div>
              <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {entry.experience}
              </div>
              <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
                {entry.expertise}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleEdit(index)}
                className="text-custom-blue text-md"
              >
                <FaEdit />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(index)}
                className="text-md"
              >
                <FaTrash fill="red" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-end items-center right-0 pr-44 z-50">
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
};

export default SkillsField;