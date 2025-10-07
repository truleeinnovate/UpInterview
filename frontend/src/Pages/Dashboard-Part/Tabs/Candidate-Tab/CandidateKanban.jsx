// v1.0.0 - Ashok - changed grid for xl screens

import { motion } from "framer-motion";

const capitalizeFirstLetter = (str) =>
  str?.charAt(0)?.toUpperCase() + str?.slice(1);

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
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-50 rounded-xl px-6 pt-4 pb-6"
    >
      <div className="min-h-[400px]">
        {/* Header */}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            All Candidates
          </h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {data?.length || 0} {data?.length > 1 ? "Candidates" : "Candidate"}
          </span>
        </div>

        {/* Loading / Empty / Content */}
        {loading ? (
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] pb-8 pr-1">
            {/* v1.0.0 <------------------------------------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {/* v1.0.0 -------------------------------------------------------------------------------------------> */}
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
                    <div className="h-6 w-6 shimmer rounded"></div>
                  </div>

                  {/* Body shimmer */}
                  <div className="mt-auto space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
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
          <div className="text-center py-10 text-gray-500">{emptyState}</div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] pb-8 pr-1">
            {/* v1.0.0 <------------------------------------------------------------------------------------------ */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {/* v1.0.0 ------------------------------------------------------------------------------------------> */}
              {data.map((item, index) => (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3">
                      <div className="relative flex-shrink-0">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.title || "Candidate"}
                            onError={(e) => {
                              e.target.src = "/default-profile.png";
                            }}
                            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-custom-blue flex items-center justify-center text-white text-lg font-semibold shadow-sm">
                            {item.title?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden truncate">
                        <h4
                          className="text-sm font-medium text-custom-blue"
                        >
                          {item?.firstName
                            ? item?.firstName.length > 12
                              ? item?.firstName?.slice(0, 12) + "..."
                              : item?.firstName
                            : "Untitled"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {item?.currentRole
                            ? item?.currentRole.length > 12
                              ? item?.currentRole?.slice(0, 12) + "..."
                              : item?.currentRole
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {renderActions(item)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="mt-auto space-y-2 text-sm">
                    {columns.map(({ key, header, render }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 items-center text-gray-600"
                      >
                        <span className="text-gray-500 text-sm">{header}</span>
                        <span className="truncate font-semibold text-sm">
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
