import { motion } from "framer-motion";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parseISO, isValid } from "date-fns";
import { Building2, Briefcase, Clock, MapPin, Eye, Pencil } from "lucide-react";

const formatCreatedDate = (date) => {
  return date && isValid(parseISO(date))
    ? format(parseISO(date), "dd MMM, yyyy")
    : "N/A";
};

const Kanban = ({ payments, loading }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-1/4 bg-gray-200 animate-pulse rounded"></div>
          <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
          {[...Array(8)].map((_, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center w-full space-x-3">
                  <div className="w-10 h-6 bg-gray-200 animate-pulse rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 bg-gray-200 animate-pulse rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 animate-pulse rounded"></div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 animate-pulse rounded"></div>
                    <div className="h-3 w-3/4 bg-gray-200 animate-pulse rounded"></div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-16 bg-gray-200 animate-pulse rounded-full"
                  ></div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <DndContext collisionDetection={closestCenter}>
      <motion.div
        className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="h-full">
          <motion.div
            className="flex items-center justify-between mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-gray-800">
              All payments
            </h3>
            <span className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200">
              {payments?.length || 0} payments
            </span>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {payments?.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No payments Found
                </h3>
                <p className="text-gray-500 text-center max-w-md">
                  There are no payments to display at the moment.
                </p>
              </div>
            ) : (
              payments?.map((payment, index) => (
                <motion.div
                  key={payment._id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() =>
                    navigate(`/payment/view-details/${payment._id}`, {
                      state: { from: location.pathname },
                    })
                  }
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <div className="relative"></div>
                      <div>
                        <h4 className="text-sm font-medium text-custom-blue">
                          {payment?.paymentCode || "N/A"}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payment/view-details/${payment._id}`, {
                            state: { from: location.pathname },
                          });
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/payment/edit-payment/${payment._id}`);
                        }}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="truncate">
                          {payment?.paymentGateway || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="truncate">
                          {payment?.status || "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="w-4 h-4 text-gray-500" />
                        {formatCreatedDate(payment?.createdAt) || "N/A"}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span className="trunc">{payment?.transactionId || "Not disclosed"}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </DndContext>
  );
};

export default Kanban;
