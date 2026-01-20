import React, { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
  Tags,
  Search,
  MoreVertical,
  Trash2,
  Users,
  Info,
  CheckCircle,
  Eye,
  Pencil,
} from "lucide-react";
import Header from "../../../../Components/Shared/Header/Header";
import { usePermissions } from "../../../../Context/PermissionsContext";
import DropdownWithSearchField from "../../../../Components/FormFields/DropdownWithSearchField";
import {
  useInterviewerTags,
  useDeleteInterviewerTag,
} from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
import { notify } from "../../../../services/toastService";
import { createPortal } from "react-dom";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const InterviewerTags = () => {
  const navigate = useNavigate();
  const { effectivePermissions } = usePermissions();

  // --- API DATA FETCHING ---
  const { data: tags = [], isLoading } = useInterviewerTags();
  const deleteMutation = useDeleteInterviewerTag();

  // --- STATE MANAGEMENT ---
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const categoryLabels = {
    skill: "Skills",
    level: "Experience Level",
    department: "Department",
    certification: "Certifications",
    language: "Languages",
    other: "Other",
  };

  const handleDelete = async (id) => {
    try {
      await deleteMutation.mutateAsync(id);
      notify.success("Tag deleted successfully");
      setDeleteId(null);
    } catch (error) {
      notify.error("Failed to delete tag.");
      console.error("Delete error:", error);
    }
  };

  const filteredTags = tags.filter((tag) => {
    const matchesSearch =
      tag.name?.toLowerCase().includes(search.toLowerCase()) ||
      tag.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || tag.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getInterviewerCount = (tag) => {
    return tag.interviewer_count || 0;
  };

  const tagsByCategory = filteredTags.reduce((acc, tag) => {
    const category = tag.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(tag);
    return acc;
  }, {});

  const handleCreateTag = (team) => {
    navigate(`/interviewer-tags/tag-form`);
  };

  const handleViewTag = (team) => {
    navigate(`/interviewer-tags/tag-details/${team._id}`);
  };

  const handleEditTag = (team) => {
    navigate(`/interviewer-tags/tag-edit/${team._id}`);
  };

  const handleDeleteTag = (team) => {
    setDeleteId(team._id);
    setOpenMenuId(null);
  };

  return (
    <>
      <div className="px-8 p-6 mb-8">
        {/* Info Banner */}
        <div className="bg-teal-50 border border-teal-200 p-4 rounded-lg sm:mt-6 flex gap-3">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-teal-600"
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
          <p className="text-sm text-gray-700">
            <strong className="font-semibold text-teal-700">
              Interviewer Tags
            </strong>{" "}
            are the recommended way to categorize and match interviewers to
            specific interview rounds. Tags represent expertise areas like
            skills, certifications, experience levels, or languages. When
            setting up interview templates or positions, you can specify which
            tags are required for each round, and the system will automatically
            suggest matching interviewers. teams alongside{" "}
            <div className="mt-2 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <strong>Best for:</strong> Granular expertise matching, flexible
              interviewer assignment, cross-functional interview panels
            </div>
          </p>
        </div>

        {/* Header */}
        <div className="flex flex-col mb-4">
          <Header
            title="Interviewer Tags"
            onAddClick={handleCreateTag}
            addButtonText="Create Tag"
            canCreate={effectivePermissions.InterviewerTags?.Create}
          />
          <p className="text-slate-500">
            Categorize interviewers by expertise and skills
          </p>
        </div>

        {/* Filters */}
        <div className="flex justify-end gap-4 w-full mb-4 items-end">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgb(33,121,137)] focus:border-transparent h-10"
            />
          </div>

          <div className="w-64">
            <DropdownWithSearchField
              value={categoryFilter}
              options={[
                { value: "all", label: "All Categories" },
                ...Object.entries(categoryLabels).map(([val, label]) => ({
                  value: val,
                  label: label,
                })),
              ]}
              name="categoryFilter"
              onChange={(e) => setCategoryFilter(e.target.value)}
              placeholder="Filter by category"
              isSearchable={true}
            />
          </div>
        </div>

        {/* Tags List */}
        {isLoading ? (
          <div>
            {/* Shimmer Category Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full shimmer"></div>
              <div className="h-5 w-40 rounded shimmer"></div>
              <div className="h-4 w-8 rounded-full shimmer"></div>
            </div>

            <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="relative bg-white border border-slate-200 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full shimmer"></div>
                      <div className="space-y-2">
                        <div className="h-4 w-32 rounded shimmer"></div>
                        <div className="h-3 w-48 rounded shimmer"></div>
                      </div>
                    </div>
                    <div className="w-6 h-6 rounded shimmer"></div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="h-3 w-28 rounded shimmer"></div>
                    <div className="h-4 w-14 rounded-full shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <Tags className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900">
              No tags found
            </h3>
            <p className="text-slate-500 mt-1">
              Try adjusting your filters or create a new one.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
              <div key={category}>
                <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Tags className="w-5 h-5 text-[rgb(33,121,137)]" />
                  {categoryLabels[category] || category}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-slate-100 text-slate-600 rounded-full">
                    {categoryTags.length}
                  </span>
                </h2>
                <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {categoryTags.map((tag) => (
                    <div
                      key={tag.id}
                      className="relative bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color || "#94a3b8" }}
                          />
                          <div>
                            <h3 className="font-semibold text-slate-900 truncate max-w-[240px]">
                              {tag.name}
                            </h3>
                            {tag.description && (
                              <p
                                title={capitalizeFirstLetter(tag?.description)}
                                className="text-sm text-slate-500 mt-0.5 truncate max-w-[200px]"
                              >
                                {capitalizeFirstLetter(tag.description)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(
                                openMenuId === tag._id ? null : tag._id,
                              )
                            }
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 group-hover:text-slate-600"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {openMenuId === tag._id && (
                            <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 rounded-md shadow-lg z-10 py-1">
                              <span
                                onClick={() => handleViewTag(tag)}
                                className="flex items-center px-4 py-2 text-sm text-custom-blue hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye className="w-4 h-4 mr-2 text-custom-blue" />
                                View
                              </span>
                              <span
                                onClick={() => handleEditTag(tag)}
                                className="flex items-center px-4 py-2 text-sm text-green-500 hover:bg-slate-50 cursor-pointer"
                              >
                                <Pencil className="w-4 h-4 mr-2 text-green-500" />
                                Edit
                              </span>
                              <button
                                onClick={() => handleDeleteTag(tag)}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-2 text-red-500" />{" "}
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>{getInterviewerCount(tag)} Interviewers</span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            tag.is_active !== false
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tag.is_active !== false ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        {deleteId &&
          createPortal(
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Tag?
                </h3>
                <p className="text-slate-500 mt-2">
                  This action cannot be undone. This will permanently delete the
                  tag and remove it from all associated interviewers.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={deleteMutation.isLoading}
                    onClick={() => handleDelete(deleteId)}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                  >
                    {deleteMutation.isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
      <Outlet />
    </>
  );
};

export default InterviewerTags;
