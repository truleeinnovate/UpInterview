/* eslint-disable react/prop-types */
//<---------------------- v1.0.0----Venkatesh----in header add padding at top
// v1.0.1 - Ashraf - Added subject field
// v1.0.2  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.3 - Venkatesh --- added new filters issue types,priority and created date
import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Eye, Pencil, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { parseISO, isValid, format } from "date-fns"; // Import date-fns functions
import Header from "../../../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "./KanbanView.jsx";
import { ReactComponent as MdKeyboardArrowUp } from "../../../../icons/MdKeyboardArrowUp.svg";
import { ReactComponent as MdKeyboardArrowDown } from "../../../../icons/MdKeyboardArrowDown.svg";
import { useCustomContext } from "../../../../Context/Contextfetch";
import { useSupportTickets } from "../../../../apiHooks/useSupportDesks";
import { usePermissions } from "../../../../Context/PermissionsContext.js";
import { usePermissionCheck } from "../../../../utils/permissionUtils";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";


function SupportDesk() {

  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions, superAdminPermissions, impersonatedUser_roleName, effectivePermissions_RoleName } = usePermissions();
  console.log("impersonatedUser_roleName",impersonatedUser_roleName)
  const { tickets, isLoading } = useSupportTickets();
  const impersonationToken = Cookies.get("impersonationToken");
  const impersonationPayload = impersonationToken ? decodeJwt(impersonationToken) : null;
  const { userRole } = useCustomContext();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const currentUserId = tokenPayload?.userId;
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemsPerPage] = useState(10);
  const [selectedFilters, setSelectedFilters] = useState({ status: [], issueTypes: [], priorities: [], createdDate: "" });//<-------v1.0.3--------
  const [viewMode, setViewMode] = useState("table");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  //<-------v1.0.3--------
  const [isIssueTypeOpen, setIsIssueTypeOpen] = useState(false);
  const [selectedIssueTypes, setSelectedIssueTypes] = useState([]);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);
  const [createdDate, setCreatedDate] = useState(""); // '', 'last7', 'last30'
  //-------v1.0.3-------->
  const navigate = useNavigate();
  const filterIconRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("SupportDesk")) {
    return null;
  }

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    //<-------v1.0.3--------
    const active =
      ((filters.status?.length) || 0) > 0 ||
      ((filters.issueTypes?.length) || 0) > 0 ||
      ((filters.priorities?.length) || 0) > 0 ||
      (!!filters.createdDate && filters.createdDate !== "");
    setIsFilterActive(active);
    //-------v1.0.3-------->
    setIsFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedFilters({ status: [], issueTypes: [], priorities: [], createdDate: "" });//<-------v1.0.3--------
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

  const handleFilterIconClick = () => {
    if (tickets?.length !== 0) {
      setIsFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(tickets)) return [];
    return tickets.filter((ticket) => {
      const ticketId = ticket.ticketCode?.toLowerCase() || "";
      const contact = ticket.contact?.toLowerCase() || "";
      const matchesSearchQuery =
        !searchQuery ||
        ticketId.includes(searchQuery.toLowerCase()) ||
        contact.includes(searchQuery.toLowerCase()) ||
        ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase());
        //ticket.assignedTo?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
      //<-------v1.0.3--------  
      (selectedFilters.status?.length || 0) === 0 ||
        selectedFilters.status.includes(ticket.status);

      const matchesIssueType =
        (selectedFilters.issueTypes?.length || 0) === 0 ||
        selectedFilters.issueTypes.includes(ticket.issueType);

      const matchesPriority =
        (selectedFilters.priorities?.length || 0) === 0 ||
        selectedFilters.priorities.includes(ticket.priority);

      const matchesCreatedDate = (() => {
        const preset = selectedFilters.createdDate;
        if (!preset) return true; // Any time
        const createdAt = ticket.createdAt ? parseISO(ticket.createdAt) : null;
        if (!createdAt || !isValid(createdAt)) return false;
        const now = new Date();
        const days = preset === "last7" ? 7 : preset === "last30" ? 30 : null;
        if (!days) return true;
        const cutoff = new Date(now);
        cutoff.setDate(now.getDate() - days);
        return createdAt >= cutoff;
      })();

      return (
        matchesSearchQuery &&
        matchesStatus &&
        matchesIssueType &&
        matchesPriority &&
        matchesCreatedDate
      );
      //-------v1.0.3-------->
    });
  };

  const totalPages = Math.ceil(FilteredData().length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentFilteredRows = FilteredData().slice(
    startIndex,
    startIndex + itemsPerPage
  );
  console.log("currentFilteredRows", currentFilteredRows);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = parseISO(dateString);
    return isValid(date) ? format(date, "dd MMM yyyy") : "N/A";
  };


  // const hasActionAccess = (ticket) => {
  //   if (impersonatedUser_roleName === "Super_Admin") {
  //     return true;
  //   } else if (impersonatedUser_roleName === "Support_Team") {
  //     return ticket.assignedToId === currentUserId || ticket.owner === currentUserId;
  //   } else if (effectivePermissions_RoleName === "Admin") {
  //     return true;
  //   } else {
  //     return ticket.assignedToId === currentUserId;
  //   }
  // };

  const tableColumns = [
    {
      key: "ticketCode",
      header: "Ticket ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => {
            const path =
              effectivePermissions_RoleName === "Admin" || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
                ? `/support-desk/${row?._id}`
                : row.assignedToId ===
                    impersonationPayload.impersonatedUserId &&
                  impersonatedUser_roleName === "Support_Team"
                ? `/support-desk/view/${row?._id}`
                : impersonatedUser_roleName === "Super_Admin"
                ? `/support-desk/view/${row?._id}`
                : `/support-desk/${row?._id}`;
            navigate(path, { state: { ticketData: row } });
          }}
        >
          {value || "N/A"}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (value) =>
        value?.charAt(0).toUpperCase() + value.slice(1) || "N/A",
    },
