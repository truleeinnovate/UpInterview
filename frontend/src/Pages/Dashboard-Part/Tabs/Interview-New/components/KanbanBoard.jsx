// v1.0.0 - Ashok - Fixed style issues

import React from "react";
import InterviewCard from "./InterviewCard";
import { motion } from "framer-motion";

function KanbanBoard({
  interviews,
  onView,
  onViewInterview,
  onEditInterview,
  onViewPosition,
  effectivePermissions,
  loading,
}) {
  // Group interviews by status
  const inProgressInterviews =
    interviews?.filter(
      (interview) =>
        interview.status === "InProgress" ||
        interview.status === "Scheduled" ||
        interview.status === "Rescheduled" ||
        interview.status === "Draft"
    ) || [];
  const completedInterviews =
    interviews?.filter((interview) => interview.status === "Completed") || [];
  const cancelledInterviews =
    interviews?.filter((interview) => interview.status === "Cancelled") || [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {["InProgress", "Completed", "Cancelled"].map((status, colIndex) => (
          <motion.div
            key={status}
            className="bg-secondary/50 rounded-lg p-4 border border-border"
            variants={item}
          >
            <div className="flex items-center mb-4">
              <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded"></div>
              <div className="ml-2 h-5 w-10 bg-gray-200 skeleton-animation rounded-full"></div>
            </div>
            <div className="space-y-4">
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`${status}-${index}`}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 skeleton-animation"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                        <div className="ml-3 space-y-2">
                          <div className="h-4 w-28 bg-gray-200 rounded"></div>
                          <div className="h-3 w-40 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <div className="h-5 w-20 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-36 bg-gray-200 rounded"></div>
                      <div className="h-3 w-48 bg-gray-200 rounded"></div>
                      <div className="h-2 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 overflow-y-auto max-h-[calc(100vh-192px)] pb-12 p-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">In Progress</h3>
          <span className="ml-2 bg-blue-100 text-custom-blue bg-custom-blue/10 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {inProgressInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {inProgressInterviews.length > 0 ? (
            inProgressInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onView={onView}
                onViewInterview={onViewInterview}
                onEditInterview={onEditInterview}
                onViewPosition={onViewPosition}
                effectivePermissions={effectivePermissions}
              />
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No Interviews in Progress</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Completed</h3>
          <span className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {completedInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {completedInterviews.length > 0 ? (
            completedInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onView={onView}
                onViewInterview={onViewInterview}
                onEditInterview={onEditInterview}
                onViewPosition={onViewPosition}
                effectivePermissions={effectivePermissions}
              />
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No Completed Interviews</p>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        className="bg-secondary/50 rounded-lg p-4 border border-border"
        variants={item}
      >
        <div className="flex items-center mb-4">
          <h3 className="text-lg font-medium text-foreground">Cancelled</h3>
          <span className="ml-2 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {cancelledInterviews.length}
          </span>
        </div>
        <div className="space-y-4">
          {cancelledInterviews.length > 0 ? (
            cancelledInterviews.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onView={onView}
                onViewInterview={onViewInterview}
                onEditInterview={onEditInterview}
                onViewPosition={onViewPosition}
                effectivePermissions={effectivePermissions}
              />
            ))
          ) : (
            <div className="text-center py-8 bg-background rounded-lg border border-dashed border-border">
              <p className="text-muted-foreground">No Cancelled Interviews</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default KanbanBoard;
