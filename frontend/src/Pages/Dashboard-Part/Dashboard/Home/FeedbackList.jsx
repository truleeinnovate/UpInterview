//<-------v1.0.0--------Venkatesh-------feedback data fetching and display dynamically
// v1.0.1 - Ashok - Improved Loading from animate-pulse to shimmer effect
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - Fixed responsiveness issues

import React from "react";
import {
  MessageSquare,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useFeedbacks } from "../../../../apiHooks/useFeedbacks.js"; //<-------v1.0.0--------

const FeedbackList = () => {
  const navigate = useNavigate();
  //<-------v1.0.0--------
  // Fetch all feedbacks and take the latest 3 (useFeedbacks already returns newest first)
  const { data: feedbacksData, isLoading, error } = useFeedbacks();
  const recentFeedbacks = (feedbacksData || []).slice(0, 3);

  // Helpers
  const getCandidateName = (candidate) => {
    const first = candidate?.FirstName || "";
    const last = candidate?.LastName || "";
    const name = `${first} ${last}`.trim();
    return name || "Unknown";
  };

  const getInterviewerName = (item) => {
    return item?.interviewRoundId?.interviewerType === "Internal"
      ? `${item?.interviewerId?.firstName || ""} ${
          item?.interviewerId?.lastName || ""
        }`.trim() || "Not specified"
      : "External";
  };

  const getRatingLabel = (rating) => {
    if (rating === null || rating === undefined) return "Pending";
    if (rating >= 5) return "Excellent";
    if (rating >= 4) return "Good";
    if (rating >= 3) return "Average";
    if (rating >= 2) return "Below Average";
    return "Poor";
  };

  const renderRatingColorClass = (label) => {
    return label === "Excellent"
      ? "text-green-600"
      : label === "Good"
      ? "text-custom-blue"
      : "text-orange-600";
  };

  const getRecommendationBadgeClasses = (recRaw) => {
    const rec = (recRaw || "").toString().toLowerCase();
    if (["yes", "recommended", "recommend", "hire"].includes(rec))
      return "bg-green-100 text-green-600";
    if (["no", "not recommended", "reject", "do not hire"].includes(rec))
      return "bg-red-100 text-red-600";
    return "bg-amber-100 text-amber-600";
  };

  const getStatusBadgeClasses = (statusRaw) => {
    const s = (statusRaw || "").toString().toLowerCase();
    if (s === "submitted" || s === "completed")
      return "bg-green-100 text-green-600";
    if (s === "draft") return "bg-amber-100 text-amber-600";
    return "bg-slate-100 text-slate-600";
  };

  const formatDate = (dt) => {
    if (!dt) return "N/A";
    try {
      if (typeof dt === "string" && dt.includes(" ")) return dt.split(" ")[0];
      const d = new Date(dt);
      if (!isNaN(d.getTime())) return d.toLocaleDateString();
      return dt.toString();
    } catch {
      return dt.toString();
    }
  };

  const extractSkills = (item) =>
    Array.isArray(item?.skills) ? item.skills : [];
  const getStrengths = (item) =>
    extractSkills(item)
      .filter((s) => (s?.rating ?? s?.score ?? 0) >= 4)
      .map((s) => s?.skillName || s?.name || s?.skill || s?.label)
      .slice(0, 5);
  const getImprovements = (item) =>
    extractSkills(item)
      .filter((s) => (s?.rating ?? s?.score ?? 0) <= 2)
      .map((s) => s?.skillName || s?.name || s?.skill || s?.label)
      .slice(0, 5);

  //-------v1.0.0-------->

  return (
    <div className="bg-white/80 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-gray-200 col-span-2 hover:shadow-lg transition-all duration-300">
      {/* v1.0.2 <------------------------------------------------------------------------- */}
      <div className="flex items-center justify-between mb-8">
        <div className="sm:w-[60%]">
          <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
            Recent Feedback
          </h3>
          <p className="sm:text-xs text-gray-500 text-sm mt-1 sm:w-[90%]">
            Latest interview feedback and evaluations
          </p>
        </div>
        <button
          onClick={() => navigate("/feedback")}
          // className="sm:-mt-10 flex items-center space-x-2 text-sm text-custom-blue hover:text-custom-blue/80 font-medium bg-indigo-50 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
          className="flex items-center sm:space-x-1 space-x-2 bg-custom-blue text-white sm:text-xs px-3 py-1.5 sm:rounded-lg rounded-xl hover:bg-custom-blue/90 transition-all duration-300"
        >
          <span className="sm:hidden">View All Feedback</span>
          <span className="md:hidden lg:hidden xl:hidden 2xl:hidden sm:text-sm">
            View All
          </span>
          <ChevronRight className="w-[18px] h-[18px]" />
        </button>
      </div>
      {/* v1.0.2 -------------------------------------------------------------------------> */}

      <div className="space-y-6">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            Failed to load feedbacks
            {error?.message ? `: ${error.message}` : "."}
          </div>
        )}
        {isLoading ? (
          // v1.0.1 <------------------------------------------------------------------
          // <div className="space-y-4">
          //   <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          //   <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          //   <div className="h-28 bg-gray-100 rounded-xl animate-pulse" />
          // </div>
          <div className="space-y-4">
            <div className="h-28 bg-gray-100 rounded-xl shimmer" />
            <div className="h-28 bg-gray-100 rounded-xl shimmer" />
            <div className="h-28 bg-gray-100 rounded-xl shimmer" />
          </div>
        ) : // v1.0.1 ------------------------------------------------------------------>
        recentFeedbacks.length === 0 ? (
          <div className="text-sm text-gray-500">No feedback yet.</div>
        ) : (
          recentFeedbacks.map((item) => {
            const candidateName = getCandidateName(item?.candidateId);
            const positionTitle = item?.positionId?.title || "Unknown";
            const recommendation = item?.overallImpression?.recommendation;
            const feedbackNote =
              item?.overallImpression?.note || "No notes provided";
            const ratingVal = item?.overallImpression?.overallRating;
            const ratingLabel = getRatingLabel(ratingVal);
            const dateStr = formatDate(item?.interviewRoundId?.dateTime);
            const interviewerName = getInterviewerName(item);
            const strengths = getStrengths(item);
            const improvements = getImprovements(item);
            const badgeClasses = getRecommendationBadgeClasses(recommendation);
            const statusLabel =
              (item?.status === "submitted" ? "Completed" : item?.status) ||
              "N/A";
            const statusBadge = getStatusBadgeClasses(item?.status);

            return (
              // v1.0.3 <--------------------------------------------------------------------
              <div
                key={item?._id}
                className="border border-gray-100 rounded-xl p-6 hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300"
              >
                <div className="flex sm:flex-col sm:items-start items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {candidateName}
                      </h4>
                      <div className="flex gap-2">
                        {recommendation && (
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium ${badgeClasses}`}
                          >
                            {String(recommendation).charAt(0).toUpperCase() +
                              String(recommendation).slice(1)}
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadge}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{positionTitle}</p>
                  </div>
                  <span
                    className={`sm:mt-2 text-sm font-medium ${renderRatingColorClass(
                      ratingLabel
                    )}`}
                  >
                    <span className="text-gray-500 sm:inline hidden mr-1">
                      Rating:
                    </span>
                    {ratingLabel}
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MessageSquare size={18} className="text-gray-400 mt-1" />
                    <p className="text-sm text-gray-700">{feedbackNote}</p>
                  </div>

                  {(strengths.length > 0 || improvements.length > 0) && (
                    <div className="grid grid-cols-2 gap-4">
                      {strengths.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <ThumbsUp size={16} className="text-green-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Strengths
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {strengths.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded-lg"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {improvements.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <ThumbsDown size={16} className="text-orange-500" />
                            <span className="text-sm font-medium text-gray-700">
                              Areas for Improvement
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {improvements.map((s, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-orange-50 text-orange-600 px-2.5 py-1 rounded-lg"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <User size={16} />
                      <span>Interviewed by {interviewerName}</span>
                    </div>
                    <span className="text-sm text-gray-500">{dateStr}</span>
                  </div>
                </div>
              </div>
              // v1.0.3 -------------------------------------------------------------------->
            );
          })
        )}
      </div>
    </div>
  );
};

export default FeedbackList;
//-------v1.0.0-------->
