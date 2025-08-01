// v1.0.0  -  Venkatesh  -  Initial setup for Feedbacks with table and kanban views
// v1.0.1  -  Venkatesh  -  Added toolbar with search, pagination, and filter functionality

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
import { useNavigate } from 'react-router-dom';
import FeedbackKanban from './FeedbackKanban.jsx';
import { Eye, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge.jsx';
import { IoMdClose } from 'react-icons/io';
import CandidateMiniTab from './MiniTabs/Candidate';
import InterviewsMiniTabComponent from './MiniTabs/Interviews';
import SkillsTabComponent from './MiniTabs/Skills';
import OverallImpressions from './MiniTabs/OverallImpressions';

const tabsList = [
  {
    id: 1,
    tab: "Candidate",
  },
  {
    id: 2,
    tab: "Interview Questions",
  },
  {
    id: 3,
    tab: "Skills",
  },
  {
    id: 4,
    tab: "Overall Impression",
  },
];


const Feedback = () => {
  const navigate = useNavigate();
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState(1);
  
  // Sample data for mini tabs
  const [skillsTabData, setSkillsTabData] = useState([
    {
      id: 1,
      category: "Mandatory skills",
      skillsList: [
        { name: "Technical Skills", rating: 4, note: "", notesBool: false, required: true, error: false },
        { name: "Communication", rating: 3, note: "", notesBool: false, required: true, error: false },
      ],
    },
  ]);
  
  const [overallImpressionTabData, setOverallImpressionTabData] = useState({
    rating: 4,
    note: "Good candidate overall",
    recommendation: "hire",
    notesBool: false,
    required: true,
    error: false
  });


  useEffect(() => {
    // Dummy data for testing - replacing API calls
    const dummyFeedbacks = [
      { _id: 1, interview: "John Doe", interviewType: "Technical", scheduledDate: "2025-08-01", status: "Active", feedback: "Good performance" },
      { _id: 2, interview: "Jane Smith", interviewType: "HR", scheduledDate: "2025-08-02", status: "Inactive", feedback: "Needs improvement" },
      { _id: 3, interview: "Mike Johnson", interviewType: "Behavioral", scheduledDate: "2025-08-03", status: "Active", feedback: "Excellent communication" },
      { _id: 4, interview: "Sarah Williams", interviewType: "Technical", scheduledDate: "2025-08-04", status: "Other", feedback: "Average skills" },
      { _id: 5, interview: "Robert Brown", interviewType: "HR", scheduledDate: "2025-08-05", status: "Active", feedback: "Positive attitude" },
      { _id: 6, interview: "Emily Davis", interviewType: "Behavioral", scheduledDate: "2025-08-06", status: "Inactive", feedback: "Lacks confidence" },
      { _id: 7, interview: "William Wilson", interviewType: "Technical", scheduledDate: "2025-08-07", status: "Other", feedback: "Good problem-solving" },
      { _id: 8, interview: "Lisa Anderson", interviewType: "HR", scheduledDate: "2025-08-08", status: "Active", feedback: "Team player" },
      { _id: 9, interview: "James Taylor", interviewType: "Behavioral", scheduledDate: "2025-08-09", status: "Inactive", feedback: "Needs better time management" },
      { _id: 10, interview: "Emma Martinez", interviewType: "Technical", scheduledDate: "2025-08-10", status: "Active", feedback: "Quick learner" },
      { _id: 11, interview: "David Thompson", interviewType: "HR", scheduledDate: "2025-08-11", status: "Other", feedback: "Good leadership potential" },
      { _id: 12, interview: "Olivia Garcia", interviewType: "Behavioral", scheduledDate: "2025-08-12", status: "Active", feedback: "Strong analytical skills" }
    ];
    setFeedbacks(dummyFeedbacks);
    setFilteredFeedbacks(dummyFeedbacks);
    setLoading(false);
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
    // navigate(`/feedback/${feedback._id}`, {
    //   state: { feedback: feedback }
    // });
    setSelectedFeedback(feedback);
    setShowFeedbackModal(true);
    setActiveTab(1);
  };

  const handleEdit = (feedback) => {
    navigate(`/feedback/edit/${feedback._id}`, {
      state: { feedback: feedback }
    });
  };

  const handleAddFeedback = () => {
    navigate('/dashboard/feedbacks/add');
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
      key: 'interview',
      header: 'Interview',
      render: (value) => (
        <div className="text-sm">{value || "Not Provided"}</div>
      ),
    },
    {
      key: 'interviewType',
      header: 'Interview Type',
      render: (value) => (
        <div className="text-sm">{value || "Not Provided"}</div>
      ),
    },
    {
      key: 'scheduledDate',
      header: 'Scheduled Date',
      render: (value) => (
        <div className="text-sm">{value || "Not Provided"}</div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <StatusBadge status={value} text={value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not Provided"}/>
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
      key: 'edit',
      label: 'Edit',
      icon: <Pencil className="w-4 h-4 text-custom-blue" />,
      onClick: handleEdit,
    },
  ];


  // Modal helper functions
  const displayData = () => {
    const roundDetails = { questions: [] }; // Sample round details
    const interviewDetails = selectedFeedback ? {
      Candidate: selectedFeedback.interview,
      Position: "Software Developer",
      _id: selectedFeedback._id
    } : {};
    
    switch (activeTab) {
      case 1: 
        return <CandidateMiniTab 
          roundDetails={roundDetails} 
          interviewDetails={interviewDetails} 
          skillsTabData={skillsTabData} 
          tab={true} 
          page="Popup"
        />;
      case 2: 
        return <InterviewsMiniTabComponent 
          roundDetails={roundDetails} 
          tab={true} 
          page="Popup" 
          closePopup={() => setShowFeedbackModal(false)}
        />;
      case 3: 
        return <SkillsTabComponent 
          setSkillsTabData={setSkillsTabData} 
          skillsTabData={skillsTabData} 
          tab={true} 
          page="Popup"
        />;
      case 4: 
        return <OverallImpressions 
          overallImpressionTabData={overallImpressionTabData} 
          setOverallImpressionTabData={setOverallImpressionTabData} 
          tab={true} 
          page="Popup"
        />;
      default: 
        return null;
    }
  };

  const ReturnTabsSection = () => {
    return (
      <ul className="flex items-center gap-8 cursor-pointer py-1 px-8 border-b">
        {tabsList.map((EachTab) => (
          <li
            style={{
              borderBottom: activeTab === EachTab.id ? "2px solid #227a8a" : "",
            }}
            onClick={() => setActiveTab(EachTab.id)}
            key={EachTab.id}
            className="pb-2"
          >
            {EachTab.tab}
          </li>
        ))}
      </ul>
    );
  };


  if (loading) return <div className="text-center p-6">Loading...</div>;
  //if (error) return <div className="text-center p-6 text-red-500">{error}</div>;

  return (
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
   
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white  w-[100%] max-w-4xl h-[100%] flex flex-col">
            {/* Modal Header */}
            <div className="px-8 flex items-center justify-between py-4 ">
              <h1 className="text-xl font-semibold text-[#227a8a]">Interview Feedback</h1>
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <IoMdClose size={24} />
              </button>
            </div>
            
            {/* Tabs Section */}
            <ReturnTabsSection />
            
            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto border-2 border-gray-200 border-solid rounded-md mx-8 mb-8 mt-4">
              {displayData()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Feedback;
