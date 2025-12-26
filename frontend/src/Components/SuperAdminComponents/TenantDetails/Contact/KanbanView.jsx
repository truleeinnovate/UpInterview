import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const KanbanView = ({
  data = [],
  contacts = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
  viewMode = "",
  onTitleClick,
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
    >
      <div className="h-full w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800">All Contacts</h3>
          <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
            {contacts?.length || 0} Contacts
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : contacts?.length === 0 ? (
          <div className="text-center py-10 text-gray-500">{emptyState}</div>
        ) : (
          <div
            className={`${
              viewMode === "collapsed"
                ? "flex flex-col gap-5 w-full"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-5 w-full"
            }`}
          >
            {data.map((item, index) => (
              <motion.div
                key={item.id || item._id || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
              >
                {/* Header: Avatar, Title, Subtitle */}
                <div className="flex justify-between items-start mb-4 gap-2">
                  <div className="flex items-start gap-3">
                    {item?.avatar ? (
                      <img
                        src={item.avatar}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full object-cover cursor-pointer"
                        title={item?.title}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full bg-custom-blue text-white flex items-center justify-center font-semibold text-base cursor-pointer select-none"
                        title={item?.title || "Unnamed"}
                      >
                        {(item?.title || "?").charAt(0).toUpperCase()}
                      </div>
                    )}

                    <h4 className="text-base font-semibold text-custom-blue truncate">
                      <span
                        className={`${
                          item?.navigateTo || onTitleClick
                            ? "cursor-pointer"
                            : ""
                        }`}
                        onClick={() => {
                          if (onTitleClick) onTitleClick(item);
                          else if (item?.navigateTo) navigate(item?.navigateTo);
                        }}
                        title={item?.title}
                      >
                        {capitalizeFirstLetter(item?.title) || "N/A"}
                      </span>
                    </h4>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {renderActions(item)}
                  </div>
                </div>

                {/* Dynamic Columns */}
                <div className="mt-auto space-y-2 text-sm">
                  {columns.map(({ key, header, render }) => (
                    <div
                      key={key}
                      className="grid grid-cols-2 items-center text-gray-600"
                    >
                      <span className="text-gray-500 text-sm">{header}</span>
                      <span className="truncate font-semibold text-sm">
                        {render ? render(item[key], item) : item[key] || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KanbanView;
