// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - Changed fields structure and loading view

import React from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  Eye,
  Pencil,
  Timer,
  XCircle,
  Laptop,
  Hourglass,
  UserCheck,
  Clock,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const MockInterviewKanban = ({
  mockinterviews,
  onRescheduleClick,
  onCancel,
  loading = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      // v1.0.1 <----------------------------------------------------------------------
      <motion.div
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-56 bg-gray-200 shimmer rounded"></div>
          <div className="h-8 w-24 bg-gray-200 shimmer rounded"></div>
        </div>
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {[...Array(6)].map((_, index) => (
            <motion.div
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col h-full animate-pulse"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-gray-200 rounded shimmer"></div>
                </div>

                <div className="flex items-center gap-1">
                  <div className="p-1.5 w-28 h-6 bg-gray-200 rounded shimmer"></div>
                </div>
              </div>

              {/* Grid Info */}
              <div className="grid grid-cols-1 text-sm gap-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="grid grid-cols-2 items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-gray-300 rounded shimmer"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
                    </div>
                    <div className="h-3 w-24 bg-gray-200 rounded shimmer"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      // v1.0.1 ---------------------------------------------------------------------->
    );
  }

  return (
    // v1.0.1 <---------------------------------------------------------------------------------
    <DndContext collisionDetection={closestCenter}>
      <motion.div
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800">
            All Mock Interviews
          </h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {mockinterviews.length}{" "}
            {mockinterviews.length === 1 ? "Interview" : "Interviews"}
          </span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {mockinterviews.map((mockinterview, index) => (
            <motion.div
              key={mockinterview._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
            >
              <div className="flex justify-between items-start mb-4">
                <motion.div className="flex-1" whileHover={{ x: 2 }}>
                  <h4
                    className="text-sm font-medium text-custom-blue cursor-pointer"
                    onClick={() =>
                      navigate(`/mockinterview-details/${mockinterview._id}`, {
                        state: { from: location.pathname },
                      })
                    }
                  >
                    {mockinterview?.rounds?.[0]?.roundTitle ||
                      mockinterview?.title ||
                      "Untitled Interview"}
                  </h4>
                </motion.div>

                <div className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      navigate(`/mockinterview-details/${mockinterview._id}`, {
                        state: { from: location.pathname },
                      })
                    }
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() =>
                      navigate(`/mock-interview/${mockinterview._id}/edit`, {
                        state: { from: location.pathname },
                      })
                    }
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRescheduleClick(mockinterview)}
                    className="p-1.5 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Reschedule"
                  >
                    <Timer className="w-4 h-4 text-custom-blue flex-shrink-0" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onCancel()}
                    className="p-1.5 text-red-500 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Cancel"
                  >
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                  </motion.button>
                </div>
              </div>

              <div className="grid grid-cols-1 text-sm gap-3">
                <div className="grid grid-cols-2 items-center">
                  <div className="flex items-center gap-1">
                    <Laptop className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Technology</span>
                  </div>
                  <span className="text-gray-800 font-medium truncate">
                    {mockinterview?.technology ||
                      mockinterview?.rounds?.[0]?.technology ||
                      "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="flex items-center gap-1">
                    <Hourglass className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Status</span>
                  </div>
                  <span className="text-gray-800 font-medium truncate">
                    {mockinterview?.rounds?.[0]?.status === "RequestSent"
                      ? "Request Sent"
                      : mockinterview?.rounds?.[0]?.status || "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="flex items-center gap-1">
                    <UserCheck className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Interviewer</span>
                  </div>
                  <span className="text-gray-800 font-medium truncate">
                    {mockinterview?.interviewer ||
                      mockinterview?.rounds?.[0]?.interviewer ||
                      "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Created At</span>
                  </div>
                  <span className="text-gray-800 font-medium truncate">
                    {mockinterview?.createdAt
                      ? new Date(mockinterview.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="grid grid-cols-2 items-center">
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-gray-500">Duration</span>
                  </div>
                  <span className="text-gray-800 font-medium truncate">
                    {mockinterview?.duration ||
                      mockinterview?.rounds?.[0]?.duration ||
                      "N/A"}{" "}
                    {mockinterview?.duration ||
                    mockinterview?.rounds?.[0]?.duration
                      ? "mins"
                      : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </DndContext>
    // v1.0.1 --------------------------------------------------------------------------------->
  );
};

export default MockInterviewKanban;
