// v1.0.0  - mansoor - center the loading in vertically it is horizontally center previously itself
// v1.0.1  - Ashok   - modified in the table columns as clicking invoice ID can open view details popup
// v1.0.2  - Ashok   - fixed style issues
// v1.0.3  - Ashok   - fixed responsiveness issue at kanban loading view
// v1.0.4  - Ashok   - changed loading view of both table and kanban views
// v1.0.5  - Ashok   - changed check box color to brand color in filters
// v1.0.6  - Ashok   - added common code for kanban
// v1.0.7  - Ashok   - added clickable title to navigate to details page at kanban
// v1.0.8  - Ashok   - fixed style issues
// v1.0.9 -  Ashok   - fixed filter popup height issue

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FileText,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
} from "lucide-react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, Outlet } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { config } from "../../../../config";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
// import InvoiceKanban from "./InvoiceKanban";
import InvoiceKanban from "../../../../Components/Shared/KanbanCommon/KanbanCommon";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { formatDateTime } from "../../../../utils/dateFormatter";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage.js";

// v1.0.6 <----------------------------------------------------------------------------
const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  // Call the function to get actions array for this item
  const actions = kanbanActions(item);
  const mainActions = actions.filter((a) => ["view", "edit"].includes(a.key));
  const overflowActions = actions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsKanbanMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {/* {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item, e);
          }}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title={action.label}
        >
          {action.icon}
        </button>
      ))} */}

      {mainActions.map((action) => {
        const baseClasses =
          "p-1.5 rounded-lg transition-colors hover:bg-opacity-20";
        const bgClass =
          action.key === "view"
            ? "text-custom-blue hover:bg-custom-blue/10"
            : action.key === "edit"
            ? "text-green-600 hover:bg-green-600/10"
            : "text-blue-600 bg-green-600/10";

        return (
          <button
            key={action.key}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(item, e);
            }}
            className={`${baseClasses} ${bgClass}`}
            title={action.label}
          >
            {action.icon}
          </button>
        );
      })}

      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen((prev) => !prev);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="More"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isKanbanMoreOpen && (
            <div
              className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              onClick={(e) => e.stopPropagation()}
            >
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item, e);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  title={action.label}
                >
                  {action.icon && (
                    <span className="mr-2 w-4 h-4 text-gray-500">
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
// v1.0.6 ---------------------------------------------------------------------------->

const InvoiceTab = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [billingData, setBillingData] = useState([]);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;
  const ownerId = tokenPayload?.userId;
  // Add this near your other useState declarations
  const [paginationData, setPaginationData] = useState({
    total: 0,
    currentPage: 0,
    totalPages: 1,
    limit: 10,
  });
  const rowsPerPage = 10; // Keep this as default

  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(true);
  const [isTypeOpen, setIsTypeOpen] = useState(true);
  const [isAmountOpen, setIsAmountOpen] = useState(true);

  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [amountRange, setAmountRange] = useState({ min: "", max: "" });

  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    type: [],
    amount: { min: "", max: "" },
  });

  // const fetchInvoiceData = useCallback(async () => {
  //   setLoading(true);
  //   try {
  //     // Determine the ID and query parameter based on organization flag
  //     const id = organization ? tenantId : ownerId;
  //     const endpoint = `${config.REACT_APP_API_URL}/invoices/get-invoice/${id}?isOrganization=${organization}`;

  //     // Fetch invoice data from API
  //     const Invoice_res = await axios.get(endpoint, {
  //       headers: { Authorization: `Bearer ${authToken}` },
  //     });

  //     const invoiceData = Invoice_res?.data || [];
  //     // Transform the data into a more usable structure
  //     const formattedData = invoiceData.map((invoice) => {
  //       const paymentId =
  //         invoice.paymentId ||
  //         `PMT-${invoice._id.toString().substring(18, 24)}-${Date.now()
  //           .toString()
  //           .substring(8)}`;
  //       return {
  //         id: invoice._id,
  //         paymentId,
  //         invoiceNumber: invoice.invoiceCode,
  //         customer: invoice.ownerId
  //           ? {
  //               id: invoice.ownerId._id,
  //               name:
  //                 invoice.ownerId.Name ||
  //                 `${invoice.ownerId.Firstname} ${
  //                   invoice.ownerId.Lastname || ""
  //                 }`.trim(),
  //               userId: invoice.ownerId.UserId,
  //             }
  //           : null,
  //         plan: invoice.planName,
  //         amount: {
  //           total: invoice.totalAmount,
  //           paid: invoice.amountPaid,
  //           outstanding: invoice.outstandingAmount,
  //           discount: invoice.discount,
  //         },
  //         dates: {
  //           createdAt: new Date(invoice.updatedAt),
  //           startDate: invoice.startDate ? new Date(invoice.startDate) : null,
  //           endDate: invoice.endDate ? new Date(invoice.endDate) : null,
  //           dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
  //         },
  //         status: invoice.status || "N/A",
  //         type: invoice.type || "N/A",
  //         comments: invoice.comments || "",
  //         lineItems: invoice.lineItems || [],
  //         tenantId: invoice.tenantId,
  //       };
  //     });

  //     setBillingData(formattedData.reverse());
  //   } catch (error) {
  //     console.error("Error fetching invoice data:", error);
  //   }
  //   setLoading(false);
  // }, [ownerId, tenantId, organization, authToken]);

  const fetchInvoiceData = useCallback(
    async (page = 1, appliedFilters = {}) => {
      setLoading(true);
      try {
        // Determine the ID and query parameter based on organization flag
        const id = organization ? tenantId : ownerId;

        // Build query parameters
        const queryParams = new URLSearchParams({
          isOrganization: organization,
          page: page,
          limit: rowsPerPage,
          ...(searchQuery && { search: searchQuery }),
          ...(appliedFilters.status?.length > 0 && {
            status: appliedFilters.status.join(","),
          }),
          ...(appliedFilters.type?.length > 0 && {
            type: appliedFilters.type.join(","),
          }),
          ...(appliedFilters.amount?.min && {
            minAmount: appliedFilters.amount.min,
          }),
          ...(appliedFilters.amount?.max && {
            maxAmount: appliedFilters.amount.max,
          }),
        });

        const endpoint = `${config.REACT_APP_API_URL}/invoices/get-invoice/${id}?${queryParams}`;

        // Fetch invoice data from API
        const Invoice_res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const { invoices: invoiceData, pagination } = Invoice_res?.data || {};

        console.log("Invoice Data:", invoiceData, pagination);

        // Transform the data into a more usable structure
        const formattedData = invoiceData.map((invoice) => {
          const paymentId =
            invoice.paymentId ||
            `PMT-${invoice._id.toString().substring(18, 24)}-${Date.now()
              .toString()
              .substring(8)}`;
          return {
            id: invoice._id,
            paymentId,
            invoiceNumber: invoice.invoiceCode,
            customer: invoice.ownerId
              ? {
                  id: invoice.ownerId._id,
                  name:
                    invoice.ownerId.Name ||
                    `${invoice.ownerId.Firstname} ${
                      invoice.ownerId.Lastname || ""
                    }`.trim(),
                  userId: invoice.ownerId.UserId,
                }
              : null,
            plan: invoice.planName,
            amount: {
              total: invoice.totalAmount,
              paid: invoice.amountPaid,
              outstanding: invoice.outstandingAmount,
              discount: invoice.discount,
            },
            dates: {
              createdAt: new Date(invoice.updatedAt),
              startDate: invoice.startDate ? new Date(invoice.startDate) : null,
              endDate: invoice.endDate ? new Date(invoice.endDate) : null,
              dueDate: invoice.dueDate ? new Date(invoice.dueDate) : null,
            },
            status: invoice.status || "N/A",
            type: invoice.type || "N/A",
            comments: invoice.comments || "",
            lineItems: invoice.lineItems || [],
            tenantId: invoice.tenantId,
          };
        });

        setBillingData(formattedData);

        // Update pagination state
        setPaginationData({
          total: pagination?.total || 0,
          currentPage: pagination?.page || 1,
          totalPages: pagination?.totalPages || 1,
          limit: pagination?.limit || rowsPerPage,
        });
      } catch (error) {
        console.error("Error fetching invoice data:", error);
        setBillingData([]);
        setPaginationData({
          total: 0,
          currentPage: 1,
          totalPages: 1,
          limit: rowsPerPage,
        });
      }
      setLoading(false);
    },
    [ownerId, tenantId, organization, authToken, searchQuery]
  );
  useEffect(() => {
    // Reset to page 1 when filters or search changes
    fetchInvoiceData(1, selectedFilters);
  }, [fetchInvoiceData, selectedFilters]);

  // Remove or modify the existing fetchInvoiceData useEffect

  // useEffect(() => {
  //   fetchInvoiceData();
  // }, [fetchInvoiceData]);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status);
      setSelectedTypes(selectedFilters.type);
      setAmountRange(selectedFilters.amount);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleAmountChange = (field, value) => {
    setAmountRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
      type: [],
      amount: { min: "", max: "" },
    };

    setSelectedStatus([]);
    setSelectedTypes([]);
    setAmountRange({ min: "", max: "" });

    setSelectedFilters(clearedFilters);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      status: selectedStatus,
      type: selectedTypes,
      amount: amountRange,
    };

    setSelectedFilters(filters);
    setIsFilterActive(
      filters.status.length > 0 ||
        filters.type.length > 0 ||
        filters.amount.min ||
        filters.amount.max
    );
    setFilterPopupOpen(false);

    // Reset to first page and fetch with new filters
    fetchInvoiceData(1, filters);
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

  // const FilteredData = () => {
  //   if (!Array.isArray(billingData)) return [];

  //   return billingData.filter((invoice) => {
  //     const matchesStatus =
  //       selectedFilters.status.length === 0 ||
  //       selectedFilters.status.includes(invoice.status?.toLowerCase());

  //     const matchesType =
  //       selectedFilters.type.length === 0 ||
  //       selectedFilters.type.includes(invoice.type?.toLowerCase());

  //     const matchesAmount =
  //       (!selectedFilters.amount.min ||
  //         invoice.amount.total >= parseFloat(selectedFilters.amount.min)) &&
  //       (!selectedFilters.amount.max ||
  //         invoice.amount.total <= parseFloat(selectedFilters.amount.max));

  //     const matchesSearch =
  //       !searchQuery ||
  //       invoice.paymentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       invoice.invoiceNumber
  //         ?.toLowerCase()
  //         .includes(searchQuery.toLowerCase()) ||
  //       invoice.status?.toLowerCase().includes(searchQuery.toLowerCase());

  //     return matchesStatus && matchesType && matchesAmount && matchesSearch;
  //   });
  // };

  // const rowsPerPage = 10;
  // const totalPages = Math.ceil(FilteredData().length / rowsPerPage);
  // const [currentPage, setCurrentPage] = useState(0);

  const nextPage = () => {
    if (paginationData.currentPage < paginationData.totalPages) {
      const nextPageNum = paginationData.currentPage + 1;
      fetchInvoiceData(nextPageNum, selectedFilters);
    }
  };

  const prevPage = () => {
    if (paginationData.currentPage > 1) {
      const prevPageNum = paginationData.currentPage - 1;
      fetchInvoiceData(prevPageNum, selectedFilters);
    }
  };

  // const nextPage = () => {
  //   if ((currentPage + 1) * rowsPerPage < FilteredData().length) {
  //     setCurrentPage(currentPage + 1);
  //   }
  // };

  // const prevPage = () => {
  //   if (currentPage > 0) {
  //     setCurrentPage(currentPage - 1);
  //   }
  // };

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, FilteredData().length);
  // const currentFilteredRows = FilteredData()
  //   .slice(startIndex, endIndex)
  //   .sort((a, b) => {
  //     const dateA = a.updatedAt ? new Date(a.updatedAt) : new Date(0);
  //     const dateB = b.updatedAt ? new Date(b.updatedAt) : new Date(0);
  //     return dateB - dateA;
  //   });

  // Remove this entire function:

  // Update the component to use billingData directly:
  const totalPages = paginationData.totalPages;
  // const currentPage = paginationData.currentPage - 1; // For display purposes
  const currentFilteredRows = billingData; // Use billingData directly

  // v1.0.6 <----------------------------------------------------------------------------------
  // const formatDate = (isoString) => {
  //   if (!isoString) return "";
  //   const date = new Date(isoString);
  //   return date.toLocaleString("en-GB", {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //     hour12: true,
  //   });
  // };

  // ------------------------- Dynamic Empty State Messages using Utility -----------------------
  const isSearchActive = searchQuery.length > 0 || isFilterActive;
  // Use the length of the raw data (before pagination) as the initial count
  const initialDataCount = billingData.length || 0;
  const currentFilteredCount = currentFilteredRows?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "invoices" // Entity Name
  );
  // ------------------------- Dynamic Empty State Messages using Utility -----------------------

  const tableColumns = [
    {
      key: "invoiceNumber",
      header: "Invoice Number",
      //   v1.0.1 <-------------------------------------------------------------------------
      //   render: (value) => value || "N/A",
      render: (value, row) => (
        <button
          className="text-custom-blue font-semibold hover:cursor-pointer"
          onClick={() =>
            navigate(`details/${row.id}`, { state: { invoiceData: row } })
          }
        >
          {value || "N/A"}
        </button>
      ),
      //   v1.0.1 ------------------------------------------------------------------------->
    },
    {
      key: "plan",
      header: "Plan",
      render: (value) => value || "N/A",
    },
    {
      key: "amount",
      header: "Amount",
      render: (value) => (value && value.total ? `₹${value.total}` : 0),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span className={`px-2 py-2 rounded-full text-xs `}>
          {value ? (
            <StatusBadge status={capitalizeFirstLetter(value)} />
          ) : (
            "N/A"
          )}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Created At",
      render: (value) =>
        value && value.createdAt ? formatDateTime(value.createdAt) : "N/A",
    },
  ];

  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <FileText className="w-4 h-4 text-custom-blue" />,
      onClick: (row) =>
        navigate(`details/${row.id}`, { state: { invoiceData: row } }),
    },
  ];

  const kanbanColumns = [
    {
      key: "invoiceNumber",
      header: "Invoice ID",
      render: (value, row) => (
        <span>{capitalizeFirstLetter(row?.invoiceNumber)}</span>
      ),
    },
    {
      key: "paymentService",
      header: "Payment Service",
      render: (value, row) => (
        <span className="text-gray-800 font-medium">
          {row?.type
            ? row?.type.charAt(0).toUpperCase() + row?.type.slice(1)
            : ""}
        </span>
      ),
    },
    {
      key: "endDate",
      header: "End Date",
      render: (value, row) => (
        <span className="text-gray-800 font-medium">
          {row?.dates?.endDate ? formatDateTime(row?.dates?.endDate) : "N/A"}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Total Amount",
      render: (value, row) => {
        return (
          <span className="text-gray-800 font-medium truncate">
            {row?.amount?.total ? `₹${row?.amount?.total}` : `0`}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span>
          <StatusBadge status={capitalizeFirstLetter(row?.status)} />
        </span>
      ),
    },
  ];

  const kanbanActions = () => [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) =>
        navigate(`details/${row.id}`, { state: { invoiceData: row } }),
    },
  ];
  // v1.0.6 ---------------------------------------------------------------------------------->

  return (
    // v1.0.4 <-------------------------------------------------------------------------------
    <div className="w-full min-h-screen border-0">
      <div className="fixed top-16 left-0 right-0">
        {/* v1.0.3 <------------------------------------------------- */}
        <main className="px-6 sm:mt-8 md:mt-8">
          {/* v1.0.3 <------------------------------------------------- */}
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
              currentPage={paginationData.currentPage - 1}
              totalPages={paginationData.totalPages}
              onPrevPage={prevPage}
              onNextPage={nextPage}
              onFilterClick={handleFilterIconClick}
              isFilterPopupOpen={isFilterPopupOpen}
              isFilterActive={isFilterActive}
              // dataLength={billingData.length}
              dataLength={paginationData.total}
              searchPlaceholder="Search by Status, Inv..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      <main className="flex items-center justify-center bg-background w-full">
        <div className="w-full overflow-auto">
          <motion.div className="w-full">
            <div className="relative w-full">
              {viewMode === "table" ? (
                <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={loading}
                    actions={tableActions}
                    emptyState={emptyStateMessage}
                  />
                </div>
              ) : (
                <div className="w-full">
                  <InvoiceKanban
                    loading={loading}
                    data={currentFilteredRows.map((invoice) => ({
                      ...invoice,
                      id: invoice?._id,
                      title: invoice?.paymentId,
                      subTitle: formatDateTime(invoice?.dates?.createdAt),
                    }))}
                    columns={kanbanColumns}
                    renderActions={(item) => (
                      <KanbanActionsMenu
                        item={item}
                        kanbanActions={kanbanActions}
                      />
                    )}
                    onTitleClick={(row) => {
                      navigate(`details/${row.id}`, {
                        state: { invoiceData: row },
                      });
                    }}
                    emptyState={emptyStateMessage}
                    kanbanTitle="Invoice"
                  />
                </div>
              )}
            </div>
          </motion.div>
        </div>
        <FilterPopup
          isOpen={isFilterPopupOpen}
          onClose={() => setFilterPopupOpen(false)}
          onApply={handleApplyFilters}
          onClearAll={handleClearAll}
          filterIconRef={filterIconRef}
          customHeight="h-[calc(100vh-16rem)]"
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
                  {["paid", "pending", "cancelled", "failed", "refunded"].map(
                    (status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatus.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          // v1.0.5 <--------------------------------------------------------------
                          className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 -------------------------------------------------------------->
                        />
                        <span className="text-sm capitalize">{status}</span>
                      </label>
                    )
                  )}
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
                  {["subscription", "wallet", "service", "one-time"].map(
                    (type) => (
                      <label key={type} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(type)}
                          onChange={() => handleTypeToggle(type)}
                          // v1.0.5 <-----------------------------------------------------------------
                          className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                          // v1.0.5 ----------------------------------------------------------------->
                        />
                        <span className="text-sm capitalize">{type}</span>
                      </label>
                    )
                  )}
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
                    <label className="block text-sm font-medium text-gray-700">
                      Min Amount
                    </label>
                    <input
                      type="number"
                      value={amountRange.min}
                      onChange={(e) =>
                        handleAmountChange("min", e.target.value)
                      }
                      placeholder="Min"
                      min={0}
                      className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Max Amount
                    </label>
                    <input
                      type="number"
                      value={amountRange.max}
                      onChange={(e) =>
                        handleAmountChange("max", e.target.value)
                      }
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
    // v1.0.4 ------------------------------------------------------------------------------->
  );
};

export default InvoiceTab;
