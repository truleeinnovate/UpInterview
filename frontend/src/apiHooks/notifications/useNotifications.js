// v1.0.0 - Ashok - Converted notifications API to TanStack Query

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../../config";
import { formatDateTime } from "../../utils/dateFormatter";

export const useNotifications = ({ organization, tenantId, ownerId }) => {
  return useQuery({
    queryKey: ["notifications", organization, tenantId, ownerId],
    queryFn: async () => {
      const response = await axios.get(
        `${config.REACT_APP_API_URL}/notifications/all?organizationId=${organization}&tenantId=${tenantId}&ownerId=${ownerId}`
      );

      // Sort by ObjectId (latest first)
      const sortedData = response.data.sort((a, b) =>
        b._id.localeCompare(a._id)
      );

      const categorizedNotifications = {
        email: [],
        whatsapp: [],
      };

      sortedData.forEach((notification) => {
        const processedNotification = {
          id: notification._id,
          _id: notification._id,
          type: notification.notificationType?.toLowerCase() || "unknown",
          subject: notification.title,
          message: notification.body,
          status: notification.status,
          timestamp: formatDateTime(notification.createdAt),
          priority: "medium",
          recipients: notification.toAddress || [],
          cc: notification.cc || [],
          attachments: [],
          object: notification.object || { objectName: "", objectId: "" },
          fromAddress: notification.fromAddress || "",
          toAddress: notification.toAddress || "",
        };

        if (processedNotification.type === "email") {
          categorizedNotifications.email.push(processedNotification);
        } else if (processedNotification.type === "whatsapp") {
          categorizedNotifications.whatsapp.push(processedNotification);
        }
      });

      return categorizedNotifications;
    },
    enabled: !!organization && !!tenantId && !!ownerId,
  });
};
