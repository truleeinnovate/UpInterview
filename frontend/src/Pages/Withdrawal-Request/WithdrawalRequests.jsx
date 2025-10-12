import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "./WithdrawalKanban.jsx";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Eye,
  Pencil,
  Wallet,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  IndianRupee,
} from "lucide-react";

import WithdrawalDetailsModal from "./WithdrawalDetailsModal.jsx";
import { usePermissions } from "../../Context/PermissionsContext.js";
import {
  useWithdrawalRequests,
  useWithdrawalRequestById,
} from "../../apiHooks/superAdmin/useWithdrawalRequests.js";

const WithdrawalRequests = () => {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    mode: [],
    amountRange: { min: "", max: "" },
    dateRange: { start: "", end: "" }
  });
  const filterIconRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [isModeOpen, setIsModeOpen] = useState(false);
  const [isAmountOpen, setIsAmountOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedModes, setSelectedModes] = useState([]);
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const { withdrawalRequests = [], isLoading, refetch } = useWithdrawalRequests();
  const { withdrawalRequest } = useWithdrawalRequestById(selectedRequestId);

  // Statistics cards data  
  const statistics = {
    pending: (withdrawalRequests || []).filter(r => r.status === "pending").length,
    processing: (withdrawalRequests || []).filter(r => r.status === "processing").length,
    completed: (withdrawalRequests || []).filter(r => r.status === "completed").length,
    failed: (withdrawalRequests || []).filter(r => r.status === "failed").length,
    cancelled: (withdrawalRequests || []).filter(r => r.status === "cancelled").length,
    // Calculate total amounts from ALL withdrawals (not just pending)
    totalAmount: (withdrawalRequests || []).reduce((sum, r) => sum + (r.amount || 0), 0),
    totalNetAmount: (withdrawalRequests || []).reduce((sum, r) => sum + (r.netAmount || 0), 0),
    // Calculate amounts by status for breakdown
    pendingAmount: (withdrawalRequests || []).filter(r => r.status === "pending").reduce((sum, r) => sum + (r.amount || 0), 0),
    processingAmount: (withdrawalRequests || []).filter(r => r.status === "processing").reduce((sum, r) => sum + (r.amount || 0), 0),
    completedAmount: (withdrawalRequests || []).filter(r => r.status === "completed").reduce((sum, r) => sum + (r.amount || 0), 0),
    failedAmount: (withdrawalRequests || []).filter(r => r.status === "failed").reduce((sum, r) => sum + (r.amount || 0), 0),
    cancelledAmount: (withdrawalRequests || []).filter(r => r.status === "cancelled").reduce((sum, r) => sum + (r.amount || 0), 0),
    // Calculate net amounts by status for breakdown
    pendingNetAmount: (withdrawalRequests || []).filter(r => r.status === "pending").reduce((sum, r) => sum + (r.netAmount || 0), 0),
    processingNetAmount: (withdrawalRequests || []).filter(r => r.status === "processing").reduce((sum, r) => sum + (r.netAmount || 0), 0),
    completedNetAmount: (withdrawalRequests || []).filter(r => r.status === "completed").reduce((sum, r) => sum + (r.netAmount || 0), 0),
    failedNetAmount: (withdrawalRequests || []).filter(r => r.status === "failed").reduce((sum, r) => sum + (r.netAmount || 0), 0),
    cancelledNetAmount: (withdrawalRequests || []).filter(r => r.status === "cancelled").reduce((sum, r) => sum + (r.netAmount || 0), 0),
  };

  // Debug logging to check what's being calculated
  // console.log("Withdrawal Statistics Debug:", {
  //   totalRecords: withdrawalRequests?.length,
  //   byStatus: {
  //     pending: statistics.pending,
  //     processing: statistics.processing,
  //     completed: statistics.completed,
  //     failed: statistics.failed,
  //     cancelled: statistics.cancelled
  //   },
  //   amounts: {
  //     total: statistics.totalAmount,
  //     pending: statistics.pendingAmount,
  //     processing: statistics.processingAmount,
  //     completed: statistics.completedAmount,
  //     failed: statistics.failedAmount,
  //     cancelled: statistics.cancelledAmount
  //   }
  // });

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

  const handleModeToggle = (mode) => {
    setSelectedModes((prev) =>
      prev.includes(mode)
        ? prev.filter((m) => m !== mode)
        : [...prev, mode]
    );
  };

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status || []);
      setSelectedModes(selectedFilters.mode || []);
      setAmountRange(selectedFilters.amountRange || { min: "", max: "" });
      setDateRange(selectedFilters.dateRange || { start: "", end: "" });
      setIsCurrentStatusOpen(false);
      setIsModeOpen(false);
      setIsAmountOpen(false);
      setIsDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    setSelectedStatus([]);
    setSelectedModes([]);
    setAmountRange({ min: "", max: "" });
    setDateRange({ start: "", end: "" });
    setIsCurrentStatusOpen(false);
    setIsModeOpen(false);
    setIsAmountOpen(false);
    setIsDateOpen(false);
    setSelectedFilters({ 
      status: [], 
      mode: [],
      amountRange: { min: "", max: "" },
      dateRange: { start: "", end: "" }
    });
    setIsFilterActive(false);
  };

  const filterMenuItems = [
    {
      title: "Current Status",
      isOpen: isCurrentStatusOpen,
      toggleOpen: () => setIsCurrentStatusOpen(!isCurrentStatusOpen),
      content: [
        {
          label: "Pending",
          checked: selectedStatus.includes("pending"),
          onChange: () => handleCurrentStatusToggle("pending"),
        },
        {
          label: "Processing",
          checked: selectedStatus.includes("processing"),
          onChange: () => handleCurrentStatusToggle("processing"),
        },
        {
          label: "Completed",
          checked: selectedStatus.includes("completed"),
          onChange: () => handleCurrentStatusToggle("completed"),
        },
        {
          label: "Failed",
          checked: selectedStatus.includes("failed"),
          onChange: () => handleCurrentStatusToggle("failed"),
        },
        {
          label: "Cancelled",
          checked: selectedStatus.includes("cancelled"),
          onChange: () => handleCurrentStatusToggle("cancelled"),
        },
      ],
    },
  ];

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'yellow';
      case 'processing':
        return 'blue';
      case 'completed':
        return 'green';
      case 'failed':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const columns = [
    {
      key: "withdrawalCode",
      header: "Withdrawal Code",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          <Wallet className="h-4 w-4 text-gray-500" />
          <span className="font-medium">{row.withdrawalCode || "N/A"}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "ownerId",
      header: "User",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.bankAccountId?.accountHolderName || "N/A"}</span>
          <span className="text-xs text-gray-500">ID: {row.ownerId}</span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "amount",
      header: "Amount",
      render: (value, row) => (
        <div className="flex flex-col">
          <div className="flex items-center">
            <IndianRupee className="h-3 w-3" />
            <span className="font-medium">{row.amount?.toFixed(2) || "0.00"}</span>
          </div>
          <span className="text-xs text-gray-500">
            Net: ₹{row.netAmount?.toFixed(2) || "0.00"}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "bankAccountId",
      header: "Bank Account",
      render: (value, row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.bankAccountId?.bankName || "N/A"}</span>
          <span className="text-xs text-gray-500">
            {row.bankAccountId?.maskedAccountNumber || "****"}
          </span>
        </div>
      ),
      sortable: false,
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(row.status)}
          <StatusBadge 
            status={row.status} 
            text={row.status ? row.status.charAt(0).toUpperCase() + row.status.slice(1) : ''} 
            color={getStatusColor(row.status)} 
          />
        </div>
      ),
      sortable: true,
    },
    {
      key: "mode",
      header: "Mode",
      render: (value, row) => {
        const mode = row?.mode || "manual";
        const displayMode = mode.charAt(0).toUpperCase() + mode.slice(1);
        return (
          <span className="px-2 py-1 bg-gray-100 rounded text-xs">
            {displayMode}
          </span>
        );
      },
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (value, row) => (
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3 text-gray-400" />
          <span className="text-sm">
            {new Date(row.createdAt).toLocaleDateString()}
          </span>
        </div>
      ),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (value, row) => (
        <div className="flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRequestId(row._id);
              setIsPopupOpen(true);
            }}
            className="p-1 hover:bg-gray-100 rounded"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          {/* {superAdminPermissions?.WithdrawalRequest?.Edit && 
           (row.status === "pending" || row.status === "processing") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedRequestId(row._id);
                setIsPopupOpen(true);
              }}
              className="p-1 hover:bg-gray-100 rounded"
              title="Process"
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </button>
          )} */}
        </div>
      ),
      sortable: false,
    },
  ];

  const handleRowClick = (row) => {
    setSelectedRequestId(row._id);
    setIsPopupOpen(true);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(0); // Reset to first page when searching
  };

  const filteredRequests = (withdrawalRequests || []).filter(request => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !request.withdrawalCode?.toLowerCase().includes(query) &&
        !request.ownerId?.toLowerCase().includes(query) &&
        !request.bankAccountId?.accountHolderName?.toLowerCase().includes(query) &&
        !request.bankAccountId?.bankName?.toLowerCase().includes(query) &&
        !request.bankAccountId?.maskedAccountNumber?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    // Status filter
    if (selectedFilters.status && selectedFilters.status.length > 0) {
      if (!selectedFilters.status.includes(request.status)) {
        return false;
      }
    }

    // Mode filter
    if (selectedFilters.mode && selectedFilters.mode.length > 0) {
      const requestMode = request.mode || "manual";
      if (!selectedFilters.mode.includes(requestMode)) {
        return false;
      }
    }

    // Amount range filter
    if (selectedFilters.amountRange) {
      const { min, max } = selectedFilters.amountRange;
      if (min && request.amount < parseFloat(min)) {
        return false;
      }
      if (max && request.amount > parseFloat(max)) {
        return false;
      }
    }

    // Date range filter
    if (selectedFilters.dateRange) {
      const { start, end } = selectedFilters.dateRange;
      const requestDate = new Date(request.createdAt);
      if (start && requestDate < new Date(start)) {
        return false;
      }
      if (end && requestDate > new Date(end + 'T23:59:59')) {
        return false;
      }
    }

    return true;
  });

  return (
    <>
      {/* Statistics Cards */}
      <div className="grid grid-cols-5 sm:grid-cols-1 md:grid-cols-4 gap-4 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600 opacity-20" />
          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.processing}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{statistics.failed}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-600 opacity-20" />
          </div>
        </motion.div>

        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cancelled</p>
              <p className="text-2xl font-bold text-gray-600">{statistics.cancelled}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-gray-600 opacity-20" />
          </div>
        </motion.div> */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Requested</p>
              <p className="text-xl font-bold text-custom-blue">₹{statistics.totalAmount.toFixed(2)}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">From {withdrawalRequests?.length || 0} withdrawals</p>
                {statistics.completedAmount > 0 && (
                  <p className="text-xs text-green-600">Completed: ₹{statistics.completedAmount.toFixed(2)}</p>
                )}
                {statistics.pendingAmount > 0 && (
                  <p className="text-xs text-yellow-600">Pending: ₹{statistics.pendingAmount.toFixed(2)}</p>
                )}
                {statistics.processingAmount > 0 && (
                  <p className="text-xs text-custom-blue">Processing: ₹{statistics.processingAmount.toFixed(2)}</p>
                )}
              </div>
            </div>
            <CreditCard className="h-8 w-8 text-custom-blue opacity-20" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600">Total Net Amount</p>
              <p className="text-xl font-bold text-purple-600">₹{statistics.totalNetAmount.toFixed(2)}</p>
              <div className="mt-2 space-y-1">
                <p className="text-xs text-gray-500">From {withdrawalRequests?.length || 0} withdrawals</p>
                {statistics.completedNetAmount > 0 && (
                  <p className="text-xs text-green-600">Completed: ₹{statistics.completedNetAmount.toFixed(2)}</p>
                )}
                {statistics.pendingNetAmount > 0 && (
                  <p className="text-xs text-yellow-600">Pending: ₹{statistics.pendingNetAmount.toFixed(2)}</p>
                )}
                {statistics.processingNetAmount > 0 && (
                  <p className="text-xs text-custom-blue">Processing: ₹{statistics.processingNetAmount.toFixed(2)}</p>
                )}
              </div>
            </div>
            <Wallet className="h-8 w-8 text-purple-600 opacity-20" />
          </div>
        </motion.div>
      </div>

      {/* Toolbar */}
      <div className="px-4">
      <Toolbar
        filterIconRef={filterIconRef}
        view={view}
        setView={setView}
        searchQuery={searchQuery}
        onSearch={(e) => handleSearch(e.target.value)}
        currentPage={currentPage}
        totalPages={Math.ceil(filteredRequests.length / ITEMS_PER_PAGE) || 1}
        onPrevPage={() => setCurrentPage(Math.max(0, currentPage - 1))}
        onNextPage={() => setCurrentPage(Math.min(Math.ceil(filteredRequests.length / ITEMS_PER_PAGE) - 1, currentPage + 1))}
        onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
        isFilterActive={isFilterActive}
        isFilterPopupOpen={isFilterPopupOpen}
        dataLength={withdrawalRequests.length}
        showViewToggles={true}
        searchPlaceholder="Search By User, Bank..."
      />
      </div>

      {/* Main Content */}
      
        {view === "table" ? (
          <TableView
            data={filteredRequests}
            columns={columns}
            onRowClick={handleRowClick}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        ) : (
          <KanbanView
            withdrawalRequests={filteredRequests}
            onCardClick={(request) => {
              setSelectedRequestId(request._id);
              setIsPopupOpen(true);
            }}
            isLoading={isLoading}
            refetch={refetch}
          />
        )}
      

      {/* Details Modal */}
      {isPopupOpen && selectedRequestId && (
        <WithdrawalDetailsModal
          withdrawalRequest={withdrawalRequest}
          isOpen={isPopupOpen}
          onClose={() => {
            setIsPopupOpen(false);
            setSelectedRequestId(null);
            refetch();
          }}
          permissions={superAdminPermissions?.WithdrawalRequest}
        />
      )}

      {/* Filter Popup */}
      {isFilterPopupOpen && (
        <FilterPopup
          filterIconRef={filterIconRef}
          isOpen={isFilterPopupOpen}
          onClose={() => setFilterPopupOpen(false)}
          onApply={() => {
            setSelectedFilters({
              status: selectedStatus,
              mode: selectedModes,
              amountRange: amountRange,
              dateRange: dateRange
            });
            setFilterPopupOpen(false);
            setIsFilterActive(
              selectedStatus.length > 0 || 
              selectedModes.length > 0 ||
              amountRange.min || amountRange.max ||
              dateRange.start || dateRange.end
            );
            setCurrentPage(0); // Reset to first page when filters are applied
          }}
          onClearAll={handleClearAll}
        >
          {/* Render filter menu items */}
          <div className="space-y-0">
            {filterMenuItems.map((menu, index) => (
              <div key={index} className="border-b border-gray-200">
                <button
                  onClick={menu.toggleOpen}
                  className="w-full flex justify-between items-center text-left py-4 px-1 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-900">{menu.title}</span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform ${menu.isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {menu.isOpen && (
                  <div className="px-1 pb-4">
                    {menu.type === 'range' ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">{menu.content.min.label}</label>
                          <input
                            type="number"
                            value={menu.content.min.value}
                            onChange={menu.content.min.onChange}
                            placeholder={menu.content.min.placeholder}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">{menu.content.max.label}</label>
                          <input
                            type="number"
                            value={menu.content.max.value}
                            onChange={menu.content.max.onChange}
                            placeholder={menu.content.max.placeholder}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : menu.type === 'dateRange' ? (
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">{menu.content.start.label}</label>
                          <input
                            type="date"
                            value={menu.content.start.value}
                            onChange={menu.content.start.onChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">{menu.content.end.label}</label>
                          <input
                            type="date"
                            value={menu.content.end.value}
                            onChange={menu.content.end.onChange}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 pt-2">
                        {menu.content.map((item, idx) => (
                          <label key={idx} className="flex items-center space-x-3 py-1.5 cursor-pointer hover:bg-gray-50 rounded px-2">
                            <input
                              type="checkbox"
                              checked={item.checked}
                              onChange={item.onChange}
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 capitalize">{item.label}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </FilterPopup>
      )}

      <Outlet />
    </>
  );
};

export default WithdrawalRequests;
