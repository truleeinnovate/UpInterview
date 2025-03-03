import React, { useState } from "react";
import { MdArrowDropDown } from "react-icons/md";

const PlanMasterAdd = ({ closeAddPage, selectedTab }) => {
  const [selectedPlanMasterName, setSelectedPlanMasterName] = useState("");
  const [
    selectedAnalyticsDashboardAccess,
    setSelectedAnalyticsDashboardAccess,
  ] = useState("");
  const [selectedThirdPartyIntegrations, setSelectedThirdPartyIntegrations] =
    useState("");
  const [selectedVideoQuality, setSelectedVideoQuality] = useState("");
  const [selectedAPIAccess, setSelectedAPIAccess] = useState("");
  const [selectedFeedbackReporting, setSelectedFeedbackReporting] =
    useState("");
  const [selectedAssessmentTestsAccess, setSelectedAssessmentTestsAccess] =
    useState("");

  const [showDropdownPlanMasterName, setShowDropdownPlanMasterName] =
    useState(false);
  const [showDropdownAnalytics, setShowDropdownAnalytics] = useState(false);
  const [showDropdownThirdParty, setShowDropdownThirdParty] = useState(false);
  const [showDropdownVideoQuality, setShowDropdownVideoQuality] =
    useState(false);
  const [showDropdownAPIAccess, setShowDropdownAPIAccess] = useState(false);
  const [showDropdownFeedback, setShowDropdownFeedback] = useState(false);
  const [showDropdownAssessmentTests, setShowDropdownAssessmentTests] =
    useState(false);

  const toggleDropdown = (setter) => {
    setter((prev) => !prev);
  };

  const handleSelect = (setter, dropdownSetter, option) => {
    setter(option);
    dropdownSetter(false);
  };
  return (
    <div>
      <div className={"fixed inset-0 bg-black bg-opacity-15 z-50"}>
        <div className="fixed inset-y-0 right-0 z-50 w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
          <div className="fixed top-0 w-full bg-white border-b">
            <div className="flex justify-between items-center p-4">
              <h2 className="text-lg font-bold">{selectedTab}</h2>
              <button onClick={closeAddPage} className="focus:outline-none">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="fixed top-16 bottom-16 overflow-auto p-5 w-full text-sm right-0">
            <form className="space-y-8">
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  PlanMaster ID
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              {/* PlanMaster Name Dropdown */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  PlanMaster Name
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedPlanMasterName}
                      readOnly
                      onClick={() =>
                        toggleDropdown(setShowDropdownPlanMasterName)
                      }
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() =>
                        toggleDropdown(setShowDropdownPlanMasterName)
                      }
                    />
                  </div>
                  {showDropdownPlanMasterName && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedPlanMasterName,
                            setShowDropdownPlanMasterName,
                            "Free"
                          )
                        }
                      >
                        Free
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedPlanMasterName,
                            setShowDropdownPlanMasterName,
                            "Basic"
                          )
                        }
                      >
                      Basic
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedPlanMasterName,
                            setShowDropdownPlanMasterName,
                            "Advanced"
                          )
                        }
                      >
                      Advanced
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Max Users
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Max Licenses
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Interview Schedules Limit
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Outsourced Interview Allowed
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Outsourced Interview Limit
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Bandwidth
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Mock Interview Access
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              {/* Assessment Tests Access */}
              <div className="flex items-center mb-5">
  <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
    Assessment Tests Access
  </label>
  <div className="relative flex-grow">
    <div className="relative">
      <input
        type="text"
        className="border-b focus:outline-none mb-5 w-full"
        value={selectedAssessmentTestsAccess}
        readOnly
        onClick={() => toggleDropdown(setShowDropdownAssessmentTests)}
      />
      <MdArrowDropDown
        className="absolute right-0 top-0 cursor-pointer"
        onClick={() => toggleDropdown(setShowDropdownAssessmentTests)}
      />
    </div>
    {showDropdownAssessmentTests && (
      <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
        <div
          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
          onClick={() =>
            handleSelect(
              setSelectedAssessmentTestsAccess,
              setShowDropdownAssessmentTests,
              " No Test"
            )
          }
        >
         No Test 
        </div>
        <div
          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
          onClick={() =>
            handleSelect(
              setSelectedAssessmentTestsAccess,
              setShowDropdownAssessmentTests,
              " Standard Test"
            )
          }
        >
        Standard Test
        </div>
        <div
          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
          onClick={() =>
            handleSelect(
              setSelectedAssessmentTestsAccess,
              setShowDropdownAssessmentTests,
              " Custom Tests"
            )
          }
        >
        Custom Tests
        </div>
      </div>
    )}
  </div>
