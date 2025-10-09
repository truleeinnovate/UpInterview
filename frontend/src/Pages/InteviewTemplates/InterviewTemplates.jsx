// v1.0.0 - Ashok - Added status badge common code
// v1.0.1 - Ashok - Changed checkbox colors to match brand (custom-blue) colors
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - Separated standard and custom templates into tabs
// v1.0.4 - Ashok - Added common kanban view
// v1.0.5 - Ashok - Added cloning confirmation popup

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Trash, Files } from "lucide-react";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import KanbanView from "./KanbanView";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Header from "../../Components/Shared/Header/Header.jsx";
// import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../icons/MdKeyboardArrowDown.svg";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates.js";
import { usePermissions } from "../../Context/PermissionsContext";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { formatDateTime } from "../../utils/dateFormatter.js";
import StandardTemplates from "./StandardTemplates/StandardTemplates.jsx";
import { notify } from "../../services/toastService.js";
import StandardTemplatesToolbar from "./StandardTemplates/StandardTemplatesHeader.jsx";

const InterviewTemplates = () => {
  const { templatesData, isLoading, saveTemplate, deleteInterviewTemplate } =
    useInterviewTemplates();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const itemsPerPage = 10;
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "standard"
  );
  const { effectivePermissions } = usePermissions();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // UI states
  const [view, setView] = useState("table"); // 'table' or 'kanban'
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRoundsOpen] = useState(false);
  const [isModifiedDateOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);
  const [isFormatOpen, setIsFormatOpen] = useState(false);

  // Template cloning states
  // const [templateToClone, setTemplateToClone] = useState(null);
  // const [isCloneConfirmOpen, setCloneConfirmOpen] = useState(false);
  // Keep URL in sync with tab state
  useEffect(() => {
    console.log("Current active tab:", activeTab);
    const params = new URLSearchParams(window.location.search);

    // Only update URL if it doesn't match the current tab
    if (params.get("tab") !== activeTab) {
      console.log("Updating URL to match active tab:", activeTab);
      params.set("tab", activeTab);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [activeTab, navigate]);

  // Handle tab change from URL (e.g., browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get("tab");
      console.log("URL changed, tab from URL:", tabFromUrl);

      if (
        tabFromUrl &&
        (tabFromUrl === "standard" || tabFromUrl === "custom")
      ) {
        console.log("Updating active tab from URL:", tabFromUrl);
        setActiveTab(tabFromUrl);
      } else if (!tabFromUrl) {
        // If no tab in URL, set default and update URL
        console.log("No tab in URL, setting to default");
        setActiveTab("standard");
        params.set("tab", "standard");
        navigate({ search: params.toString() }, { replace: true });
      }
    };

    // Listen for URL changes
    window.addEventListener("popstate", handlePopState);

    // Initial check
    handlePopState();

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [roundsRange, setRoundsRange] = useState({ min: "", max: "" });
  const [modifiedDatePreset, setModifiedDatePreset] = useState("");
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    formats: [],
    rounds: { min: "", max: "" },
    modifiedDate: "",
    createdDate: "",
  });

  // Refs
  const filterIconRef = useRef(null);

  // Derived state
  const normalizedTemplates = useMemo(() => {
    if (!templatesData || !Array.isArray(templatesData)) return [];
    return templatesData.filter((template) => template.type === "custom");
  }, [templatesData]);

  // const standardCount = templatesData?.filter(t => t.type === 'standard').length || 0;
  // const customCount = templatesData?.filter(t => t.type === 'custom').length || 0;
  // const totalCount = templatesData?.length || 0;

  // Handler for view toggle
  // const toggleView = () => {
  //     setView(prev => prev === 'table' ? 'kanban' : 'table');
  // };

  // Status toggle handler
  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleFormatToggle = (format) => {
    setSelectedFormats((prev) =>
      prev.includes(format)
        ? prev.filter((f) => f !== format)
        : [...prev, format]
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
      formats: selectedFormats,
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
      formats: [],
      rounds: { min: "", max: "" },
      modifiedDate: "",
      createdDate: "",
    };
    setSelectedStatus([]);
    setSelectedFormats([]);
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
 
      const matchesFormat =
        selectedFilters.formats.length === 0 ||
        (template.format && selectedFilters.formats.includes(template.format));
 
      return (
        matchesSearchQuery &&
        matchesStatus &&
        matchesRounds &&
        matchesFormat &&
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
      // Preserve the current tab in the URL when navigating to view
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      navigate({
        pathname: `/interview-templates/${template._id}`,
        search: params.toString(),
      });
    }
  };

  const handleEdit = (template) => {
    if (effectivePermissions.InterviewTemplates?.Edit) {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      navigate(`/interview-templates/${template._id}/edit?${params.toString()}`);
    }
  };
  

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleDelete = async (template) => {
    if (!effectivePermissions.InterviewTemplates?.Delete) {
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete the interview template "${template.name}"? This action cannot be undone.`
      )
    ) {
      try {
        // deleteInterviewTemplate is already the mutateAsync function
        let res = await deleteInterviewTemplate(template._id);
        console.log("tempalte response", res);

        // The success toast will be shown by the mutation's onSuccess handler
      } catch (error) {
        console.error("Error deleting interview template:", error);
        // The error toast will be shown by the mutation's onError handler
      }
    }
  };

  const formatOptionsfortable = [
    { label: "Online / Virtual", value: "online" },
    { label: "Face to Face / Onsite", value: "offline" },
    { label: "Hybrid (Online + Onsite)", value: "hybrid" },
  ];

  const getFormatLabelfortable = (formatValue) => {
    const option = formatOptionsfortable.find(
      (opt) => opt.value === formatValue
    );
    return option ? option.label : formatValue || "Uncategorized";
  };

  // const handleClone = async (template) => {
  //     // v1.0.5 <--------------------------------------------------------------
  //     // setTemplateToClone(template);
  //     // setCloneConfirmOpen(true);
  //     if (!template) {
  //         console.error("Invalid template: template is undefined or null");
  //         alert("Cannot clone: Invalid template data.");
  //         return;
  //     }
  //     // v1.0.5 -------------------------------------------------------------->

  //     console.log("Cloning:", template);

  //     try {
  //         // Get all existing template names for uniqueness check
  //         const existingNames = templatesData.map(t => t.name);

  //         // Generate a unique name
  //         const generateUniqueName = (baseName) => {
  //             let newName = baseName;
  //             let counter = 1;

  //             // Check if the name already exists
  //             while (existingNames.includes(newName)) {
  //                 // If we've tried 99 times, append a timestamp instead
  //                 if (counter > 99) {
  //                     return `${baseName}_${Date.now().toString().slice(-4)}`;
  //                 }
  //                 // Append a random 2-digit number (01-99)
  //                 const randomNum = Math.floor(Math.random() * 99) + 1;
  //                 newName = `${baseName}_${randomNum.toString().padStart(2, '0')}`;
  //                 counter++;
  //             }
  //             return newName;
  //         };

  //         // Safely extract and default fields
  //         const baseName = typeof template.name === "string"
  //             ? template.name.replace(/_std$/, "")
  //             : "cloned_template";

  //         // Generate a unique name
  //         const safeName = generateUniqueName(baseName);

  //         console.log("Original name:", template.name); // Debug
  //         console.log("New unique name:", safeName); // Debug

  //         // Define the fields to pass based on the schema, with safe defaults
  //         const clonedTemplateData = {
  //             title: template.title || "Untitled Template",
  //             name: safeName,
  //             description: template.description || "",
  //             bestFor: template.bestFor || "General use",
  //             format: template.format || "online",
  //             status: template.status || "inactive",
  //             type: "custom", // Set to custom for cloned template
  //             rounds: Array.isArray(template.rounds)
  //                 ? template.rounds.map((round, index) => ({
  //                     roundTitle: round.roundTitle || `Round ${index + 1}`,
  //                     assessmentId: round.assessmentId || null,
  //                     interviewerViewType: round.interviewerViewType || null,
  //                     duration: round.duration || null,
  //                     instructions: round.instructions || null,
  //                     interviewMode: round.interviewMode || null,
  //                     minimumInterviewers: round.minimumInterviewers || null,
  //                     selectedInterviewers: Array.isArray(round.selectedInterviewers)
  //                         ? round.selectedInterviewers
  //                         : [],
  //                     interviewerType: round.interviewerType || null,
  //                     selectedInterviewersType: round.selectedInterviewersType || null,
  //                     interviewerGroupName: round.interviewerGroupName || null,
  //                     interviewers: Array.isArray(round.interviewers)
  //                         ? round.interviewers
  //                         : [],
  //                     questions: Array.isArray(round.questions)
  //                         ? round.questions.map((question) => ({
  //                             questionId: question.questionId || null,
  //                             snapshot: question.snapshot || {},
  //                         }))
  //                         : [],
  //                     sequence: round.sequence || index + 1,
  //                 }))
  //                 : [],
  //             isSaved: false, // Set to false for new template
  //         };

  //         // Optionally include interviewTemplateCode if needed (e.g., generate if backend requires uniqueness)
  //         // if (template.interviewTemplateCode) {
  //         //   clonedTemplateData.interviewTemplateCode = `${clonedTemplateData.name}-clone-${Date.now()}`;
  //         // }

  //         // Save the cloned template
  //         const savedTemplate = await saveTemplate({
  //             templateData: clonedTemplateData,
  //         });

  //         // v1.0.5 <------------------------------------------------------------
  //         console.log("Cloned template saved:", savedTemplate);
  //         // Provide feedback to the user (e.g., via toast in production)
  //         notify.success("Template cloned successfully!");
  //         return savedTemplate;
  //     } catch (error) {
  //         console.error("Error cloning template:", error);
  //         // alert("Failed to clone template. Please try again.");
  //         notify.error("Failed to clone template. Please try again.");
  //         // v1.0.5 ------------------------------------------------------------>
  //         throw error;
  //     }
  // };

  // v1.0.5 <------------------------------------------------------------------------
  const handleCloneClick = (template) => {
    navigate(`/interview-templates/${template._id}/clone`);
  };

  // const confirmClone = async () => {
  //     if (!templateToClone) return;
  //     try {
  //         await handleClone(templateToClone); // call your existing clone logic
  //     } finally {
  //         // setCloneConfirmOpen(false);
  //         setTemplateToClone(null);
  //     }
  // };

  // const cancelClone = () => {
  //     // setCloneConfirmOpen(false);
  //     setTemplateToClone(null);
  // };
  // v1.0.5 ------------------------------------------------------------------------>

  const tableColumns = [
    {
      key: "title",
      header: "Template",
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
      key: "description",
      header: "Description",
      render: (value) => {
        const displayValue = value || "N/A";
        return (
          <span className="truncate max-w-[160px] block" title={displayValue}>
            {displayValue}
          </span>
        );
      },
    },
    {
      key: "rounds",
      header: "Rounds",
      render: (value) => {
        if (!Array.isArray(value) || value.length === 0) {
          const noRounds = "No rounds";
          return (
            <span className="truncate max-w-[160px] block" title={noRounds}>
              {noRounds}
            </span>
          );
        }
        const fullRounds = value.map((item, index) => (
          <span key={index}>
            {item.roundTitle}
            {index !== value.length - 1 && " → "}
          </span>
        ));
        const fullText = value.map((item) => item.roundTitle).join(" → ");
        return (
          <span className="truncate max-w-[160px] block" title={fullText}>
            {fullRounds}
          </span>
        );
      },
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
        const formatLabel = getFormatLabelfortable(value);
        return <span className="whitespace-nowrap">{formatLabel}</span>;
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
            onClick: handleDelete,
          },
        ]
      : []),
    ...(effectivePermissions.InterviewTemplates?.Clone
      ? [
          {
            key: "clone",
            label: "Clone",
            icon: <Files className="w-4 h-4 text-custom-blue" />,
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
            {/* v1.0.6 <--------------------------------------------------- */}
            {/* <div className="flex justify-end mb-4">
              <FilterTabs
                activeTab={activeTab}
                onFilterChange={setActiveTab}
                standardCount={standardCount}
                customCount={customCount}
                totalCount={totalCount}
              />
            </div> */}
            {/* v1.0.6 ---------------------------------------------------> */}
          </div>
        </main>
      </div>
      <main className="fixed top-36 left-0 right-0 bg-background">
        {activeTab === "custom" ? (
          <div>
            <div className="sm:px-4 px-6">
              <StandardTemplatesToolbar
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
                // v1.0.6 <----------------------------------------
                templatesData={paginatedTemplates}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                // v1.0.6 ---------------------------------------->
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
                    {/* <div>
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
                                        </div> */}

                    {/* Format Filter */}
                    <div>
                      <div
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => setIsFormatOpen(!isFormatOpen)}
                      >
                        <span className="font-medium text-gray-700">
                          Format
                        </span>
                        {isFormatOpen ? (
                          <MdKeyboardArrowUp className="text-xl text-gray-700" />
                        ) : (
                          <MdKeyboardArrowDown className="text-xl text-gray-700" />
                        )}
                      </div>
                      {isFormatOpen && (
                        <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                          {[
                            { label: "Online / Virtual", value: "online" },
                            {
                              label: "Face to Face / Onsite",
                              value: "offline",
                            },
                            {
                              label: "Hybrid (Online + Onsite)",
                              value: "hybrid",
                            },
                          ].map((format) => (
                            <label
                              key={format.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedFormats.includes(format.value)}
                                onChange={() =>
                                  handleFormatToggle(format.value)
                                }
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{format.label}</span>
                            </label>
                          ))}
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
      {/* <div>
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
            </div> */}
      {/* v1.0.5 -----------------------------------------------------------------------------> */}
      <Outlet />
    </div>
  );
};

export default InterviewTemplates;
