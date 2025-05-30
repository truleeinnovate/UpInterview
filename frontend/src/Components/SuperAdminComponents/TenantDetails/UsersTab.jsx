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

import Header from "../../Shared/Header/Header.jsx";
import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import Loading from "../../SuperAdminComponents/Loading/Loading.jsx";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";
import { motion } from "framer-motion";
import TableView from "../../Shared/Table/TableView.jsx";
import KanbanView from "../../Shared/Kanban/KanbanView.jsx";

function UsersTab({ users }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [view, setView] = useState("table");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
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
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

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
    setCurrentPage(0); // Reset to first page on search
  };

  if (isLoading) {
    return <Loading />;
  }

  if (!users) {
    return <div>No tenants found.</div>;
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const handleLogin = (user) => {
    setSelectedUser(user);
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
    setSelectedUser(null);
  };

  // const columns = [
  //   {
  //     field: "name",
  //     header: "Name",
  //     render: (row) => (
  //       <div>
  //         <div className="font-medium text-gray-900">
  //           {row?.firstName || row?.FirstName}
  //         </div>
  //         <div className="text-gray-500">{row?.email || row?.Email}</div>
  //       </div>
  //     ),
  //   },
  //   { field: "role", header: "Role" },
  //   {
  //     field: "lastLogin",
  //     header: "Last Login",
  //     render: (row) => new Date(row.lastLogin).toLocaleDateString(),
  //   },
  //   {
  //     field: "status",
  //     header: "Status",
  //     render: (row) => <StatusBadge status={row.status} />,
  //   },
  //   {
  //     field: "actions",
  //     header: "Actions",
  //     sortable: false,
  //     render: (row) => (
  //       <div className="flex space-x-2">
  //         <button
  //           className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
  //           onClick={() => handleLogin(row)}
  //           title="Login as user"
  //         >
  //           <AiOutlineUser size={18} />
  //         </button>
  //         <button
  //           className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50"
  //           title="Edit user"
  //         >
  //           <AiOutlineEdit size={18} />
  //         </button>
  //         <button
  //           className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50"
  //           title="Reset password"
  //         >
  //           <AiOutlineKey size={18} />
  //         </button>
  //         <button
  //           className={`p-2 rounded-full ${
  //             row.status === "Active"
  //               ? "text-red-600 hover:text-red-900 hover:bg-red-50"
  //               : "text-green-600 hover:text-green-900 hover:bg-green-50"
  //           }`}
  //           title={row.status === "Active" ? "Lock account" : "Unlock account"}
  //         >
  //           {row.status === "Active" ? (
  //             <AiOutlineLock size={18} />
  //           ) : (
  //             <AiOutlineUnlock size={18} />
  //           )}
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row?.firstName || row?.FirstName}
          </div>
          <div className="text-gray-500">{row?.email || row?.Email}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4" />
          <span>{row.status || "N/A"}</span>
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Last Login",
      render: (value, row) =>
        new Date(row.lastLogin).toLocaleDateString() || "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status} /> || "N/A",
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    {
      key: "resend-link",
      label: "Resend Link",
      icon: <Mail className="w-4 h-4 text-blue-600" />,
      disabled: (row) => row.status === "completed",
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          navigate(`view-details/${item._id}`);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View Details"
      >
        <Eye className="w-4 h-4" />
      </button>
      {!isLoading ? (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              item?._id && navigate(`/candidate/${item._id}`);
            }}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="360° View"
          >
            <UserCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`edit/${item._id}`);
            }}
            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </>
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onResendLink(item.id);
          }}
          disabled={item.status === "completed"}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Resend Link"
        >
          <Mail className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="absolute md:mt-0 sm:mt-0 top-0 left-0 right-0 bg-background">
        <div className="flex justify-between items-center mb-4">
          {/* Header and Tool bar */}
          <div className="md:mt-4 sm:mt-4 w-full">
            <main className="px-4">
              <div className="sm:px-0">
                <Header
                  title="Tenants"
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

        {/* New table */}
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
                        actions={tableActions}
                        emptyState="No candidates found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((candidate) => ({
                          ...candidate,
                          id: candidate._id,
                          title: `${candidate.FirstName || ""} ${
                            candidate.LastName || ""
                          }`,
                          subtitle:
                            candidate.CurrentRole ||
                            candidate.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: "active",
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No Tenants found."
                      />
                    </div>
                  )}

                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleFilterChange}
                    initialFilters={selectedFilters}
                    filterIconRef={filterIconRef} // Pass ref to FilterPopup
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
                  <button className="w-full btn-primary flex items-center justify-center space-x-2">
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
    </div>
  );
}

export default UsersTab;
