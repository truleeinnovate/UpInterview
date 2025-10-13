// src/queries/videoSettings.query.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import{ config } from "../config";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";

const getDefaultSettings = () => ({
  defaultProvider: "zoom",
  credentialType: "platform",
  credentials: {
    googleMeet: {
      clientId: "",
      clientSecret: "",
      refreshToken: "",
      isConfigured: false,
    },
    zoom: {
      apiKey: "",
      apiSecret: "",
      accountId: "",
      isConfigured: false,
    },
    teams: {
      tenantId: "",
      clientId: "",
      clientSecret: "",
      isConfigured: false,
    },
  },
  testConnection: { status: null, message: "" },
});

// 🔹 Internal API call — includes token extraction automatically
const fetchVideoSettings = async () => {


  const tokenPayload = decodeJwt(Cookies.get("authToken"));
  const ownerId = tokenPayload?.userId;
  const tenantId = tokenPayload?.tenantId;

  const response = await axios.get(
    `${config.REACT_APP_API_URL}/video-details/get-settings`,
    { params: { tenantId, ownerId } }
  );

  if (response.data.success && response.data.data) {
    return { data: response.data.data, error: null };
  } else {
    return { data: getDefaultSettings(), error: response.data.message };
  }
};

// 🔹 The TanStack Query Hook
export const useVideoSettingsQuery = () => {
  const token = Cookies.get("authToken");
  const tokenPayload = token ? decodeJwt(token) : null;
  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;
  const isOrganization = tokenPayload?.organization;

  const query = useQuery({
    queryKey: ["video-settings", tenantId, ownerId],
    queryFn: fetchVideoSettings,
    enabled: !!tenantId && !!ownerId,
    staleTime: 1000 * 60 * 5,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Return both query result + token info (if needed by component)
  return {
    ...query,
    tenantId,
    ownerId,
    isOrganization,
  };
};
