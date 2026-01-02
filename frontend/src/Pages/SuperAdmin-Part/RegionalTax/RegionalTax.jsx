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

  const [taxData, setTaxData] = useState(generateRegionalTaxData());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [regionalTaxToDelete, setRegionalTaxToDelete] = useState(null);

  // Updated Table Columns to match Regional Tax structure
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

  const filteredData = taxData.filter(
    (t) =>
      t.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.regionCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        totalPages={1}
        onPrevPage={() => {}}
        onNextPage={() => {}}
        onFilterClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
        isFilterActive={false}
        isFilterPopupOpen={isFilterPopupOpen}
        dataLength={filteredData.length}
        filterIconRef={filterIconRef}
      />

      <div className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {view === "table" ? (
          <TableView
            data={filteredData}
            columns={columns}
            actions={actions}
            emptyState="No Regional Tax data found."
            autoHeight={false}
          />
        ) : (
          <KanbanView
            loading={false}
            data={filteredData.map((tax) => ({
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
      </div>

      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        // onConfirm={handleDeleteConfirm}
        title="Policy"
        // entityName={policyToDelete?.policyName.replace(/_/g, " ").toUpperCase()}
      />

      <Outlet />
    </div>
  );
};

export default RegionalTax;
