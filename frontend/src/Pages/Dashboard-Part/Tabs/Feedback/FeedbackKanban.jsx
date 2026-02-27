import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Star } from "lucide-react";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

// Extract Feedback Card as a separate component for reusability
const FeedbackCard = ({ item, onView, onEdit, tokenPayload }) => {
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "Strong Hire":
        return "bg-green-100 text-green-800 border-green-300";
      case "Hire":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Maybe":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "No Hire":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />,
      );
    }
    return stars;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "draft":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <div className="bg-white rounded-lg p-3 mb-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer">
      {/* Header with Avatar */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-6 h-6 bg-[#217989] rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {capitalizeFirstLetter(item.candidateId?.FirstName?.[0] || "U")}
          </div>
          <div className="ml-2 min-w-0">
            <p className="font-medium text-xs text-gray-900 truncate">
              {capitalizeFirstLetter(item.candidateId?.FirstName || "")}{" "}
              {capitalizeFirstLetter(item.candidateId?.LastName || "")}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {item.positionId?.title || "No Position"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="flex items-center gap-2 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="text-custom-blue hover:bg-custom-blue/10 p-2 rounded-md transition-colors"
            onClick={() => onView(item)}
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>

          {item.status === "draft" &&
            item?.ownerId?._id === tokenPayload?.userId && (
              <button
                className="text-green-600 hover:bg-green-50 p-2 rounded-md transition-colors"
                onClick={() => onEdit(item)}
                title="Edit Feedback"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
        </div>
      </div>

      {/* Interviewer and Date */}
      <div className="space-y-3">
        <div className="grid grid-cols-2">
          <p className="text-xs text-gray-500">Interviewer</p>
          <p className="text-xs text-gray-800 font-medium truncate max-w-[140px]">
            <span className="truncate">
              {capitalizeFirstLetter(item.interviewerId?.firstName || "N/A")}
            </span>
          </p>
        </div>
        <div className="grid grid-cols-2">
          <p className="text-xs text-gray-500">Date</p>
          <p className="text-xs text-gray-800 font-medium truncate max-w-[140px]">
            <span className="truncate">
              {formatDate(item.interviewRoundId?.dateTime)}
            </span>
          </p>
        </div>

        {/* Rating and Status */}
        {item.overallImpression?.overallRating > 0 ? (
          <div className="grid grid-cols-2">
            <p className="text-xs text-gray-500">Rating</p>
            <p className="flex items-center text-xs text-gray-800 font-medium">
              {renderStars(item.overallImpression.overallRating)}
            </p>
          </div>
        ) : (
          <div></div>
        )}
        <div className="grid grid-cols-2 justify-start">
          <p className="text-xs text-gray-500">Status</p>
          <p className="flex items-center justify-start gap-1 text-xs font-medium text-gray-700">
            {getStatusIcon(item.status)} {capitalizeFirstLetter(item.status)}
          </p>
        </div>

        {/* Recommendation Badge */}
        {item.overallImpression?.recommendation && (
          <div className="grid grid-cols-2 items-center">
            <p className="text-xs text-gray-500">Recommendation</p>

            <p
              className={`inline-flex items-center gap-1 
                px-1.5 py-0.5 text-xs font-semibold 
                rounded-full border text-gray-600
                w-fit max-w-full truncate
                ${getRecommendationColor(item.overallImpression.recommendation)}`}
            >
              {item.overallImpression.recommendation}
            </p>
          </div>
        )}

        {/* Comments */}
        {item.generalComments && (
          <div className="grid grid-cols-2 items-start">
            <p className="text-xs text-gray-500">Comments</p>

            <p
              className="min-w-0 text-xs text-gray-600 break-words truncate max-w-full"
              title={capitalizeFirstLetter(item.generalComments)}
            >
              {capitalizeFirstLetter(item.generalComments)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const FeedbackKanban = ({ feedbacks, loading, onView, onEdit }) => {
  const [filteredData, setFilteredData] = useState([]);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  useEffect(() => {
    if (feedbacks) {
      setFilteredData(feedbacks);
    }
  }, [feedbacks]);

  const columns = [
    {
      id: "draft",
      title: "Pending Review",
      status: "draft",
      bgColor: "bg-yellow-50",
      headerColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200",
    },
    {
      id: "strong-hire",
      title: "Strong Hire",
      recommendation: "Strong Hire",
      bgColor: "bg-green-50",
      headerColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200",
    },
    {
      id: "hire",
      title: "Hire",
      recommendation: "Hire",
      bgColor: "bg-blue-50",
      headerColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200",
    },
    {
      id: "maybe",
      title: "Maybe",
      recommendation: "Maybe",
      bgColor: "bg-purple-50",
      headerColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-200",
    },
    {
      id: "no-hire",
      title: "No Hire",
      recommendation: "No Hire",
      bgColor: "bg-red-50",
      headerColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200",
    },
  ];

  const getColumnItems = (column) => {
    return filteredData.filter((item) => {
      // Check by status first (for draft)
      if (column.status) {
        return item.status === column.status;
      }

      // Check by recommendation from overallImpression
      if (column.recommendation) {
        const recommendation = item.overallImpression?.recommendation;

        if (!recommendation) return false;

        // Case-insensitive comparison
        return (
          recommendation.toLowerCase() === column.recommendation.toLowerCase()
        );
      }

      return false;
    });
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="h-10 w-full bg-gray-200 skeleton-animation rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-200 skeleton-animation rounded"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-auto bg-gray-50 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-end mb-4">
        <span className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
          Total {feedbacks?.length || 0} Feedbacks
        </span>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 max-h-[calc(100vh-260px)]">
        {columns.map((column, index) => (
          <div
            key={column.id}
            className="min-w-[350px] max-w-[350px] flex-shrink-0"
          >
            <div
              className={`h-full flex flex-col rounded-lg border ${column.borderColor} ${column.bgColor}`}
            >
              {/* Column Header */}
              <div
                className={`rounded-t-lg p-3 border-b ${column.headerColor} ${column.borderColor}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${column.textColor}`}>
                    {column.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-white border ${column.borderColor} ${column.textColor}`}
                  >
                    {getColumnItems(column).length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="space-y-3">
                  {getColumnItems(column).map((item) => (
                    <FeedbackCard
                      key={item._id}
                      item={item}
                      onView={onView}
                      onEdit={onEdit}
                      tokenPayload={tokenPayload}
                    />
                  ))}

                  {getColumnItems(column).length === 0 && (
                    <div
                      className={`bg-white/50 rounded-lg p-4 text-center border border-dashed ${column.borderColor}`}
                    >
                      <p className="text-sm text-gray-500">No feedback items</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeedbackKanban;
