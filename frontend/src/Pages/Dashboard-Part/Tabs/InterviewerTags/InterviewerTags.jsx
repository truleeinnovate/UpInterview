// import React, { useState } from "react";
// import { Link, useNavigate, Outlet } from "react-router-dom";
// import {
//   Tags,
//   Search,
//   MoreVertical,
//   Trash2,
//   Users,
//   Info,
//   CheckCircle,
//   Eye,
//   Pencil,
// } from "lucide-react";
// import Header from "../../../../Components/Shared/Header/Header";
// import { usePermissions } from "../../../../Context/PermissionsContext";
// import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
// import {
//   useInterviewerTags,
//   useDeleteInterviewerTag,
// } from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
// import { notify } from "../../../../services/toastService";
// import { createPortal } from "react-dom";
// import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
// import InfoGuide from "../CommonCode-AllTabs/InfoCards";

// const InterviewerTags = () => {
//   const navigate = useNavigate();
//   const { effectivePermissions } = usePermissions();

//   // --- API DATA FETCHING ---
//   const { data: tags = [], isLoading } = useInterviewerTags();
//   const deleteMutation = useDeleteInterviewerTag();

//   // --- STATE MANAGEMENT ---
//   const [search, setSearch] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [deleteId, setDeleteId] = useState(null);
//   const [openMenuId, setOpenMenuId] = useState(null);

//   const categoryLabels = {
//     skill: "Skills",
//     level: "Experience Level",
//     department: "Department",
//     certification: "Certifications",
//     language: "Languages",
//     other: "Other",
//   };

//   const handleDelete = async (id) => {
//     try {
//       await deleteMutation.mutateAsync(id);
//       notify.success("Tag deleted successfully");
//       setDeleteId(null);
//     } catch (error) {
//       notify.error("Failed to delete tag.");
//       console.error("Delete error:", error);
//     }
//   };

//   const filteredTags = tags.filter((tag) => {
//     const matchesSearch =
//       tag.name?.toLowerCase().includes(search.toLowerCase()) ||
//       tag.description?.toLowerCase().includes(search.toLowerCase());
//     const matchesCategory =
//       categoryFilter === "all" || tag.category === categoryFilter;
//     return matchesSearch && matchesCategory;
//   });

//   const getInterviewerCount = (tag) => {
//     return tag.interviewer_count || 0;
//   };

//   const tagsByCategory = filteredTags.reduce((acc, tag) => {
//     const category = tag.category || "other";
//     if (!acc[category]) acc[category] = [];
//     acc[category].push(tag);
//     return acc;
//   }, {});

//   const handleCreateTag = (team) => {
//     navigate(`/interviewer-tags/tag-form`);
//   };

//   const handleViewTag = (team) => {
//     navigate(`/interviewer-tags/tag-details/${team._id}`);
//   };

//   const handleEditTag = (team) => {
//     navigate(`/interviewer-tags/tag-edit/${team._id}`);
//   };

//   const handleDeleteTag = (team) => {
//     setDeleteId(team._id);
//     setOpenMenuId(null);
//   };

//   return (
//     <>
//       <div className="px-8 p-6 mb-8">
//         {/* Info Banner */}
//         <InfoGuide
//           title="Interviewer Tags info"
//           showBullets={false}
//           items={[
//             <>
//               <p className="text-sm text-gray-700">
//                 <strong className="font-semibold text-teal-700 mr-1">
//                   Interviewer Tags
//                 </strong>
//                 are the recommended way to categorize and match interviewers to
//                 specific interview rounds. Tags represent expertise areas like
//                 skills, certifications, experience levels, or languages. When
//                 setting up interview templates or positions, you can specify
//                 which tags are required for each round, and the system will
//                 automatically suggest matching interviewers. teams alongside
//                 <div className="mt-2 flex items-start gap-2">
//                   <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
//                   <strong>Best for:</strong> Granular expertise matching,
//                   flexible interviewer assignment, cross-functional interview
//                   panels
//                 </div>
//               </p>
//             </>,
//           ]}
//         />

