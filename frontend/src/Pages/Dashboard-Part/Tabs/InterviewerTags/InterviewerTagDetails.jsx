import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Tag,
  Calendar,
  Layers,
  Palette,
  FileText,
  CheckCircle,
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
      <SidebarPopup
        title="Interviewer Tag Details"
        onClose={() => navigate(-1)}
      >
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
        </div>
      </SidebarPopup>
    );
  }

  if (isError || !tag) {
    return (
      <SidebarPopup
        title="Interviewer Tag Details"
        onClose={() => navigate(-1)}
      >
        <div className="text-center py-12">
          <p className="text-slate-500">Tag not found or an error occurred.</p>
        </div>
      </SidebarPopup>
    );
  }

  return (
    <SidebarPopup
      title={capitalizeFirstLetter(tag.name) || "Interviewer Tag Details"}
      onClose={() => navigate(-1)}
    >
      <div className="space-y-4 mt-8 mb-8">
        {/* Tag Information */}
        <div className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
          <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
            Tag Information
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Tag Name */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Tag className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tag Name</p>
                <p className="text-gray-700 truncate max-w-[200px]">
                  {capitalizeFirstLetter(tag.name)}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="text-gray-700">
                  {tag.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Layers className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <p className="text-gray-700 capitalize">
                  {tag.category || "N/A"}
                </p>
              </div>
            </div>

            {/* Color */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Palette className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex flex-col items-start gap-2">
                <p className="text-sm text-gray-500">Color</p>
                <div className="flex items-center gap-2">
                  <p className="text-gray-700">{tag.color}</p>
                  <span
                    className="h-5 w-5 rounded-full border"
                    style={{ backgroundColor: tag.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
          <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
            Description
          </h4>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-custom-bg rounded-lg">
              <FileText className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-gray-600 text-sm whitespace-normal break-all">
                {capitalizeFirstLetter(tag.description) ||
                  "No description provided"}
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-white rounded-xl p-6 mx-4 shadow-sm border border-gray-100">
          <h4 className="sm:text-sm text-lg font-semibold text-gray-800 mb-4">
            Metadata
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
            {/* Created At */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Created At</p>
                <p className="text-gray-700">
                  {formatDateTime(tag?.createdAt)}
                </p>
              </div>
            </div>

            {/* Updated At */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-custom-bg rounded-lg">
                <Calendar className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="text-gray-700">
                  {formatDateTime(tag?.updatedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
  );
};

export default InterviewerTagDetails;
