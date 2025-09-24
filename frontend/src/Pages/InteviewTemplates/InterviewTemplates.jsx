// v1.0.0 - Ashok - Added status badge common code
// v1.0.1  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.2  -  Ashok   -  Improved responsiveness

import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Trash } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import KanbanView from "./KanbanView";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../icons/MdKeyboardArrowDown.svg";
import { useInterviewTemplates } from "../../apiHooks/useInterviewTemplates.js";
import { useMediaQuery } from "react-responsive";
import { usePermissions } from "../../Context/PermissionsContext";
// v1.0.0 <------------------------------------------------------------------------------------
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";
// v1.0.0 ------------------------------------------------------------------------------------>

const InterviewTemplates = () => {
  const { effectivePermissions } = usePermissions();
  const { templatesData, isLoading } = useInterviewTemplates();
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
    modifiedDate: "", // '', 'last7', 'last30', 'last90'
    createdDate: "" // '', 'last7', 'last30', 'last90'
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
      // Reset all open states
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
    const value = e.target.value === "" ? "" : Math.max(0, Math.min(10, Number(e.target.value) || ""));
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
      createdDate: createdDatePreset
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
      createdDate: ""
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
    if (templatesData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Helper function to normalize spaces for better search
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  const filteredTemplates = useMemo(() => {
    if (!templatesData || !Array.isArray(templatesData)) return [];
    return templatesData.filter((template) => {
      // Enhanced search across multiple fields
      const normalizedQuery = normalizeSpaces(searchQuery);
      const fieldsToSearch = [
        template?.templateName,
        template?.interviewTemplateCode,
        template?.status,
        template?.rounds?.length?.toString()
      ].filter(Boolean);
      
      const matchesSearchQuery = 
        searchQuery === "" ||
        fieldsToSearch.some((field) =>
          normalizeSpaces(field).includes(normalizedQuery)
        );
      
      // Status filter
      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(
          template.status
            ? template.status.charAt(0).toUpperCase() + template.status.slice(1)
            : "Active"
        );
      
      // Rounds filter
      const roundsCount = template?.rounds?.length || 0;
      const matchesRounds =
        (selectedFilters.rounds.min === "" ||
          roundsCount >= Number(selectedFilters.rounds.min)) &&
        (selectedFilters.rounds.max === "" ||
          roundsCount <= Number(selectedFilters.rounds.max));
      
      // Modified date filter
      const matchesModifiedDate = () => {
        if (!selectedFilters.modifiedDate) return true;
        if (!template.updatedAt) return false;
        const modifiedAt = new Date(template.updatedAt);
        const now = new Date();
        const daysDiff = Math.floor((now - modifiedAt) / (1000 * 60 * 60 * 24));
        
        switch (selectedFilters.modifiedDate) {
          case 'last7':
            return daysDiff <= 7;
          case 'last30':
            return daysDiff <= 30;
          case 'last90':
            return daysDiff <= 90;
          default:
            return true;
        }
      };
      
      // Created date filter
      const matchesCreatedDate = () => {
        if (!selectedFilters.createdDate) return true;
        if (!template.createdAt) return false;
        const createdAt = new Date(template.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
        
        switch (selectedFilters.createdDate) {
          case 'last7':
            return daysDiff <= 7;
          case 'last30':
            return daysDiff <= 30;
          case 'last90':
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
  }, [templatesData, searchQuery, selectedFilters]);

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

  const formatRelativeDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (date.toDateString() === now.toDateString()) return "Today";
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    if (diffDays < 30) return `${diffDays} Day${diffDays > 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} Month${diffMonths > 1 ? "s" : ""} ago`;
    return `${diffYears} Year${diffYears > 1 ? "s" : ""} ago`;
  };

  const capitalizeFirstLetter = (str) => {
    if (!str) return "";
    return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  };

  const tableColumns = [
    {
      key: "interviewTemplateCode",
      header: "Template ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {value || "N/A"}
        </div>
      ),
    },
    {
      key: "templateName",
      header: "Template Name",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {value.charAt(0).toUpperCase() + value.slice(1) || "N/A"}
        </div>
      ),
    },
    {
      key: "rounds",
      header: "Rounds",
      render: (value) => value?.length || 0,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => {
        // v1.0.0 <---------------------------------------------------------------------------
        // <span
        //   className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
        //     value === "active"
        //       ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
        //       : value === "inactive"
        //       ? "bg-amber-50 text-amber-700 border border-amber-200/60"
        //       : "bg-slate-50 text-slate-700 border border-slate-200/60"
        //   }`}
        // >
        //   {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Active"}
        // </span>

        return value ? (
          <StatusBadge status={capitalizeFirstLetter(value)} />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        );
      },
      // v1.0.0 ----------------------------------------------------------------------------->
    },
    {
      key: "updatedAt",
      header: "Last Modified",
      render: (value) => formatRelativeDate(value) || "N/A",
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
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        {/* v1.0.2 <--------------------------------------------------------------------- */}
        <main className="sm:px-4 px-6">
          {/* v1.0.2 ---------------------------------------------------------------------> */}
          <div className="sm:px-0">
            <Header
              title="Interview Templates"
              onAddClick={() => navigate("new")}
              addButtonText="New Template"
              canCreate={effectivePermissions.InterviewTemplates?.Create}
            />
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
              dataLength={templatesData?.length}
              searchPlaceholder="Search Interview Templates..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
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
              // v1.0.2 <--------------------------------------------------------------------------------
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
              // v1.0.2 -------------------------------------------------------------------------------->
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
                    <span className="font-medium text-gray-700">Status</span>
                    {isStatusOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isStatusOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {["Active", "Draft", "Archived", "Inactive"].map((status) => (
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
                      ))}
                    </div>
                  )}
                </div>

                {/* Rounds Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsRoundsOpen(!isRoundsOpen)}
                  >
                    <span className="font-medium text-gray-700">Number of Rounds</span>
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

                {/* Modified Date Filter */}
                {/* <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsModifiedDateOpen(!isModifiedDateOpen)}
                  >
                    <span className="font-medium text-gray-700">Last Modified</span>
                    {isModifiedDateOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isModifiedDateOpen && (
                    <div className="mt-2 pl-3 space-y-1">
                      {[
                        { value: "", label: "Any time" },
                        { value: "last7", label: "Last 7 days" },
                        { value: "last30", label: "Last 30 days" },
                        { value: "last90", label: "Last 90 days" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value={option.value}
                            checked={modifiedDatePreset === option.value}
                            onChange={(e) => setModifiedDatePreset(e.target.value)}
                            className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* Created Date Filter */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedDateOpen(!isCreatedDateOpen)}
                  >
                    <span className="font-medium text-gray-700">Created Date</span>
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
                        <label key={option.value} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            value={option.value}
                            checked={createdDatePreset === option.value}
                            onChange={(e) => setCreatedDatePreset(e.target.value)}
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
      <Outlet />
    </div>
  );
};

export default InterviewTemplates;
