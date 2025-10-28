// v1.0.0 - Ashok - fixed z-index issue by wrapping the popup in the container div
// v1.0.1 - Ashok - Disabled outer scrollbars of popups for better user experience
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - Fixed "From" and "To" fields showing "Not Provided" when data is available

import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, MessageSquare, ChevronRight, Paperclip } from "lucide-react";
import AllNotificationsModal from "./AllNotificationsModal";
import NotificationDetailsModal from "./NotificationDetailsModal";
import { config } from "../../../../config";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
// v1.0.1 <-------------------------------------------------------------------
import { useScrollLock } from "../../../../apiHooks/scrollHook/useScrollLock";
// v1.0.1 ------------------------------------------------------------------->
import { formatDateTime } from "../../../../utils/dateFormatter";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";
import { useNotifications } from "../../../../apiHooks/notifications/useNotifications";

const NotificationsSection = () => {
  const [activeTab, setActiveTab] = useState("email");
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  // const [notificationsData, setNotificationsData] = useState({
  //   email: [],
  //   whatsapp: [],
  // });

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  // v1.0.1 <------------------------------------------------------------
  useScrollLock(showAllNotifications || selectedNotification);
  // v1.0.1 ------------------------------------------------------------>
  // useEffect(() => {
  //   const fetchNotifications = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${config.REACT_APP_API_URL}/notifications/all?organizationId=${organization}&tenantId=${tenantId}&ownerId=${ownerId}`
  //       );

  //       // Process the flat array into categorized structure
  //       const categorizedNotifications = {
  //         email: [],
  //         whatsapp: [],
  //       };

  //       // Map API response to the expected format for the UI
  //       response.data.forEach((notification) => {
  //         const processedNotification = {
  //           id: notification._id,
  //           _id: notification._id,
  //           type: notification.notificationType.toLowerCase(),
  //           subject: notification.title,
  //           message: notification.body,
  //           status: notification.status,
  //           timestamp: formatDateTime(notification.createdAt),
  //           priority: "medium", // Default priority if not provided
  //           recipients: notification.toAddress || [],
  //           cc: notification.cc || [],
  //           attachments: [],
  //           object: notification.object || { objectName: "", objectId: "" },
  //         };

  //         if (notification.notificationType.toLowerCase() === "email") {
  //           categorizedNotifications.email.push(processedNotification);
  //         } else if (
  //           notification.notificationType.toLowerCase() === "whatsapp"
  //         ) {
  //           categorizedNotifications.whatsapp.push(processedNotification);
  //         }
  //       });

  //       setNotificationsData(categorizedNotifications);
  //       // console.log('Processed notifications:', categorizedNotifications);
  //     } catch (err) {
  //       console.error("Error fetching notifications:", err);
  //     }
  //   };
  //   fetchNotifications();
  // }, [organization, tenantId, ownerId]);

  const { data, isLoading, isError } = useNotifications({
    organization,
    tenantId,
    ownerId,
  });

  if (isLoading) return <div>Loading notifications...</div>;
  if (isError) return <div>Error loading notifications</div>;

  const currentNotifications = data?.[activeTab] || [];

  return (
    <>
      {/* v1.0.2 <---------------------------------------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 backdrop-blur-lg p-4 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h3 className="sm:text-md md:text-md lg:text-xl xl:text-xl 2xl:text-xl font-semibold text-gray-800">
              Notification Center
            </h3>
            <p className="sm:text-xs text-gray-500 text-sm mt-1">
              Manage and track all communication
            </p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <div className="flex items-center space-x-2">
              <button
                title="Mail"
                onClick={() => setActiveTab("email")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === "email"
                    ? "bg-indigo-50 text-custom-blue"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Mail size={20} />
                <span className="sm:hidden inline text-sm">Email</span>
              </button>
              {/* <button
                title="WhatsApp"
                onClick={() => setActiveTab("whatsapp")}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 ${
                  activeTab === "whatsapp"
                    ? "bg-indigo-50 text-custom-blue"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MessageSquare size={20} />
                <span className="sm:hidden inline text-sm">WhatsApp</span>
              </button> */}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {currentNotifications && currentNotifications.length > 0 ? (
            currentNotifications
              .slice(0, 3) // Limit to 3 notifications in the main view
              .map((notification) => (
                <motion.div
                  key={notification._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border border-gray-100 rounded-xl hover:border-indigo-100 hover:bg-indigo-50/5 transition-all duration-300"
                >
                  <div className="flex flex-row items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex sm:flex-col items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {notification.type === "email" ? (
                            <Mail
                              size={16}
                              className="text-custom-blue flex-shrink-0"
                            />
                          ) : (
                            <MessageSquare
                              size={16}
                              className="text-green-600 flex-shrink-0"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-900 line-clamp-1">
                            {notification.type === "email"
                              ? notification.subject
                              : "WhatsApp Message"}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 sm:mt-2">
                          {formatDateTime(notification?.timestamp)}
                        </span>
                      </div>
                      {/* <p
                        className="text-sm text-gray-600 line-clamp-2"
                        dangerouslySetInnerHTML={{
                          __html: notification.message,
                        }}
                      ></p> */}

                      {/* Attachments Preview */}
                      {notification.attachments &&
                        notification.attachments.length > 0 && (
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Paperclip size={14} />
                            <span>
                              {notification.attachments.length} attachment
                              {notification.attachments.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        )}

                      <div className="flex flex-col space-y-1 text-xs text-gray-500">
                        {notification.type === "email" ? (
                          <>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium flex-shrink-0">
                                From:
                              </span>
                              <span className="truncate">
                                {notification?.fromAddress || "Not Provided"}
                              </span>
                            </div>
                            <div className="flex items-start space-x-2">
                              <span className="font-medium flex-shrink-0">
                                To:
                              </span>
                              <span className="truncate">
                                {notification?.toAddress || "Not Provided"}
                              </span>
                            </div>
                            {notification.cc && notification.cc.length > 0 && (
                              <div className="flex items-start space-x-2">
                                <span className="font-medium flex-shrink-0">
                                  CC:
                                </span>
                                <span className="truncate">
                                  {notification.cc.join(", ")}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">To:</span>
                            <span>{notification.recipient}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-medium ${
                          notification.priority === "high"
                            ? "bg-red-100 text-red-600"
                            : "bg-yellow-100 text-yellow-600"
                        }`}
                      >
                        {capitalizeFirstLetter(notification?.priority)}
                        <span className="sm:hidden inline ml-1">Priority</span>
                      </span>
                      <span
                        className={`px-2 py-1 rounded-xl text-xs font-medium ${
                          notification.status === "Success"
                            ? "bg-green-100 text-green-600"
                            : notification.status === "Failed"
                            ? "bg-red-100 text-red-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {capitalizeFirstLetter(notification?.status)}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedNotification(notification)}
                      className="flex items-center border border-gray-200 rounded-lg bg-gray-50 p-2 text-gray-600 hover:text-custom-blue transition-colors duration-300"
                    >
                      <span className="text-sm sm:text-xs font-medium">
                        View Details
                      </span>
                    </button>
                  </div>
                </motion.div>
              ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 flex flex-col items-center justify-center text-center"
            >
              <div className="p-3 bg-gray-100 rounded-full mb-4">
                {activeTab === "email" ? (
                  <Mail size={24} className="text-gray-400" />
                ) : (
                  <MessageSquare size={24} className="text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                No {activeTab === "email" ? "Email" : "WhatsApp"} Notifications
              </h3>
              <p className="text-gray-500 max-w-md">
                {activeTab === "email"
                  ? "You don't have any email notifications at the moment. New email notifications will appear here."
                  : "You don't have any WhatsApp notifications at the moment. New WhatsApp messages will appear here."}
              </p>
            </motion.div>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowAllNotifications(true)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-custom-blue transition-colors duration-300"
          >
            <span>View All Notifications</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </motion.div>
      {/* v1.0.2 ----------------------------------------------------------------------> */}

      <AllNotificationsModal
        isOpen={showAllNotifications}
        onClose={() => setShowAllNotifications(false)}
        notifications={data}
      />

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

export default NotificationsSection;
