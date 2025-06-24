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
    setSelectedSkill(entry.skill || '');
    setSelectedExp(entry.experience || '');
    setSelectedLevel(entry.expertise || '');
    setEditingIndex(index);
    onEditSkill(index);
  };

  const handleAddClick = () => {
    onAddSkill(setEditingIndex); // Pass setEditingIndex to the parent's onAddSkill
    // The setEditingIndex will now be handled by the parent's onAddSkill callback
    setSelectedSkill("");
    setSelectedExp("");
    setSelectedLevel("");
  };

  const handleCancelSelection = () => {
    // If the current editingIndex points to a newly added, empty row, delete it.
    // A newly added row will have an editingIndex, and its skill, experience, and expertise will be empty.
    if (editingIndex !== null &&
        entries[editingIndex] &&
        !entries[editingIndex].skill &&
        !entries[editingIndex].experience &&
        !entries[editingIndex].expertise) {
      onDeleteSkill(editingIndex);
    }
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
            Skills Details <span className="text-red-500">*</span>
          </label>
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          disabled={editingIndex !== null && entries.length > 0}
          className={`flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded ${editingIndex !== null && entries.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaPlus className="mr-1 w-5 h-5" /> Add Rows
        </button>
      </div>
      {errors.skills && (
        <p className="text-red-500 text-sm">{errors.skills}</p>
      )}
      <div className="space-y-2 mb-4 mt-5">
        {entries.map((entry, index) => (
          <div key={index} className="border p-2 rounded-lg bg-gray-100 w-[100%] sm:w-full md:w-full flex">
            { editingIndex === index || editingIndex === 'all' ? (
              // EDIT MODE
              <>
                <div className="flex justify-between border bg-white rounded w-full p-2 mr-3">
                  <div className="w-1/3 px-1">
                    <select
                      value={selectedSkill}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      className="w-full border p-1 rounded focus:outline-none"
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
                  <div className="w-1/3 px-1">
                    <select
                      value={selectedExp}
                      onChange={(e) => setSelectedExp(e.target.value)}
                      className="w-full border p-1 rounded focus:outline-none"
                    >
                      <option value="">Select Experience</option>
                      {experienceOptions.map(exp => (
                        <option key={exp} value={exp}>{exp}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-1/3 px-1">
                    <select
                      value={selectedLevel}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      className="w-full border p-1 rounded focus:outline-none"
                    >
                      <option value="">Select Expertise</option>
                      {expertiseOptions.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                <button
                    type="button"
                    onClick={() => {
                      handleAddEntry();
                    }}
                    className={`text-green-600 hover:text-green-800 p-1 ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!isNextEnabled()}
                    title='Add'
                  >
                    <FaPlus className="w-5 h-5" />{/* {editingIndex !== null ? <FaPlus /> : <FaPlus />} */}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelSelection}
                    className="text-red-600 hover:text-red-800 p-1"
                    title='Cancel'
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              // DISPLAY MODE
              <>
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
                    title='Edit'
                  >
                    <FaEdit className="w-5 h-5"/>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="text-md"
                    title='Delete'
                  >
                    <FaTrash className="w-5 h-5" fill="red" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {deleteIndex !== null && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
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