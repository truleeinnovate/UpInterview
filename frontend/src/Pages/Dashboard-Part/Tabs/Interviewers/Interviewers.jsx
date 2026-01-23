import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Mail,
  Briefcase,
  Star,
  Users,
  Building,
  Eye,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Clock,
} from "lucide-react";
import {
  usePaginatedInterviewers,
  useToggleInterviewerActive,
  useDeleteInterviewer,
} from "../../../../apiHooks/useInterviewers";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import TableView from "../../../../Components/Shared/Table/TableView";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage";
import Header from "../../../../Components/Shared/Header/Header";
import { usePermissions } from "../../../../Context/PermissionsContext";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";

// Card Component for Kanban View
export const InterviewerCard = ({
  interviewer,
  onEdit,
  onDelete,
  onToggleActive,
  onView,
  from,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  console.log("interviewer", interviewer);
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isActive = interviewer.is_active;
  // console.log(interviewer);
  // Get display values
  let displayName = interviewer.full_name;
  let displayEmail = interviewer.email;
  let displayAvatar = interviewer.avatar_url;
  let displayRole = interviewer.title || "Interviewer";

  if (
    interviewer.interviewer_type === "internal" &&
    interviewer.user_id &&
    typeof interviewer.user_id === "object"
  ) {
    const user = interviewer.user_id;
    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (userName) displayName = userName;
    if (user.email) displayEmail = user.email;
    if (user.imageData?.path) displayAvatar = user.imageData.path;
    if (user.currentRole) displayRole = user.currentRole;
  }

  return (
    <div
      className={
        from !== "outsource-interview" &&
        `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow h-full flex flex-col justify-between`
      }
    >
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover border border-gray-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold text-lg">
                {(displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3
                className="font-bold text-gray-900 text-lg leading-tight cursor-pointer hover:text-blue-600"
                onClick={() => onView(interviewer._id)}
              >
                {displayName || "Unknown"}
              </h3>
              <p className="text-gray-500 text-sm">{displayRole}</p>
            </div>
          </div>

          {/* Menu Button */}

          <div className="relative" ref={menuRef}>
            {from !== "outsource-interview" && (
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
              >
                <MoreVertical size={18} />
              </button>
            )}

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(interviewer._id);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(interviewer._id);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500 gap-2">
            <Mail size={14} className="text-gray-400" />
            <span className="truncate">{displayEmail || "-"}</span>
          </div>

          {(interviewer.department || interviewer.external_company) && (
            <div className="flex items-center text-sm text-gray-500 gap-2">
              <Building size={14} className="text-gray-400" />
              <span className="truncate">
                {interviewer.interviewer_type === "internal"
                  ? interviewer.department
                  : interviewer.external_company}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700">
              {interviewer.user_id?.rating
                ? interviewer.user_id?.rating.toFixed(1)
                : "0"}
            </span>
            <span className="text-xs text-gray-400">rating</span>
          </div>

          {interviewer.team_id && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded border border-gray-200 text-xs font-semibold text-gray-600 bg-gray-50">
                Team: {interviewer.team_id.name}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {interviewer.tag_ids &&
              interviewer.tag_ids.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-xs border border-purple-200 text-purple-600 bg-purple-50"
                >
                  {tag.name}
                </span>
              ))}
          </div>
        </div>

        {/* Available Slots Mockup */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4 flex items-start gap-2">
          <Clock size={16} className="text-blue-500 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-blue-700">
              Available Slots
            </p>
            <p className="text-xs text-blue-600">Not Available</p>
          </div>
        </div>
      </div>
      {from !== "outsource-interview" && (
        <div className="flex justify-between items-center pt-2 mt-auto">
          <div className="flex items-center gap-2">
            <div
              className={`w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out ${isActive ? "bg-black" : "bg-gray-300"}`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out ${isActive ? "translate-x-5" : ""}`}
              ></div>
            </div>
            <span className="text-sm text-gray-600">Active</span>
          </div>

          <button
            onClick={() => onView(interviewer?._id)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Eye size={14} />
            View
          </button>
        </div>
      )}
    </div>
  );
};

const Interviewers = () => {
  const navigate = useNavigate();
  const { effectivePermissions } = usePermissions();
  const [view, setView] = useState("table"); // 'grid' for kanban, 'table' for table
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [filters, setFilters] = useState({
    type: "",
    status: "",
    team: "",
    tag: "",
  });

  // Filter popup state
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);

  const { data, isLoading, isError, refetch } = usePaginatedInterviewers({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    ...filters,
  });

  const toggleActiveMutation = useToggleInterviewerActive();
  const deleteMutation = useDeleteInterviewer();

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleEdit = (id) => {
    navigate(`/interviewers/${id}/edit`);
  };

  const handleView = (id) => {
    navigate(`/interviewers/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this interviewer?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (id, isActive) => {
    await toggleActiveMutation.mutateAsync({ id, is_active: isActive });
  };

  // Filter handlers
  const handleFilterClick = () => {
    setIsFilterPopupOpen(!isFilterPopupOpen);
  };

  const handleApplyFilters = () => {
    setCurrentPage(0);
    setIsFilterPopupOpen(false);
  };

  const handleClearAllFilters = () => {
    setFilters({
      type: "",
      status: "",
      team: "",
      tag: "",
    });
    setCurrentPage(0);
  };

  const interviewers = data?.data || [];
  const pagination = data?.pagination || {};

  const emptyStateMessage = getEmptyStateMessage(
    searchQuery,
    pagination.totalItems || 0,
    "interviewers",
  );

  // Table columns
  const columns = [
    {
      key: "full_name",
      header: "Name",
      render: (value, row) => {
        let displayName = row.full_name;
        let displayAvatar = row.avatar_url;

        if (
          row.interviewer_type === "internal" &&
          row.user_id &&
          typeof row.user_id === "object"
        ) {
          const user = row.user_id;
          const userName =
            `${user.firstName || ""} ${user.lastName || ""}`.trim();
          if (userName) displayName = userName;
          if (user.imageData?.path) displayAvatar = user.imageData.path;
        }

        return (
          <div className="flex items-center gap-3">
            {displayAvatar ? (
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                {(displayName || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <span
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                onClick={() => handleView(row._id)}
              >
                {displayName || "Unknown"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "email",
      header: "Email",
      render: (value, row) => {
        let displayEmail = value;
        if (!displayEmail && row.user_id?.email) {
          displayEmail = row.user_id.email;
        }
        return <span className="text-gray-600">{displayEmail || "-"}</span>;
      },
    },
    {
      key: "interviewer_type",
      header: "Type",
      render: (value) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${value === "internal" ? "bg-purple-100 text-purple-700" : "bg-orange-100 text-orange-700"}`}
        >
          {capitalizeFirstLetter(value)}
        </span>
      ),
    },
    // { key: 'title', header: 'Title', render: (value) => value || '-' },
    { key: "team_id", header: "Team", render: (value) => value?.name || "-" },
    {
      key: "is_active",
      header: "Status",
      render: (value) => <StatusBadge status={value ? "Active" : "Inactive"} />,
    },
  ];

  // Table actions
  const actions = [
    {
      key: "view",
      label: "View",
      icon: <Eye size={16} className="text-gray-500" />,
      onClick: (row) => handleView(row._id),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil size={16} className="text-gray-500" />,
      onClick: (row) => handleEdit(row._id),
      show: () => effectivePermissions?.Interviewers?.Edit,
    },
    {
      key: "toggle",
      label: (row) => (row.is_active ? "Deactivate" : "Activate"),
      icon: (row) =>
        row.is_active ? (
          <ToggleLeft size={16} className="text-red-500" />
        ) : (
          <ToggleRight size={16} className="text-green-500" />
        ),
      onClick: (row) => handleToggleActive(row._id, !row.is_active),
      show: () => effectivePermissions?.Interviewers?.Edit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 size={16} className="text-red-500" />,
      onClick: (row) => handleDelete(row._id),
      show: () => effectivePermissions?.Interviewers?.Delete,
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-2 px-6">
        <Header
          title="Interviewers"
          onAddClick={() => navigate("/interviewers/new")}
          addButtonText="Add Interviewer"
          canCreate={effectivePermissions?.Interviewers?.Create}
        />
        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={pagination.totalPages || 0}
          onPrevPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNextPage={() => setCurrentPage((p) => p + 1)}
          dataLength={pagination.totalItems || 0}
          searchPlaceholder="Search interviewers..."
          onFilterClick={handleFilterClick}
          isFilterPopupOpen={isFilterPopupOpen}
          filterIconRef={filterIconRef}
          isFilterActive={
            filters.type || filters.status || filters.team || filters.tag
          }
        />
      </div>

      {/* Filter Popup */}
      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        onApply={handleApplyFilters}
        onClearAll={handleClearAllFilters}
        filterIconRef={filterIconRef}
      >
        <div className="space-y-4">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </FilterPopup>

      {/* Content - Toggle between Grid (Kanban) and Table View */}
      {view === "kanban" ? (
        // Kanban/Card View
        isLoading ? (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 rounded-xl animate-pulse"
              ></div>
            ))}
          </div>
        ) : interviewers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
            {emptyStateMessage}
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-4 gap-6">
            {interviewers.map((interviewer) => (
              <InterviewerCard
                key={interviewer._id}
                interviewer={interviewer}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onView={handleView}
              />
            ))}
          </div>
        )
      ) : (
        // Table View
        <TableView
          data={interviewers}
          columns={columns}
          loading={isLoading}
          actions={actions}
          emptyState={emptyStateMessage}
          autoHeight={false}
        />
      )}
    </div>
  );
};

export default Interviewers;
