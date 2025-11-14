// v1.0.0 - Ashok - Disabled outer scrollbar when the popup is open
// v1.0.1 - Ashok - Adjusted heights of Table and Kanban

import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
// import PaymentDetailsModal from "./PaymentDetailsModal";

import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
// import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/SuperAdminComponents/Billing/Payment/Kanban.jsx";
import {
  Eye,
  Mail,
  Pencil,
  ChevronUp,
  ChevronDown,
  Download,
  CreditCard,
  Landmark,
  User,
  Key,
  Store,
} from "lucide-react";

// import axios from "axios";
// import { config } from "../../../config.js";
import SidebarPopup from "../SidebarPopup/SidebarPopup.jsx";
import {
  usePayments,
  usePaymentById,
} from "../../../apiHooks/superAdmin/usePayments.js";
// v1.0.0 <-------------------------------------------------------------------------
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.0 -------------------------------------------------------------------------

function PaymentsTable({ organizationId, viewMode }) {
  const [view, setView] = useState("table");
  // const [selectCandidateView, setSelectCandidateView] = useState(false);
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
  // const [isLoading, setIsLoading] = useState(false);

  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  // const [selectedPayment, setSelectedPayment] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState([]);

  const rowsPerPage = 10;
  const toApiPaymentStatus = (arr) => arr.map((s) => (s === "success" ? "captured" : s)).join(",");
  const { payments, pagination, stats, isLoading } = usePayments({
    page: currentPage,
    limit: rowsPerPage,
    search: searchQuery,
    status: toApiPaymentStatus(selectedStatus),
    tenantId: organizationId || "",
    organizationId
  }); // from apiHooks
  const { payment: selectedPayment } = usePaymentById(selectedPaymentId); // from apiHooks

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  
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
  // useEffect(() => {
  //   const getPaymentsSummary = async () => {
  //     try {
  //       setIsLoading(true);

  //       const endpoint = organizationId
  //         ? `${config.REACT_APP_API_URL}/payments/${organizationId}`
  //         : `${config.REACT_APP_API_URL}/payments`;

  //       const response = await axios.get(endpoint);
  //       setPayments(response.data.payments);
  //     } catch (error) {
  //       console.error("Error fetching payments:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   getPaymentsSummary();
  // }, [organizationId]);

  // Get payment by ID
  // useEffect(() => {
  //   const getPaymentById = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/payments/payment/${selectedPaymentId}`
  //       );
  //       setSelectedPayment(response.data);
  //       console.log("SELECTED PAYMENT RESPONSE: ", response.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   if (selectedPaymentId) {
  //     getPaymentById();
  //   }
  // }, [selectedPaymentId]);

  // Kanban view setter
  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const dataToUse = payments;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  

  const totalPages = pagination?.totalPages || 0;
  const nextPage = () => {
    if (pagination?.hasNext) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };
  const prevPage = () => {
    if (pagination?.hasPrev && currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on search
  };

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // const getStatusDisplay = (status) => {
  //   switch (status) {
  //     case "captured":
  //       return "success";
  //     case "pending":
  //       return "warning";
  //     case "failed":
  //       return "error";
  //     case "refunded":
  //       return "neutral";
  //     default:
  //       return "neutral";
  //   }
  // };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const tableColumns = [
    {
      key: "paymentCode",
      header: "Payment ID",
      render: (value, row) => (
        <span
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => {
            setSelectedPaymentId(row._id);
            setIsPopupOpen(true);
          }}
        >
          {row.paymentCode ? row.paymentCode : "N/A"}
        </span>
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
      key: "paymentMethod",
      header: "Payment Method",
      render: (value, row) => (
        <div className="capitalize">{row?.paymentMethod?.replace("-", " ")}</div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
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
      onClick: (row) => {
        setSelectedPaymentId(row._id);
        setIsPopupOpen(true);
      },
    },
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/payment/${row._id}`),
    // },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    // {
    //   key: "resend-link",
    //   label: "Resend Link",
    //   icon: <Mail className="w-4 h-4 text-blue-600" />,
    //   disabled: (row) => row.status === "completed",
    // },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "amount",
      header: "Amount",
      render: (value) => (
        <div className="font-medium">{formatCurrency(value)}</div>
      ),
    },
    {
      key: "method",
      header: "Payment Method",
      render: (value) => <div>{value || "N/A"}</div>,
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedPaymentId(row._id);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
    // {
    //   key: "login-as-user",
    //   label: "Login as User",
    //   icon: <AiOutlineUser className="w-4 h-4 text-blue-600" />,
    //   onClick: (row) => handleLoginAsUser(row._id),
    // },
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
  const renderFilterContent = () => {
    // filters options
    const statusOptions = ["success", "pending", "captured", "charged"];

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

  // Render PopupContent
  // v1.0.0 <-------------------------------------------------------------------------
  const PopupContent = ({ payment }) => {
    useScrollLock(true);
    // v1.0.0 -------------------------------------------------------------------------
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                    {payment?.paymentCode?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  payment?.Status === 'active' ? 'bg-green-100 text-green-800' :
                  payment?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {payment?.Status ? payment?.Status.charAt(0).toUpperCase() + payment?.Status.slice(1) : "?"}
  
                </span> */}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {payment?.paymentCode ? payment.paymentCode : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {payment?.transactionDate
                      ? formatDate(payment?.transactionDate)
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 flex items-center">
                        <CreditCard className="mr-2" />
                        Payment Information
                      </h4>
                      <div className="mt-2 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Amount</span>
                          <span className="font-medium">
                            {formatCurrency(payment.amount, payment.currency) ||
                              "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status</span>
                          <StatusBadge
                            status={payment.status}
                            text={payment?.status?.toUpperCase()}
                          />
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Payment Method</span>
                          <span className="capitalize">
                            {payment?.paymentMethod?.replace("_", " ") || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500 flex items-center">
                      <Landmark className="mr-2" />
                      Gateway Details
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Gateway</span>
                        <span className="capitalize">
                          {payment.paymentGateway || "N/A"}
                        </span>
                      </div>
                      {payment.razorpayPaymentId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Razorpay Payment ID
                          </span>
                          <span className="font-mono text-sm">
                            {payment.razorpayPaymentId || "N/A"}
                          </span>
                        </div>
                      )}
                      {payment.razorpayOrderId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">
                            Razorpay Order ID
                          </span>
                          <span className="font-mono text-sm">
                            {payment.razorpayOrderId || "N/A"}
                          </span>
                        </div>
                      )}
                      {payment.razorpaySignature && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Signature</span>
                          <span
                            className="font-mono text-sm truncate max-w-[200px]"
                            title={payment.razorpaySignature || "N/A"}
                          >
                            {payment.razorpaySignature || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="mr-2" />
                    Customer Information
                  </h4>
                  <div className="mt-2 space-y-2">
                    {payment.razorpayCustomerId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Customer ID</span>
                        <span className="font-mono text-sm">
                          {payment.razorpayCustomerId || "N/A"}
                        </span>
                      </div>
                    )}
                    {payment.cardId && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Card ID</span>
                        <span className="font-mono text-sm">
                          {payment.cardId || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <Key className="mr-2" />
                    Transaction Details
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID</span>
                      <span className="font-mono">
                        {payment.transactionId || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction Date</span>
                      <span>
                        {formatDate(payment.transactionDate) || "N/A"}
                      </span>
                    </div>
                    {payment.paidAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid At</span>
                        <span>{formatDate(payment.paidAt) || "N/A"}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-500 flex items-center">
                    <Store className="mr-2" />
                    Subscription Details
                  </h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recurring</span>
                      <span>{payment.isRecurring ? "Yes" : "No"}</span>
                    </div>
                    {payment.isRecurring && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Billing Cycle</span>
                          <span className="capitalize">
                            {payment.billingCycle || "N/A"}
                          </span>
                        </div>
                        {payment.subscriptionId && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Subscription ID
                            </span>
                            <span className="font-mono text-sm">
                              {payment.subscriptionId || "N/A"}
                            </span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {payment.metadata &&
                    Object.keys(payment.metadata).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Additional Information
                        </h4>
                        <div className="mt-2 bg-gray-50 rounded-lg p-3">
                          <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                            {JSON.stringify(payment.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}

                  {payment.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Notes
                      </h4>
                      <p className="mt-2 text-gray-600">{payment.notes}</p>
                    </div>
                  )}
                </div> */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="btn-secondary flex items-center">
                      <Download className="mr-2" />
                      Download Receipt
                    </button>
                    <button className="btn-secondary flex items-center">
                      <Mail className="mr-2" />
                      Email Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="bg-background">
        <div className="px-4 mb-4 mt-2">
          <h2 className="text-xl font-semibold text-custom-blue">Payments</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Payments</div>
            <div className="text-xl font-semibold">{stats?.totalPayments ?? payments?.length ?? 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Successful</div>
            <div className="text-xl font-semibold text-success-600">{stats?.successfulPayments ?? (payments?.filter((p) => p.status === "captured").length || 0)}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold text-warning-600">{stats?.pendingPayments ?? (payments?.filter((p) => p.status === "pending").length || 0)}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Failed</div>
            <div className="text-xl font-semibold text-error-600">{stats?.failedPayments ?? (payments?.filter((p) => p.status === "failed").length || 0)}</div>
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
            <motion.div className="bg-white">
              <div className="relative w-full">
                {view === "table" ? (
                  <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                    <TableView
                      data={payments}
                      columns={tableColumns}
                      loading={isLoading}
                      actions={tableActions}
                      emptyState="No payments found."
                      customHeight="h-[calc(100vh-21.2rem)]"
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <KanbanView
                      data={payments.map((payment) => ({
                        ...payment,
                        id: payment._id,
                        title: payment.paymentCode || "N/A",
                        subtitle: formatDate(payment.transactionDate) || "N/A",
                      }))}
                      payments={payments}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No payments found."
                      viewMode={viewMode}
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
                  {renderFilterContent()}
                </FilterPopup>
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      {/* Details view popup */}
      <div>
        {isPopupOpen && selectedPayment && (
          <SidebarPopup
            title="Payment"
            payment={selectedPayment}
            onClose={() => setIsPopupOpen(null)}
          >
            {/* v1.0.1 <------------------------------------------ */}
            <PopupContent payment={selectedPayment} />
            {/* v1.0.1 ------------------------------------------> */}
          </SidebarPopup>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export default PaymentsTable;
