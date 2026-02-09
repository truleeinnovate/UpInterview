import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  Mail,
  Star,
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
import {
  getInterviewerColumns,
  getInterviewerActions,
} from "../../../../utils/tableColumnAndActionData.jsx";

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
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  console.log("interviewer interviewer", interviewer);

  const isActive = interviewer?.interviwer?.is_active || interviewer?.is_active;
  // console.log(interviewer);
  // Get display values
  let displayName =
    // interviewer?.contactDetails?.firstName ||
    interviewer?.contactDetails
      ? interviewer?.contactDetails?.firstName
      : interviewer?.contactId?.firstName + " " + interviewer?.contactDetails
        ? interviewer?.contactDetails?.lastName
        : interviewer?.contactDetails.lastName;
  // : interviewer?.contactId?.lastName;
  let displayEmail = interviewer?.contactDetails
    ? interviewer?.contactDetails?.email
    : interviewer?.contactId?.email;
  let displayAvatar = interviewer?.contactDetails
    ? interviewer?.contactId?.imageData
    : interviewer?.contactDetails?.imageData;
  let displayRole = interviewer?.contactDetails?.currentRoleLabel || interviewer?.contactDetails?.currentRole || interviewer.title || "Interviewer";

  if (
    (interviewer?.interviwer?.interviewer_type ||
      interviewer?.interviewer_type) === "internal" &&
    interviewer.contactId &&
    typeof interviewer.contactId === "object"
  ) {
    const user = interviewer?.contactDetails || interviewer?.contactId;
    // console.log("user user", user);
    const userName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    if (userName) displayName = userName;
    if (user.email) displayEmail = user.email;
    if (user.imageData?.path) displayAvatar = user.imageData.path;
    if (user.currentRoleLabel || user.currentRole) displayRole = user.currentRoleLabel || user.currentRole;
  }

  // Calculate available slots from contactDetails.availability
  const getAvailableSlotsInfo = () => {
    const availability =
      interviewer?.contactId?.availability[0]?.availability ||
      interviewer?.contactDetails?.availability[0]?.availability ||
      [];

    if (availability.length === 0) {
      return {
        text: "No available slots",
        count: 0,
        hasSlots: false,
      };
    }

    // Count total available slots (assuming each availability item represents a slot)
    const slotCount = availability.length;

    return {
      text:
        slotCount === 1 ? "1 slot available" : `${slotCount} slots available`,
      count: slotCount,
      hasSlots: slotCount > 0,
    };
  };

  const slotsInfo = getAvailableSlotsInfo();

  return (
    <div
      className={
        from !== "outsource-interview"
          ? `bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow h-full flex flex-col justify-between`
          : ""
      }
    >
      <div
        className={
          from === "outsource-interview"
            ? "flex flex-col justify-between w-full"
            : ""
        }
      >
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
                onClick={() => onView(interviewer?.interviwer?._id || interviewer?._id)}
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
                    onEdit(interviewer?.interviwer?._id || interviewer?._id);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(interviewer?.interviwer?._id || interviewer?._id);
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

          {(interviewer?.interviwer?.department ||
            interviewer?.interviwer?.external_company) && (
              <div className="flex items-center text-sm text-gray-500 gap-2">
                <Building size={14} className="text-gray-400" />
                <span className="truncate">
                  {interviewer?.interviwer?.interviewer_type === "internal"
                    ? interviewer?.interviwer?.department
                    : interviewer?.interviwer?.external_company}
                </span>
              </div>
            )}

          <div className="flex items-center gap-1 mt-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-sm font-semibold text-gray-700">
              {interviewer?.contactDetails?.rating
                ? interviewer?.contactDetails?.rating.toFixed(1) || "N/A"
                : interviewer?.contactId?.rating?.toFixed(1) || "N/A"}
            </span>
            <span className="text-xs text-gray-400">rating</span>
          </div>

          {interviewer?.team && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded border border-gray-200 text-xs font-semibold text-gray-600 bg-gray-50">
                Team:{" "}
                {interviewer?.interviwer?.team?.name || interviewer?.team?.name}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {(interviewer?.interviwer?.tags || interviewer?.tag_ids) &&
              (interviewer?.tag_ids || interviewer?.interviwer?.tags || [])
                .slice(0, 3)
                .map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded text-xs border border-purple-200 text-purple-600 bg-purple-50"
                  >
                    {tag?.name}
                  </span>
                ))}
          </div>
        </div>

        {/* Available Slots - Updated to show actual data */}
        {/* <div className="w-full "> */}
        <div
          className={`rounded-lg p-3 mb-4 flex items-start gap-2 ${slotsInfo.hasSlots ? "bg-green-50" : "bg-blue-50"}`}
        >
          <Clock
            size={16}
            className={`mt-0.5 ${slotsInfo.hasSlots ? "text-green-600" : "text-blue-500"}`}
          />
          <div>
            <p
              className={`text-sm font-medium ${slotsInfo.hasSlots ? "text-green-700" : "text-blue-700"}`}
            >
              {slotsInfo.hasSlots ? "Available Slots" : "Available Slots"}
            </p>
            <p
              className={`text-xs ${slotsInfo.hasSlots ? "text-green-600" : "text-blue-600"}`}
            >
              {slotsInfo.text}
            </p>
            {slotsInfo.hasSlots && (
              <p className="text-xs text-gray-500 mt-1">
                Check calendar for details
              </p>
            )}
          </div>
        </div>
        {/* </div> */}
      </div>
      {from !== "outsource-interview" && (
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
          <div className="flex items-center gap-2">
            <button
              //onClick={() => onToggleActive(interviewer?.interviwer?._id || interviewer?._id, !isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-custom-blue" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span className="text-sm text-gray-600">
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <button
            onClick={() => onView(interviewer?.interviwer?._id || interviewer?._id)}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
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

  const handleEdit = (rowOrId) => {
    const id = typeof rowOrId === 'string' ? rowOrId : rowOrId?.interviwer?._id || rowOrId?._id;
    if (id) navigate(`/interviewers/${id}/edit`);
  };

  const handleView = (rowOrId) => {
    const id = typeof rowOrId === 'string' ? rowOrId : rowOrId?.interviwer?._id || rowOrId?._id;
    if (id) navigate(`/interviewers/${id}`);
  };

  const handleDelete = async (rowOrId) => {
    const id = typeof rowOrId === 'string' ? rowOrId : rowOrId?.interviwer?._id || rowOrId?._id;
    if (id && window.confirm("Are you sure you want to delete this interviewer?")) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleToggleActive = async (rowOrId, statusOverride) => {
    let id, isActive;

    if (typeof rowOrId === 'string') {
      id = rowOrId;
      isActive = statusOverride;
    } else {
      id = rowOrId?.interviwer?._id || rowOrId?._id;
      isActive = !rowOrId?.interviwer?.is_active; // Should we check outer is_active too? relying on controller structure
    }

    if (id) {
      await toggleActiveMutation.mutateAsync({ id, is_active: isActive });
    }
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

  // console.log("interviewers", interviewers);

  const emptyStateMessage = getEmptyStateMessage(
    searchQuery,
    pagination.totalItems || 0,
    "Interviewers",
  );

  // Use shared configurations
  const columns = getInterviewerColumns(navigate, {
    onInterviewerClick: handleView,
    permissions: effectivePermissions,
  });

  const actions = getInterviewerActions(navigate, {
    permissions: effectivePermissions,
    callbacks: {
      onEdit: handleEdit,
      onDelete: handleDelete,
      onToggleStatus: handleToggleActive,
    },
  });

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
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-4 gap-6 px-4">
            {interviewers.map((interviewer) => (
              <InterviewerCard
                key={interviewer?.interviwer?._id}
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
