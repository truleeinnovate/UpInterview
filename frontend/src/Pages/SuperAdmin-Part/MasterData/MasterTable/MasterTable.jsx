// v1.0.0 - Ashok - Added toast message for creating, updating and deleting masters
// v1.0.1 - Ashok - Fixed issues
// v1.0.2 - Ashok - Change placement of category field
// v1.0.3 - Ashok - Added Name field at the table for technology

import React, { useEffect, useRef, useState } from "react";
import { Outlet, useParams, useNavigate } from "react-router-dom";
import {
  Eye,
  Pencil,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  Edit2,
} from "lucide-react";
import { motion } from "framer-motion";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import MasterKanban from "../MasterKanban";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { useMediaQuery } from "react-responsive";
import MasterForm from "../MasterForm";
import axios from "axios";
import { config } from "../../../../config";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.0 <------------------------------------------------------------------------
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
// v1.0.0 ------------------------------------------------------------------------>

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

  const authToken = Cookies.get("authToken");
  const impersonationToken = Cookies.get("impersonationToken");

  const impersonatedTokenPayload = decodeJwt(impersonationToken);
  const ownerId = impersonatedTokenPayload?.impersonatedUserId;
  // const tenantId = tokenPayload?.tenantId;

  // console.log("ownerId",ownerId);
  // console.log("impersonatedTokenPayload",impersonatedTokenPayload);
  // console.log("impersonationToken",impersonationToken);

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
  // v1.0.1 <-----------------------------------------------------------------

  // const handleSaveMaster = async (data) => {
  //   try {
  //     console.log("MASTER DATA FOR SAVING FORM ==========> ", data)
  //     if (selectedMaster) {
  //       // Update existing master
  //       const res = await axios.put(
  //         `${config.REACT_APP_API_URL}/master-data/${type}/${selectedMaster._id}`,
  //         data,
  //         ownerId
  //       );
  //       console.log("Updated master:", res.data);

  //       toast.success(`Master updated successfully!`);
  //     } else {
  //       // Create new master
  //       const res = await axios.post(
  //         `${config.REACT_APP_API_URL}/master-data/${type}`,
  //         {
  //           // data,
  //           ...data,
  //           ownerId,
  //         }
  //       );
  //       console.log("Created master:", res.data);

  //       toast.success(`Master created successfully!`);
  //     }

  //     // Reset selected master
  //     setSelectedMaster(null);
  //   } catch (err) {
  //     console.error("Error saving master:", err);
  //     const message =
  //       err.response?.data?.message ||
  //       `Failed to save Master. Please try again.`;
  //     toast.error(message);
  //   }
  // };
  const handleSaveMaster = async (data) => {
    try {
      const payload =
        Array.isArray(data) && data.length > 0
          ? data.map((item) => ({ ...item, ownerId })) // bulk + ownerId
          : { ...data, ownerId }; // single

      if (selectedMaster) {
        // Update existing master
        const res = await axios.put(
          `${config.REACT_APP_API_URL}/master-data/${type}/${selectedMaster._id}`,
          payload
        );
        console.log("Updated master:", res.data);
        toast.success(`Master updated successfully!`);
      } else {
        // Create new master
        const res = await axios.post(
          `${config.REACT_APP_API_URL}/master-data/${type}`,
          payload
        );
        console.log("Created master:", res.data);
        toast.success(`Master created successfully!`);
      }

      // Reset selected master
      setSelectedMaster(null);
    } catch (err) {
      console.error("Error saving master:", err);
      const message =
        err.response?.data?.error || `Failed to save Master. Please try again.`;
      toast.error(message);
    }
  };

  // v1.0.1 ----------------------------------------------------------------->

  // v1.0.0 <-----------------------------------------------------------------
  // Delete
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsLoading(true);
    try {
      const res = await axios.delete(
        `${config.REACT_APP_API_URL}/master-data/${type}/${deleteTarget._id}`
      );

      if (res.status === 200) {
        setMasterData((prev) => prev.filter((m) => m._id !== deleteTarget._id));
        setIsDeletePopupOpen(false);
        setDeleteTarget(null);
        toast.success(`Master deleted successfully!`);
      }
    } catch (err) {
      console.error("Error deleting master:", err);
      toast.error(`Failed to delete master`);
    } finally {
      setIsLoading(false);
    }
  };
  // v1.0.0 ----------------------------------------------------------------->

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

  // v1.0.1 <------------------------------------------------------------
  // v1.0.2 <------------------------------------------------------------
  // v1.0.3 <------------------------------------------------------------
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
          case "category":
            displayName = row.CategoryName;
            break;
          default:
            displayName = null;
        }

        return (
          <span className={`font-medium text-gray-900"}`}>
            {capitalizeFirstLetter(displayName) || "N/A"}
          </span>
        );
      },
    },
    ...(type === "technology"
      ? [
          {
            key: "Category",
            header: "Category",
            render: (value, row) => (
              <span>
                {row.Category ? capitalizeFirstLetter(row.Category) : "N/A"}
              </span>
            ),
          },
        ]
      : []),
    ...(type === "technology"
      ? [
          {
            key: "name",
            header: "Name",
            render: (value, row) => (
              <span>{row.name ? capitalizeFirstLetter(row.name) : "N/A"}</span>
            ),
          },
        ]
      : []),
    {
      key: "createdBy",
      header: "Created By",
      render: (value, row) => (
        <span>
          {row?.createdBy
            ? `${capitalizeFirstLetter(row.createdBy.firstName) || ""} ${
                capitalizeFirstLetter(row.createdBy.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (value, row) => {
        return row.createdAt ? (
          <span>{new Date(row.createdAt).toLocaleDateString()}</span>
        ) : (
          "N/A"
        );
      },
    },
    {
      key: "updatedBy",
      header: "Updated By",
      render: (value, row) => (
        <span>
          {row?.updatedBy
            ? `${capitalizeFirstLetter(row.updatedBy.firstName) || ""} ${
                capitalizeFirstLetter(row.updatedBy.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated Date",
      render: (value, row) => {
        return row.updatedAt ? (
          <span>{new Date(row.updatedAt).toLocaleDateString()}</span>
        ) : (
          "N/A"
        );
      },
    },
    ...(type === "category"
      ? [
          {
            key: "isActive",
            header: "Status",
            render: (value, row) => (
              <span>
                {row.isActive !== undefined && row.isActive !== null
                  ? capitalizeFirstLetter(row.isActive.toString())
                  : "N/A"}
              </span>
            ),
          },
        ]
      : []),
  ];
  // v1.0.3 ------------------------------------------------------------>
  // v1.0.2 ------------------------------------------------------------>
  // v1.0.1 ------------------------------------------------------------>

  // v1.0.1 <------------------------------------------------------------
  const tableActions = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4 text-green-600" />,
      onClick: (item) => {
        setSelectedMaster(item);
        setPopupMode("edit");
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
  // v1.0.1 ------------------------------------------------------------>

  const kanbanColumns = [
    // {
    //   key: "name",
    //   header: "Master Name",
    //   render: (value, row) => (
    //     <div className="font-medium">
    //       {row.IndustryName ||
    //         row.TechnologyMasterName ||
    //         row.SkillName ||
    //         row.LocationName ||
    //         row.RoleName ||
    //         row.QualificationName ||
    //         row.University_CollegeName ||
    //         row.CompanyName ||
    //         "N/A"}
    //     </div>
    //   ),
    // },
    ...(type === "technology"
      ? [
          {
            key: "name",
            header: "Name",
            render: (value, row) => (
              <span>{row.name ? capitalizeFirstLetter(row.name) : "N/A"}</span>
            ),
          },
        ]
      : []),
    {
      key: "createdBy",
      header: "Created By",
      render: (value, row) => (
        <span>
          {row?.createdBy
            ? `${capitalizeFirstLetter(row.createdBy.firstName) || ""} ${
                capitalizeFirstLetter(row.createdBy.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (value, row) => (
        <span>{new Date(row.createdAt).toLocaleDateString() || "N/A"}</span>
      ),
    },
    {
      key: "updatedBy",
      header: "Updated By",
      render: (value, row) => (
        <span>
          {row?.updatedBy
            ? `${capitalizeFirstLetter(row.updatedBy.firstName) || ""} ${
                capitalizeFirstLetter(row.updatedBy.lastName) || ""
              }`.trim() || "N/A"
            : "N/A"}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Updated Date",
      render: (value, row) => {
        return row.updatedAt ? (
          <span>{new Date(row.updatedAt).toLocaleDateString()}</span>
        ) : (
          "N/A"
        );
      },
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
              // subtitle: row.status || "Unknown",
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
      {/* Delete Confirmation Modal */}
      <div>
        {isDeletePopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] animate-fadeIn">
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
                Are you sure you want to delete Master from{" "}
                <span className="font-medium text-gray-800">
                  {capitalizeFirstLetter(type)}
                </span>
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
