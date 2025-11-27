// hooks/useReportTemplates.js
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { config } from "../config";


const fetchReportTemplates = async () => {
  const { data } = await axios.get(`${config.REACT_APP_API_URL}/analytics/templates`);
  if (!data.success) throw new Error(data.message);
  return data.data;
};

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ["report-templates"],
    queryFn: fetchReportTemplates,
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 10,
  });
};