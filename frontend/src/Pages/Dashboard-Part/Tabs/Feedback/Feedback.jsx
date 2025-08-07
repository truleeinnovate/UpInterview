// v1.0.0  -  Venkatesh  -  Initial setup for Feedbacks with table and kanban views
// v1.0.1  -  Venkatesh  -  Added toolbar with search, pagination, and filter functionality
// v1.0.2  -  Venkatesh  -  Added edit modes for Candidate, Interviews, Skills, and Overall Impressions tabs

import { useState, useRef, useEffect } from 'react';
import '../../../../index.css';
import '../styles/tabs.scss';
import { motion } from 'framer-motion';
import { Tooltip } from '@mantine/core';
import Header from '../../../../Components/Shared/Header/Header.jsx';
import Toolbar from '../../../../Components/Shared/Toolbar/Toolbar.jsx';
import TableView from '../../../../Components/Shared/Table/TableView.jsx';
import { FilterPopup } from '../../../../Components/Shared/FilterPopup/FilterPopup.jsx';
import { ReactComponent as MdKeyboardArrowUp } from '../../../../icons/MdKeyboardArrowUp.svg';
import { ReactComponent as MdKeyboardArrowDown } from '../../../../icons/MdKeyboardArrowDown.svg';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Eye, FileTextIcon, Pencil, Star, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge.jsx';
import { useScrollLock } from '../../../../apiHooks/scrollHook/useScrollLock.js';
import SummarizedFeedbackModal from './SummarizedFeedbackModal.jsx';
import { useCustomContext } from '../../../../Context/Contextfetch.js';
import FeedbackKanban from './FeedbackKanban.jsx';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from "js-cookie";

