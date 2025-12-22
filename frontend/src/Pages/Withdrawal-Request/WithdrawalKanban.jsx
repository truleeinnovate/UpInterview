import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  Building,
  RefreshCw,
  Eye,
} from "lucide-react";

const WithdrawalKanban = ({ 
  withdrawalRequests = [], 
  onCardClick, 
  isLoading, 
  refetch,
  currentPage = 0,
  itemsPerPage = 10 
}) => {
  const [hoveredCard, setHoveredCard] = useState(null);

  const columns = [
    {
      id: "pending",
      title: "Pending",
      color: "bg-yellow-50 border-yellow-200",
      headerColor: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="h-4 w-4" />,
    },
    // {
    //   id: "processing",
    //   title: "Processing",
    //   color: "bg-blue-50 border-blue-200",
    //   headerColor: "bg-blue-100 text-blue-800",
    //   icon: <AlertCircle className="h-4 w-4" />,
    // },
    {
      id: "completed",
      title: "Completed",
      color: "bg-green-50 border-green-200",
      headerColor: "bg-green-100 text-green-800",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    {
      id: "failed",
      title: "Failed",
      color: "bg-red-50 border-red-200",
      headerColor: "bg-red-100 text-red-800",
      icon: <XCircle className="h-4 w-4" />,
    },
    // {
    //   id: "cancelled",
    //   title: "Cancelled",
    //   color: "bg-gray-50 border-gray-200",
    //   headerColor: "bg-gray-100 text-gray-800",
    //   icon: <AlertCircle className="h-4 w-4" />,
    // },
  ];

  const getRequestsByStatus = (status) => {
    const allRequests = withdrawalRequests.filter(
      (request) => request.status?.toLowerCase() === status
    );
    
    // When itemsPerPage <= 0, disable local pagination and return all for this page
    if (!itemsPerPage || itemsPerPage <= 0) {
      return {
        paginatedRequests: allRequests,
        totalRequests: allRequests.length,
      };
    }

    // Apply pagination - get only the items for current page
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedRequests: allRequests.slice(startIndex, endIndex),
      totalRequests: allRequests.length
    };
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
      </div>
    );
  }

  // Calculate the actual number of pages needed
  const getTotalPages = () => {
    if (!itemsPerPage || itemsPerPage <= 0) return 1;
    const statusCounts = columns.map(col => {
      const requests = withdrawalRequests.filter(
        (request) => request.status?.toLowerCase() === col.id
      );
      return requests.length;
    });
    const maxItems = Math.max(...statusCounts, 0);
    return maxItems > 0 ? Math.ceil(maxItems / itemsPerPage) : 1;
  };

  const totalPages = getTotalPages();

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header with Refresh and Pagination Info */}
      <div className="flex justify-between items-center mb-4">
        {/* Page Info - Only show if there are items */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">
              Page {currentPage + 1} of {totalPages} 
              <span className="ml-2 text-gray-400">
                (Showing up to {itemsPerPage} items per status)
              </span>
            </span>
          </div>
        )}
        {totalPages <= 1 && (
          <div className="bg-white px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-sm text-gray-600">
              All items displayed
            </span>
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={refetch}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-3 sm:grid-cols-2 gap-4">
        {columns.map((column) => (
          <div
            key={column.id}
            className={`${column.color} border rounded-lg overflow-hidden min-w-0`}
          >
            {/* Column Header */}
            <div className={`${column.headerColor} p-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                {column.icon}
                <h3 className="font-semibold text-sm">{column.title}</h3>
              </div>
              <span className="bg-white/90 px-2 py-0.5 rounded-full text-xs font-semibold ml-2">
                {getRequestsByStatus(column.id).totalRequests}
              </span>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
              {(() => {
                const { paginatedRequests, totalRequests } = getRequestsByStatus(column.id);
                if (paginatedRequests.length === 0) {
                  return (
                    <p className="text-center text-gray-500 py-8">
                      {totalRequests === 0 ? "No requests" : `No requests on page ${currentPage + 1}`}
                    </p>
                  );
                }
                return paginatedRequests.map((request) => (
                  <motion.div
                    key={request._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg p-4 shadow-sm cursor-pointer relative"
                    onMouseEnter={() => setHoveredCard(request._id)}
                    onMouseLeave={() => setHoveredCard(null)}
                    onClick={() => onCardClick(request)}
                  >
                    {/* Action Buttons */}
                    {hoveredCard === request._id && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCardClick(request);
                          }}
                          className="p-1 bg-custom-blue/10 rounded hover:bg-gray-200"
                        >
                          <Eye className="h-3 w-3 text-custom-blue" />
                        </button>
                        {/* {(request.status === "pending" || request.status === "processing") && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onCardClick(request);
                            }}
                            className="p-1 bg-blue-100 rounded hover:bg-blue-200"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        )} */}
                      </div>
                    )}

                    {/* Withdrawal Code */}
                    <div className="flex items-center justify-between mb-2 mt-6">
                      <span className="font-semibold text-sm text-gray-900">
                        {request.withdrawalCode || "N/A"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request?.mode ? request?.mode.charAt(0).toUpperCase() + request?.mode.slice(1): "Manual"}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="mb-3">
                      <div className="flex items-center text-lg font-bold text-gray-900">
                        <IndianRupee className="h-4 w-4" />
                        <span>{request.amount?.toFixed(2) || "0.00"}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Net: ₹{request.netAmount?.toFixed(2) || "0.00"}
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <User className="h-3 w-3" />
                        <span className="truncate">
                          {request.bankAccountId?.accountHolderName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Building className="h-3 w-3" />
                        <span className="truncate">
                          {request.bankAccountId?.bankName || "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <CreditCard className="h-3 w-3" />
                        <span>{request.bankAccountId?.maskedAccountNumber || "****"}</span>
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="border-t pt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(request.createdAt)}</span>
                        <span>{formatTime(request.createdAt)}</span>
                      </div>
                      
                      {/* Status-specific dates */}
                      {request.status === "completed" && request.completedAt && (
                        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Completed: {formatDate(request.completedAt)}</span>
                        </div>
                      )}
                      
                      {request.status === "failed" && request.failedAt && (
                        <div className="flex items-center gap-2 text-xs text-red-600 mt-1">
                          <XCircle className="h-3 w-3" />
                          <span>Failed: {formatDate(request.failedAt)}</span>
                        </div>
                      )}
                      
                      {request.status === "cancelled" && request.cancelledAt && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Cancelled: {formatDate(request.cancelledAt)}</span>
                        </div>
                      )}
                    </div>

                    {/* Additional Info for specific statuses */}
                    {request.status === "failed" && request.failureReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        <span className="font-medium">Reason: </span>
                        {request.failureReason}
                      </div>
                    )}

                    {request.status === "cancelled" && request.cancellationReason && (
                      <div className="mt-2 p-2 bg-gray-100 rounded text-xs text-gray-700">
                        <span className="font-medium">Reason: </span>
                        {request.cancellationReason}
                      </div>
                    )}

                    {request.metadata?.manualProcessing?.transactionReference && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-700">
                        <span className="font-medium">Ref: </span>
                        {request.metadata.manualProcessing.transactionReference}
                      </div>
                    )}
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WithdrawalKanban;
