import { useEffect, useState, useRef } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";
import ContactUsKanban from "./ContactUsKanban.jsx";
import ContactUsActionDropdown from "./ContactUsActionDropdown.jsx";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Mail,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Inbox,
  Eye,
} from "lucide-react";

import { usePermissions } from "../../../Context/PermissionsContext.js";
import { useContactUs } from "../../../apiHooks/superAdmin/useContactUs.js";
import { notify } from "../../../services/toastService";
import Header from "../../../Components/Shared/Header/Header.jsx";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter.js";
import { formatDateTime } from "../../../utils/dateFormatter.js";

const ContactUsPage = () => {
  const { superAdminPermissions } = usePermissions();
  const navigate = useNavigate();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: { start: "", end: "" },
  });
  const filterIconRef = useRef(null);

  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Get data from backend with infinite scroll
  const {
    contactMessages = [],
    total = 0,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useContactUs({
    search: debouncedSearch,
    startDate: selectedFilters?.dateRange?.start,
    endDate: selectedFilters?.dateRange?.end,
  });

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Reset staged filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setDateRange(selectedFilters.dateRange || { start: "", end: "" });
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    setDateRange({ start: "", end: "" });
    setSelectedFilters({
      dateRange: { start: "", end: "" },
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in_progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "warning";
      case "in_progress":
        return "info";
      case "resolved":
        return "success";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "🔧";
      case "billing":
        return "💳";
      case "access":
        return "🔒";
      case "feature_request":
        return "✨";
      case "general":
        return "📋";
      default:
        return "📝";
    }
  };

  const handleApplyFilters = () => {
    const filters = { dateRange };
    setSelectedFilters(filters);
    setFilterPopupOpen(false);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(
      () => setDebouncedSearch((searchQuery || "").trim()),
      500
    );
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleView = (message) => {
    if (!message?._id) return;
    navigate(`/contact-us/${message._id}`, { state: { message } });
  };

  const handleEdit = (id) => {
    notify.info(`Editing contact message: ${id}`);
  };

  const handleDelete = (id) => {
    if (
      window.confirm("Are you sure you want to delete this contact message?")
    ) {
      notify.warning(`Deleted contact message: ${id}`);
    }
  };

  const columns = [
    {
      key: "name",
      header: "NAME",
      render: (row) => {
        const name = typeof row === "string" ? row : row?.name;

        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{name || "N/A"}</span>
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
      key: "message",
      header: "MESSAGE",
      render: (row) => {
        const message = typeof row === "object" ? row?.message : row;
        return (
          <div
            className="max-w-xs truncate cursor-default"
            title={message || ""}
          >
            {capitalizeFirstLetter(message) || "N/A"}
          </div>
        );
      },
    },
    {
      key: "createdAt",
      header: "CREATED ON",
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
    // {
    //   key: "actions",
    //   header: "ACTION",
    //   cellClassName: "overflow-visible",
    //   render: (_, row) => (
    //     <ContactUsActionDropdown
    //       row={row}
    //       onView={handleView}
    //       // onEdit={handleEdit}
    //       // onDelete={handleDelete}
    //       permissions={superAdminPermissions?.ContactUs}
    //     />
    //   ),
    // },
  ];

  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => handleView(row),
    },
  ];

  const handleScrollEnd = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <>
      <div className="px-4">
        <Header
          title="Contact Us"
          canCreate={false}
        />

        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
          filterIconRef={filterIconRef}
          dataLength={total || contactMessages?.length || 0}
          isFilterPopupOpen={isFilterPopupOpen}
          searchPlaceholder="Search By Name, Email, Message..."
          showAddButton={false}
          hidePagination={true}
        />
      </div>

      {/* Count text */}
      {(total || contactMessages?.length) > 0 && (
        <div className="flex items-center justify-start px-6 py-2">
          <span className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-800">{contactMessages?.length || 0}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-800">{total || contactMessages?.length || 0}</span>
            {" "}{(total || contactMessages?.length || 0) === 1 ? "message" : "messages"}
          </span>
        </div>
      )}

      {view === "table" ? (
        <TableView
          data={contactMessages}
          columns={columns}
          actions={tableActions}
          loading={isLoading}
          onScrollEnd={handleScrollEnd}
          isLoadingMore={isFetchingNextPage}
          hasMore={hasNextPage}
        />
      ) : (
        <ContactUsKanban
          contactMessages={contactMessages}
          itemsPerPage={0}
          totalItems={total}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          permissions={superAdminPermissions?.ContactUs}
        />
      )}

      {/* Filter Popup (date range only) */}
      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setFilterPopupOpen(false)}
        onApply={handleApplyFilters}
        onClearAll={handleClearAll}
        filterIconRef={filterIconRef}
      >
        <div className="space-y-3 p-1">
          <div className="font-medium text-gray-700">Date Range</div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateRange.start || ""}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
              className="border rounded px-2 py-1 text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end || ""}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
              className="border rounded px-2 py-1 text-sm"
            />
          </div>
        </div>
      </FilterPopup>

      <Outlet />
    </>
  );
};

export default ContactUsPage;
