// v1.0.0  -  mansoor  -  added skeleton structure loading
// v1.0.1  -  Ashok    -  changed the styles at bullet points
// v1.0.2  -  Ashok    -  Improved responsiveness
// v1.0.3  -  Ashok    -  Changed UI
// v2.0.0  -  Updated to My Teams with new schema (department, lead_id, member_ids, is_active, color)

import Cookies from "js-cookie";
import { Outlet, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { usePaginatedTeams } from "../../../../../apiHooks/useInterviewerGroups";
import { useEffect, useRef, useState } from "react";
import Toolbar from "../../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../../Components/Shared/Table/TableView";
import KanbanView from "../../../../../Components/Shared/KanbanCommon/KanbanCommon";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  Pencil,
  Users,
} from "lucide-react";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";
import { getEmptyStateMessage } from "../../../../../utils/EmptyStateMessage/emptyStateMessage";
import { FilterPopup } from "../../../../../Components/Shared/FilterPopup/FilterPopup";
import { UserGroupIcon } from "@heroicons/react/24/outline";

// Team color map for icons
const TEAM_COLOR_MAP = {
  Teal: { bg: "bg-teal-100", icon: "text-teal-600", border: "border-teal-200" },
  Blue: { bg: "bg-blue-100", icon: "text-blue-600", border: "border-blue-200" },
  Purple: { bg: "bg-purple-100", icon: "text-purple-600", border: "border-purple-200" },
  Pink: { bg: "bg-pink-100", icon: "text-pink-600", border: "border-pink-200" },
  Orange: { bg: "bg-orange-100", icon: "text-orange-600", border: "border-orange-200" },
  Green: { bg: "bg-green-100", icon: "text-green-600", border: "border-green-200" },
  Red: { bg: "bg-red-100", icon: "text-red-600", border: "border-red-200" },
  Yellow: { bg: "bg-yellow-100", icon: "text-yellow-600", border: "border-yellow-200" },
};

const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key)
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsKanbanMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {mainActions.map((action) => {
        const baseClasses = "p-1.5 rounded-lg transition-colors hover:bg-opacity-20";
        const bgClass =
          action.key === "view"
            ? "text-custom-blue hover:bg-custom-blue/10"
            : action.key === "edit"
              ? "text-green-600 hover:bg-green-600/10"
              : "text-blue-600 bg-green-600/10";

        return (
          <button
            key={action.key}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(item, e);
            }}
            className={`${baseClasses} ${bgClass}`}
            title={action.label}
          >
            {action.icon}
          </button>
        );
      })}

      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen((prev) => !prev);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isKanbanMoreOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item, e);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  title={action.label}
                >
                  {action.icon && (
                    <span className="mr-2 w-4 h-4 text-gray-500">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Kanban Card Component for Teams
const TeamKanbanCard = ({ team, onView, onEdit }) => {
  const colorConfig = TEAM_COLOR_MAP[team.color] || TEAM_COLOR_MAP.Teal;
  const isActive = team.is_active !== undefined ? team.is_active : team.status === "active";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer h-[180px] flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-lg ${colorConfig.bg} flex items-center justify-center flex-shrink-0`}>
            <UserGroupIcon className={`w-5 h-5 ${colorConfig.icon}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate">
              {capitalizeFirstLetter(team.name) || "Unnamed Team"}
            </h3>
            <p className="text-sm text-gray-500 truncate">{team.department || "No department"}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onView(team);
            }}
            className="p-1.5 text-custom-blue hover:bg-custom-blue/10 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(team);
            }}
            className="p-1.5 text-green-600 hover:bg-green-600/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-1">
        {team.description || "No description provided"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span className="text-sm">{team.numberOfUsers || 0} members</span>
        </div>
        <div className="flex items-center gap-1">
          <StatusBadge status={isActive ? "Active" : "Inactive"} />
        </div>
      </div>
    </div>
  );
};

