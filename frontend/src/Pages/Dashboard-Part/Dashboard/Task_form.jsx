import React, { useState, useEffect } from "react";
import { MdArrowDropDown } from "react-icons/md"; // Import the dropdown icon
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { fetchMasterData } from "../../../utils/fetchMasterData.js";
import { fetchFilterData } from "../../../utils/dataUtils";
import { validateTaskForm } from "../../../utils/AppTaskValidation";
import { IoArrowBack } from "react-icons/io5";

const TaskForm = ({
  onClose,
  onTaskAdded,
  sharingPermissions,
  onDataAdded,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    priority: "",
    status: "New",
    relatedTo: {
      objectName: "",
      recordId: "",
    },
    dueDate: "",
    comments: "",
  });

  const [selectedPriority, setSelectedPriority] = useState("");
  const [showDropdownPriority, setShowDropdownPriority] = useState(false);
  const priorities = ["High", "Normal"];

  const [selectedStatus, setSelectedStatus] = useState("New");
  const [showDropdownStatus, setShowDropdownStatus] = useState(false);
  const statuses = ["New", "In Progress", "Completed", "No Response"];

  const [errors, setErrors] = useState({});
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);

  // Add state and handlers for Related To dropdowns
  const [selectedCategoryRelatedTo, setSelectedCategoryRelatedTo] =
    useState("");
  const [showDropdownCategoryRelatedTo, setShowDropdownCategoryRelatedTo] =
    useState(false);

  const [selectedOptionRelatedTo, setSelectedOptionRelatedTo] = useState("");
  const [showDropdownOptionRelatedTo, setShowDropdownOptionRelatedTo] =
    useState(false);
  const optionsRelatedTo = {
    Candidate: ["60d21b4667d0d8992e610c85", "60d21b4967d0d8992e610c86"], // Example ObjectIds
    Position: ["60d21b4b67d0d8992e610c87", "60d21b4d67d0d8992e610c88"], // Example ObjectIds
  };
  const toggleDropdownPriority = () => {
    setShowDropdownPriority(!showDropdownPriority);
  };

  const handlePrioritySelect = (priority) => {
    setSelectedPriority(priority);
    setShowDropdownPriority(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      priority: priority,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      priority: "",
    }));
  };

  const toggleDropdownStatus = () => {
    setShowDropdownStatus(!showDropdownStatus);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    setShowDropdownStatus(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      status: status,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      status: "",
    }));
  };

  const toggleDropdownCategoryRelatedTo = () => {
    setShowDropdownCategoryRelatedTo(!showDropdownCategoryRelatedTo);
  };

  const [candidates, setCandidates] = useState([]);
  const [positions, setPositions] = useState([]);
  const [teams, setTeams] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [questionBanks, setQuestionBanks] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [mockInterviews, setMockInterviews] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedCategoryRelatedTo === "Candidates") {
      setLoading(true);
      fetchFilterData("candidate", sharingPermissions.candidate)
        .then((data) => setCandidates(data))
        .catch((error) => console.error("Error fetching candidates:", error))
        .finally(() => setLoading(false));
    }
  }, [selectedCategoryRelatedTo, sharingPermissions.candidate]);

  useEffect(() => {
    if (selectedCategoryRelatedTo === "Positions") {
      setLoading(true);
      fetchFilterData("position", sharingPermissions.position)
        .then((data) => setPositions(data))
        .catch((error) => console.error("Error fetching positions:", error))
        .finally(() => setLoading(false));
    }
  }, [selectedCategoryRelatedTo, sharingPermissions.position]);

  useEffect(() => {
    if (selectedCategoryRelatedTo === "Teams") {
      setLoading(true);
      fetchFilterData("team", sharingPermissions.team)
        .then((data) => setTeams(data))
        .catch((error) => console.error("Error fetching teams:", error))
        .finally(() => setLoading(false));
    }
  }, [selectedCategoryRelatedTo, sharingPermissions.team]);

  // Repeat similar useEffect hooks for other categories like assessments, questionBanks, etc.

  // const handleCategorySelectRelatedTo = (category) => {
  //   setSelectedCategoryRelatedTo(category);
  //   setSelectedOptionRelatedTo(""); // Reset option when category changes
  //   setShowDropdownCategoryRelatedTo(false);
  // };

  const handleInputChange = (field, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: value,
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "", // Clear the error for the specific field
    }));
  };

  const getOptionsForSelectedCategory = () => {
    switch (selectedCategoryRelatedTo) {
      case "Candidates":
        return candidates.map((candidate) => ({
          name: candidate.LastName,
          id: candidate._id,
        }));
      case "Positions":
        return positions.map((position) => ({
          name: position.title,
          id: position._id,
        }));
      case "Teams":
        return teams.map((team) => ({ name: team.LastName, id: team._id }));
      case "Assessments":
        return assessments.map((assessment) => ({
          name: assessment.title,
          id: assessment._id,
        }));
      case "QuestionBank":
        return questionBanks.map((qb) => ({ name: qb.title, id: qb._id }));
      case "Interviews":
        return interviews.map((interview) => ({
          name: interview.title,
          id: interview._id,
        }));
      case "MockInterviews":
        return mockInterviews.map((mock) => ({
          name: mock.title,
          id: mock._id,
        }));
      case "Analytics":
        return analytics.map((analytic) => ({
          name: analytic.name,
          id: analytic._id,
        }));
      default:
        return [];
    }
  };

  const toggleDropdownOptionRelatedTo = () => {
    setShowDropdownOptionRelatedTo(!showDropdownOptionRelatedTo);
  };
  const [selectedOptionId, setSelectedOptionId] = useState("");
  // const handleOptionSelectRelatedTo = (optionName, optionId) => {
  //   console.log("Selected option:", optionName, "ID:", optionId); // Debugging log
  //   setSelectedOptionRelatedTo(optionName);
  //   setSelectedOptionId(optionId); // Store the ID
  //   setShowDropdownOptionRelatedTo(false); // Close the dropdown
  //   setFormData((prevFormData) => ({
  //     ...prevFormData,
  //     relatedTo: {
  //       objectName: selectedCategoryRelatedTo, // Ensure objectName is set
  //       recordId: optionId // Ensure the ID is set in formData
  //     }
  //   }));
  //   setErrors((prevErrors) => ({
  //     ...prevErrors,
  //     relatedTo: "", // Clear the error for relatedTo
  //   }));
  //   console.log("Updated formData:", formData); // Debugging log
  // };

  const handleClose = () => {
    const isFormEmpty =
      !formData.title &&
      !formData.assignedTo &&
      !selectedPriority &&
      !selectedStatus &&
      !formData.relatedTo &&
      !formData.dueDate &&
      !formData.comments;

    if (!isFormEmpty) {
      setShowConfirmationPopup(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateTaskForm(
      formData,
      selectedPriority,
      selectedStatus
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Form validation failed:", newErrors);
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tasks`,
        {
          ...formData,
          priority: selectedPriority,
          status: selectedStatus,
          relatedTo: {
            objectName: formData.relatedTo.objectName,
            recordId: formData.relatedTo.recordId,
          },
        }
      );
      onTaskAdded(response.data);
      if (response.data) {
        onDataAdded();
      }
    } catch (error) {
      console.error("Error adding task:", error);
      if (error.response) {
        console.error("Server response:", error.response.data);
      }
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const [categoriesRelatedTo, setCategoriesRelatedTo] = useState([]);

  useEffect(() => {
    const fetchObjectsData = async () => {
      try {
        const data = await fetchMasterData("sharing-rules-objects");
        setCategoriesRelatedTo(data.map((obj) => obj.objects).flat());
        console.log(data);
      } catch (error) {
        console.error("Error fetching objects data:", error);
      }
    };
    fetchObjectsData();
  }, []);

  const handleCategorySelectRelatedTo = (category) => {
    setSelectedCategoryRelatedTo(category);
    setSelectedOptionRelatedTo(""); // Reset option when category changes
    setShowDropdownCategoryRelatedTo(false);
    setFormData((prevFormData) => ({
      ...prevFormData,
      relatedTo: {
        ...prevFormData.relatedTo,
        objectName: category, // Update objectName in formData
      },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      relatedToCategory: "", // Clear the error for the category
    }));
  };

  const handleOptionSelectRelatedTo = (optionName, optionId) => {
    setSelectedOptionRelatedTo(optionName);
    setSelectedOptionId(optionId); // Store the ID
    setShowDropdownOptionRelatedTo(false); // Close the dropdown
    setFormData((prevFormData) => ({
      ...prevFormData,
      relatedTo: {
        ...prevFormData.relatedTo,
        recordId: optionId, // Update recordId in formData
      },
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      relatedToOption: "", // Clear the error for the option
    }));
  };

  return (
    <>
      <div>
        <div className="fixed top-0 w-full bg-white border-b">
          <div className="flex justify-between sm:justify-start items-center p-4">
            <button
              onClick={handleClose}
              className="focus:outline-none md:hidden lg:hidden xl:hidden 2xl:hidden sm:w-8"
            >
              <IoArrowBack className="text-2xl" />
            </button>
            <h2 className="text-lg font-bold">Task</h2>
            <button onClick={handleClose} className="focus:outline-none sm:hidden">

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

        <div className="fixed top-16 bottom-16  overflow-auto p-4 w-full text-sm">
          <div>
            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-2 text-sm font-medium text-gray-900 w-36"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    name="title"
                    type="text"
                    id="title"
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.title
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm -mt-4">{errors.title}</p>
                  )}
                </div>
              </div>
              {/* Assigned To */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="assignedTo"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Assigned To <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    type="text"
                    name="assignedTo"
                    id="assignedTo"
                    value={formData.assignedTo}
                    onChange={(e) =>
                      handleInputChange("assignedTo", e.target.value)
                    }
                    autoComplete="off"
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.assignedTo
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {errors.assignedTo && (
                    <p className="text-red-500 text-sm -mt-4 ">
                      {errors.assignedTo}
                    </p>
                  )}
                </div>
              </div>
              {/* Priority */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="priority"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Priority <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow relative">
                  <input
                    type="text"
                    name="priority"
                    id="priority"
                    value={selectedPriority}
                    onClick={toggleDropdownPriority}
                    readOnly
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.priority
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  <MdArrowDropDown
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownPriority}
                  />
                  {showDropdownPriority && (
                    <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
                      {priorities.map((priority) => (
                        <div
                          key={priority}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                          onClick={() => handlePrioritySelect(priority)}
                        >
                          {priority}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.priority && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.priority}
                    </p>
                  )}
                </div>
              </div>
              {/* Status */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow relative">
                  <input
                    type="text"
                    name="status"
                    id="status"
                    value={selectedStatus}
                    onClick={toggleDropdownStatus}
                    readOnly
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.status
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  <MdArrowDropDown
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownStatus}
                  />
                  {showDropdownStatus && (
                    <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
                      {statuses.map((status) => (
                        <div
                          key={status}
                          className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                          onClick={() => handleStatusSelect(status)}
                        >
                          {status}
                        </div>
                      ))}
                    </div>
                  )}
                  {errors.status && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.status}
                    </p>
                  )}
                </div>
              </div>
              {/* Related To */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="relatedTo"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Related To <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow flex gap-4">
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="categoryRelatedTo"
                      id="categoryRelatedTo"
                      value={selectedCategoryRelatedTo}
                      onClick={toggleDropdownCategoryRelatedTo}
                      readOnly
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.relatedToCategory
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2"
                      onClick={toggleDropdownCategoryRelatedTo}
                    />
                    {showDropdownCategoryRelatedTo && (
                      <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-lg overflow-y-auto max-h-60">
                        {categoriesRelatedTo.map((category) => (
                          <div
                            key={category}
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleCategorySelectRelatedTo(category)
                            }
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.relatedToCategory && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.relatedToCategory}
                      </p>
                    )}
                  </div>
                  <div className="relative w-1/2">
                    <input
                      type="text"
                      name="optionRelatedTo"
                      id="optionRelatedTo"
                      value={selectedOptionRelatedTo}
                      onClick={() =>
                        setShowDropdownOptionRelatedTo(
                          !showDropdownOptionRelatedTo
                        )
                      }
                      readOnly
                      className={`border-b focus:outline-none mb-5 w-full ${
                        errors.relatedToOption
                          ? "border-red-500"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    <MdArrowDropDown
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2"
                      onClick={() =>
                        setShowDropdownOptionRelatedTo(
                          !showDropdownOptionRelatedTo
                        )
                      }
                    />
                    {showDropdownOptionRelatedTo && (
                      <div className="absolute z-50 -mt-4 w-full rounded-md bg-white shadow-lg">
                        {getOptionsForSelectedCategory().map((option) => (
                          <div
                            key={option.id} // Use the ID as the key
                            className="py-2 px-4 cursor-pointer hover:bg-gray-100"
                            onClick={() =>
                              handleOptionSelectRelatedTo(
                                option.name,
                                option.id
                              )
                            } // Pass both name and id
                          >
                            {option.name}
                          </div>
                        ))}
                      </div>
                    )}
                    {errors.relatedToOption && (
                      <p className="text-red-500 text-sm -mt-4">
                        {errors.relatedToOption}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              {/* Due Date */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="dueDate"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                </div>
                <div className="flex-grow">
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) =>
                      handleInputChange("dueDate", e.target.value)
                    }
                    min={today}
                    className={`border-b focus:outline-none mb-5 w-full ${
                      errors.dueDate
                        ? "border-red-500"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {errors.dueDate && (
                    <p className="text-red-500 text-sm -mt-4">
                      {errors.dueDate}
                    </p>
                  )}
                </div>
              </div>
              {/* Comments */}
              <div className="flex gap-5 mb-5">
                <div>
                  <label
                    htmlFor="comments"
                    className="block text-sm font-medium leading-6 text-gray-900 w-36"
                  >
                    Comments
                  </label>
                </div>
                <div className="flex-grow">
                  <textarea
                    name="comments"
                    id="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    rows="4"
                    className="border focus:outline-none mb-5 w-full border-gray-300 focus:border-black rounded-md"
                  ></textarea>
                </div>
              </div>

              {/* Footer */}
              <div className="footer-buttons flex justify-end">
                <button type="submit" className="footer-button">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation Popup */}
      {showConfirmationPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
          <div className="bg-white p-5 rounded shadow-lg">
            <p>Are you sure you want to close without saving?</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                type="button"
                onClick={() => setShowConfirmationPopup(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskForm;
