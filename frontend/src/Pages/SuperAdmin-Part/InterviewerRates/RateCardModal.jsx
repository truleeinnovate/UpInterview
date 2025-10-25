// v1.0.0 - Ashok - Adding form submission and modal functionality for interviewer rates
// v1.0.1 - Ashok - changed header Title based on mode (view/create/edit)
// v1.0.2 - Ashok - fixed issues in Technology dropdown enabled delete level button
// v1.0.3 - Ashok - changed to multiple option selection and added basic validations
// v1.0.3 - Ashok - changed static data of Category and Technology / Role to dynamic data
// v1.0.3 - Ashok - changed dropdowns data from static to dynamic and disabled buttons based on mode
// v1.0.6 - Ashok - modified code as based number of technologies in selected category create number of rates

import { useState, useEffect } from "react";
import { Minimize, Expand, X, Plus, Trash2 } from "lucide-react";
// v1.0.0 <--------------------------------------
import axios from "axios";
import { config } from "../../../config";
import toast from "react-hot-toast";
// v1.0.0 -------------------------------------->
// v1.0.1 <-------------------------------------------------------
import { useMasterData } from "../../../apiHooks/useMasterData";
import { ReactComponent as FaEdit } from "../../../icons/FaEdit.svg";
import DropdownWithSearchField from "../../../Components/FormFields/DropdownWithSearchField";
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";
// v1.0.1 ------------------------------------------------------->

