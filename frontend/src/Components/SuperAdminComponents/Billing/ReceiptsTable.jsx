// v1.0.0 - Ashok - Disabled outer scrollbar when the popup is open
// v1.0.1 - Ashok - Adjusted table heght and style issues

import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
// import ReceiptDetailsModal from "./ReceiptDetailsModal";

import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
// import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/SuperAdminComponents/Billing/Receipt/Kanban.jsx";
import {
  Eye,
  Mail,
  Download,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

// import axios from "axios";
// import { config } from "../../../config.js";
import SidebarPopup from "../SidebarPopup/SidebarPopup.jsx";
import {
  useReceipts,
  useReceiptById,
} from "../../../apiHooks/superAdmin/useReceipts";
// v1.0.0 <-------------------------------------------------------------------------
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.0 -------------------------------------------------------------------------

function ReceiptsTable({ organizationId, viewMode }) {
  const [view, setView] = useState("table");
  // const [selectedCandidate, setSelectedCandidate] = useState(null);
  // const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
  // const [showAddForm, setShowAddForm] = useState(false);
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
  // const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  // const [receipts, setReceipts] = useState([]);

  const [selectedStatus, setSelectedStatus] = useState([]);

  const rowsPerPage = 10;
  const toApiReceiptStatus = (arr) => arr.join(",");
  const { receipts, pagination, stats, isLoading } = useReceipts({
    page: currentPage,
    limit: rowsPerPage,
    search: searchQuery,
    status: toApiReceiptStatus(selectedStatus),
    tenantId: organizationId || "",
    organizationId
  }); // from apiHooks
  const { receipt: selectedReceipt } = useReceiptById(selectedReceiptId); // from apiHooks

  const handleCurrentStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const [isCurrentStatusOpen, setIsCurrentStatusOpen] = useState(false);
  const [selectedCurrentStatus, setCurrentStatus] = useState("active");
  const [isPopupOpen, setIsPopupOpen] = useState(false);

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

  // Get Receipts API
  // useEffect(() => {
  //   const getReceiptsSummary = async () => {
  //     try {
  //       setIsLoading(true);

  //       const endpoint = organizationId
  //         ? `${config.REACT_APP_API_URL}/receipts/${organizationId}`
  //         : `${config.REACT_APP_API_URL}/receipts`;

  //       const response = await axios.get(endpoint);
  //       setReceipts(response.data.receipts);
  //     } catch (error) {
  //       console.error("Error fetching receipts:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   getReceiptsSummary();
  // }, [organizationId]);

  // Get Receipt by ID
  // useEffect(() => {
  //   const getPaymentById = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/receipts/receipt/${selectedReceiptId}`
  //       );
  //       setSelectedReceipt(response.data);
  //     } catch (error) {
  //       console.error("Error fetching internal logs:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   if (selectedReceiptId) {
  //     getPaymentById();
  //   }
  // }, [selectedReceiptId]);

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

  const dataToUse = receipts;

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const tableColumns = [
    {
      key: "id",
      header: "Receipt ID",
      render: (vale, row) => (
        <span
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => {
            setSelectedReceiptId(row._id);
            setIsPopupOpen(true);
          }}
        >
          {row.receiptCode ? row.receiptCode : "N/A"}
        </span>
      ),
    },
    {
      key: "invoiceId",
      header: "Invoice ID",
      render: (value, row) => (
        <span className="text-sm">
          {row?.invoiceId ? row?.invoiceId?.invoiceCode : "N/A"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (value, row) => (
        <div>
          <div className="font-medium">{formatCurrency(row.amount)}</div>
          {row.discount > 0 && (
            <div className="text-xs">
              <span className="text-gray-500">
                Original: {formatCurrency(row.price)}
              </span>
              <span className="text-success-600 ml-2">
                -{formatCurrency(row.discount)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "paymentMethod",
      header: "Payment Method",
      render: (value, row) => (
        <div className="capitalize">
          {row?.paymentMethod?.replace("_", " ")}
        </div>
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
      key: "paymentDate",
      header: "Payment Date",
      render: (value, row) => formatDate(row.paymentDate),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedReceiptId(row._id);
        setIsPopupOpen(true);
      },
    },
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
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
      key: "paymentMethod",
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
        setSelectedReceiptId(row._id);
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

  // Render Filter Content
  const renderFilterContent = () => {
    // filters options
    const statusOptions = ["success", "pending", "failed"];

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

  // Render Popup content
  // v1.0.0 <-------------------------------------------------------------------------
  const PopupContent = ({ receipt }) => {
    useScrollLock(true);
    // v1.0.0 ------------------------------------------------------------------------->
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                    {receipt?.receiptCode?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                  receipt?.Status === 'active' ? 'bg-green-100 text-green-800' :
                  receipt?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {receipt?.Status ? receipt?.Status.charAt(0).toUpperCase() + receipt?.Status.slice(1) : "?"}
  
                </span> */}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {receipt?.receiptCode ? receipt.receiptCode : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {formatDate(receipt?.paymentDate) || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500">
                      Receipt Information
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice ID</span>
                        <span className="font-mono">
                          {receipt.receiptCode || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">
                          {formatCurrency(receipt.amount) || "N/A"}
                        </span>
                      </div>
                      {receipt.discount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Original Price
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(receipt.price) || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="text-success-600">
                              -{formatCurrency(receipt.discount) || "N/A"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-500">
                      Payment Details
                    </h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="capitalize">
                          {receipt.paymentMethod.replace("_", " ") || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono">
                          {receipt.transactionId || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date</span>
                        <span>{formatDate(receipt.paymentDate) || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge
                          status={receipt.status}
                          text={receipt?.status?.toUpperCase()}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Receipt Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatCurrency(receipt.price) || "N/A"}</span>
                    </div>
                    {receipt.discount > 0 && (
                      <div className="flex justify-between text-success-600">
                        <span>Discount</span>
                        <span>
                          -{formatCurrency(receipt.discount) || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <span>Total Paid</span>
                  <span>{formatCurrency(receipt.amount) || "N/A"}</span>
                </div>

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
          <h2 className="text-xl font-semibold text-custom-blue">Receipts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Receipts</div>
            <div className="text-xl font-semibold">{stats?.totalReceipts ?? receipts?.length ?? 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold">{formatCurrency(stats?.totalAmount ?? receipts?.reduce((sum, r) => sum + (r.amount || 0), 0)) || 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Discounts</div>
            <div className="text-xl font-semibold text-success-600">{formatCurrency(stats?.totalDiscount ?? receipts?.reduce((sum, r) => sum + (r.discount || 0), 0)) || 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success Rate</div>
            <div className="text-xl font-semibold">{typeof stats?.successRate === "number" ? stats.successRate.toFixed(1) : (receipts.length !== 0 ? ((receipts.filter((r) => r.status === "success").length / receipts.length) * 100).toFixed(1) : 0)}%</div>
          </div>
        </div>

        {/* Toolbar */}
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
            searchPlaceholder="Search receipts..."
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
                      data={receipts}
                      columns={tableColumns}
                      loading={isLoading}
                      actions={tableActions}
                      emptyState="No receipts found."
                      customHeight="h-[calc(100vh-21.2rem)]"
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <KanbanView
                      data={receipts.map((payment) => ({
                        ...payment,
                        id: payment._id,
                        title: payment.receiptCode || "N/A",
                        subtitle: formatDate(payment.paymentDate) || "N/A",
                      }))}
                      receipts={receipts}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No receipts found."
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
        {isPopupOpen && selectedReceipt && (
          <SidebarPopup title="Receipt" onClose={() => setIsPopupOpen(false)}>
            {/* v1.0.0 <---------------------------------------------------------- */}
            <PopupContent receipt={selectedReceipt} />
            {/* v1.0.0 ----------------------------------------------------------> */}
          </SidebarPopup>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export default ReceiptsTable;
