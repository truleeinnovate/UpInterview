// v1.0.0 - Ashok - Added status badge common code
// v1.0.1 - Ashok - Changed checkbox colors to match brand (custom-blue) colors
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - Separated standard and custom templates into tabs
// v1.0.4 - Ashok - Added common kanban view
// v1.0.5 - Ashok - Added cloning confirmation popup

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Trash, FileText } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import KanbanView from "./KanbanView";
// import KanbanView from "./StandardTemplates/StandardTemplateKanbanView.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../icons/MdKeyboardArrowDown.svg";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates.js";
import { useMediaQuery } from "react-responsive";
import { usePermissions } from "../../Context/PermissionsContext";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { formatDateTime } from "../../utils/dateFormatter.js";
import StandardTemplates from "./StandardTemplates/StandardTemplates.jsx";
import { notify } from "../../services/toastService.js";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock.js";

// FilterTabs component for standard/custom tabs
const FilterTabs = ({
  activeTab,
  onFilterChange,
  standardCount,
  customCount,
  totalCount,
}) => {
  const tabs = [
    { id: "standard", label: "Standard", count: standardCount },
    { id: "custom", label: "Custom", count: customCount },
  ];

  return (
    <div className="flex gap-1.5 bg-gray-100 p-1 rounded-md border border-slate-200 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-semibold text-sm transition-all duration-200 
            ${
              activeTab === tab.id
                ? "bg-custom-blue text-white shadow-md"
                : "text-slate-600 hover:bg-[#2179891A] hover:text-custom-blue/90 bg-white/100"
            }
          `}
        >
          {tab.label}
          <span
            className={`
              px-2 py-0.5 min-w-[20px] text-center text-xs font-semibold rounded-md
              ${activeTab === tab.id ? "bg-white/30" : "bg-gray-100"}
            `}
          >
            {tab.count}
          </span>
        </button>
      ))}
    </div>
  );
};

const InterviewTemplates = () => {
  const { effectivePermissions } = usePermissions();
  const { templatesData, isLoading, saveTemplate } = useInterviewTemplates();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    rounds: { min: "", max: "" },
    modifiedDate: "",
    createdDate: "",
  });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRoundsOpen, setIsRoundsOpen] = useState(false);
  const [isModifiedDateOpen, setIsModifiedDateOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [roundsRange, setRoundsRange] = useState({ min: "", max: "" });
  const [modifiedDatePreset, setModifiedDatePreset] = useState("");
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const filterIconRef = useRef(null);
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState("standard");

  // v1.0.5 <--------------------------------------------------------
  const [templateToClone, setTemplateToClone] = useState(null);
  const [isCloneConfirmOpen, setCloneConfirmOpen] = useState(false);
  useScrollLock(isCloneConfirmOpen);
  // v1.0.5 -------------------------------------------------------->

  // Transform and filter templatesData for custom templates
  const normalizedTemplates = useMemo(() => {
    if (!templatesData || !Array.isArray(templatesData)) return [];

    return templatesData
      .filter((template) => template.type === "custom") // Filter for custom templates
      .map((template) => ({
        _id: template._id || `template-${Math.random()}`, // Keep _id for navigation
        title: template.title || template.roundTitle || "Unnamed Template",
        name: template.name || "",
        rounds: Array.isArray(template.rounds)
          ? template.rounds
          : template.sequence || [], // Keep rounds as array for TableView
        bestFor: template.bestFor || "General roles",
        format: template.format || "unknown",
        status: template.status || "active",
        updatedAt: template.updatedAt || new Date().toISOString(),
        createdAt: template.createdAt || new Date().toISOString(),
      }));
  }, [templatesData]);

  // Dynamic counts for FilterTabs
  const standardCount =
    templatesData?.filter((t) => t.type === "standard").length || 0;
  const customCount =
    templatesData?.filter((t) => t.type === "custom").length || 0;
  const totalCount = templatesData?.length || 0;

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // Sync filter states when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setRoundsRange(selectedFilters.rounds);
      setModifiedDatePreset(selectedFilters.modifiedDate);
      setCreatedDatePreset(selectedFilters.createdDate);
      setIsStatusOpen(false);
      setIsRoundsOpen(false);
      setIsModifiedDateOpen(false);
      setIsCreatedDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleRoundsChange = (e, type) => {
    const value =
      e.target.value === ""
        ? ""
        : Math.max(0, Math.min(10, Number(e.target.value) || ""));
    setRoundsRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      rounds: roundsRange,
      modifiedDate: modifiedDatePreset,
      createdDate: createdDatePreset,
    };
    setSelectedFilters(filters);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.rounds.min !== "" ||
        filters.rounds.max !== "" ||
        filters.modifiedDate !== "" ||
        filters.createdDate !== ""
    );
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      rounds: { min: "", max: "" },
      modifiedDate: "",
      createdDate: "",
    };
    setSelectedStatus([]);
    setRoundsRange({ min: "", max: "" });
    setModifiedDatePreset("");
    setCreatedDatePreset("");
    setSelectedFilters(clearedFilters);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleFilterIconClick = () => {
    if (normalizedTemplates.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Helper function to normalize spaces for better search
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  const filteredTemplates = useMemo(() => {
    return normalizedTemplates.filter((template) => {
      const normalizedQuery = normalizeSpaces(searchQuery);
      const fieldsToSearch = [
        template.title,
        template.interviewTemplateCode,
        template.status,
        template.rounds?.length?.toString(),
      ].filter(Boolean);

      const matchesSearchQuery =
        searchQuery === "" ||
        fieldsToSearch.some((field) =>
          normalizeSpaces(field).includes(normalizedQuery)
        );

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(
          template.status
            ? template.status.charAt(0).toUpperCase() + template.status.slice(1)
            : "Active"
        );

      const roundsCount = template.rounds?.length || 0;
      const matchesRounds =
        (selectedFilters.rounds.min === "" ||
          roundsCount >= Number(selectedFilters.rounds.min)) &&
        (selectedFilters.rounds.max === "" ||
          roundsCount <= Number(selectedFilters.rounds.max));

      const matchesModifiedDate = () => {
        if (!selectedFilters.modifiedDate) return true;
        if (!template.updatedAt) return false;
        const modifiedAt = new Date(template.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - modifiedAt) / (1000 * 60 * 60 * 24));
        switch (selectedFilters.modifiedDate) {
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

      const matchesCreatedDate = () => {
        if (!selectedFilters.createdDate) return true;
        if (!template.createdAt) return false;
        const createdAt = new Date(template.createdAt);
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
        matchesStatus &&
        matchesRounds &&
        matchesModifiedDate() &&
        matchesCreatedDate()
      );
    });
  }, [normalizedTemplates, searchQuery, selectedFilters]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(
    startIndex + itemsPerPage,
    filteredTemplates.length
  );
  const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleView = (template) => {
    if (effectivePermissions.InterviewTemplates?.View) {
      navigate(`/interview-templates/${template._id}`);
    }
  };

  const handleEdit = (template) => {
    if (effectivePermissions.InterviewTemplates?.Edit) {
      navigate(`edit/${template._id}`);
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatOptions = [
    { label: "Online / Virtual", value: "online" },
    { label: "Face to Face / Onsite", value: "offline" },
    { label: "Hybrid (Online + Offline)", value: "hybrid" },
  ];

  const handleClone = async (template) => {
    // v1.0.5 <--------------------------------------------------------------
    setTemplateToClone(template);
    setCloneConfirmOpen(true);
    if (!template) {
      console.error("Invalid template: template is undefined or null");
      alert("Cannot clone: Invalid template data.");
      return;
    }
    // v1.0.5 -------------------------------------------------------------->

    console.log("Cloning:", template);

    try {
      // Safely extract and default fields
      const safeName = typeof template.name === "string"
      ? template.name.replace(/_std$/, "")
      : "cloned_template";

      console.log("Original name:", template.name); // Debug
      console.log("Safe name:", safeName); // Debug

      // Define the fields to pass based on the schema, with safe defaults
      const clonedTemplateData = {
        title: template.title || "Untitled Template",
        name: safeName,
        description: template.description || "",
        bestFor: template.bestFor || "General use",
        format: template.format || "online",
        status: template.status || "inactive",
        type: "custom", // Set to custom for cloned template
        rounds: Array.isArray(template.rounds)
          ? template.rounds.map((round, index) => ({
              roundTitle: round.roundTitle || `Round ${index + 1}`,
              assessmentId: round.assessmentId || null,
              interviewerViewType: round.interviewerViewType || null,
              duration: round.duration || null,
              instructions: round.instructions || null,
              interviewMode: round.interviewMode || null,
              minimumInterviewers: round.minimumInterviewers || null,
              selectedInterviewers: Array.isArray(round.selectedInterviewers)
                ? round.selectedInterviewers
                : [],
              interviewerType: round.interviewerType || null,
              selectedInterviewersType: round.selectedInterviewersType || null,
              interviewerGroupName: round.interviewerGroupName || null,
              interviewers: Array.isArray(round.interviewers)
                ? round.interviewers
                : [],
              questions: Array.isArray(round.questions)
                ? round.questions.map((question) => ({
                    questionId: question.questionId || null,
                    snapshot: question.snapshot || {},
                  }))
                : [],
              sequence: round.sequence || index + 1,
            }))
          : [],
        isSaved: false, // Set to false for new template
      };

      // Optionally include interviewTemplateCode if needed (e.g., generate if backend requires uniqueness)
      // if (template.interviewTemplateCode) {
      //   clonedTemplateData.interviewTemplateCode = `${clonedTemplateData.name}-clone-${Date.now()}`;
      // }

      // Save the cloned template
      const savedTemplate = await saveTemplate({
        templateData: clonedTemplateData,
      });

      // v1.0.5 <------------------------------------------------------------
      console.log("Cloned template saved:", savedTemplate);
      // Provide feedback to the user (e.g., via toast in production)
      notify.success("Template cloned successfully!");
      return savedTemplate;
    } catch (error) {
      console.error("Error cloning template:", error);
      // alert("Failed to clone template. Please try again.");
      notify.error("Failed to clone template. Please try again.");
      // v1.0.5 ------------------------------------------------------------>
      throw error;
    }
  };

  // v1.0.5 <------------------------------------------------------------------------
  const handleCloneClick = (template) => {
    console.log("Cloning template:", template);
    setTemplateToClone(template);
    setCloneConfirmOpen(true);
  };

  const confirmClone = async () => {
    if (!templateToClone) return;
    try {
      await handleClone(templateToClone); // call your existing clone logic
    } finally {
      setCloneConfirmOpen(false);
      setTemplateToClone(null);
    }
  };

  const cancelClone = () => {
    setCloneConfirmOpen(false);
    setTemplateToClone(null);
  };
  // v1.0.5 ------------------------------------------------------------------------>

  const tableColumns = [
    {
      key: "title",
      header: "Title",
      render: (value, row) => {
        const formattedValue = value
          ? value.charAt(0).toUpperCase() + value.slice(1)
          : "N/A";

        return (
          <div
            className="text-sm font-medium text-custom-blue cursor-pointer"
            onClick={() => handleView(row)}
          >
            {formattedValue}
          </div>
        );
      },
    },
    {
      key: "rounds",
      header: "Rounds",
      render: (value) => value?.length || 0,
    },
    {
      key: "bestFor",
      header: "Best For",
      render: (value) => value || "N/A",
    },
    {
      key: "format",
      header: "Format",
      render: (value) => {
        const option = formatOptions.find((opt) => opt.value === value);
        return option ? option.label : "N/A";
      },
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        return value ? (
          <StatusBadge status={capitalizeFirstLetter(value)} />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        );
      },
    },
    {
      key: "updatedAt",
      header: "Last Modified",
      render: (value, row) => formatDateTime(row.updatedAt) || "N/A",
    },
  ];

  const tableActions = [
    ...(effectivePermissions.InterviewTemplates?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: handleView,
          },
        ]
      : []),
    ...(effectivePermissions.InterviewTemplates?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: handleEdit,
          },
        ]
      : []),
    ...(effectivePermissions.InterviewTemplates?.Delete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            // onClick: handleDelete,
          },
        ]
      : []),
    ...(effectivePermissions.InterviewTemplates?.Clone
      ? [
          {
            key: "clone",
            label: "Clone",
            icon: <FileText className="w-4 h-4 text-custom-blue" />,
            // onClick: handleClone,
            onClick: handleCloneClick,
          },
        ]
      : []),
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed mt-2 left-0 right-0 bg-background">
        <main className="sm:px-4 px-6">
          <div className="sm:px-0">
            <Header
              title="Interview Templates"
              onAddClick={() => navigate("new")}
              addButtonText="New Template"
              canCreate={effectivePermissions.InterviewTemplates?.Create}
            />
            <div className="flex justify-end mb-4">
              <FilterTabs
                activeTab={activeTab}
                onFilterChange={setActiveTab}
                standardCount={standardCount}
                customCount={customCount}
                totalCount={totalCount}
              />
            </div>
          </div>
        </main>
      </div>
      <main className="fixed sm:top-48 top-48 md:top-48 lg:top-48 xl:top-48 2xl:top-48 left-0 right-0 bg-background">
        {activeTab === "custom" ? (
          <div>
            <div className="sm:px-4 px-6">
              <Toolbar
                view={view}
                setView={setView}
                searchQuery={searchQuery}
                onSearch={(e) => setSearchQuery(e.target.value)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePreviousPage}
                onNextPage={handleNextPage}
                onFilterClick={handleFilterIconClick}
                isFilterActive={isFilterActive}
                isFilterPopupOpen={isFilterPopupOpen}
                dataLength={normalizedTemplates.length}
                searchPlaceholder="Search Interview Templates..."
                filterIconRef={filterIconRef}
              />
            </div>
            <div className="sm:px-0">
              <motion.div className="bg-white">
                {view === "kanban" ? (
                  <KanbanView
                    templates={paginatedTemplates}
                    loading={isLoading}
                    effectivePermissions={effectivePermissions}
                    onView={handleView}
                    onEdit={handleEdit}
                  />
                ) : (
                  <div className="overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    <TableView
                      data={paginatedTemplates}
                      columns={tableColumns}
                      actions={tableActions}
                      loading={isLoading}
                      emptyState="No Templates Found."
                      className="table-fixed w-full"
                    />
                  </div>
                )}
                <FilterPopup
                  isOpen={isFilterPopupOpen}
                  onClose={() => setFilterPopupOpen(false)}
                  onApply={handleApplyFilters}
                  onClearAll={handleClearAll}
                  filterIconRef={filterIconRef}
                >
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {/* Status Filter */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsStatusOpen(!isStatusOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Status
                        </span>
                        {isStatusOpen ? (
                          <MdKeyboardArrowUp className="text-xl text-gray-700" />
                        ) : (
                          <MdKeyboardArrowDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isStatusOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {["Active", "Draft", "Archived", "Inactive"].map(
                            (status) => (
                              <label
                                key={status}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(status)}
                                  onChange={() => handleStatusToggle(status)}
                                  className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                />
                                <span className="text-sm">{status}</span>
                              </label>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    {/* Rounds Filter */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsRoundsOpen(!isRoundsOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Number of Rounds
                        </span>
                        {isRoundsOpen ? (
                          <MdKeyboardArrowUp className="text-xl text-gray-700" />
                        ) : (
                          <MdKeyboardArrowDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isRoundsOpen && (
                        <div className="mt-2 pl-3 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="number"
                              value={roundsRange.min}
                              onChange={(e) => handleRoundsChange(e, "min")}
                              placeholder="Min"
                              className="w-20 p-1 border rounded"
                              min="0"
                              max="10"
                            />
                            <span className="text-sm">to</span>
                            <input
                              type="number"
                              value={roundsRange.max}
                              onChange={(e) => handleRoundsChange(e, "max")}
                              placeholder="Max"
                              className="w-20 p-1 border rounded"
                              min="0"
                              max="10"
                            />
                          </div>
                        </div>
                      )}
                    </div>

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
          </div>
        ) : (
          // v1.0.5 <-----------------------------------------------------------
          <StandardTemplates handleClone={handleCloneClick} />
          // v1.0.5 ----------------------------------------------------------->
        )}
      </main>
      {/* v1.0.5 <----------------------------------------------------------------------------- */}
      <div>
        {isCloneConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg p-6 mx-4 max-w-96">
              <h3 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-semibold mb-4">
                Confirm Clone
              </h3>
              <p className="sm:text-sm mb-6">
                Are you sure you want to clone template
                <strong className="ml-1">{templateToClone?.title}</strong>?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelClone}
                  className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmClone}
                  className="px-4 py-2 rounded bg-custom-blue text-white hover:bg-custom-blue/90"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* v1.0.5 -----------------------------------------------------------------------------> */}
      <Outlet />
    </div>
  );
};

export default InterviewTemplates;
