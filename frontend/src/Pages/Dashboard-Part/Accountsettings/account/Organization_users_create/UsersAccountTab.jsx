// v1.0.0  -  Ashraf  -  added data reverse to load updated first
// v1.0.1 - Ashok - fixing Interviews and availability issues for users
// v1.0.2 - Ashok - changes style of bullet points of user management, interviewer groups
/* v1.0.3 - Ashok - changed maleImage (man.png), femaleImage (woman.png) and genderlessImage (transgender.png) 
 path from local to cloud storage url
 */
// v1.0.4 - Ashok - Improved responsiveness
// v1.0.5 - Ashok - Moved users api to hooks
// v1.0.6 - Ashok - fixed style issues
// v1.0.7 - Ashok - Fixed filter popup height issue

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
import { useUsers } from "../../../../../apiHooks/useUsers";
import Header from "../../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../../Components/Shared/Table/TableView";
import { FilterPopup } from "../../../../../Components/Shared/FilterPopup/FilterPopup";
import KanbanView from "./KanbanView";
import Loading from "../../../../../Components/Loading";
import toast from "react-hot-toast";
// v1.0.3 <------------------------------------------------------------
// import maleImage from "../../../Images/man.png";
// import femaleImage from "../../../Images/woman.png";
// import genderlessImage from "../../../Images/transgender.png";
// v1.0.3 ------------------------------------------------------------>
import ConfirmationModal from "./ConfirmModel";
import { usePermissions } from "../../../../../Context/PermissionsContext";
import { config } from "../../../../../config";
import axios from "axios";
import AuthCookieManager from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";
import { getEmptyStateMessage } from "../../../../../utils/EmptyStateMessage/emptyStateMessage";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useSuperAdminUsers } from "../../../../../apiHooks/superAdmin/useContacts";

const UsersAccountTab = () => {
  const userType = AuthCookieManager.getUserType();

  const { effectivePermissions, superAdminPermissions } = usePermissions();
  // const { usersRes, usersLoading, toggleUserStatus } = useCustomContext();
  // ---------------------------------from Hooks---------------------------------------------
  // ---------------------------------from Hooks---------------------------------------------
  // currentPlan removed - use useSubscription hook if needed
  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  // const [selectedFilters, setSelectedFilters] = useState({ roles: [] });
  const [selectedFilters, setSelectedFilters] = useState({ roles: [] });
  const [isRolesOpen, setIsRolesOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [showUserManagementPopup, setShowUserManagementPopup] = useState(false);
  // const [superAdminUsers, setSuperAdminUsers] = useState([]);
  // const [superAdminLoading, setSuperAdminLoading] = useState(false);
  const filterIconRef = useRef(null);

  // const { usersRes, usersLoading, toggleUserStatus } = useUsers({
  //   search: searchQuery.trim(),
  //   role: selectedRoles.join(","),    // MUST BE STRING
  //   page: currentPage + 1,            // API page starts at 1
  //   limit: 10,
  // });

  const { usersRes, usersLoading, toggleUserStatus } = useUsers({
    search: searchQuery.trim(),
    // role: selectedFilters?.roles.length > 0 ? selectedFilters?.roles.join(",") : "", // Use selectedFilters, not selectedRoles
    role:
      selectedFilters.roles && selectedFilters.roles.length > 0
        ? selectedFilters.roles.join(",")
        : "",
    page: currentPage + 1, // backend expects 1-based page
    limit: 10,
  });

  // Use the new super admin users hook
  const {
    // data: superAdminUsers = [],
    data: superAdminData = { users: [], pagination: {} },
    isLoading: superAdminLoading,
    error: superAdminError,
  } = useSuperAdminUsers({
    search: searchQuery.trim(),
    // role: selectedFilters?.roles.length > 0 ? selectedFilters?.roles.join(",") : "", // Use selectedFilters, not selectedRoles
    role:
      selectedFilters.roles && selectedFilters.roles.length > 0
        ? selectedFilters.roles.join(",")
        : "",
    page: currentPage + 1, // backend expects 1-based page
    limit: 10,
  });

  const users = usersRes?.users || [];
  const userPagination = usersRes?.pagination || {};
  const superAdminUsers = superAdminData?.users || [];
  const superAdminPagination = superAdminData?.pagination || {};
  const pagination =
    userType === "superAdmin" ? superAdminPagination : userPagination;

  console.log("superAdminUsers", superAdminUsers);

  // Select data and loading state based on type
  const dataSource = userType === "superAdmin" ? superAdminUsers : users;
  const loading = userType === "superAdmin" ? superAdminLoading : usersLoading;

  // Fetch super admin users when type is superAdmin
  // useEffect(() => {
  //   if (userType === "superAdmin") {
  //     const fetchSuperAdminUsers = async () => {
  //       setSuperAdminLoading(true);
  //       try {
  //         const url = `${config.REACT_APP_API_URL}/users/super-admins`;
  //         // console.log("Fetching super admin users from:", url);
  //         const response = await axios.get(url, {
  //           headers: {
  //             "Content-Type": "application/json",
  //             // No Authorization or tenantId header for super admin API
  //           },
  //         });
  //         console.log("response.data", response?.data);
  //         // <-------------------------------v1.0.0
  //         // Reverse to show latest at top
  //         setSuperAdminUsers((response?.data || []).reverse());
  //         // ------------------------------v1.0.0 >
  //       } catch (error) {
  //         console.error("Error fetching super admin users:", error);
  //         toast.error("Failed to load super admin users");
  //         setSuperAdminUsers([]);
  //       } finally {
  //         setSuperAdminLoading(false);
  //       }
  //     };
  //     fetchSuperAdminUsers();
  //   }
  // }, [userType]);

  // Sync current page with API response
  // useEffect(() => {
  //   if (pagination.currentPage !== undefined) {
  //     // Convert 1-based backend to 0-based frontend
  //     setCurrentPage(pagination?.currentPage - 1);
  //   }
  // }, [pagination.currentPage]);

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

  // const handleClearAll = () => {
  //   const clearedFilters = { roles: [] };
  //   setSelectedRoles([]);
  //   setSelectedFilters(clearedFilters);
  //   setCurrentPage(0);
  //   setIsFilterActive(false);
  //   setFilterPopupOpen(false);
  // };
  const handleClearAll = () => {
    setSelectedRoles([]);
    setSelectedFilters({ roles: [] }); // Directly set the object
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = { roles: selectedRoles }; // Use 'roles' key to match initial state
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(selectedRoles.length > 0);
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (dataSource?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };
  // console.log("dataSource dataSource", dataSource);
  // Unique roles for filter options
  const uniqueRoles = [
    ...new Set(dataSource?.map((user) => user.label).filter(Boolean)),
  ];

  // v1.0.0 <-----------------------------------------------------------
  const normalizeSpaces = (str) =>
    str?.toString().replace(/\s+/g, " ").trim().toLowerCase() || "";
  // v1.0.0 ----------------------------------------------------------->

  // Filtered data
  // const FilteredData = () => {
  //   if (!Array.isArray(dataSource)) return [];
  //   return dataSource.filter((user) => {
  //     const fieldsToSearch = [
  //       user.firstName,
  //       user.lastName,
  //       user.email,
  //       user.phone,
  //       user.label,
  //     ].filter((field) => field !== null && field !== undefined);

  //     const matchesRole =
  //       selectedFilters.roles.length === 0 ||
  //       selectedFilters.roles.includes(user.label);
  //     // v1.0.0 <---------------------------------------------------------------------------------
  //     // const matchesSearchQuery = fieldsToSearch.some((field) =>
  //     //   field.toString().toLowerCase().includes(searchQuery.toLowerCase())
  //     // );

  //     const normalizedQuery = normalizeSpaces(searchQuery);
  //     // Full name in both orders
  //     const fullNameNormal = normalizeSpaces(
  //       `${user.firstName || ""} ${user.lastName || ""}`
  //     );
  //     const fullNameReverse = normalizeSpaces(
  //       `${user.lastName || ""} ${user.firstName || ""}`
  //     );

  //     const matchesSearchQuery =
  //       fieldsToSearch.some((field) =>
  //         normalizeSpaces(field).includes(normalizedQuery)
  //       ) ||
  //       fullNameNormal.includes(normalizedQuery) ||
  //       fullNameReverse.includes(normalizedQuery);
  //     // v1.0.0 --------------------------------------------------------------------------------->

  //     return matchesSearchQuery && matchesRole;
  //   });
  // };
  // console.log("usersRes dataSource", usersRes);

  // const rowsPerPage = 10;
  // const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

  // Navigation handlers - FIXED: Use pagination from API
  const handleNextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Navigation handlers - Use pagination from API
  // const handleNextPage = () => {
  //   if (pagination?.hasNext) {
  //     setCurrentPage((prev) => prev + 1);
  //   }
  // };

  // const handlePrevPage = () => {
  //   if (pagination?.hasPrev) {
  //     setCurrentPage((prev) => prev - 1);
  //   }
  // };

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, users.length);
  // const currentFilteredRows = FilteredData().slice(startIndex, endIndex);
  const currentFilteredRows = dataSource;

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

  const handleEdit = (user) => {
    navigate(`edit/${user._id}`, { state: { userData: user } });
  };

  // ------------------------ Dynamic Empty State Messages using Utility -------------------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  // Use the total count from the API response (or local if superAdmin)
  const initialDataCount =
    userType === "superAdmin"
      ? superAdminUsers?.length || 0
      : usersRes?.totalCount || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;

  let entityName = userType === "superAdmin" ? "super admins" : "users";

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    entityName
  );
  // ------------------------ Dynamic Empty State Messages using Utility ---------------------------

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
                  // v1.0.3 <-----------------------------------------------------------------------------------------------------
                  e.target.src =
                    row.gender === "Male"
                      ? // ? maleImage
                        "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099365/man_u11smn.png"
                      : row.gender === "Female"
                      ? // ? femaleImage
                        "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099369/woman_mffxrj.png"
                      : // : genderlessImage;
                        "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099367/transgender_le4gvu.png";
                  // v1.0.3 ----------------------------------------------------------------------------------------------------->
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
              {`${
                row.firstName
                  ? row.firstName.charAt(0).toUpperCase().trim() +
                    row.firstName.slice(1).trim()
                  : ""
              } ${
                row.lastName
                  ? row.lastName.charAt(0).toUpperCase().trim() +
                    row.lastName.slice(1)
                  : ""
              }`.trim() || "Unknown"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (value) => (
        <span className="cursor-default" title={value}>
          {value ? value : "Not Provided"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (value) => value || "Not Provided",
    },
    { key: "label", header: "Role", render: (value) => value || "Not Found" },
    {
      key: "status",
      header: "Status",

      render: (value) => {
        return value ? (
          <StatusBadge status={capitalizeFirstLetter(value)} />
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        );
      },
    },
    // {
    //   key: "status",
    //   header: "Status",
    //   render: (value) =>
    //     value.charAt(0).toUpperCase() + value.slice(1) || "Not Found",
    // },
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
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => handleView(row),
    },
  ];

  return (
    // v1.0.4 <------------------------------------------------------------------------
    <div className="sm:mt-6 md:mt-6">
      <div className="h-screen fixed w-full flex">
        <div className="" />
        <div className="flex-1 flex flex-col ml-0 h-full">
          <div className="fixed top-16 left-64 right-0 bg-background z-10 px-4">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <>
                <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-custom-blue"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-custom-blue">
                        User Management
                      </h3>
                      <div className="mt-2 text-sm text-custom-blue">
                        <p>
                          Manage all users who can conduct interviews,
                          including:
                        </p>
                        {/* v1.0.1 <--------------------------------------------------------------------------------------------------------- */}
                        <ul className="list-disc list-inside mt-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-1 gap-x-16">
                          {/* v1.0.1 ---------------------------------------------------------------------------------------------------------> */}
                          <li>Create and manage interviewer accounts</li>
                          <li>Set user roles and permissions</li>
                          <li>
                            Configure interview availability and expertise
                          </li>
                          <li>Track interviewer performance and ratings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Header
                title={userType === "superAdmin" ? "Super Admins" : "Users"}
                onAddClick={() => {
                  // if (dataSource.length >= currentPlan.maxUsers) {
                  //   toast(
                  //     "Please upgrade your plan or deactivate existing users to add more.",
                  //     {
                  //       icon: "⚠️",
                  //       style: {
                  //         background: "#fff3cd",
                  //         color: "#856404",
                  //         border: "1px solid #ffeeba",
                  //       },
                  //     }
                  //   );
                  // } else {
                  navigate("new");
                  // }
                }}
                addButtonText="Add User"
                canCreate={
                  userType === "superAdmin"
                    ? superAdminPermissions?.Users?.Create
                    : effectivePermissions?.Users?.Create
                }
              />
            </motion.div>
            <Toolbar
              view={view}
              setView={setView}
              searchQuery={searchQuery}
              onSearch={handleSearch}
              // Pass correct total pages
              // currentPage={usersRes?.pagination?.currentPage}
              // totalPages={usersRes?.pagination?.totalPages}
              // onPrevPage={prevPage}
              // onNextPage={nextPage}
              totalPages={pagination?.totalPages || 1}
              currentPage={currentPage} // Convert back to 1-based for display
              onPrevPage={handlePrevPage}
              onNextPage={handleNextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              dataLength={dataSource?.length}
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
                      loading={loading}
                      actions={tableActions}
                      // emptyState={
                      //   userType === "superAdmin"
                      //     ? "No super admins found."
                      //     : "No users found."
                      // }
                      emptyState={emptyStateMessage}
                    />
                  </div>
                ) : (
                  <div className="w-full px-4 pt-4 mb-5">
                    <KanbanView
                      currentFilteredRows={currentFilteredRows}
                      loading={loading}
                      setActionViewMore={() => {}}
                      userData={dataSource}
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
                  customHeight="h-[calc(100vh-24rem)]"
                >
                  <div className="space-y-3">
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
                                  className="h-4 w-4 rounded accent-custom-blue" //focus:ring-custom-blue text-custom-blue
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
                    {userType === "superAdmin"
                      ? "Super Admin Management Guide"
                      : "User Management Guide"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {userType === "superAdmin"
                      ? "Manage super admin accounts efficiently"
                      : "Manage your team's interviewers efficiently"}
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
                  <div className="flex-shrink-0 h-5 w-5 text-custom-blue mt-0.5">
                    <Info size={20} />
                  </div>
                  <p className="ml-3">
                    {userType === "superAdmin"
                      ? "Manage all super admin users, including:"
                      : "Manage all users who can conduct interviews, including:"}
                  </p>
                </div>
                <ul className="space-y-3 pl-8">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-custom-blue rounded-full"></span>
                    <span className="ml-2">
                      {userType === "superAdmin"
                        ? "Create and manage super admin accounts"
                        : "Create and manage interviewer accounts"}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-custom-blue rounded-full"></span>
                    <span className="ml-2">Set user roles and permissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-custom-blue rounded-full"></span>
                    <span className="ml-2">
                      Configure interview availability and expertise
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 h-1.5 w-1.5 mt-2.5 bg-custom-blue rounded-full"></span>
                    <span className="ml-2">
                      Track interviewer performance and ratings
                    </span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
                <button
                  onClick={() => setShowUserManagementPopup(false)}
                  className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <div>
        <ConfirmationModal
          show={showConfirmation}
          userName={`${
            selectedUser?.firstName
              ? selectedUser?.firstName.charAt(0).toUpperCase() +
                selectedUser?.firstName.slice(1)
              : ""
          } ${
            selectedUser?.lastName
              ? selectedUser?.lastName.charAt(0).toUpperCase() +
                selectedUser?.lastName.slice(1)
              : ""
          }`}
          newStatus={newStatus}
          onCancel={cancelStatusChange}
          onConfirm={confirmStatusChange}
        />
      </div>
    </div>
    // v1.0.4 ------------------------------------------------------------------------>
  );
};

export default UsersAccountTab;
