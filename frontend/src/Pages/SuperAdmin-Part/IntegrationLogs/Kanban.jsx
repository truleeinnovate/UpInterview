import { motion } from "framer-motion";

const capitalizeFirstLetter = (str) =>
  str?.charAt(0)?.toUpperCase() + str?.slice(1);

const KanbanView = ({
  data = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-50 rounded-xl px-6 pt-6 pb-6"
    >
      <div className="min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">
            Integration Logs
          </h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {data?.length || 0} Integration Logs
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : data?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{emptyState}</div>
        ) : (
          <div className="overflow-y-auto max-h-[calc(100vh-340px)] pb-8 pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
              {data.map((item, index) => (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
                >
                  {/* Card content */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-custom-blue truncate">
                          {capitalizeFirstLetter(item?.title) || "N/A"}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          {item?.subtitle || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {renderActions(item)}
                    </div>
                  </div>

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

export default KanbanView;
