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
  UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  AiOutlineDownload,
  AiOutlineMail,
  // AiOutlineCreditCard,
  // AiOutlineBank,
  // AiOutlineUser,
  // AiOutlineKey,
  // AiOutlineShop,
} from "react-icons/ai";
import axios from "axios";
import { config } from "../../../config.js";
import SidebarPopup from "../SidebarPopup/SidebarPopup.jsx";

function ReceiptsTable({ organizationId }) {
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
  const [isLoading, setIsLoading] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);
  const [receipts, setReceipts] = useState([]);

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
  useEffect(() => {
    const getReceiptsSummary = async () => {
      try {
        setIsLoading(true);

        const endpoint = organizationId
          ? `${config.REACT_APP_API_URL}/receipts/${organizationId}`
          : `${config.REACT_APP_API_URL}/receipts`;

        const response = await axios.get(endpoint);
        setReceipts(response.data.receipts);
      } catch (error) {
        console.error("Error fetching receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getReceiptsSummary();
  }, [organizationId]);

  // Get Receipt by ID
  useEffect(() => {
    const getPaymentById = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/receipts/receipt/${selectedReceiptId}`
        );
        setSelectedReceipt(response.data);
      } catch (error) {
        console.error("Error fetching internal logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedReceiptId) {
      getPaymentById();
    }
  }, [selectedReceiptId]);

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

  const dataToUse = receipts;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((receipt) => {
      const fieldsToSearch = [receipt.id ? receipt.id : receipt._id].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(receipt.status);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const tableColumns = [
    {
      key: "id",
      header: "Receipt ID",
      render: (vale, row) => (
        <span className="text-sm font-medium text-custom-blue cursor-pointer">
          {row.receiptCode ? row.receiptCode : "N/A"}
        </span>
      ),
    },
    {
      key: "invoiceId",
      header: "Invoice ID",
      render: (value, row) => (
        <span className="font-mono text-sm">
          {row?.invoiceCode ? row.invoiceCode : "N/A"}
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
        <StatusBadge
          status={row.status === "success" ? "success" : "warning"}
          text={row.status.toUpperCase()}
        />
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
  const kanbanColumns = [];

  // Render Actions for Kanban
  const renderKanbanActions = (item, { onView, onEdit, onResendLink }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedReceiptId(item._id);
          setIsPopupOpen(true);
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

  // Render Filter Content
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

  // Render Popup content
  const renderPopupContent = (receipt) => {
    return (
      <div className="px-4">
        <div className="rounded-sm px-4 w-full">
          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              <div className="flex justify-center items-center  gap-4 mb-4">
                <div className="relative">
                  {receipt?.ImageData ? (
                    <img
                      src={`http://localhost:5000/${receipt?.ImageData?.path}`}
                      alt={receipt?.FirstName || receipt?.firstName}
                      onError={(e) => {
                        e.target.src = "/default-profile.png";
                      }}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-custom-blue flex items-center justify-center text-white text-3xl font-semibold shadow-lg">
                      {receipt?.firstName?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                  )}
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
                    {receipt?.firstName ? receipt.firstName : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {receipt?.CurrentRole || "position"}
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
                        <span className="font-mono">{receipt.invoiceId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-medium">
                          {formatCurrency(receipt.amount)}
                        </span>
                      </div>
                      {receipt.discount > 0 && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Original Price
                            </span>
                            <span className="text-gray-500">
                              {formatCurrency(receipt.price)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="text-success-600">
                              -{formatCurrency(receipt.discount)}
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
                          {receipt.paymentMethod.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-mono">
                          {receipt.transactionId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Date</span>
                        <span>{formatDate(receipt.paymentDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <StatusBadge
                          status={
                            receipt.status === "success" ? "success" : "warning"
                          }
                          text={receipt.status.toUpperCase()}
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
                      <span>{formatCurrency(receipt.price)}</span>
                    </div>
                    {receipt.discount > 0 && (
                      <div className="flex justify-between text-success-600">
                        <span>Discount</span>
                        <span>-{formatCurrency(receipt.discount)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <span>Total Paid</span>
                  <span>{formatCurrency(receipt.amount)}</span>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="mt-6 flex justify-end space-x-3">
                    <button className="btn-secondary flex items-center">
                      <AiOutlineDownload className="mr-2" />
                      Download Receipt
                    </button>
                    <button className="btn-secondary flex items-center">
                      <AiOutlineMail className="mr-2" />
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
    <div className="space-y-6">
      <div className="absolute md:mt-2 sm:mt-4 top-2 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4">
          <h2 className="text-lg font-medium text-custom-blue">Receipts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Receipts</div>
            <div className="text-xl font-semibold">{receipts?.length || 0}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold">
              {formatCurrency(
                receipts?.reduce((sum, r) => sum + r.amount, 0)
              ) || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Discounts</div>
            <div className="text-xl font-semibold text-success-600">
              {formatCurrency(
                receipts?.reduce((sum, r) => sum + r.discount, 0)
              ) || 0}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success Rate</div>
            <div className="text-xl font-semibold">
              {receipts.length !== 0
                ? (
                    (receipts.filter((r) => r.status === "success").length /
                      receipts.length) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
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
                  <div className="w-full">
                    <TableView
                      data={currentFilteredRows}
                      columns={tableColumns}
                      loading={isLoading}
                      actions={tableActions}
                      emptyState="No receipts found."
                    />
                  </div>
                ) : (
                  <div className="w-full">
                    <KanbanView
                      receipts={currentFilteredRows.map((receipt) => ({
                        ...receipts,
                        _id: receipt._id,
                        title: `${receipt._id || ""}`,
                        subtitle:
                          receipt.CurrentRole ||
                          receipt.CurrentExperience ||
                          "N/A",
                        status: receipt.status,
                      }))}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No receipts found."
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
            {renderPopupContent(selectedReceipt)}
          </SidebarPopup>
        )}
      </div>
      <Outlet />
    </div>
  );
}

export default ReceiptsTable;
