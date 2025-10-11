// v1.0.0 - Ashok - Changed cards for small screens and adjusted height of Kanban
// v1.0.1 - Ashok - fixed padding issues at cards
// v1.0.2 - Ashok - Improved loading view

import { motion } from "framer-motion";
import { Calendar, Layers, Trash, Files } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaPencilAlt } from "react-icons/fa";

import { formatDateTime } from "../../utils/dateFormatter";

const KanbanView = ({
  templates,
  loading = false,
  effectivePermissions,
  onView,
  onEdit,
  // handleClone,
}) => {
  const navigate = useNavigate();
  const handleCloneClick = (template) => {
    navigate(`/interview-templates/${template._id}/clone`);
  };

  // Format options for UI labels
  const formatOptions = [
    { label: "Online / Virtual", value: "online" },
    { label: "Face to Face / Onsite", value: "offline" },
    { label: "Hybrid (Online + Onsite)", value: "hybrid" },
  ];

  // Map format values to labels
  const formatLabelMap = formatOptions.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

  // Group templates by format
  const groupedTemplates = {
    online: [],
    hybrid: [],
    offline: [],
  };

  templates.forEach((template) => {
    const format = template.format || "online"; // Default to 'online' per schema
    groupedTemplates[format].push(template);
  });

  if (loading) {
    return (
      // v1.0.2 <-----------------------------------------------------------------
      <motion.div
        className="w-full h-[calc(100vh-15.6rem)] rounded-xl p-6 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header shimmer */}
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="h-6 w-56 shimmer rounded-md"></div>
          <div className="h-6 w-24 shimmer rounded-md"></div>
        </motion.div>

        {/* Format grid shimmer */}
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-5 pb-20">
          {formatOptions.map((format, index) => (
            <motion.div
              key={format.value}
              className="bg-gray-200/40 flex flex-col p-4 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              {/* Format header shimmer */}
              <div className="h-5 w-3/4 shimmer rounded-md mb-4"></div>

              {/* Template card placeholders */}
              {Array(3)
                .fill(null)
                .map((_, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 mb-5 flex flex-col"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    {/* Title + buttons */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="h-5 w-40 shimmer rounded-md mb-2"></div>
                        <div className="h-4 w-56 shimmer rounded-md"></div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {Array(3)
                          .fill(null)
                          .map((_, bIndex) => (
                            <div
                              key={bIndex}
                              className="w-8 h-8 shimmer rounded-lg"
                            ></div>
                          ))}
                      </div>
                    </div>

                    {/* Round count + Date shimmer */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 shimmer rounded-full"></div>
                        <div className="w-24 h-4 shimmer rounded-md"></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 shimmer rounded-full"></div>
                        <div className="w-20 h-4 shimmer rounded-md"></div>
                      </div>
                    </div>

                    {/* Rounds shimmer list */}
                    <div className="space-y-2">
                      <div className="h-8 w-full shimmer rounded-lg"></div>
                      <div className="h-8 w-3/4 shimmer rounded-lg"></div>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          ))}
        </div>
      </motion.div>
      // v1.0.2 ----------------------------------------------------------------->
    );
  }

  return (
    <motion.div
      // v1.0.1 <---------------------------------------------------------------------------------
      // v1.0.0 <---------------------------------------------------------------------------------
      className="w-full h-[calc(100vh-15.6rem)] rounded-xl p-6 overflow-y-auto"
      // v1.0.0 --------------------------------------------------------------------------------->
      // v1.0.1 --------------------------------------------------------------------------------->
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
        // v1.0.0 <-----------------------------------------------------------------------------------------------------------
        <div className="grid sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-3 2xl:grid-cols-3 gap-5 pb-20">
          {/* v1.0.0 <-----------------------------------------------------------------------------------------------------------> */}
          {["online", "hybrid", "offline"].map((format) => (
            // v1.0.1 <--------------------------------------------------------------------
            <div
              key={format}
              className="bg-gray-200/40 flex flex-col p-4 rounded-lg"
            >
              {/* v1.0.1 <-------------------------------------------------------------------- */}
              <h4 className="text-lg font-semibold text-gray-700 mb-4">
                {formatLabelMap[format]} Templates (
                {groupedTemplates[format].length})
              </h4>
              {groupedTemplates[format].length > 0 ? (
                groupedTemplates[format].map((template, index) => (
                  <motion.div
                    key={template._id}
                    // v1.0.1 <-----------------------------------------------------------------------------------------------------------------------------------
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col mb-5"
                    // v1.0.1 ----------------------------------------------------------------------------------------------------------------------------------->
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    {/* v1.0.1 <---------------------------------------------------- */}
                    <div className="flex justify-between items-start gap-2 mb-4">
                      {/* v1.0.1 ----------------------------------------------------> */}
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
                        {/* v1.0.1 <------------------------------------------------------------------------------------- */}
                        {/* <p className="mt-2 text-gray-600 line-clamp-2 h-[40px] text-sm break-words mb-3">
                          {template.description}
                        </p> */}
                        {/* v1.0.1 -------------------------------------------------------------------------------------> */}
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
                        {effectivePermissions.InterviewTemplates?.Edit &&
                          template.type !== "standard" && (
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
                        {effectivePermissions.InterviewTemplates?.Delete &&
                          template.type !== "standard" && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              // onClick={() => onDelete(template)}
                              className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                              title="Delete"
                            >
                              <Trash className="w-4 h-4" />
                            </motion.button>
                          )}
                        {effectivePermissions.InterviewTemplates?.Clone && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCloneClick(template)}
                            className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
                            title="Clone"
                          >
                            <Files className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    {/* v1.0.1 <-------------------------------------- */}
                    <div>
                      {/* v1.0.1 --------------------------------------> */}
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
                ))
              ) : (
                <motion.div
                  className="text-center py-8 px-4 border-2 border-dashed border-gray-400/60 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-gray-500">
                    No {formatLabelMap[format]} Templates Found
                  </p>
                </motion.div>
              )}
            </div>
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
