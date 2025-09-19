// v1.0.0  -  Ashraf  -  assessment template id not getting issues
// v1.0.1  -  Ashraf  -  AssessmentTemplates permission name changed to AssessmentTemplates
// v1.0.2  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code)
// v1.0.3  -  Ashraf  -  assessment sections and question api getting in loop issue
// v1.0.4  -  Ashraf  -  assessment to assessment templates
/* v1.0.5  -  Ashok   -  fixed previously filter by duration not working and in the table 
                         create new assessment popup has z-index issues 
*/
// v1.0.6  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.7  -  Ashok   -  improved responsiveness

import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import { Eye, Pencil, Plus } from "lucide-react";
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
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { usePermissions } from "../../../../Context/PermissionsContext";

const Assessment = () => {
  // All hooks at the top
  const { effectivePermissions, isInitialized } = usePermissions();
  // <---------------------- v1.0.2
  const { assessmentData, isLoading, fetchAssessmentQuestions } =
    useAssessments();
  // <---------------------- v1.0.2 >
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
  // <---------------------- v1.0.3
  const sectionsFetchedRef = useRef(false);
  // ------------------------------ v1.0.3 >
  // <---------------------- v1.0.0
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState([]);
  // <---------------------- v1.0.0
  useEffect(() => {
    document.title = "Assessment Template";
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Only run if assessmentData is loaded and not empty
    // <---------------------- v1.0.0
    if (!assessmentData || assessmentData.length === 0) return;

    // ------------------------------ v1.0.3 >
    // Prevent running if we already have sections data for all assessments
    const hasAllSections = assessmentData.every((assessment) =>
      assessmentSections.hasOwnProperty(assessment._id)
    );
    if (hasAllSections) {
      sectionsFetchedRef.current = true;
      return;
    }

    // Prevent multiple simultaneous fetches
    if (sectionsFetchedRef.current) return;
    sectionsFetchedRef.current = true;
    // ------------------------------ v1.0.3 >

    const fetchSectionsInBatches = async () => {
      const batchSize = 5; // Process 5 assessments at a time
      const sectionsCache = {};

      for (let i = 0; i < assessmentData.length; i += batchSize) {
        const batch = assessmentData.slice(i, i + batchSize);

        try {
          const batchPromises = batch.map(async (assessment) => {
            // ------------------------------ v1.0.3 >
            // Skip if we already have sections for this assessment
            if (assessmentSections.hasOwnProperty(assessment._id)) {
              return {
                id: assessment._id,
                sections: assessmentSections[assessment._id],
              };
            }
            // ------------------------------ v1.0.3 >
            const { data, error } = await fetchAssessmentQuestions(
              assessment._id
            );

            let sections = 0;
            if (!error && data && data.sections) {
              sections = data.sections.length || 0;
            }

            return { id: assessment._id, sections };
          });

          const batchResults = await Promise.all(batchPromises);

          // Update state incrementally
          batchResults.forEach((result) => {
            sectionsCache[result.id] = result.sections;
          });

          setAssessmentSections((prev) => ({ ...prev, ...sectionsCache }));

          // Small delay between batches to prevent overwhelming the server
          if (i + batchSize < assessmentData.length) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error("Error fetching sections batch:", error);
        }
      }
    };

    fetchSectionsInBatches();
  }, [assessmentData]);
  // <---------------------- v1.0.2 >

  // Only after all hooks
  if (!isInitialized) {
    return null;
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setIsFilterActive(
      filters.difficultyLevel.length > 0 || filters.duration.length > 0
    );
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedFilters({ difficultyLevel: [], duration: [] });
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
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
  // <---------------------- v1.0.0
  const rowsPerPage = 10;

  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  // <---------------------- v1.0.0
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

  // <---------------------- v1.0.0
  // <---------------------- v1.0.1
  const handleView = (assessment) => {
    if (effectivePermissions.AssessmentTemplates?.View) {
      navigate(`/assessments-template-details/${assessment._id}`);
    }
  };

  const handleEdit = (assessment) => {
    if (effectivePermissions.AssessmentTemplates?.Edit) {
      navigate(`/assessments-template/edit/${assessment._id}`);
    }
  };
  // <---------------------- v1.0.1 >

  const handleShareClick = (assessment) => {
    if ((assessmentSections[assessment._id] ?? 0) > 0) {
      // <---------------------- v1.0.0
      setIsShareOpen(assessment);
    } else if ((assessmentSections[assessment._id] ?? 0) === 0) {
      toast.error("No questions added to this assessment.");
    }
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  const tableColumns = [
    {
      key: "AssessmentCode",
      header: "Assessment Template ID",
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
      key: "AssessmentTitle",
      header: "Assessment Template Name",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {value.charAt(0).toUpperCase() + value.slice(1) || "Not Provided"}
        </div>
      ),
    },
    {
      key: "sections",
      header: "No. of Sections",
      render: (value, row) => assessmentSections[row._id] ?? 0,
    },
    {
      key: "NumberOfQuestions",
      header: "No. of Questions",
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
        row.passScore
          ? `${row.passScore} ${
              row.passScoreType === "Percentage" ? "%" : "Number"
            }`
          : "Not Provided",
    },
    {
      key: "Duration",
      header: "Duration",
      render: (value) => value || "Not Provided",
    },
  ];
  // <---------------------- v1.0.0
  // <---------------------- v1.0.1
  const tableActions = [
    ...(effectivePermissions.AssessmentTemplates?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: handleView,
          },
        ]
      : []),
    ...(effectivePermissions.AssessmentTemplates?.Edit
      ? // <---------------------- v1.0.0
        // <---------------------- v1.0.1
        [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-custom-blue" />,
            onClick: handleEdit,
          },
        ]
      : []),
    {
      key: "share",
      label: "Create Assessment",
      icon: <Plus className="w-4 h-4 text-custom-blue" />,
      onClick: handleShareClick,
      disabled: (row) => (assessmentSections[row._id] ?? 0) === 0,
    },
  ];
