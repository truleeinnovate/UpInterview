// v1.0.0  -  Ashraf  -  removed expity date
// v1.0.1  -  Ashraf  -  added new assessment button
// v1.0.2 ---Venkatesh---change assessmentID to first in table column and add status column style

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
import { Eye, Pencil } from 'lucide-react';
import ScheduleAssessmentKanban from './ScheduleAssessmentKanban.jsx';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAssessments } from '../../../../apiHooks/useAssessments.js';
// <---------------------- v1.0.1
import ShareAssessment from "../Assessment-Tab/ShareAssessment.jsx";
// <---------------------- v1.0.1 >

const ScheduleAssessment = () => {
  const { effectivePermissions } = usePermissions();
  const { assessmentData } = useAssessments();
  const { scheduleData, isLoading } = useScheduleAssessments();
  const navigate = useNavigate();
  // <---------------------- v1.0.1
  const [isShareOpen, setIsShareOpen] = useState(false);
  // <---------------------- v1.0.1 >

  const assessmentIds = assessmentData?.map((a) => a._id) || [];
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);

  // Filter state
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [statusOptions] = useState(['Scheduled', 'Completed', 'Cancelled']);
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
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedStatus([]);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    const willOpen = !isFilterPopupOpen;
    setFilterPopupOpen(willOpen);
    if (willOpen) {
      // sync draft state with applied state when opening popup
      setTempSelectedStatus(selectedStatus);
    }
  };

  // Handlers
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };
  const nextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((p) => p + 1);
  };
  const prevPage = () => {
    if (currentPage > 0) setCurrentPage((p) => p - 1);
  };

  const handleView = (schedule) => {
    // Adjust route when details page exists
    navigate(`/assessment/${schedule._id}`, { state: { schedule } });
  };

  // <---------------------- v1.0.1
  const handleShareClick = () => {
      setIsShareOpen(true);
  };
  const handleCloseShare = () => {
    setIsShareOpen(false);
  };
  // <---------------------- v1.0.1 >
  // Table definitions
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
    
    // <---------------------- v1.0.0
    // {
    //   key: 'order',
    //   header: 'ORDER',
    //   render: (v) => v || 'Not Provided',
    // },
    // {
    //   key: 'expiryAt',
    //   header: 'Expiry Date',
    //   render: (v) => (v ? format(new Date(v), 'MMM dd, yyyy') : 'Not Provided'),
    // },
    // <---------------------- v1.0.0
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
              : "bg-slate-50 text-slate-700 border border-slate-200/60"
          }`}
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
              //onEdit={handleEdit}
              />
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
    </div>
  );
};

export default ScheduleAssessment;
