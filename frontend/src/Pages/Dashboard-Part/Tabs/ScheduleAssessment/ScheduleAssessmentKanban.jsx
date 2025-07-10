import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  EyeIcon,
  //PencilSquareIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';
import { format } from 'date-fns';

/**
 * Kanban view for Scheduled Assessments – visually similar to AssessmentKanban
 * but adapted to scheduled-assessment fields.
 */
const ScheduleAssessmentKanban = ({
  schedules,
  onView,
  onEdit,
  loading = false,
}) => {
  const [columns, setColumns] = useState({
    scheduled: { title: 'Scheduled', items: [] },
    completed: { title: 'Completed', items: [] },
    cancelled: { title: 'Cancelled', items: [] },
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
    });
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {column.title} ({column.items.length})
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 gap-4"
                  >
                    {column.items.map((schedule, idx) => (
                      <Draggable
                        key={schedule._id}
                        draggableId={schedule._id}
                        index={idx}
                      >
                        {(provided) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-lg shadow p-4 space-y-2 relative group border border-gray-200"
                            whileHover={{ y: -3 }}
                          >
                            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onView(schedule)}
                                className="p-1 text-gray-500 hover:text-custom-blue hover:bg-blue-50 rounded"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              {/* <button
                                onClick={() => onEdit(schedule)}
                                className="p-1 text-gray-500 hover:text-custom-blue hover:bg-indigo-50 rounded"
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </button> */}
                            </div>

                            <h3
                              className="font-medium text-lg text-custom-blue truncate pr-10 cursor-pointer"
                              onClick={() => onView(schedule)}
                            >
                              {schedule.order}
                            </h3>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <CalendarIcon className="w-4 h-4" />
                              <span>
                                {schedule.expiryAt
                                  ? format(new Date(schedule.expiryAt), 'MMM dd, yyyy')
                                  : 'Not Provided'}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}
                            >
                              {schedule.status ? schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1) : 'Not Provided'}
                            </span>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
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
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

ScheduleAssessmentKanban.defaultProps = {
  loading: false,
};

export default ScheduleAssessmentKanban;
