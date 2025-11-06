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

// Mock data - replace with actual API call
const useEnterpriseContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate API call
        const fetchData = async () => {
            try {
                // Replace with actual API call
                // const response = await fetch('/api/enterprise-contacts');
                // const data = await response.json();
                // setContacts(data);
                
                // Mock data
                const mockData = [
                    {
                        id: 1,
                        companyName: "Acme Inc",
                        contactPerson: "John Doe",
                        email: "john@acme.com",
                        phone: "+1 234 567 8901",
                        status: "new",
                        createdAt: new Date().toISOString()
                    },
                    // Add more mock data as needed
                ];
                
                setContacts(mockData);
            } catch (error) {
                console.error("Error fetching enterprise contacts:", error);
                notify.error("Failed to load enterprise contacts");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { enterpriseContacts: contacts, isLoading, refetch: () => {} };
};

const EnterpriseContactSale = () => {
    const { superAdminPermissions } = usePermissions();
    console.log('EnterpriseContactSale component rendered with permissions:', superAdminPermissions);
    
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
    const filterIconRef = useRef(null);
    const ITEMS_PER_PAGE = 10;

    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [statusFilter, setStatusFilter] = useState("");

    // Get real data from backend
    const { enterpriseContacts = [], isLoading } = useEnterpriseContacts();

    // Test if component is mounted
    useEffect(() => {
        console.log('EnterpriseContactSale component mounted');
        console.log('Has EnterpriseContactSale permission:', superAdminPermissions?.EnterpriseContactSale);
        
        return () => {
            console.log('EnterpriseContactSale component unmounted');
        };
    }, [superAdminPermissions]);

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

    const handleClearAll = () => {
        setDateRange({ start: "", end: "" });
        setStatusFilter("");
        setSelectedFilters({
            dateRange: { start: "", end: "" },
            status: ""
        });
        setIsFilterActive(false);
    };

    const filterMenuItems = [
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
            value: statusFilter,
            onChange: (value) => setStatusFilter(value)
        },
        {
            label: "Date Range",
            type: "date-range",
            value: dateRange,
            onChange: (range) => setDateRange(range)
        }
    ];

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

    const handleSearch = (value) => {
        setSearchQuery(value);
        setCurrentPage(0);
    };

    const handleView = (id) => {
        notify.info(`Viewing enterprise contact: ${id}`);
    };

    const handleContact = (id) => {
        notify.success(`Marked enterprise contact ${id} as contacted`);
    };

    const handleQualify = (id) => {
        notify.success(`Marked enterprise contact ${id} as qualified`);
    };

    const handleClose = (id) => {
        notify.warning(`Closed enterprise contact: ${id}`);
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
            key: "phone",
            header: "PHONE",
            render: (row) => {
                const phone = typeof row === "object" ? row?.phone : row;
                return (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{phone || 'N/A'}</span>
                    </div>
                );
            },
        },
        {
            key: "status",
            header: "STATUS",
            render: (row) => {
                const status = typeof row === "object" ? row?.status : row;
                return (
                    <StatusBadge
                        status={status || 'new'}
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
        {
            key: "actions",
            header: "ACTIONS",
            render: (row) => (
                <>
                {/* <EnterpriseContactActionDropdown
                    row={row}
                    onView={handleView}
                    onContact={handleContact}
                    onQualify={handleQualify}
                    onClose={handleClose}
                    permissions={superAdminPermissions?.EnterpriseContactSale}
                /> */}
                </>
            ),
        },
    ];

    // Filter data based on search and filters
    const filteredData = enterpriseContacts.filter((item) => {
        // Search filter
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            item.companyName?.toLowerCase().includes(searchLower) ||
            item.contactPerson?.toLowerCase().includes(searchLower) ||
            item.email?.toLowerCase().includes(searchLower) ||
            item.phone?.toLowerCase().includes(searchLower);

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
    const getTotalPages = () => {
        return Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
    };

    const totalPages = getTotalPages();

    // Auto-reset current page when filters reduce available pages
    useEffect(() => {
        if (currentPage >= totalPages && totalPages > 0) {
            setCurrentPage(Math.max(0, totalPages - 1));
        }
    }, [currentPage, totalPages]);

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
                    dataLength={filteredData.length}
                    isFilterPopupOpen={isFilterPopupOpen}
                    searchPlaceholder="Search by company, contact, email or phone..."
                    showAddButton={false}
                />
            </div>

            {/* Table/Kanban View */}
            {view === "table" ? (
                <TableView
                    data={filteredData}
                    columns={columns}
                    loading={isLoading}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    setCurrentPage={setCurrentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
                />
            ) : (
                <EnterpriseContactKanban
                    contacts={filteredData}
                    currentPage={currentPage}
                    itemsPerPage={ITEMS_PER_PAGE}
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
                        onApplyFilters={handleApplyFilters}
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