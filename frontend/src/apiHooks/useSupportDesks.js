// src/apiHooks/useSupportTickets.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { useCustomContext } from "../Context/Contextfetch";
import { uploadFile } from "../apiHooks/imageApis";
import { usePermissions } from "../Context/PermissionsContext";

// Always send cookies across domains (needed when FE + BE sit on *.azurewebsites.net)
axios.defaults.withCredentials = true;

export const useSupportTickets = () => {
  const queryClient = useQueryClient();
  const { userRole } = useCustomContext(); // “SuperAdmin”, “Admin”, “Individual”, …
  const impersonationToken = Cookies.get('impersonationToken');
  const impersonationPayload  = impersonationToken ? decodeJwt(impersonationToken) : null;
  const { effectivePermissions, superAdminPermissions,impersonatedUser_roleName,effectivePermissions_RoleName } = usePermissions();

  /* --------------------------------------------------------------------- */
  /*  Auth token                                                            */
  /* --------------------------------------------------------------------- */
  const authToken = Cookies.get("authToken") ?? "";
  const tokenPayload = authToken ? decodeJwt(authToken) : {};

  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  console.log("impersonatedUser_roleName=====",impersonatedUser_roleName)

  /* --------------------------------------------------------------------- */
  /*  QUERY: fetch tickets                                                  */
  /* --------------------------------------------------------------------- */
  const fetchTickets = async () => {
    try {
      const { data } = await axios.get(
        `${config.REACT_APP_API_URL}/get-tickets`,
        { headers: { Authorization: `Bearer ${authToken}` } } // <------------------
      );

      const all = data?.tickets ?? [];
      console.log("all---",all)
      console.log("userRole---",userRole)
      console.log("impersonatedUser_roleName---",impersonatedUser_roleName)

      if (impersonatedUser_roleName === "Super_Admin" || impersonatedUser_roleName === "Support_Team") return all;
      // if (impersonatedUser_roleName === "Support_Team") {
      //      // console.log("Support_Team: impersonatedUserId", impersonationPayload.impersonatedUserId);
      //       const supportTickets = all.filter((t) => t.assignedToId === impersonationPayload.impersonatedUserId);
      //       //console.log("Support_Team: tickets", supportTickets);
      //       return supportTickets;
      //   }
      if (!userRole) return [];
      if (!organization) {
        if (userRole === "Admin" && userId)
          return all.filter((t) => t.ownerId === userId);
      } else {
        if (userRole === "Admin" && tenantId)
          return all.filter((t) => t.tenantId === tenantId);
      }
      if (userRole === "Individual" && userId)
        return all.filter((t) => t.ownerId === userId);
      

      return [];
    } catch (err) {
      console.error("[useSupportTickets] GET /get-tickets failed:", err);
      throw err; // Let React-Query handle it → isError / error
    }
  };

  const {
    data: tickets = [],
    isLoading: isQueryLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["supportTickets", userRole, tenantId, userId,impersonatedUser_roleName],
    queryFn: fetchTickets,
    enabled: !!userRole, // wait until role is known
    staleTime: 1000 * 60 * 5, // 5 min
    retry: 1,
  });

  /* --------------------------------------------------------------------- */
  /*  MUTATION: create / update ticket                                      */
  /* --------------------------------------------------------------------- */
  const submitTicketMutation = useMutation({
    mutationFn: async ({
      data,
      editMode,
      ticketId,
      attachmentFile,
      isAttachmentFileRemoved,
    }) => {
      const url = editMode
        ? `${config.REACT_APP_API_URL}/update-ticket/${ticketId}`
        : `${config.REACT_APP_API_URL}/create-ticket`;

      const method = editMode ? "patch" : "post";

      const res = await axios[method](url, data, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const updatedTicketId = res.data.ticket._id;
      
      if (isAttachmentFileRemoved && !attachmentFile) {
        await uploadFile(null, "attachment", "support", updatedTicketId);
      } else if (attachmentFile instanceof File) {
        await uploadFile(attachmentFile, "attachment", "support", updatedTicketId);
      }
      return res.data;
    },

    onSuccess: ({ message }) => {
      toast.success(message || "Ticket submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },

    onError: (err) => {
      console.error("[useSupportTickets] submitTicket failed:", err);
      toast.error(
        err?.response?.data?.message ??
          "Something went wrong while submitting the ticket"
      );
    },
  });

  /* --------------------------------------------------------------------- */
  /*  Public API                                                            */
  /* --------------------------------------------------------------------- */
  return {
    tickets,
    isLoading: isQueryLoading || submitTicketMutation.isPending,
    isQueryLoading,
    isMutationLoading: submitTicketMutation.isPending,
    isError,
    error,
    isMutationError: submitTicketMutation.isError,
    mutationError: submitTicketMutation.error,
    submitTicket: submitTicketMutation.mutateAsync,
  };
};
