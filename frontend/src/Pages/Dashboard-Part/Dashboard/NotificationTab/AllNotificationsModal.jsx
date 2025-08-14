// v1.0.0 - Ashok - Disabled outer scrollbar when popup is open for better user experience

/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Filter,
  Minimize,
  Expand,
  Bell,
  MessageSquare,
  ChevronDown,
  RefreshCw,
  Mail,
} from "lucide-react";
import { format, isValid } from "date-fns";
import NotificationDetailsModal from "./NotificationDetailsModal";
import Modal from "react-modal";
import classNames from "classnames";

const AllNotificationsModal = ({ isOpen, onClose, notifications }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'email', or 'whatsapp'

  // Check if notifications is properly structured
  const hasEmailProperty = notifications && Array.isArray(notifications.email);
  const hasWhatsappProperty =
    notifications && Array.isArray(notifications.whatsapp);

  // Create a safe combined array of notifications
  const allNotifications = [
    ...(hasEmailProperty ? notifications.email : []),
    ...(hasWhatsappProperty ? notifications.whatsapp : []),
  ];

  const filterNotifications = () => {
    let filtered = [...allNotifications];

    // Filter by type (email or whatsapp)
    if (activeTab === "email") {
      filtered = filtered.filter(
        (notification) => notification.type === "email"
      );
    } else if (activeTab === "whatsapp") {
      filtered = filtered.filter(
        (notification) => notification.type === "whatsapp"
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (notification) =>
          notification.subject
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          false ||
          notification.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (notification) =>
          notification.status.toLowerCase() === selectedFilter.toLowerCase()
      );
    }

    if (selectedTimeRange !== "all") {
      const now = new Date();
      const notificationDate = (timestamp) => new Date(timestamp);

      switch (selectedTimeRange) {
        case "today":
          filtered = filtered.filter(
            (notification) =>
              notificationDate(notification.timestamp).toDateString() ===
              now.toDateString()
          );
          break;
        case "week":
          const weekAgo = new Date(now.setDate(now.getDate() - 7));
          filtered = filtered.filter(
            (notification) => notificationDate(notification.timestamp) > weekAgo
          );
          break;
        case "month":
          const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
          filtered = filtered.filter(
            (notification) =>
              notificationDate(notification.timestamp) > monthAgo
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
        return format(date, "MMM dd, yyyy HH:mm");
      }
      return timestamp;
    } catch (error) {
      return timestamp;
    }
  };

  const getNotificationCounts = () => {
    if (!hasEmailProperty || !hasWhatsappProperty)
      return { email: 0, whatsapp: 0, total: 0 };

    return {
      email: notifications.email.length,
      whatsapp: notifications.whatsapp.length,
      total: notifications.email.length + notifications.whatsapp.length,
    };
  };

  const counts = getNotificationCounts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  if (!isOpen) return null;

  const modalClass = classNames(
    "fixed bg-white shadow-2xl border-l border-gray-200",
    {
      "overflow-y-auto": !isModalOpen,
      "overflow-hidden": isModalOpen,
      "inset-0": isFullScreen,
      "inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2": !isFullScreen,
    }
  );

  return (
    <>
      <Modal
        isOpen={true}
        // onRequestClose={onClose}
        className={modalClass}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-xl">
                <Bell className="w-6 h-6 text-custom-blue" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  All Notifications
                </h2>
                <p className="text-sm text-gray-500">
                  View and manage your notifications
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title={isFullScreen ? "Collapse" : "Expand"}
              >
                {/* {isExpanded ? <Minimize2 size={20} /> : <Maximize2 size={20} />} */}
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Notification Type Tabs */}
          <div className="flex items-center space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "all"
                  ? "bg-indigo-50 text-custom-blue"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Bell size={18} />
              <span className="text-sm">All</span>
              {counts.total > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-custom-blue rounded-full">
                  {counts.total}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "email"
                  ? "bg-indigo-50 text-custom-blue"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Mail size={18} />
              <span className="text-sm">Email</span>
              {counts.email > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-custom-blue rounded-full">
                  {counts.email}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("whatsapp")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                activeTab === "whatsapp"
                  ? "bg-indigo-50 text-custom-blue"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <MessageSquare size={18} />
              <span className="text-sm">WhatsApp</span>
              {counts.whatsapp > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-indigo-100 text-custom-blue rounded-full">
                  {counts.whatsapp}
                </span>
              )}
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-row items-stretch sm:items-center gap-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
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
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFilter("all");
                  setSelectedTimeRange("all");
                  setActiveTab("all");
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                title="Reset Filters"
              >
                <RefreshCw size={20} />
              </button>
            </div>
          </div>

          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex flex-wrap gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Range
                    </label>
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
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 230px)" }}
        >
          <div className="p-6 space-y-4">
            {filterNotifications().length > 0 ? (
              filterNotifications().map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center space-x-2">
                        {notification.type === "email" ? (
                          <Mail size={16} className="text-custom-blue" />
                        ) : (
                          <MessageSquare size={16} className="text-green-600" />
                        )}
                        <span className="text-sm font-medium text-gray-900">
                          {notification.subject || "No Subject"}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            notification.status.toLowerCase() === "success"
                              ? "bg-green-100 text-green-600"
                              : notification.status.toLowerCase() === "failed"
                              ? "bg-red-100 text-red-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {notification.status}
                        </span>
                      </div>
                      <p
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: notification.message,
                        }}
                      ></p>
                      {notification.type === "email" && (
                        <div className="flex flex-col space-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">To:</span>
                            <span>
                              {Array.isArray(notification.recipients)
                                ? notification.recipients.join(", ")
                                : notification.recipients}
                            </span>
                          </div>
                          {notification.cc && notification.cc.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">CC:</span>
                              <span>{notification.cc.join(", ")}</span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.timestamp)}
                        </span>
                        {notification.priority === "high" && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-lg">
                            High Priority
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start justify-end">
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-2 space-x-2 text-sm text-gray-600 hover:text-custom-blue transition-colors duration-300"
                      >
                        <span className="text-sm font-medium">
                          View Details
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  {activeTab === "email" ? (
                    <Mail size={32} className="text-gray-400" />
                  ) : activeTab === "whatsapp" ? (
                    <MessageSquare size={32} className="text-gray-400" />
                  ) : (
                    <Bell size={32} className="text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {activeTab === "all"
                    ? "No Notifications Found"
                    : `No ${
                        activeTab === "email" ? "Email" : "WhatsApp"
                      } Notifications`}
                </h3>
                <p className="text-gray-500 text-center max-w-md mb-4">
                  {searchQuery
                    ? `No notifications match your search for "${searchQuery}".`
                    : selectedFilter !== "all" || selectedTimeRange !== "all"
                    ? "No notifications match your current filters."
                    : activeTab === "all"
                    ? "You don't have any notifications at the moment."
                    : `You don't have any ${activeTab} notifications at the moment.`}
                </p>
                {(searchQuery ||
                  selectedFilter !== "all" ||
                  selectedTimeRange !== "all" ||
                  activeTab !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedFilter("all");
                      setSelectedTimeRange("all");
                      setActiveTab("all");
                    }}
                    className="px-4 py-2 text-sm font-medium text-custom-blue bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors duration-300"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>
      {/* v1.0.1 <------------------------------------------------------------- */}
      <div>
        <NotificationDetailsModal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      </div>
      {/* v1.0.1 -------------------------------------------------------------> */}
    </>
  );
};

export default AllNotificationsModal;
