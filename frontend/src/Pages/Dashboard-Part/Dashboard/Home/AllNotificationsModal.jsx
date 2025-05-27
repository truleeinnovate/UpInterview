import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Bell, Calendar, User, FileText, AlertCircle, MessageSquare, ChevronDown, RefreshCw, Mail, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { format, isValid } from 'date-fns';
import NotificationDetailsModal from './NotificationDetailsModal';

const AllNotificationsModal = ({ isOpen, onClose, notifications }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const allNotifications = [...notifications.email, ...notifications.whatsapp];

  const filterNotifications = () => {
    let filtered = [...allNotifications];

    if (searchQuery) {
      filtered = filtered.filter(
        notification =>
          (notification.subject?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(notification => notification.status === selectedFilter);
    }

    if (selectedTimeRange !== 'all') {
      const now = new Date();
      const notificationDate = (timestamp) => new Date(timestamp);
      
      switch (selectedTimeRange) {
        case 'today':
          filtered = filtered.filter(
            notification => 
              notificationDate(notification.timestamp).toDateString() === now.toDateString()
          );
          break;
        case 'week':
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          filtered = filtered.filter(
            notification => notificationDate(notification.timestamp) > weekAgo
          );
          break;
        case 'month':
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          filtered = filtered.filter(
            notification => notificationDate(notification.timestamp) > monthAgo
          );
          break;
        default:
          break;
      }
    }

    return filtered;
  };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isValid(date)) {
        return format(date, 'MMM dd, yyyy HH:mm');
      }
      return timestamp;
    } catch (error) {
      return timestamp;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      >
        <div className="absolute inset-0" onClick={onClose} />
      </motion.div>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className={`fixed right-0 top-0 h-screen bg-white shadow-xl z-50 transition-all duration-300 ${
          isExpanded ? 'w-full' : 'w-full md:w-1/2'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Bell className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">All Notifications</h2>
                <p className="text-sm text-gray-500">View and manage your notifications</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <Filter size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600">Filters</span>
                <ChevronDown
                  size={16}
                  className={`text-gray-500 transform transition-transform duration-300 ${
                    showFilters ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="sent">Sent</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Range</label>
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Time</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto" style={{ height: 'calc(100vh - 230px)' }}>
          <div className="p-6 space-y-4">
            {filterNotifications().map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedNotification(notification)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center space-x-2">
                      {notification.type === 'email' ? (
                        <Mail size={16} className="text-indigo-600" />
                      ) : (
                        <MessageSquare size={16} className="text-green-600" />
                      )}
                      <span className="text-sm font-medium text-gray-900">
                        {notification.type === 'email' ? notification.subject : 'WhatsApp Message'}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        notification.status === 'sent' ? 'bg-blue-100 text-blue-600' :
                        notification.status === 'delivered' ? 'bg-green-100 text-green-600' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {notification.status.charAt(0).toUpperCase() + notification.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    {notification.type === 'email' && (
                      <div className="flex flex-col space-y-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">To:</span>
                          <span>{notification.recipients.join(', ')}</span>
                        </div>
                        {notification.cc && notification.cc.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">CC:</span>
                            <span>{notification.cc.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gray-500">
                        {formatDate(notification.timestamp)}
                      </span>
                      {notification.priority === 'high' && (
                        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-lg">
                          High Priority
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <NotificationDetailsModal
        isOpen={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        notification={selectedNotification}
      />
    </>
  );
};

export default AllNotificationsModal;