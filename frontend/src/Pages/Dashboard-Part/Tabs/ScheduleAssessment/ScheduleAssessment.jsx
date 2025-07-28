// v1.0.0  -  Ashraf  -  removed expity date
// v1.0.1  -  Ashraf  -  added new assessment button
// v1.0.2 ---Venkatesh---change assessmentID to first in table column and add status column style
// v1.0.3  -  Ashraf  -  added extend/cancel functionality for candidate assessments. replaced actions button with direct extend/cancel buttons and restored original columns. added automatic expiry check functionality

import { useState, useRef, useEffect } from 'react';
import '../../../../index.css';
import '../styles/tabs.scss';
import { motion } from 'framer-motion';
import Header from '../../../../Components/Shared/Header/Header.jsx';
import Toolbar from '../../../../Components/Shared/Toolbar/Toolbar.jsx';
import TableView from '../../../../Components/Shared/Table/TableView.jsx';
import { FilterPopup } from '../../../../Components/Shared/FilterPopup/FilterPopup.jsx';
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { useScheduleAssessments } from '../../../../apiHooks/useScheduleAssessments.js';
import { usePermissions } from '../../../../Context/PermissionsContext';
// <-------------------------------v1.0.3
import { Eye, Pencil, Calendar, AlertTriangle, RefreshCw } from 'lucide-react';
// ------------------------------v1.0.3 >
import ScheduleAssessmentKanban from './ScheduleAssessmentKanban.jsx';
// <-------------------------------v1.0.3 >
import AssessmentActionPopup from '../Assessment-Tab/AssessmentViewDetails/AssessmentActionPopup.jsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAssessments } from '../../../../apiHooks/useAssessments.js';
import axios from 'axios';
import { config } from '../../../../config.js';
import toast from 'react-hot-toast';
// ------------------------------v1.0.3 >
// <---------------------- v1.0.1
import ShareAssessment from "../Assessment-Tab/ShareAssessment.jsx";
// <---------------------- v1.0.1 >

