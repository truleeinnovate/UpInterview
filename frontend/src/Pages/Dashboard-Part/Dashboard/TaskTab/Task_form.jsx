//<---v1.0.0------venkatesh------add scroll into view for error msg
//<---v1.0.1------venkatesh------update scroll into view for error msg
//<---v1.0.2------venkatesh------default and enforce time to after 2 hours from now
// v1.0.3 - Ashok - Improved responsiveness and used common code for popup
// v1.0.4 - Ranjith -  added due date changes
// v1.0.5 - Ashok -  Fixed style issue
// v1.0.6 - Ashok -  Changed api from Context to apiHooks

import React, { useState, useEffect, useRef, useCallback } from "react"; //<---v1.0.2-----
import axios from "axios";
import { config } from "../../../../config.js";
import { fetchMasterData } from "../../../../utils/fetchMasterData.js";
import { validateTaskForm } from "../../../../utils/AppTaskValidation";
import { useCandidates } from "../../../../apiHooks/useCandidates.js";
import { usePositions } from "../../../../apiHooks/usePositions.js";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { useInterviews } from "../../../../apiHooks/useInterviews.js";
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews.js";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
import { useUsers } from "../../../../apiHooks/useUsers.js";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import LoadingButton from "../../../../Components/LoadingButton.jsx";
import {
  useCreateTask,
  useUpdateTask,
  useTaskById,
} from "../../../../apiHooks/useTasks.js";

import "react-datepicker/dist/react-datepicker.css";
// eslint-disable-next-line import/first
import { scrollToFirstError } from "../../../../utils/ScrollToFirstError/scrollToFirstError.js";
import InfoGuide from "../../Tabs/CommonCode-AllTabs/InfoCards.jsx";
import { notify } from "../../../../services/toastService.js";
// v1.0.3 <-----------------------------------------------------------------------
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
// v1.0.3 ----------------------------------------------------------------------->
import InputField from "../../../../Components/FormFields/InputField.jsx";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField.jsx";
import DescriptionField from "../../../../Components/FormFields/DescriptionField.jsx";

