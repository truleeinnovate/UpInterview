import { useState, useMemo, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil } from "lucide-react";
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
  const [selectedFilters, setSelectedFilters] = useState({ status: [] });
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const filterIconRef = useRef(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleApplyFilters = () => {
    const filters = { status: selectedStatus };
    setSelectedFilters(filters);
    setIsFilterActive(filters.status.length > 0);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    setSelectedStatus([]);
    setSelectedFilters({ status: [] });
    setIsFilterActive(false);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleFilterIconClick = () => {
    if (templatesData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!templatesData || !Array.isArray(templatesData)) return [];
    return templatesData.filter((template) => {
      const matchesSearchQuery = template?.templateName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(
          template.status
            ? template.status.charAt(0).toUpperCase() + template.status.slice(1)
            : "Active"
        );
      return matchesSearchQuery && matchesStatus;
    });
  }, [templatesData, searchQuery, selectedFilters]);

  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredTemplates.length);
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
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffMonths < 12)
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;
    return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
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
          {value || "N/A"}
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
      render: (value) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
            value === "active"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              : value === "inactive"
              ? "bg-amber-50 text-amber-700 border border-amber-200/60"
              : "bg-slate-50 text-slate-700 border border-slate-200/60"
          }`}
        >
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : "Active"}
        </span>
      ),
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
  ];

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
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
              searchPlaceholder="Search interview templates..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
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
              <TableView
                data={paginatedTemplates}
                columns={tableColumns}
                actions={tableActions}
                loading={isLoading}
                emptyState="No templates found."
                className="table-fixed w-full"
              />
            )}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3">
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
                      {["Archived", "Draft", "Active"].map((status) => (
                        <label
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(status)}
                            onChange={() => handleStatusToggle(status)}
                            className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{status}</span>
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