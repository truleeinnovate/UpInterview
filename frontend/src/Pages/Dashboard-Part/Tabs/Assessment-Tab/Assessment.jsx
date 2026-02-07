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
// v1.0.8  -  Ashok   -  disabled column and actions for standard type templates
// v1.0.9  -  Ashok   -  added common code for empty state messages and fixed style issues
// v2.0.0  -  Ashok   -  fixed filter container scroll issue

import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import { Eye, Pencil, Plus, Trash } from "lucide-react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import ShareAssessment from "./ShareAssessment.jsx";
import { useNavigate } from "react-router-dom";

import "react-toastify/dist/ReactToastify.css";
import Header from "../../../../Components/Shared/Header/Header.jsx";
// import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import AssessmentKanban from "./AssessmentKanban.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useAssessments } from "../../../../apiHooks/useAssessments.js";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { usePositions } from "../../../../apiHooks/usePositions";
import { formatDateTime } from "../../../../utils/dateFormatter";
import DeleteConfirmModal from "../CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../../../services/toastService.js";
import Toolbar from "./AssessmentToolbar.jsx";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";
import {
  getAssessmentTemplateColumns,
  getAssessmentTemplateActions,
} from "../../../../utils/tableColumnAndActionData.jsx";

const ConfirmationDialog = ({ open, onClose, onConfirm, title, message }) => (
  <Dialog
    open={open}
    onClose={onClose}
    maxWidth="sm"
    fullWidth
    PaperProps={{
      style: {
        width: "400px",
        maxWidth: "90vw",
        margin: "16px",
      },
    }}
  >
    <DialogTitle sx={{ pb: 1, fontSize: "1.1rem" }}>{title}</DialogTitle>
    <DialogContent sx={{ py: 1 }}>
      <div style={{ fontSize: "0.95rem" }}>{message}</div>
    </DialogContent>
    <DialogActions sx={{ px: 3, py: 2 }}>
      <Button
        onClick={onClose}
        color="gray"
        variant="outlined"
        size="small"
        sx={{
          color: "gray",
          borderColor: "gray",
          "&:hover": {
            borderColor: "gray",
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        color="error"
        variant="contained"
        size="small"
        sx={{ ml: 1 }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const Assessment = () => {
  // All hooks at the top
  const { effectivePermissions, isInitialized } = usePermissions();
  // <---------------------- v1.0.2

  // <---------------------- v1.0.2 >
  const { positionData } = usePositions();
  const navigate = useNavigate();
  const [assessmentSections, setAssessmentSections] = useState({});
  const [viewMode, setViewMode] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  // const [activeTab, setActiveTab] = useState("standard");
  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem("assessmentActiveTab");
    return savedTab || "standard";
  });
  const [selectedFilters, setSelectedFilters] = useState({
    difficultyLevel: [],
    duration: [],
    position: [],
    // sections: { min: "", max: "" },
    // questions: { min: "", max: "" },
    totalScore: { min: "", max: "" },
    createdDate: "", // '', 'last7', 'last30', 'last90'
  });

  const [isShareOpen, setIsShareOpen] = useState(false);
  const filterIconRef = useRef(null);
  // <---------------------- v1.0.3
  const sectionsFetchedRef = useRef(false);
  // ------------------------------ v1.0.3 >
  // <---------------------- v1.0.0
  const [isDifficultyOpen, setIsDifficultyOpen] = useState(false);
  const [isDurationOpen, setIsDurationOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isSectionsOpen, setIsSectionsOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [isTotalScoreOpen, setIsTotalScoreOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState([]);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [sectionsRange, setSectionsRange] = useState({ min: "", max: "" });
  const [questionsRange, setQuestionsRange] = useState({ min: "", max: "" });
  const [totalScoreRange, setTotalScoreRange] = useState({ min: "", max: "" });
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteAssessmentTemplate, setDeleteAssessmentTemplate] =
    useState(null);

  const [selectedOption, setSelectedOption] = useState(null);

  const {
    assessmentData,
    customCount,
    standardCount,
    // totalCount,
    totalPages,
    isLoading,
    fetchAssessmentQuestions,
    deleteAssessment,
    useAssessmentList,
    createAssessmentTemplateList,
  } = useAssessments({
    search: searchQuery, // ← Must match backend param name
    difficultyLevel: selectedFilters.difficultyLevel,
    duration: selectedFilters.duration,
    position: selectedFilters.position,
    totalScore: selectedFilters.totalScore,
    createdDate: selectedFilters.createdDate,
    type: activeTab,
    page: currentPage,
    limit: 10,
    selectedOptionId: selectedOption?._id || null,
  });

  const totalCount = assessmentData?.length || 0;

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

  // useEffect(() => {
  //   if (activeTab === "standard") {
  //     console.log("Clearing selected option for standard tab");
  //   } else {
  //     console.log("Retaining selected option for custom tab");
  //   }
  // }, [activeTab, assessmentData]);

  useEffect(() => {
    localStorage.setItem("assessmentActiveTab", activeTab);
  }, [activeTab]);

  // Sync filter states when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedDifficulty(selectedFilters.difficultyLevel);
      setSelectedDuration(selectedFilters.duration);
      setSelectedPositions(selectedFilters.position);
      setSectionsRange(selectedFilters.sections);
      setQuestionsRange(selectedFilters.questions);
      setTotalScoreRange(selectedFilters.totalScore);
      setCreatedDatePreset(selectedFilters.createdDate);
      // Reset all open states
      setIsDifficultyOpen(false);
      setIsDurationOpen(false);
      setIsPositionOpen(false);
      setIsSectionsOpen(false);
      setIsQuestionsOpen(false);
      setIsTotalScoreOpen(false);
      setIsCreatedDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

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
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(0);
  };

  // const handleSearchInputChange = (e) => {
  //   console.log("Search input changed:", e.target.value);
  //   setFilters((prev) => ({ ...prev, search: e.target.value, page: 0 }));
  // };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setIsFilterActive(
      filters.difficultyLevel.length > 0 ||
      filters.duration.length > 0 ||
      filters.position.length > 0 ||
      // filters.sections.min !== "" ||
      // filters.sections.max !== "" ||
      // filters.questions.min !== "" ||
      // filters.questions.max !== "" ||
      filters.totalScore.min !== "" ||
      filters.totalScore.max !== "" ||
      filters.createdDate !== ""
    );
    setCurrentPage(0);
    setFilterPopupOpen(false);
  };

  // const handleFilterChange = (newFilters) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     ...newFilters,
  //     page: 0,
  //   }));
  // };

  const handleClearFilters = () => {
    const clearedFilters = {
      difficultyLevel: [],
      duration: [],
      position: [],
      // sections: { min: "", max: "" },
      // questions: { min: "", max: "" },
      totalScore: { min: "", max: "" },
      createdDate: "",
    };
    setSelectedFilters(clearedFilters);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
    setIsDifficultyOpen(false);
    setIsDurationOpen(false);
    setIsPositionOpen(false);
    setIsSectionsOpen(false);
    setIsQuestionsOpen(false);
    setIsTotalScoreOpen(false);
    setIsCreatedDateOpen(false);
    setSelectedDifficulty([]);
    setSelectedDuration([]);
    setSelectedPositions([]);
    setSectionsRange({ min: "", max: "" });
    setQuestionsRange({ min: "", max: "" });
    setTotalScoreRange({ min: "", max: "" });
    setCreatedDatePreset("");
  };

  const handleFilterIconClick = () => {
    // if (assessmentData?.length !== 0) {
    setFilterPopupOpen((prev) => !prev);
    // }
  };

  // Helper function to normalize spaces for better search
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  const currentFilteredRows = assessmentData || [];

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

  // const nextPage = () => {
  //   if (filters.page < totalPages - 1) {
  //     setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
  //   }
  // };

  // const prevPage = () => {
  //   if (filters.page > 0) {
  //     setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
  //   }
  // };

  const handleView = (assessment) => {
    if (effectivePermissions.AssessmentTemplates?.View) {
      navigate(`/assessment-template-details/${assessment?._id}`);
      // navigate(`/assessment-template-details/${assessment?._id}`);
    }
  };

  const handleEdit = (assessment) => {
    if (effectivePermissions.AssessmentTemplates?.Edit) {
      navigate(`/assessment-templates/edit/${assessment?._id}`);
    }
  };
  // <---------------------- v1.0.1 >

  const handleShareClick = (assessment) => {
    if ((assessmentSections[assessment._id] ?? 0) > 0) {
      // <---------------------- v1.0.0
      setIsShareOpen(assessment);
    } else if ((assessmentSections[assessment._id] ?? 0) === 0) {
      notify.error("No questions added to this assessment.");
    }
  };

  const handleCloseShare = () => {
    setIsShareOpen(false);
  };

  const handleDelete = async (assessment) => {
    // if (effectivePermissions.assessment?.Delete) {  // have to check beause this is mandtoary or not ?
    setDeleteAssessmentTemplate(assessment);
    setShowDeleteConfirmModal(true);
    // navigate(`/interviews/${interview._id}/delete`);
    // }

    // if (window.confirm(`Are you sure you want to delete "${assessment.assessmentName}"? This action cannot be undone.`)) {
    //   try {
    //     await deleteAssessment.mutateAsync(assessment._id);
    //     toast.success('Assessment deleted successfully');
    //   } catch (error) {
    //     console.error('Error deleting assessment:', error);
    //     toast.error('Failed to delete assessment');
    //   }
    // }
  };

  // Your existing handleConfirmDelete function
  // const handleConfirmDelete = async () => {
  //  try {
  //       await deleteAssessment.mutateAsync(deleteAssessmentTemplate._id);
  //       setDeleteAssessmentTemplate(null)
  //     setShowDeleteConfirmModal(false);
  //       notify.success('Assessment deleted successfully');
  //     } catch (error) {
  //       setDeleteAssessmentTemplate(null)
  //     setShowDeleteConfirmModal(false);
  //       console.error('Error deleting assessment:', error);
  //       notify.error('Failed to delete assessment');
  //     }
  // };

  // <---------------------- v1.0.0
  // <---------------------- v1.0.1

  // v1.0.5 <------------------------------------------------------------
  const difficultyOptions = ["Easy", "Medium", "Hard"];
  // const durationOptions = ["30 minutes", "60 minutes"];
  const durationOptions = [
    "30 Minutes",
    "45 Minutes",
    "60 Minutes",
    "90 Minutes",
  ];
  // v1.0.5 ------------------------------------------------------------>

  const handleDifficultyToggle = (option) => {
    setSelectedDifficulty((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  // const handleShareClick = (assessment) => {
  //     if ((assessmentSections[assessment._id] ?? 0) > 0) {
  //         // <---------------------- v1.0.0
  //         setIsShareOpen(assessment);
  //     } else if ((assessmentSections[assessment._id] ?? 0) === 0) {
  //         toast.error("No questions added to this assessment.");
  //     }
  // };

  const handlePositionToggle = (positionId) => {
    setSelectedPositions((prev) =>
      prev.includes(positionId)
        ? prev.filter((p) => p !== positionId)
        : [...prev, positionId]
    );
  };

  const handleRangeChange = (e, type, setter) => {
    const value =
      e.target.value === "" ? "" : Math.max(0, Number(e.target.value) || "");
    setter((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApplyFilters = () => {
    handleFilterChange({
      difficultyLevel: selectedDifficulty,
      duration: selectedDuration,
      position: selectedPositions,
      // sections: sectionsRange,
      // questions: questionsRange,
      totalScore: totalScoreRange,
      createdDate: createdDatePreset,
    });
  };

  // const handleCloseShare = () => {
  //     setIsShareOpen(false);
  // };

  // const handleDeleteClick = (assessment) => {
  //     setAssessmentToDelete(assessment);
  //     setDeleteDialogOpen(true);
  // };

  const handleConfirmDelete = async () => {
    if (assessmentToDelete) {
      try {
        await deleteAssessment.mutateAsync(assessmentToDelete._id);
        notify.success("Assessment deleted successfully");
      } catch (error) {
        console.error("Error deleting assessment:", error);
      } finally {
        setDeleteDialogOpen(false);
        setAssessmentToDelete(null);
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setAssessmentToDelete(null);
  };

  // --- Dynamic Empty State Messages using Utility ---
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  // Use assessmentData.length as the initial total count
  const initialDataCount = assessmentData?.length || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Assessment Templates" // Entity Name
  );
  // --- Dynamic Empty State Messages using Utility ---

  const tableColumns = getAssessmentTemplateColumns(navigate, {
    assessmentSections,
    activeTab,
  });

  const tableActions = getAssessmentTemplateActions(navigate, {
    permissions: effectivePermissions.AssessmentTemplates,
    assessmentSections,
    callbacks: {
      onDelete: handleDelete,
      onShare: handleShareClick,
    },
  });
  // <---------------------- v1.0.0
  // <---------------------- v1.0.1

  const handleDurationToggle = (option) => {
    setSelectedDuration((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Assessment Templates"
              onAddClick={() => navigate("/assessment-templates/new")}
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
              totalPages={totalPages || 1}
              customCount={customCount}
              standardCount={standardCount}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              // onPrevPage={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
              // onNextPage={() => setCurrentPage((prev) => prev + 1 )}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={assessmentData?.length}
              searchPlaceholder="Search by Assessments..."
              filterIconRef={filterIconRef}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              setSelectedOption={setSelectedOption}
              totalCount={totalCount}
              useAssessmentList={useAssessmentList}
              createAssessmentTemplateList={createAssessmentTemplateList}
            />
          </div>
        </main>
      </div>
      {/* v1.0.7 <----------------------------------------------------------------------------------- */}
      <main className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={isLoading}
                  // <-------------------------------v1.0.4
                  emptyState={emptyStateMessage}
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
              <div className="space-y-3 pr-2">
                {/* Difficulty Level Filter */}
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

                {/* Sections Range Filter */}
                {/* <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsSectionsOpen(!isSectionsOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Number of Sections
                    </span>
                    {isSectionsOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isSectionsOpen && (
                    <div className="mt-2 pl-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={sectionsRange.min}
                          onChange={(e) =>
                            handleRangeChange(e, "min", setSectionsRange)
                          }
                          placeholder="Min"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="number"
                          value={sectionsRange.max}
                          onChange={(e) =>
                            handleRangeChange(e, "max", setSectionsRange)
                          }
                          placeholder="Max"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                Questions Range Filter 
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Number of Questions
                    </span>
                    {isQuestionsOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isQuestionsOpen && (
                    <div className="mt-2 pl-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={questionsRange.min}
                          onChange={(e) =>
                            handleRangeChange(e, "min", setQuestionsRange)
                          }
                          placeholder="Min"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="number"
                          value={questionsRange.max}
                          onChange={(e) =>
                            handleRangeChange(e, "max", setQuestionsRange)
                          }
                          placeholder="Max"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div> */}

                {/* Total Score Range Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsTotalScoreOpen(!isTotalScoreOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Total Score
                    </span>
                    {isTotalScoreOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isTotalScoreOpen && (
                    <div className="mt-2 pl-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={totalScoreRange.min}
                          onChange={(e) =>
                            handleRangeChange(e, "min", setTotalScoreRange)
                          }
                          placeholder="Min"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                        <span className="text-sm">to</span>
                        <input
                          type="number"
                          value={totalScoreRange.max}
                          onChange={(e) =>
                            handleRangeChange(e, "max", setTotalScoreRange)
                          }
                          placeholder="Max"
                          className="w-20 p-1 border rounded"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Position Filter */}
                {(() => {
                  // Get unique position IDs from assessment data
                  const uniquePositionIds = [
                    ...new Set(
                      assessmentData?.map((a) => a.Position).filter(Boolean) ||
                      []
                    ),
                  ];

                  // Map position IDs to position objects with names
                  const positions = uniquePositionIds
                    .map((posId) => positionData?.find((p) => p._id === posId))
                    .filter(Boolean)
                    .sort((a, b) =>
                      (a.title || "").localeCompare(b.title || "")
                    );

                  return positions.length > 0 ? (
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsPositionOpen(!isPositionOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Position
                        </span>
                        {isPositionOpen ? (
                          <MdKeyboardArrowUp className="text-xl text-gray-700" />
                        ) : (
                          <MdKeyboardArrowDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isPositionOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {positions.map((position) => (
                            <label
                              key={position._id}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedPositions.includes(
                                  position._id
                                )}
                                onChange={() =>
                                  handlePositionToggle(position._id)
                                }
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">
                                {position.title?.charAt(0).toUpperCase() +
                                  position.title?.slice(1) || "Unknown"}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Created Date Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedDateOpen(!isCreatedDateOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Created Date
                    </span>
                    {isCreatedDateOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isCreatedDateOpen && (
                    <div className="mt-2 pl-3 space-y-1">
                      {[
                        { value: "", label: "Any time" },
                        { value: "last7", label: "Last 7 days" },
                        { value: "last30", label: "Last 30 days" },
                        { value: "last90", label: "Last 90 days" },
                      ].map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={createdDatePreset === option.value}
                            onChange={(e) =>
                              setCreatedDatePreset(e.target.value)
                            }
                            className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option.label}</span>
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

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Confirm Deletion"
        message={`Are you sure you want to delete "${assessmentToDelete?.AssessmentTitle}"? This action cannot be undone.`}
      />

      {/* v1.0.7 -----------------------------------------------------------------------------------> */}
      {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={handleCloseShare}
          assessment={isShareOpen}
        />
      )}

      {/* Ranjith added deleetd functionality  */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleConfirmDelete}
        title="Assessment Template"
        entityName={deleteAssessmentTemplate?.AssessmentTitle}
      />
    </div>
  );
};

export default Assessment;
