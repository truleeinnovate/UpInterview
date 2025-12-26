// // Created by Ashok
// v1.0.0 - Ashok - Added ability to click on title to navigate
// v1.0.1 - Ashok - Improved subtile handling

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { capitalizeFirstLetter } from "../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";


const KanbanCommon = ({
  data = [],
  columns = [],
  loading = false,
  renderActions = () => null,
  emptyState = "No Data Found",
  kanbanTitle = "",
  onTitleClick,
  customHeight = "calc(100vh - 250px)",
}) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-gray-50 border border-gray-200 shadow-sm pt-3 pb-8"
    >
      <div className="min-h-[400px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 mx-6">
          <h3 className="sm:tex-md md:text-md lg:text-md xl:text-xl 2xl:text-xl font-semibold text-gray-800 tracking-tight">
            All {capitalizeFirstLetter(kanbanTitle)}s
          </h3>
          <span className="px-3 py-1.5 bg-white text-gray-500 rounded-lg text-sm font-medium border border-custom-blue/20">
            {data?.length || 0}
            <span className="ml-1">
              {data?.length > 1
                ? `${capitalizeFirstLetter(kanbanTitle)}s`
                : `${capitalizeFirstLetter(kanbanTitle)}`}
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
                    {Array.from({ length: 5 }).map((_, i) => (
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
            <p className="text-sm font-medium">{emptyState}</p>
          </div>
        ) : (
          <div className="overflow-y-auto sm:pb-28 md:pb-28 lg:pb-28 xl:pb-16 2xl:pb-16"
          style={{ maxHeight: customHeight }}
          >
            <div className="px-4 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {data.map((item, index) => (
                <motion.div
                  key={item.id || item._id || index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="relative bg-white rounded-xl p-5 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
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
                  <div className="flex items-start gap-4 mb-4">
                    {/* Only show image area if 'avatar' key exists in item */}
                    {"avatar" in item && (
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
                    )}

                    <div className="overflow-hidden flex-1 min-w-0 pr-28">
                      <h4 className="text-base font-semibold text-custom-blue truncate">
                        <span
                          className={`${
                            item?.navigateTo || onTitleClick
                              ? "cursor-pointer"
                              : ""
                          }`}
                          onClick={() => {
                            if (onTitleClick) onTitleClick(item);
                            else if (item?.navigateTo)
                              navigate(item?.navigateTo);
                          }}
                          title={item?.title}
                        >
                          {capitalizeFirstLetter(item?.title) || "N/A"}
                        </span>
                      </h4>
                      {item?.subTitle && (
                        <p className="text-sm text-gray-500 truncate">
                          {capitalizeFirstLetter(item.subTitle)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="mt-auto space-y-3 text-sm">
                    {columns.map(({ key, header, render }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 items-center text-gray-700"
                      >
                        <span className="text-gray-500">
                          {capitalizeFirstLetter(header)}
                        </span>
                        <span className="truncate font-medium text-gray-800">
                          {render
                            ? render(item[key], item)
                            : capitalizeFirstLetter(item[key]) || "N/A"}
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

export default KanbanCommon;
