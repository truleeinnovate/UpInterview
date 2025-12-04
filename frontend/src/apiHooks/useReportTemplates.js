// hooks/useReportTemplates.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Cookies from "js-cookie";
import { decodeJwt } from "../utils/AuthCookieManager/jwtDecode";
import { config } from "../config";

// Reusable axios instance with auth
const apiClient = axios.create({
  baseURL: config.REACT_APP_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = Cookies.get("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to get userId & tenantId from token
const getAuthPayload = () => {
  const token = Cookies.get("authToken");
  if (!token) return {};
  try {
    return decodeJwt(token);
  } catch {
    return {};
  }
};

// 1. Fetch Report Templates
const fetchReportTemplates = async () => {
  const { data } = await apiClient.get("/analytics/templates");
  if (!data.success) throw new Error(data.message || "Failed to load templates");
  return data.data;
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ["report-templates"],
    queryFn: fetchReportTemplates,
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 10,
  });
};

// 2. Generate Report
const generateReport = async (templateId) => {
  const { data } = await apiClient.get(`/analytics/generate/${templateId}`);
  if (!data.success) throw new Error(data.message || "Failed to generate report");
  return data; // contains: report, columns, data
};

export const useGenerateReport = () => {
  return useMutation({
    mutationFn: generateReport,
  });
};

// 3. Save Filter Preset (Create/Update)
const saveFilterPreset = async ({ templateId, filters, name = "Default View", isDefault = true }) => {
  const { data } = await apiClient.post(`/analytics/presets/filter/${templateId}`, {
    filters,
    name,
    isDefault,
  });
  if (!data.success) throw new Error(data.message || "Failed to save filters");
  return data.preset;
};

export const useSaveFilterPreset = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveFilterPreset,
    onSuccess: () => {
      queryClient.invalidateQueries(["report-presets"]);
    },
  });
};

// 4. Save Column Configuration (Create/Update)
const saveColumnConfig = async ({ templateId, selectedColumns }) => {
  const { data } = await apiClient.post(`/analytics/presets/column/${templateId}`, {
    selectedColumns,
  });
  if (!data.success) throw new Error(data.message || "Failed to save columns");
  return data.config;
};

export const useSaveColumnConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveColumnConfig,
    onSuccess: () => {
      queryClient.invalidateQueries(["report-columns"]);
    },
  });
};

// 5. (Optional) Fetch Saved Presets for a Template
const fetchSavedPresets = async (templateId) => {
  const { data } = await apiClient.get(`/analytics/presets/${templateId}`);
  return data;
};

export const useReportPresets = (templateId) => {
  return useQuery({
    queryKey: ["report-presets", templateId],
    queryFn: () => fetchSavedPresets(templateId),
    enabled: !!templateId,
  });
};
//sharing report apis
// src/apiHooks/useReportTemplates.js
export const useAllReportAccess = () => {
  return useQuery({
    queryKey: ["reportAccessAll"],
    queryFn: async () => {
      const { data } = await apiClient.get("/analytics/reports/access");
      return data.accessMap || {};
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// POST: Share report
export const useShareReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ templateId, roleIds = [], userIds = [] }) => {
      const { data } = await apiClient.post(`/analytics/reports/${templateId}/share`, {
        roleIds,
        userIds,
      });
      return data;
    },
    onSuccess: (data, variables) => {
      const { templateId } = variables;
      queryClient.invalidateQueries({ queryKey: ["reportAccess", templateId] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
};

export const useReportUsage = () => {
  return useQuery({
    queryKey: ['reportUsage'],
    queryFn: async () => {
      const { data } = await apiClient.get('/analytics/reports/usage');
      return data.usage || [];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};