const ScheduleAssessment = () => {
  const { effectivePermissions } = usePermissions();
  // <-------------------------------v1.0.3
  const { assessmentData, checkExpiredAssessments, updateAllScheduleStatuses } = useAssessments();
  const { scheduleData, isLoading } = useScheduleAssessments();
  const navigate = useNavigate();
  // <---------------------- v1.0.1
  const [isShareOpen, setIsShareOpen] = useState(false);
  // <---------------------- v1.0.1 >
  // <---------------------- v1.0.3
  const [isActionPopupOpen, setIsActionPopupOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedAction, setSelectedAction] = useState(''); // 'extend' or 'cancel'
  // Function to check if action buttons should be shown based on schedule status
  const shouldShowActionButtons = (schedule) => {
    const status = schedule.status?.toLowerCase();
    // Hide buttons for completed, cancelled, expired, and failed statuses
    return !['completed', 'cancelled', 'expired', 'failed'].includes(status);
  };
  // Function to handle manual schedule status updates
  const handleUpdateAllScheduleStatuses = () => {
    updateAllScheduleStatuses.mutate();
  };
  // ------------------------------v1.0.3 >
  const assessmentIds = assessmentData?.map((a) => a._id) || [];
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);

  // Filter state
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // <-------------------------------v1.0.3
  const [statusOptions] = useState(['Scheduled', 'Completed', 'Cancelled', 'Expired', 'Failed']);
  // ------------------------------v1.0.3 >
  // Applied filters
  const [selectedStatus, setSelectedStatus] = useState([]);
  // Draft filters edited inside popup (not applied until Apply is clicked)
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(true);

  // Derived pagination
  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  // Filters and search apply here
  const filteredSchedules = (Array.isArray(scheduleData) ? scheduleData : []).filter((s) => {
    // Restrict to selected assessments
    if (assessmentIds.length && s.assessmentId) {
      const aId = typeof s.assessmentId === 'object' ? s.assessmentId._id || s.assessmentId.toString() : s.assessmentId.toString();
      if (!assessmentIds.includes(aId)) return false;
    }

    // Status filter
    const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes((s.status || '').charAt(0).toUpperCase() + (s.status || '').slice(1));

    // Search filter
    const fields = [s.scheduledAssessmentCode, s.order, s.expiryAt, s.status].filter(Boolean);
    const matchesSearch = fields.some((f) => f.toString().toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredSchedules.length / rowsPerPage) || 1;
  const currentRows = filteredSchedules.slice(startIndex, endIndex);

  // Effects
  useEffect(() => {
    document.title = 'Assessments';
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'kanban' : 'table');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handlers
  const handleStatusToggle = (status) => {
    setTempSelectedStatus((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      }
      return [...prev, status];
    });
  };

  const handleApplyFilters = () => {
    setSelectedStatus(tempSelectedStatus);
    setIsFilterActive(true);
    setFilterPopupOpen(false);
  };
  // ------------------------------v1.0.3 >
  const handleClearFilters = () => {
    setSelectedStatus([]);
    setTempSelectedStatus([]);
    setIsFilterActive(false);
  };

  const handleFilterIconClick = () => {
    setFilterPopupOpen(!isFilterPopupOpen);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleView = (schedule) => {
    navigate(`/assessment/${schedule._id}`, {
      state: { schedule: schedule }
    });
  };

  const handleShareClick = () => {
    setIsShareOpen(true);
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  // <---------------------- v1.0.3
  const handleActionClick = async (schedule, action) => {
    try {
      // Fetch candidate data for this schedule if not already available
      if (!schedule.candidates || schedule.candidates.length === 0) {
        const assessmentId = typeof schedule.assessmentId === 'object' ? schedule.assessmentId._id : schedule.assessmentId;
        if (assessmentId) {
          const response = await axios.get(`${config.REACT_APP_API_URL}/schedule-assessment/${assessmentId}/schedules`);
          if (response.data.success && response.data.data) {
            const scheduleWithCandidates = response.data.data.find(s => s._id === schedule._id);
            if (scheduleWithCandidates) {
              setSelectedSchedule(scheduleWithCandidates);
            } else {
              setSelectedSchedule(schedule);
            }
          } else {
            setSelectedSchedule(schedule);
          }
        } else {
          setSelectedSchedule(schedule);
        }
      } else {
        setSelectedSchedule(schedule);
      }
      setSelectedAction(action);
      setIsActionPopupOpen(true);
    } catch (error) {
      console.error('Error fetching candidate data:', error);
      setSelectedSchedule(schedule);
      setSelectedAction(action);
      setIsActionPopupOpen(true);
    }
  };

  const handleActionSuccess = () => {
    // The useAssessments mutations will automatically invalidate and refresh the data
    // No manual reload needed - React Query will handle the refresh
  };
  const handleCheckExpired = async () => {
    try {
      await checkExpiredAssessments.mutateAsync();
    } catch (error) {
      console.error('Error checking expired assessments:', error);
    }
  };
// <-------------------------------v1.0.3
  const tableColumns = [
    // Assessment Template ID
    //<---------v1.0.2-----
    {
      key: 'scheduledAssessmentCode',
      header: 'Assessment ID',
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {value || "Not Provided"}

        </div>
      ),
    },
    //-------v1.0.2----->
    {
      key: 'assessmentId',
      header: 'Assessment Template ID',
      render: (value, row) => {
        // Determine Assessment object (it may come populated or we find it in assessmentData)
        let assessmentObj = null;
        if (value) {
          if (typeof value === 'object') {
            assessmentObj = value;
          } else {
            assessmentObj = (assessmentData || []).find((a) => a._id === value);
          }
        }
        const code = assessmentObj?.AssessmentCode || assessmentObj?._id || 'Not Provided';
        return (
          <div
            className="text-sm font-medium text-custom-blue cursor-pointer"
            onClick={() => handleView(row)}
          >
            {code}
          </div>
        );
      },
    },
    // Assessment Template Name
    {
      key: 'assessmentTemplateName',
      header: 'Assessment Template Name',
      render: (_, row) => {
        const value = row.assessmentId;
        let assessmentObj = null;
        if (value) {
          if (typeof value === 'object') {
            assessmentObj = value;
          } else {
            assessmentObj = (assessmentData || []).find((a) => a._id === value);
          }
        }
        const title = assessmentObj?.AssessmentTitle || 'Not Provided';
        return (
          <div
            className="text-sm font-medium text-custom-blue cursor-pointer"
            onClick={() => handleView(row)}
          >
            {title.charAt ? title.charAt(0).toUpperCase() + title.slice(1) : title}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      //<---------------------- v1.0.2--------
      render: (v) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
            v === "completed"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : v === "scheduled"
              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
              // <-------------------------------v1.0.3
              : v === "cancelled"
              ? "bg-red-50 text-red-700 border border-red-200/60"
              : v === "expired"
              ? "bg-orange-50 text-orange-700 border border-orange-200/60"
              : v === "failed"
              ? "bg-red-50 text-red-700 border border-red-200/60"
              : "bg-slate-50 text-slate-700 border border-slate-200/60"
          }`}
          // ------------------------------v1.0.3 >
        >
          {v ? v.charAt(0).toUpperCase() + v.slice(1) : "Not Provided"}
        </span>
      ),
    },
    // ---------------------- v1.0.2-------->
  ];

  const tableActions = [
    ...(effectivePermissions.Assessments?.View
      ? [
        {
          key: 'view',
          label: 'View',
          icon: <Eye className="w-4 h-4 text-custom-blue" />,
          onClick: handleView,
        },
      ]
      : []),
    ...(effectivePermissions.Assessments?.Edit
      ? [
        {
          key: 'edit',
          label: 'Edit',
          icon: <Pencil className="w-4 h-4 text-green-600" />,
          //onClick: handleEdit,
        },
      ]
      : []),
    // <-------------------------------v1.0.3
    {
      key: 'extend',
      label: 'Extend',
      icon: <Calendar className="w-4 h-4 text-blue-600" />,
      onClick: (schedule) => handleActionClick(schedule, 'extend'),
      show: shouldShowActionButtons,
    },
    {
      key: 'cancel',
      label: 'Cancel',
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
      onClick: (schedule) => handleActionClick(schedule, 'cancel'),
      show: shouldShowActionButtons,
    },
    // ------------------------------v1.0.3 >
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            {/* <---------------------- v1.0.1 */}
            <Header title="Assessments"
            addButtonText="Add Assessment"
            onAddClick={() => handleShareClick()}
             canCreate={effectivePermissions.Assessments?.Create} />
             {/* <---------------------- v1.0.1 > */}
            <Toolbar
              view={viewMode}
              setView={setViewMode}
              searchQuery={searchQuery}
              onSearch={handleSearchInputChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={(Array.isArray(scheduleData) ? scheduleData.length : 0)}
              searchPlaceholder="Search Assessments..."
              filterIconRef={filterIconRef}
            />
            {/* <-------------------------------v1.0.3 */}
            
            {/* Manual Update Status Button - helps to update status or refresh status manually */}
            {/* <div className="flex justify-end mb-4">
              <button
                onClick={handleUpdateAllScheduleStatuses}
                disabled={updateAllScheduleStatuses.isPending}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${updateAllScheduleStatuses.isPending ? 'animate-spin' : ''}`} />
                {updateAllScheduleStatuses.isPending ? 'Updating...' : 'Update All Statuses'}
              </button>
            </div> */}
            {/* ------------------------------v1.0.3 > */}
          </div>
        </main>
      </div>

      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === 'table' ? (
              <TableView
                data={currentRows}
                columns={tableColumns}
                actions={tableActions}
                loading={isLoading}
                emptyState="No assessments found."
                className="table-fixed w-full"
              />
            ) : (
              <ScheduleAssessmentKanban
                schedules={currentRows}
                assessments={assessmentData}
                loading={isLoading}
                onView={handleView}
                // <-------------------------------v1.0.3
                onAction={handleActionClick}
              //onEdit={handleEdit}
              />
              // ------------------------------v1.0.3 >
            )}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearFilters}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3">
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsStatusOpen(!isStatusOpen)}
                  >
                    <span className="font-medium text-gray-700">Status</span>
                    {isStatusOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isStatusOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-40 overflow-y-auto">
                      {statusOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={tempSelectedStatus.includes(option)}
                            onChange={() => handleStatusToggle(option)}
                            className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </FilterPopup>
          </motion.div>
        </div>
      </main>
      {/* <---------------------- v1.0.1 */}
      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessment={isShareOpen}
          fromscheduleAssessment={true}
        />
      )}
      {/* <---------------------- v1.0.1 > */}
      {/* <---------------------- v1.0.3 */}
      {isActionPopupOpen && selectedSchedule && (
        <AssessmentActionPopup
          isOpen={isActionPopupOpen}
          onClose={() => {
            setIsActionPopupOpen(false);
            setSelectedSchedule(null);
            setSelectedAction('');
          }}
          schedule={{
            ...selectedSchedule, 
            assessmentId: typeof selectedSchedule.assessmentId === 'object' 
              ? selectedSchedule.assessmentId 
              : assessmentData?.find(a => a._id === selectedSchedule.assessmentId)
          }}
          candidates={selectedSchedule.candidates || []}
          onSuccess={handleActionSuccess}
          defaultAction={selectedAction}
        />
      )}
      {/* ------------------------------ v1.0.3 > */}
    </div>
  );
};

export default ScheduleAssessment;
