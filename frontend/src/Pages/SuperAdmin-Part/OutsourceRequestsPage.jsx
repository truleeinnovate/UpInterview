import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge.jsx";

import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../../Components/SuperAdminComponents/Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function OutsourceRequestsPage() {
  const [view, setView] = useState("table");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectRequestView, setSelectRequestView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: "", max: "" },
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.title = "Outsource Requests | Admin Portal";
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      tenant: "Acme Corp",
      position: "Senior Frontend Developer",
      expertise: "React, TypeScript, GraphQL",
      requestedDate: "2025-06-02T10:00:00Z",
      scheduledFor: "2025-06-05T14:00:00Z",
      duration: 60,
      status: "pending",
      priority: "high",
      budget: 150,
    },
    {
      id: "REQ-002",
      tenant: "TechStart Inc",
      position: "DevOps Engineer",
      expertise: "Kubernetes, AWS, CI/CD",
      requestedDate: "2025-06-02T09:15:00Z",
      scheduledFor: "2025-06-04T11:00:00Z",
      duration: 45,
      status: "approved",
      priority: "medium",
      budget: 130,
    },
    {
      id: "REQ-003",
      tenant: "Global Services LLC",
      position: "Backend Developer",
      expertise: "Node.js, PostgreSQL, Redis",
      requestedDate: "2025-06-01T16:30:00Z",
      scheduledFor: "2025-06-03T15:30:00Z",
      duration: 60,
      status: "matched",
      priority: "medium",
      budget: 125,
    },
    {
      id: "REQ-004",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-005",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-006",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-007",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-008",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-009",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-0010",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-0011",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-0012",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
    {
      id: "REQ-0013",
      tenant: "InnovateCo",
      position: "ML Engineer",
      expertise: "Python, TensorFlow, PyTorch",
      requestedDate: "2025-06-01T14:45:00Z",
      scheduledFor: "2025-06-06T10:00:00Z",
      duration: 90,
      status: "pending",
      priority: "high",
      budget: 175,
    },
  ]);

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

  const dataToUse = requests;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((request) => {
      const fieldsToSearch = [
        request.tenant,
        request.status,
        request.priority,
        request.duration,
        request.expertise,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(request.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        request.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          request.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          request.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery && matchesStatus && matchesTech && matchesExperience
      );
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

  // const columns = [
  //   {
  //     field: "id",
  //     header: "Request ID",
  //     render: (row) => <span className="font-mono text-sm">{row.id}</span>,
  //   },
  //   {
  //     field: "tenant",
  //     header: "Tenant",
  //     render: (row) => (
  //       <div>
  //         <div className="font-medium text-gray-900">{row.tenant}</div>
  //         <div className="text-sm text-gray-500">{row.position}</div>
  //       </div>
  //     ),
  //   },
  //   {
  //     field: "expertise",
  //     header: "Required Expertise",
  //   },
  //   {
  //     field: "scheduledFor",
  //     header: "Scheduled For",
  //     render: (row) => formatDate(row.scheduledFor),
  //   },
  //   {
  //     field: "duration",
  //     header: "Duration",
  //     render: (row) => `${row.duration} mins`,
  //   },
  //   {
  //     field: "budget",
  //     header: "Budget",
  //     render: (row) => `$${row.budget}/hr`,
  //   },
  //   {
  //     field: "status",
  //     header: "Status",
  //     render: (row) => <StatusBadge status={row.status} />,
  //   },
  //   {
  //     field: "priority",
  //     header: "Priority",
  //     render: (row) => (
  //       <StatusBadge
  //         status={
  //           row.priority === "high"
  //             ? "error"
  //             : row.priority === "medium"
  //             ? "warning"
  //             : "success"
  //         }
  //         text={row.priority}
  //       />
  //     ),
  //   },
  //   {
  //     field: "actions",
  //     header: "Actions",
  //     sortable: false,
  //     render: (row) => (
  //       <div className="flex space-x-2">
  //         <button className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50">
  //           <AiOutlineEye size={18} />
  //         </button>
  //         {row.status === "pending" && (
  //           <>
  //             <button className="p-2 text-success-600 hover:text-success-900 rounded-full hover:bg-success-50">
  //               <AiOutlineCheck size={18} />
  //             </button>
  //             <button className="p-2 text-error-600 hover:text-error-900 rounded-full hover:bg-error-50">
  //               <AiOutlineClose size={18} />
  //             </button>
  //           </>
  //         )}
  //       </div>
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "id",
      header: "Request ID",
      render: (value, row) => (
        <span className="font-mono text-sm">{row.id}</span>
      ),
    },
    {
      key: "tenant",
      header: "Tenant",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.tenant}</div>
          <div className="text-sm text-gray-500">{row.position}</div>
        </div>
      ),
    },
    {
      key: "expertise",
      header: "Required Expertise",
    },
    {
      key: "scheduledFor",
      header: "Scheduled For",
      render: (value, row) => formatDate(row.scheduledFor) || "N/A",
    },
    {
      key: "duration",
      header: "Duration",
      render: (value, row) => `${row.duration} mins`,
    },
    {
      key: "budget",
      header: "Budget",
      render: (value, row) => `$${row.budget}/hr`,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "priority",
      header: "Priority",
      render: (value, row) => (
        <StatusBadge
          status={
            row.priority === "high"
              ? "error"
              : row.priority === "medium"
              ? "warning"
              : "success"
          }
          text={row.priority}
        />
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
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
    <div className="space-y-6">
      <div className="absolute md:mt-7 sm:mt-4 top-12 left-0 right-0 bg-background">
        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Requests</div>
            <div className="text-xl font-semibold">{requests.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Approved</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Matched</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "matched").length}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          {/* Header and Tool bar */}
          <div className="md:mt-2 sm:mt-4 w-full">
            <main className="px-6">
              <div className="sm:px-0">
                <Header
                  title="Outsource Requests"
                  onAddClick={() => navigate("/tenants/add")}
                  addButtonText="New Request"
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
                  searchPlaceholder="Search requests..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        </div>

        {/* New table content */}
        <main>
          <div className="sm:px-0">
            {requests.length === 0 ? (
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
                        emptyState="No requests found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((request) => ({
                          ...request,
                          id: request._id,
                          title: `${request.tenant || ""} ${
                            request.tenant || ""
                          }`,
                          subtitle:
                            request.CurrentRole ||
                            request.CurrentExperience ||
                            "N/A",
                          avatar: request.ImageData
                            ? `src="https://ui-avatars.com/api/?name=${request.tenant[0]}&background=4f46e5&color=ffffff&size=40`
                            : null,
                          status: request.status || "N/A",
                          isLoading: isLoading,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No requests found."
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
          </div>
        </main>
      </div>
    </div>
  );
}

export default OutsourceRequestsPage;
