// v1.0.0 - Initial version
import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup";
import { useMediaQuery } from "react-responsive";
import TableView from "../../../Components/Shared/Table/TableView";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { Eye, Pencil } from "lucide-react";
import OrganizationDetails from "./OrganizationDetails";
import { usePermissions } from "../../../Context/PermissionsContext";
import { useOrganizationRequests } from "../../../apiHooks/superAdmin/useOrganizationRequests";
import KanbanView from "./Kanban/KanbanView";
import { motion } from "framer-motion";
import SidebarPopup from "../../../Components/SuperAdminComponents/SidebarPopup/SidebarPopup";

const OrganizationRequest = () => {
  const { superAdminPermissions } = usePermissions();
  const {
    organizationRequests = [],
    isLoading,
    updateOrganizationStatus,
    refetch,
  } = useOrganizationRequests();

  // Debug log to verify the function is available
  console.log(
    "updateOrganizationStatus function available:",
    typeof updateOrganizationStatus === "function"
  );

  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
  });

  const navigate = useNavigate();
  const filterIconRef = useRef(null);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState(null);
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  console.log("selectedOrganization", selectedOrganization);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Handle status filter change
  const handleStatusFilter = (status) => {
    setSelectedFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((s) => s !== status)
        : [...prev.status, status],
    }));
    setCurrentPage(0);
  };

  const handleStatusUpdate = async (updateData) => {
    try {
      // Ensure we have the latest organization data
      const orgId = selectedOrganization?._id;

      if (!orgId) {
        const error = new Error("No organization selected for status update");
        console.error(error.message);
        throw error;
      }

      console.log("Initiating status update for organization:", {
        orgId,
        updateData,
      });

      // Call the update function from the hook
      const response = await updateOrganizationStatus(orgId, {
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      console.log("Status update successful:", response);

      // Refresh the data
      await refetch();

      // Update the selected organization in the UI
      setSelectedOrganization((prev) => ({
        ...prev,
        ...updateData,
        updatedAt: new Date().toISOString(),
      }));

      return response;
    } catch (error) {
      console.error("Error in handleStatusUpdate:", {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        updateData,
        selectedOrganizationId,
        selectedOrganization,
      });

      // Show error to user
      alert(`Failed to update status: ${error.message}`);

      // Re-throw to allow the caller to handle the error if needed
      throw error;
    }
  };

  // Table columns configuration
  // const columns = [
  //     {
  //         Header: "Request ID",
  //         accessor: "_id",
  //         Cell: ({ value }) => value ? value.substring(0, 8) + '...' : 'N/A',
  //     },
  //     {
  //         Header: "Owner",
  //         accessor: "ownerId",
  //         Cell: ({ value }) => {
  //             if (!value) return "N/A";
  //             return (
  //                 <div className="flex flex-col">
  //                     <span className="font-medium">{value.firstName} {value.lastName}</span>
  //                     <span className="text-sm text-gray-500">{value.email}</span>
  //                 </div>
  //             );
  //         },
  //     },
  //     {
  //         Header: "Organization",
  //         accessor: "tenantId",
  //     },
  //     {
  //         Header: "Last Updated",
  //         accessor: "updatedAt",
  //         Cell: ({ value }) =>
  //             value ? new Date(value).toLocaleString() : "N/A",
  //     },
  //     {
  //         Header: "Actions",
  //         accessor: "actions",
  //         Cell: ({ row }) => (
  //             <div className="flex items-center space-x-2">
  //                 <button
  //                     onClick={() => handleViewDetails(row.original)}
  //                     className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
  //                     title="View Details"
  //                 >
  //                     <Eye size={18} />
  //                 </button>
  //                 {superAdminPermissions?.canEditOrganizationRequest && (
  //                     <button
  //                         onClick={() => handleEdit(row.original)}
  //                         className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
  //                         title="Edit"
  //                     >
  //                         <Pencil size={18} />
  //                     </button>
  //                 )}
  //             </div>
  //         ),
  //     },
  // ];

  // Filter options
  const filterOptions = [
    {
      label: "Status",
      options: ["Requested", "Approved", "Rejected", "Pending"],
      selected: selectedFilters.status,
      onSelect: handleStatusFilter,
    },
  ];

  // Handle view details
  const handleViewDetails = (organization) => {
    if (organization?._id) {
      console.log("Setting selected organization ID:", organization._id);
      setSelectedOrganizationId(organization._id);
      setSelectedOrganization(organization);
      setIsPopupOpen(true);
    } else {
      console.error(
        "Cannot view details: Organization ID is missing",
        organization
      );
    }
  };

  const renderOrganizationDetails = (organization) => {
    if (!organization) return null;
    return (
      <OrganizationDetails
        organization={selectedOrganization}
        onClose={() => setIsPopupOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    );
  };

  // Handle edit
  const handleEdit = (organization) => {
    // Navigate to edit page or open edit modal
    console.log("Edit organization:", organization);
  };

  // // Handle status filter change
  // const handleStatusFilter = (status) => {
  //     setSelectedFilters(prev => ({
  //         ...prev,
  //         status: prev.status.includes(status)
  //             ? prev.status.filter(s => s !== status)
  //             : [...prev.status, status]
  //     }));
  //     setCurrentPage(0);
  // };

  // Apply filters to data
  const filteredData = useMemo(() => {
    return (organizationRequests || [])
      .filter((org) => {
        const matchesSearch =
          searchQuery === "" ||
          org.contact?.firstName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          org.contact?.lastName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          org.contact?.email
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          org.tenant?.company
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase());

        const matchesStatus =
          selectedFilters.status.length === 0 ||
          selectedFilters.status.includes(org.status?.toLowerCase());

        return matchesSearch && matchesStatus;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt) -
          new Date(a.updatedAt || a.createdAt)
      );
  }, [organizationRequests, searchQuery, selectedFilters.status]);

  // Toolbar actions
  // const toolbarActions = [
  //     {
  //         label: "Table",
  //         active: view === "table",
  //         onClick: () => setView("table"),
  //     },
  //     {
  //         label: "Kanban",
  //         active: view === "kanban",
  //         onClick: () => setView("kanban"),
  //     },
  // ];

  useEffect(() => {
    if (selectedOrganizationId && organizationRequests?.length) {
      const foundUser = organizationRequests?.find(
        (user) => user._id === selectedOrganizationId
      );
      // v1.0.0 -------------------------------------------------------------------------
      setSelectedOrganization(foundUser || null);
    }
  }, [selectedOrganizationId, organizationRequests]);

  const rowsPerPage = 10;
  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(
    startIndex + rowsPerPage,
    filteredData?.length || 0
  );
  const currentFilteredRows = filteredData.slice(startIndex, endIndex);

  // const [selectedInterviewerId, setSelectedInterviewerId] = useState(null);
  // const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  // const [isPopupOpen, setIsPopupOpen] = useState(false);

  // const handleOpenPopup = (interviewer) => {
  //     // Close it first if already open
  //     if (isPopupOpen) {
  //         setIsPopupOpen(false);
  //         // setSelectedInterviewer(null);

  //         // Wait a tick before reopening
  //         setTimeout(() => {
  //             // setSelectedInterviewer(interviewer);
  //             setIsPopupOpen(true);
  //         }, 50);
  //     } else {
  //         // setSelectedInterviewer(interviewer);
  //         setIsPopupOpen(true);
  //     }
  // };

  const formatStatus = (status = "") => {
    return status
      .toString()
      .trim()
      .replace(/[_\s-]+/g, " ") // replace underscores, hyphens, or multiple spaces with single space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const tableColumns = [
    {
      key: "requestCode",
      header: "Request Code",
      render: (value, row) =>
        row?.organizationRequestCode ? (
          <span className="font-medium text-custom-blue">
            {row.organizationRequestCode}
          </span>
        ) : (
          <span className="text-gray-400">
            {row?._id ? row._id.substring(0, 8) + "..." : "N/A"}
          </span>
        ),
      width: 120,
    },
    {
      key: "name",
      header: "Name",
      render: (value, row) => {
        const contact = row.contact || {};
        const fullName =
          [contact.firstName, contact.lastName].filter(Boolean).join(" ") ||
          "N/A";
        return <span className="font-medium">{fullName}</span>;
      },
      width: 200,
    },
    {
      key: "email",
      header: "Email",
      render: (value, row) => {
        const contact = row.contact || {};
        return contact.email || "N/A";
      },
      width: 200,
    },
    {
      key: "phone",
      header: "Phone",
      render: (value, row) => {
        const contact = row.contact || {};
        return (
          <span>
            {contact.countryCode ? `${contact.countryCode} ` : ""}
            {contact.phone || "N/A"}
          </span>
        );
      },
      width: 150,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={formatStatus(row.status)} />,
      width: 120,
    },
    {
      key: "createdAt",
      header: "Requested On",
      render: (value, row) =>
        row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A",
      width: 120,
    },
    // {
    //     key: "actions",
    //     header: "Actions",
    //     render: (value, row) => (
    //         <div className="flex items-center space-x-2">
    //             {/* <button
    //                 onClick={() => handleViewDetails(row)}
    //                 className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
    //                 title="View Details"
    //             >
    //                 <Eye size={18} />
    //             </button> */}
    //             {superAdminPermissions?.canEditOrganizationRequest && (
    //                 <button
    //                     onClick={() => handleEdit(row)}
    //                     className="p-1 text-gray-500 hover:text-blue-500 transition-colors"
    //                     title="Edit"
    //                 >
    //                     <Pencil size={18} />
    //                 </button>
    //             )}
    //         </div>
    //     )
    // }
  ];

  const tableActions = [
    ...(superAdminPermissions?.OutsourceInterviewerRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              // setSelectedInterviewerId(row._id);
              setIsPopupOpen(true);
              setSelectedOrganization(row);
            },
          },
        ]
      : []),
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },

    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
  ];

  useEffect(() => {
    console.log("Organization requests:", organizationRequests);
    console.log("Filtered data:", filteredData);
  }, [organizationRequests, filteredData]);

  return (
    <>
      <div className="fixed top-12 sm:top-12 md:top-12 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="sm:text-xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold text-custom-blue">
              Organization Request
            </span>
          </div>
        </div>
      </div>

      <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0 px-4">
        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={(e) => setSearchQuery(e.target.value)}
          currentPage={currentPage}
          totalPages={Math.ceil(filteredData.length / 10)}
          onPrevPage={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
          onNextPage={() =>
            (currentPage + 1) * 10 < filteredData.length &&
            setCurrentPage(currentPage + 1)
          }
          onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
          isFilterActive={isFilterActive}
          isFilterPopupOpen={isFilterPopupOpen}
          dataLength={filteredData.length}
          searchPlaceholder="Search organizations..."
          filterIconRef={filterIconRef}
        />
      </div>

      <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {view === "table" ? (
              <div className="w-full mb-8 bg-red">
                <TableView
                  data={currentFilteredRows || []}
                  columns={tableColumns}
                  loading={isLoading}
                  actions={tableActions}
                  emptyState="No organization requests found."
                />
              </div>
            ) : (
              <div className="w-full">
                <KanbanView
                  data={filteredData || []} // This is the full filtered dataset
                  onViewDetails={handleViewDetails}
                />
              </div>
            )}

            {isFilterPopupOpen && (
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                filterOptions={filterOptions}
                onClearAll={() => {
                  setSelectedFilters({
                    status: [],
                    currentStatus: "",
                  });
                  setIsFilterActive(false);
                }}
                onApply={() => {
                  setIsFilterActive(selectedFilters.status.length > 0);
                  setFilterPopupOpen(false);
                }}
                anchorEl={filterIconRef.current}
              />
            )}
          </motion.div>
        </div>
      </div>

      {isPopupOpen && selectedOrganization && (
        <SidebarPopup
          title="Organization Request Details"
          onClose={() => setIsPopupOpen(false)}
          isExpanded={true}
        >
          {renderOrganizationDetails(selectedOrganization)}
        </SidebarPopup>
      )}

      <Outlet />
    </>
  );
};

export default OrganizationRequest;
