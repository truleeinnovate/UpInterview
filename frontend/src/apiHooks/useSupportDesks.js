import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { uploadFile } from "../apiHooks/imageApis";
import { usePermissions } from "../Context/PermissionsContext";

// Helper: format backend validation errors { message, errors } into a toast-friendly string
const buildToastFromAxiosError = (err) => {
  const data = err?.response?.data || {};
  const main =
    typeof data?.message === "string" && data.message.trim()
      ? data.message
      : err?.message || "Request failed";

  const errors = data?.errors;
  const details = [];

  if (errors) {
    if (Array.isArray(errors)) {
      for (const e of errors) {
        if (!e) continue;
        if (typeof e === "string") details.push(e);
        else if (typeof e === "object") {
          const path = Array.isArray(e.path)
            ? e.path.join(".")
            : typeof e.path === "string"
            ? e.path
            : undefined;
          if (path && e.message) details.push(`${path}: ${e.message}`);
          else if (e.message) details.push(e.message);
          else {
            for (const [k, v] of Object.entries(e)) {
              if (k === "path" || k === "context") continue;
              if (typeof v === "string") details.push(`${k}: ${v}`);
            }
          }
        }
      }
    } else if (typeof errors === "object") {
      for (const [field, val] of Object.entries(errors)) {
        if (Array.isArray(val))
          details.push(...val.map((m) => `${field}: ${m}`));
        else if (typeof val === "string") details.push(`${field}: ${val}`);
        else if (val && typeof val === "object" && val.message)
          details.push(`${field}: ${val.message}`);
      }
    }
  }

  const lines = details.slice(0, 5).map((m) => `- ${m}`);
  const extra =
    details.length > 5 ? `\n+ ${details.length - 5} more error(s)…` : "";
  return lines.length ? `${main}\n${lines.join("\n")}${extra}` : main;
};

// Always send cookies across domains (needed when FE + BE sit on *.azurewebsites.net)
axios.defaults.withCredentials = true;

export const useSupportTickets = (filters = {}) => {
  const queryClient = useQueryClient();
  const impersonationToken = Cookies.get("impersonationToken");
  const impersonationPayload = impersonationToken
    ? decodeJwt(impersonationToken)
    : null;
  const {
    effectivePermissions,
    superAdminPermissions,
    impersonatedUser_roleName,
    effectivePermissions_RoleName,
  } = usePermissions();
  const userRole = effectivePermissions_RoleName;

  const authToken = Cookies.get("authToken") ?? "";
  const tokenPayload = authToken ? decodeJwt(authToken) : {};

  const userId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;
  const organization = tokenPayload?.organization;

  const {
    data: infiniteData,
    isLoading: isQueryLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["supportTickets", filters, userId, tenantId, organization],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        const params = {
          ...filters,
          userId,
          tenantId,
          organization,
          page: pageParam,
          limit: filters.limit || 20,
        };

        const { data } = await axios.get(
          `${config.REACT_APP_API_URL}/get-tickets`,
          {
            params,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        return data;
      } catch (err) {
        console.error("[useSupportTickets] GET /get-tickets failed:", err);
        throw err;
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      const totalCount = lastPage?.totalCount || 0;
      const loadedSoFar = allPages.reduce(
        (sum, p) => sum + (p?.tickets?.length || 0),
        0,
      );
      if (loadedSoFar < totalCount) {
        return allPages.length; // 0-indexed pages
      }
      return undefined;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Flatten all pages
  const allTickets = infiniteData?.pages?.flatMap((p) => p?.tickets || []) || [];
  const totalCount = infiniteData?.pages?.[0]?.totalCount || 0;

  // Build backward-compatible tickets object
  const tickets = {
    tickets: allTickets,
    totalCount,
  };

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
      // Prepare the payload with tenantId and ownerId
      const payload = {
        ...data,
        tenantId: data.tenantId || tenantId, // Use provided tenantId or fallback to token tenantId
        ownerId: data.ownerId || userId, // Use provided ownerId or fallback to token userId
      };

      const url = editMode
        ? `${config.REACT_APP_API_URL}/update-ticket/${ticketId}`
        : `${config.REACT_APP_API_URL}/create-ticket`;

      const method = editMode ? "patch" : "post";

      const res = await axios[method](url, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const updatedTicketId = res.data.ticket._id;

      if (isAttachmentFileRemoved && !attachmentFile) {
        await uploadFile(null, "attachment", "support", updatedTicketId);
      } else if (attachmentFile instanceof File) {
        await uploadFile(
          attachmentFile,
          "attachment",
          "support",
          updatedTicketId
        );
      }
      return res.data;
    },

    onSuccess: ({ message }) => {
      // toast.success(message || "Ticket submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] });
    },

    onError: (err) => {
      console.error("[useSupportTickets] submitTicket failed:", err);
      const msg = buildToastFromAxiosError(err);
      toast.error(msg, { autoClose: 6000 });
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
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};

// ⭐ NEW: Fetch a single ticket by ID
export const useTicketById = (ticketId) => {
  const authToken = Cookies.get("authToken") ?? "";

  const fetchTicketById = async () => {
    if (!ticketId) return null;

    const { data } = await axios.get(
      `${config.REACT_APP_API_URL}/get-ticket/${ticketId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return data; // backend returns full ticket object
  };

  return useQuery({
    queryKey: ["singleTicket", ticketId],
    queryFn: fetchTicketById,
    enabled: !!ticketId, // Runs only when ID exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};
