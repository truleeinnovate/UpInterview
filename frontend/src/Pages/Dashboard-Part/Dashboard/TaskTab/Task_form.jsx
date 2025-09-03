//<---v1.0.0------venkatesh------add scroll into view for error msg
//<---v1.0.1------venkatesh------update scroll into view for error msg
//<---v1.0.2------venkatesh------default and enforce time to after 2 hours from now

import React, { useState, useEffect, useRef, useCallback } from 'react'; //<---v1.0.2-----
import Modal from 'react-modal';
import classNames from 'classnames';
 
import { Minimize, Expand, X, ChevronUp, ChevronDown, Info } from 'lucide-react';
import axios from "axios";
import { MdArrowDropDown } from "react-icons/md";
import { config } from "../../../../config.js";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { validateTaskForm } from "../../../../utils/AppTaskValidation";
import {useCandidates} from "../../../../apiHooks/useCandidates.js";
import {usePositions} from "../../../../apiHooks/usePositions.js";
import {useAssessments} from "../../../../apiHooks/useAssessments.js";
import {useInterviews} from "../../../../apiHooks/useInterviews.js";
import {useMockInterviews} from "../../../../apiHooks/useMockInterviews.js";
import { useCustomContext } from '../../../../Context/Contextfetch.js';
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import LoadingButton from "../../../../Components/LoadingButton.jsx";
import { useCreateTask, useUpdateTask, useTaskById } from "../../../../apiHooks/useTasks.js";


