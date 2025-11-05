// v1.0.0  -  Ashraf  -  assessments to assessment templates
// v1.0.1  -  Ashok   -  updated loading view
// v1.0.2  -  Ashok   -  fixed zoom in effect
// v1.0.3  -  Ashok   -  hidden acton buttons when type "standard"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  EyeIcon,
  PencilSquareIcon,
  ClockIcon,
  UserIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CalendarIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import PropTypes from "prop-types";
import Tooltip from "@mui/material/Tooltip";
import { formatDateTime } from "../../../../utils/dateFormatter";

const AssessmentKanban = ({
  assessments,
  onView,
  onEdit,
  onShare,
  assessmentSections,
  loading = false,
}) => {
  console.log("assessments----", assessments);
  const [columns, setColumns] = useState({
    active: {
      title: "Active",
      items: [],
    },
    inactive: {
      title: "Inactive",
      items: [],
    },
  });

  useEffect(() => {
    setColumns({
      active: {
        title: "Active",
        items: assessments.filter((a) => a.status === "Active"),
      },
      inactive: {
        title: "Inactive",
        items: assessments.filter((a) => a.status === "Inactive"),
      },
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

  const getStatusColor = (status) => {
    return status === "Active"
      ? "bg-green-100 text-green-800"
      : "bg-red-100 text-red-800";
  };

  if (loading) {
    return (
      // v1.0.1 <----------------------------------------------------------------------------
      // v1.0.2 <----------------------------------------------------------------------------
      <motion.div
        className="w-full h-[calc(100vh-12rem)] rounded-xl p-6 overflow-x-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-end mb-4"
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-6 w-40 bg-gray-200 rounded shimmer"></div>
        </motion.div>

        {/* Columns Skeleton */}
        <div className="flex sm:flex-col flex-row gap-6 pb-6">
          {[...Array(2)].map((_, colIndex) => (
            <motion.div
              key={colIndex}
              className="sm:w-full w-1/2 bg-gray-50 rounded-xl p-4 shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Column header */}
              <div className="h-6 w-3/4 bg-gray-200 rounded shimmer mb-4"></div>

              {/* Draggable cards skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4">
                {[...Array(3)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow p-4 space-y-3 relative border border-gray-200"
                  >
                    {/* Action buttons placeholder */}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {[...Array(3)].map((__, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 bg-gray-200 rounded shimmer"
                        ></div>
                      ))}
                    </div>

                    {/* Title placeholder */}
                    <div className="h-5 w-3/4 bg-gray-200 rounded shimmer mb-2"></div>

                    {/* Info rows placeholders */}
                    {[...Array(5)].map((__, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-200 rounded shimmer"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded shimmer"></div>
                      </div>
                    ))}

                    {/* Status & sections placeholder */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-16 bg-gray-200 rounded-full shimmer"></div>
                      <div className="h-3 w-10 bg-gray-200 rounded shimmer"></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
      // v1.0.2 ---------------------------------------------------------------------------->
      // v1.0.1 ---------------------------------------------------------------------------->
    );
  }

  return (
    <motion.div
      className="w-full h-[calc(100vh-12rem)] rounded-xl p-6 overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex items-center justify-end mb-4"
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
          {/* <-------------------------------v1.0.0 */}
          {assessments.length}{" "}
          {assessments.length <= 1
            ? "Assessment template"
            : "Assessment templates"}
          {/* ------------------------------v1.0.0 > */}
        </span>
      </motion.div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex sm:flex-col flex-row gap-6 pb-6">
          {Object.entries(columns).map(([columnId, column], colIndex) => (
            <motion.div
              key={columnId}
              className="sm:w-full w-1/2 bg-gray-50 rounded-xl p-4 shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
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
                          <motion.div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white rounded-lg shadow p-4 space-y-3 relative group border border-gray-200"
                            whileHover={{ y: -5 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {/* <motion.div
                              className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.05 }}
                            >
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onView(assessment)}
                                className="p-1 text-gray-500 hover:text-custom-blue hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onEdit(assessment)}
                                className="p-1 text-gray-500 hover:text-custom-blue hover:bg-indigo-50 rounded"
                                title="Edit"
                              >
                                <PencilSquareIcon className="w-5 h-5" />
                              </motion.button>
                              <Tooltip
                                title={
                                  (assessmentSections[assessment._id] ?? 0) ===
                                  0
                                    ? "No questions added"
                                    : "Share"
                                }
                                enterDelay={300}
                                leaveDelay={100}
                                arrow
                              >
                                <motion.span whileHover={{ scale: 1.05 }}>
                                  <button
                                    onClick={() => onShare(assessment)}
                                    className={`p-1 text-gray-500 rounded ${
                                      (assessmentSections[assessment._id] ??
                                        0) === 0
                                        ? "cursor-not-allowed opacity-50"
                                        : "hover:text-green-600 hover:bg-green-50"
                                    }`}
                                    disabled={
                                      (assessmentSections[assessment._id] ??
                                        0) === 0
                                    }
                                  >
                                    <ShareIcon className="w-5 h-5" />
                                  </button>
                                </motion.span>
                              </Tooltip>
                            </motion.div> */}

                            <motion.div
                              className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              whileHover={{ scale: 1.05 }}
                            >
                              {/* 👁 View button (always visible) */}
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onView(assessment)}
                                className="p-1 text-gray-500 hover:text-custom-blue hover:bg-blue-50 rounded"
                                title="View"
                              >
                                <EyeIcon className="w-5 h-5" />
                              </motion.button>

                              {/* ✏️ Edit button (only for custom type) */}
                              {assessment.type !== "standard" && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => onEdit(assessment)}
                                  className="p-1 text-gray-500 hover:text-custom-blue hover:bg-indigo-50 rounded"
                                  title="Edit"
                                >
                                  <PencilSquareIcon className="w-5 h-5" />
                                </motion.button>
                              )}

                              {/* 🔗 Share button (only for custom type) */}
                              {assessment.type !== "standard" && (
                                <Tooltip
                                  title={
                                    (assessmentSections[assessment._id] ??
                                      0) === 0
                                      ? "No questions added"
                                      : "Share"
                                  }
                                  enterDelay={300}
                                  leaveDelay={100}
                                  arrow
                                >
                                  <motion.span whileHover={{ scale: 1.05 }}>
                                    <button
                                      onClick={() => onShare(assessment)}
                                      className={`p-1 text-gray-500 rounded ${
                                        (assessmentSections[assessment._id] ??
                                          0) === 0
                                          ? "cursor-not-allowed opacity-50"
                                          : "hover:text-green-600 hover:bg-green-50"
                                      }`}
                                      disabled={
                                        (assessmentSections[assessment._id] ??
                                          0) === 0
                                      }
                                    >
                                      <ShareIcon className="w-5 h-5" />
                                    </button>
                                  </motion.span>
                                </Tooltip>
                              )}
                            </motion.div>

                            <motion.div
                              className="flex items-start"
                              whileHover={{ x: 2 }}
                            >
                              <h3
                                className="font-medium text-lg text-custom-blue pr-20 cursor-pointer"
                                onClick={() => onView(assessment)}
                              >
                                {assessment.AssessmentTitle.charAt(
                                  0
                                ).toUpperCase() +
                                  assessment.AssessmentTitle.slice(1)}
                              </h3>
                            </motion.div>

                            <div className="space-y-2 text-sm text-gray-600">
                              {assessment.AssessmentCode && (
                                <motion.div
                                  className="flex items-center gap-2"
                                  whileHover={{ x: 2 }}
                                >
                                  <UserIcon className="w-4 h-4" />
                                  {assessment.AssessmentCode}
                                </motion.div>
                              )}
                              <motion.div
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <ClockIcon className="w-4 h-4" />
                                {assessment.Duration}
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <AcademicCapIcon className="w-4 h-4" />
                                {assessment.DifficultyLevel}
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <DocumentTextIcon className="w-4 h-4" />
                                {assessment.NumberOfQuestions} Questions
                              </motion.div>
                              <motion.div
                                className="flex items-center gap-2"
                                whileHover={{ x: 2 }}
                              >
                                <CalendarIcon className="w-4 h-4" />
                                {/* {format(new Date(assessment.ExpiryDate), 'MMM dd, yyyy')} */}
                                {formatDateTime(assessment.createdAt)}
                              </motion.div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <motion.span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                  assessment.status
                                )}`}
                                whileHover={{ scale: 1.05 }}
                              >
                                {assessment.status}
                              </motion.span>
                              <span className="text-xs text-gray-500">
                                {assessmentSections[assessment._id] ?? 0}{" "}
                                {assessmentSections[assessment._id] <= 1
                                  ? "Section"
                                  : "Sections"}
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </Draggable>
                    ))}

                    {column.items.length === 0 && (
                      <div className="col-span-full flex flex-col items-center justify-center py-8 text-gray-500">
                        <DocumentTextIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <h3 className="text-lg font-medium text-gray-700 mb-1">
                          {/* <-------------------------------v1.0.0 */}
                          No {column.title} Assessments Templates Found
                        </h3>
                        <p className="text-gray-500 text-center max-w-md text-sm">
                          {column.title === "Active"
                            ? "There are no active assessments templates to display."
                            : "There are no inactive assessments templates at the moment."}
                          {/* ------------------------------v1.0.0 > */}
                        </p>
                      </div>
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

AssessmentKanban.propTypes = {
  assessments: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      AssessmentTitle: PropTypes.string.isRequired,
      status: PropTypes.oneOf(["Active", "Inactive"]).isRequired,
      Position: PropTypes.string,
      Duration: PropTypes.string,
      DifficultyLevel: PropTypes.string,
      NumberOfQuestions: PropTypes.number,
      ExpiryDate: PropTypes.string,
    })
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onShare: PropTypes.func.isRequired,
  assessmentSections: PropTypes.object.isRequired,
  loading: PropTypes.bool,
};

AssessmentKanban.defaultProps = {
  loading: false,
};

export default AssessmentKanban;
