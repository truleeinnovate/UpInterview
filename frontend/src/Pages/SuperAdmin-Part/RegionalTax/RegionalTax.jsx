import React, { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../../Components/Shared/Header/Header";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../Components/Shared/Table/TableView";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import KanbanView from "../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";

import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { formatDateTime } from "../../../utils/dateFormatter.js";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import DeleteConfirmModal from "../../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import {
  useRegionalTaxConfigs,
  useDeleteRegionalTaxConfig,
} from "../../../apiHooks/useTenantTaxConfig.js";
import { notify } from "../../../services/toastService.js";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";

// --- STATIC DATA BASED ON YOUR JSON ---
const generateRegionalTaxData = () => {
  return [
    {
      _id: "6953a5c95014cf9a33528260",
      country: "United States",
      regionCode: "US",
      currency: { code: "USD", symbol: "$" },
      gst: { enabled: false, percentage: 0 },
      serviceCharge: { enabled: true, percentage: 8, fixedAmount: 0 },
      status: "Inactive",
      isDefault: false,
      createdAt: "2025-12-30T10:13:30.438Z",
      updatedAt: "2025-12-30T10:13:30.438Z",
    },
    {
      _id: "6953a5c95014cf9a33528261",
      country: "India",
      regionCode: "IN",
      currency: { code: "INR", symbol: "₹" },
      gst: { enabled: true, percentage: 18 },
      serviceCharge: { enabled: true, percentage: 5, fixedAmount: 0 },
      status: "Active",
      isDefault: true,
      createdAt: "2025-12-25T10:13:30.438Z",
      updatedAt: "2025-12-25T10:13:30.438Z",
    },
  ];
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

const RegionalTax = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [regionalTaxToDelete, setRegionalTaxToDelete] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const { data: taxConfigData } = useRegionalTaxConfigs();

  const { mutate: deleteRegionalTax } = useDeleteRegionalTaxConfig();

  const defaultFilters = {
    status: [],
    gstEnabled: [],
    serviceChargeEnabled: [],
  };

  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const processedData = React.useMemo(() => {
    let result = [...(taxConfigData || [])];

    // Search
    if (debouncedSearch) {
      result = result.filter(
        (t) =>
          t.country?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          t.regionCode?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
    }

    // Status
    if (selectedFilters.status.length > 0) {
      result = result.filter((t) => selectedFilters.status.includes(t.status));
    }

    // GST
    if (selectedFilters.gstEnabled.length > 0) {
      result = result.filter((t) =>
        selectedFilters.gstEnabled.includes(
          t.gst?.enabled ? "Enabled" : "Disabled"
        )
      );
    }

    // Service Charge
    if (selectedFilters.serviceChargeEnabled.length > 0) {
      result = result.filter((t) =>
        selectedFilters.serviceChargeEnabled.includes(
          t.serviceCharge?.enabled ? "Enabled" : "Disabled"
        )
      );
    }

    return result;
  }, [taxConfigData, debouncedSearch, selectedFilters]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedFilters]);

  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

  const paginatedData = processedData.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const columns = [
    {
      key: "country",
      header: "Country",
      render: (val, row) => (
        <span
          className="block truncate max-w-[180px] cursor-default text-custom-blue font-medium"
          title={val}
          onClick={(e) => navigate(`view/${row._id}`)}
        >
          {val}
        </span>
      ),
    },
    { key: "regionCode", header: "Code" },
    {
      key: "currency",
      header: "Currency",
      render: (val) => `${val.code} (${val.symbol})`,
    },
    {
      key: "gst",
      header: "GST/Tax",
      render: (val) => (val.enabled ? `${val.percentage}%` : "Disabled"),
    },
    {
      key: "serviceCharge",
      header: "Service Charge",
      render: (val) => (val.enabled ? `${val.percentage}%` : "0%"),
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
      show: () => true,
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-500" />,
      onClick: (row) => navigate(`edit/${row._id}`),
      show: () => true,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: (row) => {
        setRegionalTaxToDelete(row);
        setShowDeleteConfirmModal(true);
      },
      show: () => true,
    },
  ];

  const filteredData = taxConfigData?.filter(
    (t) =>
      t?.country?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      t?.regionCode?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const handleDeleteConfirm = () => {
    if (!regionalTaxToDelete?._id) return;

    deleteRegionalTax(regionalTaxToDelete._id, {
      onSuccess: () => {
        notify.success("Regional tax deleted successfully");
        setShowDeleteConfirmModal(false);
        setRegionalTaxToDelete(null);
      },
      onError: (error) => {
        notify.error("Failed to delete regional tax");
      },
    });
  };

  return (
    <div className="w-full px-6 py-2">
      <Header
        title="Regional Tax"
        onAddClick={() => navigate("/regional-tax/new")}
        addButtonText="Add Region"
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
        isFilterActive={
          JSON.stringify(selectedFilters) !== JSON.stringify(defaultFilters)
        }
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
            emptyState="No Regional Tax data found."
            autoHeight={false}
          />
        ) : (
          <KanbanView
            loading={false}
            data={paginatedData.map((tax) => ({
              ...tax,
              id: tax?._id,
              title: tax?.country,
              subTitle: `${tax?.currency?.code} | GST: ${
                tax?.gst?.enabled ? tax?.gst?.percentage + "%" : "N/A"
              }`,
              navigateTo: `view/${tax?._id}`,
            }))}
            columns={columns}
            renderActions={(item) => (
              <KanbanActionsMenu item={item} kanbanActions={actions} />
            )}
            emptyState="No Regions Found"
            kanbanTitle="Regional Tax"
          />
        )}

        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setIsFilterPopupOpen(false)}
          onApply={() => {
            setSelectedFilters(tempFilters);
            setIsFilterPopupOpen(false);
          }}
          onClearAll={() => {
            setTempFilters(defaultFilters);
            setSelectedFilters(defaultFilters);
            setIsFilterPopupOpen(false);
          }}
          filterIconRef={filterIconRef}
        >
          <div className="p-4 space-y-4">
            {/* Status */}
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              {["Active", "Inactive"].map((s) => (
                <label key={s} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-custom-blue"
                    checked={tempFilters.status.includes(s)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...tempFilters.status, s]
                        : tempFilters.status.filter((i) => i !== s);
                      setTempFilters({ ...tempFilters, status: next });
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>

            {/* GST */}
            <div>
              <h4 className="font-semibold mb-2">GST</h4>
              {["Enabled", "Disabled"].map((g) => (
                <label key={g} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-custom-blue"
                    checked={tempFilters.gstEnabled.includes(g)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...tempFilters.gstEnabled, g]
                        : tempFilters.gstEnabled.filter((i) => i !== g);
                      setTempFilters({ ...tempFilters, gstEnabled: next });
                    }}
                  />
                  {g}
                </label>
              ))}
            </div>

            {/* Service Charge */}
            <div>
              <h4 className="font-semibold mb-2">Service Charge</h4>
              {["Enabled", "Disabled"].map((s) => (
                <label key={s} className="flex gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-custom-blue"
                    checked={tempFilters.serviceChargeEnabled.includes(s)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...tempFilters.serviceChargeEnabled, s]
                        : tempFilters.serviceChargeEnabled.filter(
                            (i) => i !== s
                          );
                      setTempFilters({
                        ...tempFilters,
                        serviceChargeEnabled: next,
                      });
                    }}
                  />
                  {s}
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
        title="Regional Tax"
        entityName={regionalTaxToDelete?.policyName}
      />

      <Outlet />
    </div>
  );
};

export default RegionalTax;