const TaskForm = ({
  onClose,
  onTaskAdded,
  onDataAdded,
  taskId = null, // Add taskId prop for editing
  initialData = null, // Add initial data for pre-filling form
} = {}) => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;
  console.log("organization",organization);
  const { candidateData } = useCandidates();
  const { positionData } = usePositions();
  const { assessmentData } = useAssessments();
  const { interviewData } = useInterviews();
  const { mockInterviewData } = useMockInterviews();
  //console.log("mockInterviewData:",mockInterviewData)

  // const { usersRes } = useCustomContext();
  // ---------------------------- from apiHooks ---------------------------------------
  const { usersRes } = useUsers();
  // console.log("usersRes",usersRes);
  // ---------------------------- from apiHooks ---------------------------------------


  // Mutations must be inside the component
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const isSaving = createTaskMutation.isPending || updateTaskMutation.isPending;

  useEffect(() => {
    const fetchOwnerData = async () => {
      if (!organization) {
        try {
          const response = await axios.get(
            `${config.REACT_APP_API_URL}/users/owner/${ownerId}`
          );
          const ownerData = response.data;

          // Prefill form with owner's name
          setFormData((prev) => ({
            ...prev,
            assignedTo: `${ownerData.firstName} ${ownerData.lastName}`,
            assignedToId: ownerData._id,
          }));
        } catch (error) {
          console.error("Error fetching owner data:", error);
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
      recordName: "",
    },
    dueDate: "",
    comments: "",
  });

  const [selectedPriority, setSelectedPriority] = useState("");
  const priorities = ["High", "Medium", "Low", "Normal"];

  const [selectedStatus, setSelectedStatus] = useState("New");
  const statuses = ["New", "In Progress", "Completed", "No Response"];
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

  const formatForISOString = useCallback((dateString) => {
    // Convert datetime-local string to ISO string with timezone
    const date = new Date(dateString);
    return date.toISOString();
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
        setScheduledDate((prev) =>
          !prev || prev !== formatted
            ? formatted < minVal
              ? minVal
              : formatted
            : prev
        );
        return;
      }
    }
    // New task or no valid dueDate
    setScheduledDate((prev) => (!prev || prev < minVal ? minVal : prev));
  }, [taskId, formData.dueDate, twoHoursFromNowLocal, formatForDatetimeLocal]);
  //----v1.0.2----->

  // State for storing selections
  const [selectedCategoryRelatedTo, setSelectedCategoryRelatedTo] =
    useState("");
  const [selectedOptionIdRelatedTo, setSelectedOptionIdRelatedTo] =
    useState("");

  const formRef = useRef(null);

  // Removed old select change handlers; handled inline in common fields

  // Removed custom dropdown toggles in favor of common DropdownWithSearchField

  // Removed click outside handler as dropdowns are handled by react-select

  const handleCategorySelectRelatedTo = (category) => {
    setSelectedCategoryRelatedTo(category);
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
    setSelectedOptionIdRelatedTo(id);
    setFormData((prev) => ({
      ...prev,
      relatedTo: {
        ...prev.relatedTo,
        recordId: id,
        recordName: name, // Store name for backend
      },
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
          name:
            `${candidate.FirstName} ${candidate.LastName}` ||
            "Unnamed Candidate",
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
          name:
            interview.candidateId?.FirstName ||
            interview.name ||
            "Unnamed Interview",
          id: interview._id,
        }));
      case "MockInterviews":
        return mockInterviewData
          ? mockInterviewData.map((mock) => ({
              name:
                mock?.rounds?.roundTitle ||
                mock.name ||
                "Unnamed Mock Interview",
              id: mock._id,
            }))
          : [];
      case "Assessments":
        return assessmentData.map((assessment) => ({
          name: assessment.AssessmentTitle || "Unnamed Assessment",
          id: assessment._id,
        }));

      default:
        return [];
    }
  };

  // Using react-select display; no separate displayName helper needed

  //<---v1.0.1------
  const fieldRefs = {
    title: useRef(null),
    description: useRef(null),
    priority: useRef(null),
    status: useRef(null),
    assignedTo: useRef(null),
    relatedToCategory: useRef(null),
    relatedToOption: useRef(null),
    dueDate: useRef(null),
  };
  //---v1.0.1------>

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent submission while data is loading
    if (categoriesLoading) {
      notify.error("Please wait while data is loading...");
      return;
    }

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
      scrollToFirstError(newErrors, fieldRefs); //<---v1.0.1------>
      console.log("Form validation failed:", newErrors);
      return;
    }

    try {
      const taskData = {
        ...formData,
        ownerId,
        tenantId,
        // Ranjith v1.0.4
        dueDate: scheduledDate
          ? formatForISOString(scheduledDate)
          : formData.dueDate,
        // Ranjith v1.0.4
        priority: selectedPriority,
        status: selectedStatus,
        assignedTo: formData.assignedTo,
        assignedToId: formData.assignedToId,
      };

      let res;

      console.log("Submitting task with data:", taskData); // Debug log
      if (taskId) {
        res = await updateTaskMutation.mutateAsync({
          id: taskId,
          data: taskData,
        });
      } else {
        res = await createTaskMutation.mutateAsync(taskData);
      }
      console.log("Task saved successfully:", res);

      if (
        res.status === "Created successfully" ||
        res.status === "Task updated successfully" ||
        res.status === "no_changes"
      ) {
        if (res?.status === "Created successfully") {
          notify.success("Task created successfully");
        } else if (
          res?.status === "Task updated successfully" ||
          res?.status === "no_changes"
        ) {
          notify.success("Task updated successfully");
        } else {
          notify.error("Failed to save task");
        }
        setTimeout(() => {
          onTaskAdded();
          onClose();
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving task:", error);

      // Show error toast
      notify.error(
        error.response?.data?.message || error.message || "Failed to save task"
      );

      setError(
        error.response?.data?.message || error.message || "Failed to save task"
      );
    }
  };

  const [categoriesRelatedTo, setCategoriesRelatedTo] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchObjectsData = async () => {
      try {
        setCategoriesLoading(true);
        const data = await fetchMasterData("sharing-rules-objects");
        setCategoriesRelatedTo(data.map((obj) => obj.objects).flat());
        console.log(data);
      } catch (error) {
        console.error("Error fetching objects data:", error);
        // Set default categories if fetch fails
        setCategoriesRelatedTo([
          "Candidates",
          "Positions",
          "Interviews",
          "MockInterviews",
          "Assessments",
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchObjectsData();
  }, []);

  const {
    data: fetchedTask,
    isLoading: isLoadingTask,
    error: fetchError,
  } = useTaskById(taskId);

  // Log fetch errors for debugging
  useEffect(() => {
    if (fetchError) {
      console.error("Error fetching task data:", fetchError);
      notify.error(
        "Failed to load task data. Please check your connection and try again."
      );
    }
  }, [fetchError]);

  useEffect(() => {
    if (taskId && fetchedTask) {
      //console.log("Task data loaded:", fetchedTask); // Debug log
      setFormData(fetchedTask);
      setSelectedPriority(fetchedTask.priority);
      setSelectedStatus(fetchedTask.status);
      setSelectedCategoryRelatedTo(fetchedTask?.relatedTo?.objectName || "");
      setSelectedOptionIdRelatedTo(fetchedTask?.relatedTo?.recordId || "");
    } else if (!taskId && initialData) {
      setFormData(initialData);
      setSelectedPriority(initialData.priority);
      setSelectedStatus(initialData.status);
    }
  }, [taskId, fetchedTask, initialData]);



  return (
    // v1.0.3 <-------------------------------------------------------------------------
    <SidebarPopup
      title={`${taskId ? "Update Task" : "Add New Task"}`}
      onClose={onClose}
    >
      {/* v1.0.5 <---------------------------------- */}
      <div className="sm:p-0 px-6 py-2 mb-8">
        {/* Show loading state when fetching task data */}
        {taskId && isLoadingTask ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue mx-auto mb-4"></div>
              <p className="text-gray-600">Loading task data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* v1.0.5 ----------------------------------> */}
            {/* added to Task Form Guideliness by Ranjith */}
            <div className="mb-4">
              <InfoGuide
                title="Task Creation Guidelines"
                items={[
                  <>
                    <span className="font-medium">Clear Task Titles:</span> Use
                    descriptive titles that summarize the task objective
                  </>,
                  <>
                    <span className="font-medium">Priority Setting:</span>{" "}
                    Assign appropriate priority levels (High, Medium, Low,
                    Normal) based on urgency
                  </>,
                  <>
                    <span className="font-medium">Status Tracking:</span> Update
                    task status as it progresses (New → In Progress → Completed)
                  </>,
                  <>
                    <span className="font-medium">Responsible Assignment:</span>{" "}
                    Clearly assign tasks to specific team members or yourself
                  </>,
                  <>
                    <span className="font-medium">Context Linking:</span>{" "}
                    Connect tasks to relevant candidates, positions, interviews,
                    or assessments
                  </>,
                  <>
                    <span className="font-medium">Realistic Due Dates:</span>{" "}
                    Set deadlines with at least 2 hours buffer from current time
                  </>,
                  <>
                    <span className="font-medium">Detailed Comments:</span>{" "}
                    Provide clear instructions, context, and expected outcomes
                  </>,
                  <>
                    <span className="font-medium">Automated Validation:</span>{" "}
                    Form validation ensures all required fields are completed
                  </>,
                  <>
                    <span className="font-medium">Error Highlighting:</span>{" "}
                    Invalid fields are automatically highlighted and scrolled
                    into view
                  </>,
                  <>
                    <span className="font-medium">Flexible Editing:</span> Tasks
                    can be updated anytime as priorities or circumstances change
                  </>,
                ]}
              />
            </div>

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
                    <InputField
                      inputRef={fieldRefs.title}
                      label="Title"
                      required
                      name="title"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      error={errors.title}
                      placeholder="Enter Title"
                    />
                  </div>
                  {/* individual assigned to*/}
                  {organization ? (
                    <div className="space-y-1">
                      <DropdownWithSearchField
                        containerRef={fieldRefs.assignedTo}
                        label="Assigned To"
                        required
                        name="assignedToId"
                        value={formData.assignedToId || ""}
                        options={(usersRes?.users || [])?.map((user) => ({
                          value: user._id,
                          label:
                            `${user.firstName || ""} ${
                              user.lastName || ""
                            }`.trim() || user.email,
                        }))}
                        onChange={(e) => {
                          const selectedUserId = e.target.value;
                          const selectedUser = (usersRes?.users || []).find(
                            (u) => u._id === selectedUserId
                          );
                          setFormData((prev) => ({
                            ...prev,
                            assignedTo: selectedUser
                              ? `${selectedUser.firstName || ""} ${
                                  selectedUser.lastName || ""
                                }`.trim()
                              : "",
                            assignedToId: selectedUserId,
                          }));
                          setErrors((prev) => ({ ...prev, assignedTo: "" }));
                        }}
                        error={errors.assignedTo}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <InputField
                        inputRef={fieldRefs.assignedTo}
                        label="Assigned To"
                        required
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={(e) =>
                          handleInputChange("assignedTo", e.target.value)
                        }
                        error={errors.assignedTo}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-1 sm:grid-cols-1 gap-6">
                  {/* Priority */}
                  <div className="space-y-1">
                    <DropdownWithSearchField
                      containerRef={fieldRefs.priority}
                      label="Priority"
                      required
                      name="priority"
                      value={selectedPriority}
                      options={(priorities || []).map((p) => ({
                        value: p,
                        label: p,
                      }))}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedPriority(v);
                        setFormData((prev) => ({ ...prev, priority: v }));
                        setErrors((prev) => ({ ...prev, priority: "" }));
                      }}
                      error={errors.priority}
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <DropdownWithSearchField
                      containerRef={fieldRefs.status}
                      label="Status"
                      required
                      name="status"
                      value={selectedStatus}
                      options={(statuses || []).map((s) => ({
                        value: s,
                        label: s,
                      }))}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedStatus(v);
                        setFormData((prev) => ({ ...prev, status: v }));
                        setErrors((prev) => ({ ...prev, status: "" }));
                      }}
                      error={errors.status}
                    />
                  </div>
                </div>
                {/* Related To */}
                <div className="space-y-1">
                  <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
                    <div className="w-full">
                      <DropdownWithSearchField
                        containerRef={fieldRefs.relatedToCategory}
                        label="Related To"
                        required
                        name="relatedToCategory"
                        value={selectedCategoryRelatedTo}
                        options={(categoriesRelatedTo || []).map((c) => ({
                          value: c,
                          label: c,
                        }))}
                        onChange={(e) =>
                          handleCategorySelectRelatedTo(e.target.value)
                        }
                        error={errors.relatedToCategory}
                        disabled={categoriesLoading}
                      />
                    </div>
                    <div className="w-full">
                      <DropdownWithSearchField
                        containerRef={fieldRefs.relatedToOption}
                        label="Record"
                        required
                        name="relatedToOption"
                        value={selectedOptionIdRelatedTo}
                        options={getOptionsForSelectedCategory().map((opt) => ({
                          value: opt.id,
                          label: opt.name,
                        }))}
                        onChange={(e) => {
                          const id = e.target.value;
                          const opt = getOptionsForSelectedCategory().find(
                            (o) => o.id === id
                          );
                          handleOptionSelectRelatedTo(opt?.name || "", id);
                        }}
                        error={errors.relatedToOption}
                      />
                    </div>
                  </div>
                </div>

                {/* Due Date */}
                <div className="space-y-1">
                  <label
                    htmlFor="scheduledDate"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Due Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    id="scheduledDate"
                    name="scheduledDate"
                    //lang="en-US"
                    //<---v1.0.2-----
                    ref={fieldRefs.dueDate} //<---v1.0.1------
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
                  {errors.dueDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dueDate}
                    </p>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-1">
                  <DescriptionField
                    inputRef={fieldRefs.description}
                    label="Comments"
                    name="comments"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({ ...formData, comments: e.target.value })
                    }
                    error={errors.comments}
                    rows={5}
                  />
                </div>
                {/* v1.0.5 <---------------------------------------- */}
                <div className="flex justify-end space-x-3">
                  {/* v1.0.5 ----------------------------------------> */}
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleSubmit}
                    isLoading={isSaving}
                    loadingText={taskId ? "Updating..." : "Creating..."}
                  >
                    {taskId ? "Update Task" : "Create Task"}
                  </LoadingButton>
                </div>
                {/* {error && <p className="text-red-500 text-xs mt-1">{error}</p>} */}
              </div>
            </form>
          </>
        )}
      </div>
      {/* </div> */}
      {/* </Modal> */}
    </SidebarPopup>
    // v1.0.3 ------------------------------------------------------------------------->
  );
};

export default TaskForm;