// v1.0.5 <------------------------------------------------------------
  const difficultyOptions = ["Easy", "Medium", "Hard"];
  // const durationOptions = ["30 minutes", "60 minutes"];
  const durationOptions = ["30 Minutes", "60 Minutes"];
// v1.0.5 ------------------------------------------------------------>

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
              onAddClick={() => navigate("/assessments-template/new")}
              addButtonText="New Template"
              // <---------------------- v1.0.1
              canCreate={effectivePermissions.AssessmentTemplates?.Create}
              // <---------------------- v1.0.1 >
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
              searchPlaceholder="Search by Assessments..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      {/* v1.0.7 <----------------------------------------------------------------------------------- */}
      <main className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              <div className="overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
              <TableView
                data={currentFilteredRows}
                columns={tableColumns}
                actions={tableActions}
                loading={isLoading}
                // <-------------------------------v1.0.4
                emptyState="No assessments templates found."
                // ------------------------------v1.0.4 >
                className="table-fixed w-full"
              />
              </div>
            ) : (
              <AssessmentKanban
                assessments={currentFilteredRows}
                loading={isLoading}
                onView={handleView}
                onEdit={handleEdit}
                onShare={handleShareClick}
                assessmentSections={assessmentSections}
                effectivePermissions={effectivePermissions}
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
                    onClick={() => setIsDifficultyOpen(!isDifficultyOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Difficulty Level
                    </span>
                    {isDifficultyOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isDifficultyOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {difficultyOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDifficulty.includes(option)}
                            onChange={() => handleDifficultyToggle(option)}
                            // v1.0.6 <------------------------------------------------------------
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            // v1.0.6 ------------------------------------------------------------>
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
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
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDuration.includes(option)}
                            onChange={() => handleDurationToggle(option)}
                            // v1.0.6 <------------------------------------------------------------
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            // v1.0.6 ------------------------------------------------------------>
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
      {/* v1.0.7 -----------------------------------------------------------------------------------> */}
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
