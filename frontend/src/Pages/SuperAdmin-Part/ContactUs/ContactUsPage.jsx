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
// import { useContactUs } from "../../../apiHooks/superAdmin/useContactUs.js"; // Uncomment when backend is ready
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
    status: [],
    priority: [],
    category: [],
    dateRange: { start: "", end: "" }
  });
  const filterIconRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedPriorities, setSelectedPriorities] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // const { contactMessages = [], isLoading, refetch } = useContactUs();

  // Generate dummy data for Contact Us
  const dummyData = [
    {
      _id: "507f1f77bcf86cd799439011",
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+1234567890",
      subject: "Unable to login to account",
      message: "I've been trying to log in to my account for the past two days but keep getting an error message. Can you please help me resolve this issue?",
      status: "pending",
      priority: "high",
      category: "technical",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(Date.now() - 86400000)
    },
    {
      _id: "507f1f77bcf86cd799439012",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1987654321",
      subject: "Billing inquiry",
      message: "I was charged twice for my subscription this month. Please review and refund the duplicate charge.",
      status: "resolved",
      priority: "medium",
      category: "billing",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(Date.now() - 100000)
    },
    {
      _id: "507f1f77bcf86cd799439013",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+1122334455",
      subject: "Feature request",
      message: "It would be great if you could add a dark mode option to the platform. Many of us work late hours and it would really help reduce eye strain.",
      status: "in_progress",
      priority: "low",
      category: "feature_request",
      createdAt: new Date(Date.now() - 259200000),
      updatedAt: new Date(Date.now() - 3600000)
    },
    {
      _id: "507f1f77bcf86cd799439014",
      name: "Emily Davis",
      email: "emily.d@example.com",
      phone: "+1567890123",
      subject: "Account access issue",
      message: "My account has been locked and I cannot access any of my data. This is urgent as I have important interviews scheduled.",
      status: "pending",
      priority: "high",
      category: "access",
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000)
    },
    {
      _id: "507f1f77bcf86cd799439015",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "+1234567890",
      subject: "General inquiry",
      message: "I would like to know more about your enterprise plans and pricing. Can someone from sales contact me?",
      status: "pending",
      priority: "medium",
      category: "general",
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 7200000)
    }
  ];

  // Use dummy data for now
  const contactUsData = dummyData;

  useEffect(() => {
    const handleResize = () => {
      setView(window.innerWidth < 1024 ? "kanban" : "table");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleStatusToggle = (status) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handlePriorityToggle = (priority) => {
    setSelectedPriorities((prev) =>
      prev.includes(priority)
        ? prev.filter((p) => p !== priority)
        : [...prev, priority]
    );
  };

  const handleCategoryToggle = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  // Reset filters when popup opens
  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedStatus(selectedFilters.status || []);
      setSelectedPriorities(selectedFilters.priority || []);
      setSelectedCategories(selectedFilters.category || []);
      setDateRange(selectedFilters.dateRange || { start: "", end: "" });
      setIsStatusOpen(false);
      setIsPriorityOpen(false);
      setIsCategoryOpen(false);
      setIsDateOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleClearAll = () => {
    setSelectedStatus([]);
    setSelectedPriorities([]);
    setSelectedCategories([]);
    setDateRange({ start: "", end: "" });
    setIsStatusOpen(false);
    setIsPriorityOpen(false);
    setIsCategoryOpen(false);
    setIsDateOpen(false);
    setSelectedFilters({ 
      status: [], 
      priority: [],
      category: [],
      dateRange: { start: "", end: "" }
    });
    setIsFilterActive(false);
  };

  const filterMenuItems = [
    {
      title: "Status",
      isOpen: isStatusOpen,
      toggleOpen: () => setIsStatusOpen(!isStatusOpen),
      content: [
        {
          label: "Pending",
          checked: selectedStatus.includes("pending"),
          onChange: () => handleStatusToggle("pending"),
        },
        {
          label: "In Progress",
          checked: selectedStatus.includes("in_progress"),
          onChange: () => handleStatusToggle("in_progress"),
        },
        {
          label: "Resolved",
          checked: selectedStatus.includes("resolved"),
          onChange: () => handleStatusToggle("resolved"),
        },
      ],
    },
    {
      title: "Priority",
      isOpen: isPriorityOpen,
      toggleOpen: () => setIsPriorityOpen(!isPriorityOpen),
      content: [
        {
          label: "High",
          checked: selectedPriorities.includes("high"),
          onChange: () => handlePriorityToggle("high"),
        },
        {
          label: "Medium",
          checked: selectedPriorities.includes("medium"),
          onChange: () => handlePriorityToggle("medium"),
        },
        {
          label: "Low",
          checked: selectedPriorities.includes("low"),
          onChange: () => handlePriorityToggle("low"),
        },
      ],
    },
    {
      title: "Category",
      isOpen: isCategoryOpen,
      toggleOpen: () => setIsCategoryOpen(!isCategoryOpen),
      content: [
        {
          label: "Technical",
          checked: selectedCategories.includes("technical"),
          onChange: () => handleCategoryToggle("technical"),
        },
        {
          label: "Billing",
          checked: selectedCategories.includes("billing"),
          onChange: () => handleCategoryToggle("billing"),
        },
        {
          label: "Access",
          checked: selectedCategories.includes("access"),
          onChange: () => handleCategoryToggle("access"),
        },
        {
          label: "Feature Request",
          checked: selectedCategories.includes("feature_request"),
          onChange: () => handleCategoryToggle("feature_request"),
        },
        {
          label: "General",
          checked: selectedCategories.includes("general"),
          onChange: () => handleCategoryToggle("general"),
        },
      ],
    },
  ];

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
      status: selectedStatus,
      priority: selectedPriorities,
      category: selectedCategories,
      dateRange: dateRange
    };
    
    setSelectedFilters(filters);
    setIsFilterActive(
      selectedStatus.length > 0 || 
      selectedPriorities.length > 0 || 
      selectedCategories.length > 0 ||
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
      key: "_id",
      header: "TICKET ID",
      render: (row) => (
        <span className="text-xs font-mono">{row?._id ? row._id.slice(-6) : 'N/A'}</span>
      ),
    },
    {
      key: "name",
      header: "CONTACT",
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
      key: "subject",
      header: "SUBJECT",
      render: (row) => (
        <div className="max-w-xs truncate" title={row?.subject || ''}>
          {row?.subject || 'N/A'}
        </div>
      ),
    },
    {
      key: "category",
      header: "ISSUE TYPE",
      render: (row) => (
        <div className="flex items-center gap-1">
          <span>{getCategoryIcon(row?.category)}</span>
          <span className="capitalize text-sm">
            {row?.category?.replace('_', ' ') || 'N/A'}
          </span>
        </div>
      ),
    },
    {
      key: "priority",
      header: "PRIORITY",
      render: (row) => (
        <StatusBadge
          status={row?.priority || 'low'}
          variant={getPriorityColor(row?.priority)}
          icon={null}
        />
      ),
    },
    {
      key: "status",
      header: "STATUS",
      render: (row) => (
        <StatusBadge
          status={row?.status?.replace('_', ' ') || 'pending'}
          variant={getStatusColor(row?.status)}
          icon={getStatusIcon(row?.status)}
        />
      ),
    },
    {
      key: "createdAt",
      header: "CREATED AT",
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
          onEdit={handleEdit}
          onDelete={handleDelete}
          permissions={superAdminPermissions?.ContactUs}
        />
      ),
    },
  ];

  // Filter data based on search and filters
  const filteredData = contactUsData.filter((item) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      item.name?.toLowerCase().includes(searchLower) ||
      item.email?.toLowerCase().includes(searchLower) ||
      item.subject?.toLowerCase().includes(searchLower) ||
      item.message?.toLowerCase().includes(searchLower);

    // Status filter
    const matchesStatus = selectedFilters.status.length === 0 || 
      selectedFilters.status.includes(item.status);

    // Priority filter
    const matchesPriority = selectedFilters.priority.length === 0 || 
      selectedFilters.priority.includes(item.priority);

    // Category filter
    const matchesCategory = selectedFilters.category.length === 0 || 
      selectedFilters.category.includes(item.category);

    // Date range filter
    let matchesDate = true;
    if (selectedFilters.dateRange?.start && selectedFilters.dateRange?.end) {
      const itemDate = new Date(item.createdAt);
      const startDate = new Date(selectedFilters.dateRange.start);
      const endDate = new Date(selectedFilters.dateRange.end + 'T23:59:59');
      matchesDate = itemDate >= startDate && itemDate <= endDate;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesDate;
  });

  // Calculate total pages for pagination
  const getTotalPages = () => {
    if (view === "table") {
      return Math.ceil(filteredData.length / ITEMS_PER_PAGE) || 1;
    } else {
      // For Kanban view, calculate based on the status with most items
      const statusCounts = {
        pending: filteredData.filter(r => r.status === "pending").length,
        in_progress: filteredData.filter(r => r.status === "in_progress").length,
        resolved: filteredData.filter(r => r.status === "resolved").length,
      };
      const maxCount = Math.max(statusCounts.pending, statusCounts.in_progress, statusCounts.resolved, 0);
      return maxCount > 0 ? Math.ceil(maxCount / ITEMS_PER_PAGE) : 1;
    }
  };

  const totalPages = getTotalPages();

  // Auto-reset current page when filters reduce available pages
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  return (
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
        searchPlaceholder="Search by name, email, subject..."
        showAddButton={false}
      />

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

      {/* Table/Kanban View */}
      {view === "table" ? (
        <TableView
          data={filteredData.slice(
            currentPage * ITEMS_PER_PAGE,
            (currentPage + 1) * ITEMS_PER_PAGE
          )}
          columns={columns}
          loading={false}
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

      <Outlet />
    </div>
  );
};

export default ContactUsPage;
