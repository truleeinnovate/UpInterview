// ----- v1.0.0 ----- Venkatesh----improve dropdown styles and placeholder text in small devices shown in ellipsis and border border-gray-300 added
// v1.0.1 - Ashok - added useForward ref to implement scroll to first error functionali
import { useState, useRef, useEffect, forwardRef } from 'react';
import { ReactComponent as FaTrash } from '../../../../icons/FaTrash.svg';
import { ReactComponent as FaEdit } from '../../../../icons/FaEdit.svg';
import { ReactComponent as FaPlus } from '../../../../icons/FaPlus.svg';
import { ReactComponent as FaTimes } from '../../../../icons/FaTimes.svg';
import { ChevronDown, Search } from 'lucide-react';

// Lightweight searchable dropdown copied from AddCandidateForm.jsx
const CustomDropdown = ({
  name,
  value,
  options,
  onChange,
  placeholder,
  optionKey,
  optionValue,
  disableSearch = false,
}) => {
  const [show, setShow] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    const selectedValue = optionValue ? option[optionValue] : option;
    onChange({ target: { name, value: selectedValue } });
    setShow(false);
    setSearchTerm('');
  };

  const filteredOptions = options?.filter((option) => {
    const display = optionKey ? option[optionKey] : option;
    return display.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        type="text"
        name={name}
        readOnly
        placeholder={placeholder}
        value={value}
        onClick={() => setShow(!show)}
        // <-----v1.0.0--
        className="block w-full px-3 py-2 h-8 text-gray-900 border border-gray-400 rounded focus:outline-none focus:ring-1 whitespace-nowrap overflow-ellipsis"
        // -----v1.0.0---> 
        
      />
      <ChevronDown
        className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 cursor-pointer"
        onClick={() => setShow(!show)}
      />
      {show && (
        <div className="absolute bg-white border border-gray-300 mt-1 w-full max-h-56 overflow-y-auto z-10 text-xs">
          {!disableSearch && (
            <div className="border-b p-2">
              <div className="relative">
                <Search className="absolute left-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                <input
                  type="text"
                  className="pl-5 py-1 border border-gray-200 rounded-md w-full text-xs focus:outline-none"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          {filteredOptions?.length ? (
            filteredOptions.map((option, idx) => (
              <div
                key={option._id || idx}
                className="p-2 hover:bg-gray-200 cursor-pointer"
                onClick={() => handleSelect(option)}
              >
                {optionKey ? option[optionKey] : option}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No options</div>
          )}
        </div>
      )}
    </div>
  );
};

// v1.0.1 <----------------------------------------------------------------------------------
// const SkillsField = ({
//   entries,
//   errors,
//   onAddSkill,
//   onEditSkill,
//   onDeleteSkill,
//   setEditingIndex,
//   editingIndex,
//   selectedSkill,
//   setSelectedSkill,
//   allSelectedSkills,
//   selectedExp,
//   setSelectedExp,
//   selectedLevel,
//   setSelectedLevel,
//   skills,
//   expertiseOptions,
//   experienceOptions,
//   isNextEnabled,
//   handleAddEntry,
// }) => {
//   const [deleteIndex, setDeleteIndex] = useState(null);


//   const handleDelete = (index) => {
//     setDeleteIndex(index);
//   };

//   const confirmDelete = () => {
//     if (deleteIndex !== null) {
//       onDeleteSkill(deleteIndex);
//       setDeleteIndex(null);
//     }
//   };

//   const cancelDelete = () => {
//     setDeleteIndex(null);
//   };

//   const handleEdit = (index) => {
//     const entry = entries[index];
//     setSelectedSkill(entry.skill || '');
//     setSelectedExp(entry.experience || '');
//     setSelectedLevel(entry.expertise || '');
//     setEditingIndex(index);
//     onEditSkill(index);
//   };

//   const availableSkills = skills.filter(
//     (skill) => !allSelectedSkills.includes(skill.SkillName) || selectedSkill === skill.SkillName
//   );

//   const handleAddClick = () => {
//     onAddSkill(setEditingIndex); // Pass setEditingIndex to the parent's onAddSkill
//     // The setEditingIndex will now be handled by the parent's onAddSkill callback
//     setSelectedSkill("");
//     setSelectedExp("");
//     setSelectedLevel("");
//   };

//   const handleCancelSelection = () => {
//     // If the current editingIndex points to a newly added, empty row, delete it.
//     // A newly added row will have an editingIndex, and its skill, experience, and expertise will be empty.
//     if (editingIndex !== null &&
//         entries[editingIndex] &&
//         !entries[editingIndex].skill &&
//         !entries[editingIndex].experience &&
//         !entries[editingIndex].expertise) {
//       onDeleteSkill(editingIndex);
//     }
//     setSelectedSkill("");
//     setSelectedExp("");
//     setSelectedLevel("");
//     setEditingIndex(null);
//   };

//   return (
//     <div>
//       <div className="flex justify-between items-center">
//         <div className="flex items-center mb-2">
//           <label htmlFor="Skills" className="text-sm font-medium text-gray-900">
//             Skills Details <span className="text-red-500">*</span>
//           </label>
//         </div>
//         <button
//           type="button"
//           onClick={handleAddClick}
//           disabled={editingIndex !== null && entries.length > 0}
//           className={`flex items-center justify-center text-sm bg-custom-blue text-white px-2 py-1 rounded ${editingIndex !== null && entries.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
//         >
//           <FaPlus className="mr-1 w-5 h-5" /> Add Rows
//         </button>
//       </div>
//       {errors.skills && (
//         <p className="text-red-500 text-sm">{errors.skills}</p>
//       )}
//       <div className="space-y-2 mb-4 mt-5">
//         {entries.map((entry, index) => (
//           <div key={index} className="border p-2 rounded-lg bg-gray-100 w-[100%] sm:w-full md:w-full flex">
//             { editingIndex === index || editingIndex === 'all' ? (
//               // EDIT MODE
//               <>
//                 <div className="flex justify-between border border-gray-400 bg-white rounded w-full p-2 mr-3">
//                   <div className="w-1/3 px-1">
//                     <CustomDropdown
//                       name="skill"
//                       value={selectedSkill}
//                       options={availableSkills}
//                       onChange={(e) => setSelectedSkill(e.target.value)}
//                       placeholder="Select Skill"
//                       optionKey="SkillName"
//                       optionValue="SkillName"
//                     />
//                   </div>
//                   <div className="w-1/3 px-1">
//                     <CustomDropdown
//                       name="experience"
//                       value={selectedExp}
//                       options={experienceOptions}
//                       onChange={(e) => setSelectedExp(e.target.value)}
//                       placeholder="Select Experience"
//                       disableSearch={true}
//                     />
//                   </div>
//                   <div className="w-1/3 px-1">
//                     <CustomDropdown
//                       name="expertise"
//                       value={selectedLevel}
//                       options={expertiseOptions}
//                       onChange={(e) => setSelectedLevel(e.target.value)}
//                       placeholder="Select Expertise"
//                       disableSearch={true}
//                     />
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                 <button
//                     type="button"
//                     onClick={() => {
//                       handleAddEntry();
//                     }}
//                     className={`text-green-600 hover:text-green-800 p-1 ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
//                     disabled={!isNextEnabled()}
//                     title='Add'
//                   >
//                     <FaPlus className="w-5 h-5" />{/* {editingIndex !== null ? <FaPlus /> : <FaPlus />} */}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={handleCancelSelection}
//                     className="text-red-600 hover:text-red-800 p-1"
//                     title='Cancel'
//                   >
//                     <FaTimes className="w-5 h-5" />
//                   </button>
//                 </div>
//               </>
//             ) : (
//               // DISPLAY MODE
//               <>
//                 <div className="flex justify-between border border-gray-400 bg-white rounded w-full mr-3">
//                   <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
//                     {entry.skill}
//                   </div>
//                   <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
//                     {entry.experience}
//                   </div>
//                   <div className="w-1/3 px-2 py-1 text-center truncate overflow-hidden text-ellipsis whitespace-nowrap">
//                     {entry.expertise}
//                   </div>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     type="button"
//                     onClick={() => handleEdit(index)}
//                     className="text-custom-blue text-md"
//                     title='Edit'
//                   >
//                     <FaEdit className="w-5 h-5"/>
//                   </button>
//                   <button
//                     type="button"
//                     onClick={() => handleDelete(index)}
//                     className="text-md"
//                     title='Delete'
//                   >
//                     <FaTrash className="w-5 h-5" fill="red" />
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         ))}
//       </div>

//       {deleteIndex !== null && (
//         <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
//           <div className="bg-white p-5 rounded shadow-lg">
//             <p>Are you sure you want to delete this Skill?</p>
//             <div className="flex justify-center space-x-2 mt-4">
//               <button
//                 onClick={confirmDelete}
//                 className="bg-red-500 text-white px-4 py-2 rounded"
//               >
//                 Yes
//               </button>
//               <button
//                 onClick={cancelDelete}
//                 className="bg-gray-300 text-black px-4 py-2 rounded"
//               >
//                 No
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// import React, { forwardRef, useState } from "react";
// import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";
// import CustomDropdown from "./CustomDropdown"; // Adjust the import as needed

const SkillsField = forwardRef(({
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
}, ref) => {
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
    setSelectedSkill(entry.skill || '');
    setSelectedExp(entry.experience || '');
    setSelectedLevel(entry.expertise || '');
    setEditingIndex(index);
    onEditSkill(index);
  };

  const availableSkills = skills.filter(
    (skill) => !allSelectedSkills.includes(skill.SkillName) || selectedSkill === skill.SkillName
  );

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
          <div key={index} className="border p-2 rounded-lg bg-gray-100 w-full flex">
            {editingIndex === index || editingIndex === 'all' ? (
              <>
                <div className="flex justify-between border border-gray-400 bg-white rounded w-full p-2 mr-3">
                  <div className="w-1/3 px-1">
                    <CustomDropdown
                      name="skill"
                      value={selectedSkill}
                      options={availableSkills}
                      onChange={(e) => setSelectedSkill(e.target.value)}
                      placeholder="Select Skill"
                      optionKey="SkillName"
                      optionValue="SkillName"
                    />
                  </div>
                  <div className="w-1/3 px-1">
                    <CustomDropdown
                      name="experience"
                      value={selectedExp}
                      options={experienceOptions}
                      onChange={(e) => setSelectedExp(e.target.value)}
                      placeholder="Select Experience"
                      disableSearch={true}
                    />
                  </div>
                  <div className="w-1/3 px-1">
                    <CustomDropdown
                      name="expertise"
                      value={selectedLevel}
                      options={expertiseOptions}
                      onChange={(e) => setSelectedLevel(e.target.value)}
                      placeholder="Select Expertise"
                      disableSearch={true}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleAddEntry}
                    className={`text-green-600 hover:text-green-800 p-1 ${!isNextEnabled() ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <div className="flex justify-between border border-gray-400 bg-white rounded w-full mr-3">
                  <div className="w-1/3 px-2 py-1 text-center truncate">{entry.skill}</div>
                  <div className="w-1/3 px-2 py-1 text-center truncate">{entry.experience}</div>
                  <div className="w-1/3 px-2 py-1 text-center truncate">{entry.expertise}</div>
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
});
// v1.0.1 ----------------------------------------------------------------------------------->

export default SkillsField;