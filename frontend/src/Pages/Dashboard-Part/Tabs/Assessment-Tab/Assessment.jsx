import { useState, useRef, useEffect } from "react";
import "../../../../index.css";
import "../styles/tabs.scss";
import { motion } from "framer-motion";
import { Eye, Pencil, Plus, Trash } from "lucide-react";
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
import { usePositions } from "../../../../apiHooks/usePositions";
import { formatDateTime } from "../../../../utils/dateFormatter";

const ConfirmDeletePopup = ({ isOpen, onClose, onConfirm, assessmentName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Confirm Deletion
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                    Are you sure you want to delete the assessment template "
                    <span className="font-medium">{assessmentName}</span>"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

const Assessment = () => {
    const { effectivePermissions, isInitialized } = usePermissions();
    const { assessmentData, isLoading, fetchAssessmentQuestions, deleteAssessment } =
        useAssessments();
    const { positionData } = usePositions();
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
        position: [],
        sections: { min: "", max: "" },
        questions: { min: "", max: "" },
        totalScore: { min: "", max: "" },
        createdDate: "",
    });
    const [isShareOpen, setIsShareOpen] = useState(false);
    const filterIconRef = useRef(null);
    const sectionsFetchedRef = useRef(false);
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
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);
    const [assessmentToDelete, setAssessmentToDelete] = useState(null);

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
        if (isFilterPopupOpen) {
            setSelectedDifficulty(selectedFilters.difficultyLevel);
            setSelectedDuration(selectedFilters.duration);
            setSelectedPositions(selectedFilters.position);
            setSectionsRange(selectedFilters.sections);
            setQuestionsRange(selectedFilters.questions);
            setTotalScoreRange(selectedFilters.totalScore);
            setCreatedDatePreset(selectedFilters.createdDate);
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
        if (!assessmentData || assessmentData.length === 0) return;

        const hasAllSections = assessmentData.every((assessment) =>
            assessmentSections.hasOwnProperty(assessment._id)
        );
        if (hasAllSections) {
            sectionsFetchedRef.current = true;
            return;
        }

        if (sectionsFetchedRef.current) return;
        sectionsFetchedRef.current = true;

        const fetchSectionsInBatches = async () => {
            const batchSize = 5;
            const sectionsCache = {};

            for (let i = 0; i < assessmentData.length; i += batchSize) {
                const batch = assessmentData.slice(i, i + batchSize);

                try {
                    const batchPromises = batch.map(async (assessment) => {
                        if (assessmentSections.hasOwnProperty(assessment._id)) {
                            return {
                                id: assessment._id,
                                sections: assessmentSections[assessment._id],
                            };
                        }
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

                    batchResults.forEach((result) => {
                        sectionsCache[result.id] = result.sections;
                    });

                    setAssessmentSections((prev) => ({ ...prev, ...sectionsCache }));

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
            filters.difficultyLevel.length > 0 ||
            filters.duration.length > 0 ||
            filters.position.length > 0 ||
            filters.sections.min !== "" ||
            filters.sections.max !== "" ||
            filters.questions.min !== "" ||
            filters.questions.max !== "" ||
            filters.totalScore.min !== "" ||
            filters.totalScore.max !== "" ||
            filters.createdDate !== ""
        );
        setFilterPopupOpen(false);
        setCurrentPage(0);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            difficultyLevel: [],
            duration: [],
            position: [],
            sections: { min: "", max: "" },
            questions: { min: "", max: "" },
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
        if (assessmentData?.length !== 0) {
            setFilterPopupOpen((prev) => !prev);
        }
    };

    const normalizeSpaces = (str) =>
        str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

    const FilteredData = () => {
        if (!Array.isArray(assessmentData)) return [];
        return assessmentData.filter((assessment) => {
            const normalizedQuery = normalizeSpaces(searchQuery);
            const fieldsToSearch = [
                assessment?.AssessmentCode,
                assessment?.AssessmentTitle,
                assessment?.Position,
                assessment?.DifficultyLevel,
                assessment?.Duration,
            ].filter(Boolean);

            const matchesSearchQuery =
                searchQuery === "" ||
                fieldsToSearch.some((field) =>
                    normalizeSpaces(field).includes(normalizedQuery)
                );

            const matchesDifficultyLevel =
                selectedFilters.difficultyLevel.length === 0 ||
                selectedFilters.difficultyLevel.includes(assessment?.DifficultyLevel);

            const matchesDuration =
                selectedFilters.duration.length === 0 ||
                selectedFilters.duration.includes(assessment?.Duration);

            const matchesPosition =
                selectedFilters.position.length === 0 ||
                selectedFilters.position.includes(assessment?.Position);

            const sectionsCount = assessmentSections[assessment._id] || 0;
            const matchesSections =
                (selectedFilters.sections.min === "" ||
                    sectionsCount >= Number(selectedFilters.sections.min)) &&
                (selectedFilters.sections.max === "" ||
                    sectionsCount <= Number(selectedFilters.sections.max));

            const questionsCount = assessment?.NumberOfQuestions || 0;
            const matchesQuestions =
                (selectedFilters.questions.min === "" ||
                    questionsCount >= Number(selectedFilters.questions.min)) &&
                (selectedFilters.questions.max === "" ||
                    questionsCount <= Number(selectedFilters.questions.max));

            const totalScore = assessment?.totalScore || 0;
            const matchesTotalScore =
                (selectedFilters.totalScore.min === "" ||
                    totalScore >= Number(selectedFilters.totalScore.min)) &&
                (selectedFilters.totalScore.max === "" ||
                    totalScore <= Number(selectedFilters.totalScore.max));

            const matchesCreatedDate = () => {
                if (!selectedFilters.createdDate) return true;
                if (!assessment.createdAt) return false;
                const createdAt = new Date(assessment.createdAt);
                const now = new Date();
                const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

                switch (selectedFilters.createdDate) {
                    case "last7":
                        return daysDiff <= 7;
                    case "last30":
                        return daysDiff <= 30;
                    case "last90":
                        return daysDiff <= 90;
                    default:
                        return true;
                }
            };

            return (
                matchesSearchQuery &&
                matchesDifficultyLevel &&
                matchesDuration &&
                matchesPosition &&
                matchesSections &&
                matchesQuestions &&
                matchesTotalScore &&
                matchesCreatedDate()
            );
        });
    };

    const rowsPerPage = 10;
    const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
    const startIndex = currentPage * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
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
        if (effectivePermissions.AssessmentTemplates?.View) {
            navigate(`/assessments-template-details/${assessment._id}`);
        }
    };

    const handleEdit = (assessment) => {
        if (effectivePermissions.AssessmentTemplates?.Edit) {
            navigate(`/assessments-template/edit/${assessment._id}`);
        }
    };

    const handleShareClick = (assessment) => {
        if ((assessmentSections[assessment._id] ?? 0) > 0) {
            setIsShareOpen(assessment);
        } else if ((assessmentSections[assessment._id] ?? 0) === 0) {
            toast.error("No questions added to this assessment.");
        }
    };

    const handleCloseShare = () => {
        setIsShareOpen(false);
    };

    const handleDelete = (assessment) => {
        setAssessmentToDelete(assessment);
        setIsDeletePopupOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (assessmentToDelete) {
            try {
                await deleteAssessment.mutateAsync(assessmentToDelete._id);
                toast.success('Assessment deleted successfully');
            } catch (error) {
                console.error('Error deleting assessment:', error);
                toast.error('Failed to delete assessment');
            }
        }
        setIsDeletePopupOpen(false);
        setAssessmentToDelete(null);
    };

    const handleCancelDelete = () => {
        setIsDeletePopupOpen(false);
        setAssessmentToDelete(null);
    };

    const tableColumns = [
        {
            key: "AssessmentCode",
            header: "Template ID",
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
            header: "Template Name",
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
            header: "Pass Criteria",
            render: (value, row) =>
                row.passScore
                    ? row.passScoreType === "Percentage"
                        ? `${row.passScore}%`
                        : `${row.passScore} pts`
                    : "Not Provided",
        },
        {
            key: "Duration",
            header: "Duration",
            render: (value) => value || "Not Provided",
        },
        {
            key: "createdAt",
            header: "Created At",
            render: (value, row) => formatDateTime(row.createdAt) || "N/A",
        },
    ];

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
            ? [
                {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="w-4 h-4 text-custom-blue" />,
                    onClick: handleEdit,
                },
            ]
            : []),
        ...(effectivePermissions.AssessmentTemplates?.Delete
            ? [
                {
                    key: "delete",
                    label: "Delete",
                    icon: <Trash className="w-4 h-4 text-red-600" />,
                    onClick: handleDelete,
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

    const difficultyOptions = ["Easy", "Medium", "Hard"];
    const durationOptions = ["30 Minutes", "60 Minutes"];

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
            sections: sectionsRange,
            questions: questionsRange,
            totalScore: totalScoreRange,
            createdDate: createdDatePreset,
        });
    };

    return (
        <div className="bg-background min-h-screen">
            <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
                <main className="px-6">
                    <div className="sm:px-0">
                        <Header
                            title="Assessment Templtes"
                            onAddClick={() => navigate("/assessments-template/new")}
                            addButtonText="New Template"
                            canCreate={effectivePermissions.AssessmentTemplates?.Create}
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
                                    emptyState="No assessments templates found."
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
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
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
                                                        className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
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
                                                        className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
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
                                </div>
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
                                {(() => {
                                    const uniquePositionIds = [
                                        ...new Set(
                                            assessmentData?.map((a) => a.Position).filter(Boolean) ||
                                            []
                                        ),
                                    ];

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
            {isShareOpen && (
                <ShareAssessment
                    isOpen={isShareOpen}
                    onCloseshare={handleCloseShare}
                    assessment={isShareOpen}
                />
            )}
            <ConfirmDeletePopup
                isOpen={isDeletePopupOpen}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                assessmentName={assessmentToDelete?.AssessmentTitle || ""}
            />
        </div>
    );
};

export default Assessment;
