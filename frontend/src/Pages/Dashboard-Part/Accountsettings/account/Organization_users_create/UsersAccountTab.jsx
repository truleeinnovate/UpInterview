import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  ChevronUp,
  ChevronDown,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import Header from "../../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../../Components/Shared/Table/TableView";
import { FilterPopup } from "../../../../../Components/Shared/FilterPopup/FilterPopup";
import KanbanView from "./KanbanView";
import Loading from "../../../../../Components/Loading";
import toast from "react-hot-toast";
import maleImage from "../../../Images/man.png";
import femaleImage from "../../../Images/woman.png";
import genderlessImage from "../../../Images/transgender.png";
import ConfirmationModal from "./ConfirmModel";

const UsersAccountTab = () => {
  const { usersRes, usersLoading, currentPlan, toggleUserStatus } =
    useCustomContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    roles: [],
  });
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showUserManagementPopup, setShowUserManagementPopup] = useState(false);
  const filterIconRef = useRef(null);

  // Set view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setView("kanban");
      } else {
        setView("table");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedRoles(selectedFilters.roles);
      setIsRolesOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  // Filter handling
  const handleRoleToggle = (role) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleClearAll = () => {
    const clearedFilters = { roles: [] };
    setSelectedRoles([]);
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = { roles: selectedRoles };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(filters.roles.length > 0);
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (usersRes?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  // Unique roles for filter options
  const uniqueRoles = [
    ...new Set(usersRes?.map((user) => user.label).filter(Boolean)),
  ];

  // Filtered data
  const FilteredData = () => {
    if (!Array.isArray(usersRes)) return [];
    return usersRes.filter((user) => {
      const fieldsToSearch = [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.label,
      ].filter((field) => field !== null && field !== undefined);

      const matchesRole =
        selectedFilters.roles.length === 0 ||
        selectedFilters.roles.includes(user.label);
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesRole;
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData().length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  // Action logic
  const handleStatusToggleAction = (user) => {
    const status = user.status === "active" ? "inactive" : "active";
    setSelectedUser(user);
    setNewStatus(status);
    setShowConfirmation(true);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      toggleUserStatus.mutate({
        userId: selectedUser._id,
        newStatus,
      });
    }
    setShowConfirmation(false);
  };

  const cancelStatusChange = () => {
    setShowConfirmation(false);
    setSelectedUser(null);
  };

  const handleView = (user) => {
    navigate(`details/${user._id}`, { state: { userData: user } });
  };

  // const handleEdit = (user) => {
  //   navigate(`edit/${user._id}`, { state: { userData: user } });
  // };

    console.log("usersRes",usersRes);

  // Table Columns Configuration
  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            {row?.imageData?.path ? (
              <img
                className="h-8 w-8 rounded-full object-cover"
                src={row?.imageData?.path}
                alt={`${row.firstName || ""} ${row.lastName || ""}`}
                onError={(e) => {
                  e.target.src =
                    row.gender === "Male"
                      ? maleImage
                      : row.gender === "Female"
                      ? femaleImage
                      : genderlessImage;
                }}
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
                {row.firstName ? row.firstName.charAt(0).toUpperCase() : "?"}
              </div>
            )}
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleView(row)}
            >
              {`${row.firstName || ""} ${row.lastName || ""}`.trim() ||
                "Unknown"}
            </div>
          </div>
        </div>
      ),
    },
    { key: "email", header: "Email", render: (value) => value || "N/A" },
    { key: "phone", header: "Phone", render: (value) => value || "N/A" },
    {key:"status",header:"Status",render:(value) => value || "N/A"},
    { key: "label", header: "Role", render: (value) => value || "N/A" },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "status",
      label: (row) => {
        if (!row.status) return "Unknown Status";
        return row.status === "active" ? "In Active" : "Active";
      },
      icon: (row) => (
        <div
          className="flex items-center justify-center w-6 h-6"
          title={row.status === "active" ? "Deactivate user" : "Activate user"}
        >
          {row.status === "active" ? (
            <CheckCircle size={20} className="text-green-500" />
          ) : row.status === "inactive" ? (
            <XCircle size={20} className="text-red-500" />
          ) : (
            <Info size={20} className="text-gray-500" />
          )}
        </div>
      ),
      onClick: (row) => {
        handleStatusToggleAction(row);
      },
    },

    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => handleView(row),
    },
    // {
    //   key: "edit",
    //   label: "Edit",
    //   icon: <Pencil className="w-4 h-4 text-green-600" />,
    //   onClick: (row) => handleEdit(row),
    // },
  ];

  return (
    <div className="h-screen fixed w-full flex">
      {/* Sidebar spacing from AccountSettingsSidebar */}
      <div className="" />
      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-0 h-full overflow-y-auto">
        <div className="fixed top-16 left-64 right-0 bg-background z-10 px-4 sm:px-8 lg:px-8 xl:px-8 2xl:px-8">
          {/* Info Icon for User Management Popup */}
          {/* <motion.div
            className=""
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={() => setShowUserManagementPopup(true)}
              className="p-1 text-custom-blue hover:text-custom-blue/80 focus:outline-none"
              title="User Management Info"
            >
              <Info size={20} />
            </button>
          </motion.div> */}
          {/* Header and Toolbar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Header
              title="Users"
              onAddClick={() => {
                if (usersRes.length >= currentPlan.maxUsers) {
                  toast(
                    "Please upgrade your plan or deactivate existing users to add more.",
                    {
                      icon: "⚠️",
                      style: {
                        background: "#fff3cd",
                        color: "#856404",
                        border: "1px solid #ffeeba",
                      },
                    }
                  );
                } else {
                  navigate("new");
                }
              }}
              addButtonText="Add User"
            />
          </motion.div>
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
            dataLength={usersRes?.length}
            searchPlaceholder="Search by Firstname, Email, Phone..."
            filterIconRef={filterIconRef}
          />
        </div>
        <div className="fixed top-48 xl:top-56 lg:top-56 left-64 right-0 bg-background">
          <motion.div className="">
            <div className="relative w-full">
              {view === "table" ? (
                <div className="w-full">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={usersLoading}
                    actions={tableActions}
                    emptyState="No users found."
                  />
                </div>
              ) : (
                <div className="w-full pl-4 pt-4 pr-4 mb-5">
                  <KanbanView
                    currentFilteredRows={currentFilteredRows}
                    loading={usersLoading}
                    setActionViewMore={() => {}}
                    userData={usersRes}
                    toggleSidebar={() => navigate("new")}
                  />
                </div>
              )}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                <div className="space-y-3">
                  {/* Roles Section */}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsRolesOpen(!isRolesOpen)}
                    >
                      <span className="font-medium text-gray-700">Roles</span>
                      {isRolesOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isRolesOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {uniqueRoles.length > 0 ? (
                          uniqueRoles.map((role) => (
                            <label
                              key={role}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRoles.includes(role)}
                                onChange={() => handleRoleToggle(role)}
                                className="h-4 w-4 rounded text-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{role}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No roles available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </FilterPopup>
            </div>
          </motion.div>
        </div>
      </div>
      {showUserManagementPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 border border-gray-100"
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    User Management Guide
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your team's interviewers efficiently
                  </p>
                </div>
                <button
                  onClick={() => setShowUserManagementPopup(false)}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                  aria-label="Close"
                >
                  <XCircle size={20} />
                </button>
              </div>

              <div className="mt-6 space-y-4 text-sm text-gray-700">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500 mt-0.5">
                    <Info size={20} />
                  </div>
                  <p className="ml-3">
                    Manage all users who can conduct interviews, including:
                  </p>
                </div>

                <ul className="space-y-3 pl-8">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-blue-500 rounded-full"></span>
                    <span className="ml-2">
                      Create and manage interviewer accounts
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-blue-500 rounded-full"></span>
                    <span className="ml-2">Set user roles and permissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-blue-500 rounded-full"></span>
                    <span className="ml-2">
                      Configure interview availability and expertise
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-blue-500 rounded-full"></span>
                    <span className="ml-2">
                      Track interviewer performance and ratings
                    </span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowUserManagementPopup(false)}
                  className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <ConfirmationModal
        show={showConfirmation}
        userName={`${selectedUser?.firstName} ${selectedUser?.lastName}`}
        newStatus={newStatus}
        onCancel={cancelStatusChange}
        onConfirm={confirmStatusChange}
      />
    </div>
  );
};

export default UsersAccountTab;
