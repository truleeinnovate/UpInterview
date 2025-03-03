import React, { useState } from "react";
import { ReactComponent as MdArrowDropDown } from "../../../../icons/MdArrowDropDown.svg";
import { ReactComponent as CgInfo } from "../../../../icons/CgInfo.svg";
import { ReactComponent as MdOutlineCancel } from "../../../../icons/MdOutlineCancel.svg";
import { ReactComponent as IoIosAddCircle } from "../../../../icons/IoIosAddCircle.svg";
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
  // selectedAssessmentType,
  handleRemoveAssessmentType,
  setFormData,
  showDropdownAssessment,
  assessmentTypes,
  handleAssessmentTypeSelect,
  setShowDropdownAssessment,
  handleChange,
  handleIconClick,
  showMessage,
  selectedPosition,
  toggleDropdownPosition,
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
  onClose,
  handleSave,
  handleSaveAndNext,
  setSelectedAssessmentType,
  selectedAssessmentType,
  showDropdownDifficulty,
  setSelectedPosition,
  handlePositionSelect,
  handleAddNewPositionClick,
  selectedDifficulty,
  toggleDropdownDifficulty,
  positions,
  errors,
  setError,
}) => {
  return (
    <div>
      <form className="group mx-10">
        <p className="text-2xl font-bold underline mt-3">New Assessment</p>
        <div className="font-semibold text-xl mb-5 mt-3">
          Assessment Details:
        </div>
        {/* Assessment Name and Type */}
        <div className="gap-5 grid grid-cols-2">
          <div className="flex flex-col col-span-1">
            <div className="flex items-center gap-10">
              <label
                htmlFor="AssessmentTitle"
                className="block text-sm font-medium leading-6 text-gray-800 -mt-5"
              >
                Assessment Name <span className="text-red-500">*</span>
              </label>
              <div className="flex-grow">
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
                  className={`border-b focus:outline-none mb-1 w-full ${
                    errors.AssessmentTitle
                      ? "border-red-500"
                      : "border-gray-300 focus:border-black"
                  }`}
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
          </div>
          <div className="flex flex-col col-span-1">
            <div className="flex gap-10">
              <label
                htmlFor="AssessmentType"
                className="block text-sm font-medium leading-6 text-gray-800"
              >
                Assessment Type <span className="text-red-500">*</span>
              </label>
              <div className="flex-grow relative">
                <div
                  className={`border-b border-gray-300 max-w-[432px] focus:border-black min-h-6 focus:outline-none flex-grow flex flex-wrap items-center gap-2 cursor-pointer mt-1 ${
                    errors.AssessmentType
                      ? "border-red-500"
                      : "border-gray-300 focus:border-black"
                  }`}
                  onClick={toggleDropdownAssessment}
                >
                  {Array.isArray(selectedAssessmentType) &&
                    selectedAssessmentType.map((type) => (
                      <div
                        key={type}
                        className="flex items bg-gray-200 rounded text-xs p-1 -mt-1 mb-1"
                      >
                        {type}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveAssessmentType(type);
                          }}
                          className="ml-2 text-xs bg-slate-300 rounded px-2"
                        >
                          X
                        </button>
                      </div>
                    ))}
                  <MdArrowDropDown className="absolute right-0 top-3 text-gray-500 text-lg cursor-pointer" />
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
                      className="absolute -right-7 top-1 mt-1 mr-6 text-xs bg-slate-300 rounded px-2"
                    >
                      X
                    </button>
                  )}
                </div>
                {showDropdownAssessment && (
                  <div className="absolute z-50 mt-1 w-full bg-white shadow-lg text-sm rounded-sm border">
                    {assessmentTypes.map((questionType) => (
                      <div
                        key={questionType}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.AssessmentType}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* No. of Questions */}
        <div className="grid items-end  grid-cols-2 gap-5 mb-5 mt-3">
          <div className="flex flex-col col-span-1">
            <div className="flex items-center gap-12">
              <label
                htmlFor="NumberOfQuestions"
                className="block text-sm font-medium leading-6 text-gray-800 -mt-3"
              >
                No.of Questions <span className="text-red-500">*</span>
              </label>
              <div className="flex-grow">
                <input
                  type="number"
                  name="NumberOfQuestions"
                  value={formData.NumberOfQuestions}
                  onChange={handleChange}
                  id="NumberOfQuestions"
                  min="1"
                  max="50"
                  autoComplete="off"
                  className={`border-b focus:outline-none mb-1 w-full ${
                    errors.NumberOfQuestions
                      ? "border-red-500"
                      : "border-gray-300 focus:border-black"
                  }`}
                />
                {errors.NumberOfQuestions && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.NumberOfQuestions}
                  </p>
                )}
              </div>
            </div>
          </div>
          {/* Assessment Status */}
          <div >
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium leading-6 text-gray-800 w-[22%] ">
                Assessment Status
              </label>
              
              <Switch
                checked={formData.status}
                onChange={(value) => {
                  
                  setFormData((prev) => ({
                    ...prev,
                    status: value ? "Active":"Inactive",
                  }));
                }}
                // onColor="#c2f0f0"
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
            </div>
          </div>
        </div>
        <div className="border-b mb-5"></div>

        <div className="font-semibold text-xl mb-8">Additional Details:</div>

        {/* Position */}
        <div className="gap-5 grid grid-cols-2">
          <div className="flex flex-col col-span-1">
            <div className="flex items-center gap-[72px]">
              <label className="text-sm font-medium leading-6 text-gray-800 w-24 -mt-6">
                Position
                <div className="relative inline-block">
                  <CgInfo
                    className="ml-2 text-gray-500 cursor-pointer"
                    onClick={handleIconClick}
                  />
                  {showMessage && (
                    <div className="absolute bottom-full mb-2 left-0 w-max bg-white text-gray-700 border border-gray-300 rounded p-2 text-xs">
                      Depending on the position, we can offer sections with
                      tailored questions.
                    </div>
                  )}
                </div>
              </label>

              <div className="relative flex-grow">
                <div className="relative">
                  <div className="relative mb-5">
                    {selectedPosition?.title ? (
                      <div className="border-b border-gray-300 focus:border-black focus:outline-none w-full h-6 flex items-center text-xs">
                        <div className="bg-slate-200 rounded  inline-block mr-2 p-1 mb-2">
                          {selectedPosition?.title}
                          <button
                            className="ml-2 bg-slate-300 rounded px-2"
                            onClick={() => setSelectedPosition("")}
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ) : (
                      <input
                        type="text"
                        id="position"
                        className={`border-b focus:outline-none w-full ${
                          errors.Position
                            ? "border-red-500"
                            : "border-gray-300 focus:border-black"
                        }`}
                        value={selectedPosition?.title || ""}
                        onClick={toggleDropdownPosition}
                        readOnly
                      />
                    )}
                  </div>
                  <MdArrowDropDown
                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                    onClick={toggleDropdownPosition}
                  />
                  {/* Dropdown */}
                  {showDropdownPosition && (
                    <div className="absolute border z-50 -mt-4 mb-5 w-full rounded-sm bg-white shadow-lg">
                      <p className="font-medium px-4 py-1 border-b">
                        Recent Positions
                      </p>
                      <div className="h-36 text-sm overflow-y-auto">
                        <div>
                          {positions.map((position) => (
                            <p
                              key={position._id}
                              className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                              onClick={() => handlePositionSelect(position)}
                            >
                              {position?.title}
                            </p>
                          ))}
                        </div>
                      </div>
                      <p
                        className="flex cursor-pointer shadow-md border-t p-1 rounded"
                        onClick={handleAddNewPositionClick}
                      >
                        <IoIosAddCircle className="text-2xl" />
                        <span>Add New Position</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="flex flex-col col-span-1">
            <div className="flex items-center gap-[60px]">
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium leading-6 text-gray-800 -mt-5"
              >
                Difficulty Level <span className="text-red-500">*</span>
              </label>

              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    id="difficulty"
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.DifficultyLevel
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                    value={selectedDifficulty}
                    onClick={toggleDropdownDifficulty}
                    readOnly
                  />
                  {errors.DifficultyLevel && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.DifficultyLevel}
                    </p>
                  )}

                  <MdArrowDropDown
                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                    onClick={toggleDropdownDifficulty}
                  />
                </div>
                {showDropdownDifficulty && (
                  <div className="absolute z-50 -mt-4 mb-5 w-full rounded-sm bg-white shadow-lg border">
                    {difficultyLevels.map((level) => (
                      <div
                        key={level}
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() => handleDifficultySelect(level)}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div className="flex gap-5">
          <div className="flex flex-col w-1/2">
            <div className="flex items-center gap-[72px]">
              <label
                htmlFor="duration"
                className="block text-sm font-medium leading-6 text-gray-800 w-24 -mt-5"
              >
                Duration <span className="text-red-500">*</span>
              </label>

              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    id="duration"
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.Duration
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                    value={selectedDuration}
                    onClick={toggleDropdownDuration}
                    readOnly
                  />
                  <MdArrowDropDown
                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                    onClick={toggleDropdownDuration}
                  />
                </div>
                {showDropdownDuration && (
                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg h-20 overflow-y-auto">
                    {durations.map((duration) => (
                      <div
                        key={duration}
                        className="py-2 px-2 cursor-pointer hover:bg-gray-100 text-sm"
                        onClick={() => handleDurationSelect(duration)}
                      >
                        {duration}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {errors.Duration && (
                <p className="text-red-500 text-sm -mt-4">{errors.Duration}</p>
              )}
            </div>
          </div>

          {showUpgradePopup && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-300 bg-opacity-75 z-50">
              <div
                className="relative bg-white p-5 rounded-lg shadow-lg"
                style={{ width: "80%" }}
              >
                <MdOutlineCancel
                  className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                  onClick={closePopup}
                />
                <div className="flex justify-center">
                  <div className="text-center">
                    <p className="mb-4">
                      {" "}
                      Upgrade your plan to select a duration <br /> longer than
                      45 minutes.
                    </p>
                    <button
                      className="bg-custom-blue text-white py-2 px-4 rounded hover:bg-custom-blue"
                      onClick={handleUpgrade}
                    >
                      Upgrade
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expiry date */}
          <div className="flex flex-col w-1/2">
            <div className="flex items-center gap-[68px]">
              <label
                htmlFor="expiry"
                className="block text-sm font-medium leading-6 text-gray-800 w-24 -mt-5"
              >
                Expiry Date
                {/* <span className="text-red-500">*</span> */}
              </label>

              <div className="relative flex-grow">
                <div className="relative">
                  <div className="border-b border-gray-300 mb-5 w-full">
                    <DatePicker
                      selected={startDate}
                      onChange={handleDateChange}
                      dateFormat="dd-MM-yyyy"
                      className="focus:border-black focus:outline-none w-full"
                      placeholderText=""
                      minDate={new Date()}
                      CustomInput={<CustomInput />}
                    />
                  </div>
                </div>
              </div>
              {errors.ExpiryDate && (
                <p className="text-red-500 text-sm -mt-4">
                  {errors.ExpiryDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/*assessment  && link expiry section*/}
        <div className="grid grid-cols-2 gap-4 items-start">
          {/* Link Expiry Days */}
          <div>
            <div className="flex items-center">
              <label className="block text-sm font-medium leading-6 text-gray-800 w-[23%] -mt-5">
                Link Expiry(Days):<span className="text-red-500">*</span>
              </label>
              <div className="relative flex-grow">
                <div className="relative">
                  <input
                    type="text"
                    id="duration"
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.Duration
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                    value={linkExpiryDays}
                    onClick={toggleLinkExpiryDropdown}
                    readOnly
                  />
                  <MdArrowDropDown
                    className="absolute top-0 text-gray-500 text-lg mt-1 cursor-pointer right-0"
                    onClick={toggleLinkExpiryDropdown}
                  />
                </div>
                {showLinkExpiryDay && (
                  <div className="absolute z-50 -mt-3 mb-5 w-full rounded-md bg-white shadow-lg h-36 overflow-y-auto">
                    {Array.from({ length: 15 }, (_, index) => index + 1).map(
                      (days) => (
                        <div
                          key={days}
                          className="py-2 px-2 cursor-pointer hover:bg-gray-100 text-sm"
                          onClick={() => {
                            setLinkExpiryDays(days);
                            toggleLinkExpiryDropdown();
                          }}
                        >
                          {days}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          
        </div>

        <div className="SaveAndScheduleButtons">
          <div>
            <p
              className="cursor-pointer border border-custom-blue px-4 rounded p-2 mx-7"
              onClick={onClose}
            >
              Cancel
            </p>
          </div>
          <div className="mr-7">
            <button
              type="submit"
              onClick={(e) => handleSave(e, "Basicdetails")}
              className="footer-button mr-[10px]"
            >
              Save
            </button>

            <button
              type="submit"
              onClick={(e) => handleSaveAndNext(e, "Basicdetails", "Details")}
              className="footer-button"
            >
              Save & Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicDetailsTab;
