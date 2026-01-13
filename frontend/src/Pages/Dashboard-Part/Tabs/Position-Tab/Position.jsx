// v1.0.0  -  Ashraf  -  removed dynamic permissons state and added effective directly
// v1.0.1  -  Ashok   -  changed checkbox colors to match brand (custom-blue) colors
// v1.0.2  -  Venkatesh   -  added status change functionality
// v1.0.3  -  Venkatesh   -  added filters functionality for location, tech, company, experience, salary, created within days, updated within days
// v1.0.4  -  Ashok   -  Improved responsiveness
// v1.0.5  -  Ashok   -  changed kanban and Added delete and change status buttons for Kanban
// v1.0.6  -  Fixed   - Fixed alignment style issues at table
// v1.0.7  -  Ashok   - fixed style issue
// v1.0.8  -  Ashok   - added common code for kanban
// v1.0.9  -  Ashok   - added clickable title to navigate to details page at kanban
// v2.0.0  -  Ashok   - added max salary annually for filters
// v2.0.1  -  Ashok   - added common code for empty state messages when fetch, search and filter etc.
// v2.0.2  -  Ashok   - fixed style issues
// v2.0.3  -  Ashok   - fixed eye button color

import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  ChevronUp,
  ChevronDown,
  Trash,
  Repeat,
  MoreVertical,
} from "lucide-react";
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
// import PositionKanban from "./PositionKanban";
import PositionKanban from "../../../../Components/Shared/KanbanCommon/KanbanCommon";
import PositionSlideDetails from "./PositionSlideDetails";
import PositionForm from "./Position-Form";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup";
import { usePositions } from "../../../../apiHooks/usePositions";
import { useMasterData } from "../../../../apiHooks/useMasterData";
import { usePermissions } from "../../../../Context/PermissionsContext";
// v1.0.4 <------------------------------------------------------
import { useMediaQuery } from "react-responsive";
// v1.0.2 ------------------------------------------------------>
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge";
import { notify } from "../../../../services/toastService"; //<----v1.02-----
import DeleteConfirmModal from "../CommonCode-AllTabs/DeleteConfirmModal";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
import { getEmptyStateMessage } from "../../../../utils/EmptyStateMessage/emptyStateMessage";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

// v1.0.8 <---------------------------------------------------------------------
const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key)
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key)
  );

  //  Close menu when clicking outside
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
      {/* Always visible actions */}
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

      {/* More button (shows dropdown) */}
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

          {/* Dropdown Menu */}
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
// v1.0.8 --------------------------------------------------------------------->

