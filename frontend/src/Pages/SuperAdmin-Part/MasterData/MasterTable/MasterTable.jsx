import React, { useEffect, useRef, useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import { Eye, Pencil, Trash2, ArrowLeft, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import MasterKanban from "../MasterKanban";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { useMediaQuery } from "react-responsive";
import SidebarPopup from "../../../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup";
import MasterForm from "../MasterForm";
import axios from "axios";
import { config } from "../../../../config";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";

const MasterTable = () => {
  const { type } = useParams();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilters] = useState({ status: [] });
  const [isFilterActive, setIsFilterActive] = useState(false);
  const navigate = useNavigate();
  const filterIconRef = useRef(null);
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });

  const [masterData, setMasterData] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  // Used to disable outer scrollbar
  useScrollLock(isPopupOpen || isDeletePopupOpen);

  // Fetch Data
  useEffect(() => {
    if (!type) return;
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${config.REACT_APP_API_URL}/${type}`);
        setMasterData(res.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setMasterData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [type]);

  // Create and update
  const handleSaveMaster = async (data) => {
    try {
      if (selectedMaster) {
        // Update existing master
        const res = await axios.put(
          `${config.REACT_APP_API_URL}/master-data/${type}/${selectedMaster._id}`,
          data
        );
        console.log("Updated master:", res.data);

        // Update state
        setMasterData((prev) =>
          prev.map((item) =>
            item._id === selectedMaster._id ? res.data : item
          )
        );
      } else {
        // Create new master
        const res = await axios.post(
          `${config.REACT_APP_API_URL}/master-data/${type}`,
          data
        );
        console.log("Created master:", res.data);

        // Append to state
        setMasterData((prev) => [...prev, res.data]);
      }

      // Reset selected master
      setSelectedMaster(null);
    } catch (err) {
      console.error("Error saving master:", err);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await axios.delete(
        `${config.REACT_APP_API_URL}/master-data/${type}/${deleteTarget._id}`
      );

      if (res.status === 200) {
        console.log(`${type} deleted successfully:`, res.data);
        setMasterData((prev) => prev.filter((m) => m._id !== deleteTarget._id));
        setIsDeletePopupOpen(false);
        setDeleteTarget(null);
      }
    } catch (err) {
      console.error("Error deleting master:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Responsive View
  useEffect(() => {
    setView(isTablet ? "kanban" : "table");
  }, [isTablet]);

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  useEffect(() => {
    document.title = `${
      type ? capitalizeFirstLetter(type) : "Master"
    } | Admin Portal`;
  }, [type]);

  // Search & Filter
  const FilteredData = () => {
    if (!Array.isArray(masterData)) return [];
    return masterData.filter((item) => {
      const searchableFields = Object.values(item).filter(Boolean);
      const matchesQuery = searchableFields.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesFilters =
        filters.status.length === 0 || filters.status.includes(item?.status);
      return matchesQuery && matchesFilters;
    });
  };

  // Pagination
  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const startIndex = currentPage * rowsPerPage;
  const currentFilteredRows = FilteredData().slice(
    startIndex,
    startIndex + rowsPerPage
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const tableColumns = [
    {
      key: "name",
      header: "Master Name",
      render: (value, row) => {
        let displayName;
        switch (type) {
          case "industries":
            displayName = row.IndustryName;
            break;
          case "technology":
            displayName = row.TechnologyMasterName;
            break;
          case "skills":
            displayName = row.SkillName;
            break;
          case "locations":
            displayName = row.LocationName;
            break;
          case "roles":
            displayName = row.RoleName;
            break;
          case "qualification":
            displayName = row.QualificationName;
            break;
          case "universitycollege":
            displayName = row.University_CollegeName;
            break;
          case "company":
            displayName = row.CompanyName;
            break;
          default:
            displayName = null;
        }

        return (
          <span
            className={`font-medium text-custom-blue cursor-pointer text-gray-900"}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedMaster(row);
              setPopupMode("view");
              setIsPopupOpen(true);
            }}
          >
            {capitalizeFirstLetter(displayName) || "N/A"}
          </span>
        );
      },
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (value, row) => <span>{row.CreatedBy || "N/A"}</span>,
    },
    {
      key: "createdDate",
      header: "Created Date",
      render: (value, row) =>
        row.CreatedDate ? (
          <span>{new Date(row.CreatedDate).toLocaleDateString()}</span>
        ) : (
          "N/A"
        ),
    },
    {
      key: "modifiedBy",
      header: "Modified By",
      render: (value, row) => <span>{row.ModifiedBy || "N/A"}</span>,
    },
    {
      key: "modifiedDate",
      header: "Modified Date",
      render: (value, row) =>
        row.ModifiedDate ? (
          <span>{new Date(row.ModifiedDate).toLocaleDateString()}</span>
        ) : (
          "N/A"
        ),
    },
  ];

  const tableActions = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (item) => {
        setSelectedMaster(item);
        setPopupMode("view");
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (item) => {
        setSelectedMaster(item);
        setPopupMode("edit");
        setIsPopupOpen(true);
      },
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="w-4 h-4 text-red-600" />, // Delete icon
      onClick: (item) => {
        setDeleteTarget(item);
        setIsDeletePopupOpen(true);
      },
    },
  ];

  const kanbanColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div className="font-medium">
          {row.IndustryName ||
            row.TechnologyMasterName ||
            row.SkillName ||
            row.LocationName ||
            row.RoleName ||
            row.QualificationName ||
            row.University_CollegeName ||
            row.CompanyName ||
            "N/A"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (value, row) => <span>{row.createdAt || "N/A"}</span>,
    },
  ];

  const renderFilterContent = () => {
    const statusOptions = ["Active", "Inactive"];
    return (
      <div className="space-y-2">
        <span className="font-medium text-gray-700">Status</span>
        {statusOptions.map((status) => (
          <label
            key={status}
            className="flex items-center gap-2 text-sm capitalize"
          >
            <input
              type="checkbox"
              checked={filters.status.includes(status)}
              onChange={() =>
                setFilters((prev) => {
                  const newStatus = prev.status.includes(status)
                    ? prev.status.filter((s) => s !== status)
                    : [...prev.status, status];
                  return { ...prev, status: newStatus };
                })
              }
            />
            {status}
          </label>
        ))}
      </div>
    );
  };

  console.log("SELECTED MASTER DATA ============> : ", selectedMaster);

  // Render Popup content
  const renderMasterDetailsPopup = (master) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-6 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              {tableColumns.map((col) => {
                // Safely render using col.render
                let content;
                if (col.render) {
                  // Pass row = master
                  content = col.render(master[col.key], master);
                } else {
                  content = master[col.key] || "N/A";
                }

                return (
                  <div
                    key={col.key}
                    className="flex justify-between items-start py-2"
                  >
                    <span className="font-medium text-gray-600">
                      {col.header}:
                    </span>
                    <span className="text-gray-800">{content}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="px-4 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-1 bg-white text-custom-blue border border-gray-300 rounded-lg shadow hover:bg-gray-300 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <Header
          title={capitalizeFirstLetter(type)}
          onAddClick={() => {
            setPopupMode("create");
            setIsPopupOpen(true);
          }}
          addButtonText={`Add ${capitalizeFirstLetter(type)}`}
          canCreate={true}
        />
      </div>
      <div className="px-4">
        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNextPage={() =>
            setCurrentPage((p) => (p + 1 < totalPages ? p + 1 : p))
          }
          onFilterClick={() =>
            masterData.length && setFilterPopupOpen((p) => !p)
          }
          isFilterPopupOpen={isFilterPopupOpen}
          isFilterActive={isFilterActive}
          dataLength={masterData?.length}
          searchPlaceholder={`Search ${type}...`}
          filterIconRef={filterIconRef}
        />
      </div>
      <motion.div className="bg-white">
        {view === "table" ? (
          <TableView
            data={currentFilteredRows}
            columns={tableColumns}
            actions={tableActions}
            loading={isLoading}
            emptyState="No Master data found."
          />
        ) : (
          <MasterKanban
            data={currentFilteredRows.map((row) => ({
              ...row,
              id: row._id,
              title:
                row.IndustryName ||
                row.TechnologyMasterName ||
                row.SkillName ||
                "N/A",
              subtitle: row.status || "Unknown",
            }))}
            masterData={masterData}
            columns={kanbanColumns}
            renderActions={(item) =>
              tableActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(item);
                  }}
                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title={action.label}
                >
                  {action.icon}
                </button>
              ))
            }
            loading={isLoading}
            emptyState="No master data found."
          />
        )}

        {/* Filter Popup */}
        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setFilterPopupOpen(false)}
          onApply={() => {
            setIsFilterActive(filters.status.length > 0);
            setFilterPopupOpen(false);
            setCurrentPage(0);
          }}
          onClearAll={() => {
            setFilters({ status: [] });
            setIsFilterActive(false);
            setFilterPopupOpen(false);
          }}
          filterIconRef={filterIconRef}
        >
          {renderFilterContent()}
        </FilterPopup>
      </motion.div>
      {/* Master Form (Edit / Create) */}
      {/* Master Form (Create / Edit) */}
      {isPopupOpen && (popupMode === "edit" || popupMode === "create") && (
        <MasterForm
          isOpen={true}
          onClose={() => {
            setIsPopupOpen(false);
            setPopupMode(null);
            setSelectedMaster(null);
          }}
          onSubmit={handleSaveMaster}
          type={type}
          initialData={popupMode === "edit" ? selectedMaster : null}
          mode={popupMode}
        />
      )}
      {/* Sidebar View (Read-only details) */}
      {isPopupOpen && popupMode === "view" && selectedMaster && (
        <SidebarPopup
          title={capitalizeFirstLetter(type)}
          onClose={() => {
            setIsPopupOpen(false);
            setPopupMode(null);
          }}
        >
          {renderMasterDetailsPopup(selectedMaster)}
        </SidebarPopup>
      )}
      {/* Delete Confirmation Modal */}

      <div>
        {isDeletePopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[380px] animate-fadeIn">
              {/* Icon + Title */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Confirm Deletion
                </h2>
              </div>

              {/* Message */}
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-medium text-gray-800">{type}</span>
                ? <br />
                This action{" "}
                <span className="text-red-600 font-medium">cannot</span> be
                undone.
              </p>

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsDeletePopupOpen(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white shadow hover:bg-red-700 transition"
                  disabled={isLoading}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Outlet />
    </>
  );
};

export default MasterTable;
