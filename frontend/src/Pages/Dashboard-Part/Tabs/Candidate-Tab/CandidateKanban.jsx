// // v1.0.0 - Ashok - changed grid for xl screens
// v2.0.0 - Ashok - Redesigned Kanban layout with modern visuals, consistent spacing, and improved card styling
// v2.0.1 - Ashok - Improved kanban styles
// v2.0.2 - Ashok - Added one row from 3 to 4 at loading view

import { motion } from "framer-motion";
// v1.0.1 <------------------------------------------------------------------------------------
const CandidateKanban = ({
  data = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
  KanbanTitle = "Candidate",
  autoHeight = false,
  highlightText = "", // Search query to highlight
}) => {
  // Helper function to highlight matching text
  const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const textStr = String(text);
    try {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      const parts = textStr.split(regex);
      return parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span>
        ) : part
      );
    } catch (e) {
      return text;
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full bg-gradient-to-b from-gray-50 to-white shadow-sm border border-gray-200 pt-3 ${autoHeight ? 'pb-3' : 'pb-8'}`}
    >
      <div className={autoHeight ? "" : "min-h-[400px]"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3 mx-6">
          <h3 className="sm:tex-md md:text-md lg:text-md xl:text-xl 2xl:text-xl font-semibold text-gray-800 tracking-tight">
            All {KanbanTitle}s
          </h3>
          <span className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-sm font-medium border border-custom-blue/20">
            {data?.length || 0}
            <span className="ml-1">
              {data?.length > 1 ? `${KanbanTitle}s` : `${KanbanTitle}`}
            </span>
          </span>
        </div>

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-20">
            <div className="px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
                >
                  {/* Header shimmer */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3 w-full">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 w-3/4 shimmer rounded"></div>
                        <div className="h-3 w-1/2 shimmer rounded"></div>
                      </div>
                    </div>
                    <div className="h-6 w-20 shimmer rounded"></div>
                  </div>

                  {/* Body shimmer */}
                  <div className="mt-auto space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2">
                        <div className="h-3 w-16 shimmer rounded"></div>
                        <div className="h-3 w-24 shimmer rounded"></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-gray-500">
            <img
              src="/empty-state.svg"
              alt="Empty"
              className="w-32 mb-4 opacity-70"
            />
            <p className="text-sm font-medium">{emptyState}</p>
          </div>
        ) : (
          <div className={`${autoHeight ? "" : "overflow-y-auto max-h-[calc(100vh-250px)] sm:pb-28 md:pb-28 lg:pb-28 xl:pb-16 2xl:pb-16"}`}>
            <div className="px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {data.map((item, index) => (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 flex flex-col"
                >
                  {/* Header with Avatar, Title, and View Link */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.title || "Item"}
                          onError={(e) => {
                            e.target.src = "/default-profile.png";
                          }}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold">
                          {(item.firstName || item.title)?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    {/* Title, Subtitle and View Link */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 truncate">
                          {highlightText
                            ? highlightMatch(
                              item?.firstName
                                ? item?.firstName.length > 20
                                  ? item?.firstName.slice(0, 20) + "..."
                                  : item?.firstName
                                : "Untitled",
                              highlightText
                            )
                            : item?.firstName
                              ? item?.firstName.length > 20
                                ? item?.firstName.slice(0, 20) + "..."
                                : item?.firstName
                              : "Untitled"}
                        </h4>
                        {/* View Link */}
                        <span
                          className="text-xs text-custom-blue hover:underline cursor-pointer flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            renderActions(item);
                          }}
                        >
                          {renderActions(item)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {highlightText
                          ? highlightMatch(
                            item?.currentRole
                              ? item?.currentRole.length > 25
                                ? item?.currentRole.slice(0, 25) + "..."
                                : item?.currentRole
                              : "N/A",
                            highlightText
                          )
                          : item?.currentRole
                            ? item?.currentRole.length > 25
                              ? item?.currentRole.slice(0, 25) + "..."
                              : item?.currentRole
                            : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Body - Type Row */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {columns.map(({ key, header, render }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between text-xs"
                      >
                        <span className="text-gray-500">{header}</span>
                        <span className="font-medium text-gray-700">
                          {render
                            ? render(item[key], item)
                            : item[key] || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}

            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
// v1.0.1 ------------------------------------------------------------------------------------>

export default CandidateKanban;
