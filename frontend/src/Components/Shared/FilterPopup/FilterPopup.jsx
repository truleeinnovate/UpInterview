import React, { useState, useEffect, useRef } from 'react';
import { useCustomContext } from '../../../Context/Contextfetch';
import { ReactComponent as IoIosArrowUp } from "../../../icons/IoIosArrowUp.svg";
import { ReactComponent as IoIosArrowDown } from "../../../icons/IoIosArrowDown.svg";

export const FilterPopup = ({ 
  isOpen, 
  onClose, 
  onApply, 
  initialFilters = {
    status: [],
    tech: [],
    experience: { min: '', max: '' }
  },
  filterIconRef, // Reference to the filter icon for positioning
  onClearAll // Callback when Clear All is clicked
}) => {
  const { skills, qualification } = useCustomContext();
  const [selectedStatus, setSelectedStatus] = useState(initialFilters.status);
  const [selectedTech, setSelectedTech] = useState(initialFilters.tech);
  const [experience, setExperience] = useState(initialFilters.experience);
  const [isQualificationOpen, setIsQualificationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  const popupRef = useRef(null);

  // Reset filters when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus(initialFilters.status);
      setSelectedTech(initialFilters.tech);
      setExperience(initialFilters.experience);
      setIsQualificationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
    }
  }, [isOpen, initialFilters]);

  // Position popup below filter icon and handle window resize
  useEffect(() => {
    if (!isOpen || !filterIconRef?.current || !popupRef.current) return;

    const updatePopupPosition = () => {
      const rect = filterIconRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      const popupWidth = 320; // 20rem = 320px
      
      // Calculate left position to ensure popup stays in viewport
      let leftPosition = rect.left + window.scrollX;
      
      // If popup would go off the right side of the viewport, align it to the right
      if (leftPosition + popupWidth > window.innerWidth) {
        leftPosition = window.innerWidth - popupWidth - 16; // 16px padding from edge
      }
      // Ensure minimum left position
      leftPosition = Math.max(16, leftPosition);
      
      // Calculate top position with viewport boundary check
      const popupHeight = popup.offsetHeight;
      const viewportHeight = window.innerHeight;
      const bottomSpace = viewportHeight - rect.bottom - window.scrollY - 16; // 16px bottom padding
      
      let topPosition;
      if (bottomSpace < popupHeight && rect.top > popupHeight) {
        // If not enough space below but enough space above, position above the icon
        topPosition = rect.top + window.scrollY - popupHeight - 8; // 8px gap
      } else {
        // Default: position below the icon
        topPosition = rect.bottom + window.scrollY + 8; // 8px gap
      }
      
      popup.style.position = 'fixed';
      popup.style.top = `${topPosition}px`;
      popup.style.left = `${leftPosition}px`;
      popup.style.width = `${popupWidth}px`;
      popup.style.zIndex = '1000'; // Ensure it's above other content
    };

    // Initial position update
    updatePopupPosition();

    // Add resize and scroll event listeners
    window.addEventListener('resize', updatePopupPosition);
    window.addEventListener('scroll', updatePopupPosition, true);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', updatePopupPosition);
      window.removeEventListener('scroll', updatePopupPosition, true);
    };
  }, [isOpen, filterIconRef]);

  const handleStatusToggle = (status) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status) 
        : [...prev, status]
    );
  };

  const handleTechToggle = (tech) => {
    setSelectedTech(prev => 
      prev.includes(tech) 
        ? prev.filter(t => t !== tech) 
        : [...prev, tech]
    );
  };

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ''));
    setExperience(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      tech: [],
      experience: { min: '', max: '' }
    };
    setSelectedStatus([]);
    setSelectedTech([]);
    setExperience({ min: '', max: '' });
    
    // Call onClearAll if provided, otherwise call onApply with empty filters
    if (onClearAll) {
      onClearAll(clearedFilters);
    } else {
      onApply(clearedFilters);
    }
    onClose();
  };

  const handleApply = () => {
    onApply({
      status: selectedStatus,
      tech: selectedTech,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200"
      style={{ maxHeight: '60vh' }}
    >
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Qualification Section */}
        <div>
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsQualificationOpen(!isQualificationOpen)}>
            <span className="font-medium text-gray-700">Qualification</span>
            {isQualificationOpen ? <IoIosArrowUp className="text-xl" /> : <IoIosArrowDown className="text-xl" />}
          </div>
          {isQualificationOpen && (
            <div className="mt-2 space-y-2 pl-4">
              {qualification.map((q) => (
                <label key={q.QualificationName} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedStatus.includes(q.QualificationName)}
                    onChange={() => handleStatusToggle(q.QualificationName)}
                    className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                  />
                  <span className="text-sm">{q.QualificationName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Skills Section */}
        <div>
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsSkillsOpen(!isSkillsOpen)}>
            <span className="font-medium text-gray-700">Skills</span>
            {isSkillsOpen ? <IoIosArrowUp className="text-xl" /> : <IoIosArrowDown className="text-xl" />}
          </div>
          {isSkillsOpen && (
            <div className="mt-2 space-y-2 pl-4">
              {skills?.map((skill) => (
                <label key={skill.SkillName} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedTech.includes(skill.SkillName)}
                    onChange={() => handleTechToggle(skill.SkillName)}
                    className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                  />
                  <span className="text-sm">{skill.SkillName}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Experience Section */}
        <div>
          <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsExperienceOpen(!isExperienceOpen)}>
            <span className="font-medium text-gray-700">Experience</span>
            {isExperienceOpen ? <IoIosArrowUp className="text-xl" /> : <IoIosArrowDown className="text-xl" />}
          </div>
          {isExperienceOpen && (
            <div className="mt-2 space-y-4 pl-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Min (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={experience.min}
                    onChange={(e) => handleExperienceChange(e, 'min')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700">Max (years)</label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={experience.max}
                    onChange={(e) => handleExperienceChange(e, 'max')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex justify-between">
        <button
          onClick={handleClearAll}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Clear All
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-md hover:bg-custom-blue/90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};