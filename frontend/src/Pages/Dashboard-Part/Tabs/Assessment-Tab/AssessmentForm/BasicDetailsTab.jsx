// v1.0.0  -  Ashraf  -  assessment to assesment templates added in fileds
// v1.0.1  -  Ashok   -  Added scroll to first error functionality
// v1.0.2  -  Ashok   -  Improved responsiveness

import React, { useState, useEffect, useRef } from "react";
import { ReactComponent as CgInfo } from "../../../../../icons/CgInfo.svg";
import { ReactComponent as MdOutlineCancel } from "../../../../../icons/MdOutlineCancel.svg";
import Switch from "react-switch";
import DatePicker from "react-datepicker";
import PositionForm from "../../Position-Tab/Position-Form";
// Common Form Field Components
import DropdownWithSearchField from "../../../../../Components/FormFields/DropdownWithSearchField.jsx";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
import { useAssessments } from "../../../../../apiHooks/useAssessments.js";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { X } from "lucide-react";
import { notify } from "../../../../../services/toastService.js";
import AssessmentListModal from "../AssessmentListModal/AssessmentListModal.jsx";
import DropdownSelect, {
  selectBaseStyles,
  StickyFooterMenuList,
  preserveStickyOptionFilter,
} from "../../../../../Components/Dropdowns/DropdownSelect.jsx"; // adjust import path if needed
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";

