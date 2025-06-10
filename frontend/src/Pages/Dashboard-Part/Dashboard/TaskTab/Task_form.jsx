import React, { useState, useEffect} from 'react';
import Modal from 'react-modal';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';
import axios from "axios";
import { MdArrowDropDown } from "react-icons/md";
import { config } from "../../../../config.js";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { validateTaskForm } from "../../../../utils/AppTaskValidation";
import {useCandidates} from "../../../../apiHooks/useCandidates.js";
import {usePositions} from "../../../../apiHooks/usePositions.js";
import { useCustomContext } from '../../../../Context/Contextfetch.js';
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";


import "react-datepicker/dist/react-datepicker.css";

const TaskForm = ({
  onClose,
  onTaskAdded,
  onDataAdded,
  taskId, // Add taskId prop for editing
  initialData // Add initial data for pre-filling form
}) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId
  const organization = tokenPayload?.organization;
  const { candidateData } = useCandidates();
  const {positionData} = usePositions();
  const {usersRes} = useCustomContext();

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!organization) {
        try {
          const response = await axios.get(`${config.REACT_APP_API_URL}/users/owner/${ownerId}`);
          const ownerData = response.data;
          
          // Prefill form with owner's name
          setFormData(prev => ({
            ...prev,
            assignedTo: `${ownerData.firstName} ${ownerData.lastName}`,
            assignedToId: ownerData._id
          }));
        } catch (error) {
          console.error('Error fetching owner data:', error);
        }
      }
    };
    
    fetchOwnerData();
  }, [organization, ownerId]);

   
  const [formData, setFormData] = useState({
    title: "",
    assignedTo: "",
    assignedToId: "",
    priority: "",
    status: "New",
    relatedTo: {
      objectName: "",
      recordId: "",
      recordName: ""
    },
    dueDate: "",
    comments: "",
  });
  const navigate = useNavigate();
  const [selectedPriority, setSelectedPriority] = useState("");
  const priorities = ['High', 'Medium', 'Low','Normal'];

  const [selectedStatus, setSelectedStatus] = useState("New");
  const statuses = ["New", "In Progress", "Completed", "No Response"];
  const [isFullScreen, setIsFullScreen] = useState(false)

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null); // Add error state

  // State for storing selections
  const [selectedCategoryRelatedTo, setSelectedCategoryRelatedTo] = useState("");
  const [selectedOptionRelatedTo, setSelectedOptionRelatedTo] = useState("");
  const [selectedOptionIdRelatedTo, setSelectedOptionIdRelatedTo] = useState("");
  const [selectedOptionName, setSelectedOptionName] = useState("");

  const [showDropdownCategoryRelatedTo, setShowDropdownCategoryRelatedTo] = useState(false);
  const [showDropdownOptionRelatedTo, setShowDropdownOptionRelatedTo] = useState(false);

  const handlePriorityChange = (e) => {
    const priority = e.target.value;
    setSelectedPriority(priority);
    setFormData({ ...formData, priority });
    setErrors((prevErrors) => ({
      ...prevErrors,
      priority: "",
    }));
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

  const [interviews] = useState([]);
  const [mockInterviews] = useState([]);
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

  const handleOptionSelectRelatedTo = (name, id) => {
    setSelectedOptionName(name);
    setSelectedOptionIdRelatedTo(id);
    setShowDropdownOptionRelatedTo(false);
    setFormData(prev => ({
      ...prev,
      relatedTo: {
        ...prev.relatedTo,
        recordId: id,
        recordName: name // Store name for backend
      }
    }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      relatedToOption: "", // Clear the error for the option
    }));
  };

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
        return candidateData.map((candidate) => ({
          name: `${candidate.FirstName} ${candidate.LastName}` || "Unnamed Candidate",
          id: candidate._id,
        }));
      case "Positions":
        return positionData.map((position) => ({
          name: position.title || position.name || "Unnamed Position",
          id: position._id,
        }));
      // case "Team":
      //   return teams.map((team) => ({ 
      //     name: team.name || team.LastName || "Unnamed Team", 
      //     id: team._id 
      //   }));
      case "Interviews":
        return interviews.map((interview) => ({
          name: interview.title || interview.name || "Unnamed Interview",
          id: interview._id,
        }));
      case "MockInterviews":
        return mockInterviews.map((mock) => ({
          name: mock.title || mock.name || "Unnamed Mock Interview",
          id: mock._id,
        }));
      default:
        return [];
    }
  };

  const getNameFromId = (id) => {
    const option = getOptionsForSelectedCategory().find(opt => opt.id === id);
    return option ? option.name : id;
  };

  const displayName = selectedOptionIdRelatedTo 
    ? getNameFromId(selectedOptionIdRelatedTo) 
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateTaskForm(
      formData,
      selectedPriority,
      selectedStatus,
      selectedOptionRelatedTo
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      console.log("Form validation failed:", newErrors);
      return;
    }
    
    try {
      const taskData = {
        ...formData,
        priority: selectedPriority,
        status: selectedStatus,
        assignedToId: formData.assignedToId // Always send assignedToId
      };

      if (taskId) {
        await axios.patch(`${config.REACT_APP_API_URL}/tasks/${taskId}`, taskData);
      } else {
        await axios.post(`${config.REACT_APP_API_URL}/tasks`, taskData);
      }
      
      onTaskAdded();
      handleClose();
    } catch (error) {
      console.error("Error saving task:", error);
      setError(error.message);
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
          setSelectedOptionName(taskData.relatedTo.recordName);
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
            {/* individual assigned to*/}
            {organization ? (
              <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <div className="relative">
                <select
                  value={formData.assignedTo ? formData.assignedTo : ''}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  
                  <option value="" hidden>Select User</option>
                  {usersRes.map((user) => (
                    <option className='font-medium text-gray-500 text-sm' key={user._id} value={user._id} onClick={() => handleInputChange('assignedToId', user._id)}>
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    </option>
                  ))}
                </select>
                {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
              </div>
            </div>
            ) : (
              <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assigned To</label>
              <input
                type="text"
                value={formData.assignedTo}
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
            </div>
            )}
            

            
            

            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <div className="relative">
                <select
                  value={selectedPriority}
                  onChange={handlePriorityChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" hidden>Select Priority</option>
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
                  <option value="" hidden>Select Status</option>
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
                    <div className="absolute top-16 -mt-4 w-full rounded-md bg-white shadow-lg z-50">
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
                    value={taskId ? formData.relatedTo.recordName : displayName}
                    onClick={() =>
                      setShowDropdownOptionRelatedTo(
                        !showDropdownOptionRelatedTo
                        
                      )
                    }
                    readOnly
                    placeholder="Select option"
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
                    <div className="absolute top-16 -mt-4 w-full rounded-md bg-white shadow-lg z-50">
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
