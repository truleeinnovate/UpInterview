// v1.0.0 - Ashok - Improved responsiveness

import { motion } from "framer-motion";
import { Calendar, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { formatDateTime } from "../../utils/dateFormatter";

const KanbanView = ({
  templates,
  loading = false,
  effectivePermissions,
  onView,
  onEdit,
}) => {
  const navigate = useNavigate();

  console.log("templates--", templates);
  // const formatRelativeDate = (dateString) => {
  //   if (!dateString) return '';
  //   const date = new Date(dateString);
  //   const now = new Date();
  //   const diffTime = Math.abs(now - date);
  //   const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  //   const diffMonths = Math.floor(diffDays / 30);
  //   const diffYears = Math.floor(diffDays / 365);

  //   if (date.toDateString() === now.toDateString()) {
  //     return 'Today';
  //   }
  //   const yesterday = new Date(now);
  //   yesterday.setDate(yesterday.getDate() - 1);
  //   if (date.toDateString() === yesterday.toDateString()) {
  //     return 'Yesterday';
  //   }
  //   if (diffDays < 30) {
  //     return `${diffDays} Day${diffDays > 1 ? 's' : ''} ago`;
  //   }
  //   if (diffMonths < 12) {
  //     return `${diffMonths} Month${diffMonths > 1 ? 's' : ''} ago`;
  //   }
  //   return `${diffYears} Year${diffYears > 1 ? 's' : ''} ago`;
  // };

  if (loading) {
    return (
      <motion.div
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-1/3 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
        </div>
        {/* v1.0.0 <-------------------------------------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-20">
          {/* v1.0.0 --------------------------------------------------------------------------------------------------> */}
          {[...Array(6)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded mb-2"></div>
                  <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-200 skeleton-animation rounded mt-1"></div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                </div>
              </div>
              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                      <div className="h-4 w-12 bg-gray-200 skeleton-animation rounded"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-gray-200 skeleton-animation rounded"></div>
                      <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                    </div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 skeleton-animation rounded-lg"></div>
                  <div className="h-8 bg-gray-200 skeleton-animation rounded-lg"></div>
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
          All Interview Templates
        </h3>
        <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
          {templates.length} {templates.length <= 1 ? "Template" : "Templates"}
        </span>
      </motion.div>
      {templates.length > 0 ? (
        // v1.0.0 <--------------------------------------------------------------------------------------------------
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 pb-20">
          {/* // v1.0.0 --------------------------------------------------------------------------------------------------> */}
          {templates.map((template, index) => (
            <motion.div
              key={template._id}
              className={`bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full ${
                index >= templates.length - 5 ? "mb-10" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              //onClick={() => effectivePermissions.InterviewTemplates?.View && onView(template)}
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <motion.div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() =>
                    effectivePermissions.InterviewTemplates?.View &&
                    onView(template)
                  }
                  whileHover={{ x: 2 }}
                >
                  <h4 className="text-xl font-medium text-gray-900 group-hover:text-custom-blue transition-colors duration-200 truncate">
                    {template.title}
                  </h4>
                  <p className="mt-2 text-gray-600 line-clamp-2 h-[40px] text-sm break-words">
                    {/* {template.description} */}
                  </p>
                </motion.div>
                <div className="flex gap-1 flex-shrink-0">
                  {effectivePermissions.InterviewTemplates?.View && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onView(template)}
                      className="text-custom-blue hover:bg-custom-blue/80 p-2 rounded-lg"
                      title="View"
                    >
                      <FaEye className="w-4 h-4" />
                    </motion.button>
                  )}
                  {effectivePermissions.InterviewTemplates?.Edit && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(template)}
                      className="text-purple-500 hover:bg-purple-50 p-2 rounded-lg"
                      title="Edit"
                    >
                      <FaPencilAlt className="w-4 h-4" />
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="mt-auto">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Layers className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {template.rounds?.length || 0}{" "}
                        {template.rounds?.length <= 1 ? "Round" : "Rounds"}
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Calendar className="h-4 w-4 text-custom-blue" />
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {formatDateTime(template.updatedAt)}
                      </span>
                    </motion.div>
                  </div>
                  <motion.span
                    className={`shrink-0 inline-flex items-center px-3 py-1.5 rounded text-sm font-medium ${
                      template.status === "active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : template.status === "draft"
                        ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                        : "bg-slate-50 text-slate-700 border border-slate-200/60"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {template.status
                      ? template.status.charAt(0).toUpperCase() +
                        template.status.slice(1)
                      : "Active"}
                  </motion.span>
                </div>
                {template.rounds?.length > 0 && (
                  <motion.div
                    className="mt-4 space-y-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {template.rounds?.slice(0, 2).map((round, index) => (
                      <motion.div
                        key={index}
                        className="bg-gray-50 rounded-lg px-3 py-2 text-sm"
                        whileHover={{ x: 2 }}
                      >
                        <span className="font-medium text-gray-900">
                          {round.roundTitle}
                        </span>
                      </motion.div>
                    ))}
                    {template.rounds?.length > 2 && (
                      <motion.div
                        className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-center text-gray-500"
                        whileHover={{ x: 2 }}
                      >
                        +{template.rounds?.length - 2} More Rounds
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className="col-span-full text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-gray-500">No Templates Found</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default KanbanView;
