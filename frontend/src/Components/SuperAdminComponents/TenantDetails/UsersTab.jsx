import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge";
import {
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineMail,
  AiOutlineKey,
  AiOutlineClose,
  AiOutlineWarning,
} from "react-icons/ai";
import { FaLinkedin } from "react-icons/fa";
import Header from "../../Shared/Header/Header.jsx";
import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import Loading from "../../SuperAdminComponents/Loading/Loading.jsx";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import {
  Eye,
  Mail,
  UserCircle,
  Pencil,
  Phone,
  GraduationCap,
  School,
  Briefcase,
  User,
  Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import TableView from "../../Shared/Table/TableView.jsx";
// import KanbanView from "../../Shared/Kanban/KanbanView.jsx";
import SidebarPopup from "../SidebarPopup/SidebarPopup.jsx";
import { LiaGenderlessSolid } from "react-icons/lia";
import { FaCircle } from "react-icons/fa";
import { config } from "../../../config.js";
import {
  setAuthCookies,
  getImpersonationToken,
  getAuthToken,
  loginAsUser,
} from "../../../utils/AuthCookieManager/AuthCookieManager.jsx";
import { toast } from "react-toastify";
import { usePermissions } from "../../../Context/PermissionsContext";
import KanbanView from "./Users/Kanban.jsx";

function UsersTab({ users, viewMode }) {
  const { refreshPermissions } = usePermissions();

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    tech: [],
    experience: { min: "", max: "" },
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Get user by ID
  useEffect(() => {
    if (selectedUserId && users?.length) {
      const foundUser = users.find((user) => user._id === selectedUserId);
      setSelectedUser(foundUser || null);
    }
  }, [selectedUserId, users]);

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set view based on device
  // useEffect(() => {
  //   if (isTablet) {
  //     setView("kanban");
  //   } else {
  //     setView("table");
  //   }
  // }, [isTablet]);

  useEffect(() => {
    if (viewMode === "collapsed") {
      setView("kanban");
    } else if (viewMode === "expanded") {
      setView("table");
    } else if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [viewMode, isTablet]);

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
  };

  const dataToUse = users;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((organization) => {
      const fieldsToSearch = [
        organization.lastName,
        organization.email,
        organization.phone,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(organization.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        organization.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus && matchesTech;
    });
  };

  const rowsPerPage = 10;
  const totalPages = Math.ceil(FilteredData()?.length / rowsPerPage);
  const nextPage = () => {
    if ((currentPage + 1) * rowsPerPage < FilteredData()?.length) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, FilteredData()?.length);
  const currentFilteredRows = FilteredData().slice(startIndex, endIndex);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  // Common function for Login as User API call
  const handleLoginAsUser = async (userId) => {
    console.log("🚀 Starting login as user process for userId:", userId);
    
    try {
      const impersonationToken = getImpersonationToken();
      console.log("🔑 Impersonation token check:", !!impersonationToken);
      
      if (!impersonationToken) {
        console.error("❌ No impersonation token found");
        toast.error("Super admin session expired. Please log in again.");
        navigate("/organization-login");
        return;
      }

      console.log("📡 Making API request to login-as-user endpoint");
      console.log("🌐 API URL:", `${config.REACT_APP_API_URL}/Organization/login-as-user`);
      console.log("🔑 Using impersonation token:", impersonationToken ? "EXISTS" : "MISSING");
      console.log("📦 Request body:", { userId });
      
      const response = await fetch(
        `${config.REACT_APP_API_URL}/Organization/login-as-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${impersonationToken}`,
          },
          body: JSON.stringify({ userId }),
          credentials: "include",
        }
      );
      console.log("📥 Login as user response status:", response.status);
      console.log("📥 Login as user response:", response);
      console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

      const data = await response.json();
      console.log("📋 Response data:", data);
      console.log("📋 Response data keys:", Object.keys(data));
      
      if (data.success) {
        console.log("✅ Login successful, authToken received:", !!data.authToken);
        console.log("🔑 AuthToken details:", {
          hasToken: !!data.authToken,
          tokenLength: data.authToken ? data.authToken.length : 0,
          userId: data.userId,
          tenantId: data.tenantId,
          isOrganization: data.isOrganization
        });
        
        console.log("🍪 Setting auth cookies with data:", {
          authToken: !!data.authToken,
          authTokenLength: data.authToken ? data.authToken.length : 0,
          userId: data.userId,
          tenantId: data.tenantId,
          organization: data.isOrganization,
        });
        
        console.log("🔧 Calling loginAsUser function...");
        loginAsUser(data.authToken, {
          userId: data.userId,
          tenantId: data.tenantId,
          organization: data.isOrganization,
        });
        console.log("✅ loginAsUser function completed");
        
        // Verify cookies were set
        console.log("🔍 Verifying cookies after setting:");
        const verifyAuthToken = getAuthToken();
        const verifyImpersonationToken = getImpersonationToken();
        console.log("🔍 Auth token after setting:", verifyAuthToken ? "EXISTS" : "MISSING");
        console.log("🔍 Impersonation token after setting:", verifyImpersonationToken ? "EXISTS" : "MISSING");
        
        console.log("🔄 Refreshing permissions");
        await refreshPermissions();
        console.log("🏠 Navigating to home page");
        navigate("/home");
      } else {
        console.error("❌ Login failed:", data.message);
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("💥 Error during login as user:", error);
      toast.error("An error occurred during login");
    }
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (!users) {
  //   return <div>No Users found.</div>;
  // }

  // const formatDate = (dateString) => {
  //   const options = { year: "numeric", month: "short", day: "numeric" };
  //   return new Date(dateString).toLocaleDateString("en-US", options);
  // };

  // const handleLogin = (user) => {
  //   setSelectedUser(user);
  //   setShowLoginModal(true);
  // };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setSelectedUser(null);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedUserId(row._id);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    {
      key: "login-as-user",
      label: "Login as User",
      icon: <AiOutlineUser className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        console.log("🖱️ Login as User button clicked for user:", {
          userId: row._id,
          userName: row.firstName,
          userEmail: row.email
        });
        handleLoginAsUser(row._id);
      },
    },
  ];

  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-custom-blue flex items-center justify-center text-white font-semibold">
            {row?.contact?.imageData?.path ? (
              <img
                src={row?.contact?.imageData?.path}
                alt="user"
                className="rounded-full"
              />
            ) : (
              row?.firstName?.charAt(0).toUpperCase() || "?"
            )}
          </div>
          <div className="ml-4">
            <div
              className="font-medium text-custom-blue cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUserId(row._id);
                setIsPopupOpen(true);
              }}
            >
              {capitalizeFirstLetter(row.firstName) || "N/A"}
            </div>
            <div className="text-gray-500">{row.email || "N/A"}</div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (value, row) => (
        <div className="text-gray-500">
          <div
            className="font-medium text-custom-blue cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUserId(row._id);
              setIsPopupOpen(true);
            }}
          >
            {capitalizeFirstLetter(row?.firstName)}{" "}
            {capitalizeFirstLetter(row?.lastName)}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <span>{row?.roleName ? row.roleName : "N/A"}</span>
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (value, row) =>
        new Date(row.updatedAt).toLocaleDateString() || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status} /> || "N/A",
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "firstName",
      header: "Name",
      render: (value) => capitalizeFirstLetter(value),
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
  ];

  // Render Actions for Kanban
  const renderKanbanActions = (item) => (
    <div className="flex items-center gap-1">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );

  // Render Popup content
  const renderPopupContent = (user) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="relative">
                  {user?.contact?.imageData ? (
                    <img
                      src={user?.contact?.imageData?.path}
                      alt={user?.FirstName || user?.firstName}
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                      {user?.firstName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {capitalizeFirstLetter(user?.firstName) || "N/A"}
                  </h3>
                  <p className="text-gray-600 mt-1">{user.roleName || "N/A"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Personal Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <User className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="text-gray-700">
                              {capitalizeFirstLetter(user?.firstName)}{" "}
                              {capitalizeFirstLetter(user?.lastName) || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Calendar className="w-5 h-5 text-gray-500" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Date of Birth
                            </p>
                            <p className="text-gray-700">
                              {user?.contact?.dateOfBirth || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <LiaGenderlessSolid className="w-5 h-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Gender</p>
                              <p className="text-gray-700">
                                {user?.contact?.gender || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-custom-bg rounded-lg">
                              <FaCircle className="w-5 h-5 text-gray-300" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Status</p>
                              <p className="text-gray-700">
                                {<StatusBadge status={user?.status} /> || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Contact Information
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Mail className="w-5 h-5 text-gray-500" />
                          </div>
                          {user?.email ? (
                            <a
                              href={`mailto:${user.email}`}
                              className="text-blue-600 truncate hover:underline"
                            >
                              {user.email}
                            </a>
                          ) : (
                            <span className="text-gray-700 truncate">N/A</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500" />
                          </div>
                          {user?.contact?.phone ? (
                            <a
                              href={`tel:${user.contact.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {user.contact.phone}
                            </a>
                          ) : (
                            <span className="text-gray-700">N/A</span>
                          )}
                        </div>

                        {/* <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Phone className="w-5 h-5 text-gray-500" />
                          </div>
                          <span className="text-gray-700 truncate">
                            {user?.contact?.linkedinUrl || "N/A"}
                          </span>
                        </div> */}

                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <FaLinkedin className="w-5 h-5 text-gray-500" />
                          </div>
                          {user?.contact?.linkedinUrl ? (
                            <a
                              href={user.contact.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 truncate hover:underline"
                            >
                              {user.contact.linkedinUrl}
                            </a>
                          ) : (
                            <span className="text-gray-700 truncate">N/A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Professional Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Current Role
                            </p>
                            <p className="text-gray-700">
                              {user?.contact?.currentRole || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <School className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Industry</p>
                            <p className="text-gray-700">
                              {user?.contact?.industry || "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Years of experience
                            </p>
                            <p className="text-gray-700">
                              {user?.contact?.experienceYears || "N/A"}
                            </p>
                          </div>
                        </div>
                        {/* <div className="flex items-center gap-3">
                          <div className="p-2 bg-custom-bg rounded-lg">
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">
                              Relevant Experience
                            </p>
                            <p className="text-gray-700">
                              {user?.RelevantExperience || "N/A"}
                            </p>
                          </div>
                        </div> */}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {user?.contact?.skills ? (
                      user?.contact?.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-custom-bg text-custom-blue rounded-full text-sm font-medium border border-blue-100"
                        >
                          {skill.skill}
                        </span>
                      ))
                    ) : (
                      <span>No skills found</span>
                    )}
                  </div>
                </div>

                {user.interviews && user.interviews.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Latest Interview
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">
                          {user.interviews[0].company}
                        </span>
                        <span className="text-gray-500">
                          {user.interviews[0].position}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Latest round: {user.interviews[0].rounds[0].round}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 min-h-screen">
      <div className="absolute md:mt-0 sm:mt-0 top-0 left-0 right-0 bg-background">
        <div className="flex justify-between items-center mb-4">
          <div className="md:mt-4 sm:mt-4 w-full">
            <main className="px-4">
              <div className="sm:px-0">
                <Header
                  title="Users"
                  onAddClick={() => navigate("/tenants/add")}
                  addButtonText="Add User"
                />
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
                  dataLength={dataToUse?.length}
                  searchPlaceholder="Search Tenants..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        </div>

        <main>
          <div className="sm:px-0">
            {!users ? (
              <Loading />
            ) : (
              <motion.div className="bg-white">
                <div className="relative w-full">
                  {view === "table" ? (
                    <div className="w-full">
                      <TableView
                        data={currentFilteredRows}
                        columns={tableColumns}
                        loading={isLoading}
                        actions={actions}
                        emptyState="No users found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((user) => ({
                          ...user,
                          id: user._id,
                          title: user.firstName || "N/A",
                          subtitle: user.roleName || "N/A",
                          avatar: user.imageData?.path || null,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No Users found."
                        viewMode={viewMode}
                      />
                    </div>
                  )}

                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleFilterChange}
                    initialFilters={selectedFilters}
                    filterIconRef={filterIconRef}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {showLoginModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Login as {selectedUser.name}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <AiOutlineClose size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <AiOutlineUser />
                  <span>User Details</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Name:</div>
                    <div className="font-medium">{selectedUser.name}</div>
                    <div className="text-gray-500">Email:</div>
                    <div className="font-medium">{selectedUser.email}</div>
                    <div className="text-gray-500">Role:</div>
                    <div className="font-medium">{selectedUser.role}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  <AiOutlineLock />
                  <span>Login Options</span>
                </div>
                <div className="space-y-3">
                  <button
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                    onClick={() => {
                      console.log("🖱️ Modal Login as User button clicked for user:", {
                        userId: selectedUser._id,
                        userName: selectedUser.name,
                        userEmail: selectedUser.email
                      });
                      handleLoginAsUser(selectedUser._id);
                    }}
                  >
                    <AiOutlineUser />
                    <span>Login as User</span>
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <AiOutlineMail />
                    <span>Send Login Link</span>
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                    <AiOutlineKey />
                    <span>Generate Temporary Password</span>
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                <div className="flex items-start space-x-2">
                  <AiOutlineWarning className="flex-shrink-0 mt-0.5" />
                  <p>
                    Logging in as another user will be logged in the audit
                    trail. Use this feature responsibly.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={handleCloseModal} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div>
        {isPopupOpen && selectedUser && (
          <SidebarPopup
            title="User"
            subTitle={selectedUserId}
            onClose={() => setIsPopupOpen(false)}
          >
            {renderPopupContent(selectedUser)}
          </SidebarPopup>
        )}
      </div>
    </div>
  );
}

export default UsersTab;
