import React, { useRef, useState, useEffect } from "react";
import Header from "../../../Components/Shared/Header/Header";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
// import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import TableView from "../../../Components/Shared/Table/TableView";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import KanbanView from "../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";

import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { formatDateTime } from "../../../utils/dateFormatter.js";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";

// --- DUMMY DATA GENERATOR ---
const generateDummyPolicies = () => {
  const categories = ["INTERVIEW", "ASSESSMENT", "ONBOARDING"];
  const types = ["RESCHEDULE", "CANCELLATION", "NO_SHOW"];

  return Array.from({ length: 10 }).map((_, i) => ({
    _id: `dummy-${i}`,
    policyName: i === 0 ? "rescheduled_more_than_24h" : `policy_rule_${i + 1}`,
    category: categories[i % categories.length],
    type: types[i % types.length],
    feePercentage: Math.floor(Math.random() * 20),
    firstRescheduleFree: Math.random() > 0.5,
    status: i % 3 === 0 ? "Inactive" : "Active",
    createdAt: new Date().toISOString(),
  }));
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

export default function InterviewPolicy() {
  // UI state
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);

  // Dummy Data State
  const [policies, setPolicies] = useState(generateDummyPolicies());
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState(null);

  // Table Columns based on your JSON
  const columns = [
    {
      key: "policyName",
      header: "Policy Name",
      render: (value) => value.replace(/_/g, " ").toUpperCase(),
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
      onClick: (row) => console.log("View", row),
      show: () => true,
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-500" />,
      onClick: (row) => console.log("Edit", row),
      show: () => true,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      onClick: (row) => {
        setPolicyToDelete(row);
        setIsDeleteConfirmOpen(true);
      },
      show: () => true,
    },
  ];

  const filteredData = policies.filter((p) =>
    p.policyName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-6 py-2">
      <Header
        title="Interview Policies"
        onAddClick={() => console.log("Create Policy")}
        addButtonText="Create Policy"
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
            emptyState="No Policies found."
            autoHeight={false}
          />
        ) : (
          <KanbanView
            loading={false}
            data={filteredData.map((p) => ({
              ...p,
              id: p._id,
              title: p.policyName.replace(/_/g, " ").toUpperCase(),
              subTitle: `${p.category} | ${p.type}`,
            }))}
            columns={columns}
            renderActions={(item) => (
              <KanbanActionsMenu item={item} kanbanActions={actions} />
            )}
            emptyState="No Active Policies Found"
            kanbanTitle="Interview Policy"
          />
        )}
      </div>
    </div>
  );
}
