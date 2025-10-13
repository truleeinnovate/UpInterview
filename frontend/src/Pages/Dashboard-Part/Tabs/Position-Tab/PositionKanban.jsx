// v1.0.0 - Ashok - Improved responsiveness
// v1.0.1 - Ashok - changed entire kanban for passing actions
// v1.0.2 - Ashok - added loading view for kanban and fixed cards for small screens
// v1.0.3 - Ashok - changed grid layout for xl screens
// v1.0.4 - Ashok - Style issue fixed
// v1.0.5 - Ashok - Added one loading row from 3 to 4 at loading view

import { motion } from "framer-motion";

const capitalizeFirstLetter = (str) =>
  str?.charAt(0)?.toUpperCase() + str?.slice(1);

const PositionKanban = ({
  data = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
  title = "Positions",
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
        {/* v1.0.2 <------------------------------------------------------------------------------------------------------------------- */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">All Positions</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {data?.length || 0} {data?.length > 1 ? "Positions" : "Position"}
          </span>
        </div>
        {/* v1.0.2 -------------------------------------------------------------------------------------------------------------------> */}

        {/* Loading / Empty / Content */}
        {loading ? (
          // v1.0.2 <-------------------------------------------------------------------------
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] pb-8 pr-1">
            {/* v1.0.3 <------------------------------------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {/* v1.0.3 -------------------------------------------------------------------------------------------> */}
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
                    {/* v1.0.4 <--------------------------------------------- */}
                    <div className="h-6 w-20 shimmer rounded"></div>
                    {/* v1.0.4 ---------------------------------------------> */}
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
        ) : // v1.0.2 ------------------------------------------------------------------------->
        data?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{emptyState}</div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-270px)] pb-8 pr-1">
            {/* v1.0.2 <----------------------------------------------------------------------------------------------- */}
            {/* v1.0.3 <----------------------------------------------------------------------------------------------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {/* v1.0.3 -----------------------------------------------------------------------------------------------> */}
              {/* v1.0.2 -----------------------------------------------------------------------------------------------> */}
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
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-custom-blue truncate">
                          {capitalizeFirstLetter(item?.title) || "N/A"}
                        </h4>
                        {item?.subtitle
                          ? item?.subtitle.length > 16
                            ? item?.subtitle?.slice(0, 16) + "..."
                            : item?.subtitle
                          : "N/A"}
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

export default PositionKanban;
