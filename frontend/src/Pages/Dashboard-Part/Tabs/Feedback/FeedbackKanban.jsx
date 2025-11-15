/* eslint-disable react/prop-types */

// v1.0.0-----Venkatesh---in kanban view 4 cards shown in 2xl grid and add effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
// v1.0.1 - Ashok - fixed style issue

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Calendar,
  Eye,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Star } from "lucide-react";

const FeedbackKanban = ({ feedbacks, loading, onView, onEdit }) => {
  const [filteredData, setFilteredData] = useState([]);
  console.log("ksdhsdshdb", filteredData);
  useEffect(() => {
    if (feedbacks) {
      setFilteredData(feedbacks);
    }
  }, [feedbacks]);

  const columns = [
    { id: "draft", title: "Pending Review", status: "draft" },
    { id: "completed", title: "Completed", status: "submitted" },
    { id: "maybe", title: "Maybe", recommendation: "Maybe" },
  ];

  const getColumnItems = (column) => {
    return filteredData.filter((item) => {
      if (column.status) {
        return item.status === column.status;
      }
      if (column.recommendation) {
        if (Array.isArray(column.recommendation)) {
          return column.recommendation.includes(item.recommendation);
        }
        return item.recommendation === column.recommendation;
      }
      return false;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "draft":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "Yes":
        return "bg-green-50 text-green-700 border-green-200";
      case "No":
        return "bg-red-50 text-red-700 border-red-200";
      case "Maybe":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3 h-3 ${
            i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-1/4 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-20 bg-gray-200 skeleton-animation rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 w-full">
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-auto"
    >
      <div className="h-full w-full pb-6">
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800">All Feedback</h3>
          <motion.span
            className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200"
            whileHover={{ scale: 1.05 }}
          >
            {feedbacks?.length} Feedback
          </motion.span>
        </motion.div>
        <div className="overflow-x-auto">
          <div className="w-full overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ minWidth: "1200px" }}>
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex-1 min-w-0"
                  style={{ minWidth: "240px" }}
                >
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {column.title}
                      </h3>
                      <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
                        {getColumnItems(column).length}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {getColumnItems(column).map((item) => (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-[#217989] rounded-full flex items-center justify-center text-white text-xs font-medium">
                                {item.candidateId?.FirstName[0]}
                              </div>
                              <span className="ml-2 font-medium text-sm text-gray-900 truncate">
                                {item.candidateId?.FirstName +
                                  " " +
                                  item.candidateId?.LastName}
                              </span>
                            </div>
                            {getStatusIcon(item.interviewRoundId?.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2 truncate">
                            {item.positionId?.title}
                          </p>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500">
                              <User className="w-3 h-3 inline mr-1" />
                              <span className="truncate">
                                {item.interviewerId?.firstName +
                                  " " +
                                  item.interviewerId?.lastName}
                              </span>
                            </span>
                            <span className="text-xs text-gray-500">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {item.interviewRoundId?.dateTime}
                            </span>
                          </div>
                          {item.overallImpression?.overallRating > 0 && (
                            <div className="flex">
                              {renderStars(
                                item.overallImpression?.overallRating
                              )}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(
                                item.overallImpression?.recommendation
                              )}`}
                            >
                              {item.overallImpression?.recommendation}
                            </span>
                          </div>
                          {item.generalComments && (
                            <p className="text-xs text-gray-600 mt-2 truncate">
                              {item.generalComments}
                            </p>
                          )}
                          <div className="flex space-x-2 mt-3">
                            <button
                              className="text-[#217989] hover:text-[#1a616e] text-xs"
                              onClick={() => onView(item)}
                            >
                              <Eye className="w-3 h-3 inline mr-1" />
                              View
                            </button>
                            <button
                              className="text-green-500 hover:text-gray-600 text-xs"
                              onClick={() => onEdit(item)}
                            >
                              <Edit className="w-3 h-3 inline mr-1" />
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeedbackKanban;
