// v1.0.0 - Ashok - Adding form submission and modal functionality for interviewer rates
// v1.0.1 - Ashok - changed header Title based on mode (view/create/edit)
import { useState, useEffect, useRef } from "react";
import {
  // AiOutlineClose,
  // AiOutlineExpandAlt,
  // AiOutlineShrink,
  AiOutlinePlus,
  AiOutlineDelete,
} from "react-icons/ai";
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

// v1.0.1 <--------------------------------------------------------------------
function SearchableDropdown({ label, options, value, onChange, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const filteredOptions = options.filter((opt) =>
    opt.TechnologyMasterName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (val) => {
    onChange(val);
    setIsOpen(false);
    setSearch(""); // clear search after select
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
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
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

      <div
        className={`flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 bg-white cursor-pointer ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
      >
        <span className="text-sm text-gray-700">
          {value || "Select Technology"}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </div>

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
                  onClick={() => handleSelect(opt.TechnologyMasterName)}
                >
                  {opt.TechnologyMasterName}
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
    </div>
  );
}


// v1.0.1 -------------------------------------------------------------------->

// v1.0.0 <-------------------------------------------------------
function RateCardModal({ rateCard, onClose, mode = "create" }) {
  // v1.0.0 <-------------------------------------------------------
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    technology: "",
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
  console.log("Technologies Master ================> :", technologies);
  // v1.0.1 ------------------------------------------------------>

  const categories = [
    "Software Development",
    "Data & AI",
    "DevOps & Cloud",
    "QA & Testing",
    "Specialized Skills",
  ];

  const experienceLevels = ["Junior", "Mid-Level", "Senior"];
  // v1.0.0 <-------------------------------------------------------
  useEffect(() => {
    if (rateCard) {
      setFormData({
        _id: rateCard._id,
        category: rateCard.category,
        technology: rateCard.technology,
        levels: rateCard.levels,
        discountMockInterview: rateCard.discountMockInterview,
        defaultCurrency: rateCard.defaultCurrency,
        isActive: rateCard.isActive,
      });
    }
  }, [rateCard]);
  // v1.0.0 <-------------------------------------------------------

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

  // v1.0.0 <------------------------------------------------------
  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   // Handle form submission

  //   console.log("Form submitted:", formData);
  //   onClose();
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Form data before submission:", formData);

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
              {/* v1.0.1 <------------------------------------------------------------------------------ */}
              <div className="flex flex-col">
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                <SearchableDropdown
                  label="Category"
                  options={categories.map((c) => ({
                    _id: c,
                    TechnologyMasterName: c,
                  }))}
                  value={formData.category}
                  onChange={(val) => handleInputChange("category", val)}
                  disabled={currentMode === "view"}
                />

                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>
              {/* v1.0.1 <------------------------------------------------------------------------------ */}

              {/* v1.0.1 <-------------------------------------------------------------------------- */}
              <div className="flex flex-col">
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                <SearchableDropdown
                  label="Technology / Role"
                  options={technologies || []}
                  value={formData.technology}
                  onChange={(val) => handleInputChange("technology", val)}
                  disabled={currentMode === "view"}
                />
                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>
            </div>
            {/* v1.0.1 <-------------------------------------------------------------------------- */}

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
                    {/* {formData.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(levelIndex)}
                        className="ml-4 p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
                      >
                        <AiOutlineDelete size={16} />
                      </button>
                    )} */}
                    {/* v1.0.0 <------------------------------------------------------------------------- */}
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
            className={`flex space-x-3 ${currentMode === "view" ? "hidden" : ""} ${
              isExpanded ? "justify-center" : ""
            }`}
          >
            <button
              disabled={currentMode === "view"}
              type="button"
              onClick={onClose}
              className={`inline-flex items-center justify-center px-4 py-2 bg-white text-custom-blue border border-custom-blue font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
                isExpanded ? "px-8" : "flex-1"
              }`}
            >
              Cancel
            </button>
            <button
              disabled={currentMode === "view"}
              type="submit"
              className={`inline-flex items-center justify-center px-4 py-2 bg-custom-blue text-white font-medium rounded-md hover:bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 ${
                isExpanded ? "px-8" : "flex-1"
              }`}
            >
              {rateCard ? "Update Rate Card" : "Create Rate Card"}
            </button>
          </div>
          {/* v1.0.0 <-------------------------------------------------------------- */}
        </form>
      </div>
    </div>
  );
}

export default RateCardModal;
