import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";

import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import Loading from "../../Components/SuperAdminComponents/Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "./Tenant/KanbanView.jsx";
import {
  Eye,
  Mail,
  UserCircle,
  Pencil,
  // Import,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { config } from "../../config.js";
import { usePermissions } from "../../Context/PermissionsContext";

function TenantsPage() {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  // const [selectedTenant, setSelectedTenant] = useState(null);
  // const [selectTenantView, setSelectTenantView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
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
  const [user, setUser] = useState("Admin");

  const [tenants, setTenants] = useState([]);

  const [selectedType, setSelectedType] = useState("all");

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  // Fetch tenants
  useEffect(() => {
    const getTenants = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/Organization/all-organizations`
        );
        setTenants(response.data.organizations);
        console.log("organizations: ", response.data.organizations);
      } catch (error) {
        console.error("Error fetching organizations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getTenants();
  }, []);

  const dataToUse = tenants;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((organization) => {
      const fieldsToSearch = [
        organization.firstName,
        organization.lastName,
        organization.Email,
        organization.Phone,
        organization.company,
        organization.status,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(organization.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
    });
  };

  // Pagination
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

  if (isLoading) {
    return <Loading />;
  }

  if (!tenants || tenants.length === 0) {
    return <div>No tenants found.</div>;
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // Table Columns
  const tableColumns = [
    {
      key: "name",
      header: "Tenant Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-custom-blue flex items-center justify-center text-white font-semibold">
            {row?.branding ? (
              <img src={row?.branding?.path} alt="branding" />
            ) : (
              row?.company?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div className="ml-4">
            <div className="font-medium text-gray-900">
              {capitalizeFirstLetter(row.company) || "N/A"}
            </div>
            <div className="text-gray-500">
              {capitalizeFirstLetter(row.industry) || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      render: (value, row) => (
        <span>
          {row?.subscription?.selectedBillingCycle
            ? row.subscription.selectedBillingCycle
            : "N/A"}
        </span>
      ),
    },
    {
      key: "organizations",
      header: "Users",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{row.usersCount || 0}</span>
        </div>
      ),
    },
    {
      key: "activeJobs",
      header: "Active Jobs",
      render: (value) => value || "0",
    },
    {
      key: "activeUsersCount",
      header: "Active Candidates",
      render: (value, row) =>
        row?.activeUsersCount ? row.activeUsersCount : "0",
    },
    {
      key: "lastActivity",
      header: "Last Activity",
      render: (value, row) => (
        <span>{row ? formatDate(row?.updatedAt) : "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
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
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "firstName",
      header: "Name",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink } = {}) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onView ? onView(item) : navigate(`/tenants/${item._id}`);
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
              navigate(`/tenants/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit ? onEdit(item) : navigate(`edit/${item._id}`);
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
            if (onResendLink) onResendLink(item.id);
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

  // Render Filter Content
  const renderFilterContent = () => {
    // filter options
    const statusOptions = [
      "active",
      "inactive",
      "submitted",
      "payment_pending",
      "created",
      "cancelled",
      "draft",
    ];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
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
                          onChange={() => handleCurrentStatusToggle(status)}
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
    );
  };

  return (
    <div className="bg-background">
      <div className="fixed md:mt-4 sm:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 top-16 left-0 right-0 bg-background">
        <main className="flex justify-between items-center px-4">
          <div className="flex flex-col items-center space-x-2 w-full">
            <div className="flex self-end rounded-lg border border-gray-300 p-1 mb-4">
              <button
                className={`px-4 py-1 rounded-md text-sm ${
                  selectedType === "all"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedType("all")}
              >
                All
              </button>
              <button
                className={`px-4 py-1 rounded-md text-sm ${
                  selectedType === "organization"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedType("organization")}
              >
                Organizations
              </button>
              <button
                className={`px-4 py-1 rounded-md text-sm ${
                  selectedType === "individual"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                }`}
                onClick={() => setSelectedType("individual")}
              >
                Individuals
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 px-1.5 w-full">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Total Tenants</div>
                <div className="text-xl font-semibold">{tenants?.length}</div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Active</div>
                <div className="text-xl font-semibold">
                  {tenants?.filter((t) => t.status === "active").length}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Inactive</div>
                <div className="text-xl font-semibold">
                  {tenants?.filter((t) => t.status === "inactive").length}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-xl font-semibold">
                  {tenants?.filter((t) => t.status === "pending").length}
                </div>
              </div>
              {selectedType === "all" && (
                <>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs text-gray-500">Organizations</div>
                    <div className="text-xl font-semibold">
                      {tenants?.filter((t) => t.type === "organization").length}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs text-gray-500">Individuals</div>
                    <div className="text-xl font-semibold">
                      {tenants?.filter((t) => t.type === "individual").length}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>

        <main className="fixed top-18 left-0 right-0 bg-background px-6">
          <div className="sm:px-0">
            {/* Header */}
            <Header
              title="Tenants"
              onAddClick={() => navigate("/tenants/new")}
              addButtonText="Add Tenant"
              canCreate={superAdminPermissions?.Tenants?.Create}
            />

            {/* Toolbar */}
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
              searchPlaceholder="Search tenants..."
              filterIconRef={filterIconRef} // Pass ref to Toolbar
            />
          </div>
        </main>

        <main className="fixed top-[400px] xl:top-80 2xl:top-80 left-0 right-0 bg-background">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Tenants Found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={currentFilteredRows.map((tenant) => ({
                      ...tenant,
                      id: tenant._id,
                      title: tenant.company || "N/A",
                      subtitle: tenant.industry || "N/A",
                      avatar: tenant.branding?.path || null,
                    }))}
                    columns={kanbanColumns}
                    loading={isLoading}
                    renderActions={renderKanbanActions}
                    emptyState="No Tenants Found."
                  />
                </div>
              )}

              {/* FilterPopup */}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                {renderFilterContent()}
              </FilterPopup>
            </motion.div>
          </div>
        </main>
      </div>
      <Outlet />
    </div>
  );
}

export default TenantsPage;