const MyTeams = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  // State for Toolbar Features
  const [view, setView] = useState("table"); // Default to kanban view for teams
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);

  // Filter states
  const filterIconRef = useRef(null);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
  });

  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // Server-side teams with pagination & filters
  const {
    teams,
    pagination,
    isLoading: teamsLoading,
  } = usePaginatedTeams({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: searchQuery,
    status: selectedFilters.status.join(","),
  });

  const totalItems = pagination?.totalItems || 0;
  const totalPages = pagination?.totalPages || 0;
  const currentTeams = teams || [];

  // Handlers
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0);
  };

  const handlePrevPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isFilterPopupOpen) {
      setTempSelectedStatus(selectedFilters.status);
      setIsStatusOpen(true);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleStatusToggle = (status) => {
    setTempSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleClearAll = () => {
    setTempSelectedStatus([]);
    setSelectedFilters({ status: [] });
    setCurrentPage(0);
    setIsFilterActive(false);
    setIsFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const newFilters = { status: tempSelectedStatus };
    setSelectedFilters(newFilters);
    setCurrentPage(0);
    setIsFilterActive(newFilters.status.length > 0);
    setIsFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (totalItems !== 0 || isFilterActive) {
      setIsFilterPopupOpen((prev) => !prev);
    }
  };

  const handleViewTeam = (team) => {
    navigate(`/account-settings/my-teams/team-details/${team._id}`);
  };

  const handleEditTeam = (team) => {
    navigate(`/account-settings/my-teams/team-edit/${team._id}`);
  };

  // Empty state message
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  const initialDataCount = totalItems || 0;
  const currentFilteredCount = currentTeams.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "teams"
  );

  // Table Columns
  const tableColumns = [
    {
      key: "name",
      header: "Team Name",
      render: (value, row) => {
        const colorConfig = TEAM_COLOR_MAP[row.color] || TEAM_COLOR_MAP.Teal;
        return (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${colorConfig.bg} flex items-center justify-center`}>
              <UserGroupIcon className={`w-4 h-4 ${colorConfig.icon}`} />
            </div>
            <span
              className="text-custom-blue font-medium cursor-pointer hover:underline"
              onClick={() => handleViewTeam(row)}
            >
              {capitalizeFirstLetter(value) || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      render: (value) => (
        <span className="text-gray-600">
          {capitalizeFirstLetter(value) || "—"}
        </span>
      ),
    },
    {
      key: "leadName",
      header: "Team Lead",
      render: (value) => (
        <span className="text-gray-600">
          {value || "—"}
        </span>
      ),
    },
    {
      key: "numberOfUsers",
      header: "Members",
      render: (value) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span>{value ?? 0}</span>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (value, row) => {
        const isActive = value !== undefined ? value : row.status === "active";
        return <StatusBadge status={isActive ? "Active" : "Inactive"} />;
      },
    },
  ];

  // Table Actions
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => handleViewTeam(row),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => handleEditTeam(row),
    },
  ];

  // Kanban columns for the shared component
  const kanbanColumns = [
    {
      key: "department",
      header: "Department",
      render: (value) => <span className="text-gray-500">{value || "No department"}</span>,
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (
        <span className="text-gray-600 line-clamp-2">
          {capitalizeFirstLetter(value) || "No description"}
        </span>
      ),
    },
    {
      key: "numberOfUsers",
      header: "Members",
      render: (value) => (
        <div className="flex items-center gap-2 text-gray-500">
          <Users className="w-4 h-4" />
          <span>{value ?? 0} members</span>
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (value, row) => {
        const isActive = value !== undefined ? value : row.status === "active";
        return <StatusBadge status={isActive ? "Active" : "Inactive"} />;
      },
    },
  ];

  const kanbanActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (item) => handleViewTeam(item),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      onClick: (item) => handleEditTeam(item),
    },
  ];

  return (
    <>
      <div>
        {/* Info Box */}
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg sm:mt-6 flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-teal-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-teal-700">My Teams</span> allows you to organize interviewers into functional groups based on departments, projects, or hiring needs. Teams provide a higher-level organization structure, making it easy to assign interview responsibilities to entire groups and track team-based metrics. Use teams alongside <span className="font-semibold">Interviewer Tags</span> for maximum flexibility in matching interviewers to specific interview rounds.
          </p>
        </div>

        {/* Header */}
        <div className="flex mb-2 mt-2 flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-bold">
            My Teams
          </h2>
          <button
            onClick={() => navigate(`/account-settings/my-teams/team-form`)}
            className="text-sm px-4 py-2 bg-custom-blue text-white rounded-lg whitespace-nowrap hover:bg-custom-blue/90 transition-colors"
          >
            Create Team
          </button>
        </div>

        {/* Toolbar */}
        <div>
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            dataLength={totalItems}
            searchPlaceholder="Search teams..."
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            filterIconRef={filterIconRef}
          />
        </div>

        {/* Content */}
        {view === "table" ? (
          <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
            <TableView
              data={currentTeams}
              columns={tableColumns}
              loading={teamsLoading}
              actions={tableActions}
              emptyState={emptyStateMessage}
            />
          </div>
        ) : (
          <div>
            {teamsLoading ? (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 grid-cols-3 gap-4 mt-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : currentTeams.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {emptyStateMessage}
              </div>
            ) : (
              <div className="grid sm:grid-cols-1 md:grid-cols-2 grid-cols-3 gap-4 mt-4">
                {currentTeams.map((team) => (
                  <div
                    key={team._id}
                    onClick={() => handleViewTeam(team)}
                  >
                    <TeamKanbanCard
                      team={team}
                      onView={handleViewTeam}
                      onEdit={handleEditTeam}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Filter Popup */}
        {isFilterPopupOpen && (
          <FilterPopup
            isOpen={isFilterPopupOpen}
            onClose={() => setIsFilterPopupOpen(false)}
            onApply={handleApplyFilters}
            onClearAll={handleClearAll}
            filterIconRef={filterIconRef}
            customHeight="h-[calc(100vh-22rem)]"
          >
            <div className="space-y-3">
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
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedStatus.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm">
                          {capitalizeFirstLetter(status)}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FilterPopup>
        )}
      </div>
      <Outlet />
    </>
  );
};

// Export with both names for compatibility
export default MyTeams;
export { MyTeams as InterviewerGroups };
