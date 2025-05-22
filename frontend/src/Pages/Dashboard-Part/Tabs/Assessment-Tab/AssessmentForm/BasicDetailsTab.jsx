import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as MdArrowDropDown } from "../../../../../icons/MdArrowDropDown.svg";
import { ReactComponent as CgInfo } from "../../../../../icons/CgInfo.svg";
import { ReactComponent as MdOutlineCancel } from "../../../../../icons/MdOutlineCancel.svg";
import { ReactComponent as IoIosAddCircle } from "../../../../../icons/IoIosAddCircle.svg";
import Switch from "react-switch";
import DatePicker from "react-datepicker";

const BasicDetailsTab = ({
  linkExpiryDays,
  toggleLinkExpiryDropdown,
  setLinkExpiryDays,
  showLinkExpiryDay,
  setShowLinkExpiryDays,
  assessmentTitleLimit,
  formData,
  handleInputChange,
  toggleDropdownAssessment,
  // handleRemoveAssessmentType,
  setFormData,
  // showDropdownAssessment,
  // assessmentTypes,
  // handleAssessmentTypeSelect,
  setShowDropdownAssessment,
  handleChange,
  handleIconClick,
  showMessage,
  selectedPosition,
  // toggleDropdownPosition,
  showDropdownPosition,
  difficultyLevels,
  handleDifficultySelect,
  selectedDuration,
  toggleDropdownDuration,
  showDropdownDuration,
  durations,
  handleDurationSelect,
  showUpgradePopup,
  closePopup,
  handleUpgrade,
  startDate,
  handleDateChange,
  CustomInput,
  showDropdownDifficulty,
  setSelectedPosition,
  handlePositionSelect,
  handleAddNewPositionClick,
  selectedDifficulty,
  setShowDropdownDifficulty,
  setShowDropdownPosition,
  setShowDropdownDuration,
  positions,
  errors,
}) => {
  // Refs for dropdown containers
  const linkExpiryRef = useRef(null);
  const assessmentTypeRef = useRef(null);
  const positionRef = useRef(null);
  const difficultyRef = useRef(null);
  const durationRef = useRef(null);

  // Close all dropdowns except the one specified
  const closeAllDropdowns = (except = null) => {
    if (except !== "linkExpiry") setShowLinkExpiryDays(false);
    if (except !== "assessment") setShowDropdownAssessment(false);
    if (except !== "position") setShowDropdownPosition(false);
    if (except !== "difficulty") setShowDropdownDifficulty(false);
    if (except !== "duration") setShowDropdownDuration(false);
  };

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (linkExpiryRef.current && !linkExpiryRef.current.contains(event.target)) &&
        (assessmentTypeRef.current && !assessmentTypeRef.current.contains(event.target)) &&
        (positionRef.current && !positionRef.current.contains(event.target)) &&
        (difficultyRef.current && !difficultyRef.current.contains(event.target)) &&
        (durationRef.current && !durationRef.current.contains(event.target))
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Modified toggle functions to close other dropdowns
  const modifiedToggleLinkExpiry = (e) => {
    if (e) e.stopPropagation();
    closeAllDropdowns("linkExpiry");
    toggleLinkExpiryDropdown();
  };

  const modifiedTogglePosition = (e) => {
    if (e) e.stopPropagation();
    closeAllDropdowns("position");
    setShowDropdownPosition(!showDropdownPosition);
  };

  const modifiedToggleDifficulty = (e) => {
    if (e) e.stopPropagation();
    closeAllDropdowns("difficulty");
    setShowDropdownDifficulty(!showDropdownDifficulty);
  };

  const modifiedToggleDuration = (e) => {
    if (e) e.stopPropagation();
    closeAllDropdowns("duration");
    toggleDropdownDuration();
  };

  return (
    <div>
      <form>
        <div className="space-y-6 px-12">
          <div className="font-semibold text-xl mb-5">Assessment Details:</div>

          {/* Assessment Name and Type */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            <div>
              <label
                htmlFor="AssessmentTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Assessment Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="AssessmentTitle"
                  id="AssessmentTitle"
                  maxLength={assessmentTitleLimit}
                  value={formData?.AssessmentTitle}
                  onChange={(e) =>
                    handleInputChange("AssessmentTitle", e.target.value)
                  }
                  autoComplete="off"
                  className={`block w-full border ${errors.AssessmentTitle ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {formData?.AssessmentTitle?.length >=
                  assessmentTitleLimit * 0.75 && (
                    <div className="text-right text-xs text-gray-500">
                      {formData?.AssessmentTitle?.length}/{assessmentTitleLimit}
                    </div>
                  )}
                {errors.AssessmentTitle && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.AssessmentTitle}
                  </p>
                )}
              </div>
            </div>


            <div>
              <label
                htmlFor="NumberOfQuestions"
                className="block text-sm font-medium text-gray-700"
              >
                No. of Questions <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="NumberOfQuestions"
                  value={formData.NumberOfQuestions}
                  onChange={handleChange}
                  id="NumberOfQuestions"
                  min="1"
                  max="100"
                  step="1"
                  autoComplete="off"
                  placeholder="Enter number of questions"
                  className={`block w-full border ${errors.NumberOfQuestions ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                  onKeyDown={(e) => e.preventDefault()} // 👈 Prevent typing
                />

                {errors.NumberOfQuestions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.NumberOfQuestions}
                  </p>
                )}
              </div>
            </div>

            {/* Assessment Type */}
            {/* <div ref={assessmentTypeRef}>
        <label
          htmlFor="AssessmentType"
          className="block text-sm font-medium text-gray-700"
        >
          Assessment Type <span className="text-red-500">*</span>
        </label>
        <div className="relative mt-1">
          <div
            className={`flex items-center justify-between border ${errors.AssessmentType ? 'border-red-500' : 'border-gray-300'
              } rounded-md shadow-sm py-2 px-3 min-h-[42px] cursor-pointer`}
            onClick={modifiedToggleAssessment}
          >
            <div className="flex flex-wrap gap-1">
              {Array.isArray(selectedAssessmentType) &&
                selectedAssessmentType.map((type) => (
                  <div
                    key={type}
                    className="flex items-center bg-gray-200 rounded text-xs px-2 py-1"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAssessmentType(type);
                      }}
                      className="ml-1 text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              {selectedAssessmentType?.length === 0 && (
                <span className="text-gray-400">Select assessment type</span>
              )}
            </div>
            <div className="flex items-center">
              {selectedAssessmentType?.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAssessmentType([]);
                    setFormData((prevData) => ({
                      ...prevData,
                      AssessmentType: [],
                    }));
                  }}
                  className="text-gray-500 hover:text-gray-700 mr-2"
                >
                  ×
                </button>
              )}
              <MdArrowDropDown className="text-gray-500 text-lg" />
            </div>
          </div>
          {showDropdownAssessment && (
            <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-y-auto">
              {assessmentTypes.map((questionType) => (
                <div
                  key={questionType}
                  className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                  onClick={() => {
                    handleAssessmentTypeSelect(questionType);
                    setShowDropdownAssessment(false);
                  }}
                >
                  {questionType}
                </div>
              ))}
            </div>
          )}
          {errors.AssessmentType && (
            <p className="text-red-500 text-sm mt-1">{errors.AssessmentType}</p>
          )}
        </div>
      </div> */}
          </div>

          {/* No. of Questions and Assessment Status */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">


            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assessment Status
              </label>
              <div className="flex items-center mt-1">
                <Switch
                  checked={formData.status === "Active"} // Ensure it's boolean
                  onChange={(value) => {
                    setFormData((prev) => ({
                      ...prev,
                      status: value ? "Active" : "Inactive",
                    }));
                  }}
                  onColor="#98e6e6"
                  offColor="#ccc"
                  boxShadow="0px 0px 5px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={45}
                  onHandleColor="#227a8a"
                  offHandleColor="#9CA3AF"
                  handleDiameter={20}
                  checkedIcon={false}
                  uncheckedIcon={false}
                />
                <span className="ml-2 text-sm text-gray-700">
                  {formData.status}
                </span>
              </div>
            </div>

          </div>

          <div className="font-semibold text-xl mb-5">Additional Details:</div>

          {/* Position and Difficulty Level */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            {/* Position */}
            <div className="mb-4" ref={positionRef}>
              <div className="flex items-center">
                <label
                  htmlFor="position"
                  className="block text-sm font-medium text-gray-700"
                >
                  Position
                </label>
                <button
                  type="button"
                  onClick={handleIconClick}
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Position information"
                >
                  <CgInfo className="w-4 h-4" />
                </button>
                {showMessage && (
                  <div className="absolute mt-6 ml-0 max-w-xs bg-white text-gray-700 text-sm border border-gray-200 rounded-md p-2 shadow-lg z-10">
                    Depending on the position, we can offer sections with tailored questions.
                  </div>
                )}
              </div>

              <div className="mt-1 relative">
                <div
                  className={`relative w-full cursor-default rounded-md border ${errors.Position ? 'border-red-500' : 'border-gray-300'
                    } bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 ${errors.Position ? 'focus:ring-red-500' : 'focus:ring-blue-500'
                    } sm:text-sm min-h-[42px] flex items-center`}
                  onClick={modifiedTogglePosition}
                  aria-haspopup="listbox"
                  aria-expanded={showDropdownPosition}
                >
                  {selectedPosition?.title ? (
                    <span className="flex items-center">
                      <span className="inline-flex items-center bg-gray-100 rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {selectedPosition.title}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPosition("");
                          }}
                          className="ml-1.5 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 focus:outline-none"
                          aria-label="Remove selection"
                        >
                          <span className="sr-only">Remove</span>
                          <svg className="h-2.5 w-2.5" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                            <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                          </svg>
                        </button>
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-500">Select position</span>
                  )}
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <MdArrowDropDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </div>

                {showDropdownPosition && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-60 overflow-auto focus:outline-none sm:text-sm">
                    <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2">
                      <p className="font-medium text-gray-700 text-sm">Recent Positions</p>
                    </div>
                    <ul className="py-1">
                      {positions.map((position) => (
                        <li
                          key={position._id}
                          className="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePositionSelect(position);
                            setShowDropdownPosition(false);
                          }}
                        >
                          <div className="flex items-center">
                            <span className="ml-3 block truncate">{position.title}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <div className="border-t border-gray-200 px-4 py-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddNewPositionClick();
                          setShowDropdownPosition(false);
                        }}
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium focus:outline-none"
                      >
                        <IoIosAddCircle className="mr-1.5 h-5 w-5" />
                        Add New Position
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Level */}
            <div ref={difficultyRef}>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium text-gray-700"
              >
                Difficulty Level <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div
                  className={`flex items-center border ${errors.DifficultyLevel ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 min-h-[42px] cursor-pointer`}
                  onClick={modifiedToggleDifficulty}
                >
                  {selectedDifficulty || (
                    <span className="text-gray-400">Select difficulty level</span>
                  )}
                  <MdArrowDropDown className="ml-auto text-gray-500 text-lg" />
                </div>
                {showDropdownDifficulty && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300">
                    {difficultyLevels.map((level) => (
                      <div
                        key={level}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleDifficultySelect(level)}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                )}
                {errors.DifficultyLevel && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.DifficultyLevel}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Duration and Expiry Date */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            {/* Duration */}
            <div ref={durationRef}>
              <label
                htmlFor="duration"
                className="block text-sm font-medium text-gray-700"
              >
                Duration <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div
                  className={`flex items-center border ${errors.Duration ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 min-h-[42px] cursor-pointer`}
                  onClick={modifiedToggleDuration}
                >
                  {selectedDuration || (
                    <span className="text-gray-400">Select duration</span>
                  )}
                  <MdArrowDropDown className="ml-auto text-gray-500 text-lg" />
                </div>
                {showDropdownDuration && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-36 overflow-y-auto">
                    {durations.map((duration) => (
                      <div
                        key={duration}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleDurationSelect(duration)}
                      >
                        {duration}
                      </div>
                    ))}
                  </div>
                )}
                {errors.Duration && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.Duration}
                  </p>
                )}
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="expiry"
                className="block text-sm font-medium text-gray-700"
              >
                Expiry Date
              </label>
              <div className="mt-1">
                <DatePicker
                  selected={startDate}
                  onChange={handleDateChange}
                  dateFormat="dd-MM-yyyy"
                  minDate={new Date()}
                  customInput={<CustomInput />}
                />
                {errors.ExpiryDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.ExpiryDate}
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Link Expiry Days */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            <div ref={linkExpiryRef}>
              <label
                htmlFor="linkExpiry"
                className="block text-sm font-medium text-gray-700"
              >
                Link Expiry (Days) <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <div
                  className={`flex items-center border ${errors.LinkExpiryDays ? 'border-red-500' : 'border-gray-300'
                    } rounded-md shadow-sm py-2 px-3 min-h-[42px] cursor-pointer`}
                  onClick={modifiedToggleLinkExpiry}
                >
                  {linkExpiryDays || (
                    <span className="text-gray-400">Select days</span>
                  )}
                  <MdArrowDropDown className="ml-auto text-gray-500 text-lg" />
                </div>
                {showLinkExpiryDay && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-24 overflow-y-auto">
                    {Array.from({ length: 15 }, (_, index) => index + 1).map(
                      (days) => (
                        <div
                          key={days}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100 text-sm"
                          onClick={() => {
                            setLinkExpiryDays(days); // Update linkExpiryDays prop
                            setFormData((prev) => ({
                              ...prev,
                              linkExpiryDays: days, // Update formData.linkExpiryDays
                            }));
                            toggleLinkExpiryDropdown(); // Close dropdown
                          }}
                        >
                          {days}
                        </div>
                      )
                    )}
                  </div>
                )}
                {errors.LinkExpiryDays && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.LinkExpiryDays}
                  </p>
                )}
              </div>
            </div>
            <div></div> {/* Empty div to maintain grid structure */}
          </div>

        </div>
      </form>

      {showUpgradePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75 z-50">
          <div className="relative bg-white p-5 rounded-lg shadow-lg w-80">
            <MdOutlineCancel
              className="absolute top-2 right-2 text-gray-500 cursor-pointer"
              onClick={closePopup}
            />
            <div className="text-center">
              <p className="mb-4">
                Upgrade your plan to select a duration longer than 45 minutes.
              </p>
              <button
                className="bg-custom-blue text-white py-2 px-4 rounded hover:bg-custom-blue/90"
                onClick={handleUpgrade}
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicDetailsTab;