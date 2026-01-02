import React, { useRef, useState, useEffect, useMemo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Header from "../../../Components/Shared/Header/Header";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
// import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import TableView from "../../../Components/Shared/Table/TableView";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import KanbanView from "../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { formatDateTime } from "../../../utils/dateFormatter.js";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import DeleteConfirmModal from "../../../Pages/Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../../services/toastService.js";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useInterviewPolicies } from "../../../apiHooks/useInterviewPolicies.js";

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
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsKanbanMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            action.key === "view"
              ? "text-custom-blue hover:bg-custom-blue/10"
              : "text-green-600 hover:bg-green-600/10"
          }`}
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen(!isKanbanMoreOpen);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isKanbanMoreOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <span className="mr-2">{action.icon}</span>
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

export default function InterviewPolicy() {
  const navigate = useNavigate();
  // UI state
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);

  const [policies, setPolicies] = useState([]);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  const { getAllPolicies, deletePolicy } = useInterviewPolicies();

  const fetchPolicies = async () => {
    try {
      const response = await getAllPolicies();
      if (response.success) {
        setPolicies(response.policies);
      }
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const ITEMS_PER_PAGE = 10;

  const defaultFilters = {
    categories: [],
    types: [],
    status: [],
  };

  // ... inside the component
  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const processedData = useMemo(() => {
    let result = [...policies];

    // 1. Filter by Search Query
    if (debouncedSearch) {
      result = result.filter((p) =>
        p.policyName.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // 2. Filter by Category
    if (selectedFilters.categories.length > 0) {
      result = result.filter((p) =>
        selectedFilters.categories.includes(p.category)
      );
    }

    // 3. Filter by Type
    if (selectedFilters.types.length > 0) {
      result = result.filter((p) => selectedFilters.types.includes(p.type));
    }

    // 4. Filter by Status
    if (selectedFilters.status.length > 0) {
      result = result.filter((p) => selectedFilters.status.includes(p.status));
    }

    return result;
  }, [policies, debouncedSearch, selectedFilters]);

  // Pagination Logic
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const paginatedData = processedData.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Debounce Search Logic
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Reset to page 1 when searching or filtering
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedFilters]);

  const handleDeleteConfirm = async () => {
    if (!policyToDelete) return;

    try {
      const response = await deletePolicy(policyToDelete._id);
      if (response.success) {
        await fetchPolicies();
        // Option 2: Local state filter (faster UI response)
        // setPolicies(prev => prev.filter(p => p._id !== policyToDelete._id));

        setShowDeleteConfirmModal(false);
        setPolicyToDelete(null);
        notify.success("Policy deleted successfully!");
      }
    } catch (error) {
      console.error("Delete failed:", error);
      notify.error("Error deleting policy");
    }
  };

  // Table Columns based on your JSON
  const columns = [
    {
      key: "policyName",
      header: "Policy Name",
      render: (value, row) => (
        <span
          className="block truncate max-w-[210px] text-custom-blue cursor-pointer font-medium"
          onClick={() => navigate(`view/${row._id}`)}
          title={value.replace(/_/g, " ").toUpperCase()}
        >
          {value.replace(/_/g, " ").toUpperCase()}
        </span>
      ),
    },
    { key: "category", header: "Category" },
    { key: "type", header: "Type" },
    { key: "feePercentage", header: "Fee (%)", render: (value) => `${value}%` },
    {
      key: "firstRescheduleFree",
      header: "1st Free",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => formatDateTime(value),
    },
  ];

  const kanbanColumns = [
    {
      key: "policyName",
      header: "Policy Name",
      render: (value, row) => (
        <span
          className="block truncate max-w-[210px] cursor-default"
          title={value.replace(/_/g, " ").toUpperCase()}
        >
          {value.replace(/_/g, " ").toUpperCase()}
        </span>
      ),
    },
    { key: "category", header: "Category" },
    { key: "type", header: "Type" },
    { key: "feePercentage", header: "Fee (%)", render: (value) => `${value}%` },
    {
      key: "firstRescheduleFree",
      header: "1st Free",
      render: (value) => (value ? "Yes" : "No"),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value) => formatDateTime(value),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => navigate(`view/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-500" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: (row) => {
        setPolicyToDelete(row);
        setShowDeleteConfirmModal(true);
      },
    },
  ];

  const applyFilters = () => {
    setSelectedFilters(tempFilters);
    setIsFilterPopupOpen(false);
  };

  const clearAllFilters = () => {
    setTempFilters(defaultFilters);
    setSelectedFilters(defaultFilters);
    setIsFilterPopupOpen(false);
  };

  const isFilterActive =
    JSON.stringify(selectedFilters) !== JSON.stringify(defaultFilters);

  return (
    <div className="w-full px-6 py-2">
      <Header
        title="Interview Policies"
        onAddClick={() => navigate("/interview-policy/new")}
        addButtonText="New Policy"
        canCreate={true}
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
          setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
        }
        onFilterClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
        isFilterActive={isFilterActive}
        isFilterPopupOpen={isFilterPopupOpen}
        dataLength={processedData.length}
        filterIconRef={filterIconRef}
      />

      <div className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {view === "table" ? (
          <TableView
            data={paginatedData}
            columns={columns}
            actions={actions}
            emptyState="No Policies found."
            autoHeight={false}
          />
        ) : (
          <KanbanView
            loading={false}
            data={paginatedData.map((policy) => ({
              ...policy,
              id: policy._id,
              title: policy.policyName.replace(/_/g, " ").toUpperCase(),
              subTitle: `${policy.category} | ${policy.type}`,
              navigateTo: `view/${policy._id}`,
            }))}
            columns={kanbanColumns}
            renderActions={(item) => (
              <KanbanActionsMenu item={item} kanbanActions={actions} />
            )}
            emptyState="No Active Policies Found"
            kanbanTitle="Interview Policy"
          />
        )}

        {/* Filter Popup Component */}
        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setIsFilterPopupOpen(false)}
          onApply={applyFilters}
          onClearAll={clearAllFilters}
          filterIconRef={filterIconRef}
        >
          <div className="p-4 space-y-4">
            {/* Category Section */}
            <div>
              <h4 className="font-semibold mb-2">Category</h4>
              {["INTERVIEW", "MOCK"].map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 mb-1 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.categories.includes(cat)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...tempFilters.categories, cat]
                        : tempFilters.categories.filter((c) => c !== cat);
                      setTempFilters({ ...tempFilters, categories: next });
                    }}
                    className="rounded accent-custom-blue"
                  />
                  {cat}
                </label>
              ))}
            </div>

            {/* Status Section */}
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              {["Active", "Inactive"].map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 mb-1 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={tempFilters.status.includes(s)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...tempFilters.status, s]
                        : tempFilters.status.filter((item) => item !== s);
                      setTempFilters({ ...tempFilters, status: next });
                    }}
                    className="rounded accent-custom-blue"
                  />
                  {capitalizeFirstLetter(s)}
                </label>
              ))}
            </div>
          </div>
        </FilterPopup>
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Policy"
        entityName={policyToDelete?.policyName.replace(/_/g, " ").toUpperCase()}
      />

      <Outlet />
    </div>
  );
}
