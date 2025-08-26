// v1.0.0  -  Ashraf  -  added assessment expiry date in kanban view
// src/Components/Shared/Kanban/KanbanView.jsx
import React from "react";
import { motion } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";

const KanbanView = ({
  data = [],
  columns = [],
  loading = false,
  onCardClick,
  onView,
  onEdit,
  onResendLink,
  isMenuOpen = false,
  getStatusColor = () => "bg-custom-bg text-custom-blue",
  renderActions,
  emptyState = "No candidates found.",
}) => {
  if (loading) {
    return (
      <div
        className={`w-full bg-gray-50 rounded-xl p-6 overflow-y-auto transition-all duration-300 ${isMenuOpen
          ? "md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]"
          : "w-full"
          }`}
      >
        {[...Array(columns.length > 0 ? columns.length : 1)].map(
          (_, colIndex) => (
            <div key={colIndex} className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-1/4 bg-gray-200 skeleton-animation rounded"></div>
                <div className="h-6 w-12 bg-gray-200 skeleton-animation rounded"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
                {[...Array(4)].map((_, cardIndex) => (
                  <motion.div
                    key={cardIndex}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center w-3/4">
                        <div className="w-12 h-12 rounded-full bg-gray-200 skeleton-animation"></div>
                        <div className="ml-3 space-y-2 w-full">
                          <div className="h-4 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
                          <div className="h-3 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                        <div className="h-6 w-6 bg-gray-200 skeleton-animation rounded"></div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-3 bg-gray-200 skeleton-animation rounded"></div>
                        <div className="h-3 bg-gray-200 skeleton-animation rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-3 bg-gray-200 skeleton-animation rounded"></div>
                        <div className="h-3 bg-gray-200 skeleton-animation rounded"></div>
                      </div>
                    </div> 
                    <div className="mt-4 flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                      <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between">
                        <div className="h-3 w-1/3 bg-gray-200 skeleton-animation rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-full py-20 text-gray-500 text-lg">
        {emptyState}
      </div>
    );
  }

  // Group data by status if columns are defined; otherwise, use a single "all" column
  const groupedData =
    columns.length > 0
      ? columns.reduce((acc, column) => {
        acc[column.key] = data.filter((item) => item.status === column.key);
        return acc;
      }, {})
      : { all: data };

  return (
    <DndContext collisionDetection={closestCenter}>
      <motion.div
        className={`w-full bg-gray-50 rounded-xl p-6 overflow-y-auto transition-all duration-300 ${isMenuOpen
          ? "md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]"
          : "w-full"
          } ${columns.length === 0 ? "h-[calc(100vh-12rem)]" : ""}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {(columns.length > 0
          ? columns
          : [{ key: "all", header: "All Candidates" }]
        ).map((column) => (
          <div key={column.key} className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {column.header}
              </h3>
              <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
                {(groupedData[column.key] || []).length} {(
                  groupedData[column.key] || []
                ).length === 1
                  ? "Candidate"
                  : "Candidates"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
              {(groupedData[column.key] || []).map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onCardClick?.(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center w-3/4">
                      <div className="relative flex-shrink-0">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.title || "Candidate"}
                            onError={(e) => {
                              e.target.src = "/default-profile.png";
                            }}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                            {item.title?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="ml-3 overflow-hidden">
                        <h4
                          className="text-sm font-medium text-custom-blue truncate"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCardClick?.(item);
                          }}
                        >
                          {item.firstName || "Untitled"}
                        </h4>
                        <p className="text-sm text-gray-500 truncate">
                          {item.currentRole || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {renderActions &&
                        renderActions(item, { onView, onEdit, onResendLink })}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-600 truncate">
                        <span className="truncate">{item.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 truncate">
                        <span className="truncate">{item.phone || "N/A"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-600 truncate">
                        <span className="truncate">
                          {item.industry || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 truncate">
                        <span className="truncate">{item.linkedinUrl || "N/A"}</span>
                      </div>
                    </div>
                    {/* <-------------------------------v1.0.0 */}
                    {/* Show expiry date for assessment view */}
                    {item.expiryAt && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-600 font-medium mb-1">Assessment Expiry</div>
                        <div className="text-xs text-gray-800">
                          {(() => {
                            const now = new Date();
                            const expiry = new Date(item.expiryAt);
                            const timeDiff = expiry.getTime() - now.getTime();
                            
                            if (timeDiff <= 0) {
                              return <span className="text-red-600 font-medium">Expired</span>;
                            }
                            
                            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                            
                            let timeText = '';
                            if (days > 0) {
                              timeText = `${days}d ${hours}h`;
                            } else if (hours > 0) {
                              timeText = `${hours}h`;
                            } else {
                              const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                              timeText = `${minutes}m`;
                            }
                            
                            return (
                              <span className={timeDiff < 24 * 60 * 60 * 1000 ? 'text-red-600' : 'text-gray-600'}>
                                {timeText} remaining
                              </span>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                    {/* ------------------------------v1.0.0 > */}
                  </div>
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-1">
                      {(item.skills || []).slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-custom-bg text-custom-blue rounded-lg text-xs font-medium truncate max-w-[100px]"
                        >
                          {skill.skill || "N/A"}
                        </span>
                      ))}
                      {(item.skills || []).length > 3 && (
                        <span className="px-2 py-1 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium">
                          +{(item.skills || []).length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </motion.div>
    </DndContext>
  );
};

export default KanbanView;
