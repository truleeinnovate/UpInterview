// v1.0.0  -  Ashraf  -  displaying expity date and status correctly
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  EyeIcon,
  //PencilSquareIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  // <-------------------------------v1.0.0
  ExclamationTriangleIcon,
  // ------------------------------v1.0.0 >
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge';

/**
 * Kanban view for Scheduled Assessments – visually similar to AssessmentKanban
 * but adapted to scheduled-assessment fields.
 */
const ScheduleAssessmentKanban = ({
  schedules,
  assessments = [],
  onView,
  onEdit,
  // <-------------------------------v1.0.0
  onAction,
  loading = false,
}) => {
  // Function to check if action buttons should be shown based on schedule status
  const shouldShowActionButtons = (schedule) => {
    const status = schedule.status?.toLowerCase();
    // Hide buttons for completed, cancelled, expired, and failed statuses
    return !['completed', 'cancelled', 'expired', 'failed'].includes(status);
  };
 

  const [columns, setColumns] = useState({
    scheduled: { title: 'Scheduled', items: [] },
    completed: { title: 'Completed', items: [] },
    cancelled: { title: 'Cancelled', items: [] },
    expired: { title: 'Expired', items: [] },
    failed: { title: 'Failed', items: [] },
  });

  useEffect(() => {
    setColumns({
      scheduled: {
        title: 'Scheduled',
        items: schedules.filter((s) => s.status === 'scheduled'),
      },
      completed: {
        title: 'Completed',
        items: schedules.filter((s) => s.status === 'completed'),
      },
      cancelled: {
        title: 'Cancelled',
        items: schedules.filter((s) => s.status === 'cancelled'),
      },
      expired: {
        title: 'Expired',
        items: schedules.filter((s) => s.status === 'expired'),
      },
      failed: {
        title: 'Failed',
        items: schedules.filter((s) => s.status === 'failed'),
      },
    });
    // <-------------------------------v1.0.0
  }, [schedules]);

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [movedItem] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      });
    }
  };

  if (loading) {
    return (
      <motion.div className="w-full h-[calc(100vh-12rem)] rounded-xl p-6 overflow-x-auto" />
    );
  }

  return (
    <motion.div
      className="w-full h-[calc(100vh-12rem)] rounded-xl p-6 overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex sm:flex-col flex-row gap-6 pb-6">
          {Object.entries(columns).map(([columnId, column], i) => (
            <motion.div
              key={columnId}
              className="sm:w-full w-1/3 bg-gray-50 rounded-xl p-4 shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              {/* <-------------------------------v1.0.0 */}
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{column.title}</h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3"
                  >
                    {column.items.map((schedule, index) => (
                      <Draggable key={schedule._id} draggableId={schedule._id} index={index}>
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${
                              columnId === 'scheduled'
                                ? 'border-l-custom-blue'
                                : columnId === 'completed'
                                ? 'border-l-green-500'
                                : 'border-l-red-500'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <EyeIcon
                                      className="w-4 h-4 text-gray-400 cursor-pointer hover:text-custom-blue"
                                      onClick={() => onView(schedule)}
                                    />
                                    {onAction && shouldShowActionButtons(schedule) && (
                                      <>
                                        <CalendarIcon
                                          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-custom-blue"
                                          onClick={() => onAction(schedule, 'extend')}
                                          title="Extend Assessment"
                                        />
                                        <ExclamationTriangleIcon
                                          className="w-4 h-4 text-gray-400 cursor-pointer hover:text-red-600"
                                          onClick={() => onAction(schedule, 'cancel')}
                                          title="Cancel Assessment"
                                        />
                                      </>
                                    )}
                                  </div>
                                </div>
                                {/* <-------------------------------v1.0.0 */}
                                <h3
                                  className="font-medium text-lg text-custom-blue truncate pr-10 cursor-pointer"
                                  onClick={() => onView(schedule)}
                                >
                                  {schedule.order} <StatusBadge status={schedule.status} text={schedule.status ? schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1) : "Not Provided"}/>
                                </h3>

                                {/* Assessment Template ID */}
                                <div className="text-sm text-gray-600">
                                <ClipboardDocumentListIcon className="w-5 h-5 inline-block mr-2" /> {(() => {
                                    const val = schedule.assessmentId;
                                    let obj = null;
                                    if (val) {
                                      if (typeof val === 'object') {
                                        obj = val;
                                      } else {
                                        obj = (assessments || []).find((a) => a._id === val);
                                      }
                                    }
                                    return obj?.AssessmentCode || obj?._id || 'Not Provided';
                                  })()}
                                </div>

                                {/* Assessment Template Name */}
                                <div className="text-sm text-gray-600">
                                <BookOpenIcon className="w-5 h-5 inline-block mr-2" /> {(() => {
                                    const val = schedule.assessmentId;
                                    let obj = null;
                                    if (val) {
                                      if (typeof val === 'object') {
                                        obj = val;
                                      } else {
                                        obj = (assessments || []).find((a) => a._id === val);
                                      }
                                    }
                                    const title = obj?.AssessmentTitle || 'Not Provided';
                                    return title.charAt ? title.charAt(0).toUpperCase() + title.slice(1) : title;
                                  })()}
                                </div>
                                <div className="text-sm text-gray-600">
                                <ClipboardDocumentListIcon className="w-5 h-5 inline-block mr-2" /> {schedule.scheduledAssessmentCode ? schedule.scheduledAssessmentCode : 'Not Provided'}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {column.items.length === 0 && (
                        <div className="py-4 text-sm text-center text-gray-500">No {column.title} Assessments</div>
                      )}
                      {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </motion.div>
  );
};

ScheduleAssessmentKanban.propTypes = {
  schedules: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      order: PropTypes.string,
      scheduledAssessmentCode: PropTypes.string,
      status: PropTypes.string,
      expiryAt: PropTypes.string,
    })
  ).isRequired,
  assessments: PropTypes.array,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onAction: PropTypes.func,
  loading: PropTypes.bool,
};

ScheduleAssessmentKanban.defaultProps = {
  assessments: [],
  loading: false,
};

export default ScheduleAssessmentKanban;
