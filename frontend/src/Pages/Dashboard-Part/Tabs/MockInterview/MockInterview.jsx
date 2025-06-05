import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import MockProfileDetails from "./MockProfileDetails";
import ReschedulePopup from "./ReschedulePopup.jsx";
import { motion } from 'framer-motion';
import { Eye, Pencil, Timer, XCircle } from 'lucide-react';
import CancelPopup from "./ScheduleCancelPopup.jsx";
import { useNavigate } from "react-router-dom";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import MockInterviewKanban from "./MockInterviewKanban.jsx";
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { useMockInterviews } from "../../../../apiHooks/useMockInterviews.js";

const MockInterview = () => {
  const { 
  mockinterviewData, 
  isLoading, 
} = useMockInterviews();
console.log("mockinterviewData:", mockinterviewData);


// Usage remains exactly the same as before
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
  });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [mockinterviewDataView, setmockinterviewDataView] = useState(false);
  const [reschedule, setReschedule] = useState(false);
  const [cancelSchedule, setCancelSchedule] = useState(false);
  const filterIconRef = useRef(null);

  useEffect(() => {
    document.title = "Mockinterview Tab";
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleApplyFilters = () => {
    const filters = { status: selectedStatus };
    setSelectedFilters(filters);
    setIsFilterActive(filters.status.length > 0);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    setSelectedStatus([]);
    setSelectedFilters({ status: [] });
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleFilterIconClick = () => {
    if (mockinterviewData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(mockinterviewData)) return [];
    return mockinterviewData.filter((interview) => {
      const fieldsToSearch = [
        interview?.rounds?.roundTitle,
        interview?.technology,
      ].filter(Boolean);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(interview.rounds?.status);

      return matchesSearchQuery && matchesStatus;
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const onRescheduleClick = (mockinterview) => {
    setReschedule(mockinterview);
  };

  const onCancelClick = () => {
    setCancelSchedule(true);
  };

  const closeschedulepopup = () => {
    setReschedule(false);
  };

  const closepopup = () => {
    setCancelSchedule(false);
  };

  const tableColumns = [
    {
      key: 'title',
      header: 'Interview Title',
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => navigate(`/mockinterview-details/${row._id}`)}
        >
          {row?.rounds?.roundTitle || 'Not Provided'}
        </div>
      ),
    },
    {
      key: 'technology',
      header: 'Technology',
      render: (value) => value || 'Not Provided',
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, row) => row?.rounds?.status || 'Not Provided',
    },
    {
      key: 'duration',
      header: 'Duration',
      render: (value, row) => row?.rounds?.duration || 'Not Provided',
    },
    {
      key: 'interviewer',
      header: 'Interviewer',
      render: () => 'Not Provided', // Placeholder, update if interviewer data is available
    },
 {
  key: 'createdAt',
  header: 'Created On',
  render: (value) => {
    if (!value) return 'Not Provided';
    const date = new Date(value);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  },
}

  ];

  const tableActions = [
    {
      key: 'view',
      label: 'View Details',
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => navigate(`/mockinterview-details/${row._id}`),
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`/mock-interview/${row._id}/edit`),
    },
    {
      key: 'reschedule',
      label: 'Reschedule',
      icon: <Timer className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => onRescheduleClick(row),
    },
    {
      key: 'cancel',
      label: 'Cancel',
      icon: <XCircle className="w-4 h-4 text-red-500" />,
      onClick: () => onCancelClick(),
    },
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Mock Interviews"
              onAddClick={() => navigate('/mockinterview-create')}
              addButtonText="Add Interview"
            />
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
              dataLength={mockinterviewData?.length}
              searchPlaceholder="Search by Title, Technology..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "kanban" ? (
              <MockInterviewKanban
                mockinterviews={currentFilteredRows}
                mockinterviewData={mockinterviewData}
                loading={isLoading}
                mockinterviewDataView={setmockinterviewDataView}
                onRescheduleClick={onRescheduleClick}
                onCancel={onCancelClick}
              />
            ) : (
              <TableView
                data={currentFilteredRows}
                columns={tableColumns}
                actions={tableActions}
                loading={isLoading}
                emptyState="No interviews found."
                className="table-fixed w-full"
              />
            )}

            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
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
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {['Draft', 'Scheduled', 'Cancelled'].map((status) => (
                        <label
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(status)}
                            onChange={() => handleStatusToggle(status)}
                            className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{status}</span>
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
      {mockinterviewDataView && (
        <MockProfileDetails
          mockinterviewId={mockinterviewDataView._id}
          onCloseprofile={() => setmockinterviewDataView(false)}
        />
      )}
      {cancelSchedule && (
        <CancelPopup onClose={closepopup} />
      )}
      {reschedule && (
        <ReschedulePopup
          onClose={closeschedulepopup}
          MockEditData={reschedule}
        />
      )}
    </div>
  );
};

export default MockInterview;