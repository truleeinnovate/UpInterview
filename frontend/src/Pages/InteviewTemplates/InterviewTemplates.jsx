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
import DeleteConfirmModal from "../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { getEmptyStateMessage } from "../../utils/EmptyStateMessage/emptyStateMessage.js";
import {
  getInterviewTemplateColumns,
  getInterviewTemplateActions,
} from "../../utils/tableColumnAndActionData.jsx";

const InterviewTemplates = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  //  Ranjith added delete Candidate functionality
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deleteInterviewTemplates, setDeleteInterviewTemplates] =
    useState(null);

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

  // Reset states when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedStatus([]);
    setSelectedFormats([]);
    setRoundsRange({ min: "", max: "" });
    setCreatedDatePreset("");
    setIsFilterActive(false);
  }, [activeTab]);

  const {
    templatesData,
    totalCount,
    customCount,
    standardCount,
    isLoading,
    deleteInterviewTemplate,
  } = useInterviewTemplates({
    search: searchQuery,
    status: selectedFilters.status,
    formats: selectedFilters.formats,
    rounds: selectedFilters.rounds,
    createdDate: selectedFilters.createdDate,
    page: currentPage,
    limit: itemsPerPage,
    type: activeTab,
  });

  const totalPages = Math.ceil(totalCount / 10);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "standard" || tab === "custom") {
      setActiveTab(tab);
      setCurrentPage(0);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") !== activeTab) {
      params.set("tab", activeTab);
      navigate({ search: params.toString() }, { replace: true });
    }
  }, [activeTab, navigate]);

  const normalizedTemplates = templatesData;

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
      filters.createdDate !== "" ||
      filters.formats.length > 0
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
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (normalizedTemplates.length !== 0 || isFilterActive) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status || []);
      setSelectedFormats(selectedFilters.formats || []);
      setRoundsRange(selectedFilters.rounds || { min: "", max: "" });
      setModifiedDatePreset(selectedFilters.modifiedDate || "");
      setCreatedDatePreset(selectedFilters.createdDate || "");

      setIsStatusOpen(false);
      setIsFormatOpen(false);
      setIsCreatedDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

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

  const handleView = (row) => {
    if (effectivePermissions.InterviewTemplates?.View) {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      navigate({
        pathname: `/interview-templates/${row._id}`,
        search: params.toString(),
      });
    }
  };

  const handleEdit = (row) => {
    if (effectivePermissions.InterviewTemplates?.Edit) {
      const params = new URLSearchParams();
      params.set("tab", activeTab);
      navigate(
        `/interview-templates/${row._id}/edit?${params.toString()}`
      );
    }
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleDelete = async (row) => {
    if (!effectivePermissions.InterviewTemplates?.Delete) {
      return;
    }
    setDeleteInterviewTemplates(row);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteInterviewTemplates?._id) {
      try {
        await deleteInterviewTemplate(deleteInterviewTemplates?._id);
        setShowDeleteConfirmModal(false);
        setDeleteInterviewTemplates(null);
      } catch (error) {
        console.error("Failed to delete interview:", error);
        setShowDeleteConfirmModal(false);
        setDeleteInterviewTemplates(null);
        const backendMessage =
          error?.response?.data?.message || "Failed to delete position";
        notify.error(backendMessage);
      }
    }
  };

  const handleCloneClick = (row) => {
    navigate(`/interview-templates/${row._id}/clone`);
  };

  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  const initialDataCount = totalCount || 0;
  const currentFilteredCount = normalizedTemplates?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Interview Templates" // Entity Name
  );

  const tableColumns = getInterviewTemplateColumns(navigate, {
    onTemplateClick: handleView,
    permissions: effectivePermissions,
  });

  const tableActions = getInterviewTemplateActions(navigate, {
    permissions: effectivePermissions,
    callbacks: {
      onEdit: handleEdit,
      onDelete: handleDelete,
      onClone: handleCloneClick,
    },
  });

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
                dataLength={totalCount}
                searchPlaceholder="Search Interview Templates..."
                filterIconRef={filterIconRef}
                // v1.0.6 <----------------------------------------
                templatesData={templatesData}
                customCount={customCount}
                totalCount={totalCount}
                standardCount={standardCount}
                // standardCount={standardCount}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                setCurrentPage={setCurrentPage}
              // v1.0.6 ---------------------------------------->
              />
            </div>
            <div className="sm:px-0">
              <motion.div className="bg-white">
                {view === "kanban" ? (
                  <KanbanView
                    templates={templatesData}
                    loading={isLoading}
                    effectivePermissions={effectivePermissions}
                    onView={handleView}
                    onEdit={handleEdit}
                    handleDelete={handleDelete}
                    emptyState={emptyStateMessage}
                  />
                ) : (
                  <div className="overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    <TableView
                      data={templatesData}
                      columns={tableColumns}
                      actions={tableActions}
                      loading={isLoading}
                      emptyState={emptyStateMessage}
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

                {/* Ranjith added deleted functionality  */}
                <DeleteConfirmModal
                  isOpen={showDeleteConfirmModal}
                  onClose={() => setShowDeleteConfirmModal(false)}
                  onConfirm={handleConfirmDelete}
                  title="interview Template"
                  entityName={deleteInterviewTemplates?.title}
                />
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
