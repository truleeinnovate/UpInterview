import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
import PaymentDetailsModal from "./PaymentDetailsModal";

import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/Shared/Kanban/KanbanView.jsx";
import {
  Eye,
  Mail,
  UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import axios from "axios";
import { config } from "../../../config.js";

function PaymentsTable({ organizationId }) {
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
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments, setPayments] = useState([
    {
      id: "PAY-001",
      tenantId: "TENANT-001",
      amount: 1500,
      currency: "USD",
      status: "captured",
      paymentMethod: "card",
      paymentGateway: "razorpay",
      transactionId: "TXN-001",
      isRecurring: true,
      billingCycle: "monthly",
      transactionDate: "2025-06-01T10:00:00Z",
      paidAt: "2025-06-01T10:01:00Z",
      notes: "Monthly subscription payment",
    },
    {
      id: "PAY-002",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-003",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-004",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-005",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-006",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-007",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-008",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-009",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-0010",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-0011",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-0012",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
    {
      id: "PAY-0013",
      tenantId: "TENANT-002",
      amount: 2000,
      currency: "USD",
      status: "pending",
      paymentMethod: "bank_transfer",
      paymentGateway: "razorpay",
      transactionId: "TXN-002",
      isRecurring: false,
      billingCycle: "annual",
      transactionDate: "2025-06-02T09:00:00Z",
      notes: "Annual plan upgrade",
    },
  ]);

  // filters
  const statusOptions = ["success", "pending", "captured", "charged"];

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");

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

  // Payments API Call
  useEffect(() => {
    const getPaymentsSummary = async () => {
      try {
        setIsLoading(true);

        const endpoint = organizationId
          ? `${config.REACT_APP_API_URL}/payments/${organizationId}`
          : `${config.REACT_APP_API_URL}/payments`;

        const response = await axios.get(endpoint);
        setPayments(response.data.payments);
      } catch (error) {
        console.error("Error fetching payments:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getPaymentsSummary();
  }, [organizationId]);

  // Kanban view setter
  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const dataToUse = payments;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((payment) => {
      const fieldsToSearch = [payment.id ? payment.id : payment._id].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(payment.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
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

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "captured":
        return "success";
      case "pending":
        return "warning";
      case "failed":
        return "error";
      case "refunded":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const tableColumns = [
    {
      key: "id",
      header: "Payment ID",
      render: (value, row) => (
        <span className="font-mono text-sm">{row.id ? row.id : row._id}</span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (value, row) => (
        <div className="font-medium">
          {formatCurrency(row.amount, row.currency)}
          {row.isRecurring && (
            <div className="text-xs text-gray-500">
              Recurring • {row.billingCycle}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "method",
      header: "Payment Method",
      render: (value, row) => (
        <div className="capitalize">{row?.method?.replace("-", " ")}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge
          status={getStatusDisplay(row.status)}
          text={row.status.toUpperCase()}
        />
      ),
    },
    {
      key: "transactionDate",
      header: "Transaction Date",
      render: (value, row) => formatDate(row.transactionDate),
    },
    {
      key: "paidAt",
      header: "Paid At",
      render: (value, row) => (row.paidAt ? formatDate(row.paidAt) : "-"),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => row?._id && navigate(`/payment/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/payment/${row._id}`),
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
      <div className="absolute md:mt-2 sm:mt-4 top-2 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4">
          <h2 className="text-lg font-medium text-custom-blue">Payments</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Payments</div>
            <div className="text-xl font-semibold">{payments?.length || 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Successful</div>
            <div className="text-xl font-semibold text-success-600">
              {payments?.filter((p) => p.status === "captured").length || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold text-warning-600">
              {payments?.filter((p) => p.status === "pending").length || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Failed</div>
            <div className="text-xl font-semibold text-error-600">
              {payments?.filter((p) => p.status === "failed").length || 0}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden px-4">
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
            searchPlaceholder="Search payments..."
            filterIconRef={filterIconRef}
          />
        </div>

        {/* New table content */}
        <main>
          <div className="sm:px-0">
            {payments?.length === 0 ? (
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
                        emptyState="No payments found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((payment) => ({
                          ...payments,
                          id: payment.id ? payment.id : payment._id,
                          title: `${
                            payment.id ? payment.id : payment._id || ""
                          } ${""}`,
                          subtitle: "N/A",
                          avatar: "",
                          status: payment.status,
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No payments found."
                      />
                    </div>
                  )}

                  {/* Render FilterPopup */}
                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleApplyFilters}
                    onClearAll={handleClearAll}
                    filterIconRef={filterIconRef}
                  >
                    <div className="space-y-3">
                      {/* Current Status Section */}
                      <div>
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() =>
                            setIsCurrentStatusOpen(!isCurrentStatusOpen)
                          }
                        >
                          <span className="font-medium text-gray-700">
                            Current Status
                          </span>
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
                                        checked={selectedStatus.includes(
                                          status
                                        )}
                                        onChange={() =>
                                          handleCurrentStatusToggle(status)
                                        }
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
                  </FilterPopup>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
      <Outlet />
    </div>
  );
}

export default PaymentsTable;