</div>

              {/* Feedback Reporting */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Feedback Reporting
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedFeedbackReporting}
                      readOnly
                      onClick={() => toggleDropdown(setShowDropdownFeedback)}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() => toggleDropdown(setShowDropdownFeedback)}
                    />
                  </div>
                  {showDropdownFeedback && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedFeedbackReporting,
                            setShowDropdownFeedback,
                            "Basic"
                          )
                        }
                      >
                       Basic
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedFeedbackReporting,
                            setShowDropdownFeedback,
                            "Advanced"
                          )
                        }
                      >
                        Advanced
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedFeedbackReporting,
                            setShowDropdownFeedback,
                            "Comprehensive"
                          )
                        }
                      >
                        Comprehensive
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {/* API Access */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  API Access
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedAPIAccess}
                      readOnly
                      onClick={() => toggleDropdown(setShowDropdownAPIAccess)}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() => toggleDropdown(setShowDropdownAPIAccess)}
                    />
                  </div>
                  {showDropdownAPIAccess && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAPIAccess,
                            setShowDropdownAPIAccess,
                            "No Access"
                          )
                        }
                      >
                       No Access
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAPIAccess,
                            setShowDropdownAPIAccess,
                            "Limited Access"
                          )
                        }
                      >
                        Limited Access
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAPIAccess,
                            setShowDropdownAPIAccess,
                            "Full Access"
                          )
                        }
                      >
                        Full Access
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Video Quality */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Video Quality
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedVideoQuality}
                      readOnly
                      onClick={() =>
                        toggleDropdown(setShowDropdownVideoQuality)
                      }
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() =>
                        toggleDropdown(setShowDropdownVideoQuality)
                      }
                    />
                  </div>
                  {showDropdownVideoQuality && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedVideoQuality,
                            setShowDropdownVideoQuality,
                            "720p"
                          )
                        }
                      >
                       720p
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedVideoQuality,
                            setShowDropdownVideoQuality,
                            " 1080p"
                          )
                        }
                      >
                        1080p
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedVideoQuality,
                            setShowDropdownVideoQuality,
                            "4K"
                          )
                        }
                      >
                        4K
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Recurring Interviews
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Interview Panel Size
                </label>
                <div className="flex-grow border-b border-gray-300 mb-3">
                  <input type="text" className="w-full focus:outline-none" />
                </div>
              </div>
              {/* Third Party Integrations */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Third Party Integrations
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedThirdPartyIntegrations}
                      readOnly
                      onClick={() => toggleDropdown(setShowDropdownThirdParty)}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() => toggleDropdown(setShowDropdownThirdParty)}
                    />
                  </div>
                  {showDropdownThirdParty && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedThirdPartyIntegrations,
                            setShowDropdownThirdParty,
                            "None"
                          )
                        }
                      >
                        None
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedThirdPartyIntegrations,
                            setShowDropdownThirdParty,
                            "Limited"
                          )
                        }
                      >
                        Limited
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedThirdPartyIntegrations,
                            setShowDropdownThirdParty,
                            "Full Suite"
                          )
                        }
                      >
                        Full Suite
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Analytics Dashboard Access */}
              <div className="flex items-center mb-5">
                <label className="block text-sm font-medium text-gray-700 w-1/3 mr-4">
                  Analytics Dashboard Access
                </label>
                <div className="relative flex-grow">
                  <div className="relative">
                    <input
                      type="text"
                      className="border-b focus:outline-none mb-5 w-full"
                      value={selectedAnalyticsDashboardAccess}
                      readOnly
                      onClick={() => toggleDropdown(setShowDropdownAnalytics)}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-0 cursor-pointer"
                      onClick={() => toggleDropdown(setShowDropdownAnalytics)}
                    />
                  </div>
                  {showDropdownAnalytics && (
                    <div className="absolute z-50 mt-2 w-full bg-white shadow-lg rounded-md">
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAnalyticsDashboardAccess,
                            setShowDropdownAnalytics,
                            " Basic"
                          )
                        }
                      >
                     Basic
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAnalyticsDashboardAccess,
                            setShowDropdownAnalytics,
                            "Standard"
                          )
                        }
                      >
                        Standard
                      </div>
                      <div
                        className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                        onClick={() =>
                          handleSelect(
                            setSelectedAnalyticsDashboardAccess,
                            setShowDropdownAnalytics,
                            "Advanced"
                          )
                        }
                      >
                       Advanced
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
            <div className="footer-buttons flex justify-end mt-4">
              <button type="submit" className="footer-button">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanMasterAdd;
