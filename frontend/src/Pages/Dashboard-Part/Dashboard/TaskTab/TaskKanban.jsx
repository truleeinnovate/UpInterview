// v1.0.0 - Ashok - Improved responsiveness

// src/Components/Shared/Kanban/KanbanView.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';

const TaskKanban = ({
  data = [],
  columns = [],
  loading = false,
  onCardClick,
  onView,
  onEdit,
  onResendLink,
  isMenuOpen = false,
  getStatusColor = () => 'bg-custom-bg text-custom-blue',
  renderActions,
  emptyState = 'No Task found.',
}) => {
  if (loading) {
    return (
      <div className={`w-full bg-gray-50 rounded-xl p-6 overflow-y-auto transition-all duration-300 ${
        isMenuOpen ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
      }`}>
        {[...Array(columns.length > 0 ? columns.length : 1)].map((_, colIndex) => (
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
        ))}
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
  const groupedData = columns.length > 0
    ? columns.reduce((acc, column) => {
        acc[column.key] = data.filter((item) => item.status === column.key);
        return acc;
      }, {})
    : { all: data };

  return (
    // v1.0.0 <----------------------------------------------------------------------------------
    <DndContext collisionDetection={closestCenter}>
      <motion.div
        className={`w-full bg-gray-50 rounded-xl p-6 overflow-y-auto transition-all duration-300 ${
          isMenuOpen ? 'md:w-[60%] sm:w-[50%] lg:w-[70%] xl:w-[75%] 2xl:w-[80%]' : 'w-full'
        } ${columns.length === 0 ? 'h-[calc(100vh-12rem)]' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {(columns.length > 0 ? columns : [{ key: 'all', header: 'All Tasks' }]).map((column, colIdx) => (
          <motion.div 
            key={`${column.key}-${colIdx}`} 
            className="mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: colIdx * 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 truncate">{column.header}</h3>
              <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
                {(groupedData[column.key] || []).length} {(groupedData[column.key] || []).length > 1 ? 'Tasks' : 'Task'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
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
                            alt={item.title}
                            onError={(e) => {
                              e.target.src = '/default-profile.png';
                            }}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                            {item.title?.charAt(0) || '?'}
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
                          {item.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {renderActions && renderActions(item, { onView, onEdit, onResendLink })}
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 gap-2">
                      <div key={`${item.id}-assigned`} className="grid grid-cols-2 text-gray-500 truncate">
                        <span className="truncate text-gray-500 font-medium">Assigned To:</span>
                        <span className="truncate text-gray-800 font-medium">{item.Email || 'N/A'}</span>
                      </div>
                      <div key={`${item.id}-related`} className="grid grid-cols-2 text-gray-500 truncate">
                        <span className="truncate text-gray-500 font-medium">Related To:</span>
                        <span className="truncate text-gray-800 font-medium">{item.Phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      <div key={`${item.id}-priority`} className="grid grid-cols-2 text-gray-500 truncate">
                        <span className="truncate text-gray-500 font-medium">Priority:</span>
                        <span className="truncate text-gray-800 font-medium">{item.HigherQualification || 'N/A'}</span>
                      </div>
                      <div key={`${item.id}-status`} className="grid grid-cols-2 text-gray-500 truncate">
                        <span className="truncate text-gray-500 font-medium">Status:</span>
                        <span className="truncate text-gray-800 font-medium">{item.UniversityCollege || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  {!item.isAssessmentView && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Due Date:</span>
                        <span className="font-medium text-gray-800 truncate">
                          {(item.interviews || 'Not Provided')}
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </DndContext>
    // v1.0.0 ---------------------------------------------------------------------------------->
  );
};

export default TaskKanban;