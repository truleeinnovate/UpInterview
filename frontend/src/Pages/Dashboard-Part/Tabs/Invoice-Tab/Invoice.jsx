import { useState, useRef, useEffect, useCallback } from "react";
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, Outlet } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config";
import Loading from "../../../../Components/Loading";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import InvocieKanban from "./InvocieKanban";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";

const InvoiceTab = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [billingData, setBillingData] = useState([]);

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const tenantId = tokenPayload?.tenantId;
    const organization = tokenPayload?.organization;
    const ownerId = tokenPayload?.userId;

    const fetchInvoiceData = useCallback(async () => {
        setLoading(true);
        try {
            // Determine the ID and query parameter based on organization flag
            const id = organization ? tenantId : ownerId;
            const endpoint = `${config.REACT_APP_API_URL}/invoices/get-invoice/${id}?isOrganization=${organization}`;

            // Fetch invoice data from API
            const Invoice_res = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            const invoiceData = Invoice_res?.data || [];
            // Transform the data into a more usable structure
            const formattedData = invoiceData.map(invoice => {
                const paymentId = invoice.paymentId || 
                    `PAY-${invoice._id.toString().substring(18, 24)}-${Date.now().toString().substring(8)}`;
                return {
                    id: invoice._id,
                    paymentId,
                    invoiceNumber: invoice.invoiceCode,
                    customer: invoice.ownerId ? {
                        id: invoice.ownerId._id,
                        name: invoice.ownerId.Name || `${invoice.ownerId.Firstname} ${invoice.ownerId.Lastname || ''}`.trim(),
                        userId: invoice.ownerId.UserId
                    } : null,
                    plan: invoice.planName,
                    amount: {
                        total: invoice.totalAmount,
                        paid: invoice.amountPaid,
                        outstanding: invoice.outstandingAmount,
                        discount: invoice.discount
                    },
                    dates: {
                        createdAt: new Date(invoice.updatedAt),
                        startDate: invoice.startDate ? new Date(invoice.startDate) : null,
                        endDate: invoice.endDate ? new Date(invoice.endDate) : null,
                        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null
                    },
                    status: invoice.status || 'N/A',
                    type: invoice.type || 'N/A',
                    comments: invoice.comments || '',
                    lineItems: invoice.lineItems || [],
                    tenantId: invoice.tenantId
                };
            });

            setBillingData(formattedData.reverse());
        } catch (error) {
            console.error("Error fetching invoice data:", error);
        }
        setLoading(false);
    }, [ownerId, tenantId, organization, authToken]);

    useEffect(() => {
        fetchInvoiceData();
    }, [fetchInvoiceData]);

    const [searchQuery, setSearchQuery] = useState("");
    const handleSearchInputChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(true);
    const [isTypeOpen, setIsTypeOpen] = useState(true);
    const [isAmountOpen, setIsAmountOpen] = useState(true);
    
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [amountRange, setAmountRange] = useState({ min: '', max: '' });
    
    const [selectedFilters, setSelectedFilters] = useState({
        status: [],
        type: [],
        amount: { min: '', max: '' }
    });
    
    useEffect(() => {
        if (isFilterPopupOpen) {
            setSelectedStatus(selectedFilters.status);
            setSelectedTypes(selectedFilters.type);
            setAmountRange(selectedFilters.amount);
        }
    }, [isFilterPopupOpen, selectedFilters]);
    
    const handleStatusToggle = (status) => {
        setSelectedStatus(prev => 
            prev.includes(status)
            ? prev.filter(s => s !== status)
            : [...prev, status]
        );
    };
    
    const handleTypeToggle = (type) => {
        setSelectedTypes(prev => 
            prev.includes(type)
            ? prev.filter(t => t !== type)
            : [...prev, type]
        );
    };
    
    const handleAmountChange = (field, value) => {
        setAmountRange(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const handleClearAll = () => {
        const clearedFilters = {
            status: [],
            type: [],
            amount: { min: '', max: '' }
        };
        
        setSelectedStatus([]);
        setSelectedTypes([]);
        setAmountRange({ min: '', max: '' });
        
        setSelectedFilters(clearedFilters);
        setIsFilterActive(false);
        setFilterPopupOpen(false);
    };
    
    const handleApplyFilters = () => {
        const filters = {
            status: selectedStatus,
            type: selectedTypes,
            amount: amountRange
        };
        
        setSelectedFilters(filters);
        setIsFilterActive(
            filters.status.length > 0 || 
            filters.type.length > 0 || 
            filters.amount.min || 
            filters.amount.max
        );
        setFilterPopupOpen(false);
    };
    
    const handleFilterIconClick = () => {
        if (billingData.length !== 0) {
            setFilterPopupOpen((prev) => !prev);
        }
    };

    useEffect(() => {
        document.title = "Invoice Tab";
    }, []);

    const [viewMode, setViewMode] = useState("table");

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setViewMode("kanban");
            } else {
                setViewMode("table");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    const [isFilterActive, setIsFilterActive] = useState(false);
    const filterIconRef = useRef(null);

    const tableColumns = [
        {
            key: 'invoiceNumber',
            header: 'Invoice Number',
            render: (value) => value || 'N/A',
        },
        {
            key: 'plan',
            header: 'Plan',
            render: (value) => value || 'N/A',
        },
        {
            key: 'amount',
            header: 'Amount',
            render: (value) => value && value.total ? `₹${value.total}` : 'N/A',
        },
        {
            key: 'status',
            header: 'Status',
            render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${
                    value === 'paid' ? 'bg-green-100 text-green-800' :
                    value === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    value === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {value || 'N/A'}
                </span>
            ),
        },
        {
            key: 'dates',
            header: 'Created At',
            render: (value) => value && value.createdAt ? new Date(value.createdAt).toLocaleDateString() : 'N/A',
        },
    ];

    const tableActions = [
        {
            key: 'view',
            label: 'View Details',
            icon: <FileText className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => navigate(`details/${row.id}`, { state: { invoiceData: row } }),
        },
    ];

    const FilteredData = () => {
        if (!Array.isArray(billingData)) return [];
        
        let filteredData = billingData;
        
        if (searchQuery) {
            filteredData = filteredData.filter(data => {
                return (
                    (data.paymentId && data.paymentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (data.invoiceNumber && data.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (data.status && data.status.toLowerCase().includes(searchQuery.toLowerCase()))
                );
            });
        }
        
        if (selectedFilters.status.length > 0) {
            filteredData = filteredData.filter(invoice => 
                selectedFilters.status.includes(invoice.status)
            );
        }
        
        if (selectedFilters.type.length > 0) {
            filteredData = filteredData.filter(invoice => 
                selectedFilters.type.includes(invoice.type)
            );
        }
        
        if (selectedFilters.amount.min || selectedFilters.amount.max) {
            filteredData = filteredData.filter(invoice => {
                const amount = invoice.amount?.total || 0;
                return (
                    (!selectedFilters.amount.min || amount >= parseFloat(selectedFilters.amount.min)) &&
                    (!selectedFilters.amount.max || amount <= parseFloat(selectedFilters.amount.max))
                );
            });
        }
        
        return filteredData;
    };
    
    const [currentPage, setCurrentPage] = useState(0);
    const rowsPerPage = 9;
    const totalPages = Math.ceil(FilteredData().length / rowsPerPage);

    const nextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(currentPage - 1);
        }
    };

    const startIndex = currentPage * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
    const currentFilteredRows = FilteredData().slice(startIndex, endIndex).sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
        const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
        return dateB - dateA;
    });

    return (
        <div className="w-full min-h-screen border-0">
            <div className="fixed top-16 left-0 right-0">
                <main className="px-6 sm:mt-20 md:mt-24">
                    <div className="sm:px-0">
                        <motion.div
                            className="flex justify-between items-center py-4"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h1 className="text-2xl font-semibold text-custom-blue">
                                Invoices
                            </h1>
                        </motion.div>
                        <Toolbar
                            view={viewMode}
                            setView={(newView) => setViewMode(newView)}
                            searchQuery={searchQuery}
                            onSearch={handleSearchInputChange}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPrevPage={prevPage}
                            onNextPage={nextPage}
                            onFilterClick={handleFilterIconClick}
                            isFilterPopupOpen={isFilterPopupOpen}
                            isFilterActive={isFilterActive}
                            dataLength={billingData.length}
                            searchPlaceholder="Search by Status, Inv..."
                            filterIconRef={filterIconRef}
                        />
                    </div>
                </main>
            </div>
            <main className="fixed top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background w-full">
                <div className="w-full overflow-auto">
                    {loading ? (
                        <Loading message="Loading Invoices..."/>
                    ) : (
                        <motion.div className="w-full">
                            <div className="relative w-full">
                                {viewMode === 'table' ? (
                                    <div className="w-full">
                                        <TableView
                                            data={currentFilteredRows}
                                            columns={tableColumns}
                                            loading={loading}
                                            actions={tableActions}
                                            emptyState="No invoices found."
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full px-6">
                                        <InvocieKanban 
                                            currentFilteredRows={currentFilteredRows || []}
                                            loading={loading}
                                            handleUserClick={() => {}}
                                            handleEditClick={() => {}}
                                            toggleSidebar={() => {}}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>
                <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleApplyFilters}
                    onClearAll={handleClearAll}
                    filterIconRef={filterIconRef}
                >
                    <div className="space-y-3 p-4">
                        <div>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setIsStatusOpen(!isStatusOpen)}
                            >
                                <span className="font-medium text-gray-700">Status</span>
                                {isStatusOpen ? (
                                    <ChevronUp className="text-xl text-gray-700" />
                                ) : (
                                    <ChevronDown className="text-xl text-gray-700" />
                                )}
                            </div>
                            {isStatusOpen && (
                                <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                                    {['paid', 'pending', 'cancelled', 'failed', 'refunded'].map((status) => (
                                        <label
                                            key={status}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedStatus.includes(status)}
                                                onChange={() => handleStatusToggle(status)}
                                                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm capitalize">{status}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setIsTypeOpen(!isTypeOpen)}
                            >
                                <span className="font-medium text-gray-700">Invoice Type</span>
                                {isTypeOpen ? (
                                    <ChevronUp className="text-xl text-gray-700" />
                                ) : (
                                    <ChevronDown className="text-xl text-gray-700" />
                                )}
                            </div>
                            {isTypeOpen && (
                                <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                                    {['subscription', 'wallet', 'service', 'one-time'].map((type) => (
                                        <label
                                            key={type}
                                            className="flex items-center space-x-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTypes.includes(type)}
                                                onChange={() => handleTypeToggle(type)}
                                                className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-sm capitalize">{type}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div>
                            <div
                                className="flex justify-between items-center cursor-pointer"
                                onClick={() => setIsAmountOpen(!isAmountOpen)}
                            >
                                <span className="font-medium text-gray-700">Amount Range</span>
                                {isAmountOpen ? (
                                    <ChevronUp className="text-xl text-gray-700" />
                                ) : (
                                    <ChevronDown className="text-xl text-gray-700" />
                                )}
                            </div>
                            {isAmountOpen && (
                                <div className="mt-1 space-y-2 pl-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Min Amount</label>
                                        <input
                                            type="number"
                                            value={amountRange.min}
                                            onChange={(e) => handleAmountChange('min', e.target.value)}
                                            placeholder="Min"
                                            min={0}
                                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Max Amount</label>
                                        <input
                                            type="number"
                                            value={amountRange.max}
                                            onChange={(e) => handleAmountChange('max', e.target.value)}
                                            placeholder="Max"
                                            min={0}
                                            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </FilterPopup>
            </main>
            <Outlet />
        </div>
    );
};

export default InvoiceTab;