import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { MdArrowDropDown } from "react-icons/md";
import { config } from "../../../../config.js";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { validateTaskForm } from "../../../../utils/AppTaskValidation";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import "react-datepicker/dist/react-datepicker.css";

const TaskForm = ({
  onClose,
  onTaskAdded,
  onDataAdded,
  taskId, // Add taskId prop for editing
  initialData // Add initial data for pre-filling form
}) => {
    const context = useCustomContext();
    const candidateData = context?.candidateData || [];
    const positions = context?.positions || [];
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
  const navigate = useNavigate();
  const [selectedPriority, setSelectedPriority] = useState("");
  const [showDropdownPriority, setShowDropdownPriority] = useState(false);
  const priorities = ['High', 'Medium', 'Low','Normal'];

  const [selectedStatus, setSelectedStatus] = useState("New");
  const [showDropdownStatus, setShowDropdownStatus] = useState(false);
  const statuses = ["New", "In Progress", "Completed", "No Response"];
  const [isFullScreen, setIsFullScreen] = useState(false)

  const [errors, setErrors] = useState({});
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [error, setError] = useState(null); // Add error state

  // Add state and handlers for Related To dropdowns
  const [selectedCategoryRelatedTo, setSelectedCategoryRelatedTo] =
    useState("");
  const [showDropdownCategoryRelatedTo, setShowDropdownCategoryRelatedTo] =
    useState(false);

  const [selectedOptionRelatedTo, setSelectedOptionRelatedTo] = useState("");
  const [showDropdownOptionRelatedTo, setShowDropdownOptionRelatedTo] =
    useState(false);
  // const optionsRelatedTo = {
  //   Candidate: ["60d21b4667d0d8992e610c85", "60d21b4967d0d8992e610c86"], // Example ObjectIds
  //   Position: ["60d21b4b67d0d8992e610c87", "60d21b4d67d0d8992e610c88"], // Example ObjectIds
  // };
  const toggleDropdownPriority = () => {
    setShowDropdownPriority(!showDropdownPriority);
  };

  const handlePriorityChange = (e) => {
    const priority = e.target.value;
    setSelectedPriority(priority);
    setFormData({ ...formData, priority });
    setErrors((prevErrors) => ({
      ...prevErrors,
      priority: "",
    }));
  };

  const toggleDropdownStatus = () => {
    setShowDropdownStatus(!showDropdownStatus);
  };

  const handleStatusChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setFormData({ ...formData, status });
    setErrors((prevErrors) => ({
      ...prevErrors,
      status: "",
    }));
  };

  const toggleDropdownCategoryRelatedTo = () => {
    setShowDropdownCategoryRelatedTo(!showDropdownCategoryRelatedTo);
  };


  const [teams] = useState([]);
  // const [assessments, setAssessments] = useState([]);
  // const [questionBanks, setQuestionBanks] = useState([]);
  const [interviews] = useState([]);
  const [mockInterviews] = useState([]);
  // const [analytics, setAnalytics] = useState([]);

  // useEffect(() => {
  //   if (selectedCategoryRelatedTo === "Candidates") {
  //     setLoading(true);
  //     fetchFilterData("candidate", sharingPermissions.candidate)
  //       .then((data) => setCandidates(data))
  //       .catch((error) => console.error("Error fetching candidates:", error))
  //       .finally(() => setLoading(false));
  //   }
  // }, [selectedCategoryRelatedTo, sharingPermissions.candidate]);

  // useEffect(() => {
  //   if (selectedCategoryRelatedTo === "Positions") {
  //     setLoading(true);
  //     fetchFilterData("position", sharingPermissions.position)
  //       .then((data) => setPositions(data))
  //       .catch((error) => console.error("Error fetching positions:", error))
  //       .finally(() => setLoading(false));
  //   }
  // }, [selectedCategoryRelatedTo, sharingPermissions.position]);

  // useEffect(() => {
  //   if (selectedCategoryRelatedTo === "Teams") {
  //     setLoading(true);
  //     fetchFilterData("team", sharingPermissions.team)
  //       .then((data) => setTeams(data))
  //       .catch((error) => console.error("Error fetching teams:", error))
  //       .finally(() => setLoading(false));
  //   }
  // }, [selectedCategoryRelatedTo, sharingPermissions.team]);

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
      case "Candidate":
        return candidateData.map((candidate) => ({
          name: candidate.LastName || candidate.name || "Unnamed Candidate",
          id: candidate._id,
        }));
      case "Position":
        return positions.map((position) => ({
          name: position.title || position.name || "Unnamed Position",
          id: position._id,
        }));
      case "Team":
        return teams.map((team) => ({ 
          name: team.name || team.LastName || "Unnamed Team", 
          id: team._id 
        }));
      case "Interview":
        return interviews.map((interview) => ({
          name: interview.title || interview.name || "Unnamed Interview",
          id: interview._id,
        }));
      case "MockInterview":
        return mockInterviews.map((mock) => ({
          name: mock.title || mock.name || "Unnamed Mock Interview",
          id: mock._id,
        }));
      default:
        return [];
    }
  };

  // const toggleDropdownOptionRelatedTo = () => {
  //   setShowDropdownOptionRelatedTo(!showDropdownOptionRelatedTo);
  // };
  // const [selectedOptionId, setSelectedOptionId] = useState("");
  const handleOptionSelectRelatedTo = (optionName, optionId) => {
    setSelectedOptionRelatedTo(optionName);
    setShowDropdownOptionRelatedTo(false);
    setFormData({
      ...formData,
      relatedTo: {
        ...formData.relatedTo,
        objectName: optionName,
        recordId: optionId
      }
    });
    setErrors((prevErrors) => ({
      ...prevErrors,
      relatedToOption: "", // Clear the error for the option
    }));
  };

  // const handleClose = () => {
  //   const isFormEmpty =
  //     !formData.title &&
  //     !formData.assignedTo &&
  //     !selectedPriority &&
  //     !selectedStatus &&
  //     !formData.relatedTo &&
  //     !formData.dueDate &&
  //     !formData.comments;

  //   if (!isFormEmpty) {
  //     setShowConfirmationPopup(true);
  //   } else {
  //     onClose();
  //   }
  // };


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
      if (taskId) {
        await axios.patch(`${config.REACT_APP_API_URL}/tasks/${taskId}`, {
          ...formData,
          priority: selectedPriority,
          status: selectedStatus
        });
      } else {
        await axios.post(`${config.REACT_APP_API_URL}/tasks`, {
          ...formData,
          priority: selectedPriority,
          status: selectedStatus
        });
      }
      
      onTaskAdded();
      handleClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setError(error.message); // Set error state
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

  useEffect(() => {
    if (taskId) {
      // Fetch task data
      const fetchTaskData = async () => {
        try {
          const response = await axios.get(`${config.REACT_APP_API_URL}/tasks/${taskId}`);
          const taskData = response.data;
          
          setFormData(taskData);
          setSelectedPriority(taskData.priority);
          setSelectedStatus(taskData.status);
          setSelectedCategoryRelatedTo(taskData.relatedTo.objectName);
          
          console.log(taskData);
        } catch (error) {
          console.error("Error fetching task data:", error);
        }
      };
      
      fetchTaskData();
    } else if (initialData) {
      // Use initialData if provided
      setFormData(initialData);
      setSelectedPriority(initialData.priority);
      setSelectedStatus(initialData.status);
    }
  }, [taskId, initialData]);

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

  const handleClose = () => {
      navigate('/task');
    };
  
    const modalClass = classNames(
      'fixed bg-white shadow-2xl border-l border-gray-200',
      {
        'inset-0': isFullScreen,
        'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
      }
    );

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('flex flex-col h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="p-4 sm:p-6 flex justify-between items-center mb-6 bg-white z-50 pb-4">
          <h2 className="text-lg sm:text-2xl font-bold">{taskId ? 'Update Task' : 'Create Task'}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>

            {/* Assigned To */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <div className="relative">
                <select
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Assign to</option>
                  {candidateData?.map(candidate => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.name}
                    </option>
                  )) || null}
                </select>
                {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
              </div>
            </div>

            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <div className="relative">
                <select
                  value={selectedPriority}
                  onChange={handlePriorityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Priority</option>
                  {Array.isArray(priorities) && priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>

            {/* Related To */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Related To</label>
              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    value={selectedCategoryRelatedTo}
                    onClick={toggleDropdownCategoryRelatedTo}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <MdArrowDropDown
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownCategoryRelatedTo}
                  />
                  {showDropdownCategoryRelatedTo && (
                    <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
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
                  {errors.relatedToCategory && <p className="text-red-500 text-xs mt-1">{errors.relatedToCategory}</p>}
                </div>
                <div className="relative w-1/2">
                  <input
                    type="text"
                    value={selectedOptionRelatedTo}
                    onClick={() =>
                      setShowDropdownOptionRelatedTo(
                        !showDropdownOptionRelatedTo
                      )
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="absolute top-full -mt-4 w-full rounded-md bg-white shadow-lg z-50">
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
                  {errors.relatedToOption && <p className="text-red-500 text-xs mt-1">{errors.relatedToOption}</p>}
                </div>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="datetime-local"
                value={formData.dueDate ? new Date(formData.dueDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange("dueDate", e.target.value)}
                min={today}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>

            {/* Comments */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Comments</label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({...formData, comments: e.target.value})}
                placeholder="Add comments"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="2"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm font-medium text-white bg-custom-blue border border-transparent rounded-md hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {taskId ? 'Update Task' : 'Create Task'}
            </button>
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>} 
        </div>
      </div>
      
    </Modal>
  );
}

TaskForm.defaultProps = {
  taskId: null,
  initialData: null
};

export default TaskForm;
