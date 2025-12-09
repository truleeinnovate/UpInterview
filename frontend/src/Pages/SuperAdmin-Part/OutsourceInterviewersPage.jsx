import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";

import Header from "../../Components/Shared/Header/Header.jsx";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { useMediaQuery } from "react-responsive";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import Loading from "../../Components/Loading.js";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import { Eye, Mail, UserCircle, Pencil } from "lucide-react";

function OutsourceInterviewersPage() {
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
    document.title = "Outsource Interviewers | Admin Portal";
  }, []);

  const [interviewers, setInterviewers] = useState([
    {
      id: 1,
      name: "Dr. Sarah Chen",
      email: "sarah.chen@example.com",
      expertise: ["React", "TypeScript", "Node.js", "System Design"],
      yearsOfExperience: 12,
      languages: ["English", "Mandarin"],
      timezone: "UTC-7",
      rating: 4.9,
      completedInterviews: 145,
      hourlyRate: 150,
      status: "available",
      lastActive: "2025-06-02T10:15:00Z",
    },
    {
      id: 2,
      name: "James Wilson",
      email: "james.wilson@example.com",
      expertise: ["AWS", "Kubernetes", "Docker", "DevOps"],
      yearsOfExperience: 8,
      languages: ["English"],
      timezone: "UTC-4",
      rating: 4.8,
      completedInterviews: 98,
      hourlyRate: 130,
      status: "busy",
      lastActive: "2025-06-02T09:30:00Z",
    },
    {
      id: 3,
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      expertise: ["Angular", "Vue.js", "Frontend Architecture"],
      yearsOfExperience: 10,
      languages: ["English", "Spanish"],
      timezone: "UTC-5",
      rating: 4.7,
      completedInterviews: 112,
      hourlyRate: 125,
      status: "available",
      lastActive: "2025-06-02T11:00:00Z",
    },
    {
      id: 4,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 5,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 6,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 7,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 8,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 9,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 10,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 11,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 12,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
    },
    {
      id: 13,
      name: "Dr. Alex Kumar",
      email: "alex.kumar@example.com",
      expertise: ["Machine Learning", "Python", "TensorFlow"],
      yearsOfExperience: 15,
      languages: ["English", "Hindi"],
      timezone: "UTC+1",
      rating: 5.0,
      completedInterviews: 167,
      hourlyRate: 175,
      status: "offline",
      lastActive: "2025-06-01T18:45:00Z",
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

  const dataToUse = interviewers;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((organization) => {
      const fieldsToSearch = [organization.name, organization.email].filter(
        (field) => field !== null && field !== undefined
      );

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(organization.HigherQualification);
      const matchesTech =
        selectedFilters.tech.length === 0 ||
        organization.skills?.some((skill) =>
          selectedFilters.tech.includes(skill.skill)
        );
      const matchesExperience =
        (!selectedFilters.experience.min ||
          organization.CurrentExperience >= selectedFilters.experience.min) &&
        (!selectedFilters.experience.max ||
          organization.CurrentExperience <= selectedFilters.experience.max);

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

  const formatStatus = (status = "") => {
    return status
      .toString()
      .trim()
      .replace(/[_\s-]+/g, " ") // replace underscores, hyphens, or multiple spaces with single space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const tableColumns = [
    {
      key: "name",
      header: "Interviewer",
      render: (value, row) => (
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
      key: "rating",
      header: "Rating",
      render: (row) => (
        <div className="flex items-center">
          <span className="font-medium">{row.rating}</span>
          <span className="text-yellow-400 ml-1">★</span>
          <span className="text-sm text-gray-500 ml-2">
            ({row.completedInterviews})
          </span>
        </div>
      ),
    },
    {
      key: "hourlyRate",
      header: "Rate",
      render: (value, row) => `$${row.hourlyRate}/hr`,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => <StatusBadge status={formatStatus(row.status)} />,
    },
    {
      key: "lastActive",
      header: "Last Active",
      render: (row) => formatDate(row.lastActive),
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 px-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Interviewers</div>
            <div className="text-xl font-semibold">{interviewers.length}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Available Now</div>
            <div className="text-xl font-semibold">
              {interviewers.filter((i) => i.status === "available").length}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Total Interviews</div>
            <div className="text-xl font-semibold">
              {interviewers.reduce((sum, i) => sum + i.completedInterviews, 0)}
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500">Avg. Rating</div>
            <div className="text-xl font-semibold">
              {(
                interviewers.reduce((sum, i) => sum + i.rating, 0) /
                interviewers.length
              ).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="fixed top-18 left-0 right-0 bg-background">
          <div className="flex justify-between items-center">
            {/* Header and Tool bar */}
            <div className="md:mt-1 sm:mt-2 w-full">
              <main className="px-4">
                <div className="sm:px-0">
                  <Header
                    title="Outsource Interviewers"
                    onAddClick={() => navigate("/tenants/add")}
                    addButtonText="New Request"
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
                    searchPlaceholder="Search Tenants..."
                    filterIconRef={filterIconRef}
                  />
                </div>
              </main>
            </div>
          </div>
        </div>

        {/* New table content */}
        <main className="fixed top-60 mt-6 lg lg:top-70 xl:top-70 2xl:top-70 left-0 right-0 bg-background">
          <div className="sm:px-0">
            {currentFilteredRows.length === 0 ? (
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
                        emptyState="No interviewers found."
                      />
                    </div>
                  ) : (
                    <div className="w-full">
                      <KanbanView
                        data={currentFilteredRows.map((interviewer) => ({
                          ...interviewers,
                          id: interviewer.id,
                          title: `${interviewer.FirstName || ""} ${
                            interviewer.LastName || ""
                          }`,
                          subtitle:
                            interviewer.CurrentRole ||
                            interviewer.CurrentExperience ||
                            "N/A",
                          avatar: "",
                          status: "active",
                          isAssessmentView: <p>Is assignment view</p>,
                        }))}
                        columns={kanbanColumns}
                        loading={isLoading}
                        renderActions={renderKanbanActions}
                        emptyState="No interviewers found."
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
    </div>
  );
}

export default OutsourceInterviewersPage;
