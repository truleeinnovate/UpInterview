import React from "react";
import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { Eye, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import KanbanView from "./KanbanView.jsx";
import TableView from "../../../Components/Shared/Table/TableView.jsx";

const Interviewers = () => {
  // const { superAdminPermissions } = usePermissions();

  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    currentStatus: "",
  });
  const navigate = useNavigate();
  const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1024 });
  const filterIconRef = useRef(null);

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [interviews, setInterviews] = useState([
    {
      interviewNo: "INT-001",
      contactId: {
        firstName: "Ravi",
        lastName: "Kumar",
        skills: ["JavaScript", "React", "Node.js"],
        experience: "4 years",
      },
      rating: 4.5,
      requestedRate: { hourlyRate: "₹1200" },
      status: "active",
    },
    {
      interviewNo: "INT-002",
      contactId: {
        firstName: "Sneha",
        lastName: "Patel",
        skills: ["Python", "Django", "SQL"],
        experience: "5 years",
      },
      rating: 4.7,
      requestedRate: { hourlyRate: "₹1500" },
      status: "inactive",
    },
    {
      interviewNo: "INT-003",
      contactId: {
        firstName: "Amit",
        lastName: "Sharma",
        skills: ["Java", "Spring Boot", "Microservices"],
        experience: "6 years",
      },
      rating: 4.2,
      requestedRate: { hourlyRate: "₹1800" },
      status: "pending",
    },
    {
      interviewNo: "INT-004",
      contactId: {
        firstName: "Priya",
        lastName: "Reddy",
        skills: ["HTML", "CSS", "Bootstrap"],
        experience: "3 years",
      },
      rating: 3.9,
      requestedRate: { hourlyRate: "₹900" },
      status: "active",
    },
    {
      interviewNo: "INT-005",
      contactId: {
        firstName: "Vikram",
        lastName: "Nair",
        skills: ["Angular", "TypeScript", "RxJS"],
        experience: "7 years",
      },
      rating: 4.8,
      requestedRate: { hourlyRate: "₹2000" },
      status: "inactive",
    },
    {
      interviewNo: "INT-006",
      contactId: {
        firstName: "Anjali",
        lastName: "Mehta",
        skills: ["MongoDB", "Express.js", "React", "Node.js"],
        experience: "5 years",
      },
      rating: 4.3,
      requestedRate: { hourlyRate: "₹1600" },
      status: "active",
    },
    {
      interviewNo: "INT-007",
      contactId: {
        firstName: "Rajesh",
        lastName: "Gupta",
        skills: ["C#", ".NET", "Azure"],
        experience: "8 years",
      },
      rating: 4.6,
      requestedRate: { hourlyRate: "₹2200" },
      status: "pending",
    },
    {
      interviewNo: "INT-008",
      contactId: {
        firstName: "Kavya",
        lastName: "Iyer",
        skills: ["Go", "Kubernetes", "Docker"],
        experience: "6 years",
      },
      rating: 4.4,
      requestedRate: { hourlyRate: "₹1900" },
      status: "active",
    },
  ]);

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
  const [selectedCurrentStatus, setCurrentStatus] = useState("inProgress");

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

  useEffect(() => {
    document.title = "Tenants | Admin Portal";
  }, []);

  useEffect(() => {
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);

  const dataToUse = interviews;

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((interview) => {
      const fieldsToSearch = [
        interview?.status,
        interview?.interviewNo,
        interview?.contactId?.firstName,
        interview?.contactId?.lastName,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(interview?.status);

      const matchesSearchQuery = fieldsToSearch.some((field) =>
        field.toString().toLowerCase().includes(searchQuery.toLowerCase())
      );

      return matchesSearchQuery && matchesStatus;
    });
  };

  // Pagination
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
    setCurrentPage(0);
  };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  // Table Columns
  const tableColumns = [
    {
      key: "interviewNo",
      header: "Interview ID",
      render: (vale, row) => (
        <span>{row?.interviewNo ? row?.interviewNo : "N/A"}</span>
      ),
    },

    {
      key: "name",
      header: "Name",
      render: (vale, row) => (
        <span>
          {row?.contactId?.firstName
            ? row?.contactId?.firstName
            : row?.contactId?.lastName}
        </span>
      ),
    },
    {
      key: "skills",
      header: "Skills",
      render: (value, row) => (
        <span>
          {row?.contactId?.skills?.length
            ? row?.contactId?.skills.join(", ")
            : "N/A"}
        </span>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (value, row) => (
        <span>
          {row?.contactId?.experience ? row?.contactId?.experience : "N/A"}
        </span>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      render: (value, row) => <span>{row.rating ? row.rating : "N/A"}</span>,
    },
    {
      key: "pricePerHour",
      header: "Price/Hour",
      render: (value, row) => (
        <span>{row?.requestedRate?.hourlyRate || "N/A"}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(row.status)} />
      ),
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        // setSelectedInterviewId(row._id);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
  ];

  // Kanban Columns Configuration
  const kanbanColumns = [
    {
      key: "hourlyRate",
      header: "Price per hour",
      render: (value, row) => (
        <div className="font-medium">
          {row.requestedRate?.hourlyRate || "N/A"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(value)} />
      ),
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-blue-600" />,
      onClick: (row) => {
        // handleOpenPopup(row);
        setIsPopupOpen(true);
      },
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) => navigate(`edit/${row._id}`),
    },
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
    // filters options
    const statusOptions = [
      "new",
      "contacted",
      "inprogress",
      "active",
      "inactive",
      "blacklisted",
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
                  <div className="mt-2 rounded-md p-2 space-y-2">
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

  return (
    <>
      <div className="fixed top-12 sm:top-12 md:top-12 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="text-2xl font-semibold text-custom-blue">
              Interviews
            </span>
          </div>
        </div>
      </div>
      <div className="fixed top-28 sm:top-32 md:top-36 left-0 right-0 px-4">
        {/* Toolbar */}
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
          searchPlaceholder="Search interviews..."
          filterIconRef={filterIconRef} // Pass ref to Toolbar
        />
      </div>

      <div className="fixed left-0 right-0 mx-auto z-10 sm:top-44 md:top-52 lg:top-48 xl:top-48 2xl:top-48">
        <div className="sm:px-0">
          <motion.div className="bg-white">
            {view === "table" ? (
              <div className="w-full mb-8 bg-red">
                <TableView
                  data={currentFilteredRows}
                  columns={tableColumns}
                  // loading={isLoading}
                  actions={tableActions}
                  emptyState="No Interviews found."
                />
              </div>
            ) : (
              <div className="w-full">
                <KanbanView
                  data={currentFilteredRows.map((interview) => ({
                    ...interview,
                    id: interview._id,
                    title: interview.interviewNo || "N/A",
                    subtitle:
                      interview?.contactId?.firstName &&
                      interview?.contactId?.lastName
                        ? `${interview?.contactId.firstName} ${interview?.contactId.lastName}`
                        : "N/A",
                  }))}
                  interviews={interviews}
                  columns={kanbanColumns}
                  // loading={isLoading}
                  renderActions={renderKanbanActions}
                  emptyState="No interviews found."
                />
              </div>
            )}

            {/* FilterPopup */}
            <FilterPopup
              isOpen={isFilterPopupOpen}
              onClose={() => setFilterPopupOpen(false)}
              onApply={handleApplyFilters}
              onClearAll={handleClearAll}
              filterIconRef={filterIconRef}
            >
              {renderFilterContent()}
            </FilterPopup>
          </motion.div>
        </div>
      </div>
      <Outlet />
    </>
  );
};

export default Interviewers;
