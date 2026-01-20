import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Briefcase, Calendar, Tag } from "lucide-react";
import { useGetInterviewerTagById } from "../../../../../apiHooks/InterviewerTags/useInterviewerTags"; // Adjust import path as per your folder structure

const InterviewerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    data: interviewer,
    isLoading,
    isError,
  } = useGetInterviewerTagById(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#217989]"></div>
      </div>
    );
  }

  if (isError || !interviewer) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">
          Interviewer not found or an error occurred.
        </p>
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
    <div className="px-[8%] sm:px-[5%] md:px-[5%] mt-4 space-y-6 mb-12">
      {/* Header / Navigation */}
      <div className="flex flex-col items-start gap-4">
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm tracking-tight">
            Back to Interviewer Tags
          </span>
        </button>

        <div>
          <p className="text-slate-500 text-sm">
            Viewing detailed information for {interviewer.name}
          </p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#217989]/10 flex items-center justify-center">
              <User className="w-6 h-6 text-[#217989]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {interviewer.name}
              </h2>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  interviewer.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {interviewer.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
          {/* Action Footer */}
          <div>
            <button
              onClick={() => navigate(`/interviewer-tags/edit/${interviewer._id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-[#217989] hover:bg-[#1c6473] rounded-md transition-colors shadow-sm"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Contact Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm">
                  {interviewer.email || "No email provided"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Briefcase className="w-4 h-4" />
                <span className="text-sm">
                  {interviewer.designation || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Joined {new Date(interviewer.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Assigned Tags */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Expertise & Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {interviewer.tags && interviewer.tags.length > 0 ? (
                interviewer.tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-md border border-slate-200 text-sm font-medium"
                    style={{
                      borderLeft: `4px solid ${tag.color || "#cbd5e1"}`,
                    }}
                  >
                    <Tag className="w-3 h-3" />
                    {tag.name}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 italic">
                  No tags assigned
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDetails;
