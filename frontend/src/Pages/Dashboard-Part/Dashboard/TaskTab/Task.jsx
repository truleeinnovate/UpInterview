//<---------------------- v1.0.0----Venkatesh----in task tab add filter with owner id
// v1.0.1 - Ashok - commented man.png, woman.png, transgender.png
// v1.0.2 - Venkatesh - added new filters priority, status, due date, created date and assigned to(only shown in organization)
// v1.0.3 - Ashok - Improved responsiveness and modified clickable id
// v1.0.4 - Ashok - Fixed style issue
// v1.0.5 - Ashok - Fixed table view in small screens and added delete button for kanban
// v1.0.6 - Ashok - changed check box colors to brand color
// v1.0.7 - Ashok - Added status badge
// v1.0.8 - Ashok - Added common code kanban
// v1.0.9 - Ashok - Added clickable title to navigate to details page at kanban

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  ChevronUp,
  ChevronDown,
  Trash,
  MoreVertical,
} from "lucide-react";

import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
//<-------v1.0.2---------
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode.js";
import { useCustomContext } from "../../../../Context/Contextfetch.js";
//-------v1.0.2--------->

// v1.0.1 <--------------------------------------------------
// import maleImage from '../../Images/man.png';
// import femaleImage from '../../Images/woman.png';
// import genderlessImage from '../../Images/transgender.png';
// v1.0.1 --------------------------------------------------->
import TaskForm from "./Task_form.jsx";
import TaskProfileDetails from "./TaskProfileDetails.jsx";
// v1.0.8 <----------------------------------------------------------------------------
// import TaskKanban from "./TaskKanban.jsx";
import TaskKanban from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
// v1.0.8 ---------------------------------------------------------------------------->
import { usePermissions } from "../../../../Context/PermissionsContext";
import { useDeleteTask, useTasks } from "../../../../apiHooks/useTasks";
// v1.0.3 <---------------------------------------------------------
import { useMediaQuery } from "react-responsive";
import DeleteConfirmModal from "../../Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../../../services/toastService.js";
// v1.0.3 --------------------------------------------------------->
// v1.0.7 <------------------------------------------------------------
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
// v1.0.7 ------------------------------------------------------------>

