// v1.0.0  -  mansoor  -  added skeleton structure loading
// v1.0.1  -  Ashok    -  changed the styles at bullet points
// v1.0.2  -  Ashok    -  Improved responsiveness
// v1.0.3  -  Ashok    -  Changed UI

// import { useState } from 'react'
// import { ViewDetailsButton, EditButton } from "../../common/Buttons";
// import { SidePopup } from '../../common/SidePopup'
// import { InterviewerGroupFormPopup } from './InterviewerGroupFormPopup'
// import { teamMembers } from '../../mockData/teamData'
// import axios from 'axios'
import Cookies from "js-cookie";
import { Outlet, useNavigate } from "react-router-dom";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import { useGroupsQuery } from "../../../../../apiHooks/useInterviewerGroups";
import { useEffect, useMemo, useRef, useState } from "react";
import Toolbar from "../../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../../Components/Shared/Table/TableView";
import KanbanView from "../../../../../Components/Shared/KanbanCommon/KanbanCommon";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  MoreVertical,
  Pencil,
} from "lucide-react";
import { capitalizeFirstLetter } from "../../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../../Components/SuperAdminComponents/common/StatusBadge";
import { getEmptyStateMessage } from "../../../../../utils/EmptyStateMessage/emptyStateMessage";
import { FilterPopup } from "../../../../../Components/Shared/FilterPopup/FilterPopup";

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

