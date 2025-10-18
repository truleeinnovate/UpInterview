import { useEffect, useState, useRef } from "react";
import { Outlet } from "react-router-dom";
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
} from "lucide-react";

import { usePermissions } from "../../../Context/PermissionsContext.js";
import { useContactUs } from "../../../apiHooks/superAdmin/useContactUs.js";
import { notify } from "../../../services/toastService";
import Header from "../../../Components/Shared/Header/Header.jsx";

const ContactUsPage = () => {
  const { superAdminPermissions } = usePermissions();
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: { start: "", end: "" }
  });
  const filterIconRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  const [isDateOpen, setIsDateOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Get real data from backend
  const { contactMessages = [], isLoading, refetch } = useContactUs();

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setDateRange(selectedFilters.dateRange || { start: "", end: "" });
      setIsDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    setDateRange({ start: "", end: "" });
    setIsDateOpen(false);
    setSelectedFilters({ 
      dateRange: { start: "", end: "" }
    });
    setIsFilterActive(false);
  };

  const filterMenuItems = [];

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in_progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Inbox className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'resolved':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'technical':
        return '🔧';
      case 'billing':
        return '💳';
      case 'access':
        return '🔒';
      case 'feature_request':
        return '✨';
      case 'general':
        return '📋';
      default:
        return '📝';
    }
  };

  const handleApplyFilters = () => {
    const filters = {
      dateRange: dateRange
    };
    
    setSelectedFilters(filters);
    setIsFilterActive(
      (dateRange.start && dateRange.end)
    );
    setFilterPopupOpen(false);
    setCurrentPage(0);
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
    setCurrentPage(0);
  };

  const handleView = (id) => {
    notify.success(`Viewing contact message: ${id}`);
  };

  const handleEdit = (id) => {
    notify.info(`Editing contact message: ${id}`);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this contact message?")) {
      notify.warning(`Deleted contact message: ${id}`);
    }
  };

  const columns = [
    {
      key: "name",
      header: "NAME",
      render: (row) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{row?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "EMAIL",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{row?.email || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: "message",
      header: "MESSAGE",
      render: (row) => (
        <div className="max-w-xs truncate" title={row?.message || ''}>
          {row?.message || 'N/A'}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "CREATED ON",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">
            {row?.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "ACTION",
      render: (row) => (
        <ContactUsActionDropdown 
          row={row}
          onView={handleView}
          // onEdit={handleEdit}
          // onDelete={handleDelete}
          permissions={superAdminPermissions?.ContactUs}
        />
      ),
    },
  ];

  // Filter data based on search and filters
  const filteredData = contactMessages.filter((item) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.message?.toLowerCase().includes(searchLower);

    // Date range filter
    let matchesDate = true;
    if (selectedFilters.dateRange?.start && selectedFilters.dateRange?.end) {
      const itemDate = new Date(item.createdAt);
      const startDate = new Date(selectedFilters.dateRange.start);
      const endDate = new Date(selectedFilters.dateRange.end + 'T23:59:59');
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }

    return matchesSearch && matchesDate;
  });

  // Calculate total pages for pagination
  const getTotalPages = () => {
    return Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
  };

  const totalPages = getTotalPages();

  // Auto-reset current page when filters reduce available pages
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  return (
  <>
    <div className="px-2">
      {/* Header */}
      <Header
        title="Contact Us"
        //onAddClick={() => ()}
        // addButtonText=""
        canCreate={false}
    />
      

      {/* Toolbar */}
      <Toolbar
        view={view}
        setView={setView}
        onSearch={handleSearch}
        onFilterClick={() => setFilterPopupOpen(!isFilterPopupOpen)}
        dataLength={filteredData.length}
        isFilterPopupOpen={isFilterPopupOpen}
        searchPlaceholder="Search by name, email, message..."
        showAddButton={false}
      />
    </div>

      {/* Table/Kanban View */}
      {view === "table" ? (
        <TableView
          data={filteredData.slice(
            currentPage * ITEMS_PER_PAGE,
            (currentPage + 1) * ITEMS_PER_PAGE
          )}
          columns={columns}
          loading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
        />
      ) : (
        <ContactUsKanban
          contactMessages={filteredData}
          currentPage={currentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          permissions={superAdminPermissions?.ContactUs}
        />
      )}

    
    
    {/* Filter Popup */}
      {isFilterPopupOpen && (
        <div ref={filterIconRef}>
          <FilterPopup
            filterMenuItems={filterMenuItems}
            onApplyFilters={handleApplyFilters}
            onClearAll={handleClearAll}
            onClose={() => setFilterPopupOpen(false)}
            isFilterActive={isFilterActive}
          />
        </div>
      )}
    
     <Outlet />
    </>
  );
};

export default ContactUsPage;