const Feedback = () => {
  const navigate = useNavigate();
  useScrollLock(true);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const tenantId = tokenPayload?.tenantId;
  const interviewerId = tokenPayload?.userId;
  
  // Get context data (removed unused variables)
  const { user } = useCustomContext();
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [statusOptions] = useState(['Active', 'Inactive', 'Other']);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed modal-related state variables as modal is now in separate component

  useEffect(() => {
    // Dummy data for testing - replacing API calls
    // const dummyFeedbacks = [
    //   { _id: 1, interview: "John Doe", interviewType: "Technical", scheduledDate: "2025-08-01", status: "Active", feedback: "Good performance" },
    //   { _id: 2, interview: "Jane Smith", interviewType: "HR", scheduledDate: "2025-08-02", status: "Inactive", feedback: "Needs improvement" },
    //   { _id: 3, interview: "Mike Johnson", interviewType: "Behavioral", scheduledDate: "2025-08-03", status: "Active", feedback: "Excellent communication" },
    //   { _id: 4, interview: "Sarah Williams", interviewType: "Technical", scheduledDate: "2025-08-04", status: "Other", feedback: "Average skills" },
    //   { _id: 5, interview: "Robert Brown", interviewType: "HR", scheduledDate: "2025-08-05", status: "Active", feedback: "Positive attitude" },
    //   { _id: 6, interview: "Emily Davis", interviewType: "Behavioral", scheduledDate: "2025-08-06", status: "Inactive", feedback: "Lacks confidence" },
    //   { _id: 7, interview: "William Wilson", interviewType: "Technical", scheduledDate: "2025-08-07", status: "Other", feedback: "Good problem-solving" },
    //   { _id: 8, interview: "Lisa Anderson", interviewType: "HR", scheduledDate: "2025-08-08", status: "Active", feedback: "Team player" },
    //   { _id: 9, interview: "James Taylor", interviewType: "Behavioral", scheduledDate: "2025-08-09", status: "Inactive", feedback: "Needs better time management" },
    //   { _id: 10, interview: "Emma Martinez", interviewType: "Technical", scheduledDate: "2025-08-10", status: "Active", feedback: "Quick learner" },
    //   { _id: 11, interview: "David Thompson", interviewType: "HR", scheduledDate: "2025-08-11", status: "Other", feedback: "Good leadership potential" },
    //   { _id: 12, interview: "Olivia Garcia", interviewType: "Behavioral", scheduledDate: "2025-08-12", status: "Active", feedback: "Strong analytical skills" }
    // ];
    // setFeedbacks(dummyFeedbacks);
    // setFilteredFeedbacks(dummyFeedbacks);
    // setLoading(false);

    const fetchFeedbackData = async () => {
      try {
        setLoading(true);
        // Use different endpoint based on organization status
        //const tenantId = "685bb9a00abf677d3ae9ec56"
        const endpoint = organization 
          ? `${process.env.REACT_APP_API_URL}/feedback/${tenantId}` 
          : `${process.env.REACT_APP_API_URL}/feedback/${interviewerId}`;
        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error('Failed to fetch feedback data');
        }
        const data = await response.json();
        setFeedbacks(data.data);
        setFilteredFeedbacks(data.data);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedbackData();
  }, []);

  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  useEffect(() => {
    document.title = 'Feedback';
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? 'kanban' : 'table');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const filtered = feedbacks.filter((f) => {
      const matchesStatus = selectedStatus.length === 0 || selectedStatus.includes((f.status || '').charAt(0).toUpperCase() + (f.status || '').slice(1));
      const fields = [f._id, f.interview, f.interviewType, f.status].filter(Boolean);
      const matchesSearch = fields.some((field) => field.toString().toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
    setFilteredFeedbacks(filtered);
  };

  const handleClearFilters = () => {
    setSelectedStatus([]);
    setTempSelectedStatus([]);
    setIsFilterActive(false);
    setFilteredFeedbacks(feedbacks);
  };

  const handleFilterIconClick = () => {
    setFilterPopupOpen(!isFilterPopupOpen);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
    const filtered = feedbacks.filter((f) => {
      const fields = [f._id, f.interview, f.interviewType, f.status].filter(Boolean);
      const matchesSearch = fields.some((field) => field.toString().toLowerCase().includes(e.target.value.toLowerCase()));
      return matchesSearch;
    });
    setFilteredFeedbacks(filtered);
  };

  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredFeedbacks.length / rowsPerPage) - 1));
  };

  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  const handleView = (feedback) => {
    navigate(`/feedback/view/${feedback._id}`, {
      state: { feedback: { ...feedback }, mode: 'view' }
    });
  };

  const handleEdit = (feedback) => {
    navigate(`/feedback/edit/${feedback._id}`, {
      state: { feedback: { ...feedback }, mode: 'edit' }
    });
  };


  

  const handleSummarize = (feedback) => {
    console.log("Summarize clicked", feedback); // Debug log to check the feedback object structure
    setSummaryData({
      candidate_name: (feedback.candidateId ? `${feedback.candidateId.FirstName || ''} ${feedback.candidateId.LastName || ''}` : 'Unknown'),
      candidate_job_title: feedback.positionId?.title || 'Unknown Position',
      overall_impression: feedback.overallImpression?.note || 'No overall impression provided',
      recommendation: feedback.overallImpression?.recommendation || 'Not specified',
      skills: feedback.skills || [],
      status: feedback.status || 'Not specified',
      interview_mode: feedback.interviewRoundId?.interviewMode || 'Not specified',
      scheduled_datetime: feedback.interviewRoundId?.dateTime || 'Not specified',
      interviewer: feedback.interviewerId ? `${feedback.interviewerId.firstName || ''} ${feedback.interviewerId.lastName || ''}` : 'Not specified'
    });
    setShowSummaryModal(true);
  };

  const handleAddFeedback = () => {
    navigate('/dashboard/feedbacks/add');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };


  const tableColumns = [
    {
      key: '_id',
      header: 'ID',
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {value || "Not Provided"}
        </div>
      ),
    },
    {
      key: 'interviewRoundId.interviewMode',
      header: 'Mode',
      render: (value, row) => (
        <div className="text-sm">{row.interviewRoundId?.interviewMode || "Not Provided"}</div>
      ),
    },
    {
          key: 'candidateName',
          header: 'Candidate Name',
          render: (value, row) => {
            const candidate = row.candidateId;
            return (
              <Tooltip label={`${candidate?.FirstName || ''} ${candidate?.LastName || ''}`}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-8 w-8">
                    {candidate?.imageUrl ? (
                      <img
                        src={candidate.imageUrl}
                        alt={candidate.LastName}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                        {candidate?.LastName ? candidate?.LastName?.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <div className="ml-3 truncate max-w-[120px]">
                    <div
                      className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                      onClick={() => handleView(candidate)}
                    >
                      {((candidate?.FirstName ? candidate.FirstName.charAt(0).toUpperCase() + candidate.FirstName.slice(1) : '') + ' ' + (candidate?.LastName ? candidate.LastName.charAt(0).toUpperCase() + candidate.LastName.slice(1) : ''))}
                    </div>
                    <div className="text-sm text-gray-500 truncate">{candidate?.Email || 'No Email'}</div>
                  </div>
                </div>
              </Tooltip>
            );
          },
        },
        {
          key: 'position',
          header: 'Position',
          render: (value, row) => {
            const position = row.positionId;
            return (
              <Tooltip label={`${position?.title || 'Unknown'} • ${position?.companyname || 'No Company'} • ${position?.Location || 'No location'}`}>
                <div className="truncate max-w-[120px]">
                  <div
                    className="text-sm font-medium text-custom-blue cursor-pointer truncate"
                    //onClick={() => handleViewPosition(position)}
                  >
                    {position?.title
                      ? position.title.charAt(0).toUpperCase() + position.title.slice(1)
                      : 'Unknown'}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {position?.companyname || 'No Company'} • {position?.Location || 'No location'}
                  </div>
                </div>
              </Tooltip>
            );
          },
    },
    {
      key: 'interviewerId.firstName',
      header: 'Interviewer',
      render: (value,row) => (
        <div className="text-sm">{row.interviewerId?.firstName + " " + row.interviewerId?.lastName || "Not Provided"}</div>
      ),
    },
    
    // {
    //   key: 'interviewType',
    //   header: 'Interview Type',
    //   render: (value) => (
    //     <div className="text-sm">{value || "Not Provided"}</div>
    //   ),
    // },
    {
      key: 'interviewRoundId.dateTime',
      header: 'Scheduled Date&Time',
      render: (value,row) => (
        <div className="text-sm">{row.interviewRoundId?.dateTime || "Not Provided"}</div>
      ),
    },
    {
      key: 'overallImpression.overallRating',
      header: 'Rating',
      render: (value,row) => (
        <div className="text-sm">{ row.overallImpression?.overallRating ? renderStars(row.overallImpression?.overallRating) : <span className="text-gray-400">Pending</span>}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value,row) => (
        <div className="flex items-center">
            {getStatusIcon(row.status)}
          <span className="ml-2 text-sm capitalize">{row.status}</span>
        </div>
      ),
    },
    {
      key: 'overallImpression.recommendation',
      header: 'Recommendation',
      render: (value,row) => (
        <StatusBadge status={row.overallImpression?.recommendation} text={row.overallImpression?.recommendation ? row.overallImpression?.recommendation.charAt(0).toUpperCase() + row.overallImpression?.recommendation.slice(1) : "Not Provided"}/>
      ),
    },
  ];

  const tableActions = [
    {
      key: 'view',
      label: 'View',
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: handleView,
    },
    {
      key: 'summarize',
      label: 'Summarize',
      icon: <FileTextIcon className="w-4 h-4 text-custom-blue" />,
      onClick: handleSummarize,
    },
    {
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-custom-blue" />,
      onClick: handleEdit,
    },
  ];

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  if (loading) return <div className="text-center p-6">Loading...</div>;
  //if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
    <>
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header 
              title="Feedback"
              addButtonText="Add Feedback"
              onAddClick={handleAddFeedback}
              canCreate={false}
            />
            <Toolbar
              view={viewMode}
              setView={setViewMode}
              searchQuery={searchQuery}
              onSearch={handleSearchInputChange}
              currentPage={currentPage}
              //totalPages={totalPages}
              totalPages={Math.ceil(filteredFeedbacks.length / rowsPerPage) || 1}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={filteredFeedbacks.length}
              searchPlaceholder="Search Feedback..."
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
                //data={currentRows}
            data={filteredFeedbacks.slice(startIndex, endIndex)}
            columns={tableColumns}
            actions={tableActions}
            loading={loading}
                emptyState="No feedback found."
                className="table-fixed w-full"
          />
        ) : (
              <FeedbackKanban
                //feedbacks={currentRows}
                feedbacks={filteredFeedbacks.slice(startIndex, endIndex)}
                loading={loading}
                onView={handleView}
                onEdit={handleEdit}
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

    </div>
        <SummarizedFeedbackModal
          open={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          data={summaryData}
        />
    </>
  
  );
};

export default Feedback;
