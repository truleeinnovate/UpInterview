// v1.0.0 - Ashok - Disabled outer scrollbar when the popup is open
import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../common/StatusBadge.jsx";

// import InvoiceDetailsModal from "./InvoiceDetailsModal";

// import Header from "../../Shared/Header/Header.jsx";
import Toolbar from "../../Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Shared/FilterPopup/FilterPopup.jsx";
// import Loading from "../Loading/Loading.jsx";
import { motion } from "framer-motion";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../../Components/SuperAdminComponents/Billing/Invoice/Kanban.jsx";
import {
  Eye,
  // Mail,
  // UserCircle,
  Pencil,
  ChevronUp,
  ChevronDown,
  // Phone,
  // GraduationCap,
  // School,
  // ExternalLink,
  // X,
  // Briefcase,
  // User,
  // Calendar,
} from "lucide-react";
// import { LiaGenderlessSolid } from "react-icons/lia";
// import {
//   AiOutlineDownload,
//   AiOutlineMail,
//   AiOutlineEdit,
// } from "react-icons/ai";
// import axios from "axios";
// import { config } from "../../../config.js";
import AddInvoiceForm from "./Invoice/AddInvoiceForm.jsx";
import SidebarPopup from "../SidebarPopup/SidebarPopup.jsx";
import {
  useInvoices,
  useInvoiceById,
} from "../../../apiHooks/superAdmin/useInvoices.js";
// v1.0.0 <-------------------------------------------------------------------------
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock.js";
// v1.0.0 -------------------------------------------------------------------------


