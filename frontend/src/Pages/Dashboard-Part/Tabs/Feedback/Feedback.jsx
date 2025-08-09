// v1.0.0  -  Venkatesh  -  Initial setup for Feedbacks with table and kanban views
// v1.0.1  -  Venkatesh  -  Added toolbar with search, pagination, and filter functionality
// v1.0.2  -  Venkatesh  -  Added edit modes for Candidate, Interviews, Skills, and Overall Impressions tabs
// v1.0.3  -  Ashraf  -  added api get from apimodel

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
import { useInterviews } from '../../../../apiHooks/useInterviews.js';
// <------------------------v1.0.3
import { useFeedbacks } from '../../../../apiHooks/useFeedbacks.js';


const Feedback = () => {
  const navigate = useNavigate();
  useScrollLock(true);
  const { interviewData, isLoading: interviewsLoading } = useInterviews();
  const { data: feedbacksData, isLoading: feedbacksLoading, error: feedbacksError } = useFeedbacks();
  
  console.log("[Feedback] Debug:", {
    interviewData: !!interviewData,
    feedbacksData: !!feedbacksData,
    feedbacksLoading,
    feedbacksError: !!feedbacksError,
    feedbacksDataLength: feedbacksData?.length || 0
  });
  // ------------------------------v1.0.3 >
  
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const organization = tokenPayload?.organization;
  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;
  
  // Get context data (removed unused variables)
  const { user } = useCustomContext();
  const [viewMode, setViewMode] = useState('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const filterIconRef = useRef(null);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // <------------------------v1.0.3
  const [statusOptions] = useState(['draft', 'submitted']);
  // ------------------------------v1.0.3 >
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  // ------------------------------v1.0.3 >
  // Use data from the hook
  const feedbacks = feedbacksData || [];
  const loading = feedbacksLoading;
  const error = feedbacksError;
  // Removed modal-related state variables as modal is now in separate component

  // Update filtered feedbacks when feedbacks data changes
  useEffect(() => {
    console.log("[Feedback] useEffect - feedbacks changed:", {
      feedbacksLength: feedbacks.length,
      currentFilteredLength: filteredFeedbacks.length
    });
    
    // Only update if the arrays are actually different
    if (feedbacks.length !== filteredFeedbacks.length || 
        feedbacks.some((item, index) => item._id !== filteredFeedbacks[index]?._id)) {
      setFilteredFeedbacks(feedbacks);
    }
  }, [feedbacks]);
// 
  // ------------------------------v1.0.3 >
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
      // <------------------------v1.0.3
      const matchesStatus = tempSelectedStatus.length === 0 || tempSelectedStatus.includes(f.status || '');
      const candidateName = f.candidateId ? `${f.candidateId.FirstName || ''} ${f.candidateId.LastName || ''}` : '';
      const positionTitle = f.positionId?.title || '';
      const fields = [f._id, candidateName, positionTitle, f.status].filter(Boolean);
      const matchesSearch = fields.some((field) => field.toString().toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
    setFilteredFeedbacks(filtered);
  };
  // ------------------------------v1.0.3 >
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
      // <------------------------v1.0.3
      const candidateName = f.candidateId ? `${f.candidateId.FirstName || ''} ${f.candidateId.LastName || ''}` : '';
      const positionTitle = f.positionId?.title || '';
      const fields = [f._id, candidateName, positionTitle, f.status].filter(Boolean);
      const matchesSearch = fields.some((field) => field.toString().toLowerCase().includes(e.target.value.toLowerCase()));
      return matchesSearch;
    });
    setFilteredFeedbacks(filtered);
  };
  // ------------------------------v1.0.3 >
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
      case 'draft':
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
        <div className="text-sm">{row.interviewRoundId?.interviewerType === "Internal" ? (row.interviewerId?.firstName + " " + row.interviewerId?.lastName || "Not Provided") : "External"}</div>
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
      header: 'Date',
      render: (value,row) => (
        <div className="text-sm">{row.interviewRoundId?.dateTime?.split(' ')[0] || 'N/A'}</div>
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
            {getStatusIcon(row.status === "submitted" ? "completed" : row.status)}
          <span className="ml-2 text-sm capitalize">{row.status === "submitted" ? "completed" : row.status}</span>
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
      show: (row) => row.status === 'draft', // Only show edit button for draft status
    },
  ];

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

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
