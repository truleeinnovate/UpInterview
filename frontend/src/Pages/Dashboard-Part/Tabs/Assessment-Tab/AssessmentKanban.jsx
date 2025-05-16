import React, { useState, useEffect } from 'react';
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

const AssessmentKanban = ({ assessments, onView, onEdit, onShare, assessmentSections }) => {
  const [columns, setColumns] = useState({
    active: {
      title: 'Active',
      items: assessments.filter((a) => a.status === 'Active')
    },
    inactive: {
      title: 'Inactive',
      items: assessments.filter((a) => a.status === 'Inactive')
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
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];
      const [movedItem] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, movedItem);

      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  const getStatusColor = (status) => {
    return status === 'Active'
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800';
  };

  return (
    <div className="w-full h-[calc(100vh-12rem)] rounded-xl p-6 overflow-x-auto">
      <div className="flex items-center justify-end mb-4">
        <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
          {assessments.length} {assessments.length === 1 ? 'Assessment' : 'Assessments'}
        </span>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex sm:flex-col flex-row gap-6 pb-6">
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} className="sm:w-full w-1/2 bg-gray-50 rounded-xl p-4 shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {column.title} ({column.items.length})
              </h2>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4"
                  >
                    {column.items.map((assessment, index) => (
                      <Draggable
                        key={assessment._id}
                        draggableId={assessment._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-lg shadow p-4 space-y-3 relative group border border-gray-200"
                          >
                            <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => onView(assessment)}
                                className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => onEdit(assessment)}
                                className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </button>
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
                                <span>
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
                                </span>
                              </Tooltip>
                            </div>

                            <div className="flex items-start">
                              <h3 className="font-medium text-lg text-custom-blue pr-20"
                              onClick={() => onView(assessment)}>
                                {assessment.AssessmentTitle}
                              </h3>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                              {assessment.Position && (
                                <div className="flex items-center gap-2">
                                  <UserIcon className="w-4 h-4" />
                                  {assessment.Position}
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4" />
                                {assessment.Duration}
                              </div>
                              <div className="flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4" />
                                {assessment.DifficultyLevel}
                              </div>
                              <div className="flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4" />
                                {assessment.NumberOfQuestions} Questions
                              </div>
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4" />
                                {format(new Date(assessment.ExpiryDate), 'MMM dd, yyyy')}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  assessment.status
                                )}`}
                              >
                                {assessment.status}
                              </span>
                              <span className="text-xs text-gray-500">
                                {assessmentSections[assessment._id] ?? 0} Sections
                              </span>
                            </div>
                          </div>
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
  assessments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      AssessmentTitle: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['Active', 'Inactive']).isRequired,
      Position: PropTypes.string,
      Duration: PropTypes.string,
      DifficultyLevel: PropTypes.string,
      NumberOfQuestions: PropTypes.number,
      ExpiryDate: PropTypes.string
    })
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  assessmentSections: PropTypes.object.isRequired,
};

export default AssessmentKanban;