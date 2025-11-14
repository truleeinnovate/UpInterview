import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import EnterpriseContactKanban from "./EnterpriseContactKanban.jsx";
// import EnterpriseContactActionDropdown from "./EnterpriseContactActionDropdown.jsx";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import {
    Mail,
    User,
    Calendar,
    CheckCircle,
    Inbox,
    Phone,
    Building2
} from "lucide-react";

import { usePermissions } from "../../../Context/PermissionsContext";
import { notify } from "../../../services/toastService";
import Header from "../../../Components/Shared/Header/Header.jsx";
import useEnterpriseContacts from "../../../apiHooks/superAdmin/useEnterpriseContacts.js";


const EnterpriseContactSale = () => {
    const { superAdminPermissions } = usePermissions();

    // State management
    const [view, setView] = useState("table");
    const [searchQuery, setSearchQuery] = useState("");
    const [isFilterActive, setIsFilterActive] = useState(false);
    const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedFilters, setSelectedFilters] = useState({
        dateRange: { start: "", end: "" },
        status: ""
    });
    const ITEMS_PER_PAGE = 10;

    // Filter states
    const [filters, setFilters] = useState({
        companyName: "",
        contactPerson: "",
        email: "",
        phone: "",
        status: "",
        dateRange: { start: "", end: "" }
    });

    const filterIconRef = useRef(null);

    // Query parameters for the API
    const queryParams = {
        page: currentPage + 1,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        ...filters
    };

    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [statusFilter, setStatusFilter] = useState("");

    // Use the REAL hook for fetching data
    const {
        enterpriseContacts = [],
        totalCount = 0,
        isLoading,
        error,
        refetch
    } = useEnterpriseContacts(queryParams);

    console.log('enterpriseContacts:', enterpriseContacts)


    useEffect(() => {
        const handleResize = () => {
            setView(window.innerWidth < 1024 ? "kanban" : "table");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Reset filters when popup opens
    useEffect(() => {
        if (isFilterPopupOpen) {
            setDateRange(selectedFilters.dateRange || { start: "", end: "" });
            setStatusFilter(selectedFilters.status || "");
        }
    }, [isFilterPopupOpen, selectedFilters]);

    // const handleClearAll = () => {
    //     setDateRange({ start: "", end: "" });
    //     setStatusFilter("");
    //     setSelectedFilters({
    //         dateRange: { start: "", end: "" },
    //         status: ""
    //     });
    //     setIsFilterActive(false);
    // };

    // const filterMenuItems = [
    //     {
    //         label: "Status",
    //         type: "select",
    //         options: [
    //             { value: "", label: "All Statuses" },
    //             { value: "new", label: "New" },
    //             { value: "contacted", label: "Contacted" },
    //             { value: "qualified", label: "Qualified" },
    //             { value: "closed", label: "Closed" }
    //         ],
    //         value: statusFilter,
    //         onChange: (value) => setStatusFilter(value)
    //     },
    //     {
    //         label: "Date Range",
    //         type: "date-range",
    //         value: dateRange,
    //         onChange: (range) => setDateRange(range)
    //     }
    // ];

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'new':
                return <Inbox className="h-4 w-4" />;
            case 'contacted':
                return <Phone className="h-4 w-4" />;
            case 'qualified':
                return <CheckCircle className="h-4 w-4" />;
            case 'closed':
                return <CheckCircle className="h-4 w-4" />;
            default:
                return <Inbox className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'new':
                return 'info';
            case 'contacted':
                return 'primary';
            case 'qualified':
                return 'success';
            case 'closed':
                return 'default';
            default:
                return 'default';
        }
    };

    const handleApplyFilters = () => {
        const filters = {
            dateRange: dateRange,
            status: statusFilter
        };

        setSelectedFilters(filters);
        setIsFilterActive(
            (dateRange.start && dateRange.end) || statusFilter
        );
        setFilterPopupOpen(false);
        setCurrentPage(0);
    };

    // const handleSearch = (value) => {
    //     setSearchQuery(value);
    //     setCurrentPage(0);
    // };

    const handleView = (id) => {
        notify.info(`Viewing enterprise contact: ${id}`);
        // Optional: Refetch after view if needed
        // refetch();
    };

    const handleContact = (id) => {
        notify.success(`Marked enterprise contact ${id} as contacted`);
        // TODO: Call backend to update status, then refetch()
        // e.g., await api.put(`/upinterviewEnterpriseContact/${id}`, { status: 'contacted' });
        // refetch();
    };

    const handleQualify = (id) => {
        notify.success(`Marked enterprise contact ${id} as qualified`);
        // TODO: Similar to above
        // refetch();
    };

    const handleClose = (id) => {
        notify.warning(`Closed enterprise contact: ${id}`);
        // TODO: Similar to above
        // refetch();
    };

    const columns = [
        {
            key: "companyName",
            header: "COMPANY",
            render: (row) => {
                const companyName = typeof row === "string" ? row : row?.companyName;
                return (
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{companyName || 'N/A'}</span>
                    </div>
                );
            },
        },
        {
            key: "contactPerson",
            header: "CONTACT PERSON",
            render: (row) => {
                const contactPerson = typeof row === "object" ? row?.contactPerson : row;
                return (
                    <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{contactPerson || 'N/A'}</span>
                    </div>
                );
            },
        },
        {
            key: "email",
            header: "EMAIL",
            render: (row) => {
                const email = typeof row === "object" ? row?.email : row;
                return (
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{email || 'N/A'}</span>
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "STATUS",
            render: (row) => {
                let status = typeof row === "object" ? row?.status : row;
                // Capitalize first letter and make rest lowercase
                const formattedStatus = status 
                    ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
                    : 'New';
                return (
                    <StatusBadge
                        status={formattedStatus}
                        getStatusColor={getStatusColor}
                        getStatusIcon={getStatusIcon}
                    />
                );
            },
        },
        {
            key: "createdAt",
            header: "SUBMITTED ON",
            render: (row) => {
                const createdAt = typeof row === "object" ? row?.createdAt : row;
                return (
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                            {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                    </div>
                );
            },
        },
        // Actions column has been removed as per requirements,
    ];

    // Filter data based on search and filters
    const filteredData = enterpriseContacts.filter((item) => {
        // Search filter - handle case where searchQuery might be null/undefined
        const searchLower = searchQuery ? searchQuery.toString().toLowerCase() : '';
        const matchesSearch = !searchQuery ||
            (item.companyName && item.companyName.toString().toLowerCase().includes(searchLower)) ||
            (item.contactPerson && item.contactPerson.toString().toLowerCase().includes(searchLower)) ||
            (item.email && item.email.toString().toLowerCase().includes(searchLower)) ||
            (item.phone && item.phone.toString().toLowerCase().includes(searchLower));

        // Status filter
        const matchesStatus = !statusFilter ||
            item.status?.toLowerCase() === statusFilter.toLowerCase();

        // Date range filter
        let matchesDate = true;
        if (selectedFilters.dateRange?.start && selectedFilters.dateRange?.end) {
            const itemDate = new Date(item.createdAt);
            const startDate = new Date(selectedFilters.dateRange.start);
            const endDate = new Date(selectedFilters.dateRange.end + 'T23:59:59');
            matchesDate = itemDate >= startDate && itemDate <= endDate;
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    // Calculate total pages for pagination
    const totalItems = Array.isArray(filteredData) ? filteredData.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    // Auto-reset current page when filters reduce available pages
    useEffect(() => {
        if (totalPages > 0 && (isNaN(currentPage) || currentPage >= totalPages)) {
            setCurrentPage(0);
        }
    }, [currentPage, totalPages]);

    // Handle filter changes
    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
        setCurrentPage(0); // Reset to first page when filters change
    };

    // Handle date range change
    const handleDateRangeChange = (range) => {
        setFilters(prev => ({
            ...prev,
            dateRange: range
        }));
        setCurrentPage(0);
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(0); // Reset to first page on new search
    };

    // Clear all filters
    const handleClearAll = () => {
        setFilters({
            companyName: "",
            contactPerson: "",
            email: "",
            phone: "",
            status: "",
            dateRange: { start: "", end: "" }
        });
        setSearchQuery("");
        setCurrentPage(0);
        setIsFilterActive(false);
    };

    // Filter menu items for the filter popup
    const filterMenuItems = [
        {
            label: "Company",
            type: "text",
            value: filters.companyName,
            onChange: (value) => handleFilterChange('companyName', value)
        },
        {
            label: "Contact Person",
            type: "text",
            value: filters.contactPerson,
            onChange: (value) => handleFilterChange('contactPerson', value)
        },
        {
            label: "Email",
            type: "email",
            value: filters.email,
            onChange: (value) => handleFilterChange('email', value)
        },
        {
            label: "Phone",
            type: "tel",
            value: filters.phone,
            onChange: (value) => handleFilterChange('phone', value)
        },
        {
            label: "Status",
            type: "select",
            options: [
                { value: "", label: "All Statuses" },
                { value: "new", label: "New" },
                { value: "contacted", label: "Contacted" },
                { value: "qualified", label: "Qualified" },
                { value: "closed", label: "Closed" }
            ],
            value: filters.status,
            onChange: (value) => handleFilterChange('status', value)
        },
        {
            label: "Date Range",
            type: "date-range",
            value: filters.dateRange,
            onChange: handleDateRangeChange
        }
    ];

    return (
        <>
            <div className="px-2">
                {/* Header */}
                <Header
                    title="Enterprise Contact Sales"
                    canCreate={false}
                />

                {/* Toolbar */}
                <Toolbar
                    view={view}
                    setView={setView}
                    onSearch={handleSearch}
                    onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
                    dataLength={enterpriseContacts.length}
                    isFilterPopupOpen={isFilterPopupOpen}
                    searchPlaceholder="Search by company, contact, email or phone..."
                    showAddButton={false}
                />
            </div>

            {/* Table/Kanban View */}
            {view === "table" ? (
                <TableView
                    data={enterpriseContacts}
                    columns={columns}
                    loading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalCount}
                />
            ) : (
                <EnterpriseContactKanban
                    contacts={enterpriseContacts}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                    totalItems={totalCount}
                    onPageChange={setCurrentPage}
                    onView={handleView}
                    onContact={handleContact}
                    onQualify={handleQualify}
                    onClose={handleClose}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    permissions={superAdminPermissions?.EnterpriseContactSale}
                />
            )}

            {/* Filter Popup */}
            {isFilterPopupOpen && (
                <div ref={filterIconRef}>
                    <FilterPopup
                        filterMenuItems={filterMenuItems}
                        onApplyFilters={() => {
                            setIsFilterActive(
                                Object.values(filters).some(
                                    (value) =>
                                        (typeof value === 'string' && value) ||
                                        (typeof value === 'object' && value &&
                                            ((value.start && value.end) || Object.values(value).some(v => v)))
                                )
                            );
                            setFilterPopupOpen(false);
                        }}
                        onClearAll={handleClearAll}
                        onClose={() => setFilterPopupOpen(false)}
                        isFilterActive={isFilterActive}
                    />
                </div>
            )}

            <Outlet />
        </>
    );
};

export default EnterpriseContactSale;