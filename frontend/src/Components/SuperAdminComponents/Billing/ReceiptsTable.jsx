import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";
import ReceiptDetailsModal from "./ReceiptDetailsModal";

import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function ReceiptsTable() {
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

  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [receipts] = useState([
    {
      id: "RCP-001",
      invoiceId: "INV-001",
      tenantId: "TENANT-001",
      amount: 1500,
      price: 2000,
      discount: 500,
      paymentMethod: "card",
      transactionId: "TXN-001",
      status: "success",
      paymentDate: "2025-06-01T10:00:00Z",
    },
    {
      id: "RCP-002",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-003",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-004",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-005",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-006",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-007",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-008",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-009",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-0010",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-0011",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-0012",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
    },
    {
      id: "RCP-0013",
      invoiceId: "INV-002",
      tenantId: "TENANT-002",
      amount: 2000,
      price: 2000,
      discount: 0,
      paymentMethod: "bank_transfer",
      transactionId: "TXN-002",
      status: "pending",
      paymentDate: "2025-06-02T09:00:00Z",
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

  const dataToUse = receipts;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((receipt) => {
      const fieldsToSearch = [receipt.id].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(receipt.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        receipt.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          receipt.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          receipt.CurrentExperience <= selectedFilters.experience.max);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // const columns = [
  //   {
  //     field: "id",
  //     header: "Receipt ID",
  //     render: (row) => <span className="font-mono text-sm">{row.id}</span>,
  //   },
  //   {
  //     field: "invoiceId",
  //     header: "Invoice ID",
  //     render: (row) => (
  //       <span className="font-mono text-sm">{row.invoiceId}</span>
  //     ),
  //   },
  //   {
  //     field: "amount",
  //     header: "Amount",
  //     render: (row) => (
  //       <div>
  //         <div className="font-medium">{formatCurrency(row.amount)}</div>
  //         {row.discount > 0 && (
  //           <div className="text-xs">
  //             <span className="text-gray-500">
  //               Original: {formatCurrency(row.price)}
  //             </span>
  //             <span className="text-success-600 ml-2">
  //               -{formatCurrency(row.discount)}
  //             </span>
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
  //         status={row.status === "success" ? "success" : "warning"}
  //         text={row.status.toUpperCase()}
  //       />
  //     ),
  //   },
  //   {
  //     field: "paymentDate",
  //     header: "Payment Date",
  //     render: (row) => formatDate(row.paymentDate),
  //   },
  //   {
  //     field: "actions",
  //     header: "Actions",
  //     sortable: false,
  //     render: (row) => (
  //       <div className="flex space-x-2">
  //         <button
  //           className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
  //           onClick={() => setSelectedReceipt(row)}
  //         >
  //           <AiOutlineEye size={18} />
  //         </button>
  //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //           <AiOutlineDownload size={18} />
  //         </button>
  //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //           <AiOutlineMail size={18} />
  //         </button>
  //       </div>
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "id",
      header: "Receipt ID",
      render: (vale, row) => (
        <span className="font-mono text-sm">{row.id}</span>
      ),
    },
    {
      key: "invoiceId",
      header: "Invoice ID",
      render: (value, row) => (
        <span className="font-mono text-sm">{row.invoiceId}</span>
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
        <div className="capitalize">{row.paymentMethod.replace("_", " ")}</div>
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
          <h2 className="text-lg font-medium text-gray-900">Receipts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Receipts</div>
            <div className="text-xl font-semibold">{receipts.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold">
              {formatCurrency(receipts.reduce((sum, r) => sum + r.amount, 0))}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Discounts</div>
            <div className="text-xl font-semibold text-success-600">
              {formatCurrency(receipts.reduce((sum, r) => sum + r.discount, 0))}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Success Rate</div>
            <div className="text-xl font-semibold">
              {(
                (receipts.filter((r) => r.status === "success").length /
                  receipts.length) *
                100
              ).toFixed(1)}
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
            {receipts.length === 0 ? (
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
                        emptyState="No receipts found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((candidate) => ({
                          ...receipts,
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
                        emptyState="No receipts found."
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
      {selectedReceipt && (
        <ReceiptDetailsModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
}

export default ReceiptsTable;
