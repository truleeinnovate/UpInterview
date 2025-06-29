import { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  IoIosArrowUp,
} from "react-icons/io";
import PropTypes from 'prop-types';
import Cookies from "js-cookie";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import { X } from 'lucide-react';
import { usePushNotifications } from '../../apiHooks/usePushNotifications';

const NotificationList = ({ notifications = [], detailed = false, onMarkAsRead }) => {
  if (!Array.isArray(notifications)) return null;

  return (
    <div className={`${detailed ? 'space-y-4' : 'max-h-96 overflow-y-auto'}`}>
      {notifications.map((notification) => (
        <div
          key={notification?._id || Math.random()}
          className={`px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
            notification?.unread ? 'bg-blue-50' : ''
          }`}
          onClick={() => notification?._id && onMarkAsRead(notification._id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {notification?.title || 'No Title'}
                </p>
                {notification?.unread && (
                  <span className="w-2 h-2 bg-custom-blue rounded-full flex-shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {notification?.message || 'No message'}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {notification?.timestamp ? new Date(notification.timestamp).toLocaleString() : 'No date'}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {notification?.type || 'unknown'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

NotificationList.propTypes = {
  notifications: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      title: PropTypes.string,
      message: PropTypes.string,
      type: PropTypes.string,
      unread: PropTypes.bool,
      timestamp: PropTypes.string,
    })
  ),
  detailed: PropTypes.bool,
  onMarkAsRead: PropTypes.func.isRequired,
};

export default function NotificationPanel({ isOpen, setIsOpen, closeOtherDropdowns }) {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [filter, setFilter] = useState('all');

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;

  // Use shared hook for data + mutations
  const { notifications: notificationList = [], isLoading: loading, markAsRead, markAllAsRead } = usePushNotifications(ownerId);
  // const [error, setError] = useState(null);





  useEffect(() => {
    if (!isOpen) {
      setShowAllNotifications(false); // Reset when panel closes
    }
  }, [isOpen]);





  const typeFilteredNotifications = (notificationList || []).filter((notification) => {
    if (!notification) return false;
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.unread;
    if (filter === 'subscription') return notification.category === 'Subscription';
    if (filter === 'interviews') return notification.category === 'Interviews';
    if (filter === 'assessments') return notification.category === 'Assessments';
    if (filter === 'feedback') return notification.category === 'Feedback';
    if (filter === 'schedule') return notification.category === 'Schedule';
    return notification.category === filter;
  });

  const filteredNotifications = [...typeFilteredNotifications].sort((a, b) => {
    if (a.unread === b.unread) return 0;
    return a.unread ? -1 : 1;
  });
  //console.log("Filtered Notifications:", filteredNotifications); // Debug log

  const unreadCount = (notificationList || []).filter((n) => n?.unread).length;

  const togglePanel = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setShowAllNotifications(false); // Reset full view when closing
    }
    if (!isOpen) {
      closeOtherDropdowns(); // Close other dropdowns when opening
    }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className={`relative p-2 ${isOpen ? 'text-custom-blue' : 'text-black'} focus:outline-none rounded-lg`}
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && !showAllNotifications && (
         <div className="relative">
        <div className="absolute top-5 border right-0 w-80 bg-white rounded-lg shadow-lg py-2 z-50 -mr-10">
          <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-gray-200">
            <h3 className="text-base sm:text-lg font-medium text-gray-800">Notifications</h3>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={togglePanel}>
            <X className="w-4 h-4" />
             
            </button>
          </div>
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading notifications...</div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
          ) : (
            <>
              <NotificationList notifications={filteredNotifications.slice(0, 3)} onMarkAsRead={markAsRead} />
              <div className="px-3 sm:px-4 py-2 border-t border-gray-200">
                <button
                  className="w-full text-sm text-custom-blue hover:text-custom-blue/80 font-medium rounded-md px-3 py-1.5"
                  onClick={() => setShowAllNotifications(true)}
                >
                  View All Notifications
                </button>
              </div>
            </>
          )}
        </div>
        <IoIosArrowUp className="absolute top-3 left-[50%] -translate-x-1/2 right-0 w-4 h-4 text-white bg-white border-t border-l rotate-45 z-50" />
        </div>
      )}

      {isOpen && showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-md shadow-lg w-full max-w-2xl max-h-[600px] overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg sm:text-sm font-semibold text-gray-600">All Notifications</h2>
              <button onClick={() => setShowAllNotifications(false)} className="text-gray-500 hover:text-gray-700">
                <XMarkIcon className="h-5 w-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="px-4 sm:px-6 py-4 border-b">
              <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-2 sm:gap-4">
                <div className="w-full sm:w-auto">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full text-sm border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-custom-blue"
                  >
                    <option value="all">All</option>
                    <option value="unread">Unread</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Interviews">Interviews</option>
                    <option value="Assessments">Assessments</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Schedule">Schedule</option>
                  </select>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={markAllAsRead}
                    className="flex-1 sm:flex-none text-sm text-custom-blue hover:text-custom-blue/80 px-3 py-1.5 border border-custom-blue rounded-md hover:bg-custom-blue/10"
                  >
                    Mark all as read
                  </button>
                  <button
                    className="flex-1 sm:flex-none text-sm text-red-600 hover:text-red-800 px-3 py-1.5 border border-red-600 rounded-md hover:bg-red-50"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto max-h-[400px]">
              {loading ? (
                <div className="text-center text-gray-500 py-8">Loading notifications...</div>
              ) : filteredNotifications.length > 0 ? (
                <NotificationList notifications={filteredNotifications} detailed={true} onMarkAsRead={markAsRead} />
              ) : (
                <div className="text-center text-gray-500 py-8">No notifications found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

NotificationPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  closeOtherDropdowns: PropTypes.func.isRequired,
};