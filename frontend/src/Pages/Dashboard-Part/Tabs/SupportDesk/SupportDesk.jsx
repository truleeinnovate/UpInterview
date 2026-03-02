/* eslint-disable react/prop-types */
//<---------------------- v1.0.0----Venkatesh----in header add padding at top
// v1.0.1 - Ashraf - Added subject field
// v1.0.2  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.3 - Venkatesh --- added new filters issue types,priority and created date
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Fixed issues in responsiveness
// v1.0.6 - Ashok - Added common code to kanban
// v1.0.7 - Ashok - Added clickable title to navigate to details page at kanban
// v1.0.8 - Ashok - Fixed outerScroll issue

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, MoreVertical, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useSupportTickets } from "../../../../apiHooks/useSupportDesks";
import { usePermissions } from "../../../../Context/PermissionsContext.js";
import { usePermissionCheck } from "../../../../utils/permissionUtils";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import { useMediaQuery } from "react-responsive";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock.js";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";
import {
  getSupportTicketColumns,
  getSupportTicketActions,
} from "../../../../utils/tableColumnAndActionData.jsx";
import { useTitle } from "../../../../apiHooks/Title/useTitle.js";

const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // Call function to get actions for this item
  const actions = kanbanActions(item);
  const mainActions = actions.filter((a) => ["view", "edit"].includes(a.key));
  const overflowActions = actions.filter(
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
      {/* Always visible actions */}
      {/* {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item, e);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))} */}
      {mainActions.map((action) => {
        const baseClasses =
          "p-1.5 rounded-lg transition-colors hover:bg-opacity-20";
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

      {/* More button (shows dropdown) */}
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

          {/* Dropdown Menu */}
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

function SupportDesk() {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const {
    effectivePermissions,
    // superAdminPermissions,
    impersonatedUser_roleName,
    effectivePermissions_RoleName,
  } = usePermissions();

  const impersonationToken = Cookies.get("impersonationToken");
  const impersonationPayload = impersonationToken
    ? decodeJwt(impersonationToken)
    : null;
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const currentUserId = tokenPayload?.userId;
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    issueTypes: [],
    priorities: [],
    createdDate: "",
  });
  const [viewMode, setViewMode] = useState("table");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [isIssueTypeOpen, setIsIssueTypeOpen] = useState(false);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState([]);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [createdDate, setCreatedDate] = useState(""); // '', 'last7', 'last30'
  const navigate = useNavigate();
  const filterIconRef = useRef(null);
  const { tickets, isLoading } = useSupportTickets({
    search: searchQuery,
    status: selectedFilters.status,
    issueTypes: selectedFilters.issueTypes,
    priorities: selectedFilters.priorities,
    createdDate: selectedFilters.createdDate,
    page: currentPage, // This is now properly sent to backend
    limit: itemsPerPage,
  });

  const totalPages = Math.ceil(tickets?.totalCount / itemsPerPage);
  const currentFilteredRows = tickets?.tickets || [];

  // Title ----------------------------------------
  useTitle("Support Desk");
  // Title ----------------------------------------

  // v1.0.4 <-----------------------------------------------------------
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  useScrollLock(viewMode === "kanban" || viewMode === "table"); // when view is kanban disable outer scrollbar

  // handling kanban view and table view
  useEffect(() => {
    // Only run on isTablet change
    if (isTablet) {
      setViewMode("kanban");
    } else {
      setViewMode("table");
    }
  }, [isTablet]);

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("SupportDesk")) {
    return null;
  }

  // handling search input
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(0); // Reset to first page when searching
  };

  // clear all filters
  const handleClearFilters = () => {
    setSelectedFilters({
      status: [],
      issueTypes: [],
      priorities: [],
      createdDate: "",
    }); //<-------v1.0.3--------
    setIsFilterActive(false);
    setIsFilterPopupOpen(false);
    setCurrentPage(0);
    // Rest filter popup UI state
    setIsStatusOpen(false);
    setSelectedStatus([]);
    setIsIssueTypeOpen(false);
    setSelectedIssueTypes([]);
    setIsPriorityOpen(false);
    setSelectedPriorities([]);
    setIsCreatedOpen(false);
    setCreatedDate("");
    //-------v1.0.3-------->
  };

  //  handling filter pop up  showing
  const handleFilterIconClick = () => {
    if (tickets?.tickets?.length !== 0 || isFilterActive) {
      setIsFilterPopupOpen((prev) => !prev);
    }
  };

  //  handling next page pagination
  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  //  handling prev page pagination
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Based on priority color shoing data
  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = ["New", "Assigned", "Inprogress", "Resolved", "Close"];
  //<-------v1.0.3--------
  const issueTypeOptions = [
    "Payment Issue",
    "Technical Issue",
    "Account Issue",
    "Interview Feedback Issue",
    "Scheduling Problem",
    "Video/Audio Issue",
    "Assessment Issue",
    "Candidate Not Available",
    "Interviewer Not Available",
    "Reschedule Request",
    "Technical Issue",
    "Internet Connectivity (Candidate)",
    "Internet Connectivity (Interviewer)",
    "Audio/Video Problem",
    "Platform Issue",
  ];
  const priorityOptions = ["High", "Medium", "Low"];

  const handleStatusToggle = (option) => {
    setSelectedStatus((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleIssueTypeToggle = (option) => {
    setSelectedIssueTypes((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handlePriorityToggle = (option) => {
    setSelectedPriorities((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      issueTypes: selectedIssueTypes,
      priorities: selectedPriorities,
      createdDate: createdDate,
    };
    setSelectedFilters(filters);
    const active =
      filters?.status.length > 0 ||
      filters?.issueTypes.length > 0 ||
      filters?.priorities.length > 0 ||
      (!!filters?.createdDate && filters?.createdDate !== "");
    setIsFilterActive(active);
    setIsFilterPopupOpen(false);
    setCurrentPage(0); // Reset page
  };
  // v1.0.6 <----------------------------------------------------------------------

  // ------------------- Dynamic Empty State Messages using Utility ---------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive; // Use totalCount from the API response for the initial count
  const initialDataCount = tickets?.totalCount || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Tickets" // Entity Name
  );
  // ------------------- Dynamic Empty State Messages using Utility ---------------------

  //  table column
  const roleNames = {
    effectiveRole: effectivePermissions_RoleName,
    impersonatedRole: impersonatedUser_roleName,
    impersonatedUserId: impersonationPayload?.impersonatedUserId,
  };

  const tableColumns = getSupportTicketColumns(navigate, {
    roleNames,
  });

  const tableActions = getSupportTicketActions(navigate, {
    roleNames,
  });

  const kanbanColumns = [
    {
      key: "contact",
      header: "Contact",
      render: (value) => capitalizeFirstLetter(value) || "N/A",
    },
    {
      key: "issueType",
      header: "Issue Type",
      render: (value) => capitalizeFirstLetter(value) || "N/A",
    },
    {
      key: "subject",
      header: "Subject",
      render: (value) => (
        <span className="cursor-default" title={capitalizeFirstLetter(value)}>
          {capitalizeFirstLetter(value) || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge
          status={value}
          text={value ? capitalizeFirstLetter(value) : "Not Provided"}
        />
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (value) => (
        <span>
          {<StatusBadge status={capitalizeFirstLetter(value)} /> ||
            "Not Provided"}
        </span>
      ),
    },
    ...(impersonatedUser_roleName === "Super_Admin"
      ? [
        {
          key: "assignedTo",
          header: "Assigned To",
          render: (value) => value || "N/A",
        },
      ]
      : []),
  ];

  const hasActionAccess = (ticket) => {
    if (impersonatedUser_roleName === "Super_Admin") {
      return true;
    } else if (impersonatedUser_roleName === "Support_Team") {
      return (
        ticket.assignedToId === currentUserId || ticket.owner === currentUserId
      );
    } else if (
      effectivePermissions_RoleName === "Admin" ||
      effectivePermissions_RoleName === "Individual_Freelancer" ||
      effectivePermissions_RoleName === "Individual"
    ) {
      return true;
    } else {
      return ticket.assignedToId === currentUserId;
    }
  };

  const kanbanActions = (ticket) => {
    if (!hasActionAccess(ticket)) return [];

    return [
      {
        key: "view",
        label: "View Details",
        icon: <Eye className="w-4 h-4 text-custom-blue" />,
        onClick: () =>
          navigate(
            effectivePermissions_RoleName === "Admin" ||
              effectivePermissions_RoleName === "Individual_Freelancer" ||
              effectivePermissions_RoleName === "Individual"
              ? `/support-desk/${ticket._id}`
              : `/support-desk/view/${ticket._id}`,
            { state: { ticketData: ticket } }
          ),
      },
      ...(effectivePermissions_RoleName === "Admin" ||
        effectivePermissions_RoleName === "Individual_Freelancer" ||
        effectivePermissions_RoleName === "Individual"
        ? [
          {
            key: "edit",
            label: "Edit Ticket",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: () =>
              navigate(`/support-desk/edit-ticket/${ticket._id}`, {
                state: { ticketData: ticket },
              }),
          },
        ]
        : []),
    ];
  };

  // v1.0.6 ---------------------------------------------------------------------->

  return (
    <div className="bg-background h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-12 left-0 right-0 bg-background">
        {/*<-------v1.0.0------- */}
        {/* v1.0.4 <----------------------------------------------------- */}
        <main className="px-6 sm:pt-4 md:pt-6 lg:pt-6 xl:pt-6 2xl:pt-6">
          {/* v1.0.4 -----------------------------------------------------> */}
          {/*-------v1.0.0-------> */}
          <div className="sm:px-0">
            <Header
              title="Support Desk"
              onAddClick={() => navigate("/support-desk/new-ticket")}
              addButtonText="Create Ticket"
              canCreate={effectivePermissions.SupportDesk?.Create}
            />

            <Toolbar
              view={viewMode}
              setView={setViewMode}
              searchQuery={searchQuery}
              onSearch={handleSearchInputChange}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterActive={isFilterActive}
              isFilterPopupOpen={isFilterPopupOpen}
              dataLength={tickets?.tickets?.length}
              searchPlaceholder="Search by Id, Contact, Subject, Issue Type, Priority..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>

      {tickets?.length === 0 && (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">No tickets found</p>
        </div>
      )}
      {/* v1.0.4 <------------------------------------------------------------------------------ */}
      {/* <main className="fixed top-48 left-0 right-0 bg-background"> */}
      {/* v1.0.5 <------------------------------------------------------------------------------------ */}
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* v1.0.5 ------------------------------------------------------------------------------------> */}
        {/* v1.0.4 ------------------------------------------------------------------------------> */}
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  actions={tableActions}
                  loading={isLoading}
                  emptyState={emptyStateMessage}
                  className="table-fixed w-full"
                />
              </div>
            ) : (
              // v1.0.6 <----------------------------------------------------------------
              <KanbanView
                data={currentFilteredRows.map((ticket) => ({
                  ...ticket,
                  id: ticket._id,
                  title: ticket?.ticketCode,
                  subTitle: formatDateTime(ticket?.createdAt),
                }))}
                loading={isLoading}
                columns={kanbanColumns}
                renderActions={(item) => (
                  <KanbanActionsMenu
                    item={item}
                    kanbanActions={kanbanActions}
                  />
                )}
                onTitleClick={(ticket) => {
                  navigate(
                    effectivePermissions_RoleName === "Admin" ||
                      effectivePermissions_RoleName ===
                      "Individual_Freelancer" ||
                      effectivePermissions_RoleName === "Individual"
                      ? `/support-desk/${ticket._id}`
                      : `/support-desk/view/${ticket._id}`,
                    { state: { ticketData: ticket } }
                  );
                }}
                emptyState={emptyStateMessage}
                kanbanTitle="Ticket"
              />
              // v1.0.6 ---------------------------------------------------------------->
            )}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setIsFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearFilters}
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
                      {statusOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(option)}
                            onChange={() => handleStatusToggle(option)}
                            // v1.0.2 <-------------------------------------------------------------
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          // v1.0.2 ------------------------------------------------------------->
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                {/*<-------v1.0.3-------- */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsIssueTypeOpen(!isIssueTypeOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Issue Type
                    </span>
                    {isIssueTypeOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isIssueTypeOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {issueTypeOptions.map((option) => (
                        <label
                          key={option}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIssueTypes.includes(option)}
                            onChange={() => handleIssueTypeToggle(option)}
                            className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {impersonatedUser_roleName === "Super_Admin" && (
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Priority
                      </span>
                      {isPriorityOpen ? (
                        <MdKeyboardArrowUp className="text-xl text-gray-700" />
                      ) : (
                        <MdKeyboardArrowDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isPriorityOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {priorityOptions.map((option) => (
                          <label
                            key={option}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="checkbox"
                              checked={selectedPriorities.includes(option)}
                              onChange={() => handlePriorityToggle(option)}
                              className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedOpen(!isCreatedOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Created At
                    </span>
                    {isCreatedOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isCreatedOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDate"
                          value=""
                          checked={createdDate === ""}
                          onChange={() => setCreatedDate("")}
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm">Any time</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDate"
                          value="last7"
                          checked={createdDate === "last7"}
                          onChange={() => setCreatedDate("last7")}
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm">Last 7 days</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="createdDate"
                          value="last30"
                          checked={createdDate === "last30"}
                          onChange={() => setCreatedDate("last30")}
                          className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm">Last 30 days</span>
                      </label>
                    </div>
                  )}
                </div>
                {/*-------v1.0.3--------> */}
              </div>
            </FilterPopup>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default SupportDesk;
