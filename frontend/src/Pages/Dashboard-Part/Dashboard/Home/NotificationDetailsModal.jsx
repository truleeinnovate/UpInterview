import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, Mail, MessageSquare, Calendar, User, FileText, 
  AlertCircle, Image, FileSpreadsheet, Download, Paperclip 
} from 'lucide-react';

const NotificationDetailsModal = ({ notification, isOpen, onClose, showContentDetails }) => {
  if (!isOpen || !notification) return null;

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'interview':
        return <Calendar className="text-blue-600" size={20} />;
      case 'feedback':
        return <FileText className="text-purple-600" size={20} />;
      case 'candidate':
        return <User className="text-green-600" size={20} />;
      case 'system':
        return <AlertCircle className="text-orange-600" size={20} />;
      case 'message':
        return <MessageSquare className="text-indigo-600" size={20} />;
      default:
        return <Mail className="text-indigo-600" size={20} />;
    }
  };

  const getAttachmentIcon = (iconType) => {
    switch (iconType) {
      case 'image':
        return <Image size={16} />;
      case 'file-spreadsheet':
        return <FileSpreadsheet size={16} />;
      case 'file-text':
        return <FileText size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  const getCategoryDisplay = () => {
    if (!notification.category) return '';
    return notification.category.charAt(0).toUpperCase() + notification.category.slice(1);
  };

  const formatMessageBody = (message) => {
    return message.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-xl w-[800px] max-w-full max-h-[90vh] overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                {getNotificationIcon()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {showContentDetails && notification.category ? `${getCategoryDisplay()} Details` : 'Notification Details'}
                </h2>
                <p className="text-sm text-gray-500">View detailed information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Email Header */}
            {notification.type === 'email' && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{notification.subject}</h3>
                  <span className="text-sm text-gray-500">{notification.timestamp}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-12">From:</span>
                    <span className="text-sm text-gray-600">notifications@company.com</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="text-sm font-medium text-gray-700 w-12">To:</span>
                    <span className="text-sm text-gray-600 break-all">{Array.isArray(notification.recipients) ? notification.recipients.join(', ') : notification.recipients}</span>
                  </div>
                  {notification.cc && notification.cc.length > 0 && (
                    <div className="flex items-start space-x-2">
                      <span className="text-sm font-medium text-gray-700 w-12">CC:</span>
                      <span className="text-sm text-gray-600 break-all">{notification.cc.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Message Body */}
            <div className="bg-white rounded-xl">
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {formatMessageBody(notification.message)}
                </div>
              </div>
            </div>

            {/* Attachments */}
            {notification.attachments && notification.attachments.length > 0 && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Paperclip size={16} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Attachments ({notification.attachments.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {notification.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg">
                          {getAttachmentIcon(attachment.icon)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {attachment.name}
                          </p>
                          <p className="text-xs text-gray-500">{attachment.size}</p>
                        </div>
                      </div>
                      <button className="p-2 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors duration-300">
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status and Priority */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                  notification.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                  notification.status === 'delivered' ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                </span>
                {notification.priority === 'high' && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-lg">
                    High Priority
                  </span>
                )}
                {notification.category && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                    notification.category === 'interview' ? 'bg-blue-100 text-blue-600' :
                    notification.category === 'feedback' ? 'bg-purple-100 text-purple-600' :
                    notification.category === 'candidate' ? 'bg-green-100 text-green-600' :
                    notification.category === 'system' ? 'bg-orange-100 text-orange-600' :
                    'bg-indigo-100 text-indigo-600'
                  }`}>
                    {getCategoryDisplay()}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              {notification.category === 'interview' && (
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                  View Interview Details
                </button>
              )}
              {notification.category === 'feedback' && (
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                  View Feedback
                </button>
              )}
              {notification.category === 'candidate' && (
                <button className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300">
                  View Candidate Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationDetailsModal;