import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
import PaymentDetailsModal from "./PaymentDetailsModal";

import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function PaymentsTable() {
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
    tech: [],
    experience: { min: "", max: "" },
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null); // Ref for filter icon
  const [isLoading, setIsLoading] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [payments] = useState([
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

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.tech.length > 0 ||
        filters.experience.min ||
        filters.experience.max
    );
  };

  const dataToUse = payments;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((payment) => {
      const fieldsToSearch = [payment.id].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(payment.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        payment.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          payment.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          payment.CurrentExperience <= selectedFilters.experience.max);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return (
        matchesSearchQuery && matchesStatus && matchesTech && matchesExperience
      );
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

  // const columns = [
  //   {
  //     field: "id",
  //     header: "Payment ID",
  //     render: (row) => <span className="font-mono text-sm">{row.id}</span>,
  //   },
  //   {
  //     field: "amount",
  //     header: "Amount",
  //     render: (row) => (
  //       <div className="font-medium">
  //         {formatCurrency(row.amount, row.currency)}
  //         {row.isRecurring && (
  //           <div className="text-xs text-gray-500">
  //             Recurring • {row.billingCycle}
  //           </div>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     field: "paymentMethod",
  //     header: "Payment Method",
  //     render: (row) => (
  //       <div className="capitalize">{row.paymentMethod.replace("_", " ")}</div>
  //     ),
  //   },
  //   {
  //     field: "status",
  //     header: "Status",
  //     render: (row) => (
  //       <StatusBadge
  //         status={getStatusDisplay(row.status)}
  //         text={row.status.toUpperCase()}
  //       />
  //     ),
  //   },
  //   {
  //     field: "transactionDate",
  //     header: "Transaction Date",
  //     render: (row) => formatDate(row.transactionDate),
  //   },
  //   {
  //     field: "paidAt",
  //     header: "Paid At",
  //     render: (row) => (row.paidAt ? formatDate(row.paidAt) : "-"),
  //   },
  //   {
  //     field: "actions",
  //     header: "Actions",
  //     sortable: false,
  //     render: (row) => (
  //       <div className="flex space-x-2">
  //         <button
  //           className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
  //           onClick={() => setSelectedPayment(row)}
  //         >
  //           <AiOutlineEye size={18} />
  //         </button>
  //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //           <AiOutlineDownload size={18} />
  //         </button>
  //         {row.status === "pending" && (
  //           <button className="p-2 text-warning-600 hover:text-warning-900 rounded-full hover:bg-warning-50">
  //             <AiOutlineSync size={18} />
  //           </button>
  //         )}
  //       </div>
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "id",
      header: "Payment ID",
      render: (value, row) => (
        <span className="font-mono text-sm">{row.id}</span>
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
        <div className="capitalize">{row.paymentMethod.replace("_", " ")}</div>
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
      onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    },
    {
      key: "360-view",
      label: "360° View",
      icon: <UserCircle className="w-4 h-4 text-purple-600" />,
      onClick: (row) => row?._id && navigate(`/candidate/${row._id}`),
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
          <h2 className="text-lg font-medium text-gray-900">Payments</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Payments</div>
            <div className="text-xl font-semibold">{payments.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Successful</div>
            <div className="text-xl font-semibold text-success-600">
              {payments.filter((p) => p.status === "captured").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold text-warning-600">
              {payments.filter((p) => p.status === "pending").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Failed</div>
            <div className="text-xl font-semibold text-error-600">
              {payments.filter((p) => p.status === "failed").length}
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
            {payments.length === 0 ? (
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
                        data={currentFilteredRows.map((candidate) => ({
                          ...payments,
                          id: candidate.id,
                          title: `${candidate.FirstName || ""} ${
                            candidate.LastName || ""
                          }`,
                          subtitle:
                            candidate.CurrentRole ||
                            candidate.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: "active",
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No payments found."
                      />
                    </div>
                  )}

                  <FilterPopup
                    isOpen={isFilterPopupOpen}
                    onClose={() => setFilterPopupOpen(false)}
                    onApply={handleFilterChange}
                    initialFilters={selectedFilters}
                    filterIconRef={filterIconRef}
                  />
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
    </div>
  );
}

export default PaymentsTable;
