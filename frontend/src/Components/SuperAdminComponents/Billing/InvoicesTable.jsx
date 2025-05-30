import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";

import InvoiceDetailsModal from "./InvoiceDetailsModal";

import Header from "../../Shared/Header/Header.jsx";
import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function InvoicesTable() {
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

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [invoices] = useState([
    {
      id: "INV-001",
      tenantId: "TENANT-001",
      type: "subscription",
      price: 2000,
      discount: 500,
      totalAmount: 1500,
      amountPaid: 1500,
      outstandingAmount: 0,
      status: "paid",
      dueDate: "2025-07-01T00:00:00Z",
      startDate: "2025-06-01T00:00:00Z",
      endDate: "2025-07-01T00:00:00Z",
      lineItems: [
        {
          description: "Monthly Subscription - Enterprise Plan",
          amount: 2000,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-002",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-003",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-004",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-005",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-006",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-007",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-008",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-009",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-0010",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-0011",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-0012",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
    },
    {
      id: "INV-0013",
      tenantId: "TENANT-002",
      type: "custom",
      price: 3000,
      discount: 0,
      totalAmount: 3000,
      amountPaid: 1500,
      outstandingAmount: 1500,
      status: "partially_paid",
      dueDate: "2025-07-15T00:00:00Z",
      lineItems: [
        {
          description: "Custom Development Services",
          amount: 2000,
          quantity: 1,
          tax: 200,
        },
        {
          description: "Support Hours",
          amount: 800,
          quantity: 1,
          tax: 0,
        },
      ],
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

  const dataToUse = invoices;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((invoice) => {
      const fieldsToSearch = [invoice.id].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(invoice.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        invoice.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          invoice.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          invoice.CurrentExperience <= selectedFilters.experience.max);

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
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "paid":
        return "success";
      case "partially_paid":
        return "warning";
      case "pending":
        return "warning";
      case "overdue":
        return "error";
      case "failed":
        return "error";
      default:
        return "neutral";
    }
  };

  // const columns = [
  //   {
  //     field: "id",
  //     header: "Invoice ID",
  //     render: (row) => <span className="font-mono text-sm">{row.id}</span>,
  //   },
  //   {
  //     field: "type",
  //     header: "Type",
  //     render: (row) => (
  //       <div className="capitalize">
  //         {row.type.replace("_", " ")}
  //         {row.type === "subscription" && (
  //           <div className="text-xs text-gray-500">
  //             {formatDate(row.startDate)} - {formatDate(row.endDate)}
  //           </div>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     field: "totalAmount",
  //     header: "Amount",
  //     render: (row) => (
  //       <div>
  //         <div className="font-medium">{formatCurrency(row.totalAmount)}</div>
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
  //     field: "amountPaid",
  //     header: "Paid",
  //     render: (row) => (
  //       <div>
  //         <div>{formatCurrency(row.amountPaid)}</div>
  //         {row.outstandingAmount > 0 && (
  //           <div className="text-xs text-error-600">
  //             Outstanding: {formatCurrency(row.outstandingAmount)}
  //           </div>
  //         )}
  //       </div>
  //     ),
  //   },
  //   {
  //     field: "status",
  //     header: "Status",
  //     render: (row) => (
  //       <StatusBadge
  //         status={getStatusDisplay(row.status)}
  //         text={row.status.replace("_", " ").toUpperCase()}
  //       />
  //     ),
  //   },
  //   {
  //     field: "dueDate",
  //     header: "Due Date",
  //     render: (row) => formatDate(row.dueDate),
  //   },
  //   {
  //     field: "actions",
  //     header: "Actions",
  //     sortable: false,
  //     render: (row) => (
  //       <div className="flex space-x-2">
  //         <button
  //           className="p-2 text-primary-600 hover:text-primary-900 rounded-full hover:bg-primary-50"
  //           onClick={() => setSelectedInvoice(row)}
  //         >
  //           <AiOutlineEye size={18} />
  //         </button>
  //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //           <AiOutlineDownload size={18} />
  //         </button>
  //         <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //           <AiOutlineMail size={18} />
  //         </button>
  //         {row.status === "pending" && (
  //           <button className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50">
  //             <AiOutlineEdit size={18} />
  //           </button>
  //         )}
  //       </div>
  //     ),
  //   },
  // ];

  const tableColumns = [
    {
      key: "id",
      header: "Invoice ID",
      render: (value, row) => (
        <span className="font-mono text-sm">{row.id}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (value, row) => (
        <div className="capitalize">
          {row.type.replace("_", " ")}
          {row.type === "subscription" && (
            <div className="text-xs text-gray-500">
              {formatDate(row.startDate)} - {formatDate(row.endDate)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (value, row) => (
        <div>
          <div className="font-medium">{formatCurrency(row.totalAmount)}</div>
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
      key: "amountPaid",
      header: "Paid",
      render: (value, row) => (
        <div>
          <div>{formatCurrency(row.amountPaid)}</div>
          {row.outstandingAmount > 0 && (
            <div className="text-xs text-error-600">
              Outstanding: {formatCurrency(row.outstandingAmount)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge
          status={getStatusDisplay(row.status)}
          text={row?.status?.replace("_", " ").toUpperCase()}
        />
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (value, row) => formatDate(row.dueDate),
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
          <h2 className="text-lg font-medium text-gray-900">Invoices</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Invoices</div>
            <div className="text-xl font-semibold">{invoices.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Amount</div>
            <div className="text-xl font-semibold">
              {formatCurrency(
                invoices.reduce((sum, i) => sum + i.totalAmount, 0)
              )}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Outstanding</div>
            <div className="text-xl font-semibold text-error-600">
              {formatCurrency(
                invoices.reduce((sum, i) => sum + i.outstandingAmount, 0)
              )}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Collection Rate</div>
            <div className="text-xl font-semibold">
              {(
                (invoices.reduce((sum, i) => sum + i.amountPaid, 0) /
                  invoices.reduce((sum, i) => sum + i.totalAmount, 0)) *
                100
              ).toFixed(1)}
              %
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {/* Header and Tool bar */}
          <div className="md:mt-2 sm:mt-4 w-full">
            <main className="px-4">
              <div className="sm:px-0">
                <Header
                  title="Invoices"
                  onAddClick={() => navigate("/tenants/add")}
                  addButtonText="Create Invoice"
                />
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
                  searchPlaceholder="Search invoices..."
                  filterIconRef={filterIconRef}
                />
              </div>
            </main>
          </div>
        </div>

        {/* New table content */}
        <main>
          <div className="sm:px-0">
            {invoices.length === 0 ? (
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
                        emptyState="No invoices found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((candidate) => ({
                          ...invoices,
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
                        emptyState="No invoices found."
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

      {selectedInvoice && (
        <InvoiceDetailsModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
}

export default InvoicesTable;