const PositionTab = () => {
  // <---------------------- v1.0.0
  // All hooks at the top
  const pageType = "adminPortal";
  const { effectivePermissions, isInitialized } = usePermissions();
  const { locations, skills, companies } = useMasterData({}, pageType); //<-----v1.03-----

  const navigate = useNavigate();
  const location = useLocation();
  const [view, setView] = useState("table");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectPositionView, setSelectPositionView] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editModeOn, setEditModeOn] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isFilterPopupOpen, setFilterPopupOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState({
    location: [],
    tech: [],
    company: [],
    experience: { min: "", max: "" },
    salaryMin: "",
    salaryMax: "", // Add this line
    createdDate: "",
  });
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSkillsOpen, setIsSkillsOpen] = useState(false);
  const [isExperienceOpen, setIsExperienceOpen] = useState(false);
  //<-----v1.03-----
  const [isCompanyOpen, setIsCompanyOpen] = useState(false);
  const [isSalaryOpen, setIsSalaryOpen] = useState(false);
  const [isDatesOpen, setIsDatesOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [selectedTech, setSelectedTech] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState([]);
  const [experience, setExperience] = useState({ min: "", max: "" });
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [createdDatePreset, setCreatedDatePreset] = useState("");
  //-----v1.03----->
  const filterIconRef = useRef(null);
  // v1.0.4 <--------------------------------------------------------
  const isTablet = useMediaQuery({ maxWidth: 1024 });
  // v1.0.4 -------------------------------------------------------->
  //<----v1.02-----
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const STATUS_OPTIONS = ["opened", "closed", "hold", "cancelled"];

  // Status change modal state
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [statusTargetRow, setStatusTargetRow] = useState(null);
  const [statusValue, setStatusValue] = useState("opened");
  //----v1.02----->

  //  Ranjith added delete Candidate functionality
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [deletePosition, setDeletePosition] = useState(null);
  const rowsPerPage = 10;
  // Replace the current usePositions call with one that includes filters
  const queryFilters = {
    searchQuery,
    location: selectedFilters.location,
    tech: selectedFilters.tech,
    company: selectedFilters.company,
    experienceMin: selectedFilters.experience.min,
    experienceMax: selectedFilters.experience.max,
    salaryMin: selectedFilters.salaryMin,
    salaryMax: selectedFilters.salaryMax, // Add this line
    createdDate: selectedFilters.createdDate,
    page: currentPage + 1,
    limit: rowsPerPage,
  };

  const {
    positionData,
    total,
    isLoading,
    addOrUpdatePosition,
    deletePositionMutation,
    isMutationLoading,
  } = usePositions(queryFilters);

  // v1.0.8 <------------------------------------------
  useScrollLock(view === "kanban");
  // v1.0.8 ------------------------------------------>

  const handleDeletePosition = async () => {
    try {
      // console.log("deletePosition", deletePosition);
      let res = await deletePositionMutation(
        deletePosition?._id || deletePosition?.id || "N/A"
      );

      if (res?.status === "success") {
        setShowDeleteConfirmModal(false);
        notify.success(res?.message || "Position deleted successfully");
      } else {
        notify.warning(res?.message || "Unable to delete position");
      }
    } catch (error) {
      // console.error("Error deleting position:", error);
      setShowDeleteConfirmModal(false);
      const backendMessage =
        error?.response?.data?.message || "Failed to delete position";
      notify.error(backendMessage);
    }
  };

  //  Ranjith added delete Candidate functionality

  // Memoize unique locations from master data
  const uniqueLocations = useMemo(() => {
    //<-----v1.03-----
    if (!Array.isArray(locations)) return [];
    return [
      ...new Set(locations.map((loc) => loc?.LocationName).filter(Boolean)),
    ];
  }, [locations]);

  // Memoize unique company names from master data
  const uniqueCompanyNames = useMemo(() => {
    if (!Array.isArray(companies)) return [];
    return [...new Set(companies.map((c) => c?.CompanyName).filter(Boolean))];
  }, [companies]);
  //-----v1.03----->

  // v1.0.2 <------------------------------------------------------
  // useEffect(() => {
  //   const handleResize = () => {
  //     if (window.innerWidth < 1024) {
  //       setView("kanban");
  //     } else {
  //       setView("table");
  //     }
  //   };
  //   handleResize();
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  useEffect(() => {
    // Only run on isTablet change
    if (isTablet) {
      setView("kanban");
    } else {
      setView("table");
    }
  }, [isTablet]);
  // v1.0.2 ------------------------------------------------------>

  useEffect(() => {
    if (isFilterPopupOpen) {
      setSelectedLocation(selectedFilters.location);
      setSelectedTech(selectedFilters.tech);
      setSelectedCompany(selectedFilters.company || []);
      setExperience(selectedFilters.experience);
      setSalaryMin(
        selectedFilters.salaryMin !== undefined &&
          selectedFilters.salaryMin !== null
          ? String(selectedFilters.salaryMin)
          : ""
      );
      setSalaryMax(
        // Add this block
        selectedFilters.salaryMax !== undefined &&
          selectedFilters.salaryMax !== null
          ? String(selectedFilters.salaryMax)
          : ""
      );
      setCreatedDatePreset(selectedFilters.createdDate || "");
      setIsLocationOpen(false);
      setIsSkillsOpen(false);
      setIsExperienceOpen(false);
      setIsCompanyOpen(false);
      setIsSalaryOpen(false);
      setIsDatesOpen(false);
    }
  }, [isFilterPopupOpen, selectedFilters, positionData]);

  // Only after all hooks
  if (!isInitialized) {
    return null;
  }

  const handleLocationToggle = (location) => {
    setSelectedLocation((prev) =>
      prev.includes(location)
        ? prev.filter((l) => l !== location)
        : [...prev, location]
    );
  };

  const handleTechToggle = (tech) => {
    setSelectedTech((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  //<-----v1.03-----
  const handleCompanyToggle = (company) => {
    setSelectedCompany((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };
  //-----v1.03----->

  const handleExperienceChange = (e, type) => {
    const value = Math.max(0, Math.min(15, Number(e.target.value) || ""));
    setExperience((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const handleClearAll = () => {
    const clearedFilters = {
      location: [],
      tech: [],
      company: [],
      experience: { min: "", max: "" },
      salaryMin: "",
      salaryMax: "", // Add this line
      createdDate: "",
    };
    setSelectedLocation([]);
    setSelectedTech([]);
    setSelectedCompany([]);
    setExperience({ min: "", max: "" });
    setSalaryMin("");
    setSalaryMax(""); // Add this line
    setCreatedDatePreset("");
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const filters = {
      location: selectedLocation,
      tech: selectedTech,
      company: selectedCompany,
      experience: {
        min: Number(experience.min) || 0,
        max: Number(experience.max) || 15,
      },
      salaryMin: Number(salaryMin) || 0,
      salaryMax: Number(salaryMax) || 0, // Add this line
      createdDate: createdDatePreset || "",
    };

    setSelectedFilters(filters);
    setCurrentPage(0);
    setIsFilterActive(
      filters.location.length > 0 ||
        filters.tech.length > 0 ||
        filters.company.length > 0 ||
        filters.experience.min > 0 ||
        filters.experience.max < 15 ||
        filters.salaryMin > 0 ||
        filters.salaryMax > 0 ||
        !!filters.createdDate
    );
    setFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (positionData?.length !== 0) {
      setFilterPopupOpen((prev) => !prev);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(total / rowsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // const startIndex = currentPage * rowsPerPage;
  // const endIndex = Math.min(startIndex + rowsPerPage, FilteredData.length);
  // const currentFilteredRows = FilteredData.slice(startIndex, endIndex);

  const startIndex = currentPage * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, positionData.length);
  // const currentFilteredRows = positionData.slice(startIndex, endIndex);

  const currentFilteredRows = positionData || [];

  const statusOptions = STATUS_OPTIONS.map((s) => ({
    value: s,
    label: capitalizeFirstLetter(s),
  }));

  const handleView = (position) => {
    if (effectivePermissions.Positions?.View) {
      navigate(`/position/view-details/${position._id}`, {
        state: { from: location.pathname },
      });
    }
  };
  // <---------------------- v1.0.0
  const handleEdit = (position) => {
    if (effectivePermissions.Positions?.Edit) {
      navigate(`/position/edit-position/${position._id}`);
    }
  };

  // const capitalizeFirstLetter = (str) => {
  //   if (!str) return "N/A";
  //   return str?.charAt(0)?.toUpperCase() + str?.slice(1);
  // };

  //<----v1.02-----
  const handleStatusChange = async (row, newStatus) => {
    if (!effectivePermissions.Positions?.Edit) return;
    if (!newStatus || row.status === newStatus) return;

    // if (["closed", "cancelled"].includes(newStatus)) {
    //   const confirmed = window.confirm(
    //     `Are you sure you want to mark this position as ${capitalizeFirstLetter(
    //       newStatus
    //     )}?`
    //   );
    //   if (!confirmed) return;
    // }

    try {
      setUpdatingStatusId(row._id);
      await addOrUpdatePosition({ id: row._id, data: { status: newStatus } });
      notify.success(`Status updated to ${capitalizeFirstLetter(newStatus)}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update status";
      notify.error(msg);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Open/close modal and confirm update
  const openStatusModal = (row) => {
    setStatusTargetRow(row);
    setStatusValue(row?.status);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setStatusTargetRow(null);
  };

  const confirmStatusUpdate = async () => {
    if (!statusTargetRow) return;
    await handleStatusChange(statusTargetRow, statusValue);
    closeStatusModal();
  };
  //----v1.02----->

  // v2.0.1 <-------------------------------------------------------------------------------
  // Calculate filter/search activity
  const isSearchActive = searchQuery.length > 0 || isFilterActive;

  // Get the actual total count (before filtering on client, from server response)
  const initialDataCount = total || 0;

  // Get the count of currently displayed rows (will be 0 if filters/search yielded nothing)
  const currentFilteredCount = currentFilteredRows?.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "Positions"
  );
  // v2.0.1 ------------------------------------------------------------------------------->

  const tableColumns = [
    {
      key: "positionCode",
      header: "Position ID",
      render: (value, row) => (
        <div
          className="text-sm font-medium text-custom-blue cursor-pointer"
          onClick={() => handleView(row)}
        >
          {row?.positionCode || "N/A"}
        </div>
      ),
    },
    {
      key: "title",
      header: "Position Title",
      render: (value, row) => (
        <div className="flex items-center">
          <div className="h-8 w-8 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-custom-blue flex items-center justify-center text-white text-sm font-semibold">
              {row?.title ? row.title.charAt(0).toUpperCase() : "?"}
            </div>
          </div>
          <div className="ml-3">
            <div
              className="text-sm font-medium text-custom-blue cursor-pointer"
              onClick={() => handleView(row)}
            >
              {capitalizeFirstLetter(row?.title) || "N/A"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "companyname",
      header: "Company",
      render: (value, row) => (
        <span className="cursor-default" title={value}>
          {row?.companyname ? row?.companyname?.name : "Not Provided"}
        </span>
      ),
    },
    {
      key: "Location",
      header: "Location",
      render: (value) => (
        <span className="cursor-default" title={value}>
          {value ? value : "Not Provided"}
        </span>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (value, row) =>
        `${row.minexperience || "N/A"} - ${row.maxexperience || "N/A"} Years`,
    },
    {
      key: "rounds",
      header: "Rounds",
      render: (value, row) => row.rounds?.length || "N/A",
    },
    {
      key: "skills",
      header: "Skills",
      render: (value) => (
        // v1.0. <----------------------------------------------------------------------------
        <div
          className="flex gap-1 cursor-default"
          title={value?.map((skill) => skill.skill)?.join(", ")}
        >
          {value.slice(0, 1).map((skill, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-blue/10 text-custom-blue rounded-full text-xs"
            >
              {skill.skill || "N/A"}
            </span>
          ))}
          {value.length > 1 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 1}
            </span>
          )}
        </div>
        // v1.0. <----------------------------------------------------------------------------
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <StatusBadge status={capitalizeFirstLetter(value)} />
      ),
    },
    {
      key: "createdAt",
      header: "Created At",
      render: (value, row) => formatDateTime(row.createdAt) || "N/A",
    },
  ];

  const tableActions = [
    ...(effectivePermissions.Positions?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => handleView(row),
          },
        ]
      : []),
    ...(effectivePermissions.Positions?.Edit
      ? [
          //<----v1.02-----
          {
            key: "change_status",
            label: "Change Status",
            icon: <Repeat className="w-4 h-4 text-green-600" />,
            onClick: (row) => openStatusModal(row),
          },
          //----v1.02----->
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => handleEdit(row),
          },
        ]
      : []),
    ...(effectivePermissions.Positions?.Delete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => {
              setShowDeleteConfirmModal(true);
              setDeletePosition(row);
            },
          },
        ]
      : []),
  ];
  // v1.0.5 <----------------------------------------------------------------------------------
  // v1.0.8 <----------------------------------------------------------------------------------
  const kanbanColumns = [
    {
      key: "companyname",
      header: "Company",
      render: (value, row) => (
        <span className="cursor-default" title={value}>
          {row?.companyname ? row?.companyname?.name : "Not Provided"}
        </span>
      ),
    },
    {
      key: "experience",
      header: "Experience",
      render: (_, item) => {
        if (item?.minexperience && item?.maxexperience) {
          return `${item.minexperience} - ${item.maxexperience} years`;
        }
        return "N/A";
      },
    },
    {
      key: "Location",
      header: "Location",
      render: (value) => (
        <span className="cursor-default" title={value}>
          {value ? value : "Not Provided"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => <StatusBadge status={capitalizeFirstLetter(value)} />,
    },
    {
      key: "skills",
      header: "Skills",
      render: (skills) =>
        skills && skills.length > 0 ? (
          <div
            className="flex flex-wrap gap-1 cursor-default"
            title={skills?.map((skill) => skill.skill)?.join(", ")}
          >
            {skills?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {skills?.length > 0 ? (
                  <span className="px-2 py-0.5 bg-blue-100 bg-custom-blue/10 text-custom-blue text-xs rounded-full">
                    {skills[0].skill?.length > 12
                      ? skills[0].skill.slice(0, 12) + "..."
                      : skills[0].skill}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs">No Skills</span>
                )}
                {skills?.length > 1 && (
                  <span className="text-gray-500 text-xs">
                    +{skills.length - 1}
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          "N/A"
        ),
    },
  ];

  const kanbanActions = [
    ...(effectivePermissions.Positions?.View
      ? [
          {
            key: "view",
            label: "View Details",
            icon: <Eye className="w-4 h-4 text-custom-blue" />,
            onClick: (row) => handleView(row),
          },
        ]
      : []),

    ...(effectivePermissions.Positions?.Edit
      ? [
          {
            key: "change_status",
            label: "Change Status",
            icon: <Repeat className="w-4 h-4 text-green-600" />,
            onClick: (row) => openStatusModal(row),
          },
        ]
      : []),
    ...(effectivePermissions.Positions?.Edit
      ? [
          {
            key: "edit",
            label: "Edit",
            icon: <Pencil className="w-4 h-4 text-green-600" />,
            onClick: (row) => handleEdit(row),
          },
        ]
      : []),
    ...(effectivePermissions.Positions?.Delete
      ? [
          {
            key: "delete",
            label: "Delete",
            icon: <Trash className="w-4 h-4 text-red-600" />,
            onClick: (row) => {
              setShowDeleteConfirmModal(true);
              setDeletePosition(row);
            },
          },
        ]
      : []),
  ];
  // v1.0.8 ---------------------------------------------------------------------------------->
  // v1.0.5 ---------------------------------------------------------------------------------->

  if (showAddForm) {
    return (
      <PositionForm
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setSelectedPosition(null);
          setEditModeOn(false);
        }}
        selectedPosition={selectedPosition}
        isEdit={editModeOn}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="fixed md:mt-6 sm:mt-4 top-16 left-0 right-0 bg-background">
        <main className="px-6">
          <div className="sm:px-0">
            <Header
              title="Positions"
              onAddClick={() => navigate("/position/new-position")}
              addButtonText="Add Position"
              canCreate={effectivePermissions.Positions?.Create}
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
              dataLength={positionData?.length}
              searchPlaceholder="Search Positions..."
              filterIconRef={filterIconRef}
            />
          </div>
        </main>
      </div>
      {/* v1.0.6 <-------------------------------------------------------------------------------------- */}
      <main className="fixed sm:top-60 top-52 2xl:top-48 xl:top-48 lg:top-48 left-0 right-0 bg-background">
        {/* v1.0.6 --------------------------------------------------------------------------------------> */}
        <div className="sm:px-0">
          <motion.div className="bg-white">
            <div className="relative w-full">
              {view === "table" ? (
                // v1.0.6 <----------------------------------------------------------------------------------------------------------------------------
                <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
                  {/* v1.0.6 <---------------------------------------------------------------------------------------------------------------------------- */}
                  <TableView
                    data={currentFilteredRows}
                    columns={tableColumns}
                    loading={isLoading}
                    actions={tableActions}
                    emptyState={emptyStateMessage}
                  />
                </div>
              ) : (
                <div className="w-full">
                  {/* v1.0.5 <------------------------------------------------------------ */}
                  {/* v1.0.8 <------------------------------------------------------------ */}
                  <PositionKanban
                    loading={isLoading}
                    data={currentFilteredRows.map((position) => ({
                      ...position,
                      id: position?._id,
                      title: position?.positionCode || "N/A",
                      subTitle: position?.title || "N/A",
                    }))}
                    columns={kanbanColumns}
                    renderActions={(item) => (
                      <KanbanActionsMenu
                        item={item}
                        kanbanActions={kanbanActions}
                      />
                    )}
                    onTitleClick={(item) => handleView(item)}
                    emptyState={emptyStateMessage}
                    kanbanTitle="Position"
                  />
                  {/* v1.0.8 ------------------------------------------------------------> */}
                  {/* v1.0.5 ------------------------------------------------------------> */}
                </div>
              )}
              <FilterPopup
                isOpen={isFilterPopupOpen}
                onClose={() => setFilterPopupOpen(false)}
                onApply={handleApplyFilters}
                onClearAll={handleClearAll}
                filterIconRef={filterIconRef}
              >
                <div className="space-y-3">
                  {/*<-----v1.03-----*/}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsCompanyOpen(!isCompanyOpen)}
                    >
                      <span className="font-medium text-gray-700">Company</span>
                      {isCompanyOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isCompanyOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {uniqueCompanyNames.length > 0 ? (
                          uniqueCompanyNames.map((company) => (
                            <label
                              key={company}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedCompany.includes(company)}
                                onChange={() => handleCompanyToggle(company)}
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                              />
                              <span className="text-sm">{company}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Companies Available
                          </span>
                        )}
                      </div>
                    )}
                    {/*-----v1.03----->*/}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsLocationOpen(!isLocationOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Location
                      </span>
                      {isLocationOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isLocationOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {uniqueLocations.length > 0 ? (
                          uniqueLocations.map((location) => (
                            <label
                              key={location}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedLocation.includes(location)}
                                onChange={() => handleLocationToggle(location)}
                                // v1.0.1 <---------------------------------------------------------------
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                // v1.0.1 --------------------------------------------------------------->
                              />
                              <span className="text-sm">{location}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Locations Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsSkillsOpen(!isSkillsOpen)}
                    >
                      <span className="font-medium text-gray-700">Skills</span>
                      {isSkillsOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isSkillsOpen && (
                      <div className="mt-1 space-y-1 pl-3 max-h-32 overflow-y-auto">
                        {skills?.length > 0 ? (
                          skills.map((skill) => (
                            <label
                              key={skill.SkillName}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                checked={selectedTech.includes(skill.SkillName)}
                                onChange={() =>
                                  handleTechToggle(skill.SkillName)
                                }
                                // v1.0.1 <---------------------------------------------------------------
                                className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                                // v1.0.1 <---------------------------------------------------------------
                              />
                              <span className="text-sm">{skill.SkillName}</span>
                            </label>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            No Skills Available
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsExperienceOpen(!isExperienceOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Experience
                      </span>
                      {isExperienceOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isExperienceOpen && (
                      <div className="mt-1 space-y-2 pl-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Min (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              placeholder="Min..."
                              value={experience.min}
                              onChange={(e) => handleExperienceChange(e, "min")}
                              className="mt-1 px-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Max (years)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="15"
                              placeholder="Max..."
                              value={experience.max}
                              onChange={(e) => handleExperienceChange(e, "max")}
                              className="mt-1 px-2 block w-full rounded-md border  border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/*<-----v1.03-----*/}
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsSalaryOpen(!isSalaryOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Min Salary (Annual)
                      </span>
                      {isSalaryOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isSalaryOpen && (
                      <div className="mt-1 space-y-2 pl-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700">
                              Minimum Salary (Annual)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.1"
                              placeholder="Min Salary (Annual)"
                              value={salaryMin}
                              onChange={(e) => setSalaryMin(e.target.value)}
                              className="mt-1 px-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                            />
                          </div>
                        </div>
                        {/* Maximum Salary */}
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">
                            Max Salary (Annual)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="Max Salary (Annual)"
                            value={salaryMax}
                            onChange={(e) => setSalaryMax(e.target.value)}
                            className="mt-1 px-2 block w-full rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => setIsDatesOpen(!isDatesOpen)}
                    >
                      <span className="font-medium text-gray-700">
                        Created Date
                      </span>
                      {isDatesOpen ? (
                        <ChevronUp className="text-xl text-gray-700" />
                      ) : (
                        <ChevronDown className="text-xl text-gray-700" />
                      )}
                    </div>
                    {isDatesOpen && (
                      <div className="mt-1 space-y-2 pl-3">
                        <div className="space-y-1">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value=""
                              checked={createdDatePreset === ""}
                              onChange={() => setCreatedDatePreset("")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">All</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value="last7"
                              checked={createdDatePreset === "last7"}
                              onChange={() => setCreatedDatePreset("last7")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">Last 7 days</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="createdDate"
                              value="last30"
                              checked={createdDatePreset === "last30"}
                              onChange={() => setCreatedDatePreset("last30")}
                              className="h-4 w-4 accent-custom-blue focus:ring-custom-blue"
                            />
                            <span className="text-sm">Last 30 days</span>
                          </label>
                        </div>
                      </div>
                    )}
                    {/*-----v1.03----->*/}
                  </div>
                </div>
              </FilterPopup>
            </div>
          </motion.div>
        </div>
      </main>
      {selectPositionView && (
        <PositionSlideDetails
          position={selectedPosition}
          onClose={() => setSelectPositionView(false)}
        />
      )}

      {/*<----v1.02-----*/}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-4">
            <h3 className="text-sm font-semibold mb-2">Change Status</h3>
            <div className="mb-4">
              <DropdownSelect
                value={statusOptions.find((opt) => opt.value === statusValue)} // match current selection
                onChange={(selected) => setStatusValue(selected.value)} // update state with value
                options={statusOptions}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeStatusModal}
                className="px-3 py-1.5 text-sm rounded border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmStatusUpdate}
                disabled={
                  isMutationLoading ||
                  (statusTargetRow && updatingStatusId === statusTargetRow._id)
                }
                className="px-3 py-1.5 text-sm rounded bg-custom-blue text-white disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
      {/*----v1.02---->*/}

      {/* Ranjith added deleetd functionality  */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirmModal}
        onClose={() => setShowDeleteConfirmModal(false)}
        onConfirm={handleDeletePosition}
        title="Position"
        entityName={deletePosition?.title}
      />
    </div>
  );
};

export default PositionTab;
