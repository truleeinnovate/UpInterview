// v1.0.0  -  Ashraf  -  using authcookie manager to get current tokein
// v1.0.1  -  Ashok   -  Disabled outer scrollbar when popup is open
import { useState, useEffect } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode";
import { X } from "lucide-react";
import { usePushNotifications } from "../../apiHooks/usePushNotifications";
// <---------------------- v1.0.0
import AuthCookieManager, {
  getAuthToken,
} from "../../utils/AuthCookieManager/AuthCookieManager";
// ---------------------- v1.0.0 >
// v1.0.1 <---------------------------------------------------------------------------------------
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";
// v1.0.1 --------------------------------------------------------------------------------------->
import { formatDateTime } from "../../utils/dateFormatter";

const NotificationList = ({
  notifications = [],
  detailed = false,
  onMarkAsRead,
}) => {
  if (!Array.isArray(notifications)) return null;

  return (
    <div className={`${detailed ? "space-y-4" : "max-h-96 overflow-y-auto"}`}>
      {notifications.map((notification) => (
        <div
          key={notification?._id || Math.random()}
          className={`px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors ${
            notification?.unread ? "bg-blue-50" : ""
          }`}
          onClick={() => notification?._id && onMarkAsRead(notification._id)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {notification?.title || "No Title"}
                </p>
                {notification?.unread && (
                  <span className="w-2 h-2 bg-custom-blue rounded-full flex-shrink-0" />
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                  {notification?.message || "No message"}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {formatDateTime(notification?.createdAt)}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-600">
                    {notification?.type || "unknown"}
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
      createdAt: PropTypes.string,
      type: PropTypes.string,
      unread: PropTypes.bool,
    })
  ),
  detailed: PropTypes.bool,
  onMarkAsRead: PropTypes.func,
};

const NotificationPanel = ({ isOpen, setIsOpen, closeOtherDropdowns }) => {
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [selectedNotificationInAll, setSelectedNotificationInAll] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  useScrollLock(showPermissionRequest);
  // v1.0.1 ------------------------------------------------------------->

  // <---------------------- v1.0.0
  const authToken = getAuthToken(); // Use validated token getter
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;
  // ---------------------- v1.0.0 >

  // Use shared hook for data + mutations
  const {
    notifications: notificationList = [],
    isLoading: loading,
    markAsRead,
    markAllAsRead,
  } = usePushNotifications(ownerId);
  // ---------------------- v1.0.0 >

  useEffect(() => {
    if (isOpen) {
      setShowAllNotifications(false); // Reset when panel closes

      // Check notification permission when panel opens
      const permissions = AuthCookieManager.checkBrowserPermissions();
      if (!permissions.notifications) {
        setShowPermissionRequest(true);
      }
    }
  }, [isOpen]);

  const handlePermissionGranted = () => {
    setShowPermissionRequest(false);
    // Optionally refresh notifications or show success message
  };
  // ---------------------- v1.0.0 >
  const typeFilteredNotifications = (notificationList || []).filter(
    (notification) => {
      if (!notification) return false;
      if (filterType === "all") return true;
      if (filterType === "unread") return notification.unread;
      if (filterType === "subscription")
        return notification.category === "Subscription";
      if (filterType === "interviews")
        return notification.category === "Interviews";
      if (filterType === "assessments")
        return notification.category === "Assessments";
      if (filterType === "feedback") return notification.category === "Feedback";
      if (filterType === "schedule") return notification.category === "Schedule";
      return notification.category === filterType;
    }
  );

  const filteredNotifications = [...typeFilteredNotifications].sort((a, b) => {
    if (a.unread === b.unread) return 0;
    return a.unread ? -1 : 1;
  });

  const unreadCount = (notificationList || []).filter((n) => n?.unread).length;

  const togglePanel = () => {
    if (!isOpen) {
      closeOtherDropdowns(); // Close other dropdowns when opening
    }
    setIsOpen(); // This will call the toggleNotification function from parent
    // if (isOpen) {
    //   setShowAllNotifications(false); // Reset full view when closing
    // }
  };

  return (
    <div className="relative">
      <button
        onClick={togglePanel}
        className={`relative p-2 ${
          isOpen ? "text-custom-blue" : "text-black"
        } focus:outline-none rounded-lg`}
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
          <div className="absolute top-5 border right-0 w-[500px] bg-white rounded-lg shadow-lg py-2 z-50 -mr-10">
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-gray-200">
              <h3 className="text-base sm:text-lg font-medium text-gray-800">
                Notifications
              </h3>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={togglePanel}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* // <---------------------- v1.0.0 */}

            {showPermissionRequest && (
              <div className="px-3 sm:px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Browser notifications are disabled.
                      <button
                        onClick={() => setShowPermissionRequest(false)}
                        className="ml-1 underline hover:no-underline"
                      >
                        Enable notifications
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            )}
            {/* // ---------------------- v1.0.0 > */}

            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              <>
                <NotificationList
                  notifications={filteredNotifications.slice(0, 3)}
                  onMarkAsRead={markAsRead}
                />
                <div className="px-3 sm:px-4 py-2 border-t border-gray-200">
                  <button
                    className="w-full text-sm text-custom-blue hover:text-custom-blue/80 font-medium rounded-md px-3 py-1.5"
                    onClick={() => {
                      setShowAllNotifications(true);
                      togglePanel();
                    }}
                  >
                    View All Notifications
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* // ---------------------- v1.0.0 > */}

      {/* Permission Request Modal */}
      {showPermissionRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold mb-4">Enable Notifications</h2>
            <p className="text-gray-600 mb-6">
              To receive important updates about interviews, assessments, and
              other activities, please enable browser notifications.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  const granted =
                    await AuthCookieManager.requestNotificationPermission();
                  if (granted) {
                    handlePermissionGranted();
                  }
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowPermissionRequest(false)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Later
              </button>
            </div>
          </div>
          {/* // ---------------------- v1.0.0 > */}
        </div>
      )}
      {/* // ---------------------- v1.0.0 > */}
      {/* Rest of the component remains the same */}
      {showAllNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full mx-28 h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">All Notifications</h2>
              <button
                onClick={() => {
                  setShowAllNotifications(false);
                  setSelectedNotificationInAll(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex h-[calc(90vh-80px)]">
              {/* Notification List - Left Panel */}
              <div className={`${selectedNotificationInAll ? 'w-1/2' : 'w-full'} border-r p-4 overflow-y-auto`}>
                {loading ? (
                  <div className="text-center text-gray-500">
                    Loading notifications...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="text-center text-gray-500">No notifications</div>
                ) : (
                  <div className="space-y-2">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification._id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedNotificationInAll?._id === notification._id
                            ? "bg-custom-blue/20 border-custom-blue"
                            : notification.unread
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => {
                          setSelectedNotificationInAll(notification);
                          if (notification.unread) {
                            markAsRead(notification._id);
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold truncate">{notification.title}</h4>
                            <p className="text-gray-600 text-[14px] line-clamp-2">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDateTime(notification.createdAt)}
                            </p>
                          </div>
                          {notification.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Detail - Right Panel */}
              {selectedNotificationInAll && (
                <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-xl font-semibold mb-4">{selectedNotificationInAll.title}</h3>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Message</p>
                        <p className="text-gray-800 whitespace-pre-wrap">{selectedNotificationInAll.message}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Type</p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                            {selectedNotificationInAll.type || 'General'}
                          </span>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Category</p>
                          <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                            {selectedNotificationInAll.category || 'General'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Date & Time</p>
                        <p className="text-gray-800">{formatDateTime(selectedNotificationInAll.createdAt)}</p>
                      </div>

                      {selectedNotificationInAll.priority && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                            selectedNotificationInAll.priority === 'high'
                              ? 'bg-red-100 text-red-800'
                              : selectedNotificationInAll.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedNotificationInAll.priority}
                          </span>
                        </div>
                      )}

                      {selectedNotificationInAll.data && (
                        <div>
                          <p className="text-sm font-medium text-gray-500 mb-1">Additional Details</p>
                          <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                            <pre className="whitespace-pre-wrap">{JSON.stringify(selectedNotificationInAll.data, null, 2)}</pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notification Details Modal - to be implemented if needed */}
    </div>
  );
};

NotificationPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  closeOtherDropdowns: PropTypes.func,
};

export default NotificationPanel;