//         {/* Header */}
//         <div className="flex flex-col mb-4">
//           <Header
//             title="Interviewer Tags"
//             onAddClick={handleCreateTag}
//             addButtonText="Create Tag"
//             canCreate={effectivePermissions.InterviewerTags?.Create}
//           />
//           <p className="text-slate-500">
//             Categorize interviewers by expertise and skills
//           </p>
//         </div>

//         {/* Filters */}
//         <div className="flex justify-end gap-4 w-full mb-4 items-end">
//           <div className="relative w-80">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//             <input
//               type="text"
//               placeholder="Search tags..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent h-10"
//             />
//           </div>

//           <div className="w-64">
//             <DropdownWithSearchField
//               value={categoryFilter}
//               options={[
//                 { value: "all", label: "All Categories" },
//                 ...Object.entries(categoryLabels).map(([val, label]) => ({
//                   value: val,
//                   label: label,
//                 })),
//               ]}
//               name="categoryFilter"
//               onChange={(e) => setCategoryFilter(e.target.value)}
//               placeholder="Filter by category"
//               isSearchable={true}
//             />
//           </div>
//         </div>

//         {/* Tags List */}
//         {isLoading ? (
//           <div>
//             {/* Shimmer Category Header */}
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-5 h-5 rounded-full shimmer"></div>
//               <div className="h-5 w-40 rounded shimmer"></div>
//               <div className="h-4 w-8 rounded-full shimmer"></div>
//             </div>

//             <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
//               {[1, 2, 3, 4].map((i) => (
//                 <div
//                   key={i}
//                   className="relative bg-white border border-slate-200 rounded-xl p-5"
//                 >
//                   <div className="flex items-start justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="w-5 h-5 rounded-full shimmer"></div>
//                       <div className="space-y-2">
//                         <div className="h-4 w-32 rounded shimmer"></div>
//                         <div className="h-3 w-48 rounded shimmer"></div>
//                       </div>
//                     </div>
//                     <div className="w-6 h-6 rounded shimmer"></div>
//                   </div>
//                   <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
//                     <div className="h-3 w-28 rounded shimmer"></div>
//                     <div className="h-4 w-14 rounded-full shimmer"></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : filteredTags.length === 0 ? (
//           <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center">
//             <Tags className="w-16 h-16 mx-auto text-slate-300 mb-4" />
//             <h3 className="text-lg font-semibold text-slate-900">
//               No tags found
//             </h3>
//             <p className="text-slate-500 mt-1">
//               Try adjusting your filters or create a new one.
//             </p>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
//               <div key={category}>
//                 <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
//                   <Tags className="w-5 h-5 text-[rgb(33,121,137)]" />
//                   {categoryLabels[category] || category}
//                   <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
//                     {categoryTags.length}
//                   </span>
//                 </h2>
//                 <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
//                   {categoryTags.map((tag) => (
//                     <div
//                       key={tag.id}
//                       className="relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
//                     >
//                       <div className="flex items-start justify-between">
//                         <div className="flex items-center gap-3">
//                           <div
//                             className="w-5 h-5 rounded-full flex-shrink-0"
//                             style={{ backgroundColor: tag.color || "#94a3b8" }}
//                           />
//                           <div>
//                             <h3 className="font-semibold text-slate-900 truncate max-w-[240px]">
//                               {tag.name}
//                             </h3>
//                             {tag.description && (
//                               <p
//                                 title={capitalizeFirstLetter(tag?.description)}
//                                 className="text-sm text-slate-500 mt-0.5 truncate max-w-[200px]"
//                               >
//                                 {capitalizeFirstLetter(tag.description)}
//                               </p>
//                             )}
//                           </div>
//                         </div>

