import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import { Eye, Pencil, Share2 } from "lucide-react";
import ShareAssessment from "./ShareAssessment.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import AssessmentKanban from "./AssessmentKanban.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { config } from "../../../../config.js";
import { useAssessments } from '../../../../apiHooks/useAssessments.js';

const Assessment = () => {
const { assessmentData, isLoading } = useAssessments();
  
  const navigate = useNavigate();
  const [assessmentSections, setAssessmentSections] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    difficultyLevel: [],
    duration: [],
  });
  const [isShareOpen, setIsShareOpen] = useState(false);
  const filterIconRef = useRef(null);

  // Fetch sections for current page's assessments
  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentAssessments = assessmentData?.slice(startIndex, endIndex) || [];

  useEffect(() => {
    document.title = "Assessment Tab";
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (currentAssessments.length > 0) {
      const fetchSections = async () => {
        try {
          const sectionPromises = currentAssessments.map(async (assessment) => {
            const response = await axios.get(
              `${config.REACT_APP_API_URL}/assessment-questions/list/${assessment._id}`
            );
            const sections = response.data.exists === false
              ? 0
              : response.data.data?.sections?.length || 0;
            return { id: assessment._id, sections };
          });
          const results = await Promise.all(sectionPromises);
          const newSections = results.reduce((acc, curr) => {
            acc[curr.id] = curr.sections;
            return acc;
          }, {});
          setAssessmentSections((prev) => ({ ...prev, ...newSections }));
        } catch (error) {
          console.error("Error fetching sections:", error);
        }
      };
      fetchSections();
    }
  }, [currentAssessments]);

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setIsFilterActive(filters.difficultyLevel.length > 0 || filters.duration.length > 0);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedFilters({ difficultyLevel: [], duration: [] });
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
    // Reset filter popup UI state
    setIsDifficultyOpen(false);
    setIsDurationOpen(false);
    setSelectedDifficulty([]);
    setSelectedDuration([]);
  };

  const handleFilterIconClick = () => {
    if (assessmentData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(assessmentData)) return [];
    return assessmentData.filter((assessment) => {
      const fieldsToSearch = [
        assessment?.AssessmentTitle,
        assessment?.Position,
      ].filter(Boolean);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      const matchesDifficultyLevel =
        selectedFilters.difficultyLevel.length === 0 ||
        selectedFilters.difficultyLevel.includes(assessment?.DifficultyLevel);

      const matchesDuration =
        selectedFilters.duration.length === 0 ||
        selectedFilters.duration.includes(assessment?.Duration);

      return matchesSearchQuery && matchesDifficultyLevel && matchesDuration;
    });
  };

  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
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

  const handleView = (assessment) => {
    navigate(`/assessment-details/${assessment._id}`);
  };

  const handleEdit = (assessment) => {
    navigate(`/assessment/edit/${assessment._id}`);
  };

  const handleShareClick = async (assessment) => {
    if ((assessmentSections[assessment._id] ?? 0) === 0) {
      toast.error("No questions added to this assessment.");
      return;
    }
    setIsShareOpen(assessment);
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  const tableColumns = [
    {
      key: "AssessmentTitle",
      header: "Assessment Name",
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
      key: "sections",
      header: "No.of Sections",
      render: (value, row) => assessmentSections[row._id] ?? 0,
    },
    {
      key: "NumberOfQuestions",
      header: "No.of Questions",
      render: (value) => value || "Not Provided",
    },
    {
      key: "DifficultyLevel",
      header: "Difficulty Level",
      render: (value) => value || "Not Provided",
    },
    {
      key: "totalScore",
      header: "Total Score",
      render: (value) => value || "Not Provided",
    },
    {
      key: "passScore",
      header: "Pass Score (Number / %)",
      render: (value, row) =>
row.passScore ? `${row.passScore} ${row.passScoreType === "Percentage" ? "%" : "Number"}` : "Not Provided"

    },
    {
      key: "Duration",
      header: "Duration",
      render: (value) => value || "Not Provided",
    },
  ];

  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: handleView,
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: handleEdit,
    },
    {
      key: "share",
      label: "Share",
      icon: <Share2 className="w-4 h-4 text-green-600" />,
      onClick: handleShareClick,
      disabled: (row) => (assessmentSections[row._id] ?? 0) === 0,
    },
  ];

  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState([]);

  const difficultyOptions = ["Easy", "Medium", "Hard"];
  const durationOptions = ["30 minutes", "60 minutes"];

  const handleDifficultyToggle = (option) => {
    setSelectedDifficulty((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleDurationToggle = (option) => {
    setSelectedDuration((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleApplyFilters = () => {
    handleFilterChange({
      difficultyLevel: selectedDifficulty,
      duration: selectedDuration,
    });
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Assessment Templates"
              onAddClick={() => navigate("/assessment/new")}
              addButtonText="New Template"
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
              dataLength={assessmentData?.length}
              searchPlaceholder="Search by Assessment Title, Position..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              <>
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={isLoading}
                  emptyState="No assessments found."
                  className="table-fixed w-full"
                />
              </>
            ) : (
              <>
                <AssessmentKanban
                  assessments={currentFilteredRows}
                  loading={isLoading}
                  onView={handleView}
                  onEdit={handleEdit}
                  onShare={handleShareClick}
                  assessmentSections={assessmentSections}
                />
              </>
            )}

            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearFilters}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3">
                {/* Difficulty Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                  >
                    <span className="font-medium text-gray-700">Difficulty Level</span>
                    {isDifficultyOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isDifficultyOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {difficultyOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedDifficulty.includes(option)}
                            onChange={() => handleDifficultyToggle(option)}
                            className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsDurationOpen(!isDurationOpen)}
                  >
                    <span className="font-medium text-gray-700">Duration</span>
                    {isDurationOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isDurationOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {durationOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedDuration.includes(option)}
                            onChange={() => handleDurationToggle(option)}
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
      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessment={isShareOpen}
        />
      )}
    </div>
  );
};

export default Assessment;