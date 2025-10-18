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
  // Get paginated messages
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMessages = contactMessages.slice(startIndex, endIndex);


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

  return (
    <div className="space-y-4">
      {/* Page indicator */}
      {contactMessages.length > itemsPerPage && (
        <div className="text-sm text-gray-600 text-center">
          Page {currentPage + 1} - Showing {startIndex + 1} to {Math.min(endIndex, contactMessages.length)} of {contactMessages.length}
        </div>
      )}

      {/* Kanban grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedMessages.length > 0 ? (
          paginatedMessages.map((message, index) => (
            <motion.div
              key={message._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {/* Contact info */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{message.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{message.email || 'N/A'}</span>
                </div>
              </div>

              {/* Message preview */}
              <div className="mb-3">
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-400 mt-0.5" />
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {message.message || 'No message'}
                  </p>
                </div>
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
                      onClick={() => onView(message._id)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </button>
                  )}
                  {permissions?.Edit && (
                    <button
                      onClick={() => onEdit(message._id)}
                      className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4 text-blue-600" />
                    </button>
                  )}
                  {permissions?.Delete && (
                    <button
                      onClick={() => onDelete(message._id)}
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
          <div className="col-span-full text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p>No contact messages found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactUsKanban;
