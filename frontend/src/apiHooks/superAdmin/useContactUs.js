import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
// import { config } from "../../config"; // Uncomment when backend is ready
import { usePermissions } from "../../Context/PermissionsContext";
import { notify } from "../../services/toastService";

// Ensure cookies are sent with requests
axios.defaults.withCredentials = true;

// Hook to get all contact us messages (superadmin)
export const useContactUs = () => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.ContactUs?.View !== false;

  const query = useQuery({
    queryKey: ["contactUs"],
    queryFn: async () => {
      // For now, return empty array since we're using dummy data
      // When backend is ready, uncomment the following:
      // const response = await axios.get(
      //   `${config.REACT_APP_API_URL}/contact-us`
      // );
      // return response.data;
      return { contactMessages: [] };
    },
    enabled: isInitialized && hasViewPermission,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    contactMessages: query.data?.contactMessages || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
};

// Hook to get a single contact us message
export const useContactUsById = (id) => {
  const { superAdminPermissions, isInitialized } = usePermissions();
  const hasViewPermission = superAdminPermissions?.ContactUs?.View !== false;

  return useQuery({
    queryKey: ["contactUs", id],
    queryFn: async () => {
      // When backend is ready, uncomment:
      // const response = await axios.get(
      //   `${config.REACT_APP_API_URL}/contact-us/${id}`
      // );
      // return response.data;
      return null;
    },
    enabled: !!id && isInitialized && hasViewPermission,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Hook to update contact us message status
export const useUpdateContactUsStatus = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions } = usePermissions();
  const hasEditPermission = superAdminPermissions?.ContactUs?.Edit === true;

  return useMutation({
    mutationFn: async ({ id, status, notes }) => {
      if (!hasEditPermission) {
        throw new Error("You don't have permission to update contact messages");
      }
      
      // When backend is ready, uncomment:
      // const response = await axios.patch(
      //   `${config.REACT_APP_API_URL}/contact-us/${id}/status`,
      //   { status, notes }
      // );
      // return response.data;
      
      // For now, return mock success
      return { success: true };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contactUs"] });
      queryClient.invalidateQueries({ queryKey: ["contactUs", variables.id] });
      notify.success("Contact message status updated successfully");
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to update status");
    },
  });
};

// Hook to reply to contact us message
export const useReplyContactUs = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions } = usePermissions();
  const hasEditPermission = superAdminPermissions?.ContactUs?.Edit === true;

  return useMutation({
    mutationFn: async ({ id, subject, message, cc, bcc }) => {
      if (!hasEditPermission) {
        throw new Error("You don't have permission to reply to contact messages");
      }
      
      // When backend is ready, uncomment:
      // const response = await axios.post(
      //   `${config.REACT_APP_API_URL}/contact-us/${id}/reply`,
      //   { subject, message, cc, bcc }
      // );
      // return response.data;
      
      // For now, return mock success
      return { success: true };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contactUs"] });
      queryClient.invalidateQueries({ queryKey: ["contactUs", variables.id] });
      notify.success("Reply sent successfully");
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to send reply");
    },
  });
};

// Hook to delete contact us message
export const useDeleteContactUs = () => {
  const queryClient = useQueryClient();
  const { superAdminPermissions } = usePermissions();
  const hasDeletePermission = superAdminPermissions?.ContactUs?.Delete === true;

  return useMutation({
    mutationFn: async (id) => {
      if (!hasDeletePermission) {
        throw new Error("You don't have permission to delete contact messages");
      }
      
      // When backend is ready, uncomment:
      // const response = await axios.delete(
      //   `${config.REACT_APP_API_URL}/contact-us/${id}`
      // );
      // return response.data;
      
      // For now, return mock success
      return { success: true };
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ["contactUs"] });
      notify.success("Contact message deleted successfully");
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to delete message");
    },
  });
};

// Hook to export contact us messages
export const useExportContactUs = () => {
  const { superAdminPermissions } = usePermissions();
  const hasViewPermission = superAdminPermissions?.ContactUs?.View !== false;

  return useMutation({
    mutationFn: async ({ format = "csv", filters = {} }) => {
      if (!hasViewPermission) {
        throw new Error("You don't have permission to export contact messages");
      }
      
      // When backend is ready, uncomment:
      // const response = await axios.post(
      //   `${config.REACT_APP_API_URL}/contact-us/export`,
      //   { format, filters },
      //   {
      //     responseType: 'blob'
      //   }
      // );
      
      // // Create download link
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `contact-us-${Date.now()}.${format}`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      // window.URL.revokeObjectURL(url);
      
      // For now, just notify
      notify.info("Export functionality will be available soon");
      return { success: true };
    },
    onError: (error) => {
      notify.error(error.response?.data?.message || "Failed to export messages");
    },
  });
};