// v1.0.8 <-----------------------------------------------------------------------
const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key)
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

  //  Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsKanbanMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {/* Always visible actions */}
      {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item, e);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}

      {/* More button (shows dropdown) */}
      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen((prev) => !prev);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {isKanbanMoreOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item, e);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  title={action.label}
                >
                  {action.icon && (
                    <span className="mr-2 w-4 h-4 text-gray-500">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// v1.0.8 ----------------------------------------------------------------------->

const Task = () => {
  const { effectivePermissions } = usePermissions();
  //<-------v1.0.2---------
  const { usersRes = [] } = useCustomContext();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  //-------v1.0.2--------->
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    //<-------v1.0.2---------
    priority: [],
    dueDate: "",
    assignedToId: "",
    createdDate: "",
    //-------v1.0.2--------->
  });
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  //<-------v1.0.2---------
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDueDateOpen, setIsDueDateOpen] = useState(false);
  const [isAssignedOpen, setIsAssignedOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedDueDate, setSelectedDueDate] = useState("");
  const [selectedAssignedUserId, setSelectedAssignedUserId] = useState("");
  const [selectedCreatedDate, setSelectedCreatedDate] = useState("");
  const [isAssignedDropdownOpen, setIsAssignedDropdownOpen] = useState(false);
  const [assignedSearch, setAssignedSearch] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const { data: taskData = [], isLoading, refetch } = useTasks();
  //console.log("taskData",taskData);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const filterIconRef = useRef(null);
  const assignedDropdownRef = useRef(null);
  //-------v1.0.2--------->

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const deleteTaskMutation = useDeleteTask();

  const handleDeletePosition = async () => {
    try {
      console.log("Deleting task with ID:", deleteTask?._id);
      let res = await deleteTaskMutation.mutateAsync(deleteTask?._id);
      console.log("Delete response:", res);

      if (res && res.success) {
        setShowDeleteConfirmModal(false);
        notify.success("Task deleted successfully");
      } else {
        notify.error(res?.message || "Failed to delete task");
      }
    } catch (error) {
      console.error("Error Deleting Task:", error);
      console.error("Error response:", error.response);

      if (error.response?.data?.message) {
        notify.error(error.response.data.message);
      } else {
        notify.error("Failed to delete task");
      }
    }
  };

  // v1.0.3 <---------------------------------------------------------
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  // Set view based on screen size
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 1024) {
  //       setView("kanban");
  //     } else {
  //       setView("table");
  //     }
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    // Only run on isTablet change
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // v1.0.3 --------------------------------------------------------->

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      //<-------v1.0.2---------
      setSelectedStatus(selectedFilters.status || []);
      setSelectedPriorities(selectedFilters.priority || []);
      setSelectedDueDate(selectedFilters.dueDate || "");
      setSelectedAssignedUserId(selectedFilters.assignedToId || "");
      setSelectedCreatedDate(selectedFilters.createdDate || "");
      setAssignedSearch("");
      setIsStatusOpen(false);
      setIsPriorityOpen(false);
      setIsDueDateOpen(false);
      setIsAssignedOpen(false);
      setIsCreatedDateOpen(false);
      //-------v1.0.2--------->
    }
  }, [isFilterPopupOpen, selectedFilters]);

  //<-------v1.0.2---------
  // Close assigned dropdown on outside click when filter popup is open
  useEffect(() => {
    if (!isFilterPopupOpen) return;
    const onDocClick = (e) => {
      if (
        assignedDropdownRef.current &&
        !assignedDropdownRef.current.contains(e.target)
      ) {
        setIsAssignedDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isFilterPopupOpen]);
  //-------v1.0.2--------->

  // Filter handling
  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };
  //<-------v1.0.2---------
  const handlePriorityToggle = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const handleDueDateChange = (value) => {
    setSelectedDueDate(value);
  };

  const handleAssignedUserChange = (value) => {
    setSelectedAssignedUserId(value);
  };

  const handleCreatedDateChange = (value) => {
    setSelectedCreatedDate(value);
  };
  //-------v1.0.2--------->

  const handleClearAll = () => {
    //<-------v1.0.2---------
    const clearedFilters = {
      status: [],
      priority: [],
      dueDate: "",
      assignedToId: "",
      createdDate: "",
    };
    setSelectedStatus([]);
    setSelectedPriorities([]);
    setSelectedDueDate("");
    setSelectedAssignedUserId("");
    setSelectedCreatedDate("");
    //-------v1.0.2--------->
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    //<-------v1.0.2---------
    const filters = {
      status: selectedStatus,
      priority: selectedPriorities,
      dueDate: selectedDueDate,
      assignedToId: organization ? selectedAssignedUserId : "",
      createdDate: selectedCreatedDate,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    const active =
      filters.status?.length > 0 ||
      filters.priority?.length > 0 ||
      !!filters.dueDate ||
      !!filters.createdDate ||
      !!filters.assignedToId;
    setIsFilterActive(active);
    //-------v1.0.2--------->
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (taskData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  // Unique statuses for filter options
  const uniqueStatuses = [
    ...new Set(taskData?.map((task) => task.status).filter(Boolean)),
  ];

  //<-------v1.0.2---------
  const priorityOptions = ["High", "Medium", "Low", "Normal"];

  const selectedAssignedUserLabel = React.useMemo(() => {
    if (!selectedAssignedUserId) return "Any user";
    const u = Array.isArray(usersRes)
      ? usersRes.find((x) => x._id === selectedAssignedUserId)
      : null;
    const name = u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
    return name || u?.email || "Any user";
  }, [selectedAssignedUserId, usersRes]);

  const filteredAssignedUsers = React.useMemo(() => {
    if (!Array.isArray(usersRes)) return [];
    const term = assignedSearch.trim().toLowerCase();
    if (!term) return usersRes;
    return usersRes.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const email = (u.email || "").toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [usersRes, assignedSearch]);

  // Date helpers
  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const start = new Date(d);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const getEndOfWeek = (date) => {
    const start = getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  };
  //-------v1.0.2--------->

  // Filtered data
  const FilteredData = () => {
    if (!Array.isArray(taskData)) return [];
    return taskData.filter((task) => {
      const fieldsToSearch = [
        task.title,
        task.description,
        task.assigned,
        task.taskCode,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        //<-------v1.0.2---------
        (selectedFilters.status?.length || 0) === 0 ||
        selectedFilters.status.includes(task.status);

      const matchesPriority =
        (selectedFilters.priority?.length || 0) === 0 ||
        selectedFilters.priority.includes(task.priority);

      const now = new Date();
      const dueDate = task?.dueDate ? new Date(task.dueDate) : null;
      let matchesDueDate = true;
      if (
        selectedFilters.dueDate &&
        dueDate instanceof Date &&
        !isNaN(dueDate)
      ) {
        if (selectedFilters.dueDate === "overdue") {
          matchesDueDate = dueDate < now;
        } else if (selectedFilters.dueDate === "today") {
          matchesDueDate = isSameDay(dueDate, now);
        } else if (selectedFilters.dueDate === "thisWeek") {
          const start = getStartOfWeek(now);
          const end = getEndOfWeek(now);
          matchesDueDate = dueDate >= start && dueDate <= end;
        }
      }

      const matchesAssigned =
        !selectedFilters.assignedToId ||
        task?.assignedToId === selectedFilters.assignedToId;

      let matchesCreated = true;
      if (selectedFilters.createdDate) {
        const createdAt = task?.createdAt ? new Date(task.createdAt) : null;
        if (createdAt instanceof Date && !isNaN(createdAt)) {
          const cutoff = new Date();
          if (selectedFilters.createdDate === "last7")
            cutoff.setDate(cutoff.getDate() - 7);
          if (selectedFilters.createdDate === "last30")
            cutoff.setDate(cutoff.getDate() - 30);
          matchesCreated = createdAt >= cutoff;
        }
      }
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery &&
        matchesStatus &&
        matchesPriority &&
        matchesDueDate &&
        matchesAssigned &&
        matchesCreated
      );
      //-------v1.0.2--------->
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData().length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  // Action logic
  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  const handleAddTaskClick = () => {
    setEditingTaskId(null);
    setIsTaskFormOpen(true);
  };

  const handleTaskFormClose = () => {
    setIsTaskFormOpen(false);
  };

  const handleTaskAdded = () => {
    refetch();
  };

  // v1.0.7 <------------------------------------------------------
  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);
  // v1.0.7 ------------------------------------------------------>

  // v1.0.8 <----------------------------------------------------
  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  // v1.0.8 ---------------------------------------------------->

  // Render actions for Kanban cards
  // Table Columns Configuration
  const tableColumns = [
    // v1.0.3 <-------------------------------------------------
    {
      key: "taskCode",
      header: "Task ID",
      render: (value, row) => (
        <span
          className="text-custom-blue text-sm font-medium cursor-pointer"
          onClick={() => handleTaskClick(row)}
        >
          {value ? value : "not available"}
        </span>
      ),
    },
    // v1.0.3 ------------------------------------------------->
    {
      key: "title",
      header: "Title",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
              {value ? value.charAt(0).toUpperCase() : "N/A"}
            </div>
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleTaskClick(row)}
            >
              {value
                ? value.charAt(0).toUpperCase() + value.slice(1)
                : "Untitled Task"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "relatedTo",
      header: "Related To",
      render: (value) => value?.objectName || "N/A",
    },
    { key: "priority", header: "Priority", render: (value) => value || "N/A" },
    // v1.0.7 <---------------------------------------------------------------
    {
      key: "status",
      header: "Status",
      render: (value) =>
        <StatusBadge status={capitalizeFirstLetter(value)} /> || "N/A",
    },
    // v1.0.7 --------------------------------------------------------------->
    {
      key: "dueDate",
      header: "Due Date",
      render: (value) => new Date(value).toLocaleDateString() || "N/A",
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => handleTaskClick(row),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => handleEditTask(row._id),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash className="w-4 h-4 text-red-600" />,
      onClick: (row) => {
        setShowDeleteConfirmModal(true);
        setDeleteTask(row);
      },
    },
  ];

  // v1.0.8 <----------------------------------------------------------------------------------
  const kanbanColumns = [
    {
      key: "assignedTo",
      header: "Assigned To",
      render: (value, row) => <span>{row?.assignedTo}</span>,
    },
    {
      key: "relatedTo",
      header: "Related To",
      render: (value, row) => <span>{row?.relatedTo?.objectName}</span>,
    },
    {
      key: "priority",
      header: "Priority",
      render: (value, row) => (
        <span>{<StatusBadge status={row?.priority} />}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span>{<StatusBadge status={row?.status} />}</span>
      ),
    },
  ];

  const kanbanActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => handleTaskClick(row),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => handleEditTask(row._id),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash className="w-4 h-4 text-red-600" />,
      onClick: (row) => {
        setShowDeleteConfirmModal(true);
        setDeleteTask(row);
      },
    },
  ];
  // v1.0.8 ---------------------------------------------------------------------------------->

  const handleEditTask = (taskId) => {
    setEditingTaskId(taskId);
    setIsTaskFormOpen(true);
  };

  return (
    <div className="h-screen fixed w-full flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        <div className="fixed top-16 right-0 left-0 bg-background z-10 px-4 sm:px-8 lg:px-8 xl:px-8 2xl:px-8">
          {/* Header and Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header
              title="Tasks"
              onAddClick={handleAddTaskClick}
              addButtonText="Add Task"
              canCreate={effectivePermissions.Tasks?.Create}
            />
          </motion.div>
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={prevPage}
            onNextPage={nextPage}
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            dataLength={taskData?.length}
            searchPlaceholder="Search by Title..."
            filterIconRef={filterIconRef}
          />
        </div>
      </div>
      <div className="fixed top-48 xl:top-50 lg:top-50 right-0 left-0 bg-background">
        <motion.div className="bg-white">
          <div className="relative w-full">
            {view === "table" ? (
              // v1.0.5 <---------------------------------------------------------------------------------------------------
              <div className="w-full sm:mt-10 overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                {/* v1.0.5 <--------------------------------------------------------------------------------------------------- */}
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  loading={isLoading}
                  actions={tableActions}
                  emptyState="No Tasks Found."
                />
              </div>
            ) : (
              // v1.0.4 <--------------------------------
              // v1.0.8 <----------------------------------------------------
              <div className="w-full sm:mt-8">
                {/* v1.0.4 <-------------------------------- */}
                <TaskKanban
                  loading={isLoading}
                  data={currentFilteredRows.map((task) => ({
                    ...task,
                    id: task._id || task.id,
                    title: task?.taskCode,
                    subTitle: formatDate(task?.dueDate),
                  }))}
                  columns={kanbanColumns}
                  renderActions={(item) => (
                    <KanbanActionsMenu
                      item={item}
                      kanbanActions={kanbanActions}
                    />
                  )}
                  onTitleClick={(item) => handleTaskClick(item)}
                  emptyState="No Tasks Found."
                  kanbanTitle="Task"
                />
              </div>
              // v1.0.8 ---------------------------------------------------->
            )}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3">
                {/* Status Section */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                  >
                    <span className="font-medium text-gray-700">Status</span>
                    {isStatusOpen ? (
                      <ChevronUp className="text-xl text-gray-700" />
                    ) : (
                      <ChevronDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isStatusOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {uniqueStatuses.length > 0 ? (
                        uniqueStatuses.map((status) => (
                          <label
                            key={status}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStatus.includes(status)}
                              onChange={() => handleStatusToggle(status)}
                              // v1.0.5 <----------------------------------------------------------------
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                              // v1.0.5 ---------------------------------------------------------------->
                            />
                            <span className="text-sm">{status}</span>
                          </label>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">
                          No Statuses available
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/*<-------v1.0.2--------- Priority Section */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  >
                    <span className="font-medium text-gray-700">Priority</span>
                    {isPriorityOpen ? (
                      <ChevronUp className="text-xl text-gray-700" />
                    ) : (
                      <ChevronDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isPriorityOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {priorityOptions.map((p) => (
                        <label key={p} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedPriorities.includes(p)}
                            onChange={() => handlePriorityToggle(p)}
                            // v1.0.5 <---------------------------------------------------------------
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            // v1.0.5 --------------------------------------------------------------->
                          />
                          <span className="text-sm">{p}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Due Date Section */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsDueDateOpen(!isDueDateOpen)}
                  >
                    <span className="font-medium text-gray-700">Due Date</span>
                    {isDueDateOpen ? (
                      <ChevronUp className="text-xl text-gray-700" />
                    ) : (
                      <ChevronDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isDueDateOpen && (
                    <div className="mt-1 space-y-2 pl-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="dueDatePreset"
                          value=""
                          checked={selectedDueDate === ""}
                          onChange={() => handleDueDateChange("")}
                          // v1.0.5 <--------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 -------------------------------------------------------->
                        />
                        <span className="text-sm">Any due date</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="dueDatePreset"
                          value="overdue"
                          checked={selectedDueDate === "overdue"}
                          onChange={() => handleDueDateChange("overdue")}
                          // v1.0.5 <---------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 --------------------------------------------------------->
                        />
                        <span className="text-sm">Overdue</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="dueDatePreset"
                          value="today"
                          checked={selectedDueDate === "today"}
                          onChange={() => handleDueDateChange("today")}
                          // v1.0.5 <-------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 ------------------------------------------------------->
                        />
                        <span className="text-sm">Today</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="dueDatePreset"
                          value="thisWeek"
                          checked={selectedDueDate === "thisWeek"}
                          onChange={() => handleDueDateChange("thisWeek")}
                          // v1.0.5 <------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 ------------------------------------------------------>
                        />
                        <span className="text-sm">This week</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Assigned User Section (org only) */}
                {organization && (
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsAssignedOpen(!isAssignedOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Assigned User
                      </span>
                      {isAssignedOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isAssignedOpen && (
                      <div className="mt-1 pl-3" ref={assignedDropdownRef}>
                        <div className="relative">
                          <button
                            type="button"
                            className="w-full px-3 py-2 h-10 border border-gray-300 rounded-md text-left flex items-center justify-between focus:ring-2 focus:border-transparent sm:text-sm"
                            onClick={() =>
                              setIsAssignedDropdownOpen((prev) => !prev)
                            }
                          >
                            <span className="truncate">
                              {selectedAssignedUserLabel}
                            </span>
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          </button>
                          {isAssignedDropdownOpen && (
                            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg">
                              <div className="p-2 border-b">
                                <input
                                  type="text"
                                  value={assignedSearch}
                                  onChange={(e) =>
                                    setAssignedSearch(e.target.value)
                                  }
                                  placeholder="Search users..."
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:border-transparent text-sm"
                                />
                              </div>
                              <ul className="max-h-48 overflow-y-auto py-1">
                                <li
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    selectedAssignedUserId === ""
                                      ? "text-custom-blue font-medium"
                                      : "text-gray-700"
                                  }`}
                                  onClick={() => {
                                    handleAssignedUserChange("");
                                    setIsAssignedDropdownOpen(false);
                                  }}
                                >
                                  Any user
                                </li>
                                {filteredAssignedUsers.length > 0 ? (
                                  filteredAssignedUsers.map((user) => {
                                    const name =
                                      `${user.firstName || ""} ${
                                        user.lastName || ""
                                      }`.trim() || user.email;
                                    const isSelected =
                                      selectedAssignedUserId === user._id;
                                    return (
                                      <li
                                        key={user._id}
                                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                          isSelected
                                            ? "text-custom-blue font-medium"
                                            : "text-gray-700"
                                        }`}
                                        onClick={() => {
                                          handleAssignedUserChange(user._id);
                                          setIsAssignedDropdownOpen(false);
                                        }}
                                      >
                                        {name}
                                      </li>
                                    );
                                  })
                                ) : (
                                  <li className="px-3 py-2 text-sm text-gray-500">
                                    No users found
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Created Date Section */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedDateOpen(!isCreatedDateOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Created Date
                    </span>
                    {isCreatedDateOpen ? (
                      <ChevronUp className="text-xl text-gray-700" />
                    ) : (
                      <ChevronDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isCreatedDateOpen && (
                    <div className="mt-1 space-y-2 pl-3">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDatePreset"
                          value=""
                          checked={selectedCreatedDate === ""}
                          onChange={() => handleCreatedDateChange("")}
                          // v1.0.5 <--------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 -------------------------------------------------------->
                        />
                        <span className="text-sm">Any time</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDatePreset"
                          value="last7"
                          checked={selectedCreatedDate === "last7"}
                          onChange={() => handleCreatedDateChange("last7")}
                          // v1.0.5 <--------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 -------------------------------------------------------->
                        />
                        <span className="text-sm">Last 7 days</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDatePreset"
                          value="last30"
                          checked={selectedCreatedDate === "last30"}
                          onChange={() => handleCreatedDateChange("last30")}
                          // v1.0.5 <----------------------------------------------------------
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 ---------------------------------------------------------->
                        />
                        <span className="text-sm">Last 30 days</span>
                      </label>
                    </div>
                  )}
                </div>
                {/*-------v1.0.2--------->*/}
              </div>
            </FilterPopup>
          </div>
        </motion.div>
      </div>

      {/* Task Form as a sidebar */}
      {isTaskFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-15 z-50">
          <div className="fixed inset-y-0 right-0 z-50 sm:w-full md:w-3/4 lg:w-1/2 xl:w-1/2 2xl:w-1/2 bg-white shadow-lg transition-transform duration-5000 transform">
            <TaskForm
              isOpen={isTaskFormOpen}
              onClose={handleTaskFormClose}
              onTaskAdded={handleTaskAdded}
              taskId={editingTaskId}
            />
          </div>
        </div>
      )}

      {/* Task Details */}
      {selectedTask && (
        <TaskProfileDetails task={selectedTask} onClosetask={handleCloseTask} />
      )}

      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeletePosition}
        title="Task"
        entityName={deleteTask?.title}
      />
    </div>
  );
};

export default Task;
