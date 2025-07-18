import { useState, useEffect, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";

import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";
import Loading from "../../Components/Loading.js";

function InterviewerRequestsPage() {
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
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

  useEffect(() => {
    document.title = "Interviewer Requests | Admin Portal";
  }, []);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requests, setRequests] = useState([
    {
      id: "REQ-001",
      name: "Sarah Chen",
      email: "sarah.chen@example.com",
      phone: "+1 (555) 123-4567",
      expertise: ["React", "Node.js", "System Design"],
      yearsOfExperience: 8,
      preferredRate: 150,
      availability: "Full-time",
      status: "pending",
      appliedDate: "2025-06-02T10:00:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/sarahchen",
      github: "https://github.com/sarahchen",
      timezone: "UTC-7",
      languages: ["English", "Mandarin"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Previously worked at major tech companies. Specialized in frontend architecture and distributed systems.",
      references: [
        {
          name: "John Smith",
          company: "TechCorp",
          position: "Engineering Manager",
          contact: "john@techcorp.com",
        },
        {
          name: "Emily Brown",
          company: "StartupInc",
          position: "CTO",
          contact: "emily@startupinc.com",
        },
      ],
    },
    {
      id: "REQ-002",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      phone: "+1 (555) 234-5678",
      expertise: ["Python", "Machine Learning", "Data Science"],
      yearsOfExperience: 10,
      preferredRate: 175,
      availability: "Part-time",
      status: "approved",
      appliedDate: "2025-06-01T15:30:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/michaelbrown",
      github: "https://github.com/michaelbrown",
      timezone: "UTC-5",
      languages: ["English", "Spanish"],
      preferredInterviewTypes: ["Technical", "ML Systems"],
      notes: "PhD in Machine Learning. Published author in AI conferences.",
      references: [
        {
          name: "Alice Johnson",
          company: "AI Labs",
          position: "Research Director",
          contact: "alice@ailabs.com",
        },
      ],
    },
    {
      id: "REQ-003",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-004",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-005",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-006",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-008",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-009",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-0010",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-0011",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-0012",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-0013",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
        },
      ],
    },
    {
      id: "REQ-0014",
      name: "Emily Rodriguez",
      email: "emily.r@example.com",
      phone: "+1 (555) 345-6789",
      expertise: ["Java", "Spring Boot", "Microservices"],
      yearsOfExperience: 12,
      preferredRate: 160,
      availability: "Weekends",
      status: "rejected",
      appliedDate: "2025-05-30T09:15:00Z",
      resume: "https://example.com/resume.pdf",
      linkedIn: "https://linkedin.com/in/emilyrodriguez",
      github: "https://github.com/emilyrodriguez",
      timezone: "UTC-4",
      languages: ["English", "Portuguese"],
      preferredInterviewTypes: ["Technical", "System Design"],
      notes:
        "Enterprise architecture specialist with focus on scalable systems.",
      references: [
        {
          name: "David Lee",
          company: "Enterprise Co",
          position: "VP Engineering",
          contact: "david@enterprise.com",
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

  const dataToUse = requests;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((request) => {
      const fieldsToSearch = [
        request.lastName,
        request.firstName,
        request.email,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(request.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        request.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          request.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          request.CurrentExperience <= selectedFilters.experience.max);

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

  // const handleStatusChange = (requestId, newStatus) => {
  //   setRequests(
  //     requests.map((request) =>
  //       request.id === requestId ? { ...request, status: newStatus } : request
  //     )
  //   );
  //   setSelectedRequest(null);
  // };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const tableColumns = [
    {
      key: "name",
      header: "Name",
      render: (vale, row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      ),
    },
    {
      key: "expertise",
      header: "Expertise",
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {row.expertise.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
            >
              {skill}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "yearsOfExperience",
      header: "Experience",
      render: (value, row) => `${row.yearsOfExperience} years`,
    },
    {
      key: "preferredRate",
      header: "Rate",
      render: (value, row) => `$${row.preferredRate}/hr`,
    },
    {
      key: "availability",
      header: "Availability",
      render: (value, row) => (
        <StatusBadge
          status={row.status === "success" ? "success" : "warning"}
          text={row.status.toUpperCase()}
        />
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={row.status} />,
    },
    {
      key: "appliedDate",
      header: "Applied Date",
      render: (value, row) => formatDate(row.appliedDate),
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
    <div className="space-y-6 min-h-screen">
      <div className="fixed md:mt-4 sm:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 top-16 left-0 right-0 bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Requests</div>
            <div className="text-xl font-semibold">{requests.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Pending</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "pending").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Approved</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "approved").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Rejected</div>
            <div className="text-xl font-semibold">
              {requests.filter((r) => r.status === "rejected").length}
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold text-custom-blue">
            Interviewer Requests
          </h1>
        </div>

        {/* Toolbar */}
        <div className="fixed top-18 left-0 right-0 bg-background">
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
              searchPlaceholder="Search invoices..."
              filterIconRef={filterIconRef}
            />
          </div>
        </div>

        {/* New table content */}
        <main className="fixed top-60 lg lg:top-71 xl:top-71 2xl:top-71 left-0 right-0 bg-background">
          <div className="sm:px-0">
            {requests.length === 0 ? (
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
                        emptyState="No requests found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((request) => ({
                          ...requests,
                          id: request.id,
                          title: `${request.FirstName || ""} ${
                            request.LastName || ""
                          }`,
                          subtitle:
                            request.CurrentRole ||
                            request.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: "active",
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No requests found."
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
      <Outlet />
    </div>
  );
}

export default InterviewerRequestsPage;