//                         <div className="relative">
//                           <button
//                             onClick={() =>
//                               setOpenMenuId(
//                                 openMenuId === tag._id ? null : tag._id,
//                               )
//                             }
//                             className="p-1 rounded-md hover:bg-slate-100 text-slate-400 group-hover:text-slate-600"
//                           >
//                             <MoreVertical className="w-4 h-4" />
//                           </button>
//                           {openMenuId === tag._id && (
//                             <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
//                               <span
//                                 onClick={() => handleViewTag(tag)}
//                                 className="flex items-center px-4 py-2 text-sm text-custom-blue hover:bg-slate-50 cursor-pointer"
//                               >
//                                 <Eye className="w-4 h-4 mr-2 text-custom-blue" />
//                                 View
//                               </span>
//                               <span
//                                 onClick={() => handleEditTag(tag)}
//                                 className="flex items-center px-4 py-2 text-sm text-green-500 hover:bg-slate-50 cursor-pointer"
//                               >
//                                 <Pencil className="w-4 h-4 mr-2 text-green-500" />
//                                 Edit
//                               </span>
//                               <button
//                                 onClick={() => handleDeleteTag(tag)}
//                                 className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
//                               >
//                                 <Trash2 className="w-4 h-4 mr-2 text-red-500" />{" "}
//                                 Delete
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
//                         <div className="flex items-center gap-2 text-sm text-slate-600">
//                           <Users className="w-4 h-4 text-slate-400" />
//                           <span>{getInterviewerCount(tag)} Interviewers</span>
//                         </div>
//                         <span
//                           className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                             tag.is_active !== false
//                               ? "bg-emerald-100 text-emerald-700"
//                               : "bg-slate-100 text-slate-600"
//                           }`}
//                         >
//                           {tag.is_active !== false ? "Active" : "Inactive"}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Delete Confirmation Dialog */}
//         {deleteId &&
//           createPortal(
//             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
//               <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
//                 <h3 className="text-xl font-bold text-slate-900">
//                   Delete Tag?
//                 </h3>
//                 <p className="text-slate-500 mt-2">
//                   This action cannot be undone. This will permanently delete the
//                   tag and remove it from all associated interviewers.
//                 </p>
//                 <div className="mt-6 flex justify-end gap-3">
//                   <button
//                     onClick={() => setDeleteId(null)}
//                     className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     disabled={deleteMutation.isLoading}
//                     onClick={() => handleDelete(deleteId)}
//                     className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
//                   >
//                     {deleteMutation.isLoading ? "Deleting..." : "Delete"}
//                   </button>
//                 </div>
//               </div>
//             </div>,
//             document.body,
//           )}
//       </div>
//       <Outlet />
//     </>
//   );
// };

// export default InterviewerTags;

import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import {
  CheckCircle,
  Eye,
  MoreVertical,
  Pencil,
  Trash,
  Users,
} from "lucide-react";

// Components
import Header from "../../../../Components/Shared/Header/Header";
import Toolbar from "../../../../Components/Shared/Toolbar/Toolbar";
import TableView from "../../../../Components/Shared/Table/TableView";
import KanbanView from "../../../../Components/Shared/KanbanCommon/KanbanCommon.jsx";
import { FilterPopup } from "../../../../Components/Shared/FilterPopup/FilterPopup.jsx";
import InfoGuide from "../CommonCode-AllTabs/InfoCards";
import DeleteConfirmModal from "../../../Dashboard-Part/Tabs/CommonCode-AllTabs/DeleteConfirmModal.jsx";

// Hooks & Utilities
import { usePermissions } from "../../../../Context/PermissionsContext";
import {
  useInterviewerTags,
  useDeleteInterviewerTag,
} from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
import { notify } from "../../../../services/toastService";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import StatusBadge from "../../../../Components/SuperAdminComponents/common/StatusBadge.jsx";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField.jsx";

const KanbanActionsMenu = ({ item, kanbanActions }) => {
  const [isKanbanMoreOpen, setIsKanbanMoreOpen] = useState(false);
  const menuRef = useRef(null);

  const mainActions = kanbanActions.filter((a) =>
    ["view", "edit"].includes(a.key),
  );
  const overflowActions = kanbanActions.filter(
    (a) => !["view", "edit"].includes(a.key),
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setIsKanbanMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="flex items-center gap-2 relative">
      {mainActions.map((action) => (
        <button
          key={action.key}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(item);
          }}
          className={`p-1.5 rounded-lg transition-colors ${
            action.key === "view"
              ? "text-custom-blue hover:bg-custom-blue/10"
              : "text-green-600 hover:bg-green-600/10"
          }`}
          title={action.label}
        >
          {action.icon}
        </button>
      ))}
      {overflowActions.length > 0 && (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsKanbanMoreOpen(!isKanbanMoreOpen);
            }}
            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {isKanbanMoreOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsKanbanMoreOpen(false);
                    action.onClick(item);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <span className="mr-2">{action.icon}</span>
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

const InterviewerTags = () => {
  const navigate = useNavigate();
  const { effectivePermissions } = usePermissions();
  const filterIconRef = useRef(null);

  // --- API DATA ---
  const { data: tags = [], isLoading, refetch } = useInterviewerTags();
  const deleteMutation = useDeleteInterviewerTag();

  // --- STATE ---
  const [view, setView] = useState("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tagToDelete, setTagToDelete] = useState(null);

  const ITEMS_PER_PAGE = 10;

  const categoryLabels = useMemo(
    () => ({
      skill: "Skills",
      level: "Experience Level",
      department: "Department",
      certification: "Certifications",
      language: "Languages",
      other: "Other",
    }),
    [],
  );

  const defaultFilters = { category: [] };
  const [selectedFilters, setSelectedFilters] = useState(defaultFilters);
  const [tempFilters, setTempFilters] = useState(defaultFilters);

  // Change this to reflect we are selecting a category
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 1. Prepare options based on CATEGORIES
  const categoryOptions = useMemo(() => {
    const options = Object.entries(categoryLabels).map(([key, label]) => ({
      value: key,
      label: label,
    }));
    return [{ value: "all", label: "All Categories" }, ...options];
  }, [categoryLabels]);

  // --- FILTER LOGIC ---
  const processedData = useMemo(() => {
    let result = [...tags];

    // Dropdown Category Filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (t) => (t.category || "other") === selectedCategory,
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query),
      );
    }

    // Popup checkbox filter
    if (selectedFilters.category.length > 0) {
      result = result.filter((t) =>
        selectedFilters.category.includes(t.category || "other"),
      );
    }

    return result;
  }, [tags, searchQuery, selectedFilters, selectedCategory]);

  const paginatedData = processedData.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE,
  );
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);

  // --- ACTIONS ---
  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(tagToDelete._id);
      notify.success("Tag deleted successfully");
      setShowDeleteModal(false);
      refetch();
    } catch (error) {
      notify.error("Failed to delete tag");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Tag Name",
      render: (val, row) => (
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(`tag-details/${row._id}`)}
        >
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: row.color || "#94a3b8" }}
          />
          <span className="text-custom-blue font-medium">
            {capitalizeFirstLetter(val)}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (val) =>
        capitalizeFirstLetter(categoryLabels[val]) ||
        capitalizeFirstLetter(val),
    },
    {
      key: "description",
      header: "Description",
      render: (val) => (
        <div
          className="max-w-xs truncate cursor-default"
          title={capitalizeFirstLetter(val)}
        >
          {capitalizeFirstLetter(val) || "No description"}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (val) => (
        <span>
          {val !== false ? (
            <StatusBadge status="Active" />
          ) : (
            <StatusBadge status="Inactive" />
          )}
        </span>
      ),
    },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      icon: <Eye className="w-4 h-4 text-custom-blue" />,
      onClick: (row) => navigate(`tag-details/${row._id}`),
    },
    {
      key: "edit",
      label: "Edit",
      icon: <Pencil className="w-4 h-4 text-green-500" />,
      onClick: (row) => navigate(`tag-edit/${row._id}`),
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash className="w-4 h-4 text-red-500" />,
      onClick: (row) => {
        setTagToDelete(row);
        setShowDeleteModal(true);
      },
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen overflow-hidden">
      <div className="px-6 mt-6">
        <InfoGuide
          title="Interviewer Tags info"
          showBullets={false}
          items={[
            <>
              <p className="text-sm text-gray-700">
                <strong className="font-semibold text-teal-700 mr-1">
                  Interviewer Tags
                </strong>
                are the recommended way to categorize and match interviewers to
                specific interview rounds. Tags represent expertise areas like
                skills, certifications, experience levels, or languages. When
                setting up interview templates or positions, you can specify
                which tags are required for each round, and the system will
                automatically suggest matching interviewers. teams alongside
                <div className="mt-2 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <strong>Best for:</strong> Granular expertise matching,
                  flexible interviewer assignment, cross-functional interview
                  panels
                </div>
              </p>
            </>,
          ]}
        />
        <Header
          title="Interviewer Tags"
          onAddClick={() => navigate(`/interviewer-tags/tag-form`)}
          addButtonText="Create Tag"
          canCreate={effectivePermissions.InterviewerTags?.Create}
        />

        <Toolbar
          view={view}
          setView={setView}
          searchQuery={searchQuery}
          onSearch={(e) => setSearchQuery(e.target.value)}
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevPage={() => setCurrentPage((p) => Math.max(0, p - 1))}
          onNextPage={() =>
            setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
          }
          onFilterClick={() => setIsFilterPopupOpen(!isFilterPopupOpen)}
          isFilterActive={
            JSON.stringify(selectedFilters) !== JSON.stringify(defaultFilters)
          }
          isFilterPopupOpen={isFilterPopupOpen}
          dataLength={processedData.length}
          filterIconRef={filterIconRef}
          startContent={
            <div className="w-64">
              <DropdownWithSearchField
                options={categoryOptions}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(0); // Reset to first page on filter change
                }}
                placeholder="Filter by Category"
                isSearchable={true}
              />
            </div>
          }
        />
      </div>
      <div className="flex-grow bg-background">
        {view === "table" ? (
          <TableView
            data={paginatedData}
            columns={columns}
            actions={actions}
            emptyState="No Tags found."
            isLoading={isLoading}
          />
        ) : (
          <KanbanView
            loading={isLoading}
            data={paginatedData.map((t) => ({
              ...t,
              id: t._id,
              title: t.name,
              subTitle: categoryLabels[t.category] || t.category,
              description: t.description,
              navigateTo: `tag-details/${t._id}`,
            }))}
            columns={columns}
            renderActions={(item) => (
              <KanbanActionsMenu item={item} kanbanActions={actions} />
            )}
            customHeight="calc(100vh - 100px)"
            emptyState="No Tags Found"
            kanbanTitle="Interviewer Tag"
          />
        )}
      </div>

      <FilterPopup
        isOpen={isFilterPopupOpen}
        onClose={() => setIsFilterPopupOpen(false)}
        onApply={() => {
          setSelectedFilters(tempFilters);
          setIsFilterPopupOpen(false);
        }}
        onClearAll={() => {
          setTempFilters(defaultFilters);
          setSelectedFilters(defaultFilters);
          setIsFilterPopupOpen(false);
        }}
        filterIconRef={filterIconRef}
      >
        <div className="p-4">
          <h4 className="font-semibold mb-2">Category</h4>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <label
              key={key}
              className="flex gap-2 text-sm cursor-pointer py-1 hover:text-custom-blue"
            >
              <input
                type="checkbox"
                className="accent-custom-blue"
                checked={tempFilters.category.includes(key)}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...tempFilters.category, key]
                    : tempFilters.category.filter((i) => i !== key);
                  setTempFilters({ ...tempFilters, category: next });
                }}
              />
              {label}
            </label>
          ))}
        </div>
      </FilterPopup>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Tag"
        entityName={tagToDelete?.name}
      />

      <Outlet />
    </div>
  );
};

export default InterviewerTags;
