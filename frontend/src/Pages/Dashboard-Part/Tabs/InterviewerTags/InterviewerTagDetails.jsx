import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Tag,
  Calendar,
  Layers,
  Palette,
  FileText,
} from "lucide-react";
import { useGetInterviewerTagById } from "../../../../apiHooks/InterviewerTags/useInterviewerTags";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";

const InterviewerTagDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  useScrollLock(!!id);

  const { data: tag, isLoading, isError } = useGetInterviewerTagById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217989]"></div>
      </div>
    );
  }

  if (isError || !tag) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Tag not found or an error occurred.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-[#217989] font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <SidebarPopup
      title="Interviewer Tag Details"
      subTitle={`Viewing details for "${tag.name}"`}
      onClose={() => navigate(-1)}
    >
      <div className="mt-4 space-y-6 mb-12">
        {/* Tag Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${tag.color}20` }}
              >
                <Tag className="w-6 h-6" style={{ color: tag.color }} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{tag.name}</h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tag.is_active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tag.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid md:grid-cols-2 gap-8">
            {/* Tag Information */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">
                Tag Information
              </h3>

              {/* Description */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Description</p>
                <div className="flex items-start gap-3 text-slate-600">
                  <FileText className="w-4 h-4 mt-0.5" />
                  <span className="text-sm">
                    {capitalizeFirstLetter(tag.description) ||
                      "No description provided"}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Category</p>
                <div className="flex items-center gap-3 text-slate-600">
                  <Layers className="w-4 h-4" />
                  <span className="text-sm capitalize">
                    {tag.category || "N/A"}
                  </span>
                </div>
              </div>

              {/* Color */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Color</p>
                <div className="flex items-center gap-3 text-slate-600">
                  <Palette className="w-4 h-4" />
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{tag.color}</span>
                    <span
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: tag.color }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Meta Information */}
            <div className="space-y-5">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b pb-2">
                Meta Information
              </h3>

              {/* Created At */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Created At</p>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDateTime(tag?.createdAt)}
                  </span>
                </div>
              </div>

              {/* Updated At */}
              <div>
                <p className="text-xs text-slate-400 mb-1">Last Updated</p>
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDateTime(tag?.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default InterviewerTagDetails;
