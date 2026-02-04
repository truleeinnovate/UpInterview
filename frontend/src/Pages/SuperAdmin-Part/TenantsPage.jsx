// v1.0.0 - Ashok - fixed proper loading views
// v1.0.1 - Ashok - adjusted table height to fit better in viewport and fixed style issues
// v1.0.2 - Ashok - added data formatter from utils

import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";

import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
// import KanbanView from "./Tenant/KanbanView.jsx";
import KanbanView from "../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import DropdownSelect from "../../Components/Dropdowns/DropdownSelect.jsx";
import {
  Eye,
  Mail,
  ChevronUp,
  ChevronDown,
  Trash,
  MoreVertical,
} from "lucide-react";
// import axios from "axios";
// import { config } from "../../config.js";
import { usePermissions } from "../../Context/PermissionsContext";
// import { useQuery } from "@tanstack/react-query";
import {
  useTenants,
  useTenantById,
} from "../../apiHooks/superAdmin/useTenants.js";
import DeleteConfirmModal from "../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../services/toastService.js";
import { useMasterData } from "../../apiHooks/useMasterData.js";
import { capitalizeFirstLetter } from "../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../utils/dateFormatter.js";
import {
  getTenantColumns,
  getTenantActions,
} from "../../utils/tableConfig.jsx";


