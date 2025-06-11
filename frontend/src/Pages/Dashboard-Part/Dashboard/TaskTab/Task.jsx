import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, Pencil, ChevronUp, ChevronDown, CheckCircle, XCircle, Info, Trash } from 'lucide-react';
import { ReactComponent as CgInfo } from '../../../../icons/CgInfo.svg';
import { ReactComponent as MdMoreVert } from '../../../../icons/MdMoreVert.svg';


import { useCustomContext } from '../../../../Context/Contextfetch';
import Header from '../../../../Components/Shared/Header/Header';
import Toolbar from '../../../../Components/Shared/Toolbar/Toolbar';
import TableView from '../../../../Components/Shared/Table/TableView';
import { FilterPopup } from '../../../../Components/Shared/FilterPopup/FilterPopup';
import Loading from '../../../../Components/Loading';
import toast from 'react-hot-toast';
import maleImage from '../../Images/man.png';
import femaleImage from '../../Images/woman.png';
import genderlessImage from '../../Images/transgender.png';
import TaskForm from './Task_form.jsx';
import TaskProfileDetails from './TaskProfileDetails.jsx';
import axios from 'axios';
import { config } from '../../../../config.js';
import TaskKanban from './TaskKanban.jsx';

const Task = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
  });
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [taskData, setTaskData] = useState([]);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [actionViewMore, setActionViewMore] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newState, setNewState] = useState(null); // Added state declaration
  const filterIconRef = useRef(null);

  // Set view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setView('kanban');
      } else {
        setView('table');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setIsStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const fetchTasks = useCallback(async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/tasks`);
      setTaskData(response.data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Run only once on mount

  // Filter handling
  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleClearAll = () => {
    const clearedFilters = { status: [] };
    setSelectedStatus([]);
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = { status: selectedStatus };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(filters.status.length > 0);
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

  // Filtered data
  const FilteredData = () => {
    if (!Array.isArray(taskData)) return [];
    return taskData.filter((task) => {
      const fieldsToSearch = [
        task.title,
        task.description,
        task.assigned,
        task._id,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(task.status);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
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
    fetchTasks();
  };

  // Kanban Columns Configuration
  // const kanbanColumns = [

  // ];

  // Render actions for Kanban cards
  const renderKanbanActions = (task) => (
    <div className="flex space-x-2">
      <button 
        onClick={() => handleTaskClick(task)}
      >
        <Eye className="w-4 h-4 text-blue-600" />
      </button>
      <button onClick={() => handleEditTask(task._id)}>
        <Pencil className="w-4 h-4 text-green-600" />
      </button>
    </div>
  );

  // Table Columns Configuration
  const tableColumns = [
    {
      key: 'taskCode',
      header: 'Task ID',
      render: (value) => value ? value : 'not available',
    },
    {
      key: 'title',
      header: 'Title',
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
              {value ? value.charAt(0).toUpperCase() : 'N/A'}
            </div>
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleTaskClick(row)}
            >
              {value || 'Untitled Task'}
            </div>
          </div>
        </div>
      ),
    },
    { key: 'relatedTo', header: 'Related To', render: (value) => value?.objectName || 'N/A' },
    { key: 'priority', header: 'Priority', render: (value) => value || 'N/A' },
    { key: 'status', header: 'Status', render: (value) => value || 'N/A' },
    { key: 'dueDate', header: 'Due Date', render: (value) => new Date(value).toLocaleDateString() || 'N/A' },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => handleTaskClick(row),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => handleEditTask(row._id),
    }
  ];

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
              {view === 'table' ? (
                <div className="w-full">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={loading}
                    actions={tableActions}
                    emptyState="No tasks found."
                  />
                </div>
              ) : (
              
                <div className="w-full">
                  <TaskKanban
                    data={currentFilteredRows.map(task => ({
                      ...task,
                      id: task.id,
                      title: task.title,
                      Email: task.assignedTo || 'None',
                      Phone: task.relatedTo?.objectName || 'N/A',
                      HigherQualification: task.priority || 'N/A',
                      UniversityCollege: task.status || 'N/A',
                      interviews: new Date(task.dueDate).toLocaleString()

                    }))}
                    //columns={kanbanColumns}
                    loading={loading}
                    renderActions={renderKanbanActions}
                    emptyState="No tasks found."

                  />
                </div>
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
                            <label key={status} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={selectedStatus.includes(status)}
                                onChange={() => handleStatusToggle(status)}
                                className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{status}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">No statuses available</span>
                        )}
                      </div>
                    )}
                  </div>
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
        <TaskProfileDetails
          task={selectedTask}
          onClosetask={handleCloseTask}
        />
      )}
    </div>
  );
};

export default Task;
