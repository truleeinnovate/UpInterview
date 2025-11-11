// v1.0.0 - Ashok - Added optional chaining to prevent errors
// v1.0.1 - Ashok - Fixed skills display in table

import { useEffect, useState, useRef } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Toolbar from "../../Components/Shared/Toolbar/Toolbar.jsx";
import { FilterPopup } from "../../Components/Shared/FilterPopup/FilterPopup.jsx";
import { useMediaQuery } from "react-responsive";
import { motion } from "framer-motion";
import TableView from "../../Components/Shared/Table/TableView.jsx";
// import KanbanView from "../../Components/Shared/Kanban/KanbanView.jsx";
import StatusBadge from "../../Components/SuperAdminComponents/common/StatusBadge";
import {
  Eye,
  // Mail,
  // UserCircle,
  // Pencil,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import InterviewerDetails from "./InterviewerDetails.jsx";
// import { useCustomContext } from "../../Context/Contextfetch.js";
import KanbanView from "../../Pages/Outsource-Interviewer-Request/Kanban/KanbanView.jsx";
// import { config } from "../../config.js";
// import axios from "axios";
import { usePermissions } from "../../Context/PermissionsContext.js";
import { useOutsourceInterviewers } from "../../apiHooks/superAdmin/useOutsourceInterviewers";

const OutsourceInterviewers = () => {
  const { superAdminPermissions } = usePermissions();
  // const { outsourceInterviewers } = useCustomContext();

  const [view, setView] = useState("table");
  // const [selectCandidateView, setSelectCandidateView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // const [editModeOn, setEditModeOn] = useState(false);
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
  // const [isLoading, setIsLoading] = useState(true);
  // const [user, setUser] = useState("Admin");

  const [selectedInterviewerId, setSelectedInterviewerId] = useState(null);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // eslint-disable-next-line no-unused-vars
  const { outsourceInterviewers, isLoading, isError, error, refetch } =
    useOutsourceInterviewers();
  console.log("outsourceInterviewers", outsourceInterviewers);
  // v1.0.0 <-------------------------------------------------------------------------
  useEffect(() => {
    if (selectedInterviewerId && outsourceInterviewers?.length) {
      const foundUser = outsourceInterviewers?.find(
        (user) => user._id === selectedInterviewerId
      );
      // v1.0.0 -------------------------------------------------------------------------
      setSelectedInterviewer(foundUser || null);
    }
  }, [selectedInterviewerId, outsourceInterviewers]);

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

  const dataToUse = outsourceInterviewers || [];

  const handleFilterIconClick = () => {
    if (dataToUse?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const FilteredData = () => {
    if (!Array.isArray(dataToUse)) return [];
    return dataToUse.filter((interviewer) => {
      const fieldsToSearch = [
        interviewer?.status,
        interviewer?.interviewerNo,
        interviewer?.contactId?.firstName,
        interviewer?.contactId?.lastName,
      ].filter((field) => field !== null && field !== undefined);

      const matchesStatus =
        selectedFilters?.status.length === 0 ||
        selectedFilters.status.includes(interviewer?.status);

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
    setCurrentPage(0); // Reset to first page on search
  };

  // if (isLoading) {
  //   return <Loading />;
  // }

  // if (!interviewers || interviewers.length === 0) {
  //   return <div className="text-center mt-32">No Outsource interviewers found.</div>;
  // }

  // const formatDate = (dateString) => {
  //   const options = { year: "numeric", month: "short", day: "numeric" };
  //   return new Date(dateString).toLocaleDateString("en-US", options);
  // };

  const capitalizeFirstLetter = (str) =>
    str?.charAt(0)?.toUpperCase() + str?.slice(1);

  const formatStatus = (status = "") => {
    return status
      .toString()
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters (camelCase to words)
      .replace(/[_\s-]+/g, " ") // replace underscores, hyphens, or multiple spaces with single space
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Table Columns
  const tableColumns = [
    {
      key: "outsourceRequestCode",
      header: "Interviewer ID",
      render: (vale, row) => (
        <span
          // v1.0.0 <---------------------------------------------------------
          className={`font-medium ${
            superAdminPermissions?.OutsourceInterviewerRequest.View
              ? "text-custom-blue cursor-pointer"
              : "text-gray-900"
          }`}
          onClick={(e) => {
            e.stopPropagation(); // Prevents row-level handlers (if any)
            if (
              superAdminPermissions?.OutsourceInterviewerRequest.View &&
              row
            ) {
              handleOpenPopup(row);
              setIsPopupOpen(true);
            }
            // v1.0.0 --------------------------------------------------------->
          }}
        >
          {row?.outsourceRequestCode || "N/A"}
        </span>
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
    // {
    //   key: "skills",
    //   header: "Skills",
    //   render: (value, row) => (
    //     <span>
    //       {row?.contactId?.skills?.length
    //         ? row?.contactId?.skills.join(", ")
    //         : "N/A"}
    //     </span>
    //   ),
    // },
    {
      key: "skills",
      header: "Skills",
      render: (value, row) => {
        const skills = row?.contactId?.skills || [];

        return skills.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {/* First skill badge */}
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {skills[0]?.length > 12
                ? skills[0].slice(0, 12) + "..."
                : skills[0]}
            </span>

            {/* "+N more" label if more than one skill */}
            {skills.length > 1 && (
              <span className="text-gray-500 text-xs">
                +{skills.length - 1} more
              </span>
            )}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        );
      },
    },

    {
      key: "experience",
      header: "Experience",
      render: (value, row) => (
        <span>
          {row?.contactId?.yearsOfExperience
            ? row?.contactId?.yearsOfExperience
            : "N/A"}
        </span>
      ),
    },
    {
      // key: "rating",
      // header: "Rating",
      // render: (value, row) => <span>{row.rating ? row.rating : "N/A"}</span>,

      key: "rates",
      header: "Rates",
      render: (value, row) => {
        const rates = row?.contactId?.rates;
        const order = ["junior", "mid", "senior"];
        const labels = { junior: "Junior", mid: "Mid", senior: "Senior" };
        if (!rates) return <span>N/A</span>;
        const visible = order
          .map((k) => ({ key: k, data: rates?.[k] }))
          .filter((x) => x.data && x.data.isVisible);
        if (!visible.length) return <span>N/A</span>;
        return (
          <div className="flex flex-wrap gap-2">
            {visible.map(({ key, data }) => (
              <span
                key={key}
                className="inline-flex items-center rounded-full bg-emerald-50 text-emerald-900 px-2.5 py-1 text-xs border border-emerald-100"
                title={`${labels[key]} rate`}
              >
                {labels[key]}: {data.usd ? `$${data.usd} USD` : ""}
                {data.usd && data.inr ? " • " : ""}
                {data.inr ? `₹${data.inr} INR` : ""}
              </span>
            ))}
          </div>
        );
      },
    },
    // {
    //   key: "pricePerHour",
    //   header: "Price/Hour",
    //   render: (value, row) => (
    //     <span>
    //       {row?.requestedRate?.hourlyRate !== undefined
    //         ? `$${row.requestedRate.hourlyRate}`
    //         : "Not set"}
    //     </span>
    //   ),
    // },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={formatStatus(row.status)} />,
    },
  ];

  // Table Actions Configuration
  const tableActions = [
    ...(superAdminPermissions?.OutsourceInterviewerRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              setSelectedInterviewerId(row._id);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),
    // {
    //   key: "360-view",
    //   label: "360° View",
    //   icon: <UserCircle className="w-4 h-4 text-purple-600" />,
    //   onClick: (row) => row?._id && navigate(`/tenants/${row._id}`),
    // },

    // ...(superAdminPermissions?.OutsourceInterviewerRequest?.Edit
    //     ? [
    //         {
    //             key: "edit",
    //             label: "Edit",
    //             icon: <Pencil className="w-4 h-4 text-green-600" />,
    //             onClick: (row) => navigate(`edit/${row._id}`),
    //         },
    //     ]
    //     : []),
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
      key: "hourlyRate",
      header: "Price per hour",
      render: (value, row) => (
        <div className="font-medium">
          {row?.requestedRate?.hourlyRate !== undefined
            ? `$${row.requestedRate.hourlyRate}`
            : "Not set"}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => <StatusBadge status={formatStatus(value)} />,
    },
  ];

  // Shared Actions Configuration for Table and Kanban
  const actions = [
    ...(superAdminPermissions?.OutsourceInterviewerRequest?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-blue-600" />,
            onClick: (row) => {
              handleOpenPopup(row);
              setIsPopupOpen(true);
            },
          },
        ]
      : []),

    // ...(superAdminPermissions?.OutsourceInterviewerRequest?.Edit
    //     ? [
    //         {
    //             key: "edit",
    //             label: "Edit",
    //             icon: <Pencil className="w-4 h-4 text-green-600" />,
    //             onClick: (row) => navigate(`edit/${row._id}`),
    //         },
    //     ]
    //     : []),
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

  const handleOpenPopup = (interviewer) => {
    // Close it first if already open
    if (isPopupOpen) {
      setIsPopupOpen(false);
      setSelectedInterviewer(null);

      // Wait a tick before reopening
      setTimeout(() => {
        setSelectedInterviewer(interviewer);
        setIsPopupOpen(true);
      }, 50);
    } else {
      setSelectedInterviewer(interviewer);
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedInterviewer(null);
  };

  return (
    <>
      <div className="fixed top-12 sm:top-12 md:top-12 left-0 right-0">
        <div className="flex justify-between p-4">
          <div>
            <span className="sm:text-xl md:text-xl lg:text-2xl xl:text-2xl 2xl:text-2xl font-semibold text-custom-blue">
              Outsource Interviewers
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
          searchPlaceholder="Search interviewers..."
          filterIconRef={filterIconRef}
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
                  loading={isLoading}
                  actions={tableActions}
                  emptyState="No Outsource Interviewers found."
                />
              </div>
            ) : (
              <div className="w-full">
                <KanbanView
                  data={currentFilteredRows.map((interview) => ({
                    ...interview,
                    id: interview._id,
                    title:
                      interview.interviewerNo ||
                      `TEMP-${interview?._id?.slice(-6) || "NA"}`,
                    subtitle:
                      interview?.contactId?.firstName &&
                      interview?.contactId?.lastName
                        ? `${interview?.contactId.firstName} ${interview?.contactId.lastName}`
                        : "N/A",
                  }))}
                  outsourceInterviewers={outsourceInterviewers}
                  columns={kanbanColumns}
                  loading={isLoading}
                  renderActions={renderKanbanActions}
                  emptyState="No interviewer requests found."
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
      {/* Details view popup */}
      {isPopupOpen && selectedInterviewer && (
        <div>
          <InterviewerDetails
            selectedInterviewersData={selectedInterviewer}
            onClose={handleClosePopup}
          />
        </div>
      )}
      <Outlet />
    </>
  );
};

export default OutsourceInterviewers;