const InterviewerGroups = () => {
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const tenantId = tokenPayload.tenantId;

  // <------------------------- v1.0.0
  const {
    data: groups = [],
    isLoading: groupsLoading,
    error: groupError,
  } = useGroupsQuery();

  // v1.0.0 -------------------------->
  const navigate = useNavigate();
  // const [selectedGroup, setSelectedGroup] = useState(null)
  // const [editingGroup, setEditingGroup] = useState(null)
  // const [isCreating, setIsCreating] = useState(false)
  // const [groups, setGroups] = useState([
  //   {
  //     id: 1,
  //     name: 'Frontend Engineers',
  //     description: 'Specialized in frontend technologies and UI/UX',
  //     members: teamMembers.filter(member => member.expertise.includes('Frontend')),
  //     status: 'active'
  //   },
  //   {
  //     id: 2,
  //     name: 'Backend Engineers',
  //     description: 'Focused on backend systems and architecture',
  //     members: teamMembers.filter(member => member.expertise.includes('Backend')),
  //     status: 'active'
  //   },
  //   {
  //     id: 3,
  //     name: 'Product Team',
  //     description: 'Product management and strategy interviews',
  //     members: teamMembers.filter(member => member.department === 'Product'),
  //     status: 'active'
  //   }
  // ])
  // const [groupsData, setGroupsData] = useState([])

  // State for Toolbar Features
  const [view, setView] = useState("table"); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  // const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  // const [isFilterActive, setIsFilterActive] = useState(false);
  // For simplicity and focus, I'm omitting the filter state/logic for now,
  // but the Toolbar is ready to accept these props.

  // Pagination Constants - Assuming a fixed page size for local filtering demo
  const pageSize = 9; // Display 9 groups per "page" in the UI

  // 1. ADD FILTER STATES 👇
  const filterIconRef = useRef(null);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isFilterActive, setIsFilterActive] = useState(false);

  // Filter State (What the user selected in the popup)
  const [selectedFilters, setSelectedFilters] = useState({
    status: [],
    // Add more filter types here (e.g., membersCount: { min: 0, max: 100 })
  });

  // Temporary State for Filter Popup (used while setting filters in the open popup)
  const [tempSelectedStatus, setTempSelectedStatus] = useState([]);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  // 1. END ADD FILTER STATES 👆

  // 3. Filter and Search Logic
  const filteredAndSearchedGroups = useMemo(() => {
    let result = groups;

    // 1. Search Filtering (Case-insensitive)
    if (searchQuery) {
      result = result.filter(
        (group) =>
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.usersNames.some((name) =>
            name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // 2. Filter by Status 👇
    if (selectedFilters.status.length > 0) {
      result = result.filter((group) =>
        selectedFilters.status.includes(group.status)
      );
    }
    // 2. Filter by Status 👆

    return result;
  }, [groups, searchQuery, selectedFilters]); // 👈 Add selectedFilters dependency

  // Pagination Calculation
  const totalItems = filteredAndSearchedGroups.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Slice data for the current page
  const startIndex = currentPage * pageSize;
  const currentGroups = filteredAndSearchedGroups.slice(
    startIndex,
    startIndex + pageSize
  );

  // Handlers for Toolbar
  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(0); // Reset to first page on new search
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (isFilterPopupOpen) {
      setTempSelectedStatus(selectedFilters.status);
      setIsStatusOpen(true);
    }
  }, [isFilterPopupOpen, selectedFilters]);

  const handleStatusToggle = (status) => {
    setTempSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const handleClearAll = () => {
    const clearedFilters = {
      status: [],
    };
    setTempSelectedStatus([]);
    setSelectedFilters(clearedFilters);
    setCurrentPage(0);
    setIsFilterActive(false);
    setIsFilterPopupOpen(false);
  };

  const handleApplyFilters = () => {
    const newFilters = {
      status: tempSelectedStatus,
    };
    setSelectedFilters(newFilters);
    setCurrentPage(0);

    // Check if any filter is active
    const active = newFilters.status.length > 0;
    setIsFilterActive(active);
    setIsFilterPopupOpen(false);
  };

  const handleFilterIconClick = () => {
    if (groups.length !== 0) {
      // Check initial data length
      setIsFilterPopupOpen((prev) => !prev);
    }
  };
  // ---------------------------------------------------------------------------

  // <------------------------- v1.0.0
  // Skeleton Loading Component for Interview Groups
  // const InterviewerGroupsSkeleton = () => {
  //   return (
  //     <div>
  //       {/* Info section skeleton */}
  //       {/* <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
  //         <div className="flex">
  //           <div className="flex-shrink-0">
  //             <div className="h-5 w-5 bg-custom-blue skeleton-animation rounded"></div>
  //           </div>
  //           <div className="ml-3">
  //             <div className="h-5 w-32 bg-custom-blue skeleton-animation rounded mb-2"></div>
  //             <div className="space-y-2">
  //               <div className="h-4 w-80 bg-custom-blue skeleton-animation rounded"></div>
  //               <div className="space-y-1">
  //                 <div className="h-3 w-64 bg-custom-blue skeleton-animation rounded"></div>
  //                 <div className="h-3 w-72 bg-custom-blue skeleton-animation rounded"></div>
  //                 <div className="h-3 w-68 bg-custom-blue skeleton-animation rounded"></div>
  //                 <div className="h-3 w-60 bg-custom-blue skeleton-animation rounded"></div>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div> */}
  //       <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg sm:mt-6">
  //         <div className="flex">
  //           <div className="flex-shrink-0">
  //             <svg
  //               className="h-5 w-5 text-custom-blue"
  //               xmlns="http://www.w3.org/2000/svg"
  //               viewBox="0 0 20 20"
  //               fill="currentColor"
  //             >
  //               <path
  //                 fillRule="evenodd"
  //                 d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
  //                 clipRule="evenodd"
  //               />
  //             </svg>
  //           </div>
  //           <div className="ml-3">
  //             <h3 className="text-sm font-medium text-custom-blue">
  //               Interviewer Groups
  //             </h3>
  //             <div className="mt-2 text-sm text-custom-blue">
  //               <p>
  //                 Create specialized interviewer groups for different assessment
  //                 types:
  //               </p>
  //               {/* v1.0.1 <---------------------------------------------------------------------------------------------------------------------------- */}
  //               <ul className="list-disc list-inside mt-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-1 gap-x-16">
  //                 {/* v1.0.1 -----------------------------------------------------------------------------------------------------------------------------> */}
  //                 <li>
  //                   Group interviewers by expertise (Frontend, Backend, etc.)
  //                 </li>
  //                 <li>Manage technical and non-technical interview panels</li>
  //                 <li>Organize interviewers by seniority levels</li>
  //                 <li>Track group-specific interview metrics</li>
  //               </ul>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {/* Header skeleton */}
  //       {/* <div className="flex justify-between items-center">
  //         <div className="h-8 w-48 bg-gray-200 skeleton-animation rounded"></div>
  //         <div className="h-10 w-32 bg-gray-200 skeleton-animation rounded"></div>
  //       </div> */}
  //       <div className="flex justify-between items-center mt-2">
  //         <h2 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-bold">
  //           Interviewer Groups
  //         </h2>
  //         <button className="text-sm px-4 py-2 bg-custom-blue text-white rounded-lg  whitespace-nowrap">
  //           Create Group
  //         </button>
  //       </div>

  //       {/* Groups grid skeleton */}
  //       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4 mt-2">
  //         {[1, 2, 3, 4, 5, 6].map((item) => (
  //           <div key={item} className="bg-white p-4 sm:p-6 rounded-lg shadow">
  //             <div className="flex justify-between items-start mb-4">
  //               <div className="flex-1">
  //                 <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
  //                 <div className="h-4 w-48 bg-gray-200 skeleton-animation rounded"></div>
  //               </div>
  //               <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded"></div>
  //             </div>

  //             <div className="mt-4">
  //               <div className="h-4 w-24 bg-gray-200 skeleton-animation rounded mb-3"></div>
  //               <div className="flex flex-wrap gap-2">
  //                 <div className="h-6 w-20 bg-gray-200 skeleton-animation rounded"></div>
  //                 <div className="h-6 w-24 bg-gray-200 skeleton-animation rounded"></div>
  //                 <div className="h-6 w-18 bg-gray-200 skeleton-animation rounded"></div>
  //                 <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded"></div>
  //               </div>
  //             </div>

  //             <div className="mt-4 flex justify-end space-x-2">
  //               <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
  //               <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // Show skeleton if data is still loading
  // if (groupsLoading) {
  //   return <InterviewerGroupsSkeleton />;
  // }
  // v1.0.0 -------------------------->

  // console.log("tenantId InterviewerGroups", tenantId);

  // console.log("organizationId", tenantId, groups);

  // useEffect(() => {
  //   const fetchGroups = async () => {
  //     try {
  //       // setLoading(true);
  //       const response = await axios.get(`${config.REACT_APP_API_URL}/groups/data/${tenantId}`)
  //       console.log('Fetched groups:', response.data);
  //       setGroupsData(response.data);
  //     } catch (error) {
  //       console.error('Error fetching groups:', error)
  //     } finally {
  //       // setLoading(false);
  //     }
  //   }
  //   fetchGroups()
  // }, [])

  // const handleSaveGroup = (groupData) => {
  //   if (editingGroup) {
  //     // setGroups(prev => prev.map(group =>
  //     //   group.id === editingGroup.id ? { ...group, ...groupData } : group
  //     // ))
  //     setEditingGroup(null)
  //   } else {
  //     // setGroups(prev => [...prev, { ...groupData, id: prev.length + 1 }])
  //     // setIsCreating(false)
  //   }
  // }

  // ---------------------- Dynamic Empty State Messages using Utility ------------------------
  const isSearchActive = searchQuery.length > 0; // Assuming no separate filters implemented yet
  // Use the total count before search filtering
  const initialDataCount = groups?.length || 0;
  const currentFilteredCount = filteredAndSearchedGroups.length || 0;

  const emptyStateMessage = getEmptyStateMessage(
    isSearchActive,
    currentFilteredCount,
    initialDataCount,
    "interviewer groups" // Entity Name
  );
  // ----------------------- Dynamic Empty State Messages using Utility -----------------------

  // Table Columns
  const tableColumns = [
    {
      key: "name",
      header: "Group Name",
      render: (value, row) => (
        <span
          className="text-custom-blue font-medium cursor-pointer"
          onClick={() =>
            navigate(
              `/account-settings/interviewer-groups/interviewer-group-details/${row._id}`
            )
          }
        >
          {capitalizeFirstLetter(value) || "N/A"}
        </span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (value) => (
        <span className="truncate max-w-[200px] block" title={value}>
          {capitalizeFirstLetter(value) || "Not provided"}
        </span>
      ),
    },
    {
      key: "numberOfUsers",
      header: "Members Count",
      render: (value) => value ?? 0,
    },
    {
      key: "usersNames",
      header: "Members",
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 3).map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-blue/10 text-custom-blue rounded-full text-xs"
            >
              {name}
            </span>
          ))}
          {value?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value) => (
        <span>
          {<StatusBadge status={capitalizeFirstLetter(value)} /> || "N/A"}
        </span>
      ),
    },
  ];

  // Table Actions
  const tableActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) =>
        navigate(
          `/account-settings/interviewer-groups/interviewer-group-details/${row._id}`
        ),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (row) =>
        navigate(
          `/account-settings/interviewer-groups/interviewer-group-edit-form/${row._id}`
        ),
    },
  ];

  const kanbanColumns = [
    {
      key: "description",
      header: "Description",
      render: (value, row) =>
        <span>{capitalizeFirstLetter(value)}</span> || "N/A",
    },
    {
      key: "numberOfUsers",
      header: "Members Count",
      render: (value, row) => <span>{value ?? 0}</span>,
    },
    {
      key: "usersNames",
      header: "Members",
      render: (value, row) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 3).map((name, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-custom-blue/10 text-custom-blue rounded-full text-xs"
            >
              {name}
            </span>
          ))}
          {value?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
              +{value.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (value, row) => (
        <span>
          {<StatusBadge status={capitalizeFirstLetter(value)} /> || "N/A"}
        </span>
      ),
    },
  ];

  const kanbanActions = [
    {
      key: "view",
      label: "View Details",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (item) =>
        navigate(
          `/account-settings/interviewer-groups/interviewer-group-details/${item._id}`
        ),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-600" />,
      onClick: (item) =>
        navigate(
          `/account-settings/interviewer-groups/interviewer-group-edit-form/${item._id}`
        ),
    },
  ];

  return (
    <>
      {/* v1.0.2 <-------------------------------------------------------------------------- */}
      <div>
        <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg sm:mt-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-custom-blue"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-custom-blue">
                Interviewer Groups
              </h3>
              <div className="mt-2 text-sm text-custom-blue">
                <p>
                  Create specialized interviewer groups for different assessment
                  types:
                </p>
                {/* v1.0.1 <---------------------------------------------------------------------------------------------------------------------------- */}
                <ul className="list-disc list-inside mt-2 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-y-1 gap-x-16">
                  {/* v1.0.1 -----------------------------------------------------------------------------------------------------------------------------> */}
                  <li>
                    Group interviewers by expertise (Frontend, Backend, etc.)
                  </li>
                  <li>Manage technical and non-technical interview panels</li>
                  <li>Organize interviewers by seniority levels</li>
                  <li>Track group-specific interview metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex mb-2 mt-2 flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="sm:text-md md:text-md lg:text-lg xl:text-lg 2xl:text-lg font-bold">
            Interviewer Groups
          </h2>
          <button
            onClick={() => {
              navigate(
                `/account-settings/interviewer-groups/interviewer-group-form`
              );
            }}
            className="text-sm px-4 py-2 bg-custom-blue text-white rounded-lg  whitespace-nowrap"
          >
            Create Group
          </button>
        </div>
        <div>
          <Toolbar
            view={view}
            setView={setView}
            searchQuery={searchQuery}
            onSearch={handleSearch}
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevPage={handlePrevPage}
            onNextPage={handleNextPage}
            dataLength={totalItems}
            searchPlaceholder="Search Groups or Members..."
            onFilterClick={handleFilterIconClick}
            isFilterPopupOpen={isFilterPopupOpen}
            isFilterActive={isFilterActive}
            filterIconRef={filterIconRef}
          />
        </div>
        {view === "table" ? (
          <div className="w-full overflow-x-auto sm:max-h-[calc(100vh-240px)] md:max-h-[calc(100vh-208px)] lg:max-h-[calc(100vh-192px)]">
            {/* v1.0.8 ----------------------------------------------------------------------------------------------> */}
            <TableView
              data={currentGroups}
              columns={tableColumns}
              loading={groupsLoading}
              actions={tableActions}
              emptyState={emptyStateMessage}
            />
          </div>
        ) : (
          <div>
            <KanbanView
              loading={groupsLoading}
              data={currentGroups.map((group) => ({
                ...group,
                id: group._id,
                title: group?.name || "N/A",
                navigateTo: `/account-settings/interviewer-groups/interviewer-group-details/${group._id}`,
              }))}
              columns={kanbanColumns}
              renderActions={(item) => (
                <KanbanActionsMenu item={item} kanbanActions={kanbanActions} />
              )}
              emptyState={emptyStateMessage}
              kanbanTitle="Interviewer Group"
            />
          </div>
          // <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
          //   {groups.map((group) => (
          //     <div
          //       key={group._id}
          //       className="bg-white p-6 sm:p-6 rounded-2xl shadow-lg hover:shadow-xl relative"
          //     >
          //       <div className="flex justify-between items-start">
          //         <div>
          //           <h3 className="text-md font-medium max-w-[200px] truncate">
          //             {group.name
          //               ? group.name.charAt(0).toUpperCase() +
          //                 group.name.slice(1)
          //               : "N/A"}
          //           </h3>
          //           {/* <p className="text-gray-500 mt-1 text-sm">{group.description}</p> */}
          //         </div>
          //         <span
          //           className={`px-2 py-1 text-xs rounded-full ${
          //             group.status === "active"
          //               ? "bg-green-100 text-green-800"
          //               : "bg-gray-100 text-gray-800"
          //           }`}
          //         >
          //           {group.status
          //             ? group.status.charAt(0).toUpperCase() +
          //               group.status.slice(1)
          //             : "N/A"}
          //         </span>
          //       </div>

          //       <div className="mt-4 mb-8">
          //         <p className="text-sm text-gray-500">
          //           {group.numberOfUsers > 1 ? "Members:" : "Member:"}{" "}
          //           {group.numberOfUsers}
          //         </p>
          //         <div className="mt-2 flex flex-wrap gap-2">
          //           {group.usersNames.map((member, index) => (
          //             <span
          //               key={index}
          //               className="px-2 py-1 bg-custom-blue/10 rounded-full text-sm text-custom-blue font-semibold"
          //             >
          //               {member}
          //             </span>
          //           ))}
          //           {group.usersNames.length > 3 && (
          //             <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
          //               +{group.usersNames.length - 3} more
          //             </span>
          //           )}
          //         </div>
          //       </div>

          //       <div className="absolute bottom-2 right-2 mt-6 flex justify-end space-x-2">
          //         <ViewDetailsButton
          //           onClick={() => {
          //             navigate(
          //               `/account-settings/interviewer-groups/interviewer-group-details/${group._id}`
          //             );
          //           }}
          //         />
          //         <EditButton
          //           onClick={() => {
          //             navigate(
          //               `/account-settings/interviewer-groups/interviewer-group-edit-form/${group._id}`
          //             );
          //           }}
          //         />
          //       </div>
          //     </div>
          //   ))}
          // </div>
        )}
        {isFilterPopupOpen && (
          <FilterPopup
            isOpen={isFilterPopupOpen}
            onClose={() => setIsFilterPopupOpen(false)}
            onApply={handleApplyFilters}
            onClearAll={handleClearAll}
            filterIconRef={filterIconRef}
            customHeight="h-[calc(100vh-22rem)]"
          >
            <div className="space-y-3">
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
                    {/* Assuming statuses are ['active', 'inactive'] */}
                    {["active", "inactive"].map((status) => (
                      <label
                        key={status}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedStatus.includes(status)}
                          onChange={() => handleStatusToggle(status)}
                          className="h-4 w-4 rounded accent-custom-blue focus:ring-custom-blue"
                        />
                        <span className="text-sm">
                          {capitalizeFirstLetter(status)}
                        </span>
                      </label>
                    ))}
                    {["active", "inactive"].length === 0 && (
                      <span className="text-sm text-gray-500">
                        No statuses available
                      </span>
                    )}
                  </div>
                )}
              </div>
              {/* Add more filter sections here if needed (e.g., Members Count) */}
            </div>
          </FilterPopup>
        )}
      </div>
      {/* v1.0.2 --------------------------------------------------------------------------> */}
      <Outlet />
    </>
  );
};

export default InterviewerGroups;
