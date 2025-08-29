// v1.0.0 - Ashok - Adding form submission and modal functionality for interviewer rates
// v1.0.1 - Ashok - changed header Title based on mode (view/create/edit)
// v1.0.2 - Ashok - fixed issues in Technology dropdown enabled delete level button
// v1.0.3 - Ashok - changed to multiple option selection and added basic validations
import { useState, useEffect, useRef } from "react";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { Minimize, Expand, X, ChevronDown } from "lucide-react";
// v1.0.0 <--------------------------------------
import axios from "axios";
import { config } from "../../../config";
import toast from "react-hot-toast";
// v1.0.0 -------------------------------------->
// v1.0.1 <-------------------------------------------------------
import { useMasterData } from "../../../apiHooks/useMasterData";
import { ReactComponent as FaEdit } from "../../../icons/FaEdit.svg";
// v1.0.1 ------------------------------------------------------->

// v1.0.3 <-------------------------------------------------------------------------------
// v1.0.2 <----------------------------------------------------------------------------
// v1.0.1 <--------------------------------------------------------------------
function SearchableDropdown({
  label,
  options,
  value,
  onChange,
  disabled,
  multiple = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Normalize value to array if multiple
  const selectedValues = multiple ? value || [] : value;

  const filteredOptions = (options || []).filter(
    (opt) =>
      opt?.name &&
      opt.name.toLowerCase().includes(search.toLowerCase()) &&
      (!multiple || !selectedValues.includes(opt.name)) // hide already selected
  );

  const handleSelect = (val) => {
    if (multiple) {
      onChange([...selectedValues, val]);
      setIsOpen(false);
    } else {
      onChange(val);
      setIsOpen(false);
    }
    setSearch("");
  };

  const handleRemove = (val) => {
    if (multiple) {
      onChange(selectedValues.filter((item) => item !== val));
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      {/* Dropdown Input */}
      <div
        className={`flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className="text-sm text-gray-700">
          {multiple
            ? selectedValues.length > 0
              ? `${selectedValues.length} selected`
              : `Select ${label}`
            : selectedValues || `Select ${label}`}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

      {/* Dropdown List */}
      {isOpen && !disabled && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {/* Search input */}
          <div className="p-2">
            <input
              type="text"
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md outline-none"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>

          {/* Options */}
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <li
                  key={opt._id}
                  className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelect(opt.name)}
                >
                  {opt.name}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-400">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Selected Chips for multiple */}
      {multiple && selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedValues.map((val) => (
            <div
              key={val}
              className="flex items-center gap-1 bg-custom-blue/20 text-custom-blue text-sm px-3 py-1 rounded-full"
            >
              <span className="">{val}</span>
              <button
                type="button"
                onClick={() => handleRemove(val)}
                className="hover:text-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// v1.0.1 -------------------------------------------------------------------->
// v1.0.2 --------------------------------------------------------------------------->
// v1.0.3 ------------------------------------------------------------------------------->

// v1.0.0 <-------------------------------------------------------
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

  const categories = [
    "Software Development",
    "Data & AI",
    "DevOps & Cloud",
    "QA & Testing",
    "Specialized Skills",
  ];

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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data before submission:", formData);
    // v1.0.3 <------------------------------------------------------------------
    const errors = validateRateCard(formData);
    if (Object.keys(errors).length > 0) {
      // Show first error using toast
      toast.error(Object.values(errors)[0]);
      console.log("Validation errors:", errors);
      return;
    }
    // v1.0.3 ------------------------------------------------------------------>

    try {
      let response;

      if (formData._id) {
        // Update existing card
        response = await axios.put(
          `${config.REACT_APP_API_URL}/rate-cards/${formData._id}`,
          formData
        );
      } else {
        // Create new card
        response = await axios.post(
          `${config.REACT_APP_API_URL}/rate-cards`,
          formData
        );
      }

      console.log("Form submitted successfully:", response.data);

      // Close popup only if request was successful
      if (response.status === 200 || response.status === 201) {
        toast.success(response.data.message);
        onClose();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // v1.0.0 ------------------------------------------------------>

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
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                <SearchableDropdown
                  label="Category"
                  options={categories.map((c) => ({
                    _id: c,
                    name: c,
                  }))}
                  value={formData.category}
                  onChange={(val) => handleInputChange("category", val)}
                  disabled={currentMode === "view"}
                />

                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>
              {/* v1.0.1 <------------------------------------------------------------------------------ */}
              {/* v1.0.2 <---------------------------------------------------------------------------------- */}

              {/* v1.0.2 <-------------------------------------------------------------------------- */}
              {/* v1.0.1 <-------------------------------------------------------------------------- */}
              <div className="flex flex-col">
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                {/* <SearchableDropdown
                  label="Technology / Role"
                  options={technologies || []}
                  value={formData.technology}
                  onChange={(val) => handleInputChange("technology", val)}
                  disabled={currentMode === "view"}
                /> */}
                <SearchableDropdown
                  label="Technology / Role"
                  options={(technologies || []).map((t) => ({
                    _id: t._id,
                    name: t.TechnologyMasterName, // 👈 map correctly
                  }))}
                  value={formData.technology}
                  onChange={(val) => handleInputChange("technology", val)}
                  disabled={currentMode === "view"}
                  // v1.0.3 <----------------------------------------
                  multiple={true}
                  // v1.0.3 --------------------------------------->
                />

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
                {/*  v1.0.0 <-------------------------------------------------------------------- */}
                <select
                  className="text-sm border border-gray-300 rounded-md px-3 py-2 outline-none"
                  value={formData.defaultCurrency}
                  onChange={(e) =>
                    handleInputChange("defaultCurrency", e.target.value)
                  }
                  disabled={currentMode === "view"}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
                {/*  v1.0.0 --------------------------------------------------------------------> */}
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
                <AiOutlinePlus className="mr-1" size={14} />
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
                    {formData.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(levelIndex)}
                        className="ml-4 p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                      >
                        <AiOutlineDelete size={16} />
                      </button>
                    )}
                    {/* v1.0.0 <------------------------------------------------------------------------- */}
                    {/* v1.0.2 <------------------------------------------------------------------------- */}
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
