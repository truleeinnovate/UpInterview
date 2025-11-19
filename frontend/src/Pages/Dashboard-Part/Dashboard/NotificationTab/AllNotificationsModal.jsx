// v1.0.0 - Ashok - Disabled outer scrollbar when popup is open for better user experience
// v1.0.1 - Ashok - Improved responsiveness and added common to popup
// v1.0.2 - Ashraf - Temporarily disabled WhatsApp tab and related logic
// v1.0.3 - Ashok - fixed style issues and UI alignments

/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Bell,
  MessageSquare,
  ChevronDown,
  RefreshCw,
  Mail,
  Eye,
} from "lucide-react";
import { format, isValid } from "date-fns";
import NotificationDetailsModal from "./NotificationDetailsModal";
import classNames from "classnames";
import SidebarPopup from "../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { formatDateTime } from "../../../../utils/dateFormatter";
import { useNotifications } from "../../../../apiHooks/notifications/useNotifications";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";

const AllNotificationsModal = ({ isOpen, onClose, notifications, searchQuery, setSearchQuery, setSelectedFilter, setSelectedTimeRange, setShowFilters, setSelectedNotification, selectedNotification, activeTab, setActiveTab, page, limit }) => {





  const hasEmailProperty = notifications && Array.isArray(notifications?.email);


  // ✅ Combine only email notifications for now
  const allNotifications = [
    ...(hasEmailProperty ? notifications?.email : []),
    // ...(hasWhatsappProperty ? notifications.whatsapp : []),
  ];

  // const pagination = notifications?.pagination;

  // const filterNotifications = () => {
  //   let filtered = [...allNotifications];

  //   // ✅ Only 'email' and 'all' supported for now
  //   if (activeTab === "email") {
  //     filtered = filtered.filter(
  //       (notification) => notification?.type === "email"
  //     );
  //   }
  //   // else if (activeTab === "whatsapp") {
  //   //   filtered = filtered.filter(
  //   //     (notification) => notification.type === "whatsapp"
  //   //   );
  //   // }

  //   if (searchQuery) {
  //     filtered = filtered.filter(
  //       (notification) =>
  //         notification.subject
  //           ?.toLowerCase()
  //           .includes(searchQuery.toLowerCase()) ||
  //         false ||
  //         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
  //     );
  //   }

  //   if (selectedFilter !== "all") {
  //     filtered = filtered.filter(
  //       (notification) =>
  //         notification.status.toLowerCase() === selectedFilter.toLowerCase()
  //     );
  //   }

  //   if (selectedTimeRange !== "all") {
  //     const now = new Date();
  //     const notificationDate = (timestamp) => new Date(timestamp);

  //     switch (selectedTimeRange) {
  //       case "today":
  //         filtered = filtered.filter(
  //           (notification) =>
  //             notificationDate(notification.timestamp).toDateString() ===
  //             now.toDateString()
  //         );
  //         break;
  //       case "week":
  //         const weekAgo = new Date(now.setDate(now.getDate() - 7));
  //         filtered = filtered.filter(
  //           (notification) => notificationDate(notification.timestamp) > weekAgo
  //         );
  //         break;
  //       case "month":
  //         const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
  //         filtered = filtered.filter(
  //           (notification) =>
  //             notificationDate(notification.timestamp) > monthAgo
  //         );
  //         break;
  //       default:
  //         break;
  //     }
  //   }

  //   return filtered;
  // };

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      if (isValid(date)) {
        return format(date, "MMM dd, yyyy HH:mm");
      }
      return timestamp;
    } catch {
      return timestamp;
    }
  };

  const getNotificationCounts = () => {
    if (!hasEmailProperty) return { email: 0, whatsapp: 0, total: 0 };

    return {
      email: notifications?.email?.length,
      // whatsapp: hasWhatsappProperty ? notifications.whatsapp.length : 0,
      total: notifications?.email?.length, // + (hasWhatsappProperty ? notifications.whatsapp.length : 0),
    };
  };

  const counts = getNotificationCounts();

  if (!isOpen) return null;

  return (
    <>
      <SidebarPopup
        title="All Notifications"
        subTitle="View and manage your notifications"
        icon={<Bell />}
        onClose={onClose}
      >
        {/* Header */}
        <div className="sm:px-0 p-6 border-b border-gray-200">
          {/* Notification Type Tabs */}
          <div className="flex items-center sm:space-x-0 space-x-2 mb-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${activeTab === "all"
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
              className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${activeTab === "email"
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

            {/* 🔒 Temporarily disabled WhatsApp tab */}
            {/*
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
            */}
          </div>

          {/* Search + Filters */}
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
            {/* <div className="flex items-center gap-3">
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
            </div> */}
          </div>
        </div>

        {/* Notifications List */}
        <div
          className="overflow-y-auto"
          style={{ height: "calc(100vh - 230px)" }}
        >
          <div className="sm:px-0 p-6 space-y-4">
            {allNotifications?.length > 0 ? (
              allNotifications?.map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-all duration-300"
                >
                  <div className="flex flex-col items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Mail size={16} className="text-custom-blue" />
                          <span className="text-sm font-medium text-gray-900 truncate">
                            {capitalizeFirstLetter(notification?.subject) ||
                              "No Subject"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="text-xs text-gray-500">
                            {formatDateTime(notification?.timestamp)}
                          </span>
                        </div>
                      </div>
                      {/* <p
                        className="sm:text-xs text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: notification.message,
                        }}
                      ></p> */}
                      <div className="flex flex-col space-y-1 text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">From:</span>
                          <span>
                            {notification?.fromAddress || "Not Provided"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">To:</span>
                          <span>
                            {notification?.toAddress || "Not Provided"}
                          </span>
                        </div>
                        {notification.cc && notification.cc.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">CC:</span>
                            <span>{notification?.cc.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-1 rounded-xl text-xs font-medium ${notification.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : "bg-yellow-100 text-yellow-600"
                            }`}
                        >
                          {capitalizeFirstLetter(notification?.priority) ||
                            "Normal"}
                          <span className="sm:hidden inline ml-1">
                            Priority
                          </span>
                        </span>
                        <span
                          className={`px-2 py-1 rounded-xl text-xs font-medium ${notification.status === "Success"
                              ? "bg-green-100 text-green-600"
                              : notification.status === "Failed"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                        >
                          {capitalizeFirstLetter(notification?.status) ||
                            "Unknown"}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedNotification(notification)}
                        className="flex items-center justify-center sm:border-0 border border-gray-200 font-medium rounded-lg md:ml-4 sm:text-custom-blue bg-gray-50 sm:py-1.5 p-2 text-gray-600 hover:text-custom-blue transition-colors duration-300"
                      >
                        <span className="sm:hidden inline sm:text-xs text-sm">
                          View Details
                        </span>
                        <span className="inline md:hidden lg:hidden xl:hidden 2xl:hidden">
                          <Eye className="w-4 h-4" />
                        </span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="p-4 bg-gray-100 rounded-full mb-4">
                  <Mail className="text-gray-400 w-10 h-10 sm:h-6 sm:w-6" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  {activeTab === "all"
                    ? "No Notifications Found"
                    : "No Email Notifications"}
                </h3>
                <p className="text-sm text-gray-500 text-center max-w-md mb-4">
                  {searchQuery
                    ? `No notifications match your search for "${searchQuery}".`
                    : "You don't have any notifications at the moment."}
                </p>
              </div>
            )}
          </div>
        </div>
      </SidebarPopup>
      <div>
        <NotificationDetailsModal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          notification={selectedNotification}
        />
      </div>
    </>
  );
};

export default AllNotificationsModal;
