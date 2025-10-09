// // v1.0.0 - Ashok - changed grid for xl screens
// v2.0.0 - Ashok - Redesigned Kanban layout with modern visuals, consistent spacing, and improved card styling

import { motion } from "framer-motion";

const CandidateKanban = ({
  data = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
  title = "Candidates",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full bg-gradient-to-b from-gray-50 to-white shadow-sm border border-gray-200 pt-3 pb-8"
    >
      <div className="min-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 mx-6">
          <h3 className="sm:tex-md md:text-md lg:text-md xl:text-xl 2xl:text-xl font-semibold text-gray-800 tracking-tight">
            {title}
          </h3>
          <span className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-sm font-medium border border-custom-blue/20">
            {data?.length || 0} {data?.length > 1 ? "Candidates" : "Candidate"}
          </span>
        </div>

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] pb-20">
            <div className="px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col h-full animate-pulse"
                >
                  {/* Actions shimmer */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  </div>

                  {/* Header shimmer */}
                  <div className="flex items-start gap-4 mt-6">
                    {/* Avatar shimmer */}
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0"></div>

                    {/* Name and Role shimmer */}
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
                    </div>
                  </div>

                  {/* Divider shimmer */}
                  <div className="border-t border-gray-100 my-3"></div>

                  {/* Body shimmer (key-value pairs) */}
                  <div className="mt-auto space-y-3 text-sm">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-2 gap-2 items-center"
                      >
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                        <div className="h-3 w-24 bg-gray-200 rounded"></div>
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
          <div className="overflow-y-auto max-h-[calc(100vh-250px)] sm:pb-28 md:pb-28 lg:pb-28 xl:pb-16 2xl:pb-16">
            <div className="px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {data.map((item, index) => (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="relative group bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-md hover:border-custom-blue/30 transition-all duration-200 flex flex-col h-full"
                >
                  {/* Actions */}
                  <div
                    className="absolute top-3 right-3 z-20 transition-opacity"
                    onMouseEnter={(e) =>
                      e.currentTarget.classList.add("!opacity-100")
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.classList.remove("!opacity-100")
                    }
                  >
                    {renderActions(item)}
                  </div>

                  {/* Header */}
                  <div className="flex items-start gap-4 mt-6">
                    <div className="relative flex-shrink-0">
                      {item.avatar ? (
                        <img
                          src={item.avatar}
                          alt={item.title || "Candidate"}
                          onError={(e) => {
                            e.target.src = "/default-profile.png";
                          }}
                          className="sm:w-10 sm:h-10 md:w-10 md:h-10 w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="sm:w-10 sm:h-10 md:w-10 md:h-10 w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-md">
                          {item.title?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <h4 className="text-base font-semibold text-custom-blue truncate">
                        {item?.firstName
                          ? item?.firstName.length > 26
                            ? item?.firstName.slice(0, 26) + "..."
                            : item?.firstName
                          : "Untitled"}
                      </h4>
                      <p className="text-sm text-gray-500 truncate">
                        {item?.currentRole
                          ? item?.currentRole.length > 26
                            ? item?.currentRole.slice(0, 26) + "..."
                            : item?.currentRole
                          : "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-100 my-3"></div>

                  {/* Body */}
                  <div className="mt-auto space-y-3 text-sm">
                    {columns.map(({ key, header, render }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 items-center text-gray-700"
                      >
                        <span className="text-gray-500">{header}</span>
                        <span className="truncate font-medium text-gray-800">
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

export default CandidateKanban;
