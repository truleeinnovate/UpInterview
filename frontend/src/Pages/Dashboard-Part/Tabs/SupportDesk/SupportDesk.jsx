/* eslint-disable react/prop-types */
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
import { useCustomContext } from '../../../../Context/Contextfetch';
import { useSupportTickets } from "../../../../apiHooks/useSupportDesks";

function SupportDesk() {
  const { 
  tickets,
  isLoading
} = useSupportTickets();

  const { userRole } = useCustomContext();
  console.log('userRole from main', userRole)

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
  });
  const [viewMode, setViewMode] = useState("table");
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

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setIsFilterActive(filters.status.length > 0);
    setIsFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleClearFilters = () => {
    setSelectedFilters({ status: [] });
    setIsFilterActive(false);
    setIsFilterPopupOpen(false);
    setCurrentPage(0);
    // Rest filter popup UI state
    setIsStatusOpen(false);
    setSelectedStatus([]);
  };

  const handleFilterIconClick = () => {
    if (tickets?.length !== 0) {
      setIsFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(tickets)) return [];
    return tickets.filter((ticket) => {
      const ticketId = ticket._id?.slice(-5, -1)?.toLowerCase() || "";
      const contact = ticket.contact?.toLowerCase() || "";
      const matchesSearchQuery =
        !searchQuery ||
        ticketId.includes(searchQuery.toLowerCase()) ||
        contact.includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedFilters.status.length === 0 ||
        selectedFilters.status.includes(ticket.status);

      return matchesSearchQuery && matchesStatus;
    });
  };

  const totalPages = Math.ceil(FilteredData().length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const currentFilteredRows = FilteredData().slice(startIndex, startIndex + itemsPerPage);

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "assigned":
        return "bg-purple-100 text-purple-800";
      case "inprogress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "close":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const hasActionAccess = (ticket) => {
    if (userRole === "SuperAdmin") {
      return true;
    } else if (userRole === "Support Team") {
      return ticket.assignedToId === currentUserId || ticket.owner === currentUserId;
    } else if (userRole === "Admin") {
      return true;
    } else {
      return ticket.assignedToId === currentUserId;
    }
  };

  const tableColumns = [
    {
      key: "ticketCode",
      header: "Ticket ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => {
            const path = userRole === "Admin"
              ? `/support-desk/${row._id}`
              : `/support-desk/view/${row._id}`;
            navigate(path, { state: { ticketData: row } });
          }}
        >
          #{value || "N/A"}
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (value) => value || "N/A",
    },
    {
      key: "issueType",
      header: "Issue Type",
      render: (value) => value || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
            value
          )}`}
        >
          {value || "N/A"}
        </span>
      ),
    },
    ...(userRole === "SuperAdmin" || userRole === "Support Team"
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
      header: "Created On",
      render: (value) => formatDate(value),
    },
    ...(userRole === "SuperAdmin"
      ? [
        {
          key: "assignedTo",
          header: "Assigned To",
          render: (value) => value || "N/A",
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
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        const path = userRole === "Admin"
          ? `/support-desk/${row._id}`
          : `/support-desk/view/${row._id}`;
        navigate(path, { state: { ticketData: row } });
      },
      disabled: (row) => !hasActionAccess(row),
    },
    ...(userRole === "Admin"
      ? [
        {
          key: "edit",
          label: "Edit",
          icon: <Pencil className="w-4 h-4 text-green-600" />,
          onClick: (row) =>
            navigate(`/support-desk/edit-ticket/${row._id}`, { state: { ticketData: row } }),
          disabled: (row) => !hasActionAccess(row),
        },
      ]
      : []),
  ];

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);

  const statusOptions = ["New", "Assigned", "Inprogress", "Resolved", "Close"];

  const handleStatusToggle = (option) => {
    setSelectedStatus((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const handleApplyFilters = () => {
    handleFilterChange({ status: selectedStatus });
  };

  return (
    <div className="bg-background h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
          {userRole === "SuperAdmin" && (
            <motion.div
            className="flex justify-between items-center py-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <h1 className="text-2xl font-semibold text-custom-blue">
                Support Desk
            </h1>
            {/* No Add Invoice button as per requirement */}
        </motion.div>
          )}
          {userRole === "Admin" && (
            <Header
              title="Support Desk"
              onAddClick={() => userRole === "Admin" && navigate("/support-desk/new-ticket")}
              addButtonText="Create Ticket"
            />
          )}
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
                userRole={userRole}
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
                        <label key={option} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedStatus.includes(option)}
                            onChange={() => handleStatusToggle(option)}
                            className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                          />
                          <span className="text-sm">{option}</span>
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
    </div>
  );
}

export default SupportDesk;