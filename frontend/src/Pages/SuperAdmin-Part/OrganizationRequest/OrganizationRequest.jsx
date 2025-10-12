// v1.0.0 - Initial version
import { useState, useRef, useEffect } from "react";
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
    const { organizationRequests, isLoading } = useOrganizationRequests();
    console.log("organizationRequests", organizationRequests)
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
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    // Handle status filter change
    const handleStatusFilter = (status) => {
        setSelectedFilters(prev => ({
            ...prev,
            status: prev.status.includes(status)
                ? prev.status.filter(s => s !== status)
                : [...prev.status, status]
        }));
        setCurrentPage(0);
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
    //         Cell: ({ value }) => {
    //             if (!value) return "N/A";
    //             return (
    //                 <div className="flex flex-col">
    //                     <span className="font-medium">{value.companyName}</span>
    //                     <span className="text-sm text-gray-500">{value.domain}</span>
    //                 </div>
    //             );
    //         },
    //     },
    //     {
    //         Header: "Status",
    //         accessor: "status",
    //         Cell: ({ value }) => (
    //             <StatusBadge status={value?.toLowerCase()}>
    //                 {value || "N/A"}
    //             </StatusBadge>
    //         ),
    //     },
    //     {
    //         Header: "Requested On",
    //         accessor: "createdAt",
    //         Cell: ({ value }) =>
    //             value ? new Date(value).toLocaleDateString() : "N/A",
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
        setSelectedOrganization(organization);
        setSelectedOrganizationId(organization._id);
        setIsPopupOpen(true);
    };

    const renderOrganizationDetails = (organization) => {
        if (!organization) return null;

        const contact = organization.contactId || {};
        const tenant = organization.tenantId || {};
        const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A';

        return (
            <div className="space-y-4 p-4">
                <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-medium">
                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">{tenant.company || 'No Company'}</h3>
                        <p className="text-sm text-gray-500">{fullName}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Contact Information</h4>
                        <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-900">{contact.email || 'No email'}</p>
                            {contact.phone && (
                                <p className="text-sm text-gray-900">
                                    {contact.countryCode ? `${contact.countryCode} ` : ''}
                                    {contact.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Company Details</h4>
                        <div className="mt-1 space-y-1">
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">Domain: </span>
                                {tenant.domain || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">Website: </span>
                                {tenant.website || 'N/A'}
                            </p>
                            <p className="text-sm text-gray-900">
                                <span className="font-medium">Industry: </span>
                                {tenant.industry || 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-gray-500">Status</h4>
                        <div className="mt-1">
                            <StatusBadge status={organization.status?.toLowerCase()}>
                                {organization.status || 'N/A'}
                            </StatusBadge>
                        </div>
                    </div>

                    {organization.createdAt && (
                        <div>
                            <p className="text-xs text-gray-500">
                                Requested on {new Date(organization.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            </div>
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
    const filteredData = organizationRequests?.filter(item => {
        const matchesSearch = Object.values(item).some(
            value =>
                value &&
                value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

        const matchesStatus = selectedFilters.status.length === 0 ||
            selectedFilters.status.includes(item.status);

        return matchesSearch && matchesStatus;
    }) || [];

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
    const endIndex = Math.min(startIndex + rowsPerPage, filteredData?.length || 0);
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

    const capitalizeFirstLetter = (str) =>
        str?.charAt(0)?.toUpperCase() + str?.slice(1);

    const tableColumns = [
        {
            key: "requestId",
            header: "Request ID",
            render: (value, row) => row?._id ? row._id.substring(0, 8) + '...' : 'N/A',
        },
        {
            key: "name",
            header: "Name",
            render: (value, row) => {
                const contact = row?.contactId || {};
                return (
                    <span>
                        {[contact.firstName, contact.lastName].filter(Boolean).join(' ') || 'N/A'}
                    </span>
                );
            }
        },
        {
            key: "email",
            header: "Email",
            render: (value, row) => row?.contactId?.email || 'N/A'
        },
        {
            key: "phone",
            header: "Phone",
            render: (value, row) => {
                const contact = row?.contactId || {};
                return contact.phone ? `${contact.countryCode || ''} ${contact.phone}` : 'N/A';
            }
        },
        {
            key: "company",
            header: "Company",
            render: (value, row) => row?.tenantId?.company || 'N/A'
        },
        {
            key: "status",
            header: "Status",
            render: (value, row) => (
                <StatusBadge status={capitalizeFirstLetter(row?.status || '')} />
            )
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

        ...(superAdminPermissions?.OutsourceInterviewerRequest?.Edit
            ? [
                {
                    key: "edit",
                    label: "Edit",
                    icon: <Pencil className="w-4 h-4 text-green-600" />,
                    onClick: (row) => navigate(`edit/${row._id}`),
                },
            ]
            : []),
        // {
        //   key: "resend-link",
        //   label: "Resend Link",
        //   icon: <Mail className="w-4 h-4 text-blue-600" />,
        //   disabled: (row) => row.status === "completed",
        // },
    ];


    useEffect(() => {
        console.log('Organization requests:', organizationRequests);
        console.log('Filtered data:', filteredData);
    }, [organizationRequests, filteredData]);

    return (
        <>
            <div className="fixed top-12 sm:top-12 md:top-12 left-0 right-0">
                <div className="flex justify-between p-4">
                    <div>
                        <span className="text-lg font-semibold text-custom-blue">
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
                    onNextPage={() => (currentPage + 1) * 10 < filteredData.length && setCurrentPage(currentPage + 1)}
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
                                    data={filteredData || []}  // This is the full filtered dataset
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
                                    setIsFilterActive(
                                        selectedFilters.status.length > 0
                                    );
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
                    title="Organization Details"
                    onClose={() => setIsPopupOpen(false)}
                >
                    {renderOrganizationDetails(selectedOrganization)}
                </SidebarPopup>
            )}

            <Outlet />
        </>
    );
};

export default OrganizationRequest;
