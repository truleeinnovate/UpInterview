/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";

import { motion } from "framer-motion";

import Header from "../../../Shared/Header/Header.jsx";
import Toolbar from "../../../Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import TableView from "../../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "./KanbanView.jsx";
import { Eye, ChevronUp, ChevronDown } from "lucide-react";
import { useContacts } from "../../../../apiHooks/superAdmin/useContacts.js";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import StatusBadge from "../../common/StatusBadge.jsx";

const Contact = ({ organizationId, viewMode }) => {
  const { contacts, isLoading } = useContacts(organizationId);
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");
  const [selectedContactId, setSelectedContactId] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setCurrentStatus(selectedFilters.currentStatus);
      setIsCurrentStatusOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      currentStatus: "",
    };
    setSelectedStatus([]);
    setCurrentStatus("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      currentStatus: selectedCurrentStatus,
    };
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 || filters.currentStatus.length > 0
    );
    setFilterPopupOpen(false);
  };

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

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

  // Function to fetch contacts

  // useEffect(() => {
  //   const fetchContacts = async () => {
  //     setIsLoading(true);
  //     try {
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/contacts/organization/${organizationId}`
  //       );
  //       setContacts(response.data);
  //     } catch (error) {
  //       console.error("Error fetching contacts data:", error);
  //     }
  //     setIsLoading(false);
  //   };
  //   fetchContacts();
  // }, [organizationId]);

  // get user by ID
  useEffect(() => {
    if (selectedContactId && Array.isArray(contacts) && contacts.length > 0) {
      const matchedContact = contacts.find(
        (contact) => contact._id === selectedContactId
      );

      if (matchedContact) {
        navigate("/contact-profile-details", {
          state: { contactData: matchedContact },
        });
      }
    }
  }, [selectedContactId, contacts, navigate]);

  const dataToUse = contacts;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];

    return dataToUse.filter((contact) => {
      const fieldsToSearch = [contact.name, contact.firstName].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        !selectedFilters?.status?.length ||
        selectedFilters.status.includes(contact.status);

      const matchesSearchQuery = !searchQuery
        ? true
        : fieldsToSearch.some((field) =>
            String(field).toLowerCase().includes(searchQuery.toLowerCase())
          );

      return matchesSearchQuery && matchesStatus;
    });
  };

  // Pagination
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

  // Table Columns
  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-custom-blue flex items-center justify-center text-white font-semibold">
            {row?.imageData?.path ? (
              <img
                src={row?.imageData?.path}
                alt="contact"
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
                setSelectedContactId(row._id);
              }}
            >
              {row.firstName || "N/A"}
            </div>
            <div className="text-gray-500">{row.lastName || "N/A"}</div>
          </div>
        </div>
      ),
    },

    {
      key: "currentRole",
      header: "Current Role",
      render: (value, row) => (
        <span>{row?.currentRole ? row.currentRole : "N/A"}</span>
      ),
    },
    {
      key: "industry",
      header: "Industry",
      render: (value, row) => (
        <span>{row?.industry ? row.industry : "N/A"}</span>
      ),
    },
    {
      key: "experienceYear",
      header: "Experience",
      render: (value, row) => (
        <span>
          {row?.yearsOfExperience ? row.yearsOfExperience + " Years" : "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (value, row) => (
        <span>{row?.phone ? row?.countryCode + " " + row.phone : "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span>
          {row?.status ? (
            <StatusBadge status={capitalizeFirstLetter(row?.status)} />
          ) : (
            "N/A"
          )}
        </span>
      ),
    },
    // {
    //   key: "linkedinUrl",
    //   header: "Linkedin URL",
    //   render: (value, row) => (
    //     <span>{row?.linkedinUrl ? row.linkedinUrl : "N/A"}</span>
    //   ),
    // },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => {
        setSelectedContactId(row._id);
      },
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => {
        setSelectedContactId(row._id);
      },
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
      key: "currentRole",
      header: "Current Role",
      render: (value, row) => {
        return row?.currentRole ? row.currentRole : "N/A";
      },
    },
    {
      key: "industry",
      header: "Industry",
      render: (value, row) => (
        <span>{row?.industry ? row.industry : "N/A"}</span>
      ),
    },
    {
      key: "experienceYear",
      header: "Years Of Experience",
      render: (value, row) => (
        <span>
          {row?.yearsOfExperience ? row.yearsOfExperience + " Years" : "N/A"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (value, row) => (
        <span>{row?.phone ? row?.countryCode + " " + row.phone : "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span>
          {row?.status ? (
            <StatusBadge status={capitalizeFirstLetter(row.status)} />
          ) : (
            "N/A"
          )}
        </span>
      ), // <span>{row?.status ? row.status : "N/A"}</span>,
    },
  ];

  // Render Actions for Kanban
  // const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
  //   <div className="flex items-center gap-1">
  //     <button
  //       onClick={(e) => {
  //         e.stopPropagation();
  //         setSelectedContactId(item._id);
  //       }}
  //       className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  //       title="View Details"
  //     >
  //       <Eye className="w-4 h-4" />
  //     </button>
  //     {!isLoading ? (
  //       <>
  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             item?._id && navigate(`/tenants/${item._id}`);
  //           }}
  //           className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
  //           title="360° View"
  //         >
  //           <UserCircle className="w-4 h-4" />
  //         </button>
  //         <button
  //           onClick={(e) => {
  //             e.stopPropagation();
  //             navigate(`edit/${item._id}`);
  //           }}
  //           className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
  //           title="Edit"
  //         >
  //           <Pencil className="w-4 h-4" />
  //         </button>
  //       </>
  //     ) : (
  //       <button
  //         onClick={(e) => {
  //           e.stopPropagation();
  //           onResendLink(item.id);
  //         }}
  //         disabled={item.status === "completed"}
  //         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
  //         title="Resend Link"
  //       >
  //         <Mail className="w-4 h-4" />
  //       </button>
  //     )}
  //   </div>
  // );

  const renderKanbanActions = (item) => (
    <div className="flex items-center gap-1">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className="p-1.5 text-custom-blue hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );

  // Render Filter Content
  const renderFilterContent = () => {
    // filter options
    const statusOptions = ["active", "inactive", "pending", "inProgress"];

    return (
      <div className="space-y-3">
        {/* Current Status Section */}
        <div>
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsCurrentStatusOpen(!isCurrentStatusOpen)}
          >
            <span className="font-medium text-gray-700">Current Status</span>
            {isCurrentStatusOpen ? (
              <ChevronUp className="text-xl text-gray-700" />
            ) : (
              <ChevronDown className="text-xl text-gray-700" />
            )}
          </div>
          {isCurrentStatusOpen && (
            <div className="mt-1 space-y-2 pl-2">
              <div className="flex items-center space-x-3">
                <div className="flex-1">
                  <div className="mt-2 border border-gray-200 rounded-md p-2 space-y-2">
                    {statusOptions.map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2 cursor-pointer text-sm capitalize"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => handleCurrentStatusToggle(status)}
                          className="accent-custom-blue"
                        />
                        <span>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="w-full">
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="px-4 mb-4 sm:px-0">
            {/* Header */}
            <Header
              title="Contacts"
              onAddClick={() => navigate("/contacts/new")}
              addButtonText="Add Contact"
            />

            {/* Toolbar */}
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
              searchPlaceholder="Search Contacts..."
              filterIconRef={filterIconRef} // Pass ref to Toolbar
            />
          </div>
        </motion.div>

        <motion.div
          className=""
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="sm:px-0">
            <motion.div className="bg-white">
              {view === "table" ? (
                <div className="w-full mb-8 bg-red">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState="No Tenants found."
                  />
                </div>
              ) : (
                <div className="w-full">
                  <KanbanView
                    data={currentFilteredRows.map((contact) => ({
                      ...contact,
                      id: contact._id,
                      title: contact.firstName || "N/A",
                      subtitle: contact.currentRole || "N/A",
                      avatar: contact.imageData ? contact.imageData.path : null,
                      status: contact.status || "N/A",
                      name: contact.firstName,
                    }))}
                    contacts={contacts}
                    renderActions={renderKanbanActions}
                    onTitleClick={(item) => {
                      setSelectedContactId(item?._id);
                    }}
                    columns={kanbanColumns}
                    emptyState="No Contacts found."
                    viewMode={viewMode}
                  />
                </div>
              )}

              {/* FilterPopup */}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                {renderFilterContent()}
              </FilterPopup>
            </motion.div>
          </div>
        </motion.div>

        {/* {sidebarOpen && (
        <>
          <div className="w-full">
            <Sidebar
              sharingPermissions={sharingPermissions}
              onContactAdded={handleContactAdded}
              onContactUpdated={handleContactUpdated}
            />
          </div>
        </>
      )} */}
      </div>
      <Outlet />
    </>
  );
};

export default Contact;
