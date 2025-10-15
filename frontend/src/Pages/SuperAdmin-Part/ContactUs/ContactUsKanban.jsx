import { motion } from "framer-motion";
import {
  Eye,
  Pencil,
  Trash,
  Mail,
  Phone,
  User,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
} from "lucide-react";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";

const ContactUsKanban = ({
  contactMessages = [],
  currentPage = 0,
  itemsPerPage = 10,
  onView,
  onEdit,
  onDelete,
  permissions = {},
}) => {
  // Define status columns
  const statusColumns = [
    { key: "pending", label: "Pending", color: "yellow", icon: Clock },
    { key: "in_progress", label: "In Progress", color: "blue", icon: AlertCircle },
    { key: "resolved", label: "Resolved", color: "green", icon: CheckCircle },
  ];

  // Get messages by status with pagination
  const getMessagesByStatus = (status) => {
    const allMessages = contactMessages.filter(
      (message) => message.status === status
    );
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      paginatedMessages: allMessages.slice(startIndex, endIndex),
      totalMessages: allMessages.length,
    };
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case "technical":
        return "🔧";
      case "billing":
        return "💳";
      case "access":
        return "🔒";
      case "feature_request":
        return "✨";
      case "general":
        return "📋";
      default:
        return "📝";
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} min ago`;
      }
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  // Calculate if there are multiple pages
  const hasMultiplePages = statusColumns.some(column => {
    const { totalMessages } = getMessagesByStatus(column.key);
    return totalMessages > itemsPerPage;
  });

  return (
    <div className="space-y-4">
      {/* Page indicator */}
      {hasMultiplePages && (
        <div className="text-sm text-gray-600 text-center">
          Page {currentPage + 1} - Showing up to {itemsPerPage} items per status
        </div>
      )}

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((column, columnIndex) => {
          const { paginatedMessages, totalMessages } = getMessagesByStatus(column.key);
          const Icon = column.icon;

          return (
            <motion.div
              key={column.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: columnIndex * 0.1 }}
              className="bg-gray-50 rounded-lg p-4"
            >
              {/* Column header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`h-5 w-5 text-${column.color}-500`}
                  />
                  <h3 className="font-semibold text-gray-900">{column.label}</h3>
                  <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    {totalMessages}
                  </span>
                </div>
              </div>

              {/* Column content */}
              <div className="space-y-3">
                {paginatedMessages.length > 0 ? (
                  paginatedMessages.map((message, index) => (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      {/* Card header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-gray-500">
                              #{message._id.slice(-6)}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
                                message.priority
                              )}`}
                            >
                              {message.priority?.toUpperCase()}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 truncate">
                            {message.subject}
                          </h4>
                        </div>
                        <span className="text-xl">{getCategoryIcon(message.category)}</span>
                      </div>

                      {/* Contact info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          <span className="truncate">{message.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{message.email}</span>
                        </div>
                        {message.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{message.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Message preview */}
                      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {message.message}
                      </div>

                      {/* Card footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(message.createdAt)}</span>
                        </div>
                        
                        {/* Action buttons */}
                        <div className="flex gap-1">
                          {permissions?.View !== false && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(message._id);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4 text-gray-600" />
                            </button>
                          )}
                          {permissions?.Edit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(message._id);
                              }}
                              className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4 text-blue-600" />
                            </button>
                          )}
                          {permissions?.Delete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(message._id);
                              }}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash className="h-4 w-4 text-red-600" />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Icon className="h-8 w-8 text-gray-300" />
                      <p className="text-sm">No messages</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Page info */}
      {!hasMultiplePages && contactMessages.length > 0 && (
        <div className="text-sm text-gray-500 text-center mt-4">
          All {contactMessages.length} items displayed
        </div>
      )}
    </div>
  );
};

export default ContactUsKanban;
