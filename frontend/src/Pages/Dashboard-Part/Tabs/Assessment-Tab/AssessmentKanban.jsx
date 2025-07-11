import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import {
  EyeIcon,
  PencilSquareIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShareIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import Tooltip from '@mui/material/Tooltip';

const AssessmentKanban = ({ 
  assessments, 
  onView, 
  onEdit, 
  onShare, 
  assessmentSections,
  loading = false 
}) => {
  // Remove the console.log that's causing loops
  // console.log("assessments----",assessments);
  
  const [columns, setColumns] = useState({
    active: {
      title: 'Active',
      items: []
    },
    inactive: {
      title: 'Inactive',
      items: []
    }
  });

  useEffect(() => {
    setColumns({
      active: {
        title: 'Active',
        items: assessments.filter((a) => a.status === 'Active')
      },
      inactive: {
        title: 'Inactive',
        items: assessments.filter((a) => a.status === 'Inactive')
      }
    });
  }, [assessments]);

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
        [destination.droppableId]: { ...destColumn, items: destItems }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-custom-blue"></div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {column.title} ({column.items.length})
                </h3>
              </div>
              
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-3 min-h-[200px]"
                  >
                    {column.items.map((assessment, index) => (
                      <Draggable
                        key={assessment._id}
                        draggableId={assessment._id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all duration-200 ${
                              snapshot.isDragging ? 'shadow-lg transform rotate-2' : 'hover:shadow-md'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {assessment.AssessmentTitle || 'Untitled Assessment'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {assessment.AssessmentCode || 'No Code'}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Tooltip title="View Details" enterDelay={300} leaveDelay={100} arrow>
                                  <motion.span whileHover={{ scale: 1.05 }}>
                                    <button
                                      onClick={() => onView(assessment)}
                                      className="p-1 text-gray-500 rounded hover:text-blue-600 hover:bg-blue-50"
                                    >
                                      <EyeIcon className="w-5 h-5" />
                                    </button>
                                  </motion.span>
                                </Tooltip>
                                
                                <Tooltip title="Edit Assessment" enterDelay={300} leaveDelay={100} arrow>
                                  <motion.span whileHover={{ scale: 1.05 }}>
                                    <button
                                      onClick={() => onEdit(assessment)}
                                      className="p-1 text-gray-500 rounded hover:text-yellow-600 hover:bg-yellow-50"
                                    >
                                      <PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                  </motion.span>
                                </Tooltip>
                                
                                <Tooltip
                                  title={
                                    (assessmentSections[assessment._id] ?? 0) === 0
                                      ? 'No questions added'
                                      : 'Share'
                                  }
                                  enterDelay={300}
                                  leaveDelay={100}
                                  arrow
                                >
                                  <motion.span whileHover={{ scale: 1.05 }}>
                                    <button
                                      onClick={() => onShare(assessment)}
                                      className={`p-1 text-gray-500 rounded ${
                                        (assessmentSections[assessment._id] ?? 0) === 0
                                          ? 'cursor-not-allowed opacity-50'
                                          : 'hover:text-green-600 hover:bg-green-50'
                                      }`}
                                      disabled={(assessmentSections[assessment._id] ?? 0) === 0}
                                    >
                                      <ShareIcon className="w-5 h-5" />
                                    </button>
                                  </motion.span>
                                </Tooltip>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <ClockIcon className="w-4 h-4 mr-1" />
                                <span>{assessment.assessmentDuration || 'N/A'} min</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <DocumentTextIcon className="w-4 h-4 mr-1" />
                                <span>{assessmentSections[assessment._id] ?? 0} sections</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <AcademicCapIcon className="w-4 h-4 mr-1" />
                                <span>{assessment.DifficultyLevel || 'N/A'}</span>
                              </div>
                              
                              <div className="flex items-center text-gray-600">
                                <CalendarIcon className="w-4 h-4 mr-1" />
                                <span>
                                  {assessment.createdAt 
                                    ? format(new Date(assessment.createdAt), 'MMM dd, yyyy')
                                    : 'N/A'
                                  }
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

AssessmentKanban.propTypes = {
  assessments: PropTypes.array.isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  assessmentSections: PropTypes.object.isRequired,
  loading: PropTypes.bool,
};

export default AssessmentKanban;