import "react-datepicker/dist/react-datepicker.css";
// eslint-disable-next-line import/first
import { scrollToFirstError } from '../../../../utils/ScrollToFirstError/scrollToFirstError.js';
import InfoGuide from '../../Tabs/CommonCode-AllTabs/InfoCards.jsx';
import { notify } from '../../../../services/toastService.js';



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
  const tenantId = tokenPayload?.tenantId
  const organization = tokenPayload?.organization;
  const { candidateData } = useCandidates();
  const {positionData} = usePositions();
  const { assessmentData} = useAssessments();
  const {interviewData} = useInterviews();
  const {mockInterviewData} = useMockInterviews();
  //console.log("mockInterviewData:",mockInterviewData)


  const {usersRes} = useCustomContext();

  // Mutations must be inside the component
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;

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
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedPriority, setSelectedPriority] = useState("");
  const priorities = ['High', 'Medium', 'Low','Normal'];

  const [selectedStatus, setSelectedStatus] = useState("New");
  const statuses = ["New", "In Progress", "Completed", "No Response"];
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("");

  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null); // Add error state

   //<---v1.0.2--------
  // --- Date helpers: local datetime string and min (now + 2 hours)
  const formatForDatetimeLocal = useCallback((date) => {
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const hh = pad(date.getHours());
    const mm = pad(date.getMinutes());
    return `${y}-${m}-${d}T${hh}:${mm}`;
  }, []);
  const twoHoursFromNowLocal = useCallback(() => {
    const d = new Date();
    d.setHours(d.getHours() + 2);
    d.setSeconds(0, 0);
    return formatForDatetimeLocal(d);
  }, [formatForDatetimeLocal]);

  // Initialize scheduledDate: use existing dueDate if editing, else default to now + 2 hours.
  useEffect(() => {
    const minVal = twoHoursFromNowLocal();
    if (taskId && formData?.dueDate) {
      const d = new Date(formData.dueDate);
      if (!isNaN(d.getTime())) {
        const formatted = formatForDatetimeLocal(d);
        setScheduledDate((prev) => (!prev || prev !== formatted ? (formatted < minVal ? minVal : formatted) : prev));
        return;
      }
    }
    // New task or no valid dueDate
    setScheduledDate((prev) => (!prev || prev < minVal ? minVal : prev));
  }, [taskId, formData.dueDate, twoHoursFromNowLocal, formatForDatetimeLocal]);
   //----v1.0.2----->

  // State for storing selections
  const [selectedCategoryRelatedTo, setSelectedCategoryRelatedTo] = useState("");
  const [selectedOptionRelatedTo, setSelectedOptionRelatedTo] = useState("");
  const [selectedOptionIdRelatedTo, setSelectedOptionIdRelatedTo] = useState("");
  const [selectedOptionName, setSelectedOptionName] = useState("");

  const [showDropdownCategoryRelatedTo, setShowDropdownCategoryRelatedTo] = useState(false);
  const [showDropdownOptionRelatedTo, setShowDropdownOptionRelatedTo] = useState(false);
  const [showDropdownAssignedTo, setShowDropdownAssignedTo] = useState(false);
  const [showDropdownPriority, setShowDropdownPriority] = useState(false);
  const [isModalOpen] = useState(false);

  const formRef = useRef(null);

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
    setShowDropdownOptionRelatedTo(false);
    setShowDropdownAssignedTo(false);
    setShowDropdownPriority(false);
  };

  const toggleDropdownOptionRelatedTo = () => {
    setShowDropdownOptionRelatedTo(!showDropdownOptionRelatedTo);
    setShowDropdownCategoryRelatedTo(false);
    setShowDropdownAssignedTo(false);
    setShowDropdownPriority(false);
  };

  const toggleDropdownAssignedTo = () => {
    setShowDropdownAssignedTo(!showDropdownAssignedTo);
    setShowDropdownCategoryRelatedTo(false);
    setShowDropdownOptionRelatedTo(false);
    setShowDropdownPriority(false);
  };

  const toggleDropdownPriority = () => {
    setShowDropdownPriority(!showDropdownPriority);
    setShowDropdownAssignedTo(false);
    setShowDropdownCategoryRelatedTo(false);
    setShowDropdownOptionRelatedTo(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowDropdownCategoryRelatedTo(false);
        setShowDropdownOptionRelatedTo(false);
        setShowDropdownAssignedTo(false);
        setShowDropdownPriority(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        return interviewData.map((interview) => ({
          name: interview.candidateId?.FirstName || interview.name || "Unnamed Interview",
          id: interview._id,
        }));
      case "MockInterviews":
        return (mockInterviewData) ? mockInterviewData.map((mock) => ({
          name: mock?.rounds?.roundTitle|| mock.name || "Unnamed Mock Interview",
          id: mock._id,
        })) : [];
      case "Assessments":
        return assessmentData.map((assessment) => ({
          name: assessment.AssessmentTitle || "Unnamed Assessment",
          id: assessment._id,
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

  //<---v1.0.1------
  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    priority: useRef(null),
    status: useRef(null),
    assignedTo: useRef(null),
    relatedTo: useRef(null),
    relatedToOption: useRef(null),
    dueDate: useRef(null),
  }
  //---v1.0.1------>
      
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // First validate ownerId and tenantId
    if (!ownerId) {
      setError("Missing required user information. Please log in again.");
      return;
    }

    const newErrors = validateTaskForm(
      formData,
      selectedPriority,
      selectedStatus,
      scheduledDate
    );

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      scrollToFirstError(newErrors, fieldRefs)//<---v1.0.1------>
      console.log("Form validation failed:", newErrors);
      return;
    }
    
    try {
      const taskData = {
        ...formData,
        ownerId,
        tenantId,
        dueDate: scheduledDate,
        priority: selectedPriority,
        status: selectedStatus,
        assignedTo: formData.assignedTo,
        assignedToId: formData.assignedToId
      };

      let res 

      console.log("Submitting task with data:", taskData); // Debug log
      if (taskId) {
        res = await updateTaskMutation.mutateAsync({ id: taskId, data: taskData });
      } else {
        res = await createTaskMutation.mutateAsync(taskData);
      }
      console.log("Task saved successfully:", res);

      if (res.status === "Created successfully" || res.status === "Updated successfully") {
      
      if (res?.status === "Created successfully"){
        notify.success("Task created successfully");
      }else if(res?.status === "Updated successfully"){
        notify.success("Task updated successfully");
      }else{
        notify.error("Failed to save task");
      }
      
      onTaskAdded();
      onClose();
    }
      
    } catch (error) {
      console.error("Error saving task:", error);
    
      // Show error toast
    notify.error(error.response?.data?.message || error.message || "Failed to save task");
    
      setError(error.response?.data?.message || error.message || "Failed to save task");
    }
  };

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

  const { data: fetchedTask } = useTaskById(taskId);

  useEffect(() => {
    if (taskId && fetchedTask) {
      setFormData(fetchedTask);
      setSelectedPriority(fetchedTask.priority);
      setSelectedStatus(fetchedTask.status);
      setSelectedCategoryRelatedTo(fetchedTask?.relatedTo?.objectName || "");
      setSelectedOptionName(fetchedTask?.relatedTo?.recordName || "");
    } else if (!taskId && initialData) {
      setFormData(initialData);
      setSelectedPriority(initialData.priority);
      setSelectedStatus(initialData.status);
    }
  }, [taskId, fetchedTask, initialData]);

  
  
    const modalClass = classNames(
        'fixed bg-white shadow-2xl border-l border-gray-200',
        {
          'overflow-y-auto': !isModalOpen,
          'overflow-hidden': isModalOpen,
          'inset-0': isFullScreen,
          'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
        }
      );



  return (
    <Modal
            isOpen={true}
            onRequestClose={onClose}
            className={modalClass}
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
          >
          <div className={classNames('h-full' , { 'max-w-6xl mx-auto px-6': isFullScreen }, { 'opacity-50': isSaving })}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-3">
    
                  <h2 className="text-2xl font-semibold text-custom-blue">
                    {taskId ? "Update Task" : "Add New Task"}
    
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsFullScreen(!isFullScreen)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                    >
                      {isFullScreen ? (
                        <Minimize className="w-5 h-5 text-gray-500" />
                      ) : (
                        <Expand className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* added to Task Form Guideliness by Ranjith */}
             

<InfoGuide
  title="Task Creation Guidelines"
  items={[
    <><span className="font-medium">Clear Task Titles:</span> Use descriptive titles that summarize the task objective</>,
    <><span className="font-medium">Priority Setting:</span> Assign appropriate priority levels (High, Medium, Low, Normal) based on urgency</>,
    <><span className="font-medium">Status Tracking:</span> Update task status as it progresses (New → In Progress → Completed)</>,
    <><span className="font-medium">Responsible Assignment:</span> Clearly assign tasks to specific team members or yourself</>,
    <><span className="font-medium">Context Linking:</span> Connect tasks to relevant candidates, positions, interviews, or assessments</>,
    <><span className="font-medium">Realistic Due Dates:</span> Set deadlines with at least 2 hours buffer from current time</>,
    <><span className="font-medium">Detailed Comments:</span> Provide clear instructions, context, and expected outcomes</>,
    <><span className="font-medium">Automated Validation:</span> Form validation ensures all required fields are completed</>,
    <><span className="font-medium">Error Highlighting:</span> Invalid fields are automatically highlighted and scrolled into view</>,
    <><span className="font-medium">Flexible Editing:</span> Tasks can be updated anytime as priorities or circumstances change</>
  ]}
/>
         
  {/* <div className="py-4 bg-white z-10 mb-2">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <Info className="h-5 w-5 text-custom-blue flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-custom-blue">Task Creation Guidelines</h3>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-custom-blue" />
            ) : (
              <ChevronDown className="h-5 w-5 text-custom-blue" />
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 ml-8 space-y-2">
          <div className="text-sm text-custom-blue space-y-1">
            <ul className="list-disc list-inside pl-2 space-y-1">
              <li><span className="font-medium">Clear Task Titles:</span> Use descriptive titles that summarize the task objective</li>
              <li><span className="font-medium">Priority Setting:</span> Assign appropriate priority levels (High, Medium, Low, Normal) based on urgency</li>
              <li><span className="font-medium">Status Tracking:</span> Update task status as it progresses (New → In Progress → Completed)</li>
              <li><span className="font-medium">Responsible Assignment:</span> Clearly assign tasks to specific team members or yourself</li>
              <li><span className="font-medium">Context Linking:</span> Connect tasks to relevant candidates, positions, interviews, or assessments</li>
              <li><span className="font-medium">Realistic Due Dates:</span> Set deadlines with at least 2 hours buffer from current time</li>
              <li><span className="font-medium">Detailed Comments:</span> Provide clear instructions, context, and expected outcomes</li>
              <li><span className="font-medium">Automated Validation:</span> Form validation ensures all required fields are completed</li>
              <li><span className="font-medium">Error Highlighting:</span> Invalid fields are automatically highlighted and scrolled into view</li>
              <li><span className="font-medium">Flexible Editing:</span> Tasks can be updated anytime as priorities or circumstances change</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  </div> */}

    
                <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 mb-6">
          
          <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-6">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                ref={fieldRefs.title}//<---v1.0.1------
                value={formData.title}
                placeholder="Enter Title"
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.title && 'border-red-500'}`}
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            {/* individual assigned to*/}
            {organization ? (
              <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assigned To <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={formData.assignedToId || ''}
                  ref={fieldRefs.assignedTo}//<---v1.0.1------
                  onChange={(e) => {
                    const selectedUserId = e.target.value;
                    const selectedUser = usersRes.find(user => user._id === selectedUserId);
                    setFormData(prev => ({
                      ...prev,
                      assignedTo: selectedUser ? `${selectedUser.firstName || ''} ${selectedUser.lastName || ''}`.trim() : '',
                      assignedToId: selectedUserId
                    }));

                    setErrors((prevErrors) => ({
                      ...prevErrors,
                      assignedTo: "",
                    }));
                  }}
                  className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.assignedTo && 'border-red-500'}`}
                >
                  <option value="" hidden>Select User</option>
                  {usersRes.map((user) => (
                    <option 
                      className='font-medium text-gray-500 text-sm' 
                      key={user._id} 
                      value={user._id}
                    >
                      {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                    </option>
                  ))}
                </select>
                <MdArrowDropDown
                    size={20}
                    className="absolute right-0 top-7 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownAssignedTo}
                  />
                {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
              </div>
            </div>
            ) : (
              <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Assigned To <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.assignedTo}
                ref={fieldRefs.assignedTo}//<---v1.0.1------
                onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.assignedTo && 'border-red-500'}`}
              />
              {errors.assignedTo && <p className="text-red-500 text-xs mt-1">{errors.assignedTo}</p>}
            </div>
            )}
            
          </div>  

            
            
            <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-6">
            {/* Priority */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Priority <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedPriority}
                  ref={fieldRefs.priority}//<---v1.0.1------
                  onChange={handlePriorityChange}
                  className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.priority && 'border-red-500'}`}
                >
                  <option value="" hidden>Select Priority</option>
                  {Array.isArray(priorities) && priorities.map((priority) => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
                <MdArrowDropDown
                    size={20}
                    className="absolute right-0 top-7 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownPriority}
                  />
                {errors.priority && <p className="text-red-500 text-xs mt-1">{errors.priority}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  ref={fieldRefs.status}//<---v1.0.1------
                  onChange={handleStatusChange}
                  className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.status && 'border-red-500'}`}
                >
                  <option value="" hidden>Select Status</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
              </div>
            </div>
            </div>
            {/* Related To */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Related To <span className="text-red-500">*</span></label>
              <div className="flex gap-4">
                <div className="relative w-1/2">
                  <input
                    type="text"
                    ref={fieldRefs.relatedToCategory}//<---v1.0.1------
                    value={selectedCategoryRelatedTo}
                    onClick={toggleDropdownCategoryRelatedTo}
                    placeholder="Select Category"
                    readOnly
                    className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.relatedTo && 'border-red-500'}`}
                  />
                  <MdArrowDropDown
                    size={20}
                    className="absolute right-0 top-7 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={toggleDropdownCategoryRelatedTo}
                  />
                  {showDropdownCategoryRelatedTo && (
                    <div className="absolute top-16 -mt-4 w-full h-64 overflow-y-auto rounded-md bg-white shadow-lg z-50">
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
                    ref={fieldRefs.relatedToOption}//<---v1.0.1------
                    onClick={() =>
                      toggleDropdownOptionRelatedTo()
                    }
                    readOnly
                    placeholder="Select option"
                    className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.relatedToOption && 'border-red-500'}`}
                  />
                  <MdArrowDropDown
                    size={20}
                    className="absolute right-0 top-7 transform -translate-y-1/2 cursor-pointer -mt-2"
                    onClick={() =>
                      toggleDropdownOptionRelatedTo()
                    }
                  />
                  {showDropdownOptionRelatedTo && (
                    <div className="absolute top-16 -mt-4 w-full h-64 overflow-y-auto rounded-md bg-white shadow-lg z-50">
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
            <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
             Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              id="scheduledDate"
              name="scheduledDate"
              //lang="en-US"
               //<---v1.0.2-----
              ref={fieldRefs.dueDate}//<---v1.0.1------
              value={scheduledDate}
              onChange={(e) => {
                const val = e.target.value;
                const minVal = twoHoursFromNowLocal();
                setScheduledDate(val && val < minVal ? minVal : val);
                setErrors((prevErrors) => ({
                  ...prevErrors,
                  dueDate: "",
                }));
              }}
              min={twoHoursFromNowLocal()}
              //----v1.0.2----->
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className={`w-full px-3 py-2 h-40 border border-gray-300 rounded-md focus:ring-2 focus:border-transparent sm:text-sm ${errors.comments && 'border-red-500'}`}
                rows="5"
              />
            </div>

          

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <LoadingButton
              onClick={handleSubmit}
              isLoading={isSaving}
              loadingText={taskId ? 'Updating...' : 'Creating...'}
              >
                {taskId ? 'Update Task' : 'Create Task'}
            </LoadingButton>
            
          </div>
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>} 
          </div>
        </form>
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
