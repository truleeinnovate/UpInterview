import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../../Components/Loading.js";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import {
  Eye,
  Mail,
  UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { config } from "../../config.js";
import AddSupportForm from "./Support/AddSupportForm.jsx";

function SupportTicketsPage() {
  const [view, setView] = useState("table");
  const [selectedSupport, setSelectedSupport] = useState(null);
  const [selectSupportView, setSelectSupportView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Support Tickets | Admin Portal";
  }, []);

  const [tickets, setTickets] = useState([
    {
      id: "TICKET-1001",
      subject: "Interview recording not available",
      tenant: "Acme Corp",
      requester: "John Smith",
      assignee: "Support Agent 1",
      priority: "high",
      status: "open",
      createdAt: "2025-06-01T14:30:00Z",
      updatedAt: "2025-06-02T09:15:00Z",
    },
    {
      id: "TICKET-1002",
      subject: "Candidate unable to access assessment",
      tenant: "TechStart Inc",
      requester: "Sarah Johnson",
      assignee: "Support Agent 2",
      priority: "medium",
      status: "in_progress",
      createdAt: "2025-06-01T16:45:00Z",
      updatedAt: "2025-06-02T10:30:00Z",
    },
    {
      id: "TICKET-1003",
      subject: "Billing question about subscription",
      tenant: "Global Services LLC",
      requester: "Michael Brown",
      assignee: null,
      priority: "low",
      status: "open",
      createdAt: "2025-06-02T08:20:00Z",
      updatedAt: "2025-06-02T08:20:00Z",
    },
    {
      id: "TICKET-1004",
      subject: "Need to add more user licenses",
      tenant: "InnovateCo",
      requester: "David Lee",
      assignee: "Support Agent 1",
      priority: "medium",
      status: "closed",
      createdAt: "2025-05-30T11:15:00Z",
      updatedAt: "2025-06-01T13:40:00Z",
    },
    {
      id: "TICKET-1005",
      subject: "Feature request: Custom assessment templates",
      tenant: "Acme Corp",
      requester: "Jessica Williams",
      assignee: "Product Manager",
      priority: "low",
      status: "pending",
      createdAt: "2025-05-29T15:30:00Z",
      updatedAt: "2025-06-01T10:20:00Z",
    },
    {
      id: "TICKET-1006",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-1007",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-1008",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-1009",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-10010",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-10011",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-10012",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-10013",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
    {
      id: "TICKET-10014",
      subject: "Integration with HRIS system not working",
      tenant: "TechStart Inc",
      requester: "Robert Garcia",
      assignee: "Support Agent 3",
      priority: "high",
      status: "in_progress",
      createdAt: "2025-06-01T09:50:00Z",
      updatedAt: "2025-06-02T11:10:00Z",
    },
  ]);

  // Get Internal logs API
  useEffect(() => {
    const getSupportTickets = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/support-tickets`
        );
        setTickets(response.data.tickets);
      } catch (error) {
        console.error("Error fetching internal logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSupportTickets();
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
  };

  // filters ----------------------------------------------------------------
  const statusOptions = [
    "Open",
    "New",
    "Assigned",
    "pending",
    "InProgress",
    "Resolved",
  ];

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setCurrentStatus(selectedFilters.currentStatus);
      setIsCurrentStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      currentStatus: "",
    };
    setSelectedStatus([]);
    setCurrentStatus("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      currentStatus: selectedCurrentStatus,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.currentStatus.length > 0
    );
    setFilterPopupOpen(false);
  };

  // ----------------------------------------------------------

  const dataToUse = tickets;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];

    return dataToUse?.filter((support) => {
      const fieldsToSearch = [
        support.tenant,
        support.id ? support.id : support._id,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(support.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData()?.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData()?.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData()?.length);

  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getPriorityDisplay = (priority) => {
    switch (priority) {
      case "high":
        return { label: "High", status: "error" };
      case "medium":
        return { label: "Medium", status: "warning" };
      case "low":
        return { label: "Low", status: "success" };
      default:
        return { label: priority, status: "neutral" };
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "open":
        return { label: "Open", status: "error" };
      case "in_progress":
        return { label: "In Progress", status: "warning" };
      case "pending":
        return { label: "Pending", status: "warning" };
      case "closed":
        return { label: "Closed", status: "success" };
      default:
        return { label: status, status: "neutral" };
    }
  };

  const tableColumns = [
    {
      key: "id",
      header: "Ticket ID",
      render: (value, row) => (
        <span className="font-mono text-xs">{row.id ? row.id : row._id}</span>
      ),
    },
    {
      key: "subject",
      header: "Subject",
      render: (value, row) => (
        <div className="font-medium text-gray-900">{row.subject || "-"}</div>
      ),
    },
    {
      key: "tenant",
      header: "Tenant",
    },
    {
      key: "requester",
      header: "Requester",
      render: (value, row) => `$${row.hourlyRate}/hr`,
    },
    {
      key: "priority",
      header: "Priority",
      render: (value, row) => <span>{row.priority}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <span>{row.status}</span>,
    },
    {
      key: "assignee",
      header: "Assignee",
      render: (value, row) => (
        <span className="text-gray-400 italic">{row.assignedTo}</span>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (value, row) => formatDate(row.createdAt),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => row?._id && navigate(`/support-tickets/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/support-tickets/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    {
      key: "resend-link",
      label: "Resend Link",
      icon: <Mail className="w-4 h-4 text-blue-600" />,
      disabled: (row) => row.status === "completed",
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`view-details/${item._id}`);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {!isLoading ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item?._id && navigate(`/candidate/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`edit/${item._id}`);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResendLink(item.id);
          }}
          disabled={item.status === "completed"}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Resend Link"
        >
          <Mail className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 min-h-screen">
      <div className="fixed md:mt-4 sm:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 top-16 left-0 right-0 bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 2xl-grid-cols-5 gap-4 px-4 w-full">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">All Tickets</div>
            <div className="text-xl font-semibold">{tickets.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Open</div>
            <div className="text-xl font-semibold">
              {tickets.filter((t) => t.status === "open").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">In Progress</div>
            <div className="text-xl font-semibold">
              {tickets.filter((t) => t.status === "in_progress").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold">
              {tickets.filter((t) => t.status === "pending").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">High Priority</div>
            <div className="text-xl font-semibold">
              {tickets.filter((t) => t.priority === "high").length}
            </div>
          </div>
        </div>

        <div className="fixed top-18 left-0 right-0 bg-background">
          {/* Header and Tool bar */}
          <div className="md:mt-2 sm:mt-4 w-full">
            <main className="px-4">
              <div className="sm:px-0">
                <Header
                  title="Support Ticket"
                  onAddClick={() => navigate("/support-tickets/new")}
                  addButtonText="New Ticket"
                />
                <Toolbar
                  view={view}
                  setView={setView}
                  searchQuery={searchQuery}
                  onSearch={handleSearch}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPrevPage={prevPage}
                  onNextPage={nextPage}
                  onFilterClick={handleFilterIconClick}
                  isFilterPopupOpen={isFilterPopupOpen}
                  isFilterActive={isFilterActive}
                  dataLength={dataToUse?.length}
                  searchPlaceholder="Search Tenants..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        </div>

        {/* New table content */}
        <main className="fixed top-60 mt-6 lg lg:top-70 xl:top-70 2xl:top-70 left-0 right-0 bg-background">
          <div className="sm:px-0">
            {tickets.length === 0 ? (
              <Loading />
            ) : (
              <motion.div className="bg-white">
                <div className="relative w-full">
                  {view === "table" ? (
                    <div className="w-full">
                      <TableView
                        data={currentFilteredRows}
                        columns={tableColumns}
                        loading={isLoading}
                        actions={tableActions}
                        emptyState="No tickets found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((support) => ({
                          ...support,
                          id: support.id ? support.id : support._id,
                          title: `${support.requester || ""} ${
                            support.LastName || ""
                          }`,
                          subtitle:
                            support.CurrentRole ||
                            support.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: support.status,
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No tickets found."
                      />
                    </div>
                  )}

                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleFilterChange}
                    initialFilters={selectedFilters}
                    filterIconRef={filterIconRef}
                  />
                </div>
              </motion.div>
            )}

            {/* Render FilterPopup */}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              <div className="space-y-3">
                {/* Current Status Section */}
                <div>
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
                  >
                    <span className="font-medium text-gray-700">
                      Current Status
                    </span>
                    {isCurrentStatusOpen ? (
                      <ChevronUp className="text-xl text-gray-700" />
                    ) : (
                      <ChevronDown className="text-xl text-gray-700" />
                    )}
                  </div>
                  {isCurrentStatusOpen && (
                    <div className="mt-1 space-y-2 pl-2">
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
                          <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                            {statusOptions.map((status) => (
                              <label
                                key={status}
                                className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedStatus.includes(status)}
                                  onChange={() =>
                                    handleCurrentStatusToggle(status)
                                  }
                                  className="accent-custom-blue"
                                />
                                <span>{status}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FilterPopup>
          </div>
        </main>
      </div>
      {showAddForm && (
        <AddSupportForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setSelectedSupport(null);
            setEditModeOn(false);
          }}
          selectedSupport={selectedSupport}
          isEdit={editModeOn}
        />
      )}
      <Outlet />
    </div>
  );
}

export default SupportTicketsPage;
