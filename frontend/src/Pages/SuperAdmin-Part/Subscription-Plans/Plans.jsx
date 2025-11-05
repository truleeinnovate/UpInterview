import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import Header from "../../../Components/Shared/Header/Header";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import TableView from "../../../Components/Shared/Table/TableView";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import PlanKanbanView from "./PlanKanbanView";
import PlanFormModal from "./PlanFormModal";
import PlanViewModal from "./PlanViewModal";
import { useSubscriptionPlansAdmin } from "../../../apiHooks/useSubscriptionPlansAdmin";
import { usePermissionCheck } from "../../../utils/permissionUtils";
import { Eye, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import ConfirmationPopup from "../../Dashboard-Part/Tabs/Assessment-Tab/ConfirmationPopup.jsx";
//import { useScrollLock } from '../../../apiHooks/scrollHook/useScrollLock';

const ITEMS_PER_PAGE = 10;

const defaultFilters = {
  subscriptionTypes: [], // 'organization' | 'individual'
  activeStates: [], // 'Active' | 'Inactive'
  createdDate: "", // '', 'last7', 'last30'
};

const formatDate = (val) => {
  if (!val) return "N/A";
  try {
    const d = new Date(val);
    return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString();
  } catch {
    return "N/A";
  }
};

const getPriceForCycle = (plan, cycle) => {
  const row = Array.isArray(plan?.pricing)
    ? plan.pricing.find((p) => p.billingCycle === cycle)
    : null;
  if (!row) return "—";
  const currency = row.currency || "";
  const price = typeof row.price === "number" ? row.price : row.price ?? "";
  return `${currency} ${price}`.trim();
};

export default function Plans() {
  //useScrollLock(true);
  // Permissions
  const { checkPermission } = usePermissionCheck();
  const canViewTab = checkPermission("SubscriptionPlans", "ViewTab");
  const canView = checkPermission("SubscriptionPlans", "View");
  const canCreate = checkPermission("SubscriptionPlans", "Create");
  const canEdit = checkPermission("SubscriptionPlans", "Edit");
  const canDelete = checkPermission("SubscriptionPlans", "Delete");

  const navigate = useNavigate();
  const location = useLocation();

  // Data hook
  const {
    plans,
    isLoading,
    isError,
    error,
    createPlan,
    updatePlan,
    deletePlan,
    isMutating,
  } = useSubscriptionPlansAdmin();

  // UI state
  const [view, setView] = useState("table"); // 'table' | 'kanban'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);
  // Collapsible filter sections
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isActiveOpen, setIsActiveOpen] = useState(false);
  const [isCreatedOpen, setIsCreatedOpen] = useState(false);

  // Modals
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("create"); // 'create' | 'edit'
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  // Delete confirm modal
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Reset page when data/filter/search changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedFilters, plans?.length]);

  // Route-driven modal control
  useEffect(() => {
    const path = location.pathname || "";
    const parts = path.split("/").filter(Boolean); // e.g., ['sub-plans', 'id', 'edit']

    if (parts[0] !== "sub-plans") {
      // Not in this section; close any modals
      setShowFormModal(false);
      setShowViewModal(false);
      setSelectedPlan(null);
      return;
    }

    // /sub-plans
    if (parts.length === 1) {
      setShowFormModal(false);
      setShowViewModal(false);
      setSelectedPlan(null);
      return;
    }

    // /sub-plans/new
    if (parts[1] === "new") {
      setFormMode("create");
      setSelectedPlan(null);
      setShowViewModal(false);
      setShowFormModal(true);
      return;
    }

    // /sub-plans/:id or /sub-plans/:id/edit
    const planId = parts[1];
    const isEdit = parts[2] === "edit";
    const found = (Array.isArray(plans) ? plans : []).find(
      (p) => p?._id === planId || p?.planId === planId
    );
    setSelectedPlan(found || null);

    if (isEdit) {
      setFormMode("edit");
      setShowViewModal(false);
      setShowFormModal(true);
    } else {
      setShowFormModal(false);
      setShowViewModal(true);
    }
  }, [location.pathname, plans]);

  // Search
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filtering
  const isFilterActive = useMemo(() => {
    return (
      (selectedFilters.subscriptionTypes?.length ?? 0) > 0 ||
      (selectedFilters.activeStates?.length ?? 0) > 0 ||
      (selectedFilters.createdDate ?? "") !== ""
    );
  }, [selectedFilters]);

  const filteredPlans = useMemo(() => {
    const now = Date.now();

    const createdThreshold = (() => {
      switch (selectedFilters.createdDate) {
        case "last7":
          return now - 7 * 24 * 60 * 60 * 1000;
        case "last30":
          return now - 30 * 24 * 60 * 60 * 1000;
        default:
          return null;
      }
    })();

    const matchesFilter = (plan) => {
      // Type
      if (
        selectedFilters.subscriptionTypes?.length &&
        !selectedFilters.subscriptionTypes.includes(plan.subscriptionType)
      ) {
        return false;
      }

      // Active
      if (selectedFilters.activeStates?.length) {
        const activeLabel = plan.active ? "Active" : "Inactive";
        if (!selectedFilters.activeStates.includes(activeLabel)) return false;
      }

      // Created date
      if (createdThreshold) {
        const createdMs = new Date(plan.createdAt).getTime();
        if (isNaN(createdMs) || createdMs < createdThreshold) return false;
      }

      return true;
    };

    const matchesSearch = (plan) => {
      if (!normalizedQuery) return true;

      const haystack = [
        plan.planId,
        plan.name,
        plan.description,
        plan.subscriptionType,
        ...(plan.features || []).flatMap((f) => [f?.name, f?.description]),
        ...(plan.pricing || []).flatMap((p) => [p?.currency, p?.billingCycle]),
      ]
        .filter(Boolean)
        .map((v) => String(v).toLowerCase());

      return haystack.some((v) => v.includes(normalizedQuery));
    };

    const list = Array.isArray(plans) ? plans : [];
    const out = list.filter((p) => matchesFilter(p) && matchesSearch(p));
    // Sort by updatedAt desc
    out.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return out;
  }, [plans, normalizedQuery, selectedFilters]);

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPlans.length / ITEMS_PER_PAGE)
  );
  const currentPlans = useMemo(() => {
    const start = currentPage * ITEMS_PER_PAGE;
    return filteredPlans.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPlans, currentPage]);

  // Actions
  const handleCreateClick = () => {
    navigate("/sub-plans/new");
  };

  const handleView = (plan) => {
    if (!canView) return;
    const id = plan?._id || plan?.planId;
    if (!id) return;
    navigate(`/sub-plans/${id}`);
  };

  const handleEdit = (plan) => {
    if (!canEdit) return;
    const id = plan?._id || plan?.planId;
    if (!id) return;
    navigate(`/sub-plans/${id}/edit`);
  };

  const handleDelete = async (plan) => {
    if (!canDelete) return;
    setPlanToDelete(plan);
    setIsDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setIsDeleteConfirmOpen(false);
    setPlanToDelete(null);
  };

  const confirmDelete = async () => {
    if (!planToDelete || isMutating) return;
    await deletePlan(planToDelete._id);
    closeDeleteConfirm();
  };

  const onSubmitPlan = async (payload) => {
    if (formMode === "create") {
      await createPlan(payload);
    } else {
      await updatePlan({ id: selectedPlan._id, data: payload });
    }
    navigate("/sub-plans", { replace: true });
  };

  // Filter popup handlers
  const openFilterPopup = () => {
    setTempFilters(selectedFilters);
    setIsFilterPopupOpen(true);
  };
  const closeFilterPopup = () => setIsFilterPopupOpen(false);
  const clearAllFilters = () => {
    setTempFilters(defaultFilters);
    setSelectedFilters(defaultFilters);
  };
  const applyFilters = () => {
    setSelectedFilters(tempFilters);
    setIsFilterPopupOpen(false);
  };

  const columns = [
    { key: "planId", header: "Plan ID" },
    { key: "name", header: "Name" },
    {
      key: "subscriptionType",
      header: "Type",
      render: (val) =>
        val ? val.charAt(0).toUpperCase() + val.slice(1) : "N/A",
    },
    {
      key: "monthlyPrice",
      header: "Monthly",
      render: (_, row) => getPriceForCycle(row, "monthly"),
    },
    {
      key: "annualPrice",
      header: "Annual",
      render: (_, row) => getPriceForCycle(row, "annual"),
    },
    { key: "maxUsers", header: "Max Users" },
    {
      key: "active",
      header: "Active",
      render: (val, row) => (
        <StatusBadge
          status={row.active ? "active" : "inactive"}
          text={row.active ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (val) => formatDate(val),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4" />,
      onClick: (row) => handleView(row),
      show: () => canView,
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4" />,
      onClick: (row) => handleEdit(row),
      show: () => canEdit,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: (row) => handleDelete(row),
      show: () => canDelete,
      disabled: () => isMutating,
    },
  ];

  if (!canViewTab) {
    return null;
  }

  return (
    <div className="w-full px-6 py-2">
      <div>
        <Header
          title="Subscription Plans"
          onAddClick={handleCreateClick}
          addButtonText="Create Plan"
          canCreate={canCreate}
        />

        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={(e) => setSearchQuery(e.target.value)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNextPage={() =>
            setCurrentPage((p) => (p + 1 >= totalPages ? p : p + 1))
          }
          onFilterClick={isFilterPopupOpen ? closeFilterPopup : openFilterPopup}
          isFilterActive={isFilterActive}
          isFilterPopupOpen={isFilterPopupOpen}
          dataLength={filteredPlans.length}
          filterIconRef={filterIconRef}
        />

        {/* Filters Popup */}
        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={closeFilterPopup}
          onApply={applyFilters}
          onClearAll={clearAllFilters}
          filterIconRef={filterIconRef}
        >
          <div className="space-y-3">
            {/* Subscription Type (collapsible) */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsTypeOpen((v) => !v)}
              >
                <span className="font-medium text-gray-700">
                  Subscription Type
                </span>
                {isTypeOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
                )}
              </div>
              {isTypeOpen && (
                <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                  {["organization", "individual"].map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tempFilters.subscriptionTypes.includes(type)}
                        onChange={() => {
                          const exists =
                            tempFilters.subscriptionTypes.includes(type);
                          const next = exists
                            ? tempFilters.subscriptionTypes.filter(
                                (t) => t !== type
                              )
                            : [...tempFilters.subscriptionTypes, type];
                          setTempFilters((prev) => ({
                            ...prev,
                            subscriptionTypes: next,
                          }));
                        }}
                        className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                      />
                      <span className="text-sm capitalize">{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Active (collapsible) */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsActiveOpen((v) => !v)}
              >
                <span className="font-medium text-gray-700">Active</span>
                {isActiveOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
                )}
              </div>
              {isActiveOpen && (
                <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                  {["Active", "Inactive"].map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tempFilters.activeStates.includes(status)}
                        onChange={() => {
                          const exists =
                            tempFilters.activeStates.includes(status);
                          const next = exists
                            ? tempFilters.activeStates.filter(
                                (s) => s !== status
                              )
                            : [...tempFilters.activeStates, status];
                          setTempFilters((prev) => ({
                            ...prev,
                            activeStates: next,
                          }));
                        }}
                        className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                      />
                      <span className="text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Created Date (collapsible) */}
            <div>
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setIsCreatedOpen((v) => !v)}
              >
                <span className="font-medium text-gray-700">Created Date</span>
                {isCreatedOpen ? (
                  <ChevronUp className="text-xl text-gray-700" />
                ) : (
                  <ChevronDown className="text-xl text-gray-700" />
                )}
              </div>
              {isCreatedOpen && (
                <div className="mt-1 space-y-1 pl-3">
                  {[
                    { key: "", label: "Any time" },
                    { key: "last7", label: "Last 7 days" },
                    { key: "last30", label: "Last 30 days" },
                  ].map((opt) => (
                    <label
                      key={opt.key}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="radio"
                        name="createdDate"
                        checked={tempFilters.createdDate === opt.key}
                        onChange={() =>
                          setTempFilters((prev) => ({
                            ...prev,
                            createdDate: opt.key,
                          }))
                        }
                        className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </FilterPopup>
      </div>
      {/* Views */}
      <div className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {view === "table" ? (
          <TableView
            data={currentPlans}
            columns={columns}
            loading={isLoading || isMutating}
            actions={actions}
            emptyState={
              isError
                ? error?.message || "Failed to load plans"
                : "No plans found."
            }
            autoHeight={false}
          />
        ) : (
          <PlanKanbanView
            currentPlans={currentPlans}
            plans={filteredPlans}
            loading={isLoading || isMutating}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        )}
      </div>

      {/* Modals */}
      <PlanFormModal
        open={showFormModal}
        onClose={() => {
          navigate("/sub-plans", { replace: true });
        }}
        mode={formMode}
        initialData={selectedPlan || {}}
        onSubmit={onSubmitPlan}
        isSubmitting={isMutating}
      />

      <PlanViewModal
        open={showViewModal}
        onClose={() => {
          navigate("/sub-plans", { replace: true });
        }}
        plan={selectedPlan}
      />

      {/* Delete Confirmation */}
      <ConfirmationPopup
        isOpen={isDeleteConfirmOpen}
        title="Delete Plan"
        message={`Are you sure you want to delete "${
          planToDelete?.name || planToDelete?.planId
        } plan"?`}
        confirmText="Yes, delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={closeDeleteConfirm}
      />
    </div>
  );
}