// v1.0.3 <-------------------------------------------------------------------------------
// v1.0.2 <----------------------------------------------------------------------------
// v1.0.1 <--------------------------------------------------------------------
function RateCardModal({ rateCard, onClose, mode = "create" }) {
  // v1.0.0 <-------------------------------------------------------
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    // v1.0.3 <------------------------
    technology: [],
    // v1.0.3 <------------------------
    levels: [
      {
        level: "Junior",
        rateRange: {
          inr: { min: 0, max: 0 },
          usd: { min: 0, max: 0 },
        },
      },
      {
        level: "Mid-Level",
        rateRange: {
          inr: { min: 0, max: 0 },
          usd: { min: 0, max: 0 },
        },
      },
      {
        level: "Senior",
        rateRange: {
          inr: { min: 0, max: 0 },
          usd: { min: 0, max: 0 },
        },
      },
    ],
    discountMockInterview: 10,
    defaultCurrency: "INR",
    isActive: true,
  });

  // v1.0.1 <------------------------------------------------------
  const [currentMode, setCurrentMode] = useState(mode); // local mode state
  const { technologies } = useMasterData();
  // v1.0.1 ------------------------------------------------------>

  // const categories = [
  //   "Software Development",
  //   "Data & AI",
  //   "DevOps & Cloud",
  //   "QA & Testing",
  //   "Specialized Skills",
  // ];

  const experienceLevels = ["Junior", "Mid-Level", "Senior"];
  // v1.0.3 <-------------------------------------------------------
  // v1.0.0 <-------------------------------------------------------
  useEffect(() => {
    if (rateCard) {
      setFormData({
        _id: rateCard._id,
        category: rateCard.category,
        technology: Array.isArray(rateCard.technology)
          ? rateCard.technology
          : rateCard.technology
          ? [rateCard.technology]
          : [],
        levels: rateCard.levels,
        discountMockInterview: rateCard.discountMockInterview,
        defaultCurrency: rateCard.defaultCurrency,
        isActive: rateCard.isActive,
      });
    }
  }, [rateCard]);
  // v1.0.0 <-------------------------------------------------------
  // v1.0.3 <-------------------------------------------------------

  // const handleInputChange = (field, value) => {
  //   setFormData((prev) => ({
  //     ...prev,
  //     [field]: value,
  //   }));
  // };
  const handleInputChange = (field, value) => {
    setFormData((prev) => {
      if (field === "category") {
        return { ...prev, category: value, technology: [] }; // reset techs
      }
      return { ...prev, [field]: value };
    });
  };

  const handleLevelChange = (levelIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, index) =>
        index === levelIndex ? { ...level, [field]: value } : level
      ),
    }));
  };

  const handleRateChange = (levelIndex, currency, type, value) => {
    setFormData((prev) => ({
      ...prev,
      levels: prev.levels.map((level, index) =>
        index === levelIndex
          ? {
              ...level,
              rateRange: {
                ...level.rateRange,
                [currency]: {
                  ...level.rateRange[currency],
                  [type]: parseFloat(value) || 0,
                },
              },
            }
          : level
      ),
    }));
  };

  const addLevel = () => {
    setFormData((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        {
          level: "Custom",
          rateRange: {
            inr: { min: 0, max: 0 },
            usd: { min: 0, max: 0 },
          },
        },
      ],
    }));
  };

  const removeLevel = (levelIndex) => {
    if (formData.levels.length > 1) {
      setFormData((prev) => ({
        ...prev,
        levels: prev.levels.filter((_, index) => index !== levelIndex),
      }));
    }
  };

  // v1.0.3 <---------------------------------------------------------------
  function validateRateCard(formData) {
    const errors = {};

    // Category validation
    if (!formData.category || formData.category.trim() === "") {
      errors.category = "Category is required";
    }

    // Technology validation (must select at least one)
    if (!formData.technology || formData.technology.length === 0) {
      errors.technology = "At least one technology is required";
    }

    // Levels validation
    if (!formData.levels || formData.levels.length === 0) {
      errors.levels = "At least one level is required";
    } else {
      formData.levels.forEach((level, index) => {
        if (!level.level || level.level.trim() === "") {
          errors[`levels.${index}.level`] = "Experience level is required";
        }
        // INR validation
        if (level.rateRange.inr.min < 0 || level.rateRange.inr.max < 0) {
          errors[`levels.${index}.inr`] = "INR values must be non-negative";
        }
        if (level.rateRange.inr.min > level.rateRange.inr.max) {
          errors[`levels.${index}.inr`] = "INR Min cannot be greater than Max";
        }

        // USD validation
        if (level.rateRange.usd.min < 0 || level.rateRange.usd.max < 0) {
          errors[`levels.${index}.usd`] = "USD values must be non-negative";
        }
        if (level.rateRange.usd.min > level.rateRange.usd.max) {
          errors[`levels.${index}.usd`] = "USD Min cannot be greater than Max";
        }
      });
    }

    // Default Currency
    if (!formData.defaultCurrency) {
      errors.defaultCurrency = "Default currency is required";
    }

    // Discount Validation (if you want to enable this later)
    if (
      formData.discountMockInterview !== undefined &&
      (formData.discountMockInterview < 5 ||
        formData.discountMockInterview > 30)
    ) {
      errors.discountMockInterview = "Discount must be between 5% and 30%";
    }

    // isActive (just sanity check)
    if (typeof formData.isActive !== "boolean") {
      errors.isActive = "Status must be true or false";
    }

    return errors;
  }
  // v1.0.3 --------------------------------------------------------------->

  // v1.0.0 <------------------------------------------------------
  // v1.0.6 <------------------------------------------------------------------------
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   console.log("Form data before submission:", formData);
  //   // v1.0.3 <------------------------------------------------------------------
  //   const errors = validateRateCard(formData);
  //   if (Object.keys(errors).length > 0) {
  //     // Show first error using toast
  //     toast.error(Object.values(errors)[0]);
  //     console.log("Validation errors:", errors);
  //     return;
  //   }
  //   // v1.0.3 ------------------------------------------------------------------>

  //   try {
  //     let response;

  //     if (formData._id) {
  //       // Update existing card
  //       response = await axios.put(
  //         `${config.REACT_APP_API_URL}/rate-cards/${formData._id}`,
  //         formData
  //       );
  //     } else {
  //       // Create new card
  //       response = await axios.post(
  //         `${config.REACT_APP_API_URL}/rate-cards`,
  //         formData
  //       );
  //     }

  //     console.log("Form submitted successfully:", response.data);

  //     // Close popup only if request was successful
  //     if (response.status === 200 || response.status === 201) {
  //       toast.success(response.data.message);
  //       onClose();
  //     }
  //   } catch (error) {
  //     toast.error(error.message);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data before submission:", formData);

    const errors = validateRateCard(formData);
    if (Object.keys(errors).length > 0) {
      toast.error(Object.values(errors)[0]);
      console.log("Validation errors:", errors);
      return;
    }

    try {
      let response;

      // Transform technologies into multiple objects
      const payloads = formData.technology.map((tech) => ({
        category: formData.category,
        technology: tech,
        levels: formData.levels,
        discountMockInterview: formData.discountMockInterview,
        defaultCurrency: formData.defaultCurrency,
        isActive: formData.isActive,
      }));

      if (formData._id) {
        // If editing, always update only one card
        response = await axios.put(
          `${config.REACT_APP_API_URL}/rate-cards/${formData._id}`,
          payloads[0]
        );
      } else {
        if (payloads.length === 1) {
          // Single technology → single create
          response = await axios.post(
            `${config.REACT_APP_API_URL}/rate-cards`,
            payloads[0]
          );
        } else {
          // Multiple technologies → bulk create
          response = await axios.post(
            `${config.REACT_APP_API_URL}/rate-cards`,
            { rateCards: payloads }
          );
        }
      }

      console.log("Form submitted successfully:", response.data);

      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message || "Rate Cards saved successfully");
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };
  // v1.0.6 ------------------------------------------------------------------------>
  // v1.0.0 ------------------------------------------------------>
  // v1.0.4 <----------------------------------------------------------------------
  // Filtered technologies based on selected category
  const filteredTechnologies = (technologies || []).filter(
    (t) => (t.Category ?? t.category) === formData.category
  );

  // Get unique categories from technologies (support both key casings)
  const filteredCategories = [
    ...new Set(
      (technologies || []).map((t) => t.Category ?? t.category).filter(Boolean)
    ),
  ];
  // v1.0.4 ---------------------------------------------------------------------->

  // Currency options for react-select
  const currencyOptions = [
    { value: "INR", label: "INR (₹)" },
    { value: "USD", label: "USD ($)" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
      <div
        className={`bg-white h-screen overflow-y-auto transition-all duration-300 ${
          isExpanded ? "w-full" : "w-1/2"
        }`}
      >
        {/* v1.0.0 <--------------------------------------------- */}
        <div className="bg-white sticky top-0 p-6 z-50">
          {/* v1.0.0 ---------------------------------------------> */}

          <div className="flex justify-between items-start">
            {/* v1.0.1 <------------------------------------------------------------------------- */}
            <div>
              <h2 className="text-2xl font-bold text-custom-blue">
                {/* {rateCard ? "Edit Rate Card" : "Create Rate Card"} */}
                {currentMode === "view"
                  ? "Rate Card"
                  : rateCard
                  ? "Edit Rate Card"
                  : "Create Rate Card"}
              </h2>
              <p className="text-gray-500 mt-1">
                {/* {rateCard
                  ? "Update interviewer rate information"
                  : "Add new interviewer rate card"} */}
                {currentMode === "view"
                  ? "Interviewer rate information"
                  : rateCard
                  ? "Update interviewer rate information"
                  : "Add new interviewer rate card"}
              </p>
            </div>

            <div className="flex space-x-2">
              <button
                // onClick={() => navigate(`/candidate/edit/${candidate._id}`)}
                onClick={() => setCurrentMode("edit")}
                className={`${currentMode === "view" ? "" : "hidden"}`}
                title="Edit"
              >
                <FaEdit className="w-5 h-5 text-gray-500 hover:text-custom-blue" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                {isExpanded ? (
                  <Minimize size={20} className="text-gray-500" />
                ) : (
                  <Expand size={20} className="text-gray-500" />
                )}
              </button>
              {/* v1.0.1 ------------------------------------------------------------------------> */}

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-white/50"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h3>

            <div
              className={`grid gap-4 ${
                isExpanded ? "grid-cols-2" : "grid-cols-2"
              }`}
            >
              {/* v1.0.2 <---------------------------------------------------------------------------------- */}
              {/* v1.0.1 <------------------------------------------------------------------------------ */}
              <div className="flex flex-col">
                <DropdownWithSearchField
                  label="Category"
                  name="category"
                  options={filteredCategories.map((c) => ({
                    value: c,
                    label: c,
                  }))}
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  disabled={currentMode === "view"}
                />
              </div>
              <div className="flex flex-col">
                <DropdownWithSearchField
                  label="Technology / Role"
                  name="technology"
                  options={filteredTechnologies.map((t) => ({
                    value: t.TechnologyMasterName,
                    label: t.TechnologyMasterName,
                  }))}
                  value={formData.technology}
                  onChange={(e) =>
                    handleInputChange("technology", e.target.value)
                  }
                  disabled={currentMode === "view"}
                  isMulti
                />

                {/*  v1.0.4 --------------------------------------------------------------------> */}
                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>
            </div>
            {/* v1.0.1 <-------------------------------------------------------------------------- */}
            {/* v1.0.2 <-------------------------------------------------------------------------- */}

            {/* v1.0.1 <----------------------------------------------------------- */}
            <div
              className={`grid gap-4 mt-4 ${
                isExpanded ? "grid-cols-2" : "grid-cols-2"
              }`}
            >
              {/*  v1.0.1 <--------------------------------------------------------------------------- */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Currency
                </label>
                <DropdownSelect
                  options={currencyOptions}
                  value={
                    currencyOptions.find(
                      (opt) => opt.value === formData.defaultCurrency
                    ) || null
                  }
                  onChange={(opt) =>
                    handleInputChange("defaultCurrency", opt?.value || "INR")
                  }
                  placeholder="Select currency"
                  isDisabled={currentMode === "view"}
                />
              </div>
              {/*  v1.0.1 ---------------------------------------------------------------------------> */}

              {/* <div>
                <label className="form-label">Mock Interview Discount (%)</label>
                <input
                  type="number"
                  className="input"
                  value={formData.discountMockInterview}
                  onChange={(e) => handleInputChange('discountMockInterview', parseInt(e.target.value))}
                  min="5"
                  max="30"
                />
              </div> */}
              {/*  v1.0.1 <----------------------------------------------------------------------------- */}
              <div className="flex items-center">
                {/*  v1.0.0 <-------------------------------------------------------------------- */}
                {/* <input
                  type="checkbox"
                  id="isActive"
                  className="rounded accent-custom-blue focus:ring-custom-blue"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  disabled={currentMode === "view"}
                /> */}
                <label
                  className={`inline-flex items-center cursor-pointer ${
                    currentMode === "view" ? "cursor-not-allowed" : ""
                  }`}
                >
                  <span className="ml-2 text-sm font-medium text-gray-700 mr-6">
                    Rate Card Status
                  </span>
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isActive}
                    onChange={(e) =>
                      handleInputChange("isActive", e.target.checked)
                    }
                    disabled={currentMode === "view"}
                  />
                  <div
                    className={`relative w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer
                      peer-checked:bg-custom-blue 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                      after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                      peer-checked:after:translate-x-full
                      ${
                        currentMode === "view"
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                  ></div>
                </label>

                {/*  v1.0.0 --------------------------------------------------------------------> */}
                {/* <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active Rate Card
                </label> */}
              </div>
              {/*  v1.0.1 <-----------------------------------------------------------------------------> */}
            </div>
          </div>

          {/* Experience Levels & Rates */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Experience Levels & Rates
              </h3>
              <button
                type="button"
                onClick={addLevel}
                // v1.0.0 <--------------------------------------------------------------------------------------------------------------------------
                className={`inline-flex items-center px-3 py-1 bg-custom-blue text-white text-sm font-medium rounded-md hover:bg-teal-700 ${
                  currentMode === "view" ? "hidden" : ""
                }`}
                // v1.0.0 -------------------------------------------------------------------------------------------------------------------------->
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Level
              </button>
            </div>

            <div className="space-y-4">
              {formData.levels.map((level, levelIndex) => (
                <div key={levelIndex} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex-1">
                      {/*  v1.0.0 <------------------------------------------------------------------ */}
                      <label className="form-label mr-2">
                        Experience Level
                      </label>
                      <select
                        className="input border border-gray-200 rounded-md px-1 py-1 outline-none"
                        value={level.level}
                        onChange={(e) =>
                          handleLevelChange(levelIndex, "level", e.target.value)
                        }
                        disabled={currentMode === "view"}
                      >
                        {experienceLevels.map((expLevel) => (
                          <option key={expLevel} value={expLevel}>
                            {expLevel}
                          </option>
                        ))}
                        <option value="Custom">Custom</option>
                      </select>
                      {/*  v1.0.0 <------------------------------------------------------------------ */}
                    </div>
                    {/* v1.0.0 <------------------------------------------------------------------------- */}
                    {/* v1.0.2 <------------------------------------------------------------------------- */}
                    {/* v1.0.4 <------------------------------------------------------------------------- */}
                    {/* {formData.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(levelIndex)}
                        // v1.0.4 <--------------------------------------------------------------------------
                        className={`${
                          mode === "view"
                            ? "text-gray-400 cursor-not-allowed"
                            : "ml-4 p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                        }`}
                        // v1.0.4 <-------------------------------------------------------------------------->
                        disabled={mode === "view"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )} */}
                    {formData.levels.length > 1 && currentMode !== "view" && (
                      <button
                        type="button"
                        onClick={() => removeLevel(levelIndex)}
                        className="ml-4 p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}

                    {/* v1.0.0 <------------------------------------------------------------------------- */}
                    {/* v1.0.2 <------------------------------------------------------------------------- */}
                    {/* v1.0.4 <------------------------------------------------------------------------- */}
                  </div>

                  <div
                    className={`grid gap-4 ${
                      isExpanded ? "grid-cols-4" : "grid-cols-2"
                    }`}
                  >
                    <div>
                      {/* v1.0.0 <---------------------------------------------------------------------- */}
                      <label className="form-label">INR Min (₹)</label>
                      <input
                        type="number"
                        className="input border border-gray-200 rounded-md px-1 py-1 outline-none"
                        value={level.rateRange.inr.min}
                        onChange={(e) =>
                          handleRateChange(
                            levelIndex,
                            "inr",
                            "min",
                            e.target.value
                          )
                        }
                        min="0"
                        readOnly={currentMode === "view"}
                      />
                      {/* v1.0.0 -----------------------------------------------------------------------> */}
                    </div>
                    <div>
                      <label className="form-label">INR Max (₹)</label>
                      {/* v1.0.0 <------------------------------------------------------ */}
                      <input
                        type="number"
                        className="input border border-gray-200 rounded-md px-1 py-1 outline-none"
                        value={level.rateRange.inr.max}
                        onChange={(e) =>
                          handleRateChange(
                            levelIndex,
                            "inr",
                            "max",
                            e.target.value
                          )
                        }
                        min="0"
                        readOnly={currentMode === "view"}
                      />
                      {/* v1.0.0 ------------------------------------------------------> */}
                    </div>
                    <div>
                      <label className="form-label">USD Min ($)</label>
                      {/* v1.0.0 <------------------------------------------------------ */}
                      <input
                        type="number"
                        className="input border border-gray-200 rounded-md px-1 py-1 outline-none"
                        value={level.rateRange.usd.min}
                        onChange={(e) =>
                          handleRateChange(
                            levelIndex,
                            "usd",
                            "min",
                            e.target.value
                          )
                        }
                        min="0"
                        readOnly={currentMode === "view"}
                      />
                      {/* v1.0.0 ------------------------------------------------------> */}
                    </div>
                    <div>
                      <label className="form-label">USD Max ($)</label>
                      {/* v1.0.0 <---------------------------------------------------- */}
                      <input
                        type="number"
                        className="input border border-gray-200 rounded-md px-1 py-1 outline-none"
                        value={level.rateRange.usd.max}
                        onChange={(e) =>
                          handleRateChange(
                            levelIndex,
                            "usd",
                            "max",
                            e.target.value
                          )
                        }
                        min="0"
                        readOnly={currentMode === "view"}
                      />
                      {/* v1.0.0 ----------------------------------------------------> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          {/* v1.0.0 <-------------------------------------------------------------- */}
          <div
            className={`flex space-x-3 ${
              currentMode === "view" ? "hidden" : ""
            } ${isExpanded ? "justify-center" : ""}`}
          >
            {/* v1.0.2 <--------------------------------------------------------------------------------------------------------------------------- */}
            <button
              disabled={currentMode === "view"}
              type="button"
              onClick={onClose}
              className={`inline-flex items-center justify-center px-4 py-2 bg-white text-custom-blue border border-custom-blue font-medium rounded-md hover:bg-gray-50 focus:outline-none ${
                isExpanded ? "px-8" : "flex-1"
              }`}
            >
              Cancel
            </button>
            <button
              disabled={currentMode === "view"}
              type="submit"
              className={`inline-flex items-center justify-center px-4 py-2 bg-custom-blue text-white font-medium rounded-md hover:bg-custom-blue focus:outline-none ${
                isExpanded ? "px-8" : "flex-1"
              }`}
            >
              {rateCard ? "Update Rate Card" : "Create Rate Card"}
            </button>
            {/* v1.0.2 ---------------------------------------------------------------------------------------------------------------------------> */}
          </div>
          {/* v1.0.0 <-------------------------------------------------------------- */}
        </form>
      </div>
    </div>
  );
}

export default RateCardModal;