const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // 1. UPDATED FILTER: Include 'view' and 'delete' in mainActions
  const mainActions = kanbanActions.filter((a) =>
    ["view", "delete"].includes(a.key)
  );

  // 2. UPDATED FILTER: Overflow actions are everything else
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "delete"].includes(a.key)
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
      {/* Always visible actions: View and Delete */}
      {mainActions.map((action) => {
        const baseClasses = "p-1.5 rounded-lg transition-colors";

        // 3. STYLING: Logic for Blue (View) and Red (Delete)
        const bgClass =
          action.key === "view"
            ? "text-custom-blue hover:bg-custom-blue/10"
            : action.key === "delete"
              ? "text-red-600 hover:bg-red-50" // Red for delete
              : "text-gray-600 hover:bg-gray-100";

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

      {/* More button (shows dropdown for Edit and others) */}
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

function TenantsPage() {
  const [deleteTenant, setDeleteTenant] = useState(null);
  const { superAdminPermissions, isInitialized } = usePermissions();
  const { deleteTenantData } = useTenantById(deleteTenant?._id);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    subscriptionStatus: [],
    plan: [],
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);
  const ITEMS_PER_PAGE = 10;
  const [selectedType, setSelectedType] = useState("all");
  const [selectedValueFilter, setSelectedValueFilter] = useState("");

  // Debounce search for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(0); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const pageType = "adminPortal";
  const { currentRoles, loadCurrentRoles, isCurrentRolesFetching } =
    useMasterData({}, pageType);

  // Get tenants with pagination and filters
  const { tenants, pagination, isLoading, refetch } = useTenants({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch,
    status: selectedFilters.status.join(","),
    subscriptionStatus: selectedFilters.subscriptionStatus.join(","),
    plan: selectedFilters.plan.join(","),
    type: selectedType === "all" ? "" : selectedType,
    valueFilter: selectedValueFilter,
  });

  // console.log("tenants", tenants);

  // Use React Query for data fetching with proper dependency on permissions
  // const {
  //   data: tenants = [],
  //   isLoading,
  //   error,
  //   refetch,
  // } = useQuery({
  //   queryKey: ["tenants"],
  //   queryFn: async () => {
  //     const response = await axios.get(
  //       `${config.REACT_APP_API_URL}/Organization/all-organizations`
  //     );
  //     return response.data.organizations || [];
  //   },
  //   enabled: isInitialized && !!superAdminPermissions, // Only fetch when permissions are initialized
  //   staleTime: 1000 * 60 * 5, // 5 minutes
  //   cacheTime: 1000 * 60 * 15, // 15 minutes
  //   retry: 1,
  // });

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
  const [isSubscriptionStatusOpen, setIsSubscriptionStatusOpen] =
    useState(false);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedSubscriptionStatus, setSelectedSubscriptionStatus] = useState(
    []
  );
  const [selectedPlan, setSelectedPlan] = useState([]);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedSubscriptionStatus(selectedFilters.subscriptionStatus);
      setSelectedPlan(selectedFilters.plan);
      setIsCurrentStatusOpen(false);
      setIsSubscriptionStatusOpen(false);
      setIsPlanOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      subscriptionStatus: [],
      plan: [],
    };
    setSelectedStatus([]);
    setSelectedSubscriptionStatus([]);
    setSelectedPlan([]);
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      subscriptionStatus: selectedSubscriptionStatus,
      plan: selectedPlan,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
      filters.subscriptionStatus.length > 0 ||
      filters.plan.length > 0
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

  const handleFilterIconClick = () => {
    if (pagination?.totalItems > 0 || tenants?.length > 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const currentFilteredRows = tenants || [];
  const normalize = (s) =>
    typeof s === "string" ? s.trim().toLowerCase() : "";
  const roleValues = Array.from(
    new Set(
      (currentFilteredRows || [])
        .filter((r) => r?.type !== "organization")
        .map((r) => r?.contact?.currentRole)
        .filter((v) => typeof v === "string" && v.trim() !== "")
    )
  ).sort();

  // const techValues = Array.from(
  //   new Set(
  //     (currentFilteredRows || [])
  //       .flatMap((r) =>
  //         Array.isArray(r?.contact?.technologies) ? r.contact.technologies : []
  //       )
  //       .filter((v) => typeof v === "string" && v.trim() !== "")
  //   )
  // ).sort();
  const filterValueOptions = [
    ...currentRoles.map((v) => ({
      value: `role:${v?.roleName}`,
      label: v?.roleLabel,
    })),
    // ...techValues.map((v) => ({ value: `tech:${v}`, label: v })),
  ];
  const filteredRows = selectedValueFilter
    ? (() => {
      const [prefix, ...rest] = selectedValueFilter.split(":");
      const val = rest.join(":");
      const target = normalize(val);
      if (prefix === "role") {
        return currentFilteredRows.filter(
          (row) =>
            row?.type !== "organization" &&
            normalize(row?.contact?.currentRole) === target
        );
      }
      if (prefix === "tech") {
        return currentFilteredRows.filter((row) => {
          const techs = row?.contact?.currentRole || "";
          // Array.isArray(row?.contact?.technologies)
          //   ? row.contact.technologies
          //   : [];
          return techs.some((t) => normalize(t) === target);
        });
      }
      return currentFilteredRows;
    })()
    : currentFilteredRows;
  const totalPages = pagination?.totalPages || 0;

  const nextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination?.hasPrev) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    // Pagination reset is handled in debounce effect
  };

  // Simple loading state - only show loading if we have no data and are loading
  // v1.0.0 <----------------------------------------------------------
  // if (isLoading && (!tenants || tenants.length === 0)) {
  //   return <Loading message="Loading tenants..." />;
  // }

  // Show content even if permissions are still loading but we have data

  // if (tenants && tenants.length > 0) {
  //   // Continue with rendering
  // }
  // v1.0.0 ----------------------------------------------------------->

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatRole = (role) => {
    if (!role || typeof role !== "string") return "N/A";

    return role
      .replace(/[_\s-]+/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleDeleteTenant = async () => {
    try {
      if (!deleteTenant?._id) throw new Error("No tenant ID provided");

      const res = await deleteTenantData.mutateAsync(deleteTenant._id);

      setShowDeleteConfirmModal(false);
      notify.success(res?.message || "Tenant deleted successfully");
    } catch (error) {
      setShowDeleteConfirmModal(false);
      notify.error(error?.response?.data?.message || "Failed to delete tenant");
    }
  };

  const formatStatus = (status = "") => {
    return status
      .toString()
      .trim()
      .replace(/[_\s-]+/g, " ") // replace underscores, hyphens, or multiple spaces with single space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getTenantDisplayName = (tenant) => {
    if (!tenant) return "";
    if (tenant.type === "organization" && tenant.organizationName) {
      return tenant.organizationName;
    }
    const first = capitalizeFirstLetter(tenant.firstName) || "";
    const last = capitalizeFirstLetter(tenant.lastName) || "";
    const fullName = `${first} ${last}`.trim();
    return fullName || "Unknown Tenant";
  };

  const tableColumns = getTenantColumns(navigate, {
    superAdminPermissions,
    currentRoles,
    selectedType,
  });

  const tableActions = getTenantActions(navigate, {
    superAdminPermissions,
    callbacks: {
      onDelete: (row) => {
        setDeleteTenant(row);
        setShowDeleteConfirmModal(true);
      },
    },
  });

  const kanbanColumns = tableColumns;

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink } = {}) => (
    <div className="flex items-center gap-1">
      {superAdminPermissions?.Tenants?.View && (
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
      )}

      {!isLoading && superAdminPermissions?.Tenants?.View ? (
        <>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/tenants/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button> */}
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit ? onEdit(item) : navigate(`edit/${item._id}`);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirmModal(true);
              setDeleteTenant(item);
            }}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash className="w-4 h-4" />
          </button>
        </>
      ) : (
        superAdminPermissions?.Tenants?.Edit && (
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
        )
      )}
    </div>
  );

  const kanbanActions = [
    // View Details
    ...(superAdminPermissions?.Tenants?.View
      ? [
        {
          key: "view",
          label: "View Details",
          icon: <Eye className="w-4 h-4 text-custom-blue" />,
          onClick: (item, e) => {
            e.stopPropagation();
            navigate(`/tenants/${item._id}`);
          },
        },
      ]
      : []),

    // Delete (shown only if NOT loading and has View permission)
    ...(!isLoading && superAdminPermissions?.Tenants?.View
      ? [
        {
          key: "delete",
          label: "Delete",
          icon: <Trash className="w-4 h-4 text-red-600" />,
          onClick: (item, e) => {
            e.stopPropagation();
            setShowDeleteConfirmModal(true);
            setDeleteTenant(item);
          },
        },
      ]
      : []),
  ];

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

    const subscriptionStatusOptions = [
      "active",
      "expired",
      "halted",
      "cancelled",
      "pending",
    ];

    const planOptions = [
      "Starter",
      "Professional",
      "Enterprise",
      "Free",
      "Premium",
      "Expert",
    ];

    return (
      <div className="space-y-3">
        {/* Tenant Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Tenant Status</span>
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
                        <span>{status.replace("_", " ")}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Subscription Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() =>
              setIsSubscriptionStatusOpen(!isSubscriptionStatusOpen)
            }
          >
            <span className="font-medium text-gray-700">
              Subscription Status
            </span>
            {isSubscriptionStatusOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isSubscriptionStatusOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                    {subscriptionStatusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={selectedSubscriptionStatus.includes(status)}
                          onChange={() =>
                            setSelectedSubscriptionStatus((prev) =>
                              prev.includes(status)
                                ? prev.filter((s) => s !== status)
                                : [...prev, status]
                            )
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

        {/* Plan Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsPlanOpen(!isPlanOpen)}
          >
            <span className="font-medium text-gray-700">Plan</span>
            {isPlanOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isPlanOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                    {planOptions.map((plan) => (
                      <label
                        key={plan}
                        className="flex items-center space-x-2 cursor-pointer text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedPlan.includes(plan)}
                          onChange={() =>
                            setSelectedPlan((prev) =>
                              prev.includes(plan)
                                ? prev.filter((p) => p !== plan)
                                : [...prev, plan]
                            )
                          }
                          className="accent-custom-blue"
                        />
                        <span>{plan}</span>
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

  const tenantsToShow =
    selectedType === "all"
      ? tenants
      : tenants?.filter((t) => t.type === selectedType);

  return (
    <div className="bg-background">
      <div className="fixed md:mt-4 sm:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 left-0 right-0 bg-background">
        <main className="flex justify-between items-center px-4">
          <div className="flex flex-col items-center space-x-2 w-full">
            <div className="flex self-end rounded-lg border border-gray-300 p-1 mb-4">
              <button
                className={`px-4 py-1 rounded-md text-sm ${selectedType === "all"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => {
                  setSelectedType("all");
                  setCurrentPage(0);
                }}
              >
                All
              </button>
              <button
                className={`px-4 py-1 rounded-md text-sm ${selectedType === "organization"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => {
                  setSelectedType("organization");
                  setCurrentPage(0);
                }}
              >
                Organizations
              </button>
              <button
                className={`px-4 py-1 rounded-md text-sm ${selectedType === "individual"
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
                onClick={() => {
                  setSelectedType("individual");
                  setCurrentPage(0);
                }}
              >
                Individuals
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 px-1.5 w-full">
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Total Tenants</div>
                <div className="text-xl font-semibold">
                  {pagination?.totalItems || 0}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Active</div>
                <div className="text-xl font-semibold">
                  {/* {tenants?.filter((t) => t.status === "active").length} */}
                  {/* {tenantsToShow?.filter((t) => t.status === "active").length} */}
                  {pagination?.activeCount || 0}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Inactive</div>
                <div className="text-xl font-semibold">
                  {/* {tenants?.filter((t) => t.status === "inactive").length} */}
                  {/* {tenantsToShow?.filter((t) => t.status === "inactive").length} */}
                  {pagination?.inactiveCount || 0}
                </div>
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                <div className="text-xs text-gray-500">Pending</div>
                <div className="text-xl font-semibold">
                  {/* {tenants?.filter((t) => t.status === "pending").length} */}
                  {/* {tenantsToShow?.filter((t) => t.status === "pending").length} */}
                  {pagination?.pendingCount || 0}
                </div>
              </div>
              {selectedType === "all" && (
                <>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs text-gray-500">Organizations</div>
                    <div className="text-xl font-semibold">
                      {pagination?.organizationCount || 0}
                      {/* {tenants?.filter((t) => t.type === "organization").length} */}
                    </div>
                  </div>
                  <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                    <div className="text-xs text-gray-500">Individuals</div>
                    <div className="text-xl font-semibold">
                      {pagination?.individualCount || 0}
                      {/* {tenants?.filter((t) => t.type === "individual").length} */}
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
              onSearch={(e) => handleSearch(e.target.value)}
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              dataLength={tenants?.length || 0}
              searchPlaceholder="Search tenants..."
              filterIconRef={filterIconRef} // Pass ref to Toolbar
              startContent={
                <div className="min-w-[240px]">
                  <DropdownSelect
                    value={
                      filterValueOptions.find(
                        (opt) => opt.value === selectedValueFilter
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setSelectedValueFilter(
                        selectedOption ? selectedOption.value : ""
                      );
                      setCurrentPage(0);
                    }}
                    options={filterValueOptions}
                    placeholder="Filter by Role/Technology"
                    isClearable={true}
                    menuPortalTarget={document.body}
                  />
                </div>
              }
            />
          </div>
        </main>

        <main className="fixed top-[400px] xl:top-80 2xl:top-80 left-0 right-0 bg-background">
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8">
                  <TableView
                    data={filteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Tenants Found."
                    customHeight="h-[calc(100vh-20rem)]"
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={filteredRows.map((tenant) => ({
                      ...tenant,
                      id: tenant._id,
                      title: tenant.firstName || "N/A",
                      subtitle: tenant.lastName || "N/A",
                      avatar: tenant?.contact?.imageData?.path || null,
                      navigateTo: `/tenants/${tenant._id}`,
                    }))}
                    tenants={tenants}
                    columns={kanbanColumns}
                    loading={isLoading}
                    // renderActions={renderKanbanActions}
                    renderActions={(item) => (
                      <KanbanActionsMenu
                        item={item}
                        kanbanActions={kanbanActions}
                      />
                    )}
                    emptyState="No Tenants Found."
                    kanbanTitle="Tenant"
                    customHeight="calc(100vh - 380px)"
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
      {/* Ranjith added deleted functionality  */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeleteTenant}
        title="Tenant"
        // entityName={
        //   deleteTenant?.FirstName + " " + deleteTenant?.LastName
        // }
        entityName={getTenantDisplayName(deleteTenant)}
      />
    </div>
  );
}

export default TenantsPage;
