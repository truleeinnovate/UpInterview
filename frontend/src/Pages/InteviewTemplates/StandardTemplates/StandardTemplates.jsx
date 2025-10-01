// v1.0.0 - Ashok - removed loading in this

import React, { useState, useRef, useMemo } from "react";
import StandardTemplateTableView from "./StandardTemplateTableView";
import StandardTemplateKanbanView from "../KanbanView.jsx";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import { useInterviewTemplates } from "../../../apiHooks/useInterviewTemplates.js";
import { usePermissions } from "../../../Context/PermissionsContext";
import { useNavigate } from "react-router-dom";

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-red-600">
          <h1>Something went wrong.</h1>
          <p>{this.state.error?.message || "An unexpected error occurred."}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const StandardTemplates = () => {
  const { templatesData, isLoading } = useInterviewTemplates();
  const { effectivePermissions } = usePermissions();
  const navigate = useNavigate();

  // Transform API data to match the expected structure
  const normalizedTemplates = useMemo(() => {
    if (!templatesData || !Array.isArray(templatesData)) return [];

    return templatesData
      .filter((template) => template.type === "standard")
      .map((template) => ({
        _id: template._id || `template-${Math.random()}`,
        title: template.title || template.roundTitle || "Unnamed Template",
        description: template.description || "No description available",
        rounds: Array.isArray(template.rounds)
          ? template.rounds
          : Array.isArray(template.sequence)
            ? template.sequence
            : [{ roundTitle: "Unknown round" }],
        bestFor: template.bestFor || "General roles",
        format: template.format || "Unknown format",
        type: template.type || "standard",
        status: template.status || "active",
        category: template.category || "Uncategorized",
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: template.updatedAt || new Date().toISOString(),
      }));
  }, [templatesData]);

  // Toolbar & Filter state
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const filterIconRef = useRef(null);

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    rounds: { min: "", max: "" },
    modifiedDate: "",
    createdDate: "",
  });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [roundsRange, setRoundsRange] = useState({ min: "", max: "" });
  const [modifiedDatePreset, setModifiedDatePreset] = useState("");
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRoundsOpen, setIsRoundsOpen] = useState(false);
  const [isCreatedDateOpen, setIsCreatedDateOpen] = useState(false);

  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  // Filtered templates based on search & filters
  const filteredTemplates = useMemo(() => {
    return normalizedTemplates.filter((template) => {
      const normalizedQuery = normalizeSpaces(searchQuery);
      const fieldsToSearch = [template.title, template.status].filter(Boolean);

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

      const roundsCount = template.rounds?.length || 0; // Fix: Use array length
      const matchesRounds =
        (selectedFilters.rounds.min === "" ||
          roundsCount >= Number(selectedFilters.rounds.min)) &&
        (selectedFilters.rounds.max === "" ||
          roundsCount <= Number(selectedFilters.rounds.max));

      const matchesModifiedDate = () => {
        if (!selectedFilters.modifiedDate) return true;
        if (!template.updatedAt) return false;
        const daysDiff = Math.floor(
          (new Date() - new Date(template.updatedAt)) / (1000 * 60 * 60 * 24)
        );
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
        const daysDiff = Math.floor(
          (new Date() - new Date(template.createdAt)) / (1000 * 60 * 60 * 24)
        );
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
  }, [searchQuery, selectedFilters, normalizedTemplates]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const paginatedTemplates = filteredTemplates.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Toolbar handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  const handleFilterIconClick = () => {
    if (normalizedTemplates.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

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
    setRoundsRange((prev) => ({ ...prev, [type]: value }));
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
  const handleView = (template) => {
    if (effectivePermissions.InterviewTemplates?.View) {
      navigate(`/interview-templates/${template._id}`);
    }
  };

  return (
    <>
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
        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setFilterPopupOpen(false)}
          onApply={handleApplyFilters}
          onClearAll={handleClearAll}
          filterIconRef={filterIconRef}
        >
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsStatusOpen(!isStatusOpen)}
              >
                <span className="font-medium text-gray-700">Status</span>
                {isStatusOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
                )}
              </div>
              {isStatusOpen && (
                <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                  {["Active", "Draft", "Archived", "Inactive"].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
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
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsRoundsOpen(!isRoundsOpen)}
              >
                <span className="font-medium text-gray-700">
                  Number of Rounds
                </span>
                {isRoundsOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
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
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsCreatedDateOpen(!isCreatedDateOpen)}
              >
                <span className="font-medium text-gray-700">Created Date</span>
                {isCreatedDateOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
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
      </div>
      <div>
        {view === "table" ? (
          <div className="w-full overflow-x-auto">
            <ErrorBoundary>
              <StandardTemplateTableView templatesData={paginatedTemplates} />
            </ErrorBoundary>
          </div>
        ) : (
          <div>
            <ErrorBoundary>
              <StandardTemplateKanbanView templates={paginatedTemplates}
                loading={isLoading}
                effectivePermissions={effectivePermissions}
                onView={handleView}
                // onEdit={handleEdit}
                 />
            </ErrorBoundary>
          </div>
        )}
      </div>
    </>
  );
};

export default StandardTemplates;