// v1.0.1 ---------------------------------------------------------------------------->
    
    {
      key: "subject",
      header: "Subject",
      render: (value) => value || "N/A",
    },
// v1.0.1 ---------------------------------------------------------------------------->
    {
      key: "issueType",
      header: "Issue Type",
      render: (value) => value || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <StatusBadge status={value} text={value ? value.charAt(0).toUpperCase() + value.slice(1) : "Not Provided"}/>
        
      ),
    },
    ...(impersonatedUser_roleName === "Super_Admin" ||
    impersonatedUser_roleName === "Support_Team"
      ? [
          {
            key: "priority",
            header: "Priority",
            render: (value) => (
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(
                  value
                )}`}
              >
                {value || "N/A"}
              </span>
            ),
          },
        ]
      : []),
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => formatDate(value),
    },
    ...(impersonatedUser_roleName === "Super_Admin" ||
    impersonatedUser_roleName === "Support_Team"
      ? [
          {
            key: "assignedTo",
            header: "Assigned To",
            render: (value) =>
              value?.charAt(0).toUpperCase() + value.slice(1) || "N/A",
          },
        ]
      : []),
  ];

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

  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => {
        const path =
          effectivePermissions_RoleName === "Admin" || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
            ? `/support-desk/${row._id}`
            : row.assignedToId === impersonationPayload.impersonatedUserId &&
              impersonatedUser_roleName === "Support_Team"
            ? `/support-desk/view/${row._id}`
            : impersonatedUser_roleName === "Super_Admin"
            ? `/support-desk/view/${row._id}`
            : `/support-desk/${row._id}`;
        navigate(path, { state: { ticketData: row } });
      },
      //disabled: (row) => !hasActionAccess(row),
    },
    ...(effectivePermissions_RoleName === "Admin" || effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) =>
              navigate(`/support-desk/edit-ticket/${row._id}`, {
                state: { ticketData: row },
              }),
            //disabled: (row) => !hasActionAccess(row),
          },
        ]
      : []),
  ];

  const statusOptions = ["New", "Assigned", "Inprogress", "Resolved", "Close"];
  //<-------v1.0.3-------- 
  const issueTypeOptions = ["Payment Issue",
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
    "Platform Issue"]
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
    handleFilterChange({
      status: selectedStatus,
      issueTypes: selectedIssueTypes,
      priorities: selectedPriorities,
      createdDate: createdDate,
    });
    //-------v1.0.3-------->
  };

  return (
    <div className="bg-background h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-12 left-0 right-0 bg-background">
        {/*<-------v1.0.0------- */}
        <main className="px-6 pt-6">
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
              dataLength={tickets?.length}
              searchPlaceholder="Search by ID or Contact..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="fixed top-48 left-0 right-0 bg-background">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {viewMode === "table" ? (
              <TableView
                data={currentFilteredRows}
                columns={tableColumns}
                actions={tableActions}
                loading={isLoading}
                emptyState="No tickets found."
                className="table-fixed w-full"
              />
            ) : (
              <KanbanView
                currentTickets={currentFilteredRows}
                tickets={tickets}
                effectivePermissions_RoleName={effectivePermissions_RoleName}
                impersonatedUser_roleName={impersonatedUser_roleName}
                impersonationPayloadID={impersonationPayload?.impersonatedUserId}
                loading={isLoading}
                currentUserId={currentUserId}
              />
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
                    <span className="font-medium text-gray-700">Issue Type</span>
                    {isIssueTypeOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isIssueTypeOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {issueTypeOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
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

                {impersonatedUser_roleName === "Super_Admin" && (<div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                  >
                    <span className="font-medium text-gray-700">Priority</span>
                    {isPriorityOpen ? (
                      <MdKeyboardArrowUp className="text-xl text-gray-700" />
                    ) : (
                      <MdKeyboardArrowDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isPriorityOpen && (
                    <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                      {priorityOptions.map((option) => (
                        <label key={option} className="flex items-center space-x-2">
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
                </div>)}

                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCreatedOpen(!isCreatedOpen)}
                  >
                    <span className="font-medium text-gray-700">Created Date</span>
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
