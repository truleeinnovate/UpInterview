// v1.0.0 - Ashok - Adding form submission and modal functionality for interviewer rates
import { useState, useEffect } from "react";
import {
  // AiOutlineClose,
  // AiOutlineExpandAlt,
  // AiOutlineShrink,
  AiOutlinePlus,
  AiOutlineDelete,
} from "react-icons/ai";
import { Minimize, Expand, X } from "lucide-react";
// v1.0.0 <--------------------------------------
import axios from "axios";
import { config } from "../../../config";
import toast from "react-hot-toast";
// v1.0.0 -------------------------------------->

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
            <div>
              <h2 className="text-2xl font-bold text-custom-blue">
                {rateCard ? "Edit Rate Card" : "Create Rate Card"}
              </h2>
              <p className="text-gray-500 mt-1">
                {rateCard
                  ? "Update interviewer rate information"
                  : "Add new interviewer rate card"}
              </p>
            </div>
            <div className="flex space-x-2">
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
                isExpanded ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="flex items-center gap-2">
                <label className="form-label">
                  Category <span className="text-red-500"> *</span>
                </label>
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                <select
                  className="input border border-gray-300 rounded-md px-2 py-1 outline-none"
                  value={formData.category}
                  onChange={(e) =>
                    handleInputChange("category", e.target.value)
                  }
                  required
                  disabled={mode === "view"}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>

              <div className="flex items-center gap-2">
                <label className="form-label">
                  Technology / Role <span className="text-red-500"> *</span>
                </label>
                {/*  v1.0.0 <------------------------------------------------------------------ */}
                <input
                  type="text"
                  className="input border border-gray-300 rounded-md px-2 py-1 outline-none"
                  value={formData.technology}
                  onChange={(e) =>
                    handleInputChange("technology", e.target.value)
                  }
                  placeholder="e.g., Full-Stack Developer, Data Scientist"
                  required
                  disabled={mode === "view"}
                />
                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>
            </div>

            <div
              className={`grid gap-4 mt-4 ${
                isExpanded ? "grid-cols-3" : "grid-cols-2"
              }`}
            >
              <div className="flex items-center gap-2">
                <label className="form-label">Default Currency</label>
                {/*  v1.0.0 <-------------------------------------------------------------------- */}
                <select
                  className="input border border-gray-300 rounded-md px-2 py-1 outline-none"
                  value={formData.defaultCurrency}
                  onChange={(e) =>
                    handleInputChange("defaultCurrency", e.target.value)
                  }
                  disabled={mode === "view"}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
                {/*  v1.0.0 --------------------------------------------------------------------> */}
              </div>

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

              <div className="flex items-center">
                {/*  v1.0.0 <-------------------------------------------------------------------- */}
                <input
                  type="checkbox"
                  id="isActive"
                  className="rounded accent-custom-blue focus:ring-custom-blue"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleInputChange("isActive", e.target.checked)
                  }
                  disabled={mode === "view"}
                />
                {/*  v1.0.0 --------------------------------------------------------------------> */}
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active Rate Card
                </label>
              </div>
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
                  mode === "view" ? "hidden" : ""
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
                        disabled={mode === "view"}
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
                        readOnly={mode === "view"}
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
                        readOnly={mode === "view"}
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
                        readOnly={mode === "view"}
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
                        readOnly={mode === "view"}
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
            className={`flex space-x-3 ${mode === "view" ? "hidden" : ""} ${
              isExpanded ? "justify-center" : ""
            }`}
          >
            <button
              disabled={mode === "view"}
              type="button"
              onClick={onClose}
              className={`inline-flex items-center justify-center px-4 py-2 bg-white text-custom-blue border border-custom-blue font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 ${
                isExpanded ? "px-8" : "flex-1"
              }`}
            >
              Cancel
            </button>
            <button
              disabled={mode === "view"}
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
