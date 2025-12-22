import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import EnterpriseContactKanban from "./EnterpriseContactKanban.jsx";
// import EnterpriseContactActionDropdown from "./EnterpriseContactActionDropdown.jsx";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Mail,
  User,
  Calendar,
  CheckCircle,
  Inbox,
  Phone,
  Building2,
} from "lucide-react";

import { usePermissions } from "../../../Context/PermissionsContext";
import { notify } from "../../../services/toastService";
import Header from "../../../Components/Shared/Header/Header.jsx";
import useEnterpriseContacts from "../../../apiHooks/superAdmin/useEnterpriseContacts.js";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../../utils/dateFormatter.js";

const EnterpriseContactSale = () => {
  const { superAdminPermissions } = usePermissions();

  // State management
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: { start: "", end: "" },
    status: "",
  });
  const [filters, setFilters] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    status: "",
    dateRange: { start: "", end: "" },
  });
  const [pendingStatus, setPendingStatus] = useState("");

  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [statusFilter, setStatusFilter] = useState("");

  const filterIconRef = useRef(null);

  // Query parameters for the API
  const queryParams = {
    page: currentPage + 1,
    limit: 10,
    search: debouncedSearch,
    ...filters,
  };

  // Use the REAL hook for fetching data
  const {
    enterpriseContacts = [],
    totalCount = 0,
    isLoading,
    error,
    refetch,
  } = useEnterpriseContacts(queryParams);

  //console.log('enterpriseContacts:', enterpriseContacts)

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset filters when popup opens (prefill staged status from applied filters)
  useEffect(() => {
    if (isFilterPopupOpen) {
      setDateRange(selectedFilters.dateRange || { start: "", end: "" });
      setStatusFilter(selectedFilters.status || "");
      setPendingStatus(filters.status || "");
    }
  }, [isFilterPopupOpen, selectedFilters, filters.status]);

  // const handleClearAll = () => {
  //     setDateRange({ start: "", end: "" });
  //     setStatusFilter("");
  //     setSelectedFilters({
  //         dateRange: { start: "", end: "" },
  //         status: ""
  //     });
  //     setIsFilterActive(false);
  // };

  // const filterMenuItems = [
  //     {
  //         label: "Status",
  //         type: "select",
  //         options: [
  //             { value: "", label: "All Statuses" },
  //             { value: "new", label: "New" },
  //             { value: "contacted", label: "Contacted" },
  //             { value: "qualified", label: "Qualified" },
  //             { value: "closed", label: "Closed" }
  //         ],
  //         value: statusFilter,
  //         onChange: (value) => setStatusFilter(value)
  //     },
  //     {
  //         label: "Date Range",
  //         type: "date-range",
  //         value: dateRange,
  //         onChange: (range) => setDateRange(range)
  //     }
  // ];

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return <Inbox className="h-4 w-4" />;
      case "contacted":
        return <Phone className="h-4 w-4" />;
      case "qualified":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "info";
      case "contacted":
        return "primary";
      case "qualified":
        return "success";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      dateRange: dateRange,
      status: pendingStatus,
    };

    setSelectedFilters(filters);
    setIsFilterActive((dateRange.start && dateRange.end) || pendingStatus);
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };

  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch((searchQuery || "").trim()),
      500
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleView = (id) => {
    notify.info(`Viewing enterprise contact: ${id}`);
    // Optional: Refetch after view if needed
    // refetch();
  };

  const handleContact = (id) => {
    notify.success(`Marked enterprise contact ${id} as contacted`);
    // TODO: Call backend to update status, then refetch()
    // e.g., await api.put(`/upinterviewEnterpriseContact/${id}`, { status: 'contacted' });
    // refetch();
  };

  const handleQualify = (id) => {
    notify.success(`Marked enterprise contact ${id} as qualified`);
    // TODO: Similar to above
    // refetch();
  };

  const handleClose = (id) => {
    notify.warning(`Closed enterprise contact: ${id}`);
    // TODO: Similar to above
    // refetch();
  };

  const columns = [
    {
      key: "companyName",
      header: "COMPANY",
      render: (row) => {
        const companyName = typeof row === "string" ? row : row?.companyName;
        return (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {capitalizeFirstLetter(companyName) || "N/A"}
            </span>
          </div>
        );
      },
    },
    {
      key: "contactPerson",
      header: "CONTACT PERSON",
      render: (row) => {
        const contactPerson =
          typeof row === "object" ? row?.contactPerson : row;
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{contactPerson || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "email",
      header: "EMAIL",
      render: (row) => {
        const email = typeof row === "object" ? row?.email : row;
        return (
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <span className="text-sm">{email || "N/A"}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "STATUS",
      render: (row) => {
        let status = typeof row === "object" ? row?.status : row;
        // Capitalize first letter and make rest lowercase
        const formattedStatus = status
          ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
          : "New";
        return (
          <StatusBadge
            status={formattedStatus}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        );
      },
    },
    {
      key: "createdAt",
      header: "SUBMITTED ON",
      render: (row) => {
        const createdAt = typeof row === "object" ? row?.createdAt : row;
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-sm">
              {createdAt ? formatDateTime(createdAt) : "N/A"}
            </span>
          </div>
        );
      },
    },
    // Actions column has been removed as per requirements,
  ];

  // Calculate total pages using server totalCount
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / 10));

  const nextPage = () => {
    if (currentPage + 1 < totalPages) {
      setCurrentPage((p) => p + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    }
  };

  useEffect(() => {
    if (totalPages > 0 && (isNaN(currentPage) || currentPage >= totalPages)) {
      setCurrentPage(0);
    }
  }, [currentPage, totalPages]);

  const handleDateRangeChange = (range) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: range,
    }));
    setCurrentPage(0);
  };

  const handleClearAll = () => {
    setFilters({
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      status: "",
      dateRange: { start: "", end: "" },
    });
    setSearchQuery("");
    setCurrentPage(0);
    setIsFilterActive(false);
  };

  return (
    <>
      <div className="px-2">
        <Header title="Enterprise Contact Sales" canCreate={false} />

        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={prevPage}
          onNextPage={nextPage}
          onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
          filterIconRef={filterIconRef}
          dataLength={Math.max(1, totalCount)}
          isFilterPopupOpen={isFilterPopupOpen}
          searchPlaceholder="Search By Company, Contact, Email or Phone..."
          showAddButton={false}
        />
      </div>

      {view === "table" ? (
        <TableView
          data={enterpriseContacts}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={10}
          totalItems={totalCount}
        />
      ) : (
        <EnterpriseContactKanban
          contacts={enterpriseContacts}
          currentPage={currentPage}
          itemsPerPage={0}
          totalItems={totalCount}
          onPageChange={setCurrentPage}
          onView={handleView}
          onContact={handleContact}
          onQualify={handleQualify}
          onClose={handleClose}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          permissions={superAdminPermissions?.EnterpriseContactSale}
        />
      )}

      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setFilterPopupOpen(false)}
        onApply={() => {
          setFilters((prev) => ({ ...prev, status: pendingStatus }));
          setIsFilterActive(!!pendingStatus);
          setFilterPopupOpen(false);
          setCurrentPage(0);
        }}
        onClearAll={() => {
          setPendingStatus("");
          setFilters((prev) => ({ ...prev, status: "" }));
          setIsFilterActive(false);
          setCurrentPage(0);
        }}
        filterIconRef={filterIconRef}
      >
        <div className="space-y-3 p-1">
          <div className="font-medium text-gray-700">Status</div>
          <div className="space-y-2">
            {[
              { value: "", label: "All" },
              { value: "new", label: "New" },
              { value: "contacted", label: "Contacted" },
              { value: "qualified", label: "Qualified" },
              { value: "closed", label: "Closed" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="statusFilter"
                  value={opt.value}
                  checked={(pendingStatus || "") === opt.value}
                  onChange={(e) => setPendingStatus(e.target.value)}
                  className="accent-custom-blue"
                />
                <span className="capitalize">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      </FilterPopup>

      <Outlet />
    </>
  );
};

export default EnterpriseContactSale;
