import React, { useRef, useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import KanbanView from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { Eye, Pencil, Trash2, MoreVertical } from "lucide-react";
import { formatDateTime } from "../../../../utils/dateFormatter.js";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import DeleteConfirmModal from "../../../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";
import { notify } from "../../../../services/toastService.js";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useCompanies } from "../../../../apiHooks/TenantCompany/useTenantCompanies.js";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import CompanyForm from "./CompanyForm.jsx";
import {
  getCompanyColumns,
  getCompanyActions,
} from "../../../../utils/tableColumnAndActionData.jsx";
import { useTitle } from "../../../../apiHooks/Title/useTitle.js";

const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key),
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key),
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
          className={`p-1.5 rounded-lg transition-colors ${action.key === "view"
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

const Companies = () => {
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const filterIconRef = useRef(null);

  // Title ----------------------------------------
  useTitle("Companies");
  // Title ----------------------------------------

  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [companies, setCompanies] = useState([]);

  // ---------------------------------------------------------------------
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("Create");
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  // --------------------------------------------------------------------

  const { industries } = useMasterData({}, "adminPortal");
  const { getAllCompanies, deleteCompany } = useCompanies();

  // State for infinite scroll
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 20;
  const [currentApiPage, setCurrentApiPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const defaultFilters = {
    status: [],
    industry: [],
  };

  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);

  const fetchCompanies = async (page = 0, append = false) => {
    try {
      if (page === 0) setIsInitialLoading(true);
      else setIsLoadingMore(true);

      const filters = {
        page: page + 1, // API expects 1-based index
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        status: selectedFilters.status.join(","),
        industry: selectedFilters.industry.join(","),
      };

      const result = await getAllCompanies(filters);

      const newData = result.data || [];
      const total = result.totalCount || 0;
      setTotalCount(total);

      if (append) {
        setCompanies((prev) => [...prev, ...newData]);
      } else {
        setCompanies(newData);
      }

      const totalLoaded = append ? companies.length + newData.length : newData.length;
      setHasMore(totalLoaded < total);
      setCurrentApiPage(page);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      if (!append) setCompanies([]);
    } finally {
      setIsInitialLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentApiPage(0);
    fetchCompanies(0, false);
  }, [searchQuery, selectedFilters]);

  const handleScrollEnd = () => {
    if (hasMore && !isLoadingMore) {
      fetchCompanies(currentApiPage + 1, true);
    }
  };


  const columns = getCompanyColumns(navigate);

  const actions = getCompanyActions(navigate, {
    callbacks: {
      onEdit: (row) => {
        setFormMode("Edit");
        setSelectedCompanyId(row._id);
        setIsFormOpen(true);
      },
      onDelete: (row) => {
        setCompanyToDelete(row);
        setShowDeleteConfirmModal(true);
      },
    },
  });

  const handleDeleteConfirm = async () => {
    try {
      await deleteCompany(companyToDelete._id);
      notify.success("Company deleted successfully");
      setShowDeleteConfirmModal(false);
      fetchCompanies();
    } catch (error) {
      notify.error("Failed to delete company");
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedCompanyId(null);
  };

  return (
    <div className="w-full h-full px-6 py-2">
      <Header
        title="Companies"
        // onAddClick={() => navigate("/companies/new")}
        onAddClick={() => {
          setFormMode("Create");
          setSelectedCompanyId(null);
          setIsFormOpen(true);
        }}
        addButtonText="Add Company"
        canCreate={true}
      />

      <Toolbar
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        onSearch={(e) => setSearchQuery(e.target.value)}
        onFilterClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
        isFilterActive={
          JSON.stringify(selectedFilters) !== JSON.stringify(defaultFilters)
        }
        isFilterPopupOpen={isFilterPopupOpen}
        dataLength={totalCount}
        filterIconRef={filterIconRef}
        searchPlaceholder="Search by Company Name, Industry, Email..."
        hidePagination={true}
      />

      <div className="fixed sm:top-64 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* Companies count */}
        {totalCount > 0 && (
          <div className="flex items-center justify-start px-6 py-2">
            <span className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-semibold text-gray-800">{companies.length}</span>
              {" "}of{" "}
              <span className="font-semibold text-gray-800">
                {(() => {
                  const t = totalCount;
                  const r = Math.floor(t / 100) * 100;
                  if (r === 0) return t;
                  if (t === r) return t;
                  return `${r}+`;
                })()}
              </span>
              {" "}{totalCount === 1 ? "company" : "companies"}
            </span>
          </div>
        )}
        {view === "table" ? (
          <TableView
            data={companies}
            columns={columns}
            actions={actions}
            emptyState="No Companies found."
            autoHeight={false}
            loading={isInitialLoading}
            onScrollEnd={handleScrollEnd}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
          />
        ) : (
          <KanbanView
            loading={isInitialLoading}
            data={companies.map((c) => ({
              ...c,
              id: c._id,
              title: c.name,
              subTitle: c.industry,
              navigateTo: `view/${c._id}`,
            }))}
            columns={columns}
            renderActions={(item) => (
              <KanbanActionsMenu item={item} kanbanActions={actions} />
            )}
            emptyState="No Companies Found"
            kanbanTitle="Company"
            onScrollEnd={handleScrollEnd}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
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
            {/* Status Filter */}
            <div>
              <h4 className="font-semibold mb-2">Status</h4>
              {["Active", "Inactive"].map((status) => (
                <label
                  key={status}
                  className="flex gap-2 text-sm cursor-pointer hover:text-custom-blue"
                >
                  <input
                    type="checkbox"
                    className="accent-custom-blue"
                    checked={tempFilters.status.includes(status.toLowerCase())}
                    onChange={(e) => {
                      const val = status.toLowerCase();
                      const next = e.target.checked
                        ? [...tempFilters.status, val]
                        : tempFilters.status.filter((item) => item !== val);
                      setTempFilters({ ...tempFilters, status: next });
                    }}
                  />
                  {status}
                </label>
              ))}
            </div>

            {/* Industry Filter */}
            <div>
              <h4 className="font-semibold mb-2">Industry</h4>
              {industries.map((i) => (
                <label
                  key={i._id}
                  className="flex gap-2 text-sm cursor-pointer hover:text-custom-blue"
                >
                  <input
                    type="checkbox"
                    className="accent-custom-blue"
                    checked={tempFilters.industry.includes(i.IndustryName)}
                    onChange={(e) => {
                      const val = i.IndustryName;
                      const next = e.target.checked
                        ? [...tempFilters.industry, val]
                        : tempFilters.industry.filter((item) => item !== val);
                      setTempFilters({ ...tempFilters, industry: next });
                    }}
                  />
                  {capitalizeFirstLetter(i.IndustryName)}
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
        title="Company"
        entityName={companyToDelete?.name}
      />

      {/* --- RENDER THE FORM COMPONENT CONDITIONALLY --- */}
      {isFormOpen && (
        <CompanyForm
          mode={formMode}
          id={selectedCompanyId}
          onClose={handleCloseForm}
          onSuccess={fetchCompanies}
        />
      )}

      <Outlet />
    </div>
  );
};

export default Companies;
