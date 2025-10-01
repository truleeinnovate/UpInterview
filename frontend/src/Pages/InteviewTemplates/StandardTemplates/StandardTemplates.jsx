import React, { useState, useRef, useMemo } from "react";
import StandardTemplateTableView from "./StandardTemplateTableView";
import StandardTemplateKanbanView from "./StandardTemplateKanbanView";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";

// Dummy data
const standardTemplates = [
  // Recommended (Online)
  {
    id: "template-3",
    title: "Fully Remote Process",
    description: "End-to-end online: assessment, technical, HR.",
    rounds: "Assessment → Technical → HR",
    bestFor: "Remote roles, distributed teams",
    format: "Fully Online",
    keyCharacteristic: "Location-independent, efficient",
    type: "standard",
    status: "active",
    category: "Recommended (Online)",
  },
  {
    id: "template-4",
    title: "Assessment-First Screening",
    description:
      "Online test filters candidates before technical + HR interviews.",
    rounds: "Assessment → Technical → HR",
    bestFor: "High-volume, junior roles",
    format: "Fully Online",
    keyCharacteristic: "Scales well for bulk hiring",
    type: "standard",
    status: "active",
    category: "Recommended (Online)",
  },
  {
    id: "template-5",
    title: "Express Remote Hiring",
    description: "Quick 2-step online process for urgent or clear-fit roles.",
    rounds: "Technical → HR",
    bestFor: "Urgent hiring needs",
    format: "Fully Online",
    keyCharacteristic: "Fastest, streamlined process",
    type: "standard",
    status: "active",
    category: "Recommended (Online)",
  },
  {
    id: "template-6",
    title: "Rapid Hiring Track",
    description: "Short online assessment, technical & HR discussion.",
    rounds: "Assessment → Technical → HR",
    bestFor: "Fast hiring without compromises",
    format: "Fully Online",
    keyCharacteristic: "Speed + quality balance",
    type: "standard",
    status: "active",
    category: "Recommended (Online)",
  },

  // Hybrid (Mix of Online & Onsite)
  {
    id: "template-1",
    title: "Comprehensive Hybrid Process",
    description: "Complete hiring with assessment, technical, managerial & HR.",
    rounds: "Assessment → Technical → Managerial → HR",
    bestFor: "Senior, critical roles",
    format: "Hybrid (Online + Offline)",
    keyCharacteristic: "Most thorough evaluation",
    type: "standard",
    status: "active",
    category: "Hybrid (Mix of Online & Onsite)",
  },
  {
    id: "template-2",
    title: "Standard Full-Cycle Hybrid",
    description:
      "Balanced process: technical, managerial, HR with some onsite.",
    rounds: "Technical (2) → Managerial → HR",
    bestFor: "Mid-to-senior roles",
    format: "Hybrid (Online + Offline)",
    keyCharacteristic: "Balanced, flexible",
    type: "standard",
    status: "active",
    category: "Hybrid (Mix of Online & Onsite)",
  },
  {
    id: "template-7",
    title: "Flexible Blended Process",
    description:
      "Start online (assessment, technical), finish onsite if needed.",
    rounds: "Assessment → Technical → HR/Final (onsite)",
    bestFor: "Flexible scheduling needs",
    format: "Hybrid (Online + Offline)",
    keyCharacteristic: "Online-first with in-person option",
    type: "standard",
    status: "active",
    category: "Hybrid (Mix of Online & Onsite)",
  },

  // On-Site (Traditional)
  {
    id: "template-8",
    title: "Traditional On-Site Loop",
    description: "Entire process conducted face-to-face.",
    rounds: "Technical (2) → Managerial → HR",
    bestFor: "Roles requiring strong onsite",
    format: "Fully On-Site",
    keyCharacteristic: "Classic, in-depth assessment",
    type: "standard",
    status: "active",
    category: "On-Site (Traditional)",
  },
  {
    id: "template-9",
    title: "Standard In-Person Process",
    description: "Onsite technical + HR in one location.",
    rounds: "Technical → HR",
    bestFor: "Company culture-driven hiring",
    format: "Fully On-Site",
    keyCharacteristic: "Complete onsite day",
    type: "standard",
    status: "active",
    category: "On-Site (Traditional)",
  },
];

const StandardTemplates = () => {
  // Toolbar & Filter state
  const [view, setView] = useState("table"); // Table or Kanban view
  const [searchQuery, setSearchQuery] = useState(""); // Search input
  const [currentPage, setCurrentPage] = useState(0); // Pagination
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false); // Filter popup toggle
  const [isFilterActive, setIsFilterActive] = useState(false); // Filter active indicator
  const filterIconRef = useRef(null); // Reference for filter icon

  // Filter states
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

  // Search normalization for filtering
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";

  // Filtered templates based on search & filters
  const filteredTemplates = useMemo(() => {
    if (!standardTemplates || !Array.isArray(standardTemplates)) return [];
    return standardTemplates.filter((template) => {
      const normalizedQuery = normalizeSpaces(searchQuery);
      const fieldsToSearch = [template?.template, template?.status].filter(
        Boolean
      );

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

      const roundsCount = template?.rounds?.length || 0;
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
  }, [searchQuery, selectedFilters]);

  // Pagination
  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);

  // Toolbar handlers
  const handlePreviousPage = () => {
    if (currentPage > 0) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage((prev) => prev + 1);
  };

  // Filter popup toggle
  const handleFilterIconClick = () => {
    if (standardTemplates?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  // Status filter toggle
  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Rounds filter change
  const handleRoundsChange = (e, type) => {
    const value =
      e.target.value === ""
        ? ""
        : Math.max(0, Math.min(10, Number(e.target.value) || ""));
    setRoundsRange((prev) => ({ ...prev, [type]: value }));
  };

  // Apply filters
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

  // Clear all filters
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
          dataLength={standardTemplates?.length}
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
            {/* Status Filter */}
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

            {/* Created Date Filter */}
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
            <StandardTemplateTableView standardTemplates={standardTemplates} />
          </div>
        ) : (
          <div>
            <StandardTemplateKanbanView standardTemplates={standardTemplates} />
          </div>
        )}
      </div>
    </>
  );
};

export default StandardTemplates;