const BasicDetailsTab = ({
  isEditing,
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
  setShowMessage,
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
  // v1.0.1 <----------------------------------------
  fieldRefs,
  // v1.0.1 <----------------------------------------
  isCategoryModalOpen,
  // openCategoryModal,
  categories,
  selected,
  setSelected,
  handleAssessmentListChange,
}) => {
  // Refs for dropdown containers
  const linkExpiryRef = useRef(null);
  const assessmentTypeRef = useRef(null);
  const positionRef = useRef(null);
  const difficultyRef = useRef(null);
  const durationRef = useRef(null);
  const categoryOrTechnologyRef = useRef(null);

  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  useScrollLock(isCategoryModalOpen);

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
        linkExpiryRef.current &&
        !linkExpiryRef.current.contains(event.target) &&
        assessmentTypeRef.current &&
        !assessmentTypeRef.current.contains(event.target) &&
        positionRef.current &&
        !positionRef.current.contains(event.target) &&
        difficultyRef.current &&
        !difficultyRef.current.contains(event.target) &&
        durationRef.current &&
        !durationRef.current.contains(event.target)
      ) {
        closeAllDropdowns();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalBackdropClick = (e, modalType) => {
    if (e.target === e.currentTarget) {
      if (modalType === "position") {
        setIsPositionModalOpen(false);
      }
    }
  };

  const handlePositionCreated = (newPosition) => {
    setSelectedPosition(newPosition ? newPosition : null);
    setFormData((prevData) => ({
      ...prevData,
      Position: newPosition ? newPosition._id : "",
    }));
    setIsPositionModalOpen(false);
  };

  return (
    // v1.0.2 <------------------------------------------------------------------------------
    <div className="pb-16">
      <form>
        {/* // <---------------------- v1.0.0 */}

        <div className="space-y-6 sm:px-0 px-12">
          <div className="font-semibold sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg mb-5">
            Assessment Template Details:
          </div>
          {/* // <---------------------- v1.0.0 */}

          {/* Assessment Name and Type */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            <div>
              <InputField
                ref={fieldRefs.AssessmentTitle}
                label="Assessment Template Name"
                required
                type="text"
                name="AssessmentTitle"
                id="AssessmentTitle"
                maxLength={assessmentTitleLimit}
                value={formData?.AssessmentTitle}
                onChange={(e) =>
                  handleInputChange("AssessmentTitle", e.target.value)
                }
                placeholder="Enter Assessment Name"
                autoComplete="off"
                error={errors.AssessmentTitle}
                showCharCount={
                  formData?.AssessmentTitle?.length >=
                  assessmentTitleLimit * 0.75
                }
              />
            </div>

            <div>
              <InputField
                ref={fieldRefs.NumberOfQuestions}
                label="No. of Questions"
                required
                type="number"
                name="NumberOfQuestions"
                value={formData.NumberOfQuestions}
                onChange={handleChange}
                id="NumberOfQuestions"
                min={1}
                max={100}
                step={1}
                autoComplete="off"
                placeholder="Enter Number of Questions"
                error={errors.NumberOfQuestions}
                onKeyDown={(e) => e.preventDefault()} // 👈 Prevent typing
              />
            </div>

            {/* Assessment Type - Commented out for now */}
            {/* 
            <div ref={assessmentTypeRef}>
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
              </div>
            </div>
            */}
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
            <div>
              <div className="mb-1">
                <DropdownWithSearchField
                  containerRef={fieldRefs.Position}
                  label="Position"
                  name="Position"
                  value={selectedPosition?._id || ""}
                  options={[
                    ...(positions?.map((position) => ({
                      value: position._id,
                      label: position.title,
                    })) || []),
                    {
                      value: "add_new",
                      label: "+ Add New Position",
                      isSticky: true,
                      className: "text-blue-600 font-medium hover:bg-blue-50",
                    },
                  ]}
                  onChange={(e) => {
                    const value = e?.target?.value || e?.value;
                    if (value === "add_new") {
                      handleAddNewPositionClick();
                      setIsPositionModalOpen(true);
                    } else if (value) {
                      const position = positions.find((p) => p._id === value);
                      if (position) {
                        handlePositionSelect(position);
                      }
                    } else {
                      // Clear selection
                      setSelectedPosition("");
                    }
                  }}
                  error={errors.Position}
                  placeholder="Select Position"
                />
                {showMessage && (
                  <div className="mt-1 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={handleIconClick}
                      className="inline-flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <CgInfo className="w-3 h-3 mr-1" />
                      Position will be part of the candidate profile
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Difficulty Level */}
            <div>
              <DropdownWithSearchField
                containerRef={fieldRefs.DifficultyLevel}
                label="Difficulty Level"
                required
                name="difficulty"
                value={selectedDifficulty || ""}
                options={difficultyLevels.map((level) => ({
                  value: level,
                  label: level,
                }))}
                onChange={(e) => handleDifficultySelect(e.target.value)}
                error={errors.DifficultyLevel}
                placeholder="Select Difficulty Level"
              />
            </div>
          </div>

          {/* Duration and Expiry Date */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-1">
            {/* Duration */}
            <div>
              <DropdownWithSearchField
                label="Duration"
                required
                name="duration"
                value={selectedDuration || ""}
                options={durations.map((duration) => ({
                  value: duration,
                  label: duration,
                }))}
                onChange={(e) => handleDurationSelect(e.target.value)}
                error={errors.Duration}
                placeholder="Select Duration"
              />
            </div>

            {/* Expiry Date */}
            <div>
              {/* // <---------------------- v1.0.0 */}
              <label
                htmlFor="expiry"
                className="block text-sm font-medium text-gray-700"
              >
                Template Expiry Date
              </label>
              {/* // <---------------------- v1.0.0 */}
              <div className="mt-1">
                <DatePicker
                  selected={isEditing ? formData.ExpiryDate : startDate}
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
            <div>
              <div>
                <DropdownWithSearchField
                  containerRef={linkExpiryRef}
                  label="Link Expiry (Days)"
                  required
                  name="linkExpiry"
                  value={linkExpiryDays || 3}
                  options={Array.from({ length: 10 }, (_, index) => ({
                    value: index + 1,
                    label: `${index + 1}`,
                  }))}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    setLinkExpiryDays(value);
                    setFormData((prev) => ({
                      ...prev,
                      linkExpiryDays: value,
                    }));
                  }}
                  error={errors.LinkExpiryDays}
                  placeholder="Select days"
                />
              </div>
              <div></div> {/* Empty div to maintain grid structure */}
            </div>
            {/* Assessment List */}
            {/* <div>
              <DropdownWithSearchField
                containerRef={categoryOrTechnologyRef}
                label="Category/Technology"
                required
                name="categoryOrTechnology"
                value={selected || ""}
                options={[
                  ...(categories
                    ?.filter((category) => category?.type === "custom")
                    ?.map((category) => ({
                      value: category._id,
                      label: category.categoryOrTechnology,
                    })) || []),
                  {
                    value: "create_new",
                    label: "+ Create List",
                    isSticky: true,
                    className: "text-blue-600 font-medium hover:bg-blue-50",
                  },
                ]}
                // onChange={(e) => {
                //   const value = e?.target?.value || e?.value;
                //   if (value === "create_new") {
                //     openCategoryModal();
                //   } else {
                //     setSelected(value);
                //     setFormData((prev) => ({
                //       ...prev,
                //       categoryOrTechnology: value,
                //     }));
                //   }
                // }}
                onChange={handleAssessmentListChange}
                error={errors.categoryOrTechnology}
                placeholder="Select List"
              />
              <div></div>
            </div> */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category/Technology <span className="text-red-500">*</span>
              </label>
              <DropdownSelect
                ref={categoryOrTechnologyRef}
                name="categoryOrTechnology"
                placeholder="Select List"
                value={
                  selected
                    ? {
                        value: selected,
                        label:
                          categories?.find((c) => c._id === selected)
                            ?.categoryOrTechnology || "Select List",
                      }
                    : null
                }
                options={[
                  ...(categories
                    ?.sort((a, b) => {
                      if (a.type === "custom" && b.type === "standard")
                        return -1;
                      if (a.type === "standard" && b.type === "custom")
                        return 1;
                      return 0;
                    })
                    ?.map((category) => ({
                      value: category._id,
                      label: (
                        <div className="flex justify-between w-[99%] items-center">
                          <span>
                            {capitalizeFirstLetter(
                              category.categoryOrTechnology
                            )}
                          </span>

                          <span
                            className={
                              category.type === "custom"
                                ? "text-custom-blue"
                                : "text-green-600"
                            }
                          >
                            {capitalizeFirstLetter(category.type)}
                          </span>
                        </div>
                      ),
                    })) || []),
                  // options={[
                  //   ...(categories
                  //     // ?.filter((category) => category?.type === "custom")
                  //     ?.sort((a, b) => {
                  //       // custom first, standard after
                  //       if (a.type === "custom" && b.type === "standard")
                  //         return -1;
                  //       if (a.type === "standard" && b.type === "custom")
                  //         return 1;
                  //       return 0;
                  //     })
                  //     ?.map((category) => ({
                  //       value: category._id,
                  //       label: category.categoryOrTechnology,
                  //     })) || []),
                  {
                    value: "__other__",
                    label: "+ Create List",
                    isCustomOption: false, // italic + bold (as per your styles)
                  },
                ]}
                onChange={handleAssessmentListChange}
                components={{
                  MenuList: StickyFooterMenuList, // keeps "Create New" fixed at bottom
                }}
                filterOption={preserveStickyOptionFilter("__other__")}
                hasError={!!errors.categoryOrTechnology}
                styles={selectBaseStyles(!!errors.categoryOrTechnology)}
                menuPortalTarget={document.body}
                menuPosition="fixed"
              />
              <div></div>
            </div>
          </div>

          {/* External ID Field */}
          <div className="mt-4">
            <InputField
              ref={fieldRefs.externalId}
              label="External ID"
              type="text"
              name="externalId"
              id="externalId"
              value={formData?.externalId || ""}
              onChange={(e) => handleInputChange("externalId", e.target.value)}
              placeholder="Optional external system identifier"
              autoComplete="off"
              error={errors.externalId}
            />
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

      {/* Position Modal */}
      {isPositionModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto"
          onClick={(e) => handleModalBackdropClick(e, "position")}
        >
          <PositionForm
            mode="new"
            onClose={handlePositionCreated}
            isModal={true}
          />
        </div>
      )}
    </div>
    // v1.0.2 ------------------------------------------------------------------------------>
  );
};

export default BasicDetailsTab;