function InvoicesTable({ organizationId, viewMode }) {
  const [view, setView] = useState("table");
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
  // const [isLoading, setIsLoading] = useState(false);

  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  // const [invoices, setInvoices] = useState([]);
  const { invoices, isLoading } = useInvoices(organizationId); // from apiHooks
  const { invoice: selectedInvoice } = useInvoiceById(selectedInvoiceId); // from apiHooks

  // Kanban view setter
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

  // Invoices API Call
  // useEffect(() => {
  //   const getInvoices = async () => {
  //     try {
  //       setIsLoading(true);
  //       const endpoint = organizationId
  //         ? `${config.REACT_APP_API_URL}/invoices/${organizationId}`
  //         : `${config.REACT_APP_API_URL}/invoices`;

  //       const response = await axios.get(endpoint);
  //       setInvoices(response.data.invoices);
  //     } catch (error) {
  //       console.error("Error fetching invoices:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   getInvoices();
  // }, [organizationId]);

  // Get invoice by ID
  // useEffect(() => {
  //   const getInvoice = async () => {
  //     try {
  //       setIsLoading(true);
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/invoices/invoice/${selectedInvoiceId}`
  //       );
  //       setSelectedInvoice(response.data);
  //     } catch (error) {
  //       console.error("Error fetching invoice:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   if (selectedInvoiceId) {
  //     getInvoice();
  //   }
  // }, [selectedInvoiceId]);

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

  const dataToUse = invoices;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((invoice) => {
      const fieldsToSearch = [
        invoice?.invoiceCode ? invoice?.invoiceCode : invoice?.invoiceCode,
        invoice?.status ? invoice?.status : invoice?.status,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(invoice.status);

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
    return new Date(dateString).toLocaleDateString();
  };

  // const getStatusDisplay = (status) => {
  //   switch (status) {
  //     case "paid":
  //       return "success";
  //     case "partially_paid":
  //       return "warning";
  //     case "pending":
  //       return "warning";
  //     case "overdue":
  //       return "error";
  //     case "failed":
  //       return "error";
  //     default:
  //       return "neutral";
  //   }
  // };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const tableColumns = [
    {
      key: "invoiceCode",
      header: "Invoice ID",
      render: (value, row) => (
        <span
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => {
            setSelectedInvoiceId(row._id);
            setIsPopupOpen(true);
          }}
        >
          {row.invoiceCode ? row.invoiceCode : "N/A"}
        </span>
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
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
      ),
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (value, row) => formatDate(row.dueDate) || "N/A",
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        setSelectedInvoiceId(row._id);
        setIsPopupOpen(true);
      },
    },
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/admin-billing/${row._id}`),
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
      key: "totalAmount",
      header: "Total Amount",
      render: (value) => (
        <div className="font-medium">{formatCurrency(value)}</div>
      ),
    },
    {
      key: "amountPaid",
      header: "Paid",
      render: (value) => <div>{formatCurrency(value)}</div>,
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
        setSelectedInvoiceId(row._id);
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
    // filter options
    const statusOptions = [
      "paid",
      "partially Paid",
      "assigned",
      "pending",
      "overdue",
      "cancelled",
    ];

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
  const PopupContent = ({invoice}) => {
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
                    {invoice?.invoiceCode?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* <span className={`absolute -bottom-2 right-0 px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                invoice?.Status === 'active' ? 'bg-green-100 text-green-800' :
                invoice?.Status === 'onhold' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {invoice?.Status ? invoice?.Status.charAt(0).toUpperCase() + invoice?.Status.slice(1) : "?"}

              </span> */}
                </div>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {invoice?.invoiceCode ? invoice.invoiceCode : "N/A"}
                  </h3>

                  <p className="text-gray-600 mt-1">
                    {formatDate(invoice?.dueDate) || "N/A"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Invoice Details
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div>
                          {/* <h4 className="text-sm font-medium text-gray-500">
                            Invoice Information
                          </h4> */}
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type</span>
                              <span className="capitalize">
                                {invoice?.type?.replace("_", " ")}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status</span>
                              <StatusBadge
                                status={
                                  invoice.status === "paid"
                                    ? "success"
                                    : invoice.status === "partially_paid"
                                    ? "warning"
                                    : invoice.status === "overdue"
                                    ? "error"
                                    : "warning"
                                }
                                text={invoice?.status
                                  ?.replace("_", " ")
                                  .toUpperCase()}
                              />
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Due Date</span>
                              <span>{formatDate(invoice.dueDate)}</span>
                            </div>
                            {invoice.type === "subscription" && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Subscription Period
                                </h4>
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      Start Date
                                    </span>
                                    <span>{formatDate(invoice.startDate)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">
                                      End Date
                                    </span>
                                    <span>{formatDate(invoice.endDate)}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                      Payment Summary
                    </h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          {/* <h4 className="text-sm font-medium text-gray-900 mb-4">
                            Payment Summary
                          </h4> */}
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Total Amount
                              </span>
                              <span>
                                {formatCurrency(invoice?.totalAmount)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Amount Paid</span>
                              <span>{formatCurrency(invoice?.amountPaid)}</span>
                            </div>
                            {invoice?.outstandingAmount > 0 && (
                              <div className="flex justify-between text-error-600 font-medium">
                                <span>Outstanding Amount</span>
                                <span>
                                  {formatCurrency(invoice?.outstandingAmount)}
                                </span>
                              </div>
                            )}
                            {invoice?.discount > 0 && (
                              <div className="flex justify-between text-success-600">
                                <span>Discount Applied</span>
                                <span>
                                  -{formatCurrency(invoice?.discount)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">
                    Line Items
                  </h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Description
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Quantity
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Tax
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {invoice?.lineItems?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.description}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right">
                              {formatCurrency(item.amount)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-right">
                              {formatCurrency(item.tax)}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                              {formatCurrency(
                                item.amount * item.quantity + item.tax
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
    <div className="space-y-6 min-h-screen">
      <div className="absolute md:mt-2 sm:mt-4 top-2 left-0 right-0 bg-background">
        <div className="flex justify-between items-center px-4 mb-4">
          <h2 className="text-lg font-medium text-custom-blue">Invoices</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Invoices</div>
            <div className="text-xl font-semibold">{invoices?.length || 0}</div>
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
              {invoices.length !== 0
                ? (
                    (invoices.reduce((sum, i) => sum + i.amountPaid, 0) /
                      invoices.reduce((sum, i) => sum + i.totalAmount, 0)) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          {/* Header and Tool bar */}
          <div className="md:mt-2 sm:mt-4 w-full">
            <main className="px-4">
              <div className="sm:px-0">
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
                      data={currentFilteredRows.map((invoice) => ({
                        ...invoice,
                        id: invoice._id,
                        title: invoice.invoiceCode || "N/A",
                        subtitle: invoice.type || "N/A",
                      }))}
                      invoices={invoices}
                      columns={kanbanColumns}
                      loading={isLoading}
                      renderActions={renderKanbanActions}
                      emptyState="No invoices found."
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
        {isPopupOpen && selectedInvoice && (
          <SidebarPopup
            title="Invoice"
            invoice={selectedInvoice}
            onClose={() => setIsPopupOpen(false)}
          >
            {/* v1.0.1 <------------------------------------------ */}
            <PopupContent invoice={selectedInvoice} />
            {/* v1.0.1 ------------------------------------------> */}
          </SidebarPopup>
        )}
      </div>

      {showAddForm && (
        <AddInvoiceForm
          isOpen={showAddForm}
          onClose={() => {
            setShowAddForm(false);
            setSelectedInvoiceId(null);
            setEditModeOn(false);
          }}
          selectedInvoice={selectedInvoice}
          isEdit={editModeOn}
        />
      )}
      <Outlet />
    </div>
  );
}

export default InvoicesTable